package engine

import (
	"regexp"
	"strings"
)

var (
	sectionNumberRE = regexp.MustCompile(`^\d+\.\s*`)
	appendixTitleRE = regexp.MustCompile(`(?i)^appendix\s+[a-z]+\s+[—-]\s*`)
)

// ReferenceOnlyTitle reports whether a handbook H1 is learning/navigation/reference
// material rather than a technical System Design concept that should receive a
// visualization. The source handbooks remain bundled unchanged; this policy only
// controls what enters the interactive visualization explorer.
func ReferenceOnlyTitle(title string) bool {
	normalized := normalizePolicyTitle(title)

	exact := map[string]struct{}{
		"table of contents":                              {},
		"how to use this handbook":                       {},
		"how to use this guide":                          {},
		"senior-level expectations":                      {},
		"staff-level expectations":                       {},
		"suggested learning path":                        {},
		"learning roadmap":                               {},
		"practice questions":                             {},
		"final mental models":                            {},
		"final mastery challenge":                        {},
		"backend mastery practical standard":             {},
		"senior vs staff thinking":                       {},
		"senior cloud thinking":                          {},
		"staff cloud thinking":                           {},
		"what “staff-level database design” sounds like": {},
		`what "staff-level database design" sounds like`: {},
		"final principles":                               {},
		"final cloud mental model":                       {},
		"ai architecture principle summary":              {},
		"staff-level ai strategy":                        {},
		"end":                                            {},
		"closing":                                        {},
	}
	if _, ok := exact[normalized]; ok {
		return true
	}

	for _, suffix := range []string{
		" checklist",
		" review questions",
		" design exercises",
		" architecture exercises",
		" template",
		" cheat sheet",
	} {
		if strings.HasSuffix(normalized, suffix) {
			return true
		}
	}
	return false
}

func normalizePolicyTitle(title string) string {
	title = strings.TrimSpace(title)
	title = sectionNumberRE.ReplaceAllString(title, "")
	title = appendixTitleRE.ReplaceAllString(title, "")
	return strings.ToLower(strings.TrimSpace(title))
}
