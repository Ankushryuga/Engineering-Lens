# AlgoWeave — algorithm visualizer for students

Learn the **idea first, then the code**.

AlgoWeave turns classic DSA algorithms into familiar real-life stories — warehouse
loading, dictionary lookup, GPS routing, hospital triage, scheduling, packing,
puzzles, text search, and more. Students can play/pause the actual sandboxed
execution, optionally enable **Explain how it works** for synchronized teaching notes,
and then switch to **Abstract** view to connect the analogy back to arrays, graphs,
trees, linked lists, or the source-line execution trace. Source code is hidden by
default and can be revealed on demand with **Show source code**.

The product intentionally supports **Python and Go only**. Both custom-code mode
and every guided lesson use the same two runtimes, and all 55 canonical algorithms
ship with reference solutions in both languages.

Full product design and rationale live in [`requirement_doc.md`](./requirement_doc.md).

Current UI/brand release: **AlgoWeave v17**. The project uses a synchronized responsive shell/sidebar breakpoint so intermediate laptop widths do not fall into a mixed desktop/tablet layout. See [`V17_ALGOWEAVE_RESPONSIVE_RENAME.md`](./V17_ALGOWEAVE_RESPONSIVE_RENAME.md).

---

## Contents

- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Repository layout](#repository-layout)
- [Getting started](#getting-started)
- [Running locally without Docker](#running-locally-without-docker)
- [API reference](#api-reference)
- [Algorithm catalog](#algorithm-catalog)
- [Language support & sandbox notes](#language-support--sandbox-notes)
- [Known limitations / trade-offs](#known-limitations--trade-offs)
- [Roadmap](#roadmap)

---

## Architecture

```
React student learning lab (lesson library + story visualizer + Monaco editor + step player)
        │  HTTPS/REST + WebSocket
        │
        ├─── GET /api/v1/templates?category=&difficulty=   (catalog lookup)
        │            ▼
        │    Go API  →  Postgres (algorithm template metadata + reference solutions)
        │
        └─── POST /api/v1/visualize   {code, language}
                     ▼
             Go API service (validates request, rate limits, static pre-checks)
                     │  publishes job (tagged with language)
                     ▼
             Kafka topic: visualize-jobs
                     │  consumed by, routed on the "language" field
                     ▼
             Language-specific sandbox worker pools (one Docker image per language)
                     │  publishes result
                     ▼
             Kafka topic: visualize-results  →  Redis (cache by hash of code + language)
                     │
                     ▼
             Go API streams result to frontend (WebSocket, with long-poll fallback)
```

Python and Go each have their own Docker image and Kafka consumer group, so
compiled Go jobs never compete with Python jobs for the same worker pool and
each runtime can be scaled/tuned independently.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript, Vite, Monaco Editor |
| API | Go (chi router, REST + WebSocket) |
| Execution sandboxes | Docker — Python 3.11 and Go 1.24 worker images |
| Messaging | Apache Kafka (`visualize-jobs` / `visualize-results` topics) |
| Cache | Redis (keyed by hash of code + language) |
| Catalog storage | PostgreSQL |
| Cloud/infra (target) | AWS (EKS, S3, RDS), Prometheus + Grafana |

See `requirement_doc.md` §3.3 for the full stack rationale.

## Repository layout

```
.
├── frontend/           React + TypeScript app (Vite)
│   └── src/
│       ├── components/ Sidebar, CodeEditor, visualizers, StepPlayer, AlgoPicker
│       ├── data/        real-world scenario mappings for the catalog
│       ├── pages/       Landing, App, Docs
│       └── lib/         REST + WebSocket API clients
├── api/                 Go REST/WebSocket API
│   └── internal/
│       ├── handlers/    visualize, templates, websocket
│       ├── kafka/       producer + consumer
│       ├── redis/       result cache client
│       ├── postgres/    catalog DB client
│       ├── middleware/  CORS, rate limiting
│       └── validator/   request validation + static deny-pattern checks
├── sandbox/             One Docker image + worker per supported language
│   ├── python/          worker.py (Kafka) + tracer.py (sys.settrace)
│   └── golang/          worker.go (Kafka) + instrument.go (source instrumentation)
├── catalog/             Postgres schema + ~55 seeded reference solutions
│   ├── schema.sql
│   └── seeds/algorithms.sql
├── docker-compose.yml    Full local stack: Kafka, Redis, Postgres, API, Python/Go sandboxes, frontend
└── requirement_doc.md    Design & requirements doc (source of truth for scope)
```

## Getting started

**Prerequisites:** Docker Desktop (or Docker Engine + Compose v2).

```bash
git clone <this-repo>
cd Algo-Visualizer
# Optional for Compose overrides; useful as a reference for local API settings:
# cp .env.example .env
docker compose down --remove-orphans
# --remove-orphans cleans old JavaScript/Java/C++ workers left by releases before v13.
docker compose up --build
```

This brings up:
- Zookeeper + Kafka
- Redis
- Postgres (auto-seeded from `catalog/schema.sql` + `catalog/seeds/algorithms.sql`)
- The Go API on `http://localhost:8080`
- Python and Go sandbox worker pools
- The frontend dev server on `http://localhost:5173`

Open **http://localhost:5173** — choose **Open learning lab**, pick a guided lesson,
and run it. Story mode is the default. Source code stays hidden until **Show source
code** is selected, and **Explain how it works** adds step-synchronized explanations.
Abstract mode remains available beside Story mode.

To stop everything:

```bash
docker compose down --remove-orphans
```

To also drop the Postgres volume (re-seed the catalog from scratch):

```bash
docker compose down -v
```


### Host ports

Compose keeps service-to-service ports unchanged inside Docker. Host mappings are:

- Frontend: `localhost:5173`
- API: `localhost:8080`
- PostgreSQL: `localhost:5433` → container `5432` (override with `POSTGRES_HOST_PORT`)
- Redis: `localhost:6380` → container `6379`
- Kafka: `localhost:29094`

The PostgreSQL host port intentionally defaults to **5433** so a locally installed
PostgreSQL server on the standard `5432` port does not block `docker compose up`.

### Verify all guided lessons

Without Docker, you can smoke-test every seeded Python lesson through the actual
tracer used by the sandbox:

```bash
python3 scripts/verify_catalog.py
```

The command must report all 55 lessons as `PASS`. Some lessons emit rich structured
state; the rest deliberately use the student learning-timeline renderer rather than
showing an empty graph/array.

To verify the Go worker transformation and make sure every canonical Go lesson
produces a usable multi-step trace:

```bash
python3 scripts/verify_go_runtime.py
```

That check compiles and executes all 55 Go references after applying the same
source instrumentation used by `sandbox-go`.

## Running locally without Docker

Useful for frontend/API iteration without rebuilding sandbox images each time.

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

**API** (using Postgres/Redis/Kafka from `docker compose up postgres redis kafka zookeeper`)
```bash
cd api
POSTGRES_DSN='postgres://algo:algo_secret@localhost:5433/algo_visualizer?sslmode=disable' \
REDIS_ADDR=localhost:6380 \
KAFKA_BROKERS=localhost:29094 \
go run ./cmd/server
```

**A single sandbox worker** (e.g. Python, using Compose Kafka)
```bash
cd sandbox/python
pip install -r requirements.txt
KAFKA_BROKERS=localhost:29094 python worker.py
```

## API reference

### `POST /api/v1/visualize`
Submit code for sandboxed execution.

```jsonc
// Request
{ "code": "def bubble_sort(arr): ...", "language": "python" }

// Response 202
{ "job_id": "3f4a2b1c-...", "cached": false }
```

### `GET /api/v1/visualize/:job_id`
Long-poll for a result (up to `JOB_TIMEOUT_SECONDS`, 30s by default). Prefer the WebSocket endpoint for push delivery.

### `WS /ws/:job_id`
Streams `{"status":"pending"}` keepalives, then a single
`{"status":"done","result":{...}}` message.

### `GET /api/v1/templates?category=&difficulty=`
List catalog entries, optionally filtered.

### `GET /api/v1/templates/:id/solution?language=`
Fetch the reference solution for a template in a given language.

Full step schema and more examples are documented in-app at `/docs`.

## Algorithm catalog

~55 canonical, team-authored algorithms across 11 categories — no
third-party problem platform in the loop (see `requirement_doc.md` §3.6):

| Category | Examples |
|---|---|
| Sorting | Bubble, Insertion, Selection, Merge, Quick, Heap, Counting, Radix |
| Searching | Linear, Binary, Ternary |
| Linked Lists | Reverse, Cycle Detection, Merge Sorted Lists |
| Trees | Traversals, BST ops, AVL rotations, Trie, LCA |
| Heaps & Priority Queues | Insert/Extract-Min, Build Heap, K-th Largest |
| Graphs | BFS, DFS, Dijkstra, Bellman-Ford, Floyd-Warshall, A*, Topo Sort, Kruskal's, Prim's, Union-Find |
| Dynamic Programming | Knapsack, LCS, LIS, Edit Distance, Coin Change, MCM, Fibonacci |
| Backtracking | N-Queens, Sudoku, Permutations, Rat in a Maze |
| Greedy | Activity Selection, Huffman Coding, Fractional Knapsack |
| Strings | KMP, Rabin-Karp, Z-Algorithm, Longest Palindromic Substring |
| Math & Bit Manipulation | Sieve of Eratosthenes, GCD/LCM, Fast Exponentiation, Bit basics |

Every one of the 55 catalog entries ships with both a Python and a Go reference
solution. Every entry also has a concrete real-world scenario used by the default
visualization lens.

## Language support & sandbox notes

| Language | Runtime | Status | Instrumentation approach |
|---|---|---|---|
| Python | 3.11 | Stable | `sys.settrace()` — dynamic line-level tracing |
| Go | 1.24 | Stable | Source-level instrumentation, compiled via `go run` |

Both runtimes normalize to the same `steps[]` JSON shape, so the frontend player
is language-agnostic:

```jsonc
{
  "type":    "compare" | "swap" | "set" | "visit" | "done",
  "indices": [1, 2],
  "array":   [5, 3, 8, 1],
  "info":    "comparing arr[1] and arr[2]"
}
```

Both sandbox workers are attached only to an **internal Kafka network**, with no
outbound internet path. Workers use a read-only root filesystem, `/tmp` scratch
space, PID/CPU/memory caps, `no-new-privileges`, hard wall-clock timeouts, and a
non-root user. Static pre-checks reject obviously dangerous patterns such as
`os.system` in Python and `os/exec` in Go before code reaches the sandbox.

## Known limitations / trade-offs

This is a v1 build; the following are deliberate, documented scope cuts
(see `requirement_doc.md` §3.8 "Open questions" for the original design
discussion):

- **Custom-code instrumentation is heuristic, not a full symbolic trace.**
  Flat-array code gets structured compare/swap/set state when the tracer can
  recognize it. Catalog graph/tree/list algorithms can emit richer explicit
  steps, and other code falls back to real source-line execution progress so
  the player remains seekable without fabricating algorithm state. Arbitrary
  custom nested structures (for example a user-written DP table) still need
  richer `renderType`-aware tracing to visualize their internal values.
- **Per-job isolation is at the worker-pool level, not per-container.** Each
  language has its own long-lived Docker image/worker pool (as described in
  `requirement_doc.md` §3.2), rather than spinning up a fresh container per
  submitted job. This matches the documented architecture but is a lighter
  isolation boundary than one-container-per-job.
- **Go tracing is intentionally lighter than Python tracing for arbitrary custom code.**
  Canonical Go catalog solutions are fully available, but rich structure-specific
  tracing still depends on what the source-level Go instrumenter can observe.

## Roadmap

Per `requirement_doc.md` §3.4/§3.7:

- [ ] Expand custom-code tracing beyond flat-array heuristics (DP tables and richer structures)
- [ ] Recursion tree / call-stack visualization
- [ ] Shareable visualization links
- [ ] User accounts (save/share history)
- [ ] Deploy to EKS with Prometheus/Grafana dashboards
- [ ] LLM-assisted auto-detection of "what kind of algorithm is this" (v2)

## License

See [`LICENSE`](./LICENSE).

### v8 weighted Pathfinder compatibility note

Dijkstra and A* use a trace-driven 15×26 weighted city-grid visualization in Story mode. The original `UI mockup files/pathfinding-grid.html` is only a design reference and is not imported or read at runtime. Existing PostgreSQL volumes are upgraded by the one-shot `catalog-migrate` service, so upgrading no longer requires deleting `postgres_data`. Older graph-format Dijkstra results remain renderable through the compatible Delivery Route view instead of producing a blank panel.

### v9 pathfinder / phone UI note

The weighted-grid Pathfinder now distinguishes geometric route length from weighted travel cost and visually fades exploration noise after the final route is confirmed. On tablet/phone widths, AlgoWeave uses a sticky top bar and off-canvas navigation drawer instead of compressing or hiding the sidebar. See `V9_CORRECTNESS_RESPONSIVE.md`.
