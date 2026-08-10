# Project audit and fixes

This revision focuses on correctness, delivery reliability, sandbox isolation, and the UI direction shown in `UI mockup files/`, especially `real-life-scenario-mode.html`.

## Real-world visualization

- Added a real-world visualization lens and made it the default in the app.
- Added exact scenario copy for all 55 seeded catalog algorithms, with examples such as warehouse loading, dictionary lookup, train couplings, hospital triage, route planning, meeting scheduling, suitcase packing, and text search.
- Kept the existing abstract array/graph/tree/linked-list views behind an `Abstract` toggle.
- Added a truthful process-progress fallback for algorithms that do not expose a flat list (for example some DP, string, backtracking, and math code). It uses actual executed source-line progress instead of inventing data.
- Replaced the step-player's one-DOM-node-per-step scrubber with a range control so large traces (for example Sudoku) remain practical.

## Execution and tracer correctness

- Python traces now always end with a `done` frame and preserve the final array state when available.
- Python tracing is limited to the submitted `<user_code>` frame and can fall back to line-progress frames for non-array algorithms.
- JavaScript comparisons are recorded before the comparison executes, and array mutation state is diffed against the previous snapshot correctly.
- Go instrumentation finalizes via `defer`, including early returns and one-line `main` functions.
- Java instrumentation finalizes through `try/finally`, including early returns.
- C++ instrumentation finalizes through an RAII guard, fixing the previous unreachable-finalization bug after `return 0`.
- All workers propagate the submission hash with their result so cache writes can use the same key as cache reads.

## API and delivery fixes

- Fixed Redis result caching: results are now stored by both `sha256(language + code)` and `job_id` instead of incorrectly using `job_id` as the code-hash key.
- Closed result-delivery races by registering long-poll/WebSocket waiters before checking Redis.
- WebSocket failures/timeouts/early closes now fall back to polling on the frontend.
- Editing code, changing language/source/template, rerunning, or unmounting cancels stale WebSocket delivery so an old result cannot overwrite a newer screen.
- WebSocket job IDs are validated and WebSocket origins are checked against configured CORS origins.
- WebSocket requests are rate limited too.
- `RATE_LIMIT_RPS` and `JOB_TIMEOUT_SECONDS` are now actually read from configuration.
- Template endpoints validate IDs/languages and distinguish not-found responses from database failures.
- Linked-list `next`, `lists`, `pointers`, and `merged` fields are represented in the Go API model instead of being silently dropped during JSON decoding.
- Removed the non-functional Share button; shareable visualization links remain a documented v2 item.

## Sandbox hardening

- Replaced `dns: []` (which does not block IP-based internet access) with an internal-only Docker network for worker-to-Kafka communication.
- Workers now use read-only root filesystems, writable `/tmp` tmpfs, PID limits, CPU/memory limits, and `no-new-privileges` in Compose.
- Kept the non-root runtime users already present in the sandbox images.
- Kept the repository's original Go 1.24 runtime for the API and Go sandbox. The requirements document still mentions Go 1.22; build configuration is intentionally treated as the executable source of truth until the stack is deliberately downgraded and validated.

## Validation performed in this workspace

Passed:

- All 55 seeded Python reference solutions execute through the tracer and end in a valid `done` state.
- Bubble-sort smoke traces were exercised for Python, JavaScript, Go, Java, and C++ during the audit, including early-return finalization for compiled languages.
- TypeScript/TSX syntax transpilation passes for the changed frontend files.
- Python sandbox files compile; JavaScript worker/tracer syntax checks pass.
- Docker Compose YAML parses and all five workers satisfy the internal-network/read-only/PID/security assertions.
- All 55 catalog names have an exact real-world scenario mapping.
- CSS-module references used by the changed components resolve to declared classes.
- `gofmt` and `git diff --check` pass.

Environment-limited checks:

- A full frontend `npm` build cannot be run from the supplied archive because `node_modules` is not included and this execution environment cannot reach the npm registry.
- A full Go `go test ./...` cannot fetch the module dependencies in this sandbox because outbound network/DNS access is blocked. Docker/Go builds should use the repository's original Go 1.24 toolchain.
- Docker is not installed in this execution environment, so `docker compose up` cannot be executed here.

On a normal networked development machine, the final integration checks are:

```bash
cd frontend && npm ci && npm run build
cd ../api && go test ./...
cd .. && docker compose config && docker compose up --build
```

## Remaining intentional limitations

- Source instrumentation is heuristic for arbitrary custom code. Catalog algorithms can provide richer explicit state, while unrecognized nested/custom structures fall back to genuine execution progress rather than fake data.
- The catalog currently has full Python reference coverage; JavaScript/Go/Java/C++ catalog coverage is still being backfilled.
- Shareable links, accounts/history, richer custom DP/nested-structure tracing, and production observability/deployment remain roadmap items rather than partially implemented UI controls.

## API compile fix (v3)

Fixed a Go compilation error in `api/internal/handlers/templates.go` where `err` was redeclared with `:=` after already being introduced by `strconv.Atoi`. The solution query now assigns with `err = ...`.
