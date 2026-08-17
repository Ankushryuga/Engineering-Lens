package engine

import (
	"fmt"
	"html"
	"math"
	"strings"
)

func RenderVisual(topic Topic, spec Spec, state RenderState) string {
	switch spec.Family {
	case FamilyQueryPlan:
		return renderQueryPlan(spec, state)
	case FamilyBTree:
		return renderBTree(spec, state)
	case FamilyMVCC:
		return renderMVCC(spec, state)
	case FamilyDeadlock:
		return renderDeadlock(spec, state)
	case FamilyReplication:
		return renderReplication(spec, state)
	case FamilySharding:
		return renderSharding(spec, state)
	case FamilyOutboxCDC:
		return renderOutbox(spec, state)
	case FamilyDBStorage:
		return renderStorageEngine(spec, state)
	case FamilyDBBackup, FamilyCloudBackup:
		return renderBackup(spec, state)
	case FamilyTransaction:
		return renderTransaction(spec, state)
	case FamilyRequestFlow:
		return renderRequestSequence(spec, state)
	case FamilyCache:
		return renderCache(spec, state)
	case FamilyQueue:
		return renderQueue(spec, state)
	case FamilyResilience:
		return renderResilience(spec, state)
	case FamilyRateLimiter:
		return renderRateLimiter(spec, state)
	case FamilySaga:
		return renderSaga(spec, state)
	case FamilyCQRS:
		return renderCQRS(spec, state)
	case FamilyAuth:
		return renderAuth(spec, state)
	case FamilyRealtime:
		return renderRealtime(spec, state)
	case FamilyNetwork:
		return renderNetwork(spec, state)
	case FamilyMultiAZ:
		return renderMultiAZ(spec, state)
	case FamilyMultiRegion:
		return renderMultiRegion(spec, state)
	case FamilyIAM:
		return renderIAM(spec, state)
	case FamilyKubernetes:
		return renderKubernetes(spec, state)
	case FamilyAutoscale:
		return renderAutoscale(spec, state)
	case FamilyServiceMesh:
		return renderServiceMesh(spec, state)
	case FamilyServerless:
		return renderServerless(spec, state)
	case FamilyCloudStorage:
		return renderCloudStorage(spec, state)
	case FamilyCloudCost:
		return renderCost(spec, state)
	case FamilyDelivery:
		return renderDelivery(spec, state)
	case FamilyRAGIngest:
		return renderRAGIngest(spec, state)
	case FamilyRAGQuery:
		return renderRAGQuery(spec, state)
	case FamilyRetrieval:
		return renderRetrieval(spec, state)
	case FamilyAgent:
		return renderAgent(spec, state)
	case FamilySafety:
		return renderSafety(spec, state)
	case FamilyModelGateway:
		return renderModelGateway(spec, state)
	case FamilyEvalCost:
		return renderEvalCost(spec, state)
	case FamilyInference:
		return renderInference(spec, state)
	case FamilyFineTune:
		return renderFineTune(spec, state)
	case FamilyMemory:
		return renderMemory(spec, state)
	case FamilyMultimodal:
		return renderMultimodal(spec, state)
	case FamilyPromptFlow:
		return renderPromptFlow(spec, state)
	default:
		return renderStructuredFlow(topic, spec, state)
	}
}

func activeIDs(spec Spec, state RenderState) map[string]bool {
	active := map[string]bool{}
	if state.Mode == "playback" && len(spec.Steps) > 0 {
		i := state.Step
		if i < 0 {
			i = 0
		}
		if i >= len(spec.Steps) {
			i = len(spec.Steps) - 1
		}
		for _, id := range spec.Steps[i].Active {
			active[id] = true
		}
	}
	return active
}

func failedIDs(spec Spec, state RenderState) map[string]bool {
	failed := map[string]bool{}
	if state.Mode == "failures" && state.Failure >= 0 && state.Failure < len(spec.Failures) {
		for _, id := range spec.Failures[state.Failure].Targets {
			failed[id] = true
		}
	}
	return failed
}

func nodeClass(id string, active, failed map[string]bool) string {
	classes := []string{"go-viz-node"}
	if active[id] {
		classes = append(classes, "is-active")
	}
	if failed[id] {
		classes = append(classes, "is-failed")
	}
	return strings.Join(classes, " ")
}

func node(x, y, w, h float64, id, label, subtitle string, active, failed map[string]bool) string {
	return fmt.Sprintf(`<g class="%s" onclick="engineeringLensSystemDesignAction('select','%s')"><rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="3"/><text x="%.1f" y="%.1f" class="go-viz-node-title">%s</text><text x="%.1f" y="%.1f" class="go-viz-node-sub">%s</text></g>`, nodeClass(id, active, failed), id, x, y, w, h, x+2.2, y+4.8, html.EscapeString(label), x+2.2, y+8.2, html.EscapeString(subtitle))
}

func smallNode(x, y, w, h float64, id, label string, active, failed map[string]bool) string {
	return fmt.Sprintf(`<g class="%s" onclick="engineeringLensSystemDesignAction('select','%s')"><rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="2.4"/><text x="%.1f" y="%.1f" text-anchor="middle" class="go-viz-small-label">%s</text></g>`, nodeClass(id, active, failed), id, x, y, w, h, x+w/2, y+h/2+0.8, html.EscapeString(label))
}

func arrow(x1, y1, x2, y2 float64, dashed bool, label string) string {
	class := "go-viz-edge"
	if dashed {
		class += " is-async"
	}
	midX := (x1 + x2) / 2
	midY := (y1 + y2) / 2
	labelSVG := ""
	if label != "" {
		labelSVG = fmt.Sprintf(`<rect x="%.1f" y="%.1f" width="12" height="4" rx="2" class="go-viz-edge-label-bg"/><text x="%.1f" y="%.1f" text-anchor="middle" class="go-viz-edge-label">%s</text>`, midX-6, midY-2.2, midX, midY+0.5, html.EscapeString(label))
	}
	return fmt.Sprintf(`<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" class="%s" marker-end="url(#goArrow)"/>%s`, x1, y1, x2, y2, class, labelSVG)
}

func svgWrap(inner string) string {
	return `<div class="go-viz-canvas"><svg viewBox="0 0 100 62" role="img"><defs><marker id="goArrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" class="go-viz-arrow"/></marker><pattern id="goGrid" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M 8 0 L 0 0 0 8" class="go-viz-grid-path"/></pattern></defs><rect width="100" height="62" fill="url(#goGrid)"/>` + inner + `</svg></div>`
}

func renderQueryPlan(spec Spec, state RenderState) string {
	a, f := activeIDs(spec, state), failedIDs(spec, state)
	b := strings.Builder{}
	b.WriteString(arrow(50, 13, 50, 20, false, "rows"))
	b.WriteString(arrow(50, 31, 31, 40, false, "build"))
	b.WriteString(arrow(50, 31, 69, 40, false, "probe"))
	b.WriteString(node(39, 4, 22, 9, "agg", "Aggregate", "final result", a, f))
	b.WriteString(node(38, 21, 24, 10, "join", "Hash Join", "orders.customer_id = customers.id", a, f))
	b.WriteString(node(18, 42, 26, 10, "seq", "Seq Scan · orders", "estimated 120k rows", a, f))
	b.WriteString(node(56, 42, 27, 10, "index", "Index Scan · customers", "customers_pkey", a, f))
	b.WriteString(`<g class="go-viz-callout"><rect x="3" y="4" width="27" height="15" rx="3"/><text x="5" y="8" class="go-viz-callout-title">Declarative SQL</text><text x="5" y="11.5" class="go-viz-callout-text">SELECT customer_id, SUM(total)</text><text x="5" y="14.4" class="go-viz-callout-text">FROM orders JOIN customers …</text></g>`)
	b.WriteString(`<g class="go-viz-callout"><rect x="70" y="4" width="27" height="15" rx="3"/><text x="72" y="8" class="go-viz-callout-title">Planner signals</text><text x="72" y="11.5" class="go-viz-callout-text">statistics · selectivity</text><text x="72" y="14.4" class="go-viz-callout-text">row estimates · index cost</text></g>`)
	return svgWrap(b.String())
}

func renderBTree(spec Spec, state RenderState) string {
	a, f := activeIDs(spec, state), failedIDs(spec, state)
	b := strings.Builder{}
	b.WriteString(smallNode(41, 5, 18, 7, "root", "[ 40 | 80 ]", a, f))
	b.WriteString(arrow(45, 12, 25, 22, false, "<40"))
	b.WriteString(arrow(50, 12, 50, 22, false, "40–79"))
	b.WriteString(arrow(55, 12, 75, 22, false, "≥80"))
	b.WriteString(smallNode(15, 23, 20, 7, "internal", "[ 10 | 25 ]", a, f))
	b.WriteString(smallNode(40, 23, 20, 7, "internal", "[ 55 | 68 ]", a, f))
	b.WriteString(smallNode(65, 23, 20, 7, "internal", "[ 90 | 110 ]", a, f))
	for i, x := range []float64{7, 24, 41, 58, 75} {
		id := fmt.Sprintf("leaf%d", i+1)
		label := []string{"3 · 7 · 9", "12 · 19 · 25", "41 · 55 · 62", "68 · 72 · 79", "82 · 90 · 97"}[i]
		b.WriteString(smallNode(x, 43, 16, 8, id, label, a, f))
		if i < 4 {
			b.WriteString(arrow(x+16, 47, x+17, 47, true, ""))
		}
	}
	b.WriteString(`<path d="M49 30 C50 34,50 37,49 43" class="go-viz-search-path"/><circle cx="49" cy="37" r="1.3" class="go-viz-packet"><animate attributeName="cy" values="30;43;30" dur="2.2s" repeatCount="indefinite"/></circle>`)
	b.WriteString(`<g class="go-viz-badge"><rect x="39" y="55" width="22" height="4.5" rx="2.2"/><text x="50" y="58" text-anchor="middle">ordered leaf chain → range scans</text></g>`)
	return svgWrap(b.String())
}

func renderMVCC(spec Spec, state RenderState) string {
	a, f := activeIDs(spec, state), failedIDs(spec, state)
	b := strings.Builder{}
	b.WriteString(`<line x1="15" y1="13" x2="95" y2="13" class="go-viz-time-axis"/><text x="4" y="14" class="go-viz-lane-label">T1</text>`)
	b.WriteString(`<line x1="15" y1="31" x2="95" y2="31" class="go-viz-time-axis"/><text x="4" y="32" class="go-viz-lane-label">T2</text>`)
	b.WriteString(`<line x1="15" y1="49" x2="95" y2="49" class="go-viz-time-axis"/><text x="4" y="50" class="go-viz-lane-label">Row</text>`)
	b.WriteString(smallNode(18, 8, 16, 9, "t1r", "READ v1", a, f))
	b.WriteString(smallNode(40, 26, 17, 9, "t2w", "UPDATE → v2", a, f))
	b.WriteString(smallNode(63, 26, 13, 9, "t2c", "COMMIT", a, f))
	b.WriteString(smallNode(78, 8, 16, 9, "t1r2", "READ again", a, f))
	b.WriteString(`<rect x="18" y="45" width="45" height="8" rx="2" class="go-viz-version old"/><text x="40.5" y="50" text-anchor="middle" class="go-viz-small-label">v1 · visible to T1 snapshot</text>`)
	b.WriteString(`<rect x="57" y="45" width="37" height="8" rx="2" class="go-viz-version new"/><text x="75.5" y="50" text-anchor="middle" class="go-viz-small-label">v2 · committed by T2</text>`)
	b.WriteString(`<line x1="63" y1="5" x2="63" y2="57" class="go-viz-commit-line"/><text x="64" y="6" class="go-viz-edge-label">commit</text>`)
	return svgWrap(b.String())
}

func renderDeadlock(spec Spec, state RenderState) string {
	a, f := activeIDs(spec, state), failedIDs(spec, state)
	b := strings.Builder{}
	b.WriteString(node(7, 8, 22, 11, "t1", "Transaction T1", "holds A · wants B", a, f))
	b.WriteString(node(71, 8, 22, 11, "t2", "Transaction T2", "holds B · wants A", a, f))
	b.WriteString(smallNode(15, 40, 18, 8, "a", "Row A", a, f))
	b.WriteString(smallNode(67, 40, 18, 8, "b", "Row B", a, f))
	b.WriteString(arrow(18, 19, 21, 40, false, "holds"))
	b.WriteString(arrow(82, 19, 76, 40, false, "holds"))
	b.WriteString(`<path d="M29 13 C47 7,56 7,71 13" class="go-viz-wait-edge" marker-end="url(#goArrow)"/><text x="50" y="8" text-anchor="middle" class="go-viz-edge-label">waits for B</text>`)
	b.WriteString(`<path d="M71 16 C55 28,44 28,29 16" class="go-viz-wait-edge" marker-end="url(#goArrow)"/><text x="50" y="27" text-anchor="middle" class="go-viz-edge-label">waits for A</text>`)
	b.WriteString(`<g class="` + nodeClass("abort", a, f) + `"><rect x="36" y="39" width="28" height="11" rx="3"/><text x="50" y="43.7" text-anchor="middle" class="go-viz-node-title">Deadlock detector</text><text x="50" y="47.2" text-anchor="middle" class="go-viz-node-sub">abort one victim → retry</text></g>`)
	return svgWrap(b.String())
}

func renderReplication(spec Spec, state RenderState) string {
	a, f := activeIDs(spec, state), failedIDs(spec, state)
	b := strings.Builder{}
	b.WriteString(node(5, 22, 24, 12, "primary", "Primary", "writes + strong reads", a, f))
	b.WriteString(node(70, 8, 24, 11, "r1", "Replica A", "read traffic", a, f))
	b.WriteString(node(70, 40, 24, 11, "r2", "Replica B", "read traffic · lag", a, f))
	b.WriteString(smallNode(39, 22, 21, 10, "wal", "WAL / replication log", a, f))
	b.WriteString(arrow(29, 28, 39, 27, true, "ship"))
	b.WriteString(arrow(60, 25, 70, 14, true, "replay"))
	b.WriteString(arrow(60, 29, 70, 45, true, "replay"))
	b.WriteString(`<g class="` + nodeClass("read", a, f) + `"><path d="M7 48 C28 55,49 56,70 47" class="go-viz-read-route" marker-end="url(#goArrow)"/><text x="40" y="57" text-anchor="middle" class="go-viz-edge-label">stale-tolerant reads</text></g>`)
	b.WriteString(`<g class="go-viz-lag"><rect x="76" y="52" width="13" height="4" rx="2"/><rect x="76" y="52" width="8" height="4" rx="2"/><text x="82.5" y="59" text-anchor="middle">lag</text></g>`)
	return svgWrap(b.String())
}

func renderSharding(spec Spec, state RenderState) string {
	a, f := activeIDs(spec, state), failedIDs(spec, state)
	b := strings.Builder{}
	b.WriteString(node(4, 23, 20, 11, "request", "Request", "tenant_id = 42", a, f))
	b.WriteString(node(31, 23, 22, 11, "router", "Shard Router", "hash / range map", a, f))
	b.WriteString(node(70, 5, 24, 11, "s1", "Shard 1", "keys 0–33", a, f))
	b.WriteString(node(70, 24, 24, 11, "s2", "Shard 2", "keys 34–66", a, f))
	b.WriteString(node(70, 43, 24, 11, "s3", "Shard 3", "keys 67–99", a, f))
	b.WriteString(arrow(24, 28.5, 31, 28.5, false, "key"))
	b.WriteString(arrow(53, 27, 70, 10.5, false, "route"))
	b.WriteString(arrow(53, 28.5, 70, 29.5, false, "route"))
	b.WriteString(arrow(53, 30, 70, 48.5, false, "route"))
	b.WriteString(`<g class="` + nodeClass("rebalance", a, f) + `"><rect x="31" y="43" width="27" height="10" rx="3"/><text x="44.5" y="47" text-anchor="middle" class="go-viz-node-title">Rebalancer</text><text x="44.5" y="50.5" text-anchor="middle" class="go-viz-node-sub">copy → catch up → flip</text></g>`)
	b.WriteString(arrow(58, 48, 70, 48, true, "move"))
	return svgWrap(b.String())
}

func renderOutbox(spec Spec, state RenderState) string {
	return renderPipeline(spec, state, []pipeItem{{"service", "Order / Command Service", "business transaction"}, {"db", "Database", "state + outbox row"}, {"relay", "CDC / Outbox Relay", "committed changes"}, {"broker", "Event Stream", "durable replay"}, {"consumer", "Consumer", "idempotent side effect"}}, true)
}

func renderStorageEngine(spec Spec, state RenderState) string {
	a, f := activeIDs(spec, state), failedIDs(spec, state)
	b := strings.Builder{}
	b.WriteString(node(4, 6, 22, 10, "wal", "Write-Ahead Log", "append durable record", a, f))
	b.WriteString(node(34, 6, 22, 10, "mem", "Memtable / Buffer", "sorted mutable state", a, f))
	b.WriteString(node(67, 6, 27, 10, "sst1", "SSTable / Page", "immutable disk structure", a, f))
	b.WriteString(arrow(26, 11, 34, 11, false, "apply"))
	b.WriteString(arrow(56, 11, 67, 11, false, "flush"))
	b.WriteString(`<g class="go-viz-storage-stack"><rect x="14" y="31" width="23" height="6" rx="2"/><rect x="17" y="38" width="23" height="6" rx="2"/><rect x="20" y="45" width="23" height="6" rx="2"/><text x="28.5" y="56" text-anchor="middle">immutable runs / pages</text></g>`)
	b.WriteString(`<g class="` + nodeClass("compact", a, f) + `"><path d="M44 34 C58 31,69 34,79 43" class="go-viz-compaction" marker-end="url(#goArrow)"/><text x="62" y="31" text-anchor="middle" class="go-viz-edge-label">compaction / checkpoint</text><rect x="70" y="42" width="23" height="8" rx="2.5"/><text x="81.5" y="47" text-anchor="middle" class="go-viz-small-label">merged structure</text></g>`)
	b.WriteString(`<g class="` + nodeClass("read", a, f) + `"><path d="M6 26 L85 26" class="go-viz-read-route" marker-end="url(#goArrow)"/><text x="46" y="23.7" text-anchor="middle" class="go-viz-edge-label">read: cache/index/Bloom filter narrows disk work</text></g>`)
	return svgWrap(b.String())
}

func renderBackup(spec Spec, state RenderState) string {
	return renderPipeline(spec, state, []pipeItem{{"source", "Primary Data", "live state"}, {"backup", "Snapshot / Backup", "recovery point"}, {"vault", "Protected Vault", "isolated retention"}, {"restore", "Restore Environment", "selected recovery point"}, {"validate", "Validation", "integrity + app checks"}}, true)
}

func renderTransaction(spec Spec, state RenderState) string {
	a, f := activeIDs(spec, state), failedIDs(spec, state)
	b := strings.Builder{}
	b.WriteString(`<rect x="8" y="8" width="84" height="44" rx="5" class="go-viz-transaction-boundary"/><text x="11" y="13" class="go-viz-callout-title">LOCAL TRANSACTION BOUNDARY</text>`)
	b.WriteString(node(14, 20, 19, 10, "read", "Read state", "snapshot / locks", a, f))
	b.WriteString(node(41, 20, 19, 10, "logic", "Check invariant", "business rule", a, f))
	b.WriteString(node(68, 20, 19, 10, "write", "Write state", "rows + indexes", a, f))
	b.WriteString(arrow(33, 25, 41, 25, false, ""))
	b.WriteString(arrow(60, 25, 68, 25, false, ""))
	b.WriteString(`<g class="go-viz-transaction-footer"><rect x="24" y="39" width="21" height="7" rx="2.5"/><text x="34.5" y="43.3" text-anchor="middle">COMMIT</text><rect x="55" y="39" width="21" height="7" rx="2.5"/><text x="65.5" y="43.3" text-anchor="middle">ROLLBACK</text></g>`)
	return svgWrap(b.String())
}

func renderRequestSequence(spec Spec, state RenderState) string {
	a, f := activeIDs(spec, state), failedIDs(spec, state)
	lanes := []struct {
		id, label string
		x         float64
	}{{"client", "Client", 8}, {"edge", "Edge / LB", 27}, {"api", "API Service", 46}, {"cache", "Cache", 65}, {"db", "Database", 84}}
	b := strings.Builder{}
	for _, lane := range lanes {
		b.WriteString(fmt.Sprintf(`<g class="%s"><rect x="%.1f" y="4" width="14" height="7" rx="2"/><text x="%.1f" y="8.4" text-anchor="middle" class="go-viz-small-label">%s</text><line x1="%.1f" y1="11" x2="%.1f" y2="57" class="go-viz-lifeline"/></g>`, nodeClass(lane.id, a, f), lane.x-7, lane.x, lane.label, lane.x, lane.x))
	}
	messages := []struct {
		y, x1, x2 float64
		label     string
		dashed    bool
	}{{16, 8, 27, "HTTPS", false}, {22, 27, 46, "route", false}, {29, 46, 65, "cache lookup", false}, {35, 65, 46, "MISS", true}, {41, 46, 84, "query / tx", false}, {47, 84, 46, "result", true}, {53, 46, 8, "response", true}}
	for _, m := range messages {
		b.WriteString(arrow(m.x1, m.y, m.x2, m.y, m.dashed, m.label))
	}
	b.WriteString(`<g class="` + nodeClass("auth", a, f) + `"><rect x="38" y="17.5" width="16" height="6" rx="2"/><text x="46" y="21.2" text-anchor="middle" class="go-viz-small-label">auth · validate</text></g>`)
	b.WriteString(`<g class="` + nodeClass("queue", a, f) + `"><rect x="57" y="51" width="18" height="6" rx="2"/><text x="66" y="54.8" text-anchor="middle" class="go-viz-small-label">async side effect</text></g>`)
	b.WriteString(`<g class="` + nodeClass("obs", a, f) + `"><text x="91" y="59" text-anchor="end" class="go-viz-edge-label">trace_id follows the path</text></g>`)
	return svgWrap(b.String())
}

func renderCache(spec Spec, state RenderState) string {
	a, f := activeIDs(spec, state), failedIDs(spec, state)
	b := strings.Builder{}
	b.WriteString(node(4, 22, 20, 11, "app", "Application", "GET user:42", a, f))
	b.WriteString(node(40, 8, 22, 11, "cache", "Distributed Cache", "key → value · TTL", a, f))
	b.WriteString(node(40, 39, 22, 11, "db", "Database", "source of truth", a, f))
	b.WriteString(arrow(24, 26, 40, 15, false, "1 · lookup"))
	b.WriteString(arrow(51, 19, 51, 39, true, "2 · miss"))
	b.WriteString(arrow(40, 45, 24, 31, true, "3 · data"))
	b.WriteString(`<g class="` + nodeClass("populate", a, f) + `"><path d="M40 43 C29 35,29 21,40 16" class="go-viz-read-route" marker-end="url(#goArrow)"/><text x="29" y="30" text-anchor="middle" class="go-viz-edge-label">4 · populate</text></g>`)
	b.WriteString(`<g class="` + nodeClass("hit", a, f) + `"><path d="M62 13 C78 13,82 25,68 28 C55 30,54 22,60 18" class="go-viz-hit-path" marker-end="url(#goArrow)"/><text x="79" y="12" text-anchor="middle" class="go-viz-edge-label">next read = HIT</text></g>`)
	b.WriteString(`<g class="go-viz-cache-key"><rect x="70" y="38" width="24" height="12" rx="3"/><text x="82" y="42" text-anchor="middle" class="go-viz-callout-title">Cache policy</text><text x="82" y="45.2" text-anchor="middle" class="go-viz-callout-text">TTL · jitter</text><text x="82" y="48.2" text-anchor="middle" class="go-viz-callout-text">invalidation · size limit</text></g>`)
	return svgWrap(b.String())
}

func renderQueue(spec Spec, state RenderState) string {
	a, f := activeIDs(spec, state), failedIDs(spec, state)
	b := strings.Builder{}
	b.WriteString(node(3, 23, 18, 10, "producer", "Producer", "key = order_id", a, f))
	b.WriteString(arrow(21, 28, 30, 28, false, "append"))
	b.WriteString(`<g class="go-viz-partitions">`)
	for i, y := range []float64{10, 25, 40} {
		id := fmt.Sprintf("p%d", i+1)
		class := nodeClass(id, a, f)
		b.WriteString(fmt.Sprintf(`<g class="%s"><rect x="31" y="%.1f" width="34" height="10" rx="2.5"/><text x="33" y="%.1f" class="go-viz-node-title">Partition %d</text>`, class, y, y+4, i))
		for j := 0; j < 5; j++ {
			b.WriteString(fmt.Sprintf(`<rect x="%.1f" y="%.1f" width="4.3" height="3" rx=".8" class="go-viz-message"/>`, 42+float64(j)*4.8, y+5.2))
		}
		b.WriteString(`</g>`)
	}
	b.WriteString(`</g>`)
	b.WriteString(node(76, 19, 20, 12, "consumer", "Consumer Group", "3 workers", a, f))
	b.WriteString(arrow(65, 15, 76, 23, true, "consume"))
	b.WriteString(arrow(65, 30, 76, 25, true, "consume"))
	b.WriteString(arrow(65, 45, 76, 27, true, "consume"))
	b.WriteString(`<g class="` + nodeClass("lag", a, f) + `"><rect x="76" y="40" width="20" height="6" rx="2"/><rect x="76" y="40" width="12" height="6" rx="2" class="go-viz-lag-fill"/><text x="86" y="50" text-anchor="middle" class="go-viz-edge-label">consumer lag</text></g>`)
	return svgWrap(b.String())
}

func renderResilience(spec Spec, state RenderState) string {
	a, f := activeIDs(spec, state), failedIDs(spec, state)
	b := strings.Builder{}
	states := []struct {
		id, label, sub string
		x              float64
	}{{"closed", "CLOSED", "traffic passes", 5}, {"fail", "FAILURES", "timeouts + backoff", 27}, {"open", "OPEN", "fail fast", 51}, {"half", "HALF-OPEN", "probe", 73}}
	for _, s := range states {
		b.WriteString(node(s.x, 20, 19, 11, s.id, s.label, s.sub, a, f))
	}
	for i := 0; i < len(states)-1; i++ {
		b.WriteString(arrow(states[i].x+19, 25.5, states[i+1].x, 25.5, false, ""))
	}
	b.WriteString(`<path d="M82 31 C81 43,20 45,15 31" class="go-viz-success-loop" marker-end="url(#goArrow)"/><text x="49" y="47" text-anchor="middle" class="go-viz-edge-label">successful probe → close</text>`)
	b.WriteString(`<g class="` + nodeClass("closed2", a, f) + `"><circle cx="15" cy="25.5" r="1.5" class="go-viz-packet"><animate attributeName="cx" values="15;82;15" dur="3.2s" repeatCount="indefinite"/></circle></g>`)
	b.WriteString(`<g class="go-viz-retry-budget"><rect x="31" y="6" width="38" height="7" rx="3"/><text x="50" y="9.5" text-anchor="middle" class="go-viz-callout-title">retry budget: 2 attempts · exponential backoff + jitter</text></g>`)
	return svgWrap(b.String())
}

func renderRateLimiter(spec Spec, state RenderState) string {
	a, f := activeIDs(spec, state), failedIDs(spec, state)
	b := strings.Builder{}
	b.WriteString(`<g class="` + nodeClass("bucket", a, f) + `"><path d="M36 15 L58 15 L54 49 L40 49 Z" class="go-viz-bucket"/><rect x="40" y="28" width="14" height="20" class="go-viz-water"/><text x="47" y="55" text-anchor="middle" class="go-viz-edge-label">token bucket</text></g>`)
	for i, x := range []float64{5, 13, 21} {
		id := fmt.Sprintf("req%d", i+1)
		b.WriteString(fmt.Sprintf(`<g class="%s"><circle cx="%.1f" cy="26" r="3"/><text x="%.1f" y="27" text-anchor="middle" class="go-viz-small-label">R%d</text></g>`, nodeClass(id, a, f), x, x, i+1))
	}
	b.WriteString(arrow(24, 26, 36, 26, false, "consume"))
	b.WriteString(`<g class="go-viz-refill"><path d="M47 5 L47 15" class="go-viz-read-route" marker-end="url(#goArrow)"/><text x="49" y="8" class="go-viz-edge-label">refill 5/s</text></g>`)
	b.WriteString(`<g class="` + nodeClass("deny", a, f) + `"><rect x="69" y="19" width="24" height="14" rx="3"/><text x="81" y="24" text-anchor="middle" class="go-viz-node-title">ALLOW / 429</text><text x="81" y="28" text-anchor="middle" class="go-viz-node-sub">token available?</text></g>`)
	b.WriteString(arrow(58, 26, 69, 26, false, "gate"))
	return svgWrap(b.String())
}

func renderSaga(spec Spec, state RenderState) string {
	a, f := activeIDs(spec, state), failedIDs(spec, state)
	b := strings.Builder{}
	items := []pipeItem{{"order", "Order", "created"}, {"payment", "Payment", "authorized"}, {"inventory", "Inventory", "reserve"}, {"failure", "Shipping", "FAILED"}}
	b.WriteString(renderPipelineInner(items, a, f, false))
	b.WriteString(`<path d="M83 39 C70 55,25 55,17 39" class="go-viz-compensation" marker-end="url(#goArrow)"/><text x="50" y="56" text-anchor="middle" class="go-viz-edge-label">compensate: release inventory → refund payment</text>`)
	b.WriteString(`<g class="` + nodeClass("compensate", a, f) + `"><circle cx="50" cy="51" r="1.4" class="go-viz-packet"/></g>`)
	return svgWrap(b.String())
}

func renderCQRS(spec Spec, state RenderState) string {
	a, f := activeIDs(spec, state), failedIDs(spec, state)
	b := strings.Builder{}
	b.WriteString(node(4, 8, 21, 10, "command", "Command API", "validate + write", a, f))
	b.WriteString(node(38, 8, 22, 10, "event", "Event Store / Log", "committed facts", a, f))
	b.WriteString(node(73, 8, 22, 10, "projection", "Projection Worker", "build read model", a, f))
	b.WriteString(node(73, 40, 22, 10, "query", "Read Model", "denormalized query", a, f))
	b.WriteString(arrow(25, 13, 38, 13, false, "append"))
	b.WriteString(arrow(60, 13, 73, 13, true, "subscribe"))
	b.WriteString(arrow(84, 18, 84, 40, true, "update"))
	b.WriteString(`<path d="M15 45 C32 52,53 52,73 45" class="go-viz-read-route" marker-end="url(#goArrow)"/><text x="44" y="56" text-anchor="middle" class="go-viz-edge-label">queries avoid the write model</text>`)
	return svgWrap(b.String())
}

func renderAuth(spec Spec, state RenderState) string {
	return renderPipeline(spec, state, []pipeItem{{"principal", "User / Workload", "principal"}, {"idp", "Identity Provider", "authenticate"}, {"token", "Short-Lived Credential", "session / token"}, {"policy", "Authorization", "action + resource + tenant"}, {"resource", "Protected Resource", "allowed operation"}}, false)
}

func renderRealtime(spec Spec, state RenderState) string {
	a, f := activeIDs(spec, state), failedIDs(spec, state)
	b := strings.Builder{}
	b.WriteString(node(4, 21, 20, 11, "client", "Client", "WebSocket / SSE", a, f))
	b.WriteString(node(38, 21, 22, 11, "gateway", "Realtime Gateway", "connection registry", a, f))
	b.WriteString(node(75, 8, 20, 10, "session", "Session Store", "connection → user", a, f))
	b.WriteString(node(75, 38, 20, 10, "broker", "Event Broker", "fan-out / replay", a, f))
	b.WriteString(arrow(24, 26, 38, 26, false, "upgrade"))
	b.WriteString(arrow(60, 24, 75, 13, true, "register"))
	b.WriteString(arrow(75, 43, 60, 29, true, "events"))
	b.WriteString(`<g class="` + nodeClass("push", a, f) + `"><path d="M38 30 C31 36,25 36,20 31" class="go-viz-read-route" marker-end="url(#goArrow)"/><text x="29" y="39" text-anchor="middle" class="go-viz-edge-label">push</text></g>`)
	return svgWrap(b.String())
}

func renderNetwork(spec Spec, state RenderState) string {
	a, f := activeIDs(spec, state), failedIDs(spec, state)
	b := strings.Builder{}
	b.WriteString(`<rect x="22" y="5" width="74" height="51" rx="5" class="go-viz-vpc"/><text x="24" y="9" class="go-viz-callout-title">VPC / VNet · 10.0.0.0/16</text>`)
	b.WriteString(`<rect x="27" y="13" width="28" height="36" rx="4" class="go-viz-subnet public"/><text x="29" y="17" class="go-viz-edge-label">Public subnet</text>`)
	b.WriteString(`<rect x="62" y="13" width="28" height="36" rx="4" class="go-viz-subnet private"/><text x="64" y="17" class="go-viz-edge-label">Private subnet</text>`)
	b.WriteString(node(2, 23, 16, 10, "internet", "Internet", "users", a, f))
	b.WriteString(node(31, 21, 20, 10, "edge", "Load Balancer", "public ingress", a, f))
	b.WriteString(node(66, 21, 20, 10, "app", "App Service", "private compute", a, f))
	b.WriteString(node(66, 37, 20, 9, "db", "Database", "private data", a, f))
	b.WriteString(node(31, 37, 20, 9, "nat", "NAT / Egress", "controlled outbound", a, f))
	b.WriteString(arrow(18, 28, 31, 26, false, "HTTPS"))
	b.WriteString(arrow(51, 26, 66, 26, false, "route"))
	b.WriteString(arrow(76, 31, 76, 37, false, "SQL"))
	b.WriteString(`<path d="M66 29 C54 33,49 38,51 41" class="go-viz-read-route" marker-end="url(#goArrow)"/><text x="58" y="36" text-anchor="middle" class="go-viz-edge-label">egress</text>`)
	return svgWrap(b.String())
}

func renderMultiAZ(spec Spec, state RenderState) string {
	a, f := activeIDs(spec, state), failedIDs(spec, state)
	b := strings.Builder{}
	b.WriteString(`<rect x="18" y="5" width="78" height="52" rx="5" class="go-viz-region"/><text x="20" y="9" class="go-viz-callout-title">Region</text>`)
	b.WriteString(`<rect x="24" y="13" width="29" height="37" rx="4" class="go-viz-az"/><text x="26" y="17" class="go-viz-edge-label">AZ A</text>`)
	b.WriteString(`<rect x="60" y="13" width="29" height="37" rx="4" class="go-viz-az"/><text x="62" y="17" class="go-viz-edge-label">AZ B</text>`)
	b.WriteString(node(2, 23, 13, 10, "lb", "LB", "health", a, f))
	b.WriteString(node(28, 22, 21, 10, "aza", "App A", "stateless", a, f))
	b.WriteString(node(64, 22, 21, 10, "azb", "App B", "stateless", a, f))
	b.WriteString(arrow(15, 28, 28, 27, false, "route"))
	b.WriteString(arrow(15, 28, 64, 27, false, "route"))
	b.WriteString(`<g class="` + nodeClass("db", a, f) + `"><rect x="43" y="40" width="26" height="10" rx="3"/><text x="56" y="44" text-anchor="middle" class="go-viz-node-title">Multi-AZ DB</text><text x="56" y="47.5" text-anchor="middle" class="go-viz-node-sub">managed failover</text></g>`)
	b.WriteString(arrow(38, 32, 50, 40, false, "private"))
	b.WriteString(arrow(75, 32, 62, 40, false, "private"))
	if f["aza"] {
		b.WriteString(`<g class="go-viz-az-outage"><rect x="24" y="13" width="29" height="37" rx="4"/><text x="38.5" y="35" text-anchor="middle">AZ OUTAGE</text></g>`)
	}
	b.WriteString(`<g class="` + nodeClass("aza-fail", a, f) + `"></g>`)
	return svgWrap(b.String())
}

func renderMultiRegion(spec Spec, state RenderState) string {
	a, f := activeIDs(spec, state), failedIDs(spec, state)
	b := strings.Builder{}
	b.WriteString(node(3, 23, 18, 10, "global", "Global Traffic", "DNS / anycast", a, f))
	b.WriteString(`<rect x="28" y="5" width="29" height="49" rx="5" class="go-viz-region"/><text x="30" y="9" class="go-viz-callout-title">Region A</text>`)
	b.WriteString(`<rect x="66" y="5" width="29" height="49" rx="5" class="go-viz-region"/><text x="68" y="9" class="go-viz-callout-title">Region B</text>`)
	b.WriteString(node(32, 15, 20, 9, "r1", "App Cell A", "home traffic", a, f))
	b.WriteString(node(70, 15, 20, 9, "r2", "App Cell B", "home traffic", a, f))
	b.WriteString(node(32, 36, 20, 9, "d1", "Data A", "home writes", a, f))
	b.WriteString(node(70, 36, 20, 9, "d2", "Data B", "home writes", a, f))
	b.WriteString(arrow(21, 28, 32, 19, false, "route"))
	b.WriteString(arrow(21, 28, 70, 19, false, "route"))
	b.WriteString(arrow(42, 24, 42, 36, false, "local"))
	b.WriteString(arrow(80, 24, 80, 36, false, "local"))
	b.WriteString(`<g class="` + nodeClass("rep", a, f) + `"><path d="M52 41 C58 34,64 34,70 41" class="go-viz-replication" marker-end="url(#goArrow)"/><path d="M70 45 C64 52,58 52,52 45" class="go-viz-replication" marker-end="url(#goArrow)"/><text x="61" y="33" text-anchor="middle" class="go-viz-edge-label">replication + lag</text></g>`)
	if f["r1"] {
		b.WriteString(`<g class="go-viz-region-outage"><rect x="28" y="5" width="29" height="49" rx="5"/><text x="42.5" y="31" text-anchor="middle">REGION OUTAGE</text></g>`)
	}
	b.WriteString(`<g class="` + nodeClass("failback", a, f) + `"><text x="61" y="58" text-anchor="middle" class="go-viz-edge-label">failover requires write ownership → failback requires reconciliation</text></g>`)
	return svgWrap(b.String())
}

func renderIAM(spec Spec, state RenderState) string {
	return renderPipeline(spec, state, []pipeItem{{"idp", "Corporate IdP", "MFA / lifecycle"}, {"role", "Cloud Role", "short-lived session"}, {"policy", "IAM Evaluation", "who · what · resource · conditions"}, {"resource", "Cloud Resource", "allowed action"}}, false)
}

func renderKubernetes(spec Spec, state RenderState) string {
	a, f := activeIDs(spec, state), failedIDs(spec, state)
	b := strings.Builder{}
	b.WriteString(`<rect x="3" y="4" width="94" height="54" rx="5" class="go-viz-cluster"/><text x="5" y="8" class="go-viz-callout-title">Kubernetes Cluster</text>`)
	b.WriteString(`<rect x="8" y="12" width="30" height="38" rx="4" class="go-viz-control-plane"/><text x="10" y="16" class="go-viz-edge-label">Control plane</text>`)
	b.WriteString(smallNode(12, 20, 22, 7, "api", "API Server", a, f))
	b.WriteString(smallNode(12, 31, 22, 7, "sched", "Scheduler", a, f))
	b.WriteString(smallNode(12, 42, 22, 7, "ctrl", "Controllers", a, f))
	b.WriteString(`<rect x="45" y="12" width="22" height="38" rx="4" class="go-viz-k8s-node"/><text x="47" y="16" class="go-viz-edge-label">Node A</text>`)
	b.WriteString(`<rect x="72" y="12" width="20" height="38" rx="4" class="go-viz-k8s-node"/><text x="74" y="16" class="go-viz-edge-label">Node B</text>`)
	b.WriteString(smallNode(48, 22, 16, 7, "pod1", "Pod 1", a, f))
	b.WriteString(smallNode(48, 33, 16, 7, "pod2", "Pod 2", a, f))
	b.WriteString(smallNode(74, 22, 16, 7, "pod3", "Pod 3", a, f))
	b.WriteString(smallNode(74, 33, 16, 7, "pod4", "Pod 4", a, f))
	b.WriteString(`<g class="` + nodeClass("svc", a, f) + `"><rect x="46" y="52" width="44" height="5" rx="2.5"/><text x="68" y="55.3" text-anchor="middle" class="go-viz-small-label">Service / Ingress → healthy pods</text></g>`)
	b.WriteString(`<g class="` + nodeClass("fail", a, f) + `"></g>`)
	if f["node1"] {
		b.WriteString(`<g class="go-viz-node-outage"><rect x="45" y="12" width="22" height="38" rx="4"/><text x="56" y="32" text-anchor="middle">NODE DOWN</text></g>`)
	}
	return svgWrap(b.String())
}

func renderAutoscale(spec Spec, state RenderState) string {
	a, f := activeIDs(spec, state), failedIDs(spec, state)
	b := strings.Builder{}
	b.WriteString(`<line x1="8" y1="50" x2="94" y2="50" class="go-viz-axis"/><line x1="8" y1="9" x2="8" y2="50" class="go-viz-axis"/>`)
	b.WriteString(`<path d="M8 44 C22 43,30 40,39 31 S59 15,70 17 S84 28,94 27" class="go-viz-traffic-line"/><text x="84" y="14" class="go-viz-chart-label">traffic</text>`)
	b.WriteString(`<path d="M8 46 L28 46 L28 42 L47 42 L47 34 L66 34 L66 26 L84 26 L84 22 L94 22" class="go-viz-replica-line"/><text x="84" y="20" class="go-viz-chart-label">replicas</text>`)
	b.WriteString(`<line x1="8" y1="30" x2="94" y2="30" class="go-viz-threshold"/><text x="10" y="28" class="go-viz-edge-label">scale threshold</text>`)
	b.WriteString(`<g class="` + nodeClass("threshold", a, f) + `"><circle cx="47" cy="31" r="2" class="go-viz-chart-point"/></g>`)
	b.WriteString(`<g class="` + nodeClass("replicas", a, f) + `"><circle cx="66" cy="34" r="2" class="go-viz-chart-point secondary"/></g>`)
	b.WriteString(`<g class="` + nodeClass("latency", a, f) + `"><rect x="13" y="6" width="25" height="7" rx="3"/><text x="25.5" y="10.3" text-anchor="middle" class="go-viz-small-label">warm-up delay matters</text></g>`)
	b.WriteString(`<g class="` + nodeClass("db", a, f) + `"><rect x="58" y="52" width="32" height="5" rx="2.5"/><text x="74" y="55.4" text-anchor="middle" class="go-viz-small-label">downstream capacity / quotas</text></g>`)
	return svgWrap(b.String())
}

func renderServiceMesh(spec Spec, state RenderState) string {
	a, f := activeIDs(spec, state), failedIDs(spec, state)
	b := strings.Builder{}
	b.WriteString(node(3, 22, 19, 10, "gateway", "API Gateway", "north-south", a, f))
	b.WriteString(node(32, 12, 20, 10, "a", "Service A", "sidecar proxy", a, f))
	b.WriteString(node(73, 12, 20, 10, "b", "Service B", "sidecar proxy", a, f))
	b.WriteString(`<g><rect x="30" y="35" width="65" height="16" rx="5" class="go-viz-mesh"/><text x="33" y="39" class="go-viz-callout-title">Mesh control / policy</text><text x="33" y="43" class="go-viz-callout-text">service identity · mTLS · telemetry · traffic policy</text><g class="` + nodeClass("policy", a, f) + `"><text x="33" y="47" class="go-viz-callout-text">retry ownership must be explicit</text></g></g>`)
	b.WriteString(arrow(22, 27, 32, 17, false, "route"))
	b.WriteString(`<g class="` + nodeClass("mesh", a, f) + `"><path d="M52 17 L73 17" class="go-viz-mesh-edge" marker-end="url(#goArrow)"/><text x="62.5" y="14.5" text-anchor="middle" class="go-viz-edge-label">mTLS</text></g>`)
	return svgWrap(b.String())
}

func renderServerless(spec Spec, state RenderState) string {
	return renderPipeline(spec, state, []pipeItem{{"event", "Event / HTTP", "trigger"}, {"runtime", "Function Runtime", "cold / warm start"}, {"db", "Managed Services", "IAM + timeout"}, {"scale", "Concurrency", "provider autoscale + quotas"}}, true)
}

func renderCloudStorage(spec Spec, state RenderState) string {
	return renderPipeline(spec, state, []pipeItem{{"write", "Application", "write object/block/file"}, {"durable", "Primary Storage", "replication / durability"}, {"archive", "Lifecycle Tier", "cool / archive / expire"}, {"read", "Restore / Read", "latency + retrieval cost"}}, true)
}

func renderCost(spec Spec, state RenderState) string {
	a, f := activeIDs(spec, state), failedIDs(spec, state)
	b := strings.Builder{}
	b.WriteString(`<line x1="10" y1="50" x2="94" y2="50" class="go-viz-axis"/><line x1="10" y1="9" x2="10" y2="50" class="go-viz-axis"/>`)
	bars := []struct {
		id, label string
		x, h      float64
	}{{"usage", "Compute", 20, 24}, {"unit", "Storage", 36, 13}, {"anomaly", "Egress", 52, 34}, {"decision", "Managed svc", 68, 19}}
	for _, bar := range bars {
		class := nodeClass(bar.id, a, f)
		b.WriteString(fmt.Sprintf(`<g class="%s"><rect x="%.1f" y="%.1f" width="10" height="%.1f" rx="2" class="go-viz-cost-bar"/><text x="%.1f" y="54" text-anchor="middle" class="go-viz-edge-label">%s</text></g>`, class, bar.x, 50-bar.h, bar.h, bar.x+5, bar.label))
	}
	b.WriteString(`<path d="M14 42 C35 38,50 31,76 17" class="go-viz-unit-line"/><text x="79" y="16" class="go-viz-chart-label">cost / request</text>`)
	return svgWrap(b.String())
}

func renderDelivery(spec Spec, state RenderState) string {
	return renderPipeline(spec, state, []pipeItem{{"git", "Git / IaC", "desired state"}, {"plan", "CI · Plan · Policy", "validate change"}, {"deploy", "Progressive Apply", "dev → stage → prod"}, {"observe", "Observe / Rollback", "SLO + drift"}}, true)
}

func renderRAGIngest(spec Spec, state RenderState) string {
	return renderPipeline(spec, state, []pipeItem{{"source", "Enterprise Sources", "docs · wiki · tickets"}, {"chunk", "Parse + Chunk", "structure + metadata"}, {"embed", "Embedding Workers", "batch · version · dedupe"}, {"index", "Hybrid Index", "vector + lexical + ACL"}, {"lineage", "Lineage", "freshness + deletion"}}, true)
}

func renderRAGQuery(spec Spec, state RenderState) string {
	a, f := activeIDs(spec, state), failedIDs(spec, state)
	b := strings.Builder{}
	items := []pipeItem{{"user", "Question + Identity", "authenticated context"}, {"query", "Query Understanding", "rewrite / intent"}, {"retrieve", "Retrieve", "ACL + metadata filters"}, {"context", "Rerank + Context", "top-k · token budget"}, {"llm", "LLM", "grounded generation"}, {"cite", "Citation Validation", "source support"}}
	b.WriteString(renderPipelineInner(items, a, f, true))
	b.WriteString(`<path d="M57 45 C61 55,77 55,82 45" class="go-viz-feedback" marker-end="url(#goArrow)"/><text x="70" y="58" text-anchor="middle" class="go-viz-edge-label">insufficient evidence → refuse / retrieve again</text>`)
	return svgWrap(b.String())
}

func renderRetrieval(spec Spec, state RenderState) string {
	a, f := activeIDs(spec, state), failedIDs(spec, state)
	b := strings.Builder{}
	b.WriteString(node(3, 23, 18, 10, "query", "Query", "semantic + exact terms", a, f))
	b.WriteString(`<g class="` + nodeClass("candidates", a, f) + `"><rect x="30" y="8" width="30" height="42" rx="4"/><text x="32" y="12" class="go-viz-callout-title">Candidate set · top 50</text>`)
	for i, score := range []float64{0.91, 0.83, 0.78, 0.71, 0.65, 0.59} {
		y := 16 + float64(i)*5
		b.WriteString(fmt.Sprintf(`<rect x="33" y="%.1f" width="%.1f" height="3" rx="1.5" class="go-viz-score-bar"/><text x="56" y="%.1f" text-anchor="end" class="go-viz-edge-label">%.2f</text>`, y, score*20, y+2.3, score))
	}
	b.WriteString(`</g>`)
	b.WriteString(arrow(21, 28, 30, 28, false, "search"))
	b.WriteString(node(68, 8, 27, 10, "filter", "Metadata Filter", "tenant · ACL · freshness", a, f))
	b.WriteString(node(68, 25, 27, 10, "rerank", "Reranker", "stronger relevance model", a, f))
	b.WriteString(node(68, 42, 27, 10, "topk", "Top 5 Context", "deduped · bounded", a, f))
	b.WriteString(arrow(60, 17, 68, 13, true, "filter"))
	b.WriteString(arrow(81.5, 18, 81.5, 25, false, ""))
	b.WriteString(arrow(81.5, 35, 81.5, 42, false, ""))
	return svgWrap(b.String())
}

func renderAgent(spec Spec, state RenderState) string {
	a, f := activeIDs(spec, state), failedIDs(spec, state)
	b := strings.Builder{}
	b.WriteString(node(4, 22, 18, 10, "goal", "User Goal", "identity + task", a, f))
	b.WriteString(node(31, 8, 22, 10, "state", "Orchestrator", "state · budget · loop", a, f))
	b.WriteString(node(68, 8, 20, 10, "model", "Model", "plan next action", a, f))
	b.WriteString(node(68, 39, 20, 10, "policy", "Policy", "auth · schema · risk", a, f))
	b.WriteString(node(31, 39, 22, 10, "tool", "Tool Gateway", "timeout · idempotency", a, f))
	b.WriteString(arrow(22, 27, 31, 13, false, "start"))
	b.WriteString(arrow(53, 13, 68, 13, false, "state"))
	b.WriteString(arrow(78, 18, 78, 39, false, "propose"))
	b.WriteString(arrow(68, 44, 53, 44, false, "approved"))
	b.WriteString(`<g class="` + nodeClass("observe", a, f) + `"><path d="M31 44 C17 43,17 14,31 13" class="go-viz-agent-loop" marker-end="url(#goArrow)"/><text x="15" y="29" text-anchor="middle" class="go-viz-edge-label" transform="rotate(-90 15 29)">observe → update state</text></g>`)
	b.WriteString(`<g class="go-viz-budget"><rect x="57" y="54" width="38" height="5" rx="2.5"/><text x="76" y="57.3" text-anchor="middle" class="go-viz-small-label">max steps · deadline · token/cost budget</text></g>`)
	return svgWrap(b.String())
}

func renderSafety(spec Spec, state RenderState) string {
	a, f := activeIDs(spec, state), failedIDs(spec, state)
	b := strings.Builder{}
	b.WriteString(`<rect x="3" y="7" width="28" height="47" rx="5" class="go-viz-untrusted-zone"/><text x="5" y="11" class="go-viz-callout-title">UNTRUSTED</text>`)
	b.WriteString(node(7, 17, 20, 9, "untrusted", "User / Retrieved", "content + instructions", a, f))
	b.WriteString(node(7, 35, 20, 9, "tooldata", "Tool Output", "external data", a, f))
	b.WriteString(`<rect x="38" y="7" width="28" height="47" rx="5" class="go-viz-policy-zone"/><text x="40" y="11" class="go-viz-callout-title">DETERMINISTIC BOUNDARY</text>`)
	b.WriteString(node(42, 19, 20, 10, "policy", "Policy Engine", "auth · ACL · schema", a, f))
	b.WriteString(node(42, 36, 20, 10, "guard", "Approval / Guard", "side effects · audit", a, f))
	b.WriteString(`<rect x="73" y="7" width="24" height="47" rx="5" class="go-viz-model-zone"/><text x="75" y="11" class="go-viz-callout-title">PROBABILISTIC</text>`)
	b.WriteString(node(76, 24, 18, 11, "model", "Model", "interpret · generate", a, f))
	b.WriteString(arrow(27, 22, 42, 24, false, "validate"))
	b.WriteString(arrow(62, 24, 76, 29, false, "allowed context"))
	b.WriteString(arrow(76, 33, 62, 41, true, "proposed action"))
	return svgWrap(b.String())
}

func renderModelGateway(spec Spec, state RenderState) string {
	a, f := activeIDs(spec, state), failedIDs(spec, state)
	b := strings.Builder{}
	b.WriteString(node(3, 22, 18, 10, "apps", "Product Apps", "many teams", a, f))
	b.WriteString(node(28, 22, 19, 10, "gateway", "AI Gateway", "auth · quota · stream", a, f))
	b.WriteString(node(54, 8, 18, 10, "policy", "Policy", "data class · catalog", a, f))
	b.WriteString(node(54, 38, 18, 10, "router", "Router", "quality · cost · health", a, f))
	b.WriteString(node(79, 5, 17, 9, "p1", "Provider A", "hosted", a, f))
	b.WriteString(node(79, 24, 17, 9, "p2", "Provider B", "fallback", a, f))
	b.WriteString(node(79, 43, 17, 9, "self", "Self-hosted", "GPU", a, f))
	b.WriteString(arrow(21, 27, 28, 27, false, "request"))
	b.WriteString(arrow(47, 24, 54, 13, false, "authorize"))
	b.WriteString(arrow(63, 18, 63, 38, false, "allowed"))
	b.WriteString(arrow(72, 43, 79, 9, false, "route"))
	b.WriteString(arrow(72, 43, 79, 28, false, "route"))
	b.WriteString(arrow(72, 43, 79, 47, false, "private"))
	b.WriteString(`<g class="` + nodeClass("providers", a, f) + `"></g><g class="` + nodeClass("obs", a, f) + `"><rect x="28" y="41" width="19" height="8" rx="2.5"/><text x="37.5" y="44.7" text-anchor="middle" class="go-viz-node-title">Usage ledger</text><text x="37.5" y="47.5" text-anchor="middle" class="go-viz-node-sub">tokens · cost · route</text></g>`)
	return svgWrap(b.String())
}

func renderEvalCost(spec Spec, state RenderState) string {
	a, f := activeIDs(spec, state), failedIDs(spec, state)
	b := strings.Builder{}
	b.WriteString(node(4, 23, 18, 10, "change", "Candidate Change", "model · prompt · RAG", a, f))
	b.WriteString(node(30, 8, 22, 10, "offline", "Offline Eval", "golden set · slices", a, f))
	b.WriteString(node(30, 39, 22, 10, "online", "Online Metrics", "latency · cost · success", a, f))
	b.WriteString(node(63, 23, 20, 10, "gate", "Release Gate", "thresholds", a, f))
	b.WriteString(arrow(22, 27, 30, 13, false, "test"))
	b.WriteString(arrow(22, 29, 30, 44, true, "canary"))
	b.WriteString(arrow(52, 13, 63, 26, false, "quality"))
	b.WriteString(arrow(52, 44, 63, 30, false, "unit economics"))
	b.WriteString(`<g class="go-viz-mini-chart"><rect x="86" y="8" width="10" height="40" rx="3"/><rect x="88" y="34" width="2" height="10"/><rect x="91" y="24" width="2" height="20"/><text x="91" y="53" text-anchor="middle">quality / cost</text></g>`)
	return svgWrap(b.String())
}

func renderInference(spec Spec, state RenderState) string {
	return renderPipeline(spec, state, []pipeItem{{"queue", "Request Queue", "deadlines · priority"}, {"batch", "Batch Scheduler", "continuous batching"}, {"gpu", "GPU Model Server", "weights · KV cache"}, {"stream", "Token Stream", "decode · cancel"}}, true)
}

func renderFineTune(spec Spec, state RenderState) string {
	return renderPipeline(spec, state, []pipeItem{{"data", "Versioned Dataset", "quality · permissions"}, {"train", "SFT / PEFT / LoRA", "training job"}, {"eval", "Evaluation", "quality · safety"}, {"registry", "Model Registry", "lineage · rollout"}}, true)
}

func renderMemory(spec Spec, state RenderState) string {
	return renderPipeline(spec, state, []pipeItem{{"recent", "Recent Context", "short-term state"}, {"select", "Memory Policy", "relevance · consent"}, {"store", "Durable Memory", "versioned · isolated"}, {"retrieve", "Memory Retrieval", "relevance + recency"}, {"delete", "Lifecycle", "expire · delete · audit"}}, true)
}

func renderMultimodal(spec Spec, state RenderState) string {
	a, f := activeIDs(spec, state), failedIDs(spec, state)
	b := strings.Builder{}
	for i, item := range []struct{ id, label string }{{"input", "Text"}, {"input", "Image"}, {"input", "Audio"}, {"input", "Video"}} {
		y := 8 + float64(i)*12
		b.WriteString(smallNode(4, y, 17, 7, item.id, item.label, a, f))
		b.WriteString(arrow(21, y+3.5, 35, 30, true, "encode"))
	}
	b.WriteString(node(35, 24, 21, 12, "encode", "Encoders / Extractors", "vision · ASR · parsing", a, f))
	b.WriteString(node(64, 24, 17, 12, "fuse", "Fusion / VLM", "joint context", a, f))
	b.WriteString(node(85, 24, 12, 12, "output", "Output", "text / media", a, f))
	b.WriteString(arrow(56, 30, 64, 30, false, "representations"))
	b.WriteString(arrow(81, 30, 85, 30, false, "generate"))
	return svgWrap(b.String())
}

func renderPromptFlow(spec Spec, state RenderState) string {
	return renderPipeline(spec, state, []pipeItem{{"system", "System Instructions", "privileged policy"}, {"user", "User Input", "untrusted content"}, {"schema", "Structured Contract", "tool / JSON schema"}, {"version", "Version + Eval", "prompt · model · tool"}}, true)
}

type pipeItem struct {
	ID, Label, Sub string
}

func renderPipeline(spec Spec, state RenderState, items []pipeItem, async bool) string {
	a, f := activeIDs(spec, state), failedIDs(spec, state)
	return svgWrap(renderPipelineInner(items, a, f, async))
}

func renderPipelineInner(items []pipeItem, active, failed map[string]bool, async bool) string {
	if len(items) == 0 {
		return ""
	}
	b := strings.Builder{}
	margin := 4.0
	available := 92.0
	gap := 3.0
	w := (available - gap*float64(len(items)-1)) / float64(len(items))
	if w > 20 {
		w = 20
	}
	x := margin
	for i, item := range items {
		y := 22.0
		if i%2 == 1 && len(items) >= 5 {
			y = 25
		}
		b.WriteString(node(x, y, w, 12, item.ID, item.Label, item.Sub, active, failed))
		if i < len(items)-1 {
			nextX := x + w + gap
			b.WriteString(arrow(x+w, y+6, nextX, 28, async, ""))
		}
		x += w + gap
	}
	return b.String()
}

func renderStructuredFlow(topic Topic, spec Spec, state RenderState) string {
	items := topic.Subtopics
	if len(items) == 0 {
		items = topic.KeyPoints
	}
	if len(items) == 0 {
		items = []string{"Requirement", "Mechanism", "State", "Failure", "Trade-off"}
	}
	if len(items) > 6 {
		items = items[:6]
	}
	pipe := make([]pipeItem, 0, len(items))
	for i, item := range items {
		pipe = append(pipe, pipeItem{ID: fmt.Sprintf("step%d", i+1), Label: short(item, 24), Sub: fmt.Sprintf("source stage %d", i+1)})
	}
	return renderPipeline(spec, state, pipe, true)
}

func short(s string, n int) string {
	r := []rune(strings.TrimSpace(s))
	if len(r) <= n {
		return string(r)
	}
	return string(r[:n-1]) + "…"
}

func clamp(v, lo, hi float64) float64 {
	return math.Max(lo, math.Min(hi, v))
}
