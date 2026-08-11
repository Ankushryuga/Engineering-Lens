#!/usr/bin/env python3
"""Regression checks for v10 source-on-demand + explanation controls."""

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
SEED = (ROOT / 'catalog/seeds/algorithms.sql').read_text()
EXPLANATIONS = (ROOT / 'frontend/src/data/algorithmExplanations.ts').read_text()
APP = (ROOT / 'frontend/src/pages/App/AppPage.tsx').read_text()
APP_CSS = (ROOT / 'frontend/src/pages/App/AppPage.module.css').read_text()
PANEL = (ROOT / 'frontend/src/components/ExplanationPanel/ExplanationPanel.tsx').read_text()
PANEL_CSS = (ROOT / 'frontend/src/components/ExplanationPanel/ExplanationPanel.module.css').read_text()

names: list[str] = []
for match in re.finditer(r"\('((?:[^']|'')+)',\s*'([^']+)',\s*'(?:Fundamental|Intermediate|Advanced)'", SEED):
    name = match.group(1).replace("''", "'")
    if name not in names:
        names.append(name)

explanation_names: set[str] = set()
for match in re.finditer(r"^\s*(?:'([^']+)'|\"([^\"]+)\"):\s*\{", EXPLANATIONS, re.MULTILINE):
    explanation_names.add(match.group(1) or match.group(2))

missing = sorted(set(names) - explanation_names)
if missing:
    raise SystemExit(f'FAIL explanation coverage missing: {missing}')
if len(names) != 55:
    raise SystemExit(f'FAIL expected 55 seeded algorithms, got {len(names)}')
print('PASS all 55 guided algorithms have dedicated explanation definitions')

required_app_contracts = [
    "const [showSourceCode, setShowSourceCode] = useState(false)",
    "const [explainEnabled, setExplainEnabled] = useState(false)",
    "showSourceCode && (",
    "'Show source code'",
    "'Explain how it works'",
    '<ExplanationPanel',
    'previousStep={previousStep}',
]
for contract in required_app_contracts:
    if contract not in APP:
        raise SystemExit(f'FAIL missing AppPage contract: {contract}')
print('PASS source code is hidden by default and exposed only through the source toggle')
print('PASS explanation mode is opt-in and synchronized with current + previous trace steps')

required_step_types = ['compare', 'swap', 'set', 'grid_init', 'graph_init', 'tree_init', 'list_init', 'visit', 'relax', 'call', 'return', 'path', 'highlight', 'done']
for step_type in required_step_types:
    if f"case '{step_type}':" not in PANEL:
        raise SystemExit(f'FAIL ExplanationPanel missing step handler: {step_type}')
print(f'PASS explanation engine handles {len(required_step_types)} structured trace step types')

if 'TIMELINE_PHASES' not in PANEL or "'Sudoku Solver'" not in PANEL or "'Bellman-Ford'" not in PANEL:
    raise SystemExit('FAIL line-only/timeline lesson explanation phases are missing')
print('PASS timeline-fallback lessons receive algorithm-specific conceptual phases')

responsive_contracts = [
    '@media (min-width: 1441px)',
    '@media (min-width: 1681px)',
    '@media (min-width: 701px) and (max-width: 900px)',
    '@media (max-width: 700px)',
    '@media (max-width: 420px)',
    '.gridVisualOnly',
    '.gridWithSource',
    '.lessonBodyExplained',
]
for contract in responsive_contracts:
    if contract not in APP_CSS:
        raise SystemExit(f'FAIL responsive contract missing: {contract}')
if '@media (max-width: 1180px)' not in PANEL_CSS or '@media (max-width: 720px)' not in PANEL_CSS:
    raise SystemExit('FAIL explanation panel responsive contracts missing')
print('PASS visual-only, source-visible, explanation-rail, tablet, and phone layout contracts are present')

print('\nLearning controls verification complete.')
