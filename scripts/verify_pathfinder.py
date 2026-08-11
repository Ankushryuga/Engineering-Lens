#!/usr/bin/env python3
"""Fast regression check for the v7 weighted-grid pathfinding lessons."""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SEED = ROOT / "catalog" / "seeds" / "algorithms.sql"
TRACER = ROOT / "sandbox" / "python" / "tracer.py"
FRONTEND = ROOT / "frontend" / "src"
SOLUTION_RE = re.compile(
    r"\(\(SELECT id FROM templates WHERE name = '((?:''|[^'])+)'\), 'python', \$code\$(.*?)\$code\$\)",
    re.S,
)


def main() -> int:
    solutions = {
        name.replace("''", "'"): code
        for name, code in SOLUTION_RE.findall(SEED.read_text())
    }

    for name in ("Dijkstra's Shortest Path", "A* Search"):
        proc = subprocess.run(
            [sys.executable, str(TRACER)],
            input=solutions[name],
            text=True,
            capture_output=True,
            timeout=25,
            check=False,
        )
        payload = json.loads(proc.stdout.strip().splitlines()[-1])
        assert payload.get("ok"), payload.get("error")
        steps = payload["steps"]
        init = steps[0]
        assert init["type"] == "grid_init"
        assert len(init["grid"]) == 15 and len(init["grid"][0]) == 26
        assert init["start_cell"] == [7, 2]
        assert init["goal_cell"] == [7, 23]
        assert any(step["type"] == "visit" and step.get("cell") for step in steps)
        assert any(step["type"] == "relax" and step.get("to_cell") for step in steps)
        path_steps = [step for step in steps if step["type"] == "path"]
        assert len(path_steps) > 2
        final = steps[-1]
        assert final["type"] == "done"
        assert final["grid_path"][0] == [7, 2]
        assert final["grid_path"][-1] == [7, 23]
        print(f"PASS {name}: {len(steps)} steps, {len(path_steps)} walking-route steps")

    forbidden = ("pathfinding-grid.html", "UI mockup files")
    refs: list[str] = []
    for path in FRONTEND.rglob("*"):
        if not path.is_file():
            continue
        try:
            text = path.read_text()
        except UnicodeDecodeError:
            continue
        if any(term in text for term in forbidden):
            refs.append(str(path.relative_to(ROOT)))
    assert not refs, f"mock runtime references found: {refs}"
    print("PASS frontend has no runtime dependency on the disposable mock HTML")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
