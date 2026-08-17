package validator

import (
	"testing"

	"engineering-lens/api/internal/models"
)

func TestValidateRequestSupportedLanguages(t *testing.T) {
	t.Parallel()

	for _, language := range []models.Language{models.LangPython, models.LangGo} {
		req := models.VisualizeRequest{Code: "print('ok')", Language: language}
		if language == models.LangGo {
			req.Code = "package main\nfunc main() {}"
		}
		if err := ValidateRequest(&req); err != nil {
			t.Fatalf("expected %s to be supported: %v", language, err)
		}
	}
}

func TestValidateRequestRejectsRemovedLanguages(t *testing.T) {
	t.Parallel()

	for _, language := range []models.Language{"javascript", "java", "cpp"} {
		req := models.VisualizeRequest{Code: "example", Language: language}
		if err := ValidateRequest(&req); err == nil {
			t.Fatalf("expected %s to be rejected", language)
		}
	}
}
