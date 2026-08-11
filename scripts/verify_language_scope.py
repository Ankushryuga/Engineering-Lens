#!/usr/bin/env python3
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
SEED = (ROOT / 'catalog/seeds/algorithms.sql').read_text()
MIGRATION = (ROOT / 'catalog/migrations/013_python_go_catalog.sql').read_text()
TYPES = (ROOT / 'frontend/src/types/index.ts').read_text()
MODELS = (ROOT / 'api/internal/models/models.go').read_text()
COMPOSE = (ROOT / 'docker-compose.yml').read_text()
SCHEMA = (ROOT / 'catalog/schema.sql').read_text()

failures: list[str] = []

def require(condition: bool, message: str) -> None:
    if not condition:
        failures.append(message)

# Canonical template names.
names: list[str] = []
for match in re.finditer(r"\('((?:[^']|'')+)',\s*'([^']+)',\s*'(?:Fundamental|Intermediate|Advanced)'", SEED):
    name = match.group(1).replace("''", "'")
    if name not in names:
        names.append(name)
require(len(names) == 55, f'expected 55 templates, found {len(names)}')

# Both languages must be represented for every template in the seed/migration.
python_names = {
    n.replace("''", "'")
    for n in re.findall(r"WHERE name = '((?:''|[^'])+)'\), 'python'", SEED)
}
go_names = {
    n.replace("''", "'")
    for n in re.findall(r"FROM templates WHERE name = '((?:''|[^'])+)'", MIGRATION)
}
# Python seed uses SELECT id FROM templates WHERE name syntax; fallback parser above.
if len(python_names) != 55:
    python_names = {
        n.replace("''", "'")
        for n in re.findall(r"SELECT id FROM templates WHERE name = '((?:''|[^'])+)'\), 'python'", SEED)
    }
require(set(names) == python_names, f'Python coverage mismatch: missing={sorted(set(names)-python_names)}')
require(set(names) == go_names, f'Go coverage mismatch: missing={sorted(set(names)-go_names)}')

require("export type Language = 'python' | 'go'" in TYPES, 'frontend language union is not Python + Go only')
for removed in ('javascript', "'java'", "'cpp'"):
    require(removed not in TYPES, f'frontend still exposes removed language token {removed}')
require('LangPython' in MODELS and 'LangGo' in MODELS, 'API Python/Go constants are missing')
require('LangJavaScript' not in MODELS and 'LangJava' not in MODELS and 'LangCpp' not in MODELS, 'API still accepts a removed language')
require("CHECK (language IN ('python', 'go'))" in SCHEMA, 'catalog schema language constraint is not Python + Go only')
require('sandbox-python:' in COMPOSE and 'sandbox-go:' in COMPOSE, 'Compose is missing Python or Go worker')
for removed_service in ('sandbox-javascript:', 'sandbox-java:', 'sandbox-cpp:'):
    require(removed_service not in COMPOSE, f'Compose still contains {removed_service[:-1]}')

# Compile all migration Go sources when a local Go toolchain is available.
go_blocks = re.findall(r"\$go\$(.*?)\$go\$ FROM templates WHERE name = '((?:''|[^'])+)'", MIGRATION, re.S)
require(len(go_blocks) == 55, f'expected 55 Go source blocks, found {len(go_blocks)}')
if shutil.which('go') and not failures:
    with tempfile.TemporaryDirectory(prefix='algoweave-go-catalog-') as td:
        td_path = Path(td)
        for index, (code, sql_name) in enumerate(go_blocks, 1):
            name = sql_name.replace("''", "'")
            source = td_path / 'main.go'
            source.write_text(code)
            result = subprocess.run(['go', 'run', source.name], cwd=td_path, text=True, capture_output=True)
            if result.returncode != 0:
                failures.append(f'Go reference does not compile for {name}: {result.stderr.strip()}')
                break

if failures:
    print('Language-scope verification FAILED')
    for failure in failures:
        print(f'  - {failure}')
    sys.exit(1)

print('PASS product exposes Python + Go only')
print('PASS Compose builds only Python + Go sandbox workers')
print('PASS catalog schema accepts only Python + Go')
print('PASS all 55 guided algorithms have Python reference solutions')
print('PASS all 55 guided algorithms have Go reference solutions')
if shutil.which('go'):
    print('PASS all 55 canonical Go references compile with the local Go toolchain')
else:
    print('SKIP Go compile check: local Go toolchain not installed')
