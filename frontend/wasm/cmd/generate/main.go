package main

import (
	"bufio"
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"engineering-lens/systemdesign/internal/engine"
)

type source struct {
	Domain, Label, File string
}

type heading struct {
	Level int
	Title string
	Line  int
}

var (
	headingRE = regexp.MustCompile(`^(#{1,4})\s+(.+?)\s*$`)
	bulletRE  = regexp.MustCompile(`^(?:[-*+]\s+|\d+\.\s+)(.+)$`)
	linkRE    = regexp.MustCompile(`\[([^\]]+)\]\([^\)]+\)`)
	nonSlugRE = regexp.MustCompile(`[^a-z0-9]+`)
)

var sources = []source{
	{"backend", "Backend Systems", "backend-systems.md"},
	{"database", "Database Systems", "database-system-design.md"},
	{"cloud", "Cloud Architecture", "cloud-architecture.md"},
	{"genai", "GenAI Systems", "genai-system-design.md"},
}

var domainKeywords = map[string][]string{
	"backend":  {"api", "http", "grpc", "cache", "kafka", "queue", "retry", "microservice", "distributed", "observability", "security", "deployment"},
	"database": {"sql", "index", "transaction", "mvcc", "replication", "shard", "partition", "consistency", "backup", "query", "schema", "storage"},
	"cloud":    {"iam", "vpc", "network", "region", "availability", "kubernetes", "serverless", "storage", "security", "reliability", "finops", "terraform"},
	"genai":    {"llm", "rag", "embedding", "vector", "agent", "prompt", "model", "evaluation", "inference", "gpu", "guardrail", "token"},
}

func main() {
	root := flag.String("root", filepath.Clean(filepath.Join("..", "..")), "Engineering Lens repository root")
	flag.Parse()
	payload, err := generate(*root)
	if err != nil {
		fmt.Fprintln(os.Stderr, "generate system design topics:", err)
		os.Exit(1)
	}
	out := filepath.Join(*root, "frontend", "public", "system-design-topics.json")
	if err := os.MkdirAll(filepath.Dir(out), 0o755); err != nil {
		panic(err)
	}
	data, err := json.Marshal(payload)
	if err != nil {
		panic(err)
	}
	if err := os.WriteFile(out, data, 0o644); err != nil {
		panic(err)
	}
	fmt.Printf("Generated %d technical System Design topics -> %s\n", payload.Totals["topics"], out)
	fmt.Printf("Excluded %d reference-only handbook sections from visualization\n", payload.Totals["referenceOnly"])
	fmt.Println("Domain counts:", payload.Domains)
}

func generate(root string) (engine.TopicPayload, error) {
	refs := filepath.Join(root, "docs", "system-design-references")
	payload := engine.TopicPayload{SchemaVersion: 2, Source: "Bundled user-provided System Design handbooks", Totals: map[string]int{}, Domains: map[string]int{}}
	referenceOnly := 0

	for _, src := range sources {
		lines, err := readLines(filepath.Join(refs, src.File))
		if err != nil {
			return payload, err
		}
		headings := headingsOutsideCode(lines)
		h1s := make([]heading, 0)
		for _, h := range headings {
			if h.Level == 1 {
				h1s = append(h1s, h)
			}
		}
		seen := map[string]int{}
		order := 0
		for pos, h := range h1s {
			if pos == 0 && (strings.Contains(h.Title, "Zero to Senior/Staff") || strings.HasPrefix(h.Title, "Database System Design:")) {
				continue
			}
			if engine.ReferenceOnlyTitle(h.Title) {
				referenceOnly++
				continue
			}
			next := len(lines)
			if pos+1 < len(h1s) {
				next = h1s[pos+1].Line
			}
			section := lines[h.Line+1 : next]
			body := strings.TrimSpace(strings.Join(section, "\n"))
			if body == "" {
				continue
			}
			order++
			base := src.Domain + "-" + slugify(h.Title)
			id := base
			seen[base]++
			if seen[base] > 1 {
				id = fmt.Sprintf("%s-%d", base, seen[base])
			}
			subtopics := make([]string, 0, 14)
			for _, child := range headings {
				if (child.Level == 2 || child.Level == 3) && child.Line > h.Line && child.Line < next {
					subtopics = append(subtopics, child.Title)
					if len(subtopics) == 14 {
						break
					}
				}
			}
			topic := engine.Topic{
				ID: id, Domain: src.Domain, DomainLabel: src.Label, Order: order,
				Kind: topicKind(h.Title), Level: inferLevel(h.Title, body), Title: h.Title,
				Summary: firstParagraph(section), Subtopics: subtopics, KeyPoints: extractBullets(section, 12),
				CodeBlocks: extractCodeBlocks(section, 3), Tags: keywordTags(src.Domain, h.Title, body),
				Markdown: body, SourceFile: src.File, SourceLine: h.Line + 1,
			}
			payload.Topics = append(payload.Topics, topic)
		}
		payload.Domains[src.Domain] = order
	}
	payload.Totals["topics"] = len(payload.Topics)
	payload.Totals["referenceOnly"] = referenceOnly
	payload.Totals["sourceSections"] = len(payload.Topics) + referenceOnly
	for _, topic := range payload.Topics {
		payload.Totals[topic.Kind]++
	}
	return payload, nil
}

func readLines(path string) ([]string, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	var lines []string
	s := bufio.NewScanner(f)
	buf := make([]byte, 64*1024)
	s.Buffer(buf, 2*1024*1024)
	for s.Scan() {
		lines = append(lines, s.Text())
	}
	return lines, s.Err()
}

func headingsOutsideCode(lines []string) []heading {
	out := []heading{}
	inFence := false
	fence := ""
	for i, line := range lines {
		trim := strings.TrimLeft(line, " \t")
		if strings.HasPrefix(trim, "```") || strings.HasPrefix(trim, "~~~") {
			marker := trim[:3]
			if !inFence {
				inFence, fence = true, marker
			} else if marker == fence {
				inFence, fence = false, ""
			}
			continue
		}
		if inFence {
			continue
		}
		m := headingRE.FindStringSubmatch(line)
		if len(m) == 3 {
			out = append(out, heading{Level: len(m[1]), Title: strings.TrimSpace(m[2]), Line: i})
		}
	}
	return out
}

func firstParagraph(lines []string) string {
	inFence := false
	parts := []string{}
	for _, raw := range lines {
		line := strings.TrimSpace(raw)
		if strings.HasPrefix(line, "```") || strings.HasPrefix(line, "~~~") {
			inFence = !inFence
			continue
		}
		if inFence || line == "" || line == "---" {
			if len(parts) > 0 {
				break
			}
			continue
		}
		if strings.HasPrefix(line, "#") || bulletRE.MatchString(line) {
			if len(parts) > 0 {
				break
			}
			continue
		}
		line = strings.TrimSpace(strings.TrimPrefix(line, ">"))
		line = cleanInline(line)
		parts = append(parts, line)
		if len(strings.Join(parts, " ")) >= 280 {
			break
		}
	}
	return truncate(strings.Join(parts, " "), 420)
}

func extractBullets(lines []string, limit int) []string {
	seen := map[string]bool{}
	out := []string{}
	inFence := false
	for _, raw := range lines {
		line := strings.TrimSpace(raw)
		if strings.HasPrefix(line, "```") || strings.HasPrefix(line, "~~~") {
			inFence = !inFence
			continue
		}
		if inFence {
			continue
		}
		m := bulletRE.FindStringSubmatch(line)
		if len(m) == 2 {
			text := truncate(cleanInline(strings.TrimSpace(m[1])), 220)
			if text != "" && !seen[text] {
				out = append(out, text)
				seen[text] = true
			}
		}
		if len(out) >= limit {
			break
		}
	}
	return out
}

func extractCodeBlocks(lines []string, limit int) []string {
	out := []string{}
	inFence := false
	current := []string{}
	for _, raw := range lines {
		line := strings.TrimSpace(raw)
		if strings.HasPrefix(line, "```") || strings.HasPrefix(line, "~~~") {
			if !inFence {
				inFence = true
				current = nil
			} else {
				inFence = false
				block := strings.TrimSpace(strings.Join(current, "\n"))
				if block != "" {
					out = append(out, truncate(block, 1800))
					if len(out) >= limit {
						break
					}
				}
			}
			continue
		}
		if inFence {
			current = append(current, strings.TrimRight(raw, "\r\n"))
		}
	}
	return out
}

func topicKind(title string) string {
	if strings.HasPrefix(title, "Appendix ") {
		return "appendix"
	}
	if strings.Contains(title, "Mastery Challenge") {
		return "challenge"
	}
	return "core"
}

func inferLevel(title, body string) string {
	s := strings.ToLower(title + " " + truncate(body, 1600))
	lt := strings.ToLower(title)
	if strings.Contains(s, "staff-level") || (strings.HasPrefix(lt, "appendix") && strings.Contains(lt, "staff")) {
		return "Staff"
	}
	if strings.Contains(s, "senior-level") || (strings.HasPrefix(lt, "appendix") && strings.Contains(lt, "senior")) {
		return "Senior"
	}
	for _, term := range []string{"distributed", "multi-region", "sharding", "consensus", "governance", "platform engineering", "agentic", "model serving"} {
		if strings.Contains(s, term) {
			return "Advanced"
		}
	}
	return "Foundation"
}

func keywordTags(domain, title, body string) []string {
	s := strings.ToLower(title + " " + truncate(body, 2400))
	out := []string{}
	for _, word := range domainKeywords[domain] {
		if strings.Contains(s, word) {
			out = append(out, word)
		}
		if len(out) == 6 {
			break
		}
	}
	return out
}

func slugify(v string) string {
	v = strings.ToLower(strings.ReplaceAll(v, "&", " and "))
	v = strings.Trim(nonSlugRE.ReplaceAllString(v, "-"), "-")
	if len(v) > 96 {
		v = v[:96]
	}
	if v == "" {
		return "topic"
	}
	return v
}

func cleanInline(v string) string {
	v = linkRE.ReplaceAllString(v, "$1")
	v = strings.ReplaceAll(v, "**", "")
	v = strings.ReplaceAll(v, "`", "")
	return v
}

func truncate(v string, n int) string {
	r := []rune(v)
	if len(r) <= n {
		return v
	}
	return string(r[:n])
}
