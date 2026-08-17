package engine

import (
	"strings"
	"testing"
)

func TestQueryPlanIsActualPlanTree(t *testing.T) {
	topic := Topic{Domain: "database", Title: "9. Query Execution and Optimization"}
	spec := BuildSpec(topic)
	html := RenderHTML(topic, spec, RenderState{Mode: "visual", PlaybackSpeed: 1})
	for _, required := range []string{"Hash Join", "Seq Scan · orders", "Index Scan · customers", "Execution plan tree"} {
		if !strings.Contains(html, required) {
			t.Fatalf("query plan visualization missing %q", required)
		}
	}
	if strings.Contains(html, "topicCenterGlow") || strings.Contains(html, "concept map") {
		t.Fatal("query plan fell back to the old radial concept map")
	}
}

func TestFallbackUsesStructuredFlowNotRadialMap(t *testing.T) {
	topic := Topic{Domain: "backend", Title: "Staff-Level Expectations", Subtopics: []string{"Technical direction", "Cross-team design", "Technical strategy"}}
	spec := BuildSpec(topic)
	html := RenderHTML(topic, spec, RenderState{Mode: "visual", PlaybackSpeed: 1})
	if !strings.Contains(html, "Source-derived engineering flow") {
		t.Fatal("expected structured flow fallback")
	}
	if strings.Contains(html, "concept map") || strings.Contains(html, "topicCenterGlow") {
		t.Fatal("fallback must not use the old radial concept map")
	}
}
