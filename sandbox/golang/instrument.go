// instrument.go — source-level instrumentation for Go sandbox jobs.
//
// This mirrors the pragmatic strategy used by the JavaScript sandbox: rather
// than a true debugger-level trace (which the requirement doc flags as
// "meaningfully more complex to sandbox safely" for compiled languages, see
// requirement_doc.md §3.2/§3.8), we inject step-recording calls at compile
// time around comparisons and element assignments involving the detected
// "subject" slice. This is accurate for idiomatic, comparison/swap-style
// sorting and searching code — the catalog's canonical style — but is not a
// full symbolic trace of arbitrary Go programs.
package main

import (
	"fmt"
	"regexp"
	"strings"
)

var (
	sliceDeclRe = regexp.MustCompile(`(?:var\s+)?(\w+)\s*(?::=|=)\s*\[\]int\{`)
	paramRe     = regexp.MustCompile(`func\s+\w+\(\s*(\w+)\s+\[\]int`)
	compareOpRe = regexp.MustCompile(`[<>]=?|==`)
	mainFuncRe  = regexp.MustCompile(`func\s+main\s*\(\s*\)\s*\{`)
)

// findSubjectName looks for the first []int parameter or local slice literal.
func findSubjectName(code string) string {
	if m := paramRe.FindStringSubmatch(code); m != nil {
		return m[1]
	}
	if m := sliceDeclRe.FindStringSubmatch(code); m != nil {
		return m[1]
	}
	return ""
}

// runtimePrelude returns the Go source injected into the user's file to
// support step recording. It must be valid alongside `package main`.
const runtimePrelude = `
type __step__ struct {
	Type    string   ` + "`json:\"type\"`" + `
	Indices []int    ` + "`json:\"indices,omitempty\"`" + `
	Array   []int    ` + "`json:\"array,omitempty\"`" + `
	Info    string   ` + "`json:\"info,omitempty\"`" + `
}

var __steps__ []__step__
var __prev__ []int

func __record_compare__(i, j int, arr []int) {
	if len(__steps__) >= 2000 {
		return
	}
	cp := make([]int, len(arr))
	copy(cp, arr)
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
	if len(__steps__) == 0 {
		__steps__ = append(__steps__, __step__{Type: "done", Info: "execution completed — no array-based state changes detected"})
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

// instrument injects record calls and required imports/prelude into the
// user's source code.
func instrument(code string) (string, string) {
	subject := findSubjectName(code)
	if subject == "" {
		return code, ""
	}

	lines := strings.Split(code, "\n")
	out := make([]string, 0, len(lines)*2)

	for _, line := range lines {
		out = append(out, line)

		if compareOpRe.MatchString(line) {
			idxRe := regexp.MustCompile(regexp.QuoteMeta(subject) + `\[([^\]]+)\]`)
			matches := idxRe.FindAllStringSubmatch(line, -1)
			if len(matches) >= 2 {
				out = append(out, fmt.Sprintf("__record_compare__((%s), (%s), %s)", matches[0][1], matches[1][1], subject))
			}
		}

		assignRe := regexp.MustCompile(regexp.QuoteMeta(subject) + `\[[^\]]+\]\s*=[^=]`)
		if assignRe.MatchString(line) {
			out = append(out, fmt.Sprintf("__record_mutation__(%s)", subject))
		}
	}

	joined := strings.Join(out, "\n")
	// Inject defer __finalize__() as the first statement in main().
	joined = mainFuncRe.ReplaceAllString(joined, "func main() {\n\tdefer __finalize__()")

	return joined, subject
}
