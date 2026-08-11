#!/usr/bin/env python3
"""AlgoWeave v17 brand + responsive-layout regression checks."""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
files = {
    'sidebar': ROOT / 'frontend/src/components/Sidebar/Sidebar.tsx',
    'sidebar_css': ROOT / 'frontend/src/components/Sidebar/Sidebar.module.css',
    'app_css': ROOT / 'frontend/src/pages/App/AppPage.module.css',
    'landing': ROOT / 'frontend/src/pages/Landing/Landing.tsx',
    'docs': ROOT / 'frontend/src/pages/Docs/DocsPage.tsx',
    'index': ROOT / 'frontend/index.html',
    'package': ROOT / 'frontend/package.json',
    'api_mod': ROOT / 'api/go.mod',
    'sandbox_mod': ROOT / 'sandbox/golang/go.mod',
    'compose': ROOT / 'docker-compose.yml',
    'theme': ROOT / 'frontend/src/hooks/useTheme.tsx',
    'readme': ROOT / 'README.md',
}
text = {name: path.read_text() for name, path in files.items()}
failures: list[str] = []

def require(condition: bool, message: str) -> None:
    if not condition:
        failures.append(message)

# User-facing branding and package/module identity.
require('AlgoWeave' in text['sidebar'] and 'AlgoWeave' in text['landing'], 'AlgoWeave branding missing from primary UI')
require('AlgoWeave' in text['docs'] and text['readme'].startswith('# AlgoWeave'), 'Docs/README still use the old project identity')
require('<title>AlgoWeave' in text['index'], 'browser title was not renamed')
require('"name": "algoweave-frontend"' in text['package'], 'frontend package was not renamed')
require(text['api_mod'].startswith('module algoweave/api'), 'API Go module was not renamed')
require(text['sandbox_mod'].startswith('module algoweave/sandbox/golang'), 'Go sandbox module was not renamed')
require('id="algoweave-navigation"' in text['sidebar'] and 'aria-controls="algoweave-navigation"' in text['sidebar'], 'navigation accessibility ids were not renamed')
require('algoweave-sandbox-go' in text['compose'] and 'algoweave-frontend' in text['compose'], 'container display names were not renamed')

# Preserve theme preference while migrating the storage identity.
require("const STORAGE_KEY = 'algoweave-theme'" in text['theme'], 'new AlgoWeave theme key missing')
require("const LEGACY_STORAGE_KEY = 'algo-visualizer-theme'" in text['theme'], 'legacy theme preference migration missing')

# The old visual brand should be completely gone. Compatibility-only internal
# identifiers such as the legacy PostgreSQL database name are intentionally not
# part of this check.
for path in ROOT.rglob('*'):
    if not path.is_file() or path == Path(__file__) or any(part in {'.git', 'node_modules', 'UI mockup files'} for part in path.parts):
        continue
    try:
        value = path.read_text()
    except UnicodeDecodeError:
        continue
    if 'AlgoLens' in value or 'algolens-navigation' in value:
        failures.append(f'old AlgoLens branding remains in {path.relative_to(ROOT)}')
        break

# Responsive breakpoint contract. App shell and navigation MUST switch at the
# same width. This guards the exact v16 bug where shell stacking and sidebar
# drawer behavior used different breakpoints.
require('@media (max-width: 1120px)' in text['sidebar_css'], 'sidebar drawer breakpoint is not 1120px')
require('@media (max-width: 1120px)' in text['app_css'], 'app stacked-layout breakpoint is not 1120px')
require('@media (min-width: 1121px) and (max-width: 1440px)' in text['sidebar_css'], 'compact docked-sidebar range missing')
require('@media (min-width: 1121px) and (max-width: 1440px)' in text['app_css'], 'compact desktop workspace range missing')
require('flex-direction: column;' in text['app_css'].split('@media (max-width: 1120px)', 1)[1], 'tablet/mobile shell does not stack under the mobile bar')
require('position: fixed;' in text['sidebar_css'].split('@media (max-width: 1120px)', 1)[1], 'tablet/mobile sidebar is not off-canvas')
require('height: 100dvh;' in text['app_css'] and 'overflow: hidden;' in text['app_css'], 'viewport shell is not bounded')
require('overflow-y: auto;' in text['app_css'], 'lesson workspace has no owned scroll region')
require('@media (max-width: 960px)' not in text['sidebar_css'], 'obsolete 960px sidebar breakpoint can recreate an intermediate dead zone')
require('@media (min-width: 641px) and (max-width: 1180px)' not in text['app_css'], 'obsolete 641–1180 shell breakpoint remains')

if failures:
    print('AlgoWeave v17 verification FAILED')
    for failure in failures:
        print('  -', failure)
    sys.exit(1)

print('PASS AlgoLens user-facing branding renamed to AlgoWeave')
print('PASS frontend package + Go modules + container display names use AlgoWeave identity')
print('PASS existing theme preference migrates to algoweave-theme')
print('PASS AppPage and Sidebar share the same 1120px navigation/layout breakpoint')
print('PASS compact 1121–1440px laptop layout is explicitly defined')
print('PASS tablet/mobile navigation is off-canvas and only lesson content owns overflow')
