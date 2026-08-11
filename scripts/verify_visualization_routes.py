#!/usr/bin/env python3
"""Verify every seeded Python lesson resolves to a meaningful Story-mode renderer.

This catches the regression where algorithms executed correctly but fell into the
same generic four-stage Story visualization because their trace did not match the
configured render type.
"""

from __future__ import annotations

import ast
import json
import re
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SEED = ROOT / "catalog" / "seeds" / "algorithms.sql"
TRACER = ROOT / "sandbox" / "python" / "tracer.py"
CONCEPT_VIZ = ROOT / "frontend" / "src" / "components" / "Visualization" / "ConceptViz.tsx"
FRONTEND_SRC = ROOT / "frontend" / "src"

SOLUTION_RE = re.compile(
    r"\(\(SELECT id FROM templates WHERE name = '((?:''|[^'])+)'\), 'python', \$code\$(.*?)\$code\$\)",
    re.S,
)

LINKED = {"Reverse a Linked List", "Cycle Detection (Floyd's)", "Merge Two Sorted Lists"}
TREES = {
    "Inorder / Preorder / Postorder Traversal", "Level-Order (BFS) Traversal",
    "BST Insert / Delete / Search", "AVL Tree Rotations", "Trie Insert / Search",
    "Lowest Common Ancestor",
}
GRAPHS = {
    "Breadth-First Search", "Depth-First Search", "Dijkstra's Shortest Path",
    "Bellman-Ford", "Floyd-Warshall", "A* Search", "Topological Sort",
    "Kruskal's MST", "Prim's MST", "Union-Find / Disjoint Set",
}


def concept_names() -> set[str]:
    text = CONCEPT_VIZ.read_text()
    match = re.search(r"const CONCEPT_NAMES = new Set\(\[(.*?)\]\)", text, re.S)
    if not match:
        raise RuntimeError("CONCEPT_NAMES was not found")
    literals = re.findall(r"'(?:\\.|[^'\\])*'|\"(?:\\.|[^\"\\])*\"", match.group(1))
    return {ast.literal_eval(token) for token in literals}


def main() -> int:
    sql = SEED.read_text()
    lessons = [(name.replace("''", "'"), code) for name, code in SOLUTION_RE.findall(sql)]
    concepts = concept_names()
    seeded_names = {name for name, _ in lessons}

    unknown = concepts - seeded_names
    if unknown:
        print("Concept renderer names not present in seed catalog:")
        for name in sorted(unknown):
            print(f"  - {name}")
        return 1

    generic: list[str] = []
    modes: Counter[str] = Counter()

    def trace_lesson(item: tuple[str, str]) -> tuple[str, list[dict], str | None]:
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
                return name, [], str(payload.get("error"))
            return name, payload["steps"], None
        except Exception as exc:  # noqa: BLE001
            return name, [], str(exc)

    with ThreadPoolExecutor(max_workers=4) as executor:
        traced = list(executor.map(trace_lesson, lessons))

    for index, (name, steps, error) in enumerate(traced, 1):
        if error is not None:
            print(f"FAIL {name}: {error}")
            return 1
        has_array = any(isinstance(step.get("array"), list) and step.get("array") for step in steps)
        has_network = any(step.get("nodes") or step.get("edges") for step in steps)
        has_list = any(step.get("type") == "list_init" or step.get("lists") for step in steps)
        has_grid = any(step.get("type") == "grid_init" and step.get("grid") for step in steps)

        if name in {"Dijkstra's Shortest Path", "A* Search"}:
            mode = "pathfinding-grid" if has_grid else "generic"
        elif name in concepts:
            mode = "concept-specific"
        elif name in LINKED:
            mode = "linked-list" if has_list else "generic"
        elif name in GRAPHS or name in TREES:
            mode = "network" if has_network else "generic"
        else:
            mode = "array" if has_array else "generic"

        modes[mode] += 1
        if mode == "generic":
            generic.append(name)
        print(f"[{index:02d}/{len(lessons)}] {name:<38} -> {mode}")

    mock_refs: list[str] = []
    patterns = ("UI mockup files", "pathfinding-grid.html", "real-life-scenario-mode.html", "algo-playground.html")
    for path in FRONTEND_SRC.rglob("*"):
        if not path.is_file():
            continue
        try:
            text = path.read_text()
        except UnicodeDecodeError:
            continue
        if any(pattern in text for pattern in patterns):
            mock_refs.append(str(path.relative_to(ROOT)))

    print("\nStory renderer summary")
    for mode, count in modes.most_common():
        print(f"  {mode:<18} {count}")
    print(f"  generic fallbacks   {len(generic)}")
    print(f"  mock runtime refs   {len(mock_refs)}")

    if generic:
        print("\nGeneric fallbacks still present:")
        for name in generic:
            print(f"  - {name}")
    if mock_refs:
        print("\nFrontend runtime references mock HTML:")
        for path in mock_refs:
            print(f"  - {path}")

    return 1 if generic or mock_refs else 0


if __name__ == "__main__":
    raise SystemExit(main())
