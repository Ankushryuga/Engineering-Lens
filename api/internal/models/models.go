package models

// Language represents a supported programming language.
type Language string

const (
	LangPython     Language = "python"
	LangJavaScript Language = "javascript"
	LangGo         Language = "go"
	LangJava       Language = "java"
	LangCpp        Language = "cpp"
)

// SupportedLanguages lists all languages accepted by the API.
var SupportedLanguages = map[Language]bool{
	LangPython:     true,
	LangJavaScript: true,
	LangGo:         true,
	LangJava:       true,
	LangCpp:        true,
}

// MaxCodeBytes is the maximum allowed code size.
const MaxCodeBytes = 64 * 1024 // 64 KB

// ──────────────────────────────────────────────────────────────────────────────
// API request / response types
// ──────────────────────────────────────────────────────────────────────────────

// VisualizeRequest is the body of POST /api/v1/visualize.
type VisualizeRequest struct {
	Code     string   `json:"code"`
	Language Language `json:"language"`
}

// VisualizeResponse is returned from POST /api/v1/visualize.
type VisualizeResponse struct {
	JobID  string `json:"job_id"`
	Cached bool   `json:"cached,omitempty"`
}

// JobStatusResponse is returned from GET /api/v1/visualize/:job_id.
type JobStatusResponse struct {
	JobID   string  `json:"job_id"`
	Status  string  `json:"status"` // "pending" | "done" | "error"
	Result  *Result `json:"result,omitempty"`
}

// ──────────────────────────────────────────────────────────────────────────────
// Internal job / step types (shared across Kafka messages)
// ──────────────────────────────────────────────────────────────────────────────

// Job is the message published to the visualize-jobs Kafka topic.
type Job struct {
	ID       string   `json:"id"`
	Code     string   `json:"code"`
	Language Language `json:"language"`
	Hash     string   `json:"hash"` // sha256(code+language) — used as Redis key
}

// Step represents a single step in the visualization trace.
type Step struct {
	Type    string        `json:"type"`              // compare | swap | set | done | graph_init | visit | relax | path
	Indices []int         `json:"indices,omitempty"` // element positions involved (array renderType)
	Array   []interface{} `json:"array,omitempty"`   // full array state at this step (array renderType)
	Line    int           `json:"line,omitempty"`    // source line that produced this step
	Info    string        `json:"info,omitempty"`    // human-readable message shown in UI

	// Graph-specific fields (used when a template's render_type is "graph")
	Nodes     []string               `json:"nodes,omitempty"`     // full node list (graph_init only)
	Edges     [][]interface{}        `json:"edges,omitempty"`     // [from, to, weight] (graph_init only)
	Source    string                 `json:"source,omitempty"`    // the algorithm's source/start node (graph_init only)
	Node      string                 `json:"node,omitempty"`      // node touched by this step (visit)
	Edge      []string               `json:"edge,omitempty"`      // [from, to] edge touched by this step (relax)
	Distances map[string]interface{} `json:"distances,omitempty"` // current known distances, keyed by node
	Path      []string               `json:"path,omitempty"`      // final shortest path, in order (path/done)
}

// Result is the message published to the visualize-results Kafka topic.
type Result struct {
	JobID      string  `json:"job_id"`
	Steps      []Step  `json:"steps"`
	Error      string  `json:"error,omitempty"`
	Language   string  `json:"language"`
	DurationMS float64 `json:"duration_ms"`
}

// ──────────────────────────────────────────────────────────────────────────────
// Algorithm template catalog types
// ──────────────────────────────────────────────────────────────────────────────

// Template is a catalog entry returned from GET /api/v1/templates.
type Template struct {
	ID              int      `json:"id"`
	Name            string   `json:"name"`
	Category        string   `json:"category"`
	Difficulty      string   `json:"difficulty"` // Fundamental | Intermediate | Advanced
	TimeComplexity  string   `json:"time_complexity"`
	SpaceComplexity string   `json:"space_complexity"`
	RenderType      string   `json:"render_type"` // "array" | "graph" — selects the frontend visualization component
	Languages       []string `json:"languages"`   // which languages have a solution
}

// TemplateSolution is returned from GET /api/v1/templates/:id/solution?language=.
type TemplateSolution struct {
	TemplateID      int    `json:"template_id"`
	Name            string `json:"name"`
	Category        string `json:"category"`
	Difficulty      string `json:"difficulty"`
	TimeComplexity  string `json:"time_complexity"`
	SpaceComplexity string `json:"space_complexity"`
	RenderType      string `json:"render_type"`
	Language        string `json:"language"`
	Code            string `json:"code"`
}

// ErrorResponse is a standard error envelope.
type ErrorResponse struct {
	Error string `json:"error"`
	Code  int    `json:"code"`
}
