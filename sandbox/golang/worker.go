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
	Hash     string `json:"hash"`
}

type Result struct {
	JobID      string  `json:"job_id"`
	Hash       string  `json:"hash,omitempty"`
	Steps      []Step  `json:"steps"`
	Error      string  `json:"error,omitempty"`
	Language   string  `json:"language"`
	DurationMS float64 `json:"duration_ms"`
}

type Step struct {
	Type    string `json:"type"`
	Indices []int  `json:"indices,omitempty"`
	Array   []int  `json:"array,omitempty"`
	Line    int    `json:"line,omitempty"`
	Info    string `json:"info,omitempty"`
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
	instrumented, _ := instrument(userCode)
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
			imports := []string{"\"" + pkg + "\""}
			if pkg != "encoding/json" {
				imports = append(imports, "\"encoding/json\"")
			}
			if pkg != "fmt" {
				imports = append(imports, "\"fmt\"")
			}
			return "import (\n\t" + strings.Join(imports, "\n\t") + "\n)"
		})
	} else {
		code = packageLineRe.ReplaceAllString(code, "package main\n\nimport (\n\t"+requiredImports+"\n)")
	}

	// Append the runtime prelude at the end (valid anywhere at top level in Go).
	return code + "\n" + runtimePrelude
}

func errorResult(message string, durationMS float64) Result {
	return Result{Steps: []Step{}, Error: message, DurationMS: durationMS}
}

func verifyExecutableWorkspace() error {
	probePath := "/go-exec/.exec-probe"
	defer os.Remove(probePath)

	if err := os.WriteFile(probePath, []byte("#!/bin/sh\nexit 0\n"), 0o500); err != nil {
		return fmt.Errorf("write executable workspace probe: %w", err)
	}
	if err := exec.Command(probePath).Run(); err != nil {
		return fmt.Errorf("execute workspace probe: %w", err)
	}
	return nil
}

func executeCode(code string, maxSeconds float64) (Result, error) {
	start := time.Now()
	source := assembleSource(code)

	// Source, Go caches and compiler scratch files stay on /tmp, which is
	// intentionally mounted noexec. The final student binary is written to the
	// dedicated /go-exec tmpfs, the only writable executable mount in the worker.
	sourceDir, err := os.MkdirTemp("/tmp", "algoweave-go-src-*")
	if err != nil {
		return Result{}, err
	}
	defer os.RemoveAll(sourceDir)

	execDir, err := os.MkdirTemp("/go-exec", "algoweave-go-bin-*")
	if err != nil {
		return errorResult("Failed to prepare Go executable workspace: "+err.Error(), time.Since(start).Seconds()*1000), nil
	}
	defer os.RemoveAll(execDir)

	mainPath := filepath.Join(sourceDir, "main.go")
	binaryPath := filepath.Join(execDir, "program")
	if err := os.WriteFile(mainPath, []byte(source), 0o600); err != nil {
		return Result{}, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(maxSeconds*float64(time.Second)))
	defer cancel()

	for _, dir := range []string{"/tmp/gocache", "/tmp/gopath", "/tmp/gomodcache", "/tmp/gotmp", "/tmp/home", "/go-exec"} {
		if err := os.MkdirAll(dir, 0o700); err != nil {
			return errorResult("Failed to prepare Go sandbox workspace: "+err.Error(), time.Since(start).Seconds()*1000), nil
		}
	}

	env := append(os.Environ(),
		"HOME=/tmp/home",
		"GOCACHE=/tmp/gocache",
		"GOPATH=/tmp/gopath",
		"GOMODCACHE=/tmp/gomodcache",
		"GOTMPDIR=/tmp/gotmp",
		"GOTELEMETRY=off",
		"GOMAXPROCS=1",
		"CGO_ENABLED=0",
	)

	// Do not use `go run`: it places the generated executable inside GOTMPDIR.
	// GOTMPDIR deliberately lives on the noexec /tmp mount. Build explicitly to
	// /go-exec, then execute only that final binary.
	buildCmd := exec.CommandContext(ctx, "go", "build", "-trimpath", "-o", binaryPath, mainPath)
	buildCmd.Dir = sourceDir
	buildCmd.Env = env
	var buildStdout, buildStderr bytes.Buffer
	buildCmd.Stdout = &buildStdout
	buildCmd.Stderr = &buildStderr

	if buildErr := buildCmd.Run(); buildErr != nil {
		duration := time.Since(start).Seconds() * 1000
		if ctx.Err() == context.DeadlineExceeded {
			return errorResult(fmt.Sprintf("Execution timed out after %.0fs", maxSeconds), duration), nil
		}
		tail := lastLine(buildStderr.String())
		if tail == "" {
			tail = buildErr.Error()
		}
		return errorResult("Compile error: "+tail, duration), nil
	}

	if err := os.Chmod(binaryPath, 0o500); err != nil {
		return errorResult("Failed to secure Go executable: "+err.Error(), time.Since(start).Seconds()*1000), nil
	}

	runCmd := exec.CommandContext(ctx, binaryPath)
	runCmd.Dir = sourceDir
	runCmd.Env = env
	var stdout, stderr bytes.Buffer
	runCmd.Stdout = &stdout
	runCmd.Stderr = &stderr

	runErr := runCmd.Run()
	duration := time.Since(start).Seconds() * 1000

	if ctx.Err() == context.DeadlineExceeded {
		return errorResult(fmt.Sprintf("Execution timed out after %.0fs", maxSeconds), duration), nil
	}

	if runErr != nil {
		tail := lastLine(stderr.String())
		if tail == "" {
			tail = runErr.Error()
		}
		return errorResult("Sandbox error: "+tail, duration), nil
	}

	steps, err := parseSteps(stdout.String())
	if err != nil {
		return errorResult("Failed to parse tracer output: "+err.Error(), duration), nil
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
	if err := verifyExecutableWorkspace(); err != nil {
		log.Fatalf("[sandbox-go] executable workspace is not usable: %v", err)
	}
	log.Println("[sandbox-go] executable workspace check passed")

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
			result = errorResult(fmt.Sprintf("internal sandbox error: %v", err), 0)
		}
		result.JobID = job.ID
		result.Hash = job.Hash
		result.Language = languageFilter
		if result.Error != "" {
			log.Printf("[sandbox-go] job %s failed: %s", job.ID, result.Error)
		}

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
