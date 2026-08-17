#!/usr/bin/env python3
"""Verify pathfinder math, final-state UI semantics, and mobile navigation contracts."""

from __future__ import annotations

import heapq
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SEED = ROOT / "catalog/seeds/algorithms.sql"
TRACER = ROOT / "sandbox/python/tracer.py"
GRID_VIZ = ROOT / "frontend/src/components/Visualization/PathfindingGridViz.tsx"
GRID_CSS = ROOT / "frontend/src/components/Visualization/PathfindingGridViz.module.css"
SIDEBAR = ROOT / "frontend/src/components/Sidebar/Sidebar.tsx"
SIDEBAR_CSS = ROOT / "frontend/src/components/Sidebar/Sidebar.module.css"
APP_CSS = ROOT / "frontend/src/pages/App/AppPage.module.css"
SOLUTION_RE = re.compile(
    r"\(\(SELECT id FROM templates WHERE name = '((?:''|[^'])+)'\), 'python', \$code\$(.*?)\$code\$\)",
    re.S,
)


def shortest_cost(grid: list[list[int]], start: tuple[int, int], goal: tuple[int, int]) -> int:
    rows, cols = len(grid), len(grid[0])
    dist = {start: 0}
    queue = [(0, start)]
    settled: set[tuple[int, int]] = set()
    while queue:
        cost, cell = heapq.heappop(queue)
        if cell in settled:
            continue
        settled.add(cell)
        if cell == goal:
            return cost
        r, c = cell
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nr, nc = r + dr, c + dc
            if not (0 <= nr < rows and 0 <= nc < cols) or grid[nr][nc] < 0:
                continue
            neighbor = (nr, nc)
            next_cost = cost + grid[nr][nc]
            if next_cost < dist.get(neighbor, 10**18):
                dist[neighbor] = next_cost
                heapq.heappush(queue, (next_cost, neighbor))
    raise AssertionError("goal is unreachable")


def trace(name: str, code: str) -> list[dict]:
    proc = subprocess.run(
        [sys.executable, str(TRACER)],
        input=code,
        text=True,
        capture_output=True,
        timeout=30,
        check=False,
    )
    payload = json.loads(proc.stdout.strip().splitlines()[-1])
    assert payload.get("ok"), f"{name}: {payload.get('error')}"
    return payload["steps"]


def verify_path(name: str, steps: list[dict]) -> None:
    init = next(step for step in steps if step.get("type") == "grid_init")
    final = steps[-1]
    grid = init["grid"]
    start = tuple(init["start_cell"])
    goal = tuple(init["goal_cell"])
    path = [tuple(cell) for cell in final["grid_path"]]

    assert path[0] == start and path[-1] == goal
    for previous, current in zip(path, path[1:]):
        assert abs(previous[0] - current[0]) + abs(previous[1] - current[1]) == 1, (
            name,
            "non-adjacent path cells",
            previous,
            current,
        )
        assert grid[current[0]][current[1]] >= 0, (name, "path crosses a building", current)

    path_cost = sum(grid[r][c] for r, c in path[1:])
    optimum = shortest_cost(grid, start, goal)
    assert path_cost == optimum, (name, "non-optimal route", path_cost, optimum)
    print(f"PASS {name}: optimal weighted cost {optimum}, {len(path) - 1} blocks")


def require(text: str, needle: str, label: str) -> None:
    assert needle in text, f"missing {label}: {needle}"


def main() -> int:
    solutions = {
        name.replace("''", "'"): code
        for name, code in SOLUTION_RE.findall(SEED.read_text())
    }
    for name in ("Dijkstra's Shortest Path", "A* Search"):
        verify_path(name, trace(name, solutions[name]))

    grid_viz = GRID_VIZ.read_text()
    grid_css = GRID_CSS.read_text()
    sidebar = SIDEBAR.read_text()
    sidebar_css = SIDEBAR_CSS.read_text()
    app_css = APP_CSS.read_text()

    require(grid_viz, "const routePhase", "route/final phase detection")
    require(grid_viz, "Weighted cost", "separate weighted-cost stat")
    require(grid_viz, "styles.visitedFaded", "faded explored cells during route phase")
    require(grid_viz, "!routePhase && state.frontier.has", "frontier hidden after route confirmation")
    require(grid_viz, "styles.courierAtGoal", "goal remains visible beneath courier")
    require(grid_viz, "Why this route wins", "student-facing final route explanation")
    require(grid_css, ".visitedFaded", "route-focus CSS")

    require(sidebar, "mobileOpen", "mobile navigation state")
    require(sidebar, "aria-controls=\"engineering-lens-navigation\"", "accessible mobile menu trigger")
    require(sidebar, "styles.sidebarOpen", "drawer open state")
    require(sidebar, "styles.backdropOpen", "drawer backdrop")
    require(sidebar_css, "@media (max-width: 1120px)", "mobile/tablet navigation breakpoint")
    require(sidebar_css, "position: fixed", "off-canvas navigation drawer")
    require(sidebar_css, "min-height: 100dvh", "dynamic viewport-height drawer")
    require(sidebar_css, "width: min(86vw, 320px)", "dynamic drawer width")
    require(app_css, '@media (max-width: 1120px)', 'shared tablet/mobile layout breakpoint')
    require(app_css, 'min-height: 100dvh;', 'viewport-locked stacked shell')
    require(app_css, "clamp(430px, 76svh, 590px)", "dynamic phone visualization height")

    print("PASS final path presentation separates result from exploration noise")
    print("PASS mobile/tablet navigation remains reachable through an off-canvas drawer")
    print("PASS workspace stays viewport-locked while panel sizes adapt with dvh/svh + clamp()")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
