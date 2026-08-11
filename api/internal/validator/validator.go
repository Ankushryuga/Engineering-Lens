package validator

import (
	"fmt"
	"strings"

	"algoweave/api/internal/models"
)

// staticDenyPatterns lists dangerous patterns per language that are rejected
// before code even reaches the sandbox — defense-in-depth only.
var staticDenyPatterns = map[models.Language][]string{
	models.LangPython: {
		"os.system", "subprocess", "__import__", "exec(", "eval(",
		"open(", "socket", "urllib", "requests", "http.client",
	},
	models.LangGo: {
		"os/exec", "net/http", "os.Remove", "os.Create",
		"syscall", "unsafe",
	},
}

// ValidateRequest validates a VisualizeRequest and returns an error if invalid.
func ValidateRequest(req *models.VisualizeRequest) error {
	if !models.SupportedLanguages[req.Language] {
		supported := make([]string, 0, len(models.SupportedLanguages))
		for l := range models.SupportedLanguages {
			supported = append(supported, string(l))
		}
		return fmt.Errorf("unsupported language %q; supported: %s", req.Language, strings.Join(supported, ", "))
	}

	if len(req.Code) == 0 {
		return fmt.Errorf("code must not be empty")
	}

	if len(req.Code) > models.MaxCodeBytes {
		return fmt.Errorf("code exceeds maximum size of %d bytes", models.MaxCodeBytes)
	}

	patterns, ok := staticDenyPatterns[req.Language]
	if ok {
		lower := strings.ToLower(req.Code)
		for _, p := range patterns {
			if strings.Contains(lower, strings.ToLower(p)) {
				return fmt.Errorf("code contains a disallowed pattern: %q", p)
			}
		}
	}

	return nil
}
