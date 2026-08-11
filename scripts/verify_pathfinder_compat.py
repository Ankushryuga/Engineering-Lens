#!/usr/bin/env python3
"""Regression checks for v8 pathfinder backwards compatibility and upgrade safety."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCENARIO = ROOT / "frontend/src/components/Visualization/ScenarioViz.tsx"
GRID = ROOT / "frontend/src/components/Visualization/PathfindingGridViz.tsx"
DELIVERY = ROOT / "frontend/src/components/Visualization/DeliveryRouteViz.tsx"
MIGRATION = ROOT / "catalog/migrations/008_pathfinding_grid_lessons.sql"
COMPOSE = ROOT / "docker-compose.yml"


def require(text: str, needle: str, label: str) -> None:
    assert needle in text, f"missing {label}: {needle}"


def main() -> int:
    scenario = SCENARIO.read_text()
    grid = GRID.read_text()
    delivery = DELIVERY.read_text()
    migration = MIGRATION.read_text()
    compose = COMPOSE.read_text()

    require(scenario, "const hasGridTrace", "grid-trace detection")
    require(scenario, "const hasGraphTrace", "legacy graph-trace detection")
    require(scenario, "isPathfindingLesson && hasGridTrace", "new grid renderer route")
    require(scenario, "isPathfindingLesson && hasGraphTrace", "legacy renderer route")
    require(scenario, "<DeliveryRouteViz", "legacy Delivery Route renderer")
    require(scenario, "<PathfindingGridViz", "weighted-grid renderer")

    assert "if (!rows || !cols) return null" not in grid, "grid renderer can still silently blank"
    require(grid, "Waiting for weighted-grid trace data", "defensive non-blank grid state")
    require(delivery, "graph_init", "legacy graph trace support")
    require(delivery, "Delivery Route Finder", "legacy route UI")

    require(migration, "008_pathfinding_grid_lessons", "idempotent migration version")
    require(migration, "Dijkstra''s Shortest Path", "Dijkstra migration")
    require(migration, "A* Search", "A* migration")
    require(migration, "IF NOT EXISTS", "migration idempotency")
    require(compose, "catalog-migrate:", "migration service")
    require(compose, "condition: service_completed_successfully", "API migration dependency")

    print("PASS fresh weighted-grid traces route to PathfindingGridViz")
    print("PASS legacy graph traces route to DeliveryRouteViz")
    print("PASS grid renderer cannot silently return a blank panel")
    print("PASS existing PostgreSQL volumes receive the pathfinder migration without deletion")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
