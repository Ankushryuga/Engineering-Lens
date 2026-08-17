# System Design Topic Generation Policy

The System Design Topic Explorer is generated from the four bundled user-supplied handbooks, but not every top-level handbook heading is a technical concept that should receive an interactive visualization.

## Included in the visual explorer

- numbered technical System Design sections
- technically meaningful appendices
- architecture patterns, failure modes, protocols, algorithms, operational mechanisms, security boundaries, reliability mechanisms, data flows, platform mechanisms, and design frameworks

Examples include Query Execution and Optimization, MVCC, Kafka, Rate Limiting, VPCs, Multi-Region Architecture, Kubernetes, RAG, Agent Loop, Model Gateways, and technical appendices such as NAT Port Exhaustion or Global Secondary Indexes.

## Reference-only sections excluded from visualization

The Go generator excludes learning/navigation/reference H1 sections such as:

- How to Use This Handbook / Guide
- Senior-Level Expectations / Staff-Level Expectations
- Design / Architecture Exercises
- Mastery, production-readiness, security, or review checklists when the H1 itself is a checklist
- Suggested Learning Path / Learning Roadmap
- Practice Questions
- Review Questions
- Templates and cheat sheets
- final mastery/summary/mental-model sections
- End / Closing markers

The exclusion policy is implemented in `frontend/wasm/internal/engine/topic_policy.go` and covered by Go unit tests plus the end-to-end System Design verifier.

## Source preservation

Excluded sections are **not deleted or rewritten**. The original handbooks remain unchanged under `docs/system-design-references/`. The policy only controls which H1 sections become interactive visualization topics.

## Current generated coverage

- Backend Systems: 207 technical topics
- Database Systems: 133 technical topics
- Cloud Architecture: 343 technical topics
- GenAI Systems: 394 technical topics
- Total technical topics: 1,077
- Reference-only H1 sections excluded from visualization: 67
- Source H1 sections considered after document titles: 1,144
