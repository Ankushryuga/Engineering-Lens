# Go System Design visualization engine

This module owns the **All Topics** visualization behavior for `/system-design`.

The React application is only the host for routing, search/filtering, source-note reading,
and completion progress. The selected topic is serialized to the browser-side Go module.
Go/WebAssembly owns:

- topic classification
- visualization-family selection
- SVG generation
- step playback state and timers
- component highlighting
- failure selection and blast-radius highlighting
- recovery guidance
- trade-off rendering
- source-derived structured-flow fallback

The primary visualization is never the old radial topic map.

## Commands

From `frontend/`:

```bash
npm run generate:system-design
npm run audit:system-design
npm run build:wasm
```

`docker compose up --build` also compiles the WASM module in a dedicated Go 1.23 Docker stage.

## Structure

```text
wasm/
├── cmd/
│   ├── generate/   Go handbook → JSON generator
│   ├── audit/      visualization-family coverage audit
│   └── wasm/       browser WebAssembly entrypoint
└── internal/engine/
    ├── classifier.go  topic → visualization family
    ├── specs.go       playback/failure/trade-off teaching model
    ├── render.go      actual SVG/diagram renderers
    ├── types.go       source topic and engine state types
    └── ui.go          Go-owned interaction surface
```

The current visualization dataset contains 1,077 technical topics and maps across 44 renderer families.
The generator excludes 67 reference-only H1 sections (usage instructions, career guidance,
exercises, checklists/review questions, templates, summary/mastery sections, and closing markers),
while the original source handbooks remain bundled unchanged. The technical topics include
query plans, B-Trees, MVCC, deadlocks, replication, sharding, queues, circuit
breakers, rate limiting, cloud networking, multi-AZ/multi-region, IAM, Kubernetes, RAG,
agents, model gateways, evaluation/cost, inference, fine-tuning, memory, and more.
