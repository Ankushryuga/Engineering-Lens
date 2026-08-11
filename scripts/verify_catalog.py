#!/usr/bin/env python3
"""Smoke-test every seeded Python lesson through the same tracer used by the sandbox."""

from __future__ import annotations

import json
import re
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SEED = ROOT / "catalog" / "seeds" / "algorithms.sql"
TRACER = ROOT / "sandbox" / "python" / "tracer.py"
SOLUTION_RE = re.compile(
    r"\(\(SELECT id FROM templates WHERE name = '((?:''|[^'])+)'\), 'python', \$code\$(.*?)\$code\$\)",
    re.S,
)


def main() -> int:
    sql = SEED.read_text()
    lessons = [(name.replace("''", "'"), code) for name, code in SOLUTION_RE.findall(sql)]
    failures: list[tuple[str, str]] = []
    structured = 0

    def check_lesson(item: tuple[str, str]) -> tuple[str, int, str, str | None]:
        name, code = item
        try:
            proc = subprocess.run(
                [sys.executable, str(TRACER)],
                input=code,
                text=True,
                capture_output=True,
                timeout=30,
                check=False,
            )
            payload = json.loads(proc.stdout.strip().splitlines()[-1])
            if not payload.get("ok"):
                raise RuntimeError(payload.get("error", "unknown tracer error"))
            steps = payload.get("steps", [])
            has_structure = any(
                step.get("array") is not None
                or step.get("nodes")
                or step.get("edges")
                or step.get("lists")
                or step.get("grid")
                for step in steps
            )
            terminal = steps[-1].get("type") if steps else "none"
            if terminal != "done" or not steps:
                raise RuntimeError(f"invalid terminal state: {terminal}")
            return name, len(steps), "structured" if has_structure else "learning timeline", None
        except Exception as exc:  # noqa: BLE001
            return name, 0, "", str(exc)

    print(f"Checking {len(lessons)} seeded Python lessons...\n")
    with ThreadPoolExecutor(max_workers=4) as executor:
        results = list(executor.map(check_lesson, lessons))

    for index, (name, step_count, mode, error) in enumerate(results, 1):
        if error is not None:
            failures.append((name, error))
            print(f"[{index:02d}/{len(lessons)}] FAIL  {name}: {error}")
            continue
        structured += int(mode == "structured")
        print(f"[{index:02d}/{len(lessons)}] PASS  {name:<38} {step_count:>4} steps  {mode}")

    print("\nSummary")
    print(f"  lessons:          {len(lessons)}")
    print(f"  passed:           {len(lessons) - len(failures)}")
    print(f"  structured trace: {structured}")
    print(f"  timeline fallback:{len(lessons) - structured}")

    if failures:
        print("\nFailures:")
        for name, error in failures:
            print(f"  - {name}: {error}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
