#!/usr/bin/env python3
"""Regression checks for the Python+Go runtime contract.

This intentionally exercises the same Go source transformation used by the
worker without requiring Kafka/Docker. It needs a local Go toolchain.
"""
from __future__ import annotations

import json
import os
import pathlib
import re
import shutil
import subprocess
import tempfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
MIGRATION = ROOT / "catalog/migrations/013_python_go_catalog.sql"
INSTRUMENT = ROOT / "sandbox/golang/instrument.go"

HELPER = r'''package main
import (
 "io"
 "os"
 "regexp"
 "strings"
)
var (
 importBlockRe2  = regexp.MustCompile(`(?s)import\s*\(([^)]*)\)`)
 singleImportRe2 = regexp.MustCompile(`import\s+"([^"]+)"`)
 packageLineRe2  = regexp.MustCompile(`(?m)^package\s+main\s*$`)
)
func assembleSource2(userCode string) string {
 instrumented, _ := instrument(userCode)
 code := instrumented
 if importBlockRe2.MatchString(code) {
  code = importBlockRe2.ReplaceAllStringFunc(code, func(block string) string {
   inner := importBlockRe2.FindStringSubmatch(block)[1]
   if !strings.Contains(inner, `"encoding/json"`) { inner = `"encoding/json"` + "\n" + inner }
   if !strings.Contains(inner, `"fmt"`) { inner = `"fmt"` + "\n" + inner }
   return "import (" + inner + ")"
  })
 } else if singleImportRe2.MatchString(code) {
  code = singleImportRe2.ReplaceAllStringFunc(code, func(stmt string) string {
   pkg := singleImportRe2.FindStringSubmatch(stmt)[1]
   imports := []string{"\""+pkg+"\""}
   if pkg != "encoding/json" { imports=append(imports,"\"encoding/json\"") }
   if pkg != "fmt" { imports=append(imports,"\"fmt\"") }
   return "import (\n\t"+strings.Join(imports,"\n\t")+"\n)"
  })
 } else { code = packageLineRe2.ReplaceAllString(code, "package main\n\nimport (\n\t\"encoding/json\"\n\t\"fmt\"\n)") }
 return code + "\n" + runtimePrelude
}
func main(){ b,_:=io.ReadAll(os.Stdin); io.WriteString(os.Stdout, assembleSource2(string(b))) }
'''


def check_static_contract() -> None:
    app = (ROOT / "frontend/src/pages/App/AppPage.tsx").read_text()
    server = (ROOT / "api/cmd/server/main.go").read_text()
    handler = (ROOT / "api/internal/handlers/visualize.go").read_text()
    worker = (ROOT / "sandbox/golang/worker.go").read_text()
    compose = (ROOT / "docker-compose.yml").read_text()

    assert "Array.isArray(result.steps) ? result.steps : []" in app
    assert "result.Steps == nil" in server
    assert 'const traceCacheVersion = "trace-v2"' in handler
    assert 'if result.Error != ""' in server and 'cacheHash = ""' in server
    assert 'return Result{Steps: []Step{}, Error: message' in worker
    assert 'GOTELEMETRY=off' in worker
    assert 'exec.CommandContext(ctx, "go", "build", "-trimpath", "-o", binaryPath, mainPath)' in worker
    assert 'exec.CommandContext(ctx, binaryPath)' in worker
    assert 'exec.CommandContext(ctx, "go", "run"' not in worker
    assert 'verifyExecutableWorkspace()' in worker
    assert '/tmp:rw,noexec' in compose
    assert '/go-exec:rw,exec' in compose
    assert 'uid=10001,gid=10001' in compose
    assert 'mem_limit: 512m' in compose and 'pids_limit: 128' in compose
    assert 'algoweave-sandbox-javascript' not in compose
    assert 'algoweave-sandbox-java' not in compose
    assert 'algoweave-sandbox-cpp' not in compose
    print("PASS null/error results cannot crash the visualization UI")
    print("PASS failed executions are not reused as code-cache hits")
    print("PASS Go sandbox uses a dedicated executable tmpfs and keeps /tmp noexec")


def check_instrumented_catalog() -> None:
    if shutil.which("go") is None:
        raise SystemExit("Go toolchain not found; static checks passed but instrumented catalog check was skipped")

    sql = MIGRATION.read_text()
    rows = re.findall(
        r"SELECT id, 'go', \$go\$(.*?)\$go\$ FROM templates WHERE name = (.*?)\nON CONFLICT",
        sql,
        flags=re.S,
    )
    assert len(rows) == 55, len(rows)

    env = dict(os.environ)
    env.update({"GO111MODULE": "off", "GOTOOLCHAIN": "local", "CGO_ENABLED": "0", "GOMAXPROCS": "1"})

    with tempfile.TemporaryDirectory(prefix="algoweave-go-verify-") as td:
        tmp = pathlib.Path(td)
        instrument_copy = tmp / "instrument.go"
        helper = tmp / "helper.go"
        cli = tmp / "instrument-cli"
        instrument_copy.write_text(INSTRUMENT.read_text())
        helper.write_text(HELPER)
        subprocess.run(["go", "build", "-o", str(cli), str(instrument_copy), str(helper)], check=True, env=env, timeout=30)

        shortest = 10**9
        for index, (code, name_expr) in enumerate(rows, 1):
            transformed = subprocess.run([str(cli)], input=code, text=True, capture_output=True, check=True, timeout=5).stdout
            main_go = tmp / "main.go"
            main_go.write_text(transformed)
            run_env = dict(env)
            run_env["GOCACHE"] = str(tmp / "gocache")
            result = subprocess.run(["go", "run", str(main_go)], text=True, capture_output=True, env=run_env, timeout=15)
            if result.returncode != 0:
                raise AssertionError(f"{name_expr}: {result.stderr.strip()}")
            marker = "__STEPS_JSON__"
            if marker not in result.stdout:
                raise AssertionError(f"{name_expr}: missing tracer marker")
            steps = json.loads(result.stdout.rsplit(marker, 1)[1].splitlines()[0])
            if not steps or steps[-1].get("type") != "done":
                raise AssertionError(f"{name_expr}: invalid terminal trace")
            if len(steps) < 2:
                raise AssertionError(f"{name_expr}: trace has only {len(steps)} step")
            shortest = min(shortest, len(steps))
            if index in (1, 10, 20, 30, 40, 50, 55):
                print(f"[{index:02}/55] PASS {name_expr} — {len(steps)} steps")

    print(f"PASS all 55 Go references execute after real source instrumentation (minimum {shortest} steps)")


if __name__ == "__main__":
    check_static_contract()
    check_instrumented_catalog()
