package engine

import (
	"fmt"
	"html"
	"strings"
)

func RenderHTML(topic Topic, spec Spec, state RenderState) string {
	if state.Mode == "" {
		state.Mode = "visual"
	}
	if state.Step < 0 {
		state.Step = 0
	}
	if len(spec.Steps) > 0 && state.Step >= len(spec.Steps) {
		state.Step = len(spec.Steps) - 1
	}

	b := strings.Builder{}
	b.WriteString(`<section class="go-viz-shell">`)
	b.WriteString(`<header class="go-viz-header"><div><span class="go-viz-engine-badge">GO · WEBASSEMBLY</span><strong>` + html.EscapeString(spec.FamilyLabel) + `</strong><p>` + html.EscapeString(spec.Description) + `</p></div><div class="go-viz-source-chip">source-driven · ` + html.EscapeString(topic.SourceFile) + `</div></header>`)
	b.WriteString(`<nav class="go-viz-tabs">`)
	for _, tab := range []struct{ id, label string }{{"visual", "Actual visualization"}, {"playback", "Step playback"}, {"failures", "Failures"}, {"tradeoffs", "Trade-offs"}} {
		class := ""
		if state.Mode == tab.id {
			class = ` class="is-active"`
		}
		b.WriteString(fmt.Sprintf(`<button type="button"%s onclick="engineeringLensSystemDesignAction('mode','%s')">%s</button>`, class, tab.id, tab.label))
	}
	b.WriteString(`</nav>`)

	if state.Mode == "playback" {
		b.WriteString(renderPlaybackControls(spec, state))
	}
	if state.Mode == "failures" {
		b.WriteString(renderFailureControls(spec, state))
	}

	b.WriteString(RenderVisual(topic, spec, state))

	switch state.Mode {
	case "playback":
		b.WriteString(renderStepDetail(spec, state))
	case "failures":
		b.WriteString(renderFailureDetail(spec, state))
	case "tradeoffs":
		b.WriteString(renderTradeoffs(spec))
	default:
		b.WriteString(renderVisualGuide(topic, spec, state))
	}

	b.WriteString(`</section>`)
	return b.String()
}

func renderPlaybackControls(spec Spec, state RenderState) string {
	if len(spec.Steps) == 0 {
		return ""
	}
	playLabel := "Play"
	if state.Playing {
		playLabel = "Pause"
	}
	return fmt.Sprintf(`<div class="go-viz-controls"><div><span>Step %d / %d</span><strong>%s</strong></div><div class="go-viz-control-buttons"><button type="button" onclick="engineeringLensSystemDesignAction('prev','')" %s>←</button><button type="button" class="go-viz-primary" onclick="engineeringLensSystemDesignAction('play','')">%s</button><button type="button" onclick="engineeringLensSystemDesignAction('next','')" %s>→</button><select onchange="engineeringLensSystemDesignAction('speed',this.value)"><option value="1"%s>1×</option><option value="2"%s>1.5×</option><option value="3"%s>2×</option></select></div></div>`,
		state.Step+1, len(spec.Steps), html.EscapeString(spec.Steps[state.Step].Title), disabled(state.Step == 0), playLabel, disabled(state.Step == len(spec.Steps)-1), selected(state.PlaybackSpeed <= 1), selected(state.PlaybackSpeed == 2), selected(state.PlaybackSpeed >= 3))
}

func renderFailureControls(spec Spec, state RenderState) string {
	if len(spec.Failures) == 0 {
		return `<div class="go-viz-controls"><strong>No dedicated failure simulation is defined for this topic.</strong></div>`
	}
	b := strings.Builder{}
	b.WriteString(`<div class="go-viz-controls"><div><span>Failure injection</span><strong>Select a realistic failure mode</strong></div><select class="go-viz-failure-select" onchange="engineeringLensSystemDesignAction('failure',this.value)">`)
	for i, failure := range spec.Failures {
		b.WriteString(fmt.Sprintf(`<option value="%d"%s>%s</option>`, i, selected(i == state.Failure), html.EscapeString(failure.Label)))
	}
	b.WriteString(`</select></div>`)
	return b.String()
}

func renderStepDetail(spec Spec, state RenderState) string {
	if len(spec.Steps) == 0 {
		return ""
	}
	step := spec.Steps[state.Step]
	b := strings.Builder{}
	b.WriteString(`<div class="go-viz-detail-grid"><article class="go-viz-narration"><span>What is happening</span><h3>` + html.EscapeString(step.Title) + `</h3><p>` + html.EscapeString(step.Description) + `</p></article><article class="go-viz-step-list"><span>Playback sequence</span><ol>`)
	for i, item := range spec.Steps {
		class := ""
		if i == state.Step {
			class = ` class="is-current"`
		}
		b.WriteString(fmt.Sprintf(`<li%s onclick="engineeringLensSystemDesignAction('step','%d')"><b>%02d</b><span>%s</span></li>`, class, i, i+1, html.EscapeString(item.Title)))
	}
	b.WriteString(`</ol></article></div>`)
	return b.String()
}

func renderFailureDetail(spec Spec, state RenderState) string {
	if len(spec.Failures) == 0 {
		return ""
	}
	i := state.Failure
	if i < 0 || i >= len(spec.Failures) {
		i = 0
	}
	failure := spec.Failures[i]
	return `<div class="go-viz-detail-grid"><article class="go-viz-failure-card"><span>Impact</span><h3>` + html.EscapeString(failure.Label) + `</h3><p>` + html.EscapeString(failure.Impact) + `</p></article><article class="go-viz-recovery-card"><span>Recovery / containment</span><p>` + html.EscapeString(failure.Recovery) + `</p></article></div>`
}

func renderTradeoffs(spec Spec) string {
	b := strings.Builder{}
	b.WriteString(`<div class="go-viz-tradeoffs"><div class="go-viz-section-title"><span>Engineering trade-offs</span><strong>Why the mechanism is not universally correct</strong></div><div class="go-viz-tradeoff-grid">`)
	for i, tradeoff := range spec.Tradeoffs {
		b.WriteString(fmt.Sprintf(`<article><b>%02d</b><p>%s</p></article>`, i+1, html.EscapeString(tradeoff)))
	}
	b.WriteString(`</div></div>`)
	return b.String()
}

func renderVisualGuide(topic Topic, spec Spec, state RenderState) string {
	b := strings.Builder{}
	b.WriteString(`<div class="go-viz-detail-grid"><article class="go-viz-narration"><span>How to use this visualization</span><h3>` + html.EscapeString(spec.FamilyLabel) + `</h3><p>Open <strong>Step playback</strong> to animate the mechanism and <strong>Failures</strong> to see blast radius and recovery behavior. Click diagram components to inspect the selected element.</p>`)
	if state.Selected != "" {
		b.WriteString(`<div class="go-viz-selected"><span>Selected component</span><strong>` + html.EscapeString(state.Selected) + `</strong></div>`)
	}
	b.WriteString(`</article><article class="go-viz-source-points"><span>Source-grounded points</span><ul>`)
	points := spec.Inspector
	if len(points) == 0 {
		points = []string{"Use Source notes for the complete supplied section."}
	}
	for _, point := range points {
		b.WriteString(`<li>` + html.EscapeString(point) + `</li>`)
	}
	b.WriteString(`</ul></article></div>`)
	return b.String()
}

func disabled(v bool) string {
	if v {
		return "disabled"
	}
	return ""
}

func selected(v bool) string {
	if v {
		return " selected"
	}
	return ""
}
