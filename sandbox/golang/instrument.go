// instrument.go — source-level instrumentation for Go sandbox jobs.
//
// The worker keeps rich array compare/swap traces when it can detect them.
// For algorithms whose important state is not a []int slice, it also records
// lightweight source-line progress so the frontend always has a usable trace.
package main

import (
	"fmt"
	"regexp"
	"strings"
)

var (
	sliceDeclRe   = regexp.MustCompile(`(?:var\s+)?(\w+)\s*(?::=|=)\s*\[\]int\{`)
	paramRe       = regexp.MustCompile(`func\s+\w+\(\s*(\w+)\s+\[\]int`)
	compareOpRe   = regexp.MustCompile(`[<>]=?|==`)
	mainFuncRe    = regexp.MustCompile(`func\s+main\s*\(\s*\)\s*\{`)
	plainAssignRe = regexp.MustCompile(`(^|[^=!<>])=([^=]|$)`)
)

func findSubjectName(code string) string {
	if m := paramRe.FindStringSubmatch(code); m != nil {
		return m[1]
	}
	if m := sliceDeclRe.FindStringSubmatch(code); m != nil {
		return m[1]
	}
	return ""
}

const runtimePrelude = `
type __step__ struct {
	Type    string   ` + "`json:\"type\"`" + `
	Indices []int    ` + "`json:\"indices,omitempty\"`" + `
	Array   []int    ` + "`json:\"array,omitempty\"`" + `
	Line    int      ` + "`json:\"line,omitempty\"`" + `
	Info    string   ` + "`json:\"info,omitempty\"`" + `
}

var __steps__ []__step__
var __line_steps__ []__step__
var __prev__ []int

func __record_line__(line int) {
	if len(__line_steps__) >= 1200 {
		return
	}
	__line_steps__ = append(__line_steps__, __step__{
		Type: "highlight",
		Line: line,
		Info: fmt.Sprintf("executing Go source line %d", line),
	})
}

func __record_compare__(i, j int, arr []int) {
	if len(__steps__) >= 2000 {
		return
	}
	cp := make([]int, len(arr))
	copy(cp, arr)
	if __prev__ == nil {
		__prev__ = append([]int(nil), cp...)
	}
	__steps__ = append(__steps__, __step__{
		Type:    "compare",
		Indices: []int{i, j},
		Array:   cp,
		Info:    fmt.Sprintf("comparing arr[%d] and arr[%d]", i, j),
	})
}

func __record_mutation__(arr []int) {
	if len(__steps__) >= 2000 {
		return
	}
	cp := make([]int, len(arr))
	copy(cp, arr)
	if __prev__ != nil && len(__prev__) == len(cp) {
		changed := []int{}
		for k := range cp {
			if cp[k] != __prev__[k] {
				changed = append(changed, k)
			}
		}
		if len(changed) == 2 {
			__steps__ = append(__steps__, __step__{
				Type:    "swap",
				Indices: changed,
				Array:   cp,
				Info:    fmt.Sprintf("swapping arr[%d] and arr[%d]", changed[0], changed[1]),
			})
		} else if len(changed) == 1 {
			__steps__ = append(__steps__, __step__{
				Type:    "set",
				Indices: changed,
				Array:   cp,
				Info:    fmt.Sprintf("setting arr[%d] = %d", changed[0], cp[changed[0]]),
			})
		}
	}
	__prev__ = cp
}

func __finalize__() {
	if len(__steps__) == 0 && len(__line_steps__) > 0 {
		__steps__ = append(__steps__, __line_steps__...)
	}
	if len(__steps__) == 0 {
		__steps__ = append(__steps__, __step__{Type: "done", Info: "execution completed"})
	} else {
		last := __steps__[len(__steps__)-1]
		__steps__ = append(__steps__, __step__{Type: "done", Array: last.Array, Info: "done"})
	}
	__emit_steps__()
}

func __emit_steps__() {
	b, _ := json.Marshal(__steps__)
	fmt.Println("__STEPS_JSON__" + string(b))
}
`

func shouldTraceLine(trimmed string) bool {
	if trimmed == "" || strings.HasPrefix(trimmed, "//") {
		return false
	}
	if strings.HasPrefix(trimmed, "package ") || strings.HasPrefix(trimmed, "import ") ||
		strings.HasPrefix(trimmed, "func ") || strings.HasPrefix(trimmed, "type ") ||
		strings.HasPrefix(trimmed, "const ") || strings.HasPrefix(trimmed, "var ") {
		return false
	}
	if trimmed == "{" || trimmed == "}" || trimmed == ")" ||
		strings.HasPrefix(trimmed, "} else") || strings.HasPrefix(trimmed, "else ") ||
		strings.HasPrefix(trimmed, "case ") || strings.HasPrefix(trimmed, "default:") {
		return false
	}
	return strings.HasPrefix(trimmed, "if ") || strings.HasPrefix(trimmed, "for ") ||
		strings.HasPrefix(trimmed, "switch ") || strings.HasPrefix(trimmed, "return") ||
		strings.HasPrefix(trimmed, "break") || strings.HasPrefix(trimmed, "continue") ||
		strings.Contains(trimmed, ":=") || plainAssignRe.MatchString(trimmed) ||
		strings.HasSuffix(trimmed, "++") || strings.HasSuffix(trimmed, "--") ||
		strings.Contains(trimmed, "(")
}

func injectLineTracing(code string) string {
	lines := strings.Split(code, "\n")
	out := make([]string, 0, len(lines)*2)
	inImportBlock := false
	for index, line := range lines {
		trimmed := strings.TrimSpace(line)
		if strings.HasPrefix(trimmed, "import (") {
			inImportBlock = true
			out = append(out, line)
			continue
		}
		if inImportBlock {
			out = append(out, line)
			if trimmed == ")" {
				inImportBlock = false
			}
			continue
		}
		if shouldTraceLine(trimmed) {
			indent := line[:len(line)-len(strings.TrimLeft(line, " \t"))]
			out = append(out, fmt.Sprintf("%s__record_line__(%d)", indent, index+1))
		}
		out = append(out, line)
	}
	return strings.Join(out, "\n")
}

func instrument(code string) (string, string) {
	subject := findSubjectName(code)
	code = injectLineTracing(code)
	lines := strings.Split(code, "\n")
	out := make([]string, 0, len(lines)*2)

	var idxRe *regexp.Regexp
	if subject != "" {
		idxRe = regexp.MustCompile(regexp.QuoteMeta(subject) + `\[([^\]]+)\]`)
	}

	for _, line := range lines {
		if subject != "" && compareOpRe.MatchString(line) {
			matches := idxRe.FindAllStringSubmatch(line, -1)
			if len(matches) >= 2 {
				indent := line[:len(line)-len(strings.TrimLeft(line, " \t"))]
				out = append(out, fmt.Sprintf("%s__record_compare__((%s), (%s), %s)", indent, matches[0][1], matches[1][1], subject))
			}
		}

		out = append(out, line)
		if subject != "" && idxRe.MatchString(line) && plainAssignRe.MatchString(line) {
			indent := line[:len(line)-len(strings.TrimLeft(line, " \t"))]
			out = append(out, fmt.Sprintf("%s__record_mutation__(%s)", indent, subject))
		}
	}

	joined := strings.Join(out, "\n")
	joined = mainFuncRe.ReplaceAllString(joined, "func main() {\n\tdefer __finalize__()\n")
	return joined, subject
}
