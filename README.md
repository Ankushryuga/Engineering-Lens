# algo-visualizer

Step through exactly how your algorithm executes.

Paste a function in Python, Go, Java, JavaScript, or C++, run it in an
isolated sandbox, and inspect every comparison, swap, and recursive call as a
reproducible, seekable sequence of steps — or skip the paste and pick one of
~55 canonical, team-authored algorithms from the built-in catalog and run
that instead. Both paths share the same sandbox, the same step format, and
the same player.

Full product design and rationale live in [`requirement_doc.md`](./requirement_doc.md).

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
React frontend (Monaco editor + step player + language selector + algorithm dropdown)
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

Each language (Python, Go, Java, JavaScript, C/C++) has its own Docker image
and Kafka consumer group, so a slow compiled-language job never competes with
an interpreted one for the same worker pool, and each pool scales/tunes
independently.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript, Vite, Monaco Editor |
| API | Go (chi router, REST + WebSocket) |
| Execution sandboxes | Docker — one image per language (Python 3.11, Node 20, Go 1.24, OpenJDK 21, GCC 13) |
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
│       ├── components/ Sidebar, CodeEditor, BarViz, StepPlayer, AlgoPicker
│       ├── pages/       Landing, App (empty/active state), Docs
│       └── lib/         REST + WebSocket API clients
├── api/                 Go REST/WebSocket API
│   └── internal/
│       ├── handlers/    visualize, templates, websocket
│       ├── kafka/       producer + consumer
│       ├── redis/       result cache client
│       ├── postgres/    catalog DB client
│       ├── middleware/  CORS, rate limiting
│       └── validator/   request validation + static deny-pattern checks
├── sandbox/             One Docker image + worker per language
│   ├── python/          worker.py (Kafka) + tracer.py (sys.settrace)
│   ├── javascript/      worker.js (Kafka) + tracer.js (vm + source instrumentation)
│   ├── golang/          worker.go (Kafka) + instrument.go (source instrumentation)
│   ├── java/            worker.py (Kafka) + instrument.py (source instrumentation)
│   └── cpp/             worker.py (Kafka) + instrument.py (source instrumentation, beta)
├── catalog/             Postgres schema + ~55 seeded reference solutions
│   ├── schema.sql
│   └── seeds/algorithms.sql
├── docker-compose.yml    Full local stack: Kafka, Redis, Postgres, API, 5 sandboxes, frontend
└── requirement_doc.md    Design & requirements doc (source of truth for scope)
```

## Getting started

**Prerequisites:** Docker Desktop (or Docker Engine + Compose v2).

```bash
git clone <this-repo>
cd Algo-Visualizer
cp .env.example .env
docker compose up --build
```

This brings up:
- Zookeeper + Kafka
- Redis
- Postgres (auto-seeded from `catalog/schema.sql` + `catalog/seeds/algorithms.sql`)
- The Go API on `http://localhost:8080`
- All five sandbox worker pools (Python, JavaScript, Go, Java, C++)
- The frontend dev server on `http://localhost:5173`

Open **http://localhost:5173** — you'll land on the landing page; click
**Open app** to reach the editor + visualization panel.

To stop everything:

```bash
docker compose down
```

To also drop the Postgres volume (re-seed the catalog from scratch):

```bash
docker compose down -v
```

## Running locally without Docker

Useful for frontend/API iteration without rebuilding sandbox images each time.

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

**API** (requires local Postgres/Redis/Kafka, or point at the ones from `docker compose up postgres redis kafka zookeeper`)
```bash
cd api
go run ./cmd/server
```

**A single sandbox worker** (e.g. Python)
```bash
cd sandbox/python
pip install -r requirements.txt
python worker.py
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
Long-poll for a result (up to 25s). Prefer the WebSocket endpoint for push delivery.

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

Every entry currently ships a tested Python reference solution; additional
language coverage is being backfilled per entry (see [Roadmap](#roadmap)).

## Language support & sandbox notes

| Language | Runtime | Status | Instrumentation approach |
|---|---|---|---|
| Python | 3.11 | Stable | `sys.settrace()` — dynamic line-level tracing |
| JavaScript | Node 20 | Stable | Source-level instrumentation (see trade-offs below) |
| Go | 1.24 | Stable | Source-level instrumentation, compiled via `go run` |
| Java | OpenJDK 21 | Stable | Source-level instrumentation, compiled via `javac`/`java` |
| C / C++ | GCC 13 (C++20) | Beta | Source-level instrumentation, compiled via `g++` |

All five normalize to the same `steps[]` JSON shape, so the frontend player
is fully language-agnostic:

```jsonc
{
  "type":    "compare" | "swap" | "set" | "visit" | "done",
  "indices": [1, 2],
  "array":   [5, 3, 8, 1],
  "info":    "comparing arr[1] and arr[2]"
}
```

Every sandbox runs with no network access, a hard wall-clock timeout
(10s interpreted / 20s compiled), a memory cap, and a non-root user. A
static pre-check also rejects obviously dangerous patterns (`os.system`,
`child_process`, `Runtime.exec`, etc.) before code reaches the sandbox, as
defense-in-depth — not a replacement for the container isolation itself.

## Known limitations / trade-offs

This is a v1 build; the following are deliberate, documented scope cuts
(see `requirement_doc.md` §3.8 "Open questions" for the original design
discussion):

- **Instrumentation is heuristic, not a full symbolic trace.** All five
  sandboxes detect the "subject" array and instrument comparisons/mutations
  involving it. This correctly visualizes idiomatic comparison/swap-style
  sorting and searching code (the catalog's canonical style) but will not
  produce a meaningful trace for arbitrary, unrelated code shapes (e.g.
  graph/tree/DP problems using nested structures instead of a flat array).
  Extending `renderType`-aware tracing for graphs/trees/DP is the natural
  next step (see Roadmap).
- **JavaScript uses source instrumentation, not the V8 inspector protocol**
  described in the original design doc. A true debugger-level trace via the
  inspector protocol was descoped in favor of shipping a working, consistent
  instrumentation strategy across all five languages within v1.
- **Per-job isolation is at the worker-pool level, not per-container.** Each
  language has its own long-lived Docker image/worker pool (as described in
  `requirement_doc.md` §3.2), rather than spinning up a fresh container per
  submitted job. This matches the documented architecture but is a lighter
  isolation boundary than one-container-per-job.
- **Catalog language coverage is Python-only at launch.** The requirement
  doc explicitly allows "1–2 languages per algorithm... with the rest
  backfilled later" (§3.8) — Python covers all ~55 entries today.

## Roadmap

Per `requirement_doc.md` §3.4/§3.7:

- [ ] Backfill JavaScript/Go/Java/C++ reference solutions across the catalog
- [ ] Graph/tree/DP-aware step recording (`renderType: "graph" | "tree" | "table"`)
- [ ] Recursion tree / call-stack visualization
- [ ] Shareable visualization links
- [ ] User accounts (save/share history)
- [ ] Deploy to EKS with Prometheus/Grafana dashboards
- [ ] LLM-assisted auto-detection of "what kind of algorithm is this" (v2)

## License

See [`LICENSE`](./LICENSE).
