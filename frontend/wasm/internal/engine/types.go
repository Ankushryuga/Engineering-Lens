package engine

type Topic struct {
	ID          string   `json:"id"`
	Domain      string   `json:"domain"`
	DomainLabel string   `json:"domainLabel"`
	Order       int      `json:"order"`
	Kind        string   `json:"kind"`
	Level       string   `json:"level"`
	Title       string   `json:"title"`
	Summary     string   `json:"summary"`
	Subtopics   []string `json:"subtopics"`
	KeyPoints   []string `json:"keyPoints"`
	CodeBlocks  []string `json:"codeBlocks"`
	Tags        []string `json:"tags"`
	Markdown    string   `json:"markdown"`
	SourceFile  string   `json:"sourceFile"`
	SourceLine  int      `json:"sourceLine"`
}

type TopicPayload struct {
	SchemaVersion int            `json:"schemaVersion"`
	Source        string         `json:"source"`
	Totals        map[string]int `json:"totals"`
	Domains       map[string]int `json:"domains"`
	Topics        []Topic        `json:"topics"`
}

type Step struct {
	Title       string
	Description string
	Active      []string
}

type Failure struct {
	ID       string
	Label    string
	Impact   string
	Recovery string
	Targets  []string
}

type Spec struct {
	Family       Family
	FamilyLabel  string
	Description  string
	Steps        []Step
	Failures     []Failure
	Tradeoffs    []string
	Inspector    []string
	SourceDriven bool
}

type RenderState struct {
	Mode          string
	Step          int
	Failure       int
	Selected      string
	PlaybackSpeed int
	Playing       bool
}
