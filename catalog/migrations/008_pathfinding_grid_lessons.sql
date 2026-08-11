-- v8: upgrade existing persistent catalogs to the weighted-grid pathfinder lessons.
-- Safe to run on every startup: the body runs once and records its version.
CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $migration$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM schema_migrations WHERE version = '008_pathfinding_grid_lessons') THEN
        UPDATE template_solutions
        SET code = $dijkstra$import heapq

ROWS, COLS = 15, 26
START = (7, 2)
GOAL = (7, 23)

# A deterministic weighted city grid for the lesson.
# -1 = building (blocked), 1 = clear street, 2..5 = increasing traffic cost.
def build_city():
    grid = [[1 for _ in range(COLS)] for _ in range(ROWS)]

    buildings = {
        (1,5),(1,6),(1,7),(2,6),(2,7),
        (3,11),(3,12),(4,11),(4,12),(5,12),
        (8,5),(8,6),(9,5),(10,5),(10,6),
        (9,15),(9,16),(10,15),(10,16),(11,16),
        (3,19),(4,19),(4,20),(5,20),
        (11,21),(11,22),(12,21),(12,22),
    }
    for r, c in buildings:
        grid[r][c] = -1

    traffic_patches = [
        (range(5, 9), range(8, 11), 3),
        (range(1, 5), range(14, 17), 4),
        (range(8, 13), range(18, 20), 5),
        (range(10, 14), range(9, 12), 2),
    ]
    for rows, cols, weight in traffic_patches:
        for r in rows:
            for c in cols:
                if grid[r][c] != -1:
                    grid[r][c] = weight

    grid[START[0]][START[1]] = 1
    grid[GOAL[0]][GOAL[1]] = 1
    return grid


def neighbors(grid, r, c):
    for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
        nr, nc = r + dr, c + dc
        if 0 <= nr < ROWS and 0 <= nc < COLS and grid[nr][nc] != -1:
            yield nr, nc


def dijkstra_grid(grid, start, goal):
    record_step({
        "type": "grid_init",
        "grid": grid,
        "start_cell": start,
        "goal_cell": goal,
        "info": "Delivery grid ready — clear streets cost 1, darker traffic costs more, buildings are blocked.",
    })

    dist = {start: 0}
    prev = {}
    pq = [(0, start)]
    settled = set()

    while pq:
        cost, cell = heapq.heappop(pq)
        if cell in settled:
            continue
        settled.add(cell)
        r, c = cell
        record_step({
            "type": "visit",
            "cell": cell,
            "info": f"Courier checks block ({r}, {c}); best known travel cost is {cost}.",
        })

        if cell == goal:
            break

        for nr, nc in neighbors(grid, r, c):
            neighbor = (nr, nc)
            new_cost = cost + grid[nr][nc]
            if new_cost < dist.get(neighbor, float('inf')):
                dist[neighbor] = new_cost
                prev[neighbor] = cell
                heapq.heappush(pq, (new_cost, neighbor))
                record_step({
                    "type": "relax",
                    "from_cell": cell,
                    "to_cell": neighbor,
                    "cell_cost": grid[nr][nc],
                    "info": f"A cheaper way reaches ({nr}, {nc}); route cost becomes {new_cost}.",
                })

    path = []
    current = goal
    if current == start or current in prev:
        while True:
            path.append(current)
            if current == start:
                break
            current = prev[current]
        path.reverse()

    for index, path_cell in enumerate(path):
        record_step({
            "type": "path",
            "cell": path_cell,
            "grid_path": path[:index + 1],
            "info": f"Courier follows the confirmed route through block {path_cell} ({index + 1}/{len(path)}).",
        })
    record_step({"type": "done", "cell": goal, "grid_path": path, "info": f"Dijkstra delivery route complete — weighted cost {dist.get(goal, 'unreachable')}."})
    return path, dist.get(goal)

city = build_city()
result = dijkstra_grid(city, START, GOAL)
$dijkstra$
        WHERE template_id = (SELECT id FROM templates WHERE name = 'Dijkstra''s Shortest Path')
          AND language = 'python';

        UPDATE template_solutions
        SET code = $astar$import heapq

ROWS, COLS = 15, 26
START = (7, 2)
GOAL = (7, 23)


def build_city():
    grid = [[1 for _ in range(COLS)] for _ in range(ROWS)]
    buildings = {
        (1,5),(1,6),(1,7),(2,6),(2,7),
        (3,11),(3,12),(4,11),(4,12),(5,12),
        (8,5),(8,6),(9,5),(10,5),(10,6),
        (9,15),(9,16),(10,15),(10,16),(11,16),
        (3,19),(4,19),(4,20),(5,20),
        (11,21),(11,22),(12,21),(12,22),
    }
    for r, c in buildings:
        grid[r][c] = -1

    traffic_patches = [
        (range(5, 9), range(8, 11), 3),
        (range(1, 5), range(14, 17), 4),
        (range(8, 13), range(18, 20), 5),
        (range(10, 14), range(9, 12), 2),
    ]
    for rows, cols, weight in traffic_patches:
        for r in rows:
            for c in cols:
                if grid[r][c] != -1:
                    grid[r][c] = weight
    return grid


def heuristic(cell, goal):
    return abs(cell[0] - goal[0]) + abs(cell[1] - goal[1])


def neighbors(grid, r, c):
    for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
        nr, nc = r + dr, c + dc
        if 0 <= nr < ROWS and 0 <= nc < COLS and grid[nr][nc] != -1:
            yield nr, nc


def a_star(grid, start, goal):
    record_step({
        "type": "grid_init",
        "grid": grid,
        "start_cell": start,
        "goal_cell": goal,
        "info": "A* delivery grid ready — the heuristic points the courier toward the customer while traffic still affects cost.",
    })

    g_score = {start: 0}
    came_from = {}
    open_set = [(heuristic(start, goal), 0, start)]
    closed = set()

    while open_set:
        _, current_cost, current = heapq.heappop(open_set)
        if current in closed:
            continue
        closed.add(current)
        r, c = current
        record_step({
            "type": "visit",
            "cell": current,
            "info": f"A* explores ({r}, {c}); cost so far {current_cost}, estimate to customer {heuristic(current, goal)}.",
        })

        if current == goal:
            break

        for nr, nc in neighbors(grid, r, c):
            neighbor = (nr, nc)
            tentative = current_cost + grid[nr][nc]
            if tentative < g_score.get(neighbor, float('inf')):
                came_from[neighbor] = current
                g_score[neighbor] = tentative
                priority = tentative + heuristic(neighbor, goal)
                heapq.heappush(open_set, (priority, tentative, neighbor))
                record_step({
                    "type": "relax",
                    "from_cell": current,
                    "to_cell": neighbor,
                    "cell_cost": grid[nr][nc],
                    "info": f"A* adds ({nr}, {nc}) to the frontier with score {priority}.",
                })

    path = []
    current = goal
    if current == start or current in came_from:
        while True:
            path.append(current)
            if current == start:
                break
            current = came_from[current]
        path.reverse()

    for index, path_cell in enumerate(path):
        record_step({
            "type": "path",
            "cell": path_cell,
            "grid_path": path[:index + 1],
            "info": f"Courier follows A*'s confirmed route through block {path_cell} ({index + 1}/{len(path)}).",
        })
    record_step({"type": "done", "cell": goal, "grid_path": path, "info": f"A* delivery route complete — weighted cost {g_score.get(goal, 'unreachable')}."})
    return path

city = build_city()
result = a_star(city, START, GOAL)
$astar$
        WHERE template_id = (SELECT id FROM templates WHERE name = 'A* Search')
          AND language = 'python';

        INSERT INTO schema_migrations(version) VALUES ('008_pathfinding_grid_lessons');
    END IF;
END
$migration$;
