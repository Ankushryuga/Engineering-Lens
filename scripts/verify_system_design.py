#!/usr/bin/env python3
"""Regression checks for the Go/WASM System Design Topic Explorer + Architecture Labs."""
from pathlib import Path
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
scenario_file = ROOT / 'frontend/src/data/systemDesignScenarios.ts'
page_file = ROOT / 'frontend/src/pages/SystemDesign/SystemDesignPage.tsx'
explorer_file = ROOT / 'frontend/src/pages/SystemDesign/SystemDesignTopicExplorer.tsx'
explorer_css_file = ROOT / 'frontend/src/pages/SystemDesign/SystemDesignTopicExplorer.module.css'
go_viz_component = ROOT / 'frontend/src/components/SystemDesignGoViz/SystemDesignGoViz.tsx'
go_viz_css = ROOT / 'frontend/src/components/SystemDesignGoViz/SystemDesignGoViz.css'
wasm_loader = ROOT / 'frontend/src/lib/systemDesignWasm.ts'
wasm_root = ROOT / 'frontend/wasm'
wasm_main = wasm_root / 'cmd/wasm/main.go'
generator_file = wasm_root / 'cmd/generate/main.go'
audit_file = wasm_root / 'cmd/audit/main.go'
classifier_file = wasm_root / 'internal/engine/classifier.go'
renderer_file = wasm_root / 'internal/engine/render.go'
topic_json_file = ROOT / 'frontend/public/system-design-topics.json'
wasm_binary = ROOT / 'frontend/public/system-design.wasm'
wasm_exec = ROOT / 'frontend/public/wasm_exec.js'
refs_dir = ROOT / 'docs/system-design-references'

scenario_data = scenario_file.read_text()
page = page_file.read_text()
explorer = explorer_file.read_text()
explorer_css = explorer_css_file.read_text()
css = (ROOT / 'frontend/src/pages/SystemDesign/SystemDesignPage.module.css').read_text()
main = (ROOT / 'frontend/src/main.tsx').read_text()
landing = (ROOT / 'frontend/src/pages/Landing/Landing.tsx').read_text()
docs = (ROOT / 'frontend/src/pages/Docs/DocsPage.tsx').read_text()
sidebar = (ROOT / 'frontend/src/components/Sidebar/Sidebar.tsx').read_text()
readme = (ROOT / 'README.md').read_text()
requirements = (ROOT / 'requirement_doc.md').read_text()

failures: list[str] = []

def require(condition: bool, message: str) -> None:
    if not condition:
        failures.append(message)

# --- Go source-driven topic explorer -----------------------------------------
for path, label in (
    (generator_file, 'Go System Design topic generator'),
    (audit_file, 'Go System Design classification auditor'),
    (classifier_file, 'Go System Design classifier'),
    (renderer_file, 'Go System Design renderers'),
    (wasm_main, 'Go WebAssembly entrypoint'),
    (go_viz_component, 'React Go-WASM host component'),
    (go_viz_css, 'Go-WASM visualizer CSS'),
    (wasm_loader, 'Go-WASM loader'),
):
    require(path.exists(), f'missing {label}: {path}')

for filename in ('backend-systems.md', 'database-system-design.md', 'cloud-architecture.md', 'genai-system-design.md'):
    require((refs_dir / filename).exists(), f'missing bundled System Design reference: {filename}')

# Independently reparse the bundled handbooks so generator metadata cannot hide
# a dropped or incorrectly included H1 section.
def normalize_reference_title(title: str) -> str:
    title = re.sub(r'^\d+\.\s*', '', title.strip())
    title = re.sub(r'^Appendix\s+[A-Z]+\s+[—-]\s*', '', title, flags=re.IGNORECASE)
    return title.strip().lower()

REFERENCE_ONLY_EXACT = {
    'table of contents', 'how to use this handbook', 'how to use this guide',
    'senior-level expectations', 'staff-level expectations', 'suggested learning path',
    'learning roadmap', 'practice questions', 'final mental models', 'final mastery challenge',
    'backend mastery practical standard', 'senior vs staff thinking', 'senior cloud thinking',
    'staff cloud thinking', 'what “staff-level database design” sounds like',
    'what "staff-level database design" sounds like', 'final principles', 'final cloud mental model',
    'ai architecture principle summary', 'staff-level ai strategy', 'end', 'closing',
}
REFERENCE_ONLY_SUFFIXES = (
    ' checklist', ' review questions', ' design exercises', ' architecture exercises',
    ' template', ' cheat sheet',
)

def is_reference_only_source_title(title: str) -> bool:
    normalized = normalize_reference_title(title)
    return normalized in REFERENCE_ONLY_EXACT or normalized.endswith(REFERENCE_ONLY_SUFFIXES)

def source_h1s(path: Path) -> list[tuple[int, str]]:
    out: list[tuple[int, str]] = []
    in_fence = False
    fence = ''
    for line_number, raw in enumerate(path.read_text().splitlines(), start=1):
        stripped = raw.lstrip()
        if stripped.startswith('```') or stripped.startswith('~~~'):
            marker = stripped[:3]
            if not in_fence:
                in_fence, fence = True, marker
            elif marker == fence:
                in_fence, fence = False, ''
            continue
        if in_fence:
            continue
        match = re.match(r'^#\s+(.+?)\s*$', raw)
        if match:
            out.append((line_number, match.group(1).strip()))
    return out

expected_source_topics: set[tuple[str, int, str]] = set()
expected_reference_only: set[tuple[str, int, str]] = set()
for filename in ('backend-systems.md', 'database-system-design.md', 'cloud-architecture.md', 'genai-system-design.md'):
    headings = source_h1s(refs_dir / filename)
    require(bool(headings), f'no H1 sections parsed from {filename}')
    for line_number, title in headings[1:]:  # document title is not a topic
        record = (filename, line_number, title)
        if is_reference_only_source_title(title):
            expected_reference_only.add(record)
        else:
            expected_source_topics.add(record)

require(len(expected_reference_only) == 67, f'independent source parser expected 67 reference-only H1 sections, found {len(expected_reference_only)}')
require(len(expected_source_topics) == 1077, f'independent source parser expected 1,077 technical H1 sections, found {len(expected_source_topics)}')

if wasm_root.exists():
    go_test = subprocess.run(['go', 'test', './...'], cwd=wasm_root, capture_output=True, text=True)
    require(go_test.returncode == 0, f'Go System Design tests failed: {go_test.stderr.strip()}')

if generator_file.exists():
    generated = subprocess.run(['go', 'run', './cmd/generate', '-root', '../..'], cwd=wasm_root, capture_output=True, text=True)
    require(generated.returncode == 0, f'Go topic generator failed: {generated.stderr.strip()}')

require(topic_json_file.exists(), 'generated System Design topic dataset is missing')
payload = json.loads(topic_json_file.read_text()) if topic_json_file.exists() else {'topics': [], 'domains': {}, 'totals': {}}
topics = payload.get('topics', [])
require(len(topics) >= 1000, f'expected 1,000+ technical System Design topics, found {len(topics)}')
require(payload.get('schemaVersion') == 2, f"expected System Design topic schema v2, got {payload.get('schemaVersion')}")
require(payload.get('totals', {}).get('topics') == len(topics), 'topic total metadata must equal generated records')
require(payload.get('totals', {}).get('referenceOnly') == 67, f"expected 67 reference-only sections excluded from bundled sources, got {payload.get('totals', {}).get('referenceOnly')}")
require(payload.get('totals', {}).get('sourceSections') == len(topics) + 67, 'sourceSections metadata must equal technical topics + reference-only sections')

expected_minimums = {'backend': 205, 'database': 130, 'cloud': 340, 'genai': 390}
for domain, minimum in expected_minimums.items():
    count = sum(topic.get('domain') == domain for topic in topics)
    require(count >= minimum, f'{domain} reference coverage is unexpectedly incomplete: {count}')
    require(payload.get('domains', {}).get(domain) == count, f'{domain} domain metadata does not match topic records')

ids = [topic.get('id') for topic in topics]
require(len(ids) == len(set(ids)), 'generated System Design topic IDs must be unique')
for field in ('domain', 'order', 'kind', 'level', 'title', 'markdown', 'sourceFile', 'sourceLine'):
    require(all(topic.get(field) not in (None, '') for topic in topics), f'every generated topic must preserve {field}')

actual_source_topics = {
    (str(topic.get('sourceFile')), int(topic.get('sourceLine')), str(topic.get('title')))
    for topic in topics
}
missing_from_dataset = expected_source_topics - actual_source_topics
unexpected_in_dataset = actual_source_topics - expected_source_topics
require(not missing_from_dataset, f'technical source H1 sections missing from generated explorer: {sorted(missing_from_dataset)[:5]}')
require(not unexpected_in_dataset, f'non-technical/unexpected H1 sections entered generated explorer: {sorted(unexpected_in_dataset)[:5]}')
require(len(actual_source_topics) == len(topics), 'every explorer topic must map uniquely to one source H1 section')

titles = '\n'.join(str(topic.get('title', '')).lower() for topic in topics)
# Reference-only handbook/navigation/career/checklist content must never appear as visualization topics.
for forbidden in (
    'how to use this handbook', 'how to use this guide', 'senior-level expectations', 'staff-level expectations',
    'backend design exercises', 'cloud architecture exercises', 'genai design exercises', 'mastery checklist',
    'suggested learning path', 'learning roadmap', 'practice questions', 'final mental models',
    'final mastery challenge', 'senior vs staff thinking', 'senior cloud thinking', 'staff cloud thinking',
    'backend mastery practical standard', 'ai architecture principle summary', 'staff-level ai strategy',
):
    require(forbidden not in titles, f'reference-only handbook section leaked into visual explorer: {forbidden}')

for topic in topics:
    normalized_title = str(topic.get('title', '')).lower().strip()
    require(not normalized_title.endswith(' checklist'), f'checklist leaked into visual explorer: {topic.get("title")}')
    require(not normalized_title.endswith(' review questions'), f'review-question section leaked into visual explorer: {topic.get("title")}')
    require(not normalized_title.endswith(' template'), f'template section leaked into visual explorer: {topic.get("title")}')
    require(not normalized_title.endswith(' cheat sheet'), f'cheat-sheet section leaked into visual explorer: {topic.get("title")}')

for required_topic in (
    'query execution and optimization', 'transactions and acid', 'isolation levels', 'mvcc', 'replication',
    'partitioning and sharding', 'change data capture', 'oauth 2.0 and openid connect', 'kafka',
    'circuit breakers', 'rate limiting', 'regions, availability zones, and fault domains', 'iam deep dive',
    'vpcs and virtual networks', 'kubernetes', 'infrastructure as code', 'disaster recovery', 'finops',
    'retrieval-augmented generation', 'hnsw', 'agentic systems', 'llm observability', 'inference architecture',
    'safety and guardrails', 'genai cost architecture', 'enterprise genai architecture', 'ai platform engineering',
):
    require(required_topic in titles, f'missing supplied handbook topic: {required_topic}')

if audit_file.exists():
    audit = subprocess.run(['go', 'run', './cmd/audit', '-file', '../public/system-design-topics.json'], cwd=wasm_root, capture_output=True, text=True)
    require(audit.returncode == 0, f'Go visualizer classification audit failed: {audit.stderr.strip()}')
    match = re.search(r'families=(\d+)', audit.stdout)
    require(bool(match) and int(match.group(1)) >= 40, f'expected 40+ visualization families, audit was: {audit.stdout.strip()}')

for family_contract in (
    'FamilyQueryPlan', 'FamilyBTree', 'FamilyMVCC', 'FamilyDeadlock', 'FamilyReplication', 'FamilySharding',
    'FamilyRequestFlow', 'FamilyCache', 'FamilyQueue', 'FamilyResilience', 'FamilyRateLimiter', 'FamilySaga',
    'FamilyNetwork', 'FamilyMultiAZ', 'FamilyMultiRegion', 'FamilyIAM', 'FamilyKubernetes', 'FamilyAutoscale',
    'FamilyRAGIngest', 'FamilyRAGQuery', 'FamilyRetrieval', 'FamilyAgent', 'FamilySafety', 'FamilyModelGateway',
    'FamilyEvalCost', 'FamilyInference', 'FamilyFineTune', 'FamilyMemory', 'FamilyStructuredFlow',
):
    require(family_contract in classifier_file.read_text(), f'missing Go visualizer family: {family_contract}')

for renderer_contract in (
    'renderQueryPlan', 'renderBTree', 'renderMVCC', 'renderDeadlock', 'renderQueue', 'renderRateLimiter',
    'renderNetwork', 'renderMultiRegion', 'renderKubernetes', 'renderRAGQuery', 'renderAgent', 'renderModelGateway',
):
    require(renderer_contract in renderer_file.read_text(), f'missing actual Go renderer: {renderer_contract}')

require(wasm_binary.exists() and wasm_binary.stat().st_size > 100_000, 'compiled system-design.wasm is missing or suspiciously small')
require(wasm_exec.exists(), 'wasm_exec.js runtime is missing')
require('SystemDesignGoViz' in explorer, 'Topic Explorer does not mount the Go visualization engine')
require('function TopicMap' not in explorer, 'old radial TopicMap must not remain the primary renderer')
require('renderSystemDesignTopic' in go_viz_component.read_text(), 'Go-WASM host does not render selected topics')
require("fetch('/system-design.wasm')" in wasm_loader.read_text(), 'frontend does not load the compiled Go visualization engine')
require('engineeringLensRenderSystemDesign' in wasm_main.read_text(), 'Go WASM entrypoint does not expose render function')
require('engineeringLensSystemDesignAction' in wasm_main.read_text(), 'Go WASM entrypoint does not expose interaction function')

for contract in (
    "fetch('/system-design-topics.json')", 'MarkdownReader',
    "localStorage.setItem('engineering-lens-system-design-completed'", "next.set('topic', topic.id)",
    "setDomain(item)", "setKind(event.target.value", "setLevel(event.target.value",
    "readerMode === 'visual'", "readerMode === 'source'", 'previousTopic', 'nextTopic',
):
    require(contract in explorer, f'missing Topic Explorer interaction contract: {contract}')

require("activeView = searchParams.get('view') === 'labs' ? 'labs' : 'topics'" in page, 'All Topics must be the default System Design surface')
require("changeView('topics')" in page and "changeView('labs')" in page, 'System Design must switch between Topic Explorer and Architecture Labs')
require('SystemDesignTopicExplorer' in page, 'Topic Explorer is not integrated into System Design route')

for breakpoint in ('@media (max-width: 1180px)', '@media (max-width: 820px)', '@media (max-width: 520px)'):
    require(breakpoint in explorer_css, f'Topic Explorer missing responsive breakpoint {breakpoint}')
require('overflow-x: auto' in go_viz_css.read_text(), 'Go topic visualizer must own local horizontal overflow on narrow screens')

# --- End-to-end Architecture Labs -------------------------------------------
scenario_ids = re.findall(r"^    id: '([^']+)',", scenario_data, re.MULTILINE)
require(len(scenario_ids) >= 12, f'expected at least 12 system-design labs, found {len(scenario_ids)}')
require(len(scenario_ids) == len(set(scenario_ids)), 'system-design scenario IDs must be unique')

for category in ('backend', 'database', 'cloud', 'genai'):
    count = len(re.findall(rf"category: '{category}'", scenario_data))
    require(count >= 3, f'{category} should have at least 3 interactive designs, found {count}')

for feature in ('requirements:', 'scale:', 'metrics:', 'decisions:', 'tradeoffs:', 'nodes:', 'edges:', 'steps:', 'failures:', 'scaleTiers:'):
    require(scenario_data.count(feature) >= len(scenario_ids), f'every scenario should define {feature}')

for contract in (
    'ArchitectureCanvas', "setTraffic(multiplier)", 'setFailureId(event.target.value)', 'toggleEdgeKind',
    'setSelectedNodeId', 'setPlaying(value => !value)', 'aria-label="system design step"',
    "activeTab === 'tradeoffs'", 'failure.recovery', 'scaleTier.guidance',
):
    require(contract in page, f'missing interactive Architecture Lab contract: {contract}')

# --- Product integration/documentation --------------------------------------
require('<Route path="/system-design"' in main, 'system-design route is not registered')
require("navigate('/system-design')" in landing, 'landing page does not expose system design')
require('to="/system-design"' in sidebar, 'algorithm lab navigation does not expose system design')
require('Go/WebAssembly' in docs and '1,000+ technical-topic library' in docs and 'intentionally excluded' in docs and 'Architecture Labs' in docs, 'docs do not describe filtered Go System Design workspace')
require('1,077 technical source topics' in readme and '67 reference-only' in readme and 'npm run generate:system-design' in readme and 'system-design.wasm' in readme, 'README does not document filtered Go source coverage/generator/engine')
require('1,077 technical source topics' in requirements and 'Reference-only H1 sections intentionally excluded' in requirements and 'Go WebAssembly engine' in requirements and 'Architecture Labs' in requirements, 'requirements do not match filtered Go System Design implementation')

require('@media (max-width: 1050px)' in css and '@media (max-width: 760px)' in css and '@media (max-width: 480px)' in css, 'Architecture Labs responsive breakpoints are incomplete')
require('prefers-reduced-motion' in (ROOT / 'frontend/src/index.css').read_text(), 'global reduced-motion support is missing')
require('overflow-x: auto' in css, 'mobile architecture canvas should own horizontal overflow')

if failures:
    print('System Design verification FAILED')
    for failure in failures:
        print('  -', failure)
    sys.exit(1)

print(f"PASS Go/WASM Topic Explorer: {len(topics)} technical topics across {len(payload.get('domains', {}))} handbooks")
print(f"PASS reference-only filtering: {payload.get('totals', {}).get('referenceOnly')} non-visual handbook sections excluded")
print('PASS Go generator + 40+ visualization-family classification audit')
print('PASS actual tree/timeline/queue/topology/RAG/agent/model-gateway renderer contracts')
print('PASS Go playback/failure/trade-off engine + React host/source-navigation integration')
print(f'PASS {len(scenario_ids)} interactive Architecture Labs across Backend, Database, Cloud, and GenAI')
print('PASS responsive desktop/tablet/mobile layout contracts')
