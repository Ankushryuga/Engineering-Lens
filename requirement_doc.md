# Algorithm Visualizer Platform — Design & Requirements Doc

## 1. Why

### Problem
Most algorithm visualizers online are single-purpose (one page for bubble sort, one for BFS) and hardcoded by hand. There's no general tool where a developer can paste **their own code** and get an instrumented, step-by-step visualization — for sorting, graph traversal, recursion, or DP.

### Motivation
- Students and self-taught engineers learn algorithms far better by *watching* state change than by reading pseudocode.
- Existing tools (VisuAlgo, USFCA visualizer) are curated and closed — you can't paste your own implementation and see *your* logic run.
- Many learners don't have code ready to paste — letting them pick a well-known algorithm from a categorized catalog and see a canonical, working solution visualized removes the "I don't have code to paste" barrier entirely, without depending on any third-party problem platform.
- This is also a chance to build a real, production-shaped system (event-driven, sandboxed execution, cloud-deployed) rather than a static demo — directly exercising backend, distributed systems, and applied-AI skills.

### Goals
- Let any user paste an algorithm and see an accurate, step-by-step visualization without writing any instrumentation code themselves.
- Let any user pick a well-known algorithm from a categorized catalog instead of writing code, and see a canonical, team-authored solution visualized.
- Make it safe to run arbitrary user-submitted code.
- Make it fast enough to feel interactive, even for moderately expensive algorithms.
- Ship something real people (students, other engineers) actually use — not just a private repo.

### Non-goals (v1)
- Not a full IDE — no multi-file projects, no package installs.
- Not trying to support every language that exists — five languages (Python, Go, Java, JavaScript, C/C++) covers the vast majority of what students and interview-prep users actually write.
- Not aiming for real-time collaborative editing.
- Not sourcing problems from LeetCode, Codeforces, or any third-party platform — the algorithm catalog contains only canonical, team-authored implementations of well-known algorithms, so there's no external platform dependency, ToS exposure, or problem-statement copyright question to manage.
- Not attempting to cover every algorithm that exists — a curated set (~50 entries at launch) across the standard DSA categories is the realistic v1 target; see §2 for scope.

---

## 2. What

### Core user flow
There are now two entry points into the same visualization pipeline:

**A — Custom code**
1. User pastes an algorithm into the code editor.
2. User clicks "Run."
3. System runs the code in a sandbox, records the state at each meaningful step.
4. User gets an interactive player: step forward/back, play/pause, adjustable speed, and a rendering of the data structure being manipulated.

**B — Algorithm templates**
1. User switches the source to "Algorithm templates" and picks an algorithm from a single categorized dropdown (Sorting, Searching, Linked Lists, Trees, Heaps, Graphs, Dynamic Programming, Backtracking, Greedy, Strings, Math & Bit Manipulation), optionally narrowed by difficulty.
2. Selecting an entry loads a canonical, team-authored reference implementation into the editor, pre-selected in the user's chosen language, along with a short complexity note (e.g. "O(n²) time · O(1) space").
3. User can run it as-is, or edit it first.
4. From here the flow rejoins step 3 of flow A — same sandbox, same player, same step format.

### Feature scope (v1)
| Feature | Included in v1 |
|---|---|
| Paste + run functions in 5 languages | Yes |
| Auto-detect array/list-based algorithms (sorting, searching) | Yes |
| Step player (play/pause/step/speed) | Yes |
| Safe sandboxed execution (timeouts, memory limits, no network) | Yes |
| Empty state with starter templates (bubble sort, binary search, BFS, recursive fibonacci) | Yes |
| Public docs site (getting started, language support, API reference, step schema) | Yes |
| Algorithm template catalog — curated DSA algorithms across sorting, searching, linked lists, trees, heaps, graphs, DP, backtracking, greedy, strings, math/bit manipulation (~50 at launch) | Yes |
| Graph algorithms (BFS/DFS/Dijkstra) with node-edge rendering | Stretch goal |
| Recursion tree / call-stack visualization | Stretch goal |
| Full catalog coverage of every well-known DSA algorithm | v2, ongoing |
| Shareable visualization links | v2 |
| User accounts (save/share history) | v2 |
| LLM-assisted auto-detection of "what kind of algorithm is this" | v2 |

### Supported languages

| Language | Runtime | Execution model | Status |
|---|---|---|---|
| Python | 3.11 | Interpreted, traced via `sys.settrace()` | Stable |
| Go | 1.22 | Interpreted via a build-and-run step in the sandbox | Stable |
| Java | OpenJDK 21 | Compiled then run in-container | Stable |
| JavaScript | Node 20 | Interpreted, traced via the V8 inspector protocol | Stable |
| C / C++ | GCC 13 (C++20) | Compiled then run in-container | Beta |

All five normalize to the same `steps[]` output format (see §3.2), so the frontend player and the rest of the pipeline are language-agnostic — only the sandbox's instrumentation layer differs per language.

### UI surfaces
No screen uses a top header/nav bar. Navigation (source toggle, language selector, docs/GitHub links) lives in a persistent left sidebar within the app; on mobile the sidebar collapses behind a menu icon in a slim top bar. The landing page has no nav bar either — it opens directly into the hero.
- **Landing** — explains the product, shows a live code/visualization preview, and lists supported languages.
- **App, empty state** — shown before any code has been run; left sidebar has a "Custom code" / "Algorithm templates" source toggle and the language selector. The templates path is a single categorized dropdown (see §2, flow B) rather than a browsable library — no search/filter UI is needed since selection is one control.
- **App, active state** — the core product: editor, visualization panel, and step-playback controls. The left sidebar carries the source toggle and language selector; a slim action bar above the editor holds Run/Share. When entered via templates, a small metadata strip above the editor shows the algorithm's category and complexity (e.g. "Sorting · Bubble Sort · O(n²) time · O(1) space").
- **Docs** — getting started, supported languages with status per language, sandbox/safety notes, step schema, algorithm catalog reference, and API reference.

### Users
- Primary: students/self-learners studying DSA.
- Secondary: engineers prepping for interviews who want to sanity-check their own implementation's behavior.
- Tertiary (you): a live, demoable proof of full-stack + distributed systems + applied-AI capability.

### Success criteria
- A stranger can paste an unmodified LeetCode-style solution in any of the 5 supported languages and get a correct visualization without editing their code.
- p95 execution + response time under 3 seconds for interpreted languages (Python, JS); under 6 seconds for compiled languages (Go, Java, C/C++) to account for the build step.
- Zero sandbox escapes — execution is fully isolated, across all 5 language runtimes.

---

## 3. How

### 3.1 Architecture overview

```
React frontend (Monaco editor + step player + language selector + algorithm dropdown)
        │  HTTPS/REST
        │
        ├─── GET /api/v1/templates?category=&difficulty=   (catalog lookup for the dropdown)
        │            ▼
        │    Go API  →  Postgres (algorithm template metadata + reference solutions)
        │
        └─── POST /api/v1/visualize   {code, language}        (run/visualize — same for both entry points)
                     ▼
             Go API service (validates request, auth, rate limiting)
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
             Go API streams result to frontend (WebSocket or polling)

Offline, separate from the request path:
Reference solutions → team-authored, versioned in a git repo, loaded into Postgres on deploy (no external sync job — there's no third-party source to poll)
```

The template dropdown is a read path against Postgres — it never touches Kafka or the sandbox. Once a user picks an algorithm, its reference solution simply pre-fills the editor and rejoins the normal `/visualize` flow, so the execution pipeline itself doesn't need to know whether the code came from a paste or a template pick.

Routing on the `language` field is the key addition over the original design: each worker pool only ever runs one language, so a compiled-language job (Go, Java, C/C++) never competes for the same warm pool as an interpreted one (Python, JS), and each pool can be scaled and resource-tuned independently.

### 3.2 Component breakdown

**Frontend — React**
- Monaco Editor for code input (same editor VS Code uses), with per-language syntax highlighting and file-extension-aware tabs (`solution.py`, `solution.go`, `Solution.java`, `solution.js`, `solution.cpp`).
- A language selector that swaps the editor's syntax mode and tags the submitted job.
- A **Custom code / Algorithm templates** source toggle in the left sidebar: custom mode is a blank (or starter-filled) editor; templates mode is a single categorized dropdown (grouped by Sorting, Searching, Graphs, Trees, DP, etc.) that, on selection, loads a reference solution into the same editor.
- A generalized step player component (extends the bubble-sort prototype already built) that takes a generic `steps[]` array and renders bars, tree nodes, or graph nodes depending on a `renderType` field — this stays identical regardless of source language or entry point, since normalization happens server-side.
- No top header/nav on any screen; the left sidebar carries the source toggle, language selector, and docs/GitHub links, collapsing to a menu icon on mobile.
- An empty state with the algorithm dropdown front and center, and a docs section (static content, same frontend shell).
- WebSocket client to receive streamed results for long-running jobs.

**Algorithm template catalog — Postgres + Go**
- `GET /api/v1/templates` — list/filter by category and difficulty; returns metadata only (name, category, difficulty, complexity summary, available languages).
- `GET /api/v1/templates/:id/solution?language=` — returns the reference solution for a given algorithm in a given language.
- Backed by Postgres rather than Redis, since this is structured, queryable, relatively slow-changing data — a cache-shaped store like Redis is the wrong tool here.

**API layer — Golang**
- REST endpoint: `POST /api/v1/visualize` — accepts `{code, language}`, returns a `job_id`.
- `GET /api/v1/visualize/:job_id` — polling fallback.
- WebSocket endpoint `/ws/:job_id` for push-based delivery.
- Responsibilities: input validation (size limits, basic static checks per language), rate limiting per IP/user, routing the job to the correct Kafka partition/topic based on `language`, auth (if user accounts are added later).

**Execution engine — per-language sandboxes**
- Each language has its own Docker image and worker pool, all sharing the same sandbox contract:
  - No network access.
  - CPU/memory/time limits, tuned per language (interpreted languages get shorter timeouts than compiled ones, which need to budget for a build step).
  - Read-only filesystem except a scratch dir.
- Instrumentation approach differs by runtime:
  - **Python** — `sys.settrace()` captures local variable state at each line.
  - **JavaScript** — the Node/V8 inspector protocol captures step-level state without modifying user code.
  - **Go, Java, C/C++** — compiled languages are harder to trace natively at this fidelity in v1, so these use a lighter-weight approach: source-level instrumentation that injects step-recording calls at compile time (e.g. after each loop iteration or comparison), rather than true line-by-line tracing. This is a known trade-off — documented below in open questions.
- Every worker normalizes its output to the same `steps[]` JSON array, regardless of language: `[{type: "compare", indices: [i,j], array: [...]}, ...]`.

**Async processing — Kafka**
- `visualize-jobs` topic: one message per submitted job.
- Worker pool (multiple consumer instances) pulls jobs, scales horizontally under load.
- `visualize-results` topic: completed step traces, consumed by the API layer for delivery.
- This decouples slow/expensive executions from the request path — exactly the same pattern as an event-driven order pipeline.

**Caching — Redis**
- Key: hash of `(code, language)`.
- Value: the full `steps[]` result.
- Identical code submitted twice returns instantly without re-executing.

**Deployment — AWS**
- Containers for API, worker pool, and sandbox image, deployed on EKS.
- S3 for storing large step traces if they exceed a reasonable size for Redis/inline delivery.
- Prometheus + Grafana for execution time, sandbox failure rate, and queue depth dashboards.

**Security considerations**
- Docker sandbox per language, no network, strict resource caps, and a non-root user in every image.
- Static pre-check per language to reject obviously malicious patterns (e.g. `os.system`/`subprocess` in Python, `os/exec` in Go, `Runtime.exec` in Java, `child_process` in JS, `system()`/`exec()` in C/C++) before execution, as defense in depth — not a replacement for sandboxing.
- Compiled languages (Go, Java, C/C++) additionally cap compile time separately from execution time, so a pathological compile can't exhaust a worker.
- Rate limiting to prevent abuse/DoS via expensive submissions, applied per language pool so one language's load spike doesn't starve the others.

### 3.3 Tech stack summary

| Layer | Technology | Why |
|---|---|---|
| Frontend | React + TypeScript, Monaco Editor | Type safety across the step-player/editor/catalog components, which all share the `steps[]` and template contracts |
| API | Golang (REST + WebSocket) | Matches your core backend strength, gRPC/REST experience |
| Execution sandboxes | Docker, one image per language (Python 3.11, Go 1.22, OpenJDK 21, Node 20, GCC 13) | Isolates language runtimes and lets each be resourced independently |
| Messaging | Apache Kafka | You already run this in production; decouples slow jobs and routes by language |
| Cache | Redis | You already use this; avoids recomputation, keyed by code + language hash |
| Catalog storage | PostgreSQL | Structured, queryable algorithm template metadata and reference solutions — a poor fit for Redis's cache semantics |
| GenAI service (v2) | Python (FastAPI) | Powers the "LLM-assisted auto-detection of algorithm type" feature (§2, v2); Python has the strongest ecosystem for LLM/ML tooling, and isolating it as its own service keeps the Go API free of that dependency chain |
| Cloud/infra | AWS (EKS, S3, RDS) | Matches your cloud migration experience |
| Observability | Prometheus, Grafana | Matches your existing observability stack; track per-language latency and failure rate separately |
| Auth (v2) | OAuth 2.0 / OIDC | Matches your security experience, needed if user accounts are added |

### 3.4 Build plan

Supporting 5 languages instead of 1 is the single biggest scope change from the original plan — each compiled language needs its own instrumentation strategy, not just a new Docker image. The plan below phases languages in rather than building all 5 in parallel.

**1 — Core loop, Python only, synchronous**
- Go API + Python sandbox wired together directly (no Kafka yet).
- Support array-based algorithms (sorting, searching) end-to-end.
- Build the empty state, active app screen, and step-player React component against real backend output.

**2 — Safety, breadth, and JavaScript**
- Docker sandboxing with resource limits and static pre-checks for Python.
- Add the Node/V8-based JavaScript sandbox — the second-easiest language since it's also interpreted.
- Add recursion/DP support (call-stack or table rendering).

**3 — Compiled languages, phase 1 (Go)**
- Add the Go sandbox: build step + source-level instrumentation.

**4 — Compiled languages, phase 2 (Java, C/C++)**
- Reuse the Go sandbox's instrumentation pattern for Java and C/C++.
- Mark C/C++ as "beta" in the docs and UI if its instrumentation fidelity lags the others — shipping 4 solid languages plus 1 clearly-labeled beta is better than 5 shaky ones.

**5 — Production shape**
- Introduce Kafka for async job handling, with jobs routed by language, and Redis for caching.
- Deploy to EKS, add Prometheus/Grafana dashboards with per-language breakdowns.

**6 — Docs and polish**
- Build the public docs site (getting started, language support table, API reference, step schema).
- Write the public-facing README and open it up for real users to try.

If time is tight, the highest-value cut is scope, not languages already committed: ship Python + JavaScript + Go first (interpreted + one compiled language, proving both instrumentation paths), and add Java/C++ as a fast-follow. Cutting Kafka/Redis and shipping synchronous first is still the second lever if needed.

### 3.6 Algorithm template catalog

Every entry in the catalog is a canonical, team-authored implementation of a well-known algorithm — there's no third-party platform in the loop, so there's no scraping, no Terms-of-Service exposure, and no problem-statement copyright question to manage. This is simpler than the earlier LeetCode/Codeforces-sourced design, at the cost of not inheriting either platform's existing breadth.

**Coverage — organized by category, not by source**
- The dropdown groups entries under the standard DSA categories: Sorting, Searching, Linked Lists, Trees, Heaps & Priority Queues, Graphs, Dynamic Programming, Backtracking, Greedy, Strings, and Math & Bit Manipulation.
- ~50 algorithms at launch (e.g. bubble/merge/quick sort, binary search, BFS/DFS/Dijkstra/A*, tree traversals, knapsack/LCS/edit distance, N-Queens, KMP, sieve of Eratosthenes) — a representative spread across every category rather than exhaustive coverage of any one.
- Each entry stores: name, category, a short complexity note (time/space), difficulty tier (Fundamental / Intermediate / Advanced), and the reference solution per language.

**Reference solutions — always original**
- Every reference solution is **written and tested by the team**, not copied from any discussion board or solution site — this is the real effort here. Writing a correct, idiomatic solution in up to 5 languages for every catalog entry is real work per entry, which is why the v1 target is ~50 algorithms with partial language coverage rather than full 5x coverage on day one (see §3.8).

### 3.7 Build plan addition — algorithm template catalog (phase 2)

**7 — Catalog infrastructure**
- Stand up Postgres and the `/api/v1/templates` endpoints.
- Build the algorithm dropdown (grouped by category, filterable by difficulty) and the Custom code / Algorithm templates toggle in the left sidebar.

**8 — Reference solution content**
- Write and test reference solutions for an initial ~50-algorithm set spanning all categories, in at least 2 of the 5 languages to start (expand language coverage per entry over time rather than blocking launch on full 5x coverage).

### 3.8 Open questions
- For compiled languages, is source-level instrumentation (inserting `record_step()` calls at compile time) accurate enough, or does it need to be a true debugger-level trace (e.g. via `delve` for Go, JDWP for Java, `gdb`/`ptrace` for C/C++)? The debugger-level approach is more accurate but meaningfully more complex to sandbox safely.
- Should C/C++ stay labeled "beta" indefinitely, or is there a target date to bring it to parity with the other 4?
- Self-hosted (own domain/EKS) vs. quick deploy on a platform like Render/Fly.io for faster initial user feedback?
- Do we want anonymous usage only, or lightweight accounts to save/share visualizations?
- How many languages does a reference solution need on day one — all 5, or is 1–2 per algorithm an acceptable starting point with the rest backfilled later?
- Which ~50 algorithms make the v1 cut, and who owns keeping the category list itself from drifting toward "one of everything" instead of a coherent, teachable set?