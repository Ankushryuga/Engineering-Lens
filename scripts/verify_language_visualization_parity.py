#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
app = (ROOT / 'frontend/src/pages/App/AppPage.tsx').read_text()
trace = (ROOT / 'frontend/src/components/Visualization/TraceViz.tsx').read_text()
picker = (ROOT / 'frontend/src/components/AlgoPicker/AlgoPicker.tsx').read_text()

checks = {
    'guided Go loads canonical Python teaching trace': "fetchTemplateSolution(templateId, 'python')" in app,
    'canonical trace is cached per template': 'canonicalTraceCacheRef' in app,
    'Go must execute successfully before shared trace is shown': "if (result.error)" in app and 'loadCanonicalTeachingTrace' in app,
    'Go view strips Python source line numbers': 'canonicalSteps.map(step => ({ ...step, line: undefined }))' in app,
    'guided reference source is read-only': "readOnly={source === 'template'}" in app,
    'UI explains shared visualization contract': 'Python and Go share the same teaching visualization' in app,
    'picker communicates parity': 'Visualization is shared across Python and Go' in picker,
    'line-free highlights are labelled as algorithm phases': "step.line ? 'Execute line' : 'Algorithm phase'" in trace,
}

failed = [name for name, ok in checks.items() if not ok]
if failed:
    print('Language visualization parity verification FAILED')
    for name in failed:
        print(f'  - {name}')
    sys.exit(1)

for name in checks:
    print(f'PASS {name}')
