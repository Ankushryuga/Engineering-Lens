package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"algoweave/api/internal/models"
	"algoweave/api/internal/postgres"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
)

// TemplatesHandler handles the algorithm template catalog endpoints.
type TemplatesHandler struct {
	db *postgres.Client
}

// NewTemplatesHandler constructs a TemplatesHandler.
func NewTemplatesHandler(db *postgres.Client) *TemplatesHandler {
	return &TemplatesHandler{db: db}
}

// HandleList handles GET /api/v1/templates.
func (h *TemplatesHandler) HandleList(w http.ResponseWriter, r *http.Request) {
	category := r.URL.Query().Get("category")
	difficulty := r.URL.Query().Get("difficulty")

	query := `
		SELECT
			t.id, t.name, t.category, t.difficulty,
			t.time_complexity, t.space_complexity, t.render_type,
			COALESCE(
				(SELECT array_agg(DISTINCT ts.language ORDER BY ts.language)
				 FROM template_solutions ts WHERE ts.template_id = t.id),
				'{}'::text[]
			) AS languages
		FROM templates t
		WHERE ($1 = '' OR t.category = $1)
		  AND ($2 = '' OR t.difficulty = $2)
		ORDER BY t.category, t.name
	`

	rows, err := h.db.Pool.Query(r.Context(), query, category, difficulty)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, models.ErrorResponse{Error: "failed to query templates", Code: 500})
		return
	}
	defer rows.Close()

	templates := make([]models.Template, 0)
	for rows.Next() {
		var t models.Template
		if err := rows.Scan(
			&t.ID, &t.Name, &t.Category, &t.Difficulty,
			&t.TimeComplexity, &t.SpaceComplexity, &t.RenderType, &t.Languages,
		); err != nil {
			writeJSON(w, http.StatusInternalServerError, models.ErrorResponse{Error: "failed to decode templates", Code: 500})
			return
		}
		templates = append(templates, t)
	}
	if err := rows.Err(); err != nil {
		writeJSON(w, http.StatusInternalServerError, models.ErrorResponse{Error: "failed while reading templates", Code: 500})
		return
	}

	writeJSON(w, http.StatusOK, templates)
}

// HandleSolution handles GET /api/v1/templates/:id/solution?language=.
func (h *TemplatesHandler) HandleSolution(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || id <= 0 {
		writeJSON(w, http.StatusBadRequest, models.ErrorResponse{Error: "template id must be a positive integer", Code: 400})
		return
	}
	language := r.URL.Query().Get("language")
	if language == "" {
		language = "python"
	}
	if !models.SupportedLanguages[models.Language(language)] {
		writeJSON(w, http.StatusBadRequest, models.ErrorResponse{Error: "unsupported template language", Code: 400})
		return
	}

	query := `
		SELECT
			t.id, t.name, t.category, t.difficulty,
			t.time_complexity, t.space_complexity, t.render_type,
			ts.language, ts.code
		FROM templates t
		JOIN template_solutions ts ON ts.template_id = t.id
		WHERE t.id = $1 AND ts.language = $2
	`

	var sol models.TemplateSolution
	err = h.db.Pool.QueryRow(r.Context(), query, id, language).Scan(
		&sol.TemplateID, &sol.Name, &sol.Category, &sol.Difficulty,
		&sol.TimeComplexity, &sol.SpaceComplexity, &sol.RenderType,
		&sol.Language, &sol.Code,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		writeJSON(w, http.StatusNotFound, models.ErrorResponse{Error: "solution not found for the given id and language", Code: 404})
		return
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, models.ErrorResponse{Error: "failed to load template solution", Code: 500})
		return
	}

	writeJSON(w, http.StatusOK, sol)
}
