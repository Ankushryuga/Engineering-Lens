package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"

	kafka "github.com/segmentio/kafka-go"
)

type Job struct {
	ID       string `json:"id"`
	Code     string `json:"code"`
	Language string `json:"language"`
}

type Result struct {
	JobID      string  `json:"job_id"`
	Steps      []Step  `json:"steps"`
	Error      string  `json:"error,omitempty"`
	Language   string  `json:"language"`
	DurationMS float64 `json:"duration_ms"`
}

type Step struct {
	Type    string   `json:"type"`
	Indices []int    `json:"indices,omitempty"`
	Array   []int    `json:"array,omitempty"`
	Info    string   `json:"info,omitempty"`
}

var (
	importBlockRe  = regexp.MustCompile(`(?s)import\s*\(([^)]*)\)`)
	singleImportRe = regexp.MustCompile(`import\s+"([^"]+)"`)
	packageLineRe  = regexp.MustCompile(`(?m)^package\s+main\s*$`)
)

const requiredImports = `"encoding/json"
	"fmt"`

// assembleSource merges the required imports and injects the runtime
// prelude + instrumented body into a single compilable Go file.
func assembleSource(userCode string) string {
	instrumented, subject := instrument(userCode)
	if subject == "" {
		// No subject slice found — still wrap so it compiles & runs, but no steps.
		instrumented = mainFuncRe.ReplaceAllString(userCode, "func main() {\n\tdefer __finalize__()")
	}

	code := instrumented

	if importBlockRe.MatchString(code) {
		code = importBlockRe.ReplaceAllStringFunc(code, func(block string) string {
			inner := importBlockRe.FindStringSubmatch(block)[1]
			if !strings.Contains(inner, `"encoding/json"`) {
				inner = `"encoding/json"` + "\n" + inner
			}
			if !strings.Contains(inner, `"fmt"`) {
				inner = `"fmt"` + "\n" + inner
			}
			return "import (" + inner + ")"
		})
	} else if singleImportRe.MatchString(code) {
		code = singleImportRe.ReplaceAllStringFunc(code, func(stmt string) string {
			pkg := singleImportRe.FindStringSubmatch(stmt)[1]
			return "import (\n\t\"" + pkg + "\"\n\t" + requiredImports + "\n)"
		})
	} else {
		code = packageLineRe.ReplaceAllString(code, "package main\n\nimport (\n\t"+requiredImports+"\n)")
	}

	// Append the runtime prelude at the end (valid anywhere at top level in Go).
	return code + "\n" + runtimePrelude
}

func executeCode(code string, maxSeconds float64) (Result, error) {
	start := time.Now()
	source := assembleSource(code)

	tmpDir, err := os.MkdirTemp("", "algo-go-job-*")
	if err != nil {
		return Result{}, err
	}
	defer os.RemoveAll(tmpDir)

	mainPath := filepath.Join(tmpDir, "main.go")
	if err := os.WriteFile(mainPath, []byte(source), 0o600); err != nil {
		return Result{}, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(maxSeconds*float64(time.Second)))
	defer cancel()

	cmd := exec.CommandContext(ctx, "go", "run", mainPath)
	cmd.Dir = tmpDir
	cmd.Env = append(os.Environ(), "GOCACHE=/tmp/gocache", "CGO_ENABLED=0")

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	runErr := cmd.Run()
	duration := time.Since(start).Seconds() * 1000

	if ctx.Err() == context.DeadlineExceeded {
		return Result{Error: fmt.Sprintf("Execution timed out after %.0fs", maxSeconds), DurationMS: duration}, nil
	}

	if runErr != nil {
		tail := lastLine(stderr.String())
		if tail == "" {
			tail = runErr.Error()
		}
		return Result{Error: "Sandbox error: " + tail, DurationMS: duration}, nil
	}

	steps, err := parseSteps(stdout.String())
	if err != nil {
		return Result{Error: "Failed to parse tracer output: " + err.Error(), DurationMS: duration}, nil
	}

	return Result{Steps: steps, DurationMS: duration}, nil
}

func lastLine(s string) string {
	lines := strings.Split(strings.TrimSpace(s), "\n")
	if len(lines) == 0 {
		return ""
	}
	return lines[len(lines)-1]
}

func parseSteps(stdout string) ([]Step, error) {
	const marker = "__STEPS_JSON__"
	idx := strings.LastIndex(stdout, marker)
	if idx == -1 {
		return []Step{{Type: "done", Info: "execution completed — no array-based state changes detected"}}, nil
	}
	jsonPart := stdout[idx+len(marker):]
	jsonPart = strings.TrimSpace(strings.Split(jsonPart, "\n")[0])

	var steps []Step
	if err := json.Unmarshal([]byte(jsonPart), &steps); err != nil {
		return nil, err
	}
	return steps, nil
}

func main() {
	brokers := strings.Split(getEnv("KAFKA_BROKERS", "localhost:9092"), ",")
	jobsTopic := getEnv("KAFKA_JOBS_TOPIC", "visualize-jobs")
	resultsTopic := getEnv("KAFKA_RESULTS_TOPIC", "visualize-results")
	groupID := getEnv("KAFKA_GROUP_ID", "sandbox-go")
	languageFilter := getEnv("LANGUAGE_FILTER", "go")
	maxSeconds, _ := strconv.ParseFloat(getEnv("MAX_EXEC_SECONDS", "20"), 64)

	log.Printf("[sandbox-go] starting worker, group=%s, filter=%s", groupID, languageFilter)

	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers: brokers,
		Topic:   jobsTopic,
		GroupID: groupID,
	})
	defer reader.Close()

	writer := &kafka.Writer{
		Addr:     kafka.TCP(brokers...),
		Topic:    resultsTopic,
		Balancer: &kafka.LeastBytes{},
	}
	defer writer.Close()

	log.Println("[sandbox-go] ready, consuming jobs...")

	for {
		msg, err := reader.FetchMessage(context.Background())
		if err != nil {
			log.Printf("[sandbox-go] fetch error: %v", err)
			time.Sleep(time.Second)
			continue
		}

		var job Job
		if err := json.Unmarshal(msg.Value, &job); err != nil {
			_ = reader.CommitMessages(context.Background(), msg)
			continue
		}

		if job.Language != languageFilter {
			_ = reader.CommitMessages(context.Background(), msg)
			continue
		}

		log.Printf("[sandbox-go] processing job %s", job.ID)
		result, err := executeCode(job.Code, maxSeconds)
		if err != nil {
			result = Result{Error: fmt.Sprintf("internal sandbox error: %v", err)}
		}
		result.JobID = job.ID
		result.Language = languageFilter

		data, _ := json.Marshal(result)
		if err := writer.WriteMessages(context.Background(), kafka.Message{Key: []byte(job.ID), Value: data}); err != nil {
			log.Printf("[sandbox-go] publish error: %v", err)
		} else {
			log.Printf("[sandbox-go] published result for %s (%d steps)", job.ID, len(result.Steps))
		}

		_ = reader.CommitMessages(context.Background(), msg)
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
