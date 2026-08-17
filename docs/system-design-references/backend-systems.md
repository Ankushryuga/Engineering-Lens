# Backend Systems — Zero to Senior/Staff Software Engineer

> A practical, end-to-end handbook for mastering backend engineering and backend system design from first principles to Senior/Staff level.
>
> This is intentionally broad and deep. It covers not only APIs and frameworks, but also operating systems, networking, databases, distributed systems, concurrency, messaging, security, observability, cloud infrastructure, production operations, architecture, reliability, performance, and technical leadership.

---

# Table of Contents

1. [How to Use This Handbook](#1-how-to-use-this-handbook)
2. [What a Backend System Actually Is](#2-what-a-backend-system-actually-is)
3. [Backend Engineering Mental Model](#3-backend-engineering-mental-model)
4. [Computer Science Foundations You Must Know](#4-computer-science-foundations-you-must-know)
5. [Operating System Fundamentals](#5-operating-system-fundamentals)
6. [Networking Fundamentals](#6-networking-fundamentals)
7. [DNS, Proxies, Load Balancers, and CDNs](#7-dns-proxies-load-balancers-and-cdns)
8. [HTTP Fundamentals](#8-http-fundamentals)
9. [HTTPS, TLS, and Certificates](#9-https-tls-and-certificates)
10. [Backend Runtime Models](#10-backend-runtime-models)
11. [Processes, Threads, Coroutines, and Event Loops](#11-processes-threads-coroutines-and-event-loops)
12. [Concurrency and Synchronization](#12-concurrency-and-synchronization)
13. [Memory Management and Garbage Collection](#13-memory-management-and-garbage-collection)
14. [Backend Languages and Runtime Trade-offs](#14-backend-languages-and-runtime-trade-offs)
15. [Application Structure and Layering](#15-application-structure-and-layering)
16. [API Design Fundamentals](#16-api-design-fundamentals)
17. [REST APIs](#17-rest-apis)
18. [RPC and gRPC](#18-rpc-and-grpc)
19. [GraphQL](#19-graphql)
20. [WebSockets, SSE, and Real-Time Systems](#20-websockets-sse-and-real-time-systems)
21. [Serialization and Data Formats](#21-serialization-and-data-formats)
22. [Validation, Errors, and API Contracts](#22-validation-errors-and-api-contracts)
23. [Pagination, Filtering, Sorting, and Search](#23-pagination-filtering-sorting-and-search)
24. [API Versioning and Compatibility](#24-api-versioning-and-compatibility)
25. [Idempotency and Duplicate Prevention](#25-idempotency-and-duplicate-prevention)
26. [Authentication](#26-authentication)
27. [Authorization](#27-authorization)
28. [Sessions, Cookies, JWTs, and Tokens](#28-sessions-cookies-jwts-and-tokens)
29. [OAuth 2.0 and OpenID Connect](#29-oauth-20-and-openid-connect)
30. [Backend Security Fundamentals](#30-backend-security-fundamentals)
31. [Secrets and Key Management](#31-secrets-and-key-management)
32. [Database Fundamentals for Backend Engineers](#32-database-fundamentals-for-backend-engineers)
33. [Transactions and Isolation](#33-transactions-and-isolation)
34. [Indexing and Query Performance](#34-indexing-and-query-performance)
35. [ORMs and Query Builders](#35-orms-and-query-builders)
36. [Connection Pools](#36-connection-pools)
37. [Caching](#37-caching)
38. [Redis in Backend Systems](#38-redis-in-backend-systems)
39. [Messaging and Event-Driven Systems](#39-messaging-and-event-driven-systems)
40. [Kafka](#40-kafka)
41. [RabbitMQ and Traditional Queues](#41-rabbitmq-and-traditional-queues)
42. [Retries, Backoff, and Dead-Letter Queues](#42-retries-backoff-and-dead-letter-queues)
43. [Exactly-Once, At-Least-Once, and At-Most-Once](#43-exactly-once-at-least-once-and-at-most-once)
44. [Transactional Outbox and CDC](#44-transactional-outbox-and-cdc)
45. [Background Jobs and Schedulers](#45-background-jobs-and-schedulers)
46. [Files, Object Storage, and Uploads](#46-files-object-storage-and-uploads)
47. [Search Systems](#47-search-systems)
48. [Monoliths, Modular Monoliths, and Microservices](#48-monoliths-modular-monoliths-and-microservices)
49. [Service Boundaries and Domain Design](#49-service-boundaries-and-domain-design)
50. [Distributed Systems Fundamentals](#50-distributed-systems-fundamentals)
51. [Consistency Models](#51-consistency-models)
52. [CAP and PACELC](#52-cap-and-pacelc)
53. [Replication](#53-replication)
54. [Sharding and Partitioning](#54-sharding-and-partitioning)
55. [Distributed Transactions](#55-distributed-transactions)
56. [Sagas](#56-sagas)
57. [Distributed Locks and Coordination](#57-distributed-locks-and-coordination)
58. [Leader Election and Consensus](#58-leader-election-and-consensus)
59. [Time, Clocks, Ordering, and IDs](#59-time-clocks-ordering-and-ids)
60. [Resilience Engineering](#60-resilience-engineering)
61. [Timeouts](#61-timeouts)
62. [Retry Storms and Overload](#62-retry-storms-and-overload)
63. [Circuit Breakers](#63-circuit-breakers)
64. [Rate Limiting](#64-rate-limiting)
65. [Bulkheads and Load Shedding](#65-bulkheads-and-load-shedding)
66. [Backpressure](#66-backpressure)
67. [Observability](#67-observability)
68. [Logging](#68-logging)
69. [Metrics](#69-metrics)
70. [Distributed Tracing](#70-distributed-tracing)
71. [SLIs, SLOs, SLAs, and Error Budgets](#71-slis-slos-slas-and-error-budgets)
72. [Profiling and Performance Engineering](#72-profiling-and-performance-engineering)
73. [Capacity Planning](#73-capacity-planning)
74. [Load Testing](#74-load-testing)
75. [Testing Backend Systems](#75-testing-backend-systems)
76. [Contract Testing](#76-contract-testing)
77. [Chaos and Failure Testing](#77-chaos-and-failure-testing)
78. [Configuration and Feature Flags](#78-configuration-and-feature-flags)
79. [Containers and Docker](#79-containers-and-docker)
80. [Kubernetes](#80-kubernetes)
81. [Cloud Architecture Fundamentals](#81-cloud-architecture-fundamentals)
82. [Serverless Backends](#82-serverless-backends)
83. [CI/CD and Release Engineering](#83-cicd-and-release-engineering)
84. [Deployment Strategies](#84-deployment-strategies)
85. [Database and Schema Migrations](#85-database-and-schema-migrations)
86. [Multi-Region and Disaster Recovery](#86-multi-region-and-disaster-recovery)
87. [Multi-Tenancy](#87-multi-tenancy)
88. [Backend Architecture Patterns](#88-backend-architecture-patterns)
89. [CQRS and Event Sourcing](#89-cqrs-and-event-sourcing)
90. [Service Mesh and API Gateways](#90-service-mesh-and-api-gateways)
91. [Production Readiness](#91-production-readiness)
92. [Incident Response](#92-incident-response)
93. [Cost Engineering](#93-cost-engineering)
94. [Common Backend Failure Modes](#94-common-backend-failure-modes)
95. [System Design Interview Framework](#95-system-design-interview-framework)
96. [Senior-Level Expectations](#96-senior-level-expectations)
97. [Staff-Level Expectations](#97-staff-level-expectations)
98. [Backend Design Exercises](#98-backend-design-exercises)
99. [Backend Mastery Checklist](#99-backend-mastery-checklist)
100. [Suggested Learning Path](#100-suggested-learning-path)

---

# 1. How to Use This Handbook

Do not try to memorize every technology. Your goal is to build mental models.

A strong backend engineer can answer:

- What happens between a user clicking a button and data being persisted?
- Where can latency enter the system?
- What happens if a dependency becomes slow?
- What happens if the same message is processed twice?
- What happens when the database primary dies?
- How does the system behave when one region is unavailable?
- What consistency does the product actually require?
- How do you deploy without downtime?
- How do you detect corruption, overload, partial failure, or silent data loss?
- Which trade-offs were intentionally chosen?
- How do you know the system is healthy?
- What would break first at 10× scale?
- What is the operational burden of the design?
- What is the cheapest architecture that satisfies the requirements?

Use four stages:

### Stage 1 — Fundamentals
Learn request/response flow, HTTP, networking, processes, threads, databases, APIs, authentication, testing, and deployment.

### Stage 2 — Production Backend Engineering
Learn caching, queues, retries, observability, performance, Docker, Kubernetes, CI/CD, schema migrations, API compatibility, and reliability.

### Stage 3 — Senior Engineering
Learn distributed systems, service boundaries, replication, sharding, consistency, failure isolation, capacity planning, multi-region systems, and architecture trade-offs.

### Stage 4 — Staff Engineering
Learn cross-team architecture, platform thinking, migration strategies, organizational scaling, reliability governance, cost trade-offs, technical direction, and long-term system evolution.

---

# 2. What a Backend System Actually Is

A backend is the server-side system responsible for receiving requests, applying business rules, accessing data, communicating with other systems, and returning results.

A production backend may include:

```text
Client
  |
  v
DNS
  |
  v
CDN / WAF
  |
  v
Load Balancer
  |
  v
API Gateway / Reverse Proxy
  |
  v
Application Service
  |       |       \
  |       |        \--> Cache
  |       |
  |       +-----------> Database
  |
  +-------------------> Message Broker
                            |
                            v
                       Background Workers
                            |
                            v
                      External Systems
```

Backend engineering includes:

- APIs
- business logic
- persistence
- communication
- concurrency
- performance
- security
- observability
- deployment
- reliability
- scalability
- failure handling
- operations

A framework is only a small part of backend engineering.

---

# 3. Backend Engineering Mental Model

Think about every backend request as a pipeline:

```text
Receive
  -> Authenticate
  -> Authorize
  -> Validate
  -> Execute business logic
  -> Read/write state
  -> Call dependencies
  -> Publish events
  -> Produce response
  -> Record telemetry
```

For every stage ask:

1. Can it fail?
2. Can it be slow?
3. Can it be called twice?
4. Can requests arrive out of order?
5. Can two requests modify the same state concurrently?
6. What happens if the process crashes here?
7. Is the operation transactional?
8. What should be retried?
9. What must never be retried automatically?
10. How will operators know something is wrong?

This way of thinking is more valuable than memorizing frameworks.

---

# 4. Computer Science Foundations You Must Know

Backend engineers need practical mastery of:

## Data structures

Know complexity and behavior of:

- arrays
- linked lists
- stacks
- queues
- deques
- hash maps
- hash sets
- trees
- binary search trees
- balanced trees
- heaps
- tries
- graphs
- bloom filters
- skip lists
- ring buffers
- LRU caches

Understand:

```text
lookup
insert
delete
iteration
memory overhead
ordering guarantees
concurrency behavior
```

## Algorithms

Important backend-oriented areas:

- sorting
- searching
- hashing
- graph traversal
- shortest paths
- consistent hashing
- rate-limiting algorithms
- scheduling
- compression
- checksums
- string matching
- probabilistic algorithms

## Complexity

Understand:

- Big-O
- amortized complexity
- space complexity
- network complexity
- disk I/O complexity

A theoretically O(1) operation may still be expensive if it causes network or disk I/O.

---

# 5. Operating System Fundamentals

Backend programs run on an operating system. Ignoring the OS creates mysterious production problems.

Understand:

- process
- thread
- virtual memory
- page
- page fault
- context switch
- syscall
- kernel
- user space
- file descriptor
- socket
- signal
- scheduler
- filesystem
- buffer cache
- mmap
- CPU cache
- NUMA basics
- limits such as open files

## File descriptors

Sockets, files, pipes, and many OS resources consume file descriptors.

If the process reaches the descriptor limit:

```text
too many open files
```

possible symptoms include:

- inability to accept connections
- failed file access
- failed outbound requests

Always close resources.

## CPU

CPU-bound workloads include:

- compression
- encryption
- image processing
- serialization
- regex-heavy work
- cryptographic hashing

I/O-bound workloads include:

- database calls
- network calls
- filesystem operations

This distinction affects concurrency models and scaling.

---

# 6. Networking Fundamentals

You should understand the rough packet path:

```text
Application
  -> socket
  -> TCP/UDP
  -> IP
  -> network
  -> remote IP
  -> TCP/UDP
  -> socket
  -> application
```

## IP

Know:

- IPv4
- IPv6
- private vs public IP
- subnet
- CIDR
- routing
- NAT
- gateway

## TCP

TCP provides:

- reliable byte stream
- ordered delivery
- retransmission
- congestion control
- flow control

Know:

- three-way handshake
- SYN
- SYN-ACK
- ACK
- connection teardown
- retransmission
- packet loss
- receive/send buffers
- keepalive
- TIME_WAIT

## UDP

UDP provides datagrams without TCP's reliability semantics.

Useful for:

- DNS
- media
- telemetry
- certain RPC transports
- custom protocols

## Latency

Latency can come from:

- DNS lookup
- TCP connection
- TLS handshake
- load balancer
- queueing
- application processing
- database
- cache
- network hop
- remote dependency
- serialization
- lock contention

Senior engineers decompose latency rather than saying "the API is slow."

---

# 7. DNS, Proxies, Load Balancers, and CDNs

## DNS

DNS maps names to addresses.

Understand:

- A
- AAAA
- CNAME
- TXT
- MX
- NS
- TTL
- recursive resolver
- authoritative name server
- propagation

DNS is cached. Changing a DNS record does not mean all clients immediately see the new value.

## Reverse proxy

A reverse proxy sits in front of backend services.

Responsibilities may include:

- TLS termination
- routing
- compression
- authentication
- rate limiting
- request size limits
- logging

Examples include NGINX, Envoy, HAProxy, Traefik, cloud gateways.

## Load balancing

Common algorithms:

- round robin
- weighted round robin
- least connections
- least requests
- random
- power of two choices
- consistent hashing

Layer 4 load balancing works at transport level.

Layer 7 understands HTTP/application-level information.

## CDN

A CDN caches content closer to users.

Backend engineers should understand:

- cache key
- TTL
- purge/invalidation
- stale content
- origin shielding
- signed URLs
- edge authentication
- cache-control headers

---

# 8. HTTP Fundamentals

HTTP is foundational.

Understand request structure:

```http
POST /orders HTTP/1.1
Host: api.example.com
Authorization: Bearer ...
Content-Type: application/json
Idempotency-Key: abc123

{
  "productId": "p1",
  "quantity": 2
}
```

Response:

```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: /orders/o123

{
  "id": "o123"
}
```

## Important HTTP methods

- GET
- POST
- PUT
- PATCH
- DELETE
- HEAD
- OPTIONS

## Safe methods

A safe method should not intentionally modify server state.

GET and HEAD are expected to be safe.

## Idempotent methods

Calling an idempotent operation repeatedly should have the same intended effect as calling it once.

Typically:

- GET: idempotent
- PUT: idempotent
- DELETE: intended to be idempotent
- POST: not inherently idempotent

## Status codes

Know at least:

### 2xx
- 200 OK
- 201 Created
- 202 Accepted
- 204 No Content

### 3xx
- 301 Moved Permanently
- 302 Found
- 304 Not Modified
- 307 Temporary Redirect
- 308 Permanent Redirect

### 4xx
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 412 Precondition Failed
- 413 Payload Too Large
- 415 Unsupported Media Type
- 422 Unprocessable Content
- 429 Too Many Requests

### 5xx
- 500 Internal Server Error
- 502 Bad Gateway
- 503 Service Unavailable
- 504 Gateway Timeout

Do not return `200` for every result.

---

# 9. HTTPS, TLS, and Certificates

HTTPS is HTTP over TLS.

TLS provides:

- confidentiality
- integrity
- server authentication
- optionally client authentication

Understand:

- certificate authority
- certificate chain
- hostname verification
- public/private key
- symmetric encryption
- asymmetric cryptography
- handshake
- session resumption
- certificate expiry
- mTLS

Never disable certificate verification in production merely to "fix" TLS problems.

## mTLS

Mutual TLS authenticates both client and server.

Useful for:

- service-to-service authentication
- zero-trust environments
- internal APIs

Operational costs include:

- certificate rotation
- trust management
- revocation
- debugging complexity

---

# 10. Backend Runtime Models

Common runtime approaches:

## Thread-per-request

Each request is handled by a thread.

Advantages:

- intuitive programming model

Risks:

- many blocked threads
- context switching
- memory per thread

## Event loop

A smaller number of threads handles many I/O operations asynchronously.

Common in Node.js.

Benefits:

- efficient I/O concurrency

Risk:

- CPU-heavy work blocks the event loop

## Goroutine model

Go uses lightweight goroutines multiplexed over OS threads.

Benefits:

- simple concurrency model
- good I/O scaling

Still possible to create:

- deadlocks
- leaks
- races
- overload

## Async/await

Python, JavaScript, C#, Rust, and others support asynchronous I/O.

Async is not automatically faster. It is mainly a concurrency mechanism.

---

# 11. Processes, Threads, Coroutines, and Event Loops

## Process

A process has:

- virtual address space
- resources
- file descriptors
- threads

## Thread

Threads share process memory.

Advantages:

- low communication overhead

Risks:

- data races
- synchronization complexity

## Coroutine/fiber/goroutine

A lightweight unit of execution managed partly or fully by runtime.

Do not confuse concurrency with parallelism.

```text
Concurrency = multiple tasks make progress
Parallelism = multiple tasks execute at the same instant
```

---

# 12. Concurrency and Synchronization

Concurrency bugs are among the hardest production bugs.

Understand:

- race condition
- critical section
- mutex
- read/write lock
- semaphore
- atomic operation
- condition variable
- channel
- monitor
- deadlock
- livelock
- starvation

## Deadlock conditions

Classically:

1. mutual exclusion
2. hold and wait
3. no preemption
4. circular wait

Break at least one condition to prevent deadlocks.

## Race example

```text
balance = 100

Request A reads 100
Request B reads 100

A subtracts 30 -> writes 70
B subtracts 50 -> writes 50

Expected: 20
Actual: 50
```

Solutions may include:

- database atomic update
- optimistic concurrency
- locking
- serialization
- queues
- compare-and-swap

---

# 13. Memory Management and Garbage Collection

Know:

- stack
- heap
- allocation
- escape
- object lifetime
- garbage collection
- memory leak
- fragmentation

GC may cause:

- CPU consumption
- pauses
- latency variance

Memory leaks can come from:

- unbounded maps
- listeners
- goroutine/task leaks
- cached data
- retained object graphs
- buffers
- accidental global references

Track:

- heap size
- allocation rate
- GC pause
- RSS
- container memory limit
- OOM kills

---

# 14. Backend Languages and Runtime Trade-offs

There is no universal best language.

## Go

Strengths:

- simple concurrency
- strong networking ecosystem
- easy static binaries
- good operational characteristics

Trade-offs:

- explicit error handling
- less expressive type system than some languages

## Java/Kotlin

Strengths:

- mature ecosystem
- excellent performance
- sophisticated JVM tooling
- strong enterprise frameworks

Trade-offs:

- memory footprint
- JVM tuning complexity in some workloads

## TypeScript/Node.js

Strengths:

- fast development
- excellent web ecosystem
- shared frontend/backend language

Trade-offs:

- event-loop blocking
- runtime type gap
- dependency ecosystem risk

## Python

Strengths:

- development speed
- AI/data ecosystem
- strong web frameworks

Trade-offs:

- lower raw CPU throughput for many workloads
- GIL implications depending on runtime/workload
- async complexity

## Rust

Strengths:

- memory safety
- high performance
- predictable resource behavior

Trade-offs:

- steeper learning curve
- slower development for some teams

Staff engineers optimize for the organization, not language ideology.

---

# 15. Application Structure and Layering

A maintainable backend separates concerns.

Example:

```text
src/
  transport/
  controllers/
  usecases/
  domain/
  repositories/
  infrastructure/
  clients/
  config/
  observability/
```

Possible responsibilities:

## Transport
HTTP/gRPC-specific behavior.

## Application/use-case layer
Coordinates business operations.

## Domain
Business rules and invariants.

## Repository
Persistence abstraction where useful.

## Infrastructure
Database implementations, queues, external clients.

Avoid unnecessary abstractions.

A repository interface that simply mirrors every database call can create noise instead of value.

---

# 16. API Design Fundamentals

Good APIs are:

- predictable
- stable
- secure
- observable
- documented
- easy to evolve
- resistant to misuse

Questions to answer:

- What is the resource?
- Who can access it?
- What validation applies?
- Is the operation idempotent?
- What is the consistency expectation?
- What happens if dependency calls partially fail?
- What is the retry behavior?
- How is pagination handled?
- What limits apply?
- How is backward compatibility maintained?

---

# 17. REST APIs

REST is an architectural style.

Prefer resource-oriented endpoints:

```text
GET    /users/{id}
POST   /users
PATCH  /users/{id}
DELETE /users/{id}

GET    /users/{id}/orders
POST   /orders
```

Avoid RPC-like REST when resource semantics are natural:

```text
POST /createUser
POST /deleteUser
POST /getUser
```

Not every API must be perfectly RESTful. Practical consistency matters more.

## PUT vs PATCH

PUT generally represents replacement of a resource representation.

PATCH represents partial update.

## Conditional requests

Use mechanisms like:

```http
If-Match: "etag-value"
```

to prevent lost updates.

---

# 18. RPC and gRPC

RPC models remote calls like local method calls.

gRPC commonly uses Protocol Buffers.

Advantages:

- strongly typed contracts
- generated clients
- efficient binary encoding
- streaming
- HTTP/2

Challenges:

- browser support complexity
- debugging less human-readable
- schema evolution discipline required

Types of gRPC calls:

- unary
- server streaming
- client streaming
- bidirectional streaming

Use deadlines.

Never let RPC calls wait forever.

---

# 19. GraphQL

GraphQL allows clients to request selected fields.

Advantages:

- flexible client queries
- typed schema
- fewer endpoint-specific payloads

Challenges:

- N+1 queries
- query complexity
- authorization
- caching
- observability
- expensive nested queries

Use:

- DataLoader/batching
- query depth limits
- complexity limits
- persisted queries where appropriate
- field-level authorization

Do not expose the entire internal data model automatically.

---

# 20. WebSockets, SSE, and Real-Time Systems

## WebSockets

Persistent bidirectional connection.

Useful for:

- chat
- collaborative editing
- multiplayer
- dashboards
- trading data

Challenges:

- connection lifecycle
- fan-out
- load balancing
- reconnects
- authentication refresh
- backpressure
- state synchronization

## Server-Sent Events

Server-to-client streaming over HTTP.

Useful when only server push is needed.

## Polling

Simple and often sufficient.

Do not choose WebSockets merely because "real time" sounds advanced.

---

# 21. Serialization and Data Formats

Common formats:

- JSON
- Protocol Buffers
- Avro
- MessagePack
- XML
- CSV

Trade-offs:

```text
JSON:
+ human-readable
+ ubiquitous
- larger payload
- weaker schema discipline

Protobuf:
+ compact
+ typed
+ fast
- requires schema/tooling

Avro:
+ strong schema evolution for data pipelines
+ common in Kafka ecosystems
```

Always think about schema evolution.

---

# 22. Validation, Errors, and API Contracts

Validation layers:

1. syntactic validation
2. schema validation
3. semantic validation
4. authorization
5. business invariant validation

Example:

```text
quantity must be integer       -> schema
quantity > 0                   -> semantic/business validation
user owns account              -> authorization
inventory sufficient           -> business invariant
```

Error responses should be consistent.

Example:

```json
{
  "code": "INSUFFICIENT_INVENTORY",
  "message": "Requested quantity is unavailable",
  "requestId": "..."
}
```

Do not expose:

- SQL errors
- stack traces
- secrets
- internal hostnames
- dependency credentials

---

# 23. Pagination, Filtering, Sorting, and Search

## Offset pagination

```text
?page=5&limit=50
```

Simple, but large offsets can be expensive and results may shift during updates.

## Cursor pagination

```text
?after=eyJpZCI6...
```

Better for large changing datasets.

Cursor design should include stable ordering.

Example:

```text
ORDER BY created_at DESC, id DESC
```

The tie-breaker prevents ambiguous ordering.

---

# 24. API Versioning and Compatibility

Versioning strategies:

- path: `/v1/users`
- header
- media type
- date/version negotiation

Prefer additive changes when possible.

Usually safe:

- add optional response field
- add optional request field with sensible default

Potentially breaking:

- remove field
- rename field
- change type
- change semantics
- make optional field required
- change enum assumptions

Compatibility includes behavior, not only schema.

---

# 25. Idempotency and Duplicate Prevention

Distributed systems naturally produce duplicates.

Example payment API:

```http
POST /payments
Idempotency-Key: order-123-payment
```

Server stores:

```text
(idempotency_key, request_hash, response, status)
```

If repeated:

- same key + same payload -> return previous result
- same key + conflicting payload -> reject

Idempotency storage requires retention policy.

Do not assume exactly-once delivery eliminates the need for idempotent business logic.

---

# 26. Authentication

Authentication answers:

> Who are you?

Methods:

- password
- session
- API key
- JWT
- OAuth/OIDC
- mTLS
- signed request
- passkey
- service identity

Authentication is different from authorization.

---

# 27. Authorization

Authorization answers:

> What are you allowed to do?

Models:

## RBAC

Role-Based Access Control.

```text
admin -> all
editor -> write
viewer -> read
```

## ABAC

Attribute-Based Access Control.

Example:

```text
allow if:
user.department == resource.department
AND resource.classification <= user.clearance
```

## ReBAC

Relationship-Based Access Control.

Useful for:

- Google Drive-like sharing
- repositories
- organizations
- nested ownership models

Always enforce authorization on the server.

---

# 28. Sessions, Cookies, JWTs, and Tokens

## Server-side session

Cookie stores opaque session identifier.

Server stores session state.

Benefits:

- revocation is straightforward
- compact cookie

Costs:

- session store

## JWT

JWT is a signed token format.

It is not automatically encrypted.

JWT risks:

- long-lived stolen tokens
- oversized claims
- weak revocation
- incorrect signature validation
- trusting unverified algorithms

Validate:

- signature
- issuer
- audience
- expiration
- not-before where relevant
- token type

## Cookies

Security flags:

- Secure
- HttpOnly
- SameSite

Understand CSRF implications.

---

# 29. OAuth 2.0 and OpenID Connect

OAuth 2.0 is primarily authorization delegation.

OIDC adds identity.

Important roles:

- resource owner
- client
- authorization server
- resource server

Important flows:

- Authorization Code + PKCE
- Client Credentials
- Device Authorization

Avoid obsolete/insecure flows when modern alternatives exist.

OIDC concepts:

- ID token
- access token
- refresh token
- discovery document
- JWKS
- issuer
- claims
- nonce
- state

Never treat an access token as an ID token without understanding the provider's contract.

---

# 30. Backend Security Fundamentals

Security is a system property.

Know major risk classes:

- injection
- broken access control
- authentication failures
- SSRF
- CSRF
- XSS interactions
- insecure deserialization
- path traversal
- request smuggling
- secret leakage
- dependency vulnerabilities
- command injection
- insecure direct object reference
- race-condition abuse
- business logic abuse

## SQL injection

Bad:

```text
"SELECT * FROM users WHERE id = " + input
```

Use parameterized queries.

## SSRF

Attackers manipulate your server into making requests to internal or sensitive endpoints.

Mitigations:

- allowlists
- block private/internal address ranges where appropriate
- URL parsing validation
- redirect controls
- network policy

## Passwords

Store passwords using password hashing algorithms such as:

- Argon2id
- bcrypt
- scrypt

Do not store reversible passwords.

---

# 31. Secrets and Key Management

Secrets include:

- database credentials
- API tokens
- TLS private keys
- encryption keys
- OAuth client secrets

Do not:

- commit secrets
- put secrets in logs
- bake secrets into images
- return secrets in APIs

Use secret managers where possible.

Plan for:

- rotation
- expiry
- revocation
- audit
- least privilege
- emergency access

---

# 32. Database Fundamentals for Backend Engineers

You should be comfortable with:

- relational databases
- document databases
- key-value databases
- wide-column databases
- time-series databases
- graph databases
- vector databases
- object storage

Do not choose a database based on popularity.

Choose based on:

- query model
- consistency
- transaction needs
- scale
- latency
- operational maturity
- data shape
- indexing
- team expertise
- cost

A backend engineer must understand how application behavior affects the database.

---

# 33. Transactions and Isolation

ACID:

- Atomicity
- Consistency
- Isolation
- Durability

Isolation anomalies include:

- dirty read
- non-repeatable read
- phantom read
- lost update
- write skew

Isolation levels vary by database.

Typical labels:

- Read Uncommitted
- Read Committed
- Repeatable Read
- Serializable

Do not infer exact semantics solely from the name; database implementations differ.

Keep transactions short.

Avoid:

- network calls inside long database transactions
- user interaction while holding locks
- huge transaction batches without need

---

# 34. Indexing and Query Performance

Indexes trade write/storage cost for faster reads.

Understand:

- B-tree
- B+ tree
- hash index
- composite index
- covering index
- partial index
- unique index
- full-text index

Composite index order matters.

Example index:

```text
(tenant_id, created_at)
```

may support queries starting with `tenant_id`, but not necessarily queries only on `created_at`.

Use query plans.

Know:

- full table scan
- index scan
- index-only scan
- join strategy
- cardinality estimation
- selectivity
- statistics

---

# 35. ORMs and Query Builders

ORM benefits:

- productivity
- type mapping
- common CRUD
- migrations

ORM risks:

- N+1 queries
- hidden transactions
- inefficient joins
- accidental large object loading
- weak visibility into SQL

Senior backend engineers inspect generated SQL.

## N+1

```text
1 query to load 100 orders
100 queries to load customer for each order
```

Possible fixes:

- joins
- eager loading
- batching
- DataLoader-style access

Use abstractions without losing understanding of the database.

---

# 36. Connection Pools

Opening a database connection per request is often expensive.

Pools reuse connections.

Important settings:

- maximum pool size
- minimum idle
- connection timeout
- idle timeout
- max lifetime

Too large a pool can overload the database.

Example:

```text
100 service pods × 100 DB connections = 10,000 connections
```

The database may not tolerate that.

Pool sizing must be system-wide, not per-process in isolation.

---

# 37. Caching

Caching improves latency and reduces load.

Types:

- client cache
- CDN cache
- reverse-proxy cache
- application in-memory cache
- distributed cache
- database cache

Patterns:

## Cache-aside

```text
read cache
if miss:
    read DB
    write cache
return
```

## Write-through

Write cache and backing store in coordinated path.

## Write-behind

Cache writes asynchronously to backing store.

Riskier durability semantics.

## Invalidation

Hardest part of caching.

Strategies:

- TTL
- explicit invalidation
- versioned keys
- event-driven invalidation

Watch for:

- cache stampede
- cache penetration
- hot keys
- stale data

---

# 38. Redis in Backend Systems

Redis is useful for:

- caching
- sessions
- counters
- leaderboards
- rate limiting
- short-lived coordination
- queues/streams in appropriate cases

Common structures:

- string
- hash
- list
- set
- sorted set
- stream
- bitmap
- HyperLogLog

Risks:

- treating Redis as infinitely available
- unbounded key growth
- large values
- hot keys
- unsafe distributed locks
- persistence assumptions

Understand eviction policies and memory limits.

---

# 39. Messaging and Event-Driven Systems

Messaging decouples producers and consumers.

Use cases:

- asynchronous workflows
- fan-out
- integration
- buffering
- retryable processing
- event pipelines

Key concepts:

- broker
- topic
- queue
- partition
- producer
- consumer
- offset
- acknowledgment
- retention
- ordering
- replay

Events should represent facts.

Example:

```text
OrderPlaced
PaymentAuthorized
ShipmentCreated
```

Avoid vague event names such as `ProcessData`.

---

# 40. Kafka

Kafka is a distributed event log.

Important concepts:

- topic
- partition
- broker
- producer
- consumer
- consumer group
- offset
- replication factor
- leader
- follower
- ISR
- retention
- compaction

## Ordering

Ordering is guaranteed within a partition, not across the entire topic.

Choose partition key carefully.

Example:

```text
key = order_id
```

ensures events for the same order remain ordered within a partition.

## Consumer group

Partitions are distributed among consumers in a group.

One partition is processed by at most one consumer in the same group at a time.

## Rebalancing

Consumers may rebalance when group membership changes.

Poorly designed consumers can create pauses.

## Producer durability

Understand:

- acknowledgments
- retries
- idempotent producer
- batching
- linger
- compression

## Consumer correctness

Commit offsets only after your chosen processing guarantee is satisfied.

---

# 41. RabbitMQ and Traditional Queues

Queues are useful for work distribution.

Concepts:

- exchange
- queue
- routing key
- binding
- acknowledgment
- prefetch
- dead-letter exchange

Differences from Kafka are architectural, not just performance.

Kafka emphasizes durable logs and replay.

Traditional message brokers often emphasize message routing and work queues.

Choose based on semantics.

---

# 42. Retries, Backoff, and Dead-Letter Queues

Retries are useful for transient failures.

Bad retry:

```text
retry immediately forever
```

Good retry behavior typically includes:

- maximum attempts
- exponential backoff
- jitter
- timeout
- retry classification

Example:

```text
1s
2s
4s
8s
```

Add jitter to avoid synchronized retries.

Do not retry permanent failures:

- invalid request
- authorization denied
- unsupported operation

## DLQ

Dead-letter queues store messages that repeatedly fail.

A DLQ requires an operational process:

- alert
- inspect
- fix
- replay
- audit

A DLQ nobody monitors is a graveyard.

---

# 43. Exactly-Once, At-Least-Once, and At-Most-Once

## At-most-once

May lose work, but avoids duplicates.

## At-least-once

Work is retried, so duplicates can occur.

Common in reliable distributed systems.

## Exactly-once

Usually requires carefully defined boundaries.

"Exactly once" across arbitrary external side effects is hard.

Prefer:

- at-least-once delivery
- idempotent processing
- deduplication

Example dedupe table:

```text
processed_messages(
    consumer_name,
    message_id,
    processed_at
)
```

---

# 44. Transactional Outbox and CDC

Problem:

```text
1. write order to DB
2. publish OrderCreated event
```

Crash between steps can create inconsistency.

Transactional outbox:

```text
DB transaction:
  INSERT order
  INSERT outbox event
COMMIT
```

A publisher later sends the outbox record.

CDC can stream database changes.

Important CDC concepts:

- log position
- ordering
- schema evolution
- replay
- duplicate handling
- tombstones
- consumer compatibility

---

# 45. Background Jobs and Schedulers

Use background jobs for:

- emails
- reports
- image processing
- cleanup
- billing
- exports
- reconciliation

Every job should consider:

- idempotency
- retries
- timeout
- cancellation
- progress
- concurrency
- dedupe
- scheduling
- observability
- poison jobs

Cron alone is not a reliability strategy.

For important jobs, record execution state.

---

# 46. Files, Object Storage, and Uploads

Do not store large user files inside application memory unnecessarily.

Typical flow:

```text
Client
  -> Backend requests presigned upload URL
  -> Client uploads directly to object storage
  -> Backend records metadata
```

Benefits:

- reduced application bandwidth
- fewer large request bodies
- better scaling

Consider:

- MIME validation
- actual content validation
- size limits
- checksums
- malware scanning
- encryption
- access control
- lifecycle policies
- retention
- multipart upload
- resumability

Do not trust file extension alone.

---

# 47. Search Systems

Databases can handle simple search.

Dedicated search engines become useful for:

- full-text relevance
- fuzzy matching
- faceting
- analyzers
- stemming
- typo tolerance
- ranking

Typical architecture:

```text
Primary DB
  -> CDC / events
  -> Search index
```

Search index is often derived state.

Plan:

- rebuild
- reindex
- alias switching
- schema changes
- lag monitoring

---

# 48. Monoliths, Modular Monoliths, and Microservices

## Monolith

One deployable application.

Advantages:

- simple deployment
- local transactions
- easier debugging
- lower operational overhead

## Modular monolith

One deployable unit with strong internal boundaries.

Often an excellent architecture.

## Microservices

Independent services.

Benefits:

- independent scaling
- ownership boundaries
- deployment independence

Costs:

- network failure
- distributed transactions
- versioning
- observability
- operational complexity
- duplicated infrastructure
- eventual consistency

Do not adopt microservices solely because large companies use them.

---

# 49. Service Boundaries and Domain Design

Good boundaries align with business capabilities.

Examples:

```text
Identity
Catalog
Orders
Payments
Shipping
Notifications
```

Bad boundaries often mirror tables:

```text
UserTableService
AddressTableService
OrderLineService
```

Signs a boundary may be wrong:

- frequent cross-service transactions
- chatty request chains
- shared database writes
- coordinated releases
- duplicated business rules

Bounded contexts are a useful DDD concept.

---

# 50. Distributed Systems Fundamentals

A distributed system is a system where components communicate over a network.

The network introduces:

- delay
- loss
- duplication
- reordering
- partitions
- partial failure

A key principle:

> Remote calls are not local function calls.

Local:

```text
result = calculate(x)
```

Remote:

```text
result = remoteService.calculate(x)
```

Remote call may:

- timeout
- partially succeed
- succeed after caller times out
- be executed twice after retry
- return stale data
- fail because DNS, TLS, proxy, or network failed

---

# 51. Consistency Models

Common models:

- strong consistency
- linearizability
- sequential consistency
- causal consistency
- eventual consistency
- read-your-writes
- monotonic reads

"Eventually consistent" does not mean incorrect.

It means convergence occurs after some delay.

Ask product questions:

- Can a user temporarily see old profile data?
- Can account balance be stale?
- Can two users buy the final inventory unit?
- Must order state transitions be strictly ordered?

Consistency is a business requirement, not a checkbox.

---

# 52. CAP and PACELC

CAP says that during a network partition, a distributed system cannot simultaneously guarantee both:

- strong consistency
- availability

while also tolerating the partition.

Partition tolerance is usually unavoidable in distributed systems.

PACELC extends the thinking:

```text
If Partition:
    Availability vs Consistency
Else:
    Latency vs Consistency
```

Do not use CAP as a simplistic database ranking system.

---

# 53. Replication

Replication copies data across nodes.

Reasons:

- availability
- read scaling
- disaster recovery
- lower read latency

Modes:

- synchronous
- asynchronous
- semi-synchronous

Topologies:

- leader/follower
- multi-leader
- leaderless

Risks:

- replication lag
- stale reads
- conflict
- failover split-brain
- lost acknowledged writes depending on durability semantics

Understand read-after-write behavior.

---

# 54. Sharding and Partitioning

Sharding distributes data across nodes.

Choose shard key carefully.

Good key properties:

- high cardinality
- balanced distribution
- query locality

Bad shard key can cause hot shards.

Strategies:

- hash sharding
- range sharding
- directory-based
- geographic sharding

Challenges:

- cross-shard queries
- cross-shard transactions
- resharding
- secondary indexes
- hot tenants

Virtual partitions can simplify rebalancing.

---

# 55. Distributed Transactions

A distributed transaction spans multiple independent systems.

Classic 2PC:

```text
Prepare
  -> participants vote
Commit/Abort
```

Problems:

- coordinator dependency
- blocking
- latency
- operational complexity

Use when strict atomicity is truly required and infrastructure supports it.

Otherwise consider workflow-based consistency.

---

# 56. Sagas

Saga = sequence of local transactions with compensating actions.

Example:

```text
Create Order
  -> Reserve Inventory
  -> Charge Payment
  -> Create Shipment
```

Failure after payment might trigger:

```text
Refund Payment
Release Inventory
Cancel Order
```

Compensation is not necessarily rollback.

Real-world actions can be irreversible.

Saga styles:

## Choreography
Services react to events.

## Orchestration
Central coordinator controls workflow.

Trade-offs:

- choreography can become hard to understand
- orchestration centralizes workflow logic

---

# 57. Distributed Locks and Coordination

Distributed locking is harder than local locking.

Problems:

- process pauses
- network partitions
- expired lease while work continues
- split-brain
- clock assumptions

A safer design may use fencing tokens.

Example:

```text
lock token 42 acquired
later lock expires
new worker gets token 43

storage rejects writes from token 42
```

Whenever possible, redesign to avoid global distributed locks.

---

# 58. Leader Election and Consensus

Consensus enables nodes to agree despite failures.

Know conceptually:

- leader
- term/epoch
- quorum
- log replication
- majority
- commit index

Protocols:

- Raft
- Paxos-family concepts

You do not need to implement consensus for ordinary applications, but Staff-level engineers should understand its role in:

- metadata systems
- configuration stores
- distributed databases
- cluster coordination

Do not build your own consensus algorithm for production.

---

# 59. Time, Clocks, Ordering, and IDs

Clocks on different machines are not perfectly synchronized.

Problems:

- clock drift
- NTP adjustment
- leap behavior
- time zone bugs

Use UTC internally where possible.

Do not rely solely on wall-clock timestamps for distributed ordering.

Identifiers:

- auto-increment
- UUID
- ULID
- Snowflake-style ID
- database sequence

Trade-offs include:

- sortability
- collision resistance
- decentralization
- index locality

---

# 60. Resilience Engineering

A resilient system expects failure.

Principles:

- timeouts
- bounded retries
- idempotency
- circuit breakers
- bulkheads
- backpressure
- graceful degradation
- health checks
- redundancy
- recovery testing

Reliability is not achieved by adding retries everywhere.

---

# 61. Timeouts

Every network call should have a sensible timeout.

Types:

- connection timeout
- request timeout
- read timeout
- write timeout
- idle timeout
- total deadline

Timeout budget should propagate.

Example:

```text
API deadline: 2s
  DB budget: 500ms
  Service B: 700ms
  remaining processing: 800ms
```

A child dependency should not receive a longer deadline than the parent request.

---

# 62. Retry Storms and Overload

Imagine:

```text
10,000 requests/s
dependency fails
each request retries 3 times
```

Dependency may suddenly receive ~40,000 attempts/s.

This can prevent recovery.

Use:

- retry budgets
- exponential backoff
- jitter
- circuit breakers
- load shedding
- bounded queues

Never retry blindly.

---

# 63. Circuit Breakers

Circuit breaker states:

```text
Closed
  -> failures exceed threshold
Open
  -> requests fail fast
Half-open
  -> test recovery
Closed
```

Useful for failing dependencies.

Do not use as a substitute for:

- timeout
- capacity planning
- graceful fallback

---

# 64. Rate Limiting

Algorithms:

- fixed window
- sliding window log
- sliding window counter
- token bucket
- leaky bucket

Token bucket supports bursts.

Define limit dimensions:

- per IP
- per user
- per API key
- per tenant
- per endpoint

Distributed rate limiting must handle:

- race conditions
- clock
- storage latency
- partition behavior

Return useful metadata when appropriate:

```http
429 Too Many Requests
Retry-After: 30
```

---

# 65. Bulkheads and Load Shedding

Bulkheads isolate resources.

Examples:

- separate connection pools
- separate worker pools
- per-tenant quotas
- different queues

If one subsystem becomes overloaded, it should not consume every shared resource.

Load shedding intentionally rejects some work to preserve overall health.

A fast `503` can be safer than letting the whole fleet collapse.

---

# 66. Backpressure

Backpressure tells producers to slow down when consumers cannot keep up.

Without backpressure:

```text
producer faster than consumer
  -> queue grows
  -> memory/disk grows
  -> latency grows
  -> failure
```

Mechanisms:

- bounded queues
- consumer credits
- TCP flow control
- rate limits
- concurrency limits
- Kafka lag-based scaling

Unbounded queues hide overload until it becomes catastrophic.

---

# 67. Observability

Observability helps understand internal system state from emitted signals.

Core signals:

- logs
- metrics
- traces

Also useful:

- profiles
- events
- audit logs

Golden signals:

- latency
- traffic
- errors
- saturation

Observability should answer:

- Is it broken?
- Who is affected?
- Since when?
- What changed?
- Where is latency?
- Which dependency is failing?
- Is this customer-specific?
- Are we near capacity?

---

# 68. Logging

Good logs are:

- structured
- contextual
- searchable
- safe

Example:

```json
{
  "level": "error",
  "message": "payment authorization failed",
  "requestId": "r123",
  "orderId": "o456",
  "provider": "payments-x",
  "errorCode": "TIMEOUT"
}
```

Avoid:

- secrets
- passwords
- raw tokens
- unnecessary PII
- giant payloads

Use log levels intentionally.

Do not log every normal request at error level.

---

# 69. Metrics

Metric types:

- counter
- gauge
- histogram
- summary

Useful metrics:

- request count
- error rate
- latency histogram
- queue depth
- consumer lag
- DB pool utilization
- cache hit ratio
- CPU
- memory
- GC
- thread/goroutine count

Beware high-cardinality labels.

Bad:

```text
user_id
request_id
email
```

as metric labels.

---

# 70. Distributed Tracing

Tracing follows requests across services.

Important concepts:

- trace
- span
- parent span
- trace ID
- span ID
- baggage/context

Trace example:

```text
API Gateway  800ms
  UserSvc    100ms
  OrderSvc   650ms
    DB       40ms
    PaySvc   580ms
```

Now the slow component is visible.

Propagate tracing context through:

- HTTP headers
- gRPC metadata
- message headers

---

# 71. SLIs, SLOs, SLAs, and Error Budgets

## SLI
Measured indicator.

Example:

```text
successful request ratio
```

## SLO
Target.

```text
99.95% successful requests per 30 days
```

## SLA
External commitment, often contractual.

## Error budget

If SLO allows 0.05% failure, that is your permitted unreliability budget.

Use error budgets to balance:

- reliability work
- feature velocity

---

# 72. Profiling and Performance Engineering

Optimize based on measurement.

Profile:

- CPU
- heap
- allocations
- lock contention
- blocking I/O
- goroutines/threads
- database queries

Performance workflow:

```text
measure
-> identify bottleneck
-> form hypothesis
-> change one thing
-> benchmark
-> validate production impact
```

Do not optimize random code paths.

Common bottlenecks:

- database
- serialization
- excessive allocations
- lock contention
- connection exhaustion
- remote calls
- logging
- unbounded fan-out

---

# 73. Capacity Planning

Estimate:

- requests per second
- peak multiplier
- payload size
- storage
- bandwidth
- connections
- queue throughput
- database IOPS
- cache memory

Example:

```text
100M requests/day
≈ 1,157 req/s average

Peak factor 10×
≈ 11,570 req/s peak
```

Always distinguish:

- average
- percentile
- peak

Storage example:

```text
10M events/day
1 KB/event
≈ 10 GB/day raw
≈ 3.65 TB/year raw
```

Then add:

- replication
- indexes
- metadata
- compression
- retention

---

# 74. Load Testing

Types:

- smoke
- load
- stress
- spike
- soak
- breakpoint

Do not test only average RPS.

Measure:

- p50
- p90
- p95
- p99
- throughput
- error rate
- saturation

Load test realistic data shapes.

A test with a single cached user ID may produce misleading results.

---

# 75. Testing Backend Systems

Testing pyramid/layers may include:

- unit tests
- integration tests
- component tests
- contract tests
- end-to-end tests
- performance tests
- chaos tests

Test business behavior, not implementation trivia.

Important scenarios:

- success
- invalid input
- unauthorized
- forbidden
- dependency timeout
- retry
- duplicate request
- concurrency
- partial failure
- cancellation

For database code, integration tests against a real database engine are often valuable.

---

# 76. Contract Testing

Contract tests validate compatibility between systems.

Consumer-driven contract testing can verify that provider changes do not break clients.

Contract areas:

- request fields
- response fields
- status codes
- event schema
- semantics

Schema compatibility tools are especially important in event-driven systems.

---

# 77. Chaos and Failure Testing

Test failure deliberately.

Examples:

- kill pod
- inject latency
- terminate DB connection
- make dependency return 500
- drop network packets
- fill disk
- throttle CPU
- stop Kafka broker

Goal:

- verify assumptions
- validate recovery
- improve confidence

Chaos testing without guardrails in production can be dangerous.

---

# 78. Configuration and Feature Flags

Configuration should be:

- explicit
- validated at startup
- observable
- safely changeable

Examples:

- environment variables
- config files
- remote config

Feature flags enable:

- gradual rollout
- experimentation
- kill switches
- decoupling deploy from release

Risks:

- stale flags
- combinatorial complexity
- inconsistent state

Every flag should have:

- owner
- purpose
- expiry/removal plan

---

# 79. Containers and Docker

A container packages application and dependencies while sharing the host kernel.

Understand:

- image
- layer
- container
- registry
- volume
- network
- namespace
- cgroup

Good images:

- minimal
- reproducible
- pinned where appropriate
- non-root
- no secrets
- correct health behavior

Use multi-stage builds.

Avoid copying development junk into runtime image.

---

# 80. Kubernetes

Core concepts:

- Pod
- Deployment
- StatefulSet
- Service
- ConfigMap
- Secret
- Ingress/Gateway
- Job
- CronJob
- DaemonSet
- Namespace
- PersistentVolume
- PersistentVolumeClaim

## Readiness

Can the pod receive traffic?

## Liveness

Should the container be restarted?

## Startup probe

Useful for slow-starting applications.

Bad probes can cause restart loops.

## Requests and limits

Requests influence scheduling.

Limits constrain resources.

CPU throttling and OOM behavior matter.

## Autoscaling

HPA may scale based on:

- CPU
- memory
- custom metrics
- queue lag

Scaling the application does not automatically scale the database.

---

# 81. Cloud Architecture Fundamentals

Know common cloud building blocks:

- compute
- object storage
- block storage
- managed databases
- load balancers
- CDN
- DNS
- message queues
- event buses
- IAM
- KMS
- VPC/networking
- monitoring
- secrets

Understand:

- availability zone
- region
- fault domain
- managed service trade-offs
- egress cost
- shared responsibility

Prefer managed services when their constraints are acceptable and operational savings are meaningful.

---

# 82. Serverless Backends

Serverless functions can be useful for:

- bursty APIs
- event handlers
- lightweight jobs
- glue workflows

Trade-offs:

- cold start
- execution limits
- connection management
- observability
- vendor coupling
- cost at sustained high throughput

Serverless is not "no servers." It means servers are abstracted from you.

---

# 83. CI/CD and Release Engineering

Pipeline stages often include:

```text
lint
-> type check
-> unit test
-> build
-> security scan
-> integration test
-> artifact publish
-> deploy
-> verification
```

Principles:

- build once, deploy same artifact
- immutable artifacts
- reproducible builds
- automated rollback where safe
- release auditability

Avoid rebuilding different binaries for each environment if unnecessary.

---

# 84. Deployment Strategies

## Rolling deployment

Gradually replaces instances.

## Blue/green

Two environments.

Switch traffic after verification.

## Canary

Small percentage receives new version.

Observe before expansion.

## Feature-flagged release

Code deploy and feature enablement are decoupled.

Understand backward compatibility during mixed-version deployments.

---

# 85. Database and Schema Migrations

Zero-downtime migration often follows expand/contract.

Example rename:

Bad:

```text
deploy code expecting new column
rename column instantly
old code breaks
```

Safer:

```text
1. add new column
2. deploy code writing both
3. backfill
4. switch reads
5. stop writing old
6. remove old column later
```

Migrations should consider:

- lock duration
- table size
- index build behavior
- replication lag
- rollback
- old application versions

Data migration and schema migration are different problems.

---

# 86. Multi-Region and Disaster Recovery

Goals:

- survive regional failure
- reduce latency
- satisfy compliance
- improve availability

Models:

- active/passive
- active/active
- region-local writes
- global writes

Challenges:

- conflict resolution
- replication lag
- DNS failover
- data residency
- session routing
- global uniqueness
- split-brain

## RPO

Maximum acceptable data loss.

## RTO

Maximum acceptable recovery time.

Backups are useful only if restores are tested.

---

# 87. Multi-Tenancy

Models:

## Shared database/shared schema

Tenant ID on rows.

Pros:
- efficient

Risks:
- isolation bugs

## Shared database/separate schema

More isolation.

## Database per tenant

Strong isolation.

Higher operational overhead.

Need:

- tenant authorization
- quotas
- noisy-neighbor protection
- tenant-aware metrics
- tenant-aware caching
- tenant-aware migrations
- deletion/export capabilities

Never trust tenant ID supplied by client without authorization validation.

---

# 88. Backend Architecture Patterns

Know these patterns and their trade-offs:

- layered architecture
- hexagonal architecture
- ports and adapters
- clean architecture
- modular monolith
- microservices
- event-driven architecture
- pipeline architecture
- actor model
- serverless
- strangler fig
- branch by abstraction
- sidecar
- backend for frontend

Patterns are tools, not goals.

---

# 89. CQRS and Event Sourcing

## CQRS

Separate command and query models.

Useful when read and write requirements differ significantly.

Costs:

- more infrastructure
- consistency complexity
- duplicated models

## Event sourcing

Store state transitions as events.

```text
AccountOpened
MoneyDeposited
MoneyWithdrawn
```

Current state is derived by replay.

Benefits:

- audit history
- temporal reconstruction

Challenges:

- schema evolution
- replay cost
- debugging
- external side effects
- event versioning

Do not use event sourcing merely because events are fashionable.

---

# 90. Service Mesh and API Gateways

## API Gateway

North-south traffic responsibilities may include:

- authentication
- routing
- rate limiting
- transformations
- quotas
- observability

## Service Mesh

East-west service communication concerns may include:

- mTLS
- retries
- traffic policy
- telemetry
- service identity

Risks:

- complexity
- hidden retry behavior
- difficult debugging
- resource overhead

Do not put business logic into infrastructure routing layers unless there is a strong reason.

---

# 91. Production Readiness

Before launch ask:

## Functional
- Are critical flows tested?
- Are edge cases handled?
- Are APIs documented?

## Security
- Authentication?
- Authorization?
- Secrets?
- Encryption?
- Dependency vulnerabilities?

## Reliability
- Timeouts?
- Retries?
- Circuit breakers?
- Backpressure?
- Failover?

## Operations
- Dashboards?
- Alerts?
- Runbooks?
- Ownership?
- On-call?

## Data
- Backup?
- Restore tested?
- Migration plan?
- Retention?
- Compliance?

## Capacity
- Expected load?
- Peak load?
- scaling limit?
- database capacity?

A feature is not production-ready because it works on a laptop.

---

# 92. Incident Response

During incidents:

1. establish severity
2. identify customer impact
3. stabilize system
4. communicate
5. mitigate
6. recover
7. verify
8. perform postmortem

Mitigation may include:

- rollback
- disable feature
- reduce traffic
- increase capacity
- fail over
- isolate dependency

Do not spend the first hour looking for the perfect root cause if a safe mitigation exists.

## Postmortem

Good postmortems are blameless and actionable.

Include:

- timeline
- impact
- detection
- root causes
- contributing factors
- what worked
- what failed
- action items

Avoid "human error" as the only root cause.

---

# 93. Cost Engineering

Backend architecture has financial consequences.

Cost categories:

- compute
- database
- storage
- network egress
- logs
- metrics
- tracing
- queue throughput
- CDN
- third-party API usage

Common cost problems:

- overprovisioned instances
- excessive retention
- unbounded logs
- cross-region traffic
- chatty microservices
- poor indexes
- inefficient serialization
- idle clusters

Staff engineers consider cost as a design dimension.

---

# 94. Common Backend Failure Modes

## Database connection exhaustion

Symptoms:

- timeouts
- connection acquisition failures

Causes:

- pool too large
- leaked connections
- slow queries
- too many replicas/pods

## Cache stampede

Many requests miss same key simultaneously.

Mitigations:

- request coalescing
- jittered TTL
- locking carefully
- stale-while-revalidate

## Thundering herd

Many clients wake/retry simultaneously.

Mitigate with jitter.

## Poison message

One message repeatedly crashes consumer.

Use:

- retry limit
- DLQ
- observability

## Hot partition

Bad key distribution overloads one partition.

## Cascading failure

Service A fails -> B retries -> C saturates -> entire system degrades.

Use isolation and bounded retry.

## Memory leak

Gradual RSS growth -> OOM.

## Thread/goroutine leak

Abandoned work accumulates.

## Unbounded queue

Latency grows until system becomes unusable.

## Retry after timeout causing duplicates

Caller times out but server succeeds.

Retry causes duplicate side effect.

Use idempotency.

## Partial write

One storage update succeeds while another fails.

Use transaction, outbox, or reconciliation.

## Stale cache

Authorization or data change not reflected.

Design invalidation intentionally.

---

# 95. System Design Interview Framework

Use this structure.

## Step 1 — Clarify requirements

Functional:

- What must the system do?

Non-functional:

- scale
- latency
- availability
- consistency
- durability
- security
- compliance
- geography

## Step 2 — Estimate scale

Estimate:

- DAU/MAU
- RPS
- peak RPS
- write/read ratio
- storage
- bandwidth

## Step 3 — Define APIs

Example:

```text
POST /orders
GET /orders/{id}
```

## Step 4 — Define data model

Identify:

- entities
- relationships
- indexes
- consistency needs

## Step 5 — Draw high-level architecture

```text
Client
 -> LB
 -> API
 -> DB
 -> Cache
 -> Queue
 -> Worker
```

## Step 6 — Deep dive

Choose the hardest parts:

- partitioning
- dedupe
- consistency
- fan-out
- search
- rate limiting
- transactions

## Step 7 — Failure analysis

Ask:

- What fails?
- What gets retried?
- What becomes stale?
- Where is the bottleneck?
- How do we recover?

## Step 8 — Trade-offs

State why you chose each major mechanism.

Senior interview answers contain reasoning, not technology lists.

---

# 96. Senior-Level Expectations

A Senior backend engineer should be able to:

- design production APIs
- model data
- reason about concurrency
- debug distributed failures
- design retries/idempotency
- choose storage correctly
- improve query performance
- create observability
- deploy safely
- handle incidents
- mentor engineers
- own services end-to-end
- understand security implications
- estimate capacity
- evaluate architecture trade-offs

A Senior engineer asks:

> What does this design do under failure and load?

not merely:

> Does this compile?

---

# 97. Staff-Level Expectations

Staff engineering is not simply "more coding."

Staff engineers influence systems across teams.

Core skills:

## Technical direction

- define architecture principles
- identify future scaling constraints
- avoid unnecessary complexity
- create migration paths

## Cross-team design

- API governance
- event schema governance
- platform standards
- shared reliability mechanisms

## Technical strategy

Staff engineers think in years, not only sprints.

Questions:

- Will this architecture support 10× growth?
- What should become a platform?
- Where are teams duplicating infrastructure?
- Which dependency creates organizational coupling?
- What is the migration path from current state?
- What can fail independently?
- What is our operational bottleneck?
- What architecture decision is difficult to reverse?

## Staff-level design document

A strong design document includes:

1. context
2. problem
3. requirements
4. non-goals
5. constraints
6. current architecture
7. proposed architecture
8. alternatives
9. data model
10. API/event contracts
11. consistency semantics
12. security
13. failure modes
14. observability
15. capacity
16. rollout
17. rollback
18. migration
19. operational ownership
20. cost
21. unresolved questions

## Staff-level migrations

Staff engineers often lead migrations such as:

- monolith to modular architecture
- synchronous to asynchronous workflow
- single-region to multi-region
- old auth system to new identity platform
- shared DB to isolated service ownership
- queue technology migration
- database engine migration
- API version migration

The ability to migrate safely is more valuable than drawing a perfect greenfield architecture.

---

# 98. Backend Design Exercises

Master these.

## Beginner

1. URL shortener API
2. Todo API
3. User authentication service
4. File upload service
5. Blog backend

## Intermediate

6. Rate limiter
7. Notification service
8. Background job platform
9. Webhook delivery system
10. Search autocomplete
11. API gateway
12. Audit log service
13. Chat backend
14. Image processing pipeline
15. Payment API

## Senior

16. Order processing system
17. Inventory reservation system
18. Distributed scheduler
19. Kafka-based ingestion platform
20. Multi-tenant SaaS backend
21. Ride-sharing backend
22. Real-time collaboration service
23. Metrics ingestion system
24. Feature flag service
25. Distributed cache
26. Global notification platform
27. Payment ledger
28. Idempotent workflow engine

## Staff

29. Multi-region payments platform
30. Company-wide identity platform
31. Internal developer platform
32. Global API platform
33. Event platform for hundreds of teams
34. Database migration program
35. Reliability platform
36. Central authorization platform
37. Multi-cloud service architecture
38. Global configuration platform
39. Company-wide observability platform
40. Large-scale workflow orchestration platform

For each exercise, answer:

- requirements
- APIs
- schema
- consistency
- scale
- partitioning
- caching
- async processing
- failure handling
- observability
- deployment
- security
- cost
- migration

---

# 99. Backend Mastery Checklist

Use this section as a self-assessment.

## Foundations

- [ ] Understand process vs thread
- [ ] Understand context switching
- [ ] Understand virtual memory
- [ ] Understand sockets
- [ ] Understand TCP vs UDP
- [ ] Understand DNS
- [ ] Understand TLS
- [ ] Understand HTTP
- [ ] Understand HTTP/2 conceptually
- [ ] Understand HTTP/3 conceptually
- [ ] Understand reverse proxies
- [ ] Understand load balancers
- [ ] Understand CDNs

## Backend programming

- [ ] Design maintainable application layers
- [ ] Handle cancellation
- [ ] Handle timeouts
- [ ] Avoid resource leaks
- [ ] Understand concurrency primitives
- [ ] Diagnose memory problems
- [ ] Diagnose CPU problems
- [ ] Use connection pools correctly

## APIs

- [ ] REST
- [ ] gRPC
- [ ] GraphQL
- [ ] WebSockets
- [ ] SSE
- [ ] validation
- [ ] status codes
- [ ] pagination
- [ ] filtering
- [ ] versioning
- [ ] idempotency
- [ ] API contracts

## Security

- [ ] authentication
- [ ] authorization
- [ ] sessions
- [ ] cookies
- [ ] JWT
- [ ] OAuth 2.0
- [ ] OIDC
- [ ] password hashing
- [ ] TLS
- [ ] mTLS
- [ ] SQL injection
- [ ] SSRF
- [ ] CSRF
- [ ] secrets management
- [ ] least privilege
- [ ] audit logging

## Data

- [ ] relational modeling
- [ ] transactions
- [ ] isolation
- [ ] indexes
- [ ] query plans
- [ ] ORMs
- [ ] connection pools
- [ ] replication
- [ ] partitioning
- [ ] schema migration
- [ ] backups
- [ ] restore procedures

## Caching

- [ ] cache-aside
- [ ] TTL
- [ ] invalidation
- [ ] stampede
- [ ] hot keys
- [ ] cache consistency
- [ ] Redis

## Messaging

- [ ] queue fundamentals
- [ ] Kafka
- [ ] RabbitMQ-like brokers
- [ ] consumer groups
- [ ] partitioning
- [ ] ordering
- [ ] retries
- [ ] DLQ
- [ ] dedupe
- [ ] outbox
- [ ] CDC
- [ ] idempotent consumer

## Distributed systems

- [ ] partial failure
- [ ] consistency models
- [ ] CAP
- [ ] PACELC
- [ ] replication
- [ ] sharding
- [ ] sagas
- [ ] 2PC
- [ ] distributed locks
- [ ] fencing
- [ ] consensus concepts
- [ ] clock issues
- [ ] globally unique IDs

## Reliability

- [ ] deadlines
- [ ] retries
- [ ] backoff
- [ ] jitter
- [ ] circuit breakers
- [ ] rate limiting
- [ ] bulkheads
- [ ] backpressure
- [ ] overload control
- [ ] graceful degradation

## Observability

- [ ] structured logs
- [ ] metrics
- [ ] histograms
- [ ] tracing
- [ ] correlation IDs
- [ ] dashboards
- [ ] actionable alerts
- [ ] SLI
- [ ] SLO
- [ ] error budgets

## Performance

- [ ] p50/p95/p99
- [ ] profiling
- [ ] CPU profiling
- [ ] memory profiling
- [ ] query profiling
- [ ] load testing
- [ ] stress testing
- [ ] soak testing
- [ ] capacity estimation

## Infrastructure

- [ ] Docker
- [ ] Kubernetes
- [ ] service discovery
- [ ] autoscaling
- [ ] health checks
- [ ] cloud networking
- [ ] IAM
- [ ] object storage
- [ ] managed databases
- [ ] secret managers

## Delivery

- [ ] CI
- [ ] CD
- [ ] artifact versioning
- [ ] rolling release
- [ ] blue/green
- [ ] canary
- [ ] rollback
- [ ] feature flags
- [ ] zero-downtime migrations

## Operations

- [ ] on-call
- [ ] incident response
- [ ] runbooks
- [ ] postmortems
- [ ] disaster recovery
- [ ] RPO
- [ ] RTO
- [ ] restore tests
- [ ] capacity alerts

## Senior

- [ ] own service end-to-end
- [ ] drive design reviews
- [ ] mentor teammates
- [ ] reduce operational risk
- [ ] reason about trade-offs
- [ ] lead incidents
- [ ] plan migrations

## Staff

- [ ] design across multiple teams
- [ ] define technical direction
- [ ] identify systemic risk
- [ ] simplify organization-wide architecture
- [ ] create reusable platforms
- [ ] lead multi-quarter migrations
- [ ] improve engineering standards
- [ ] balance reliability/cost/product velocity
- [ ] communicate architecture to technical and non-technical stakeholders

---

# 100. Suggested Learning Path

A practical progression:

## Phase 1 — Backend foundations

Learn:

- one backend language deeply
- HTTP
- REST
- SQL
- Git
- Linux
- Docker
- testing

Build:

```text
CRUD API
+ authentication
+ PostgreSQL
+ Docker
+ tests
```

## Phase 2 — Production backend

Add:

- Redis
- background jobs
- pagination
- validation
- logging
- metrics
- rate limiting
- migrations
- CI/CD

Build:

```text
production-style SaaS backend
```

## Phase 3 — Distributed backend

Learn:

- Kafka
- event-driven systems
- retries
- outbox
- idempotency
- service boundaries
- distributed tracing
- Kubernetes

Build:

```text
Order
Payment
Inventory
Notification
```

with asynchronous workflows.

## Phase 4 — Senior system design

Master:

- sharding
- replication
- capacity planning
- consistency
- failure handling
- multi-region
- observability
- reliability

Practice complete designs weekly.

## Phase 5 — Staff engineering

Study and practice:

- architecture documents
- migration design
- platform engineering
- cross-team APIs
- reliability programs
- cost optimization
- organizational coupling
- long-term technical strategy

At Staff level, focus on:

```text
How should many teams build and operate systems safely?
```

not only:

```text
How should I implement this endpoint?
```

---

# Appendix A — A Complete Request Lifecycle

Consider:

```text
POST https://api.example.com/orders
```

A simplified production path may be:

```text
1. Client resolves api.example.com using DNS.
2. Client opens TCP/QUIC connection.
3. TLS authenticates the server and establishes encryption.
4. Request reaches CDN/WAF.
5. WAF evaluates security rules.
6. Request reaches load balancer.
7. Load balancer chooses backend target.
8. API gateway applies routing/limits/auth policy.
9. Application accepts connection/request.
10. Middleware creates request context.
11. Trace context is parsed.
12. Authentication validates identity.
13. Authorization checks permissions.
14. Request body is decoded.
15. Schema validation runs.
16. Business validation runs.
17. Service acquires database connection from pool.
18. Database transaction begins.
19. Inventory is checked/reserved.
20. Order row is inserted.
21. Outbox event is inserted.
22. Transaction commits.
23. Connection returns to pool.
24. API serializes response.
25. Metrics are recorded.
26. Structured logs are emitted.
27. Trace span completes.
28. Response flows back to client.
29. Outbox publisher reads pending event.
30. Event is written to Kafka.
31. Notification consumer receives event.
32. Consumer deduplicates message.
33. Email provider is called with timeout/retry policy.
34. Consumer commits processing state.
```

Every numbered step can fail.

That is backend engineering.

---

# Appendix B — Latency Budget Example

Suppose your SLO is:

```text
p95 API latency <= 300ms
```

Possible budget:

```text
Edge/network        40ms
Gateway             10ms
Application CPU     20ms
Database            80ms
Cache               10ms
Dependency          90ms
Serialization       10ms
Safety margin       40ms
------------------------
Total               300ms
```

If a dependency has a 2-second timeout, the design is inconsistent with the API SLO.

---

# Appendix C — Failure Matrix

For every dependency, build a table like:

| Failure | Detection | Response | Retry? | User impact |
|---|---|---|---|---|
| Timeout | deadline | fallback/error | bounded | degraded |
| 400 | status | fix request | no | request rejected |
| 401 | status | refresh/auth | maybe | login needed |
| 429 | status | backoff | yes | slower |
| 500 | status | retry if safe | bounded | possible failure |
| connection refused | network error | fallback/retry | bounded | degraded |
| stale data | semantic check | refresh/reconcile | depends | inconsistent view |

Senior engineers think systematically about failure.

---

# Appendix D — Idempotent Consumer Pattern

Pseudo-code:

```text
begin transaction

if processed_messages contains message_id:
    commit
    return

apply business change

insert processed_messages(message_id)

commit
```

This pattern ensures duplicate delivery does not necessarily create duplicate business effects.

Still consider:

- message retention
- table growth
- unique constraints
- transaction boundaries

---

# Appendix E — Transactional Outbox Pattern

Tables:

```text
orders
------
id
status
...

outbox
------
id
aggregate_type
aggregate_id
event_type
payload
created_at
published_at
```

Transaction:

```text
BEGIN

INSERT INTO orders(...)

INSERT INTO outbox(...)

COMMIT
```

Publisher:

```text
read unpublished outbox rows
publish to broker
mark published
```

The publisher itself may publish more than once, so consumers should still be idempotent.

---

# Appendix F — Rate Limiter Design Notes

Token bucket state:

```text
tokens
last_refill_time
```

On request:

```text
elapsed = now - last_refill
tokens = min(capacity, tokens + elapsed * refill_rate)

if tokens >= cost:
    tokens -= cost
    allow
else:
    reject
```

Distributed implementations must perform update atomically.

Possible storage:

- Redis Lua/script/transaction
- local limiter + global limiter
- dedicated rate limit service

---

# Appendix G — Webhook Delivery System

A production webhook system needs:

```text
Event
 -> Subscription lookup
 -> Delivery job
 -> HTTP POST
 -> classify result
 -> retry
 -> DLQ / disable endpoint
```

Must include:

- signed payloads
- replay protection
- idempotency
- exponential backoff
- timeout
- per-destination concurrency
- rate limiting
- endpoint health
- delivery logs
- replay tooling

Do not allow one slow webhook customer to consume all workers.

---

# Appendix H — Payments Design Principles

Payment systems require strong correctness.

Important concepts:

- idempotency key
- immutable ledger
- reconciliation
- authorization vs capture
- refund
- chargeback
- external provider state
- webhook verification

Never assume the provider response is the only truth.

Use reconciliation.

A payment state machine may look like:

```text
CREATED
 -> AUTHORIZING
 -> AUTHORIZED
 -> CAPTURED

failure:
 -> FAILED

refund:
 CAPTURED -> REFUND_PENDING -> REFUNDED
```

Transitions should be validated.

---

# Appendix I — Inventory Reservation

Do not simply:

```text
read stock = 1
if stock > 0:
    write stock = 0
```

Two requests can oversell.

Possible approaches:

```sql
UPDATE inventory
SET available = available - 1
WHERE product_id = ?
  AND available > 0;
```

Then check affected row count.

For temporary reservations, include:

- reservation ID
- expiration
- release
- confirmation

A background reconciliation process is valuable.

---

# Appendix J — Retry Decision Table

Retry likely appropriate:

- connection reset
- gateway timeout
- temporary throttling
- transient dependency unavailable

Retry usually inappropriate:

- bad input
- authentication failure
- authorization failure
- semantic conflict requiring user action

For write operations, retry only when idempotency semantics are safe.

---

# Appendix K — API Security Checklist

For each endpoint:

- [ ] authenticated?
- [ ] authorized?
- [ ] tenant isolation checked?
- [ ] input validated?
- [ ] output data minimized?
- [ ] rate limited?
- [ ] request size limited?
- [ ] timeout enforced?
- [ ] sensitive logs avoided?
- [ ] SQL parameterized?
- [ ] outbound URLs validated?
- [ ] audit required?
- [ ] idempotency required?
- [ ] replay attack considered?

---

# Appendix L — Production Dashboard Checklist

A useful service dashboard should expose:

## Traffic
- requests/sec
- requests by endpoint
- requests by status class

## Latency
- p50
- p90
- p95
- p99

## Errors
- error rate
- top error codes
- dependency failures

## Saturation
- CPU
- memory
- worker utilization
- connection pool
- queue depth

## Dependencies
- DB latency
- cache latency
- external service latency
- Kafka lag

## Deployments
- version
- rollout time

Dashboards should help answer incidents, not merely look impressive.

---

# Appendix M — Alerting Principles

Alert on user-impacting symptoms where possible.

Better:

```text
checkout success rate < 99.5% for 10 minutes
```

Worse:

```text
CPU > 70%
```

CPU can be useful, but infrastructure metrics alone often produce noisy alerts.

Every page-level alert should ideally have:

- severity
- owner
- runbook
- dashboard
- action

---

# Appendix N — Graceful Shutdown

When process receives shutdown signal:

```text
1. stop accepting new traffic
2. mark readiness false
3. allow inflight requests to finish
4. stop consuming new jobs
5. commit/abandon work safely
6. flush telemetry where appropriate
7. close connections
8. exit before termination deadline
```

Without graceful shutdown, deployments can generate errors and duplicate work.

---

# Appendix O — Health Checks

Do not make liveness depend on every external dependency.

If database is temporarily unavailable and liveness fails, Kubernetes may restart every pod, worsening the incident.

Think separately:

```text
liveness = is this process fundamentally alive?
readiness = should it receive traffic?
dependency health = is a dependency working?
```

---

# Appendix P — Queue Worker Concurrency

Increasing worker concurrency is not always good.

If each job hits DB:

```text
100 workers × 50 instances = 5,000 concurrent DB operations
```

The database becomes the bottleneck.

Concurrency should be based on downstream capacity.

---

# Appendix Q — Fan-Out

A backend endpoint calling 20 services in parallel may reduce average latency but increase failure probability.

If each dependency succeeds 99.9% of the time:

```text
0.999^20 ≈ 98.0%
```

Overall request success can be lower than each dependency's success rate.

Minimize synchronous fan-out on critical paths.

---

# Appendix R — Consistency Decision Framework

Ask:

1. What invariant must never be violated?
2. What stale state can users tolerate?
3. How long can staleness last?
4. Is read-your-write required?
5. Can conflicting writes happen?
6. How should conflicts resolve?
7. What should happen during partition?
8. What is the business cost of inconsistency?
9. What is the latency cost of stronger consistency?

Use business requirements to choose technical semantics.

---

# Appendix S — Multi-Region Write Models

## Single writer region

```text
Region A: writes
Region B: reads/standby
```

Simple consistency, higher remote write latency.

## Home-region per entity

```text
tenant 1 -> region A
tenant 2 -> region B
```

Reduces conflicts.

## Active-active

Both regions accept writes.

Requires conflict handling.

Possible conflict strategies:

- last-write-wins
- version vectors
- domain-specific merge
- globally coordinated transactions

Do not choose active-active without a clear conflict model.

---

# Appendix T — Backend Design Review Questions

When reviewing a design, ask:

### Correctness
- What invariants exist?
- How are concurrent writes handled?
- Are duplicate messages safe?

### Reliability
- What happens when each dependency fails?
- What timeouts exist?
- Are retries bounded?

### Scalability
- What is the bottleneck at 10×?
- Can data be partitioned?
- Are there hot keys?

### Security
- Who can call this?
- How is authorization enforced?
- What sensitive data exists?

### Operability
- What dashboards exist?
- What alerts exist?
- How is it rolled back?

### Maintainability
- Who owns it?
- Is the complexity justified?
- Can another team understand it?

### Cost
- What drives cost?
- What happens at 10× traffic?

---

# Appendix U — Architecture Decision Record

Template:

```markdown
# ADR: <decision>

## Context
What problem are we solving?

## Decision
What are we choosing?

## Alternatives
What else was considered?

## Consequences
Positive and negative effects.

## Migration
How do we adopt it?

## Reversal
How difficult is it to change later?
```

Architecture decisions should preserve reasoning, not only final choices.

---

# Appendix V — Senior vs Staff Thinking

### Junior
"How do I implement this endpoint?"

### Mid-level
"How do I implement it cleanly and test it?"

### Senior
"How does this endpoint behave under concurrency, failure, and scale?"

### Staff
"Should this capability exist in this service at all, and how will this decision affect multiple teams over the next several years?"

---

# Appendix W — Final Principles

1. Prefer simple systems until complexity is justified.
2. Design for failure.
3. Every remote call needs a deadline.
4. Retries require idempotency and backoff.
5. Distributed systems produce duplicates.
6. Unbounded queues are dangerous.
7. A cache changes consistency semantics.
8. A database is not an infinitely scalable black box.
9. Measure before optimizing.
10. p99 matters.
11. Observability is part of the product.
12. Backups require restore testing.
13. Security belongs in architecture, not after launch.
14. Operational simplicity has enormous value.
15. Service boundaries should follow business ownership.
16. Microservices are not a maturity badge.
17. Staff engineers design migration paths, not only target architectures.
18. Reliability, cost, performance, and developer productivity are all design constraints.
19. Good architecture keeps options open where uncertainty is high.
20. The best design is the simplest one that satisfies the actual requirements.

---


# Appendix X — Advanced Networking and HTTP Details

## HTTP/1.1, HTTP/2, and HTTP/3

HTTP/1.1 commonly relies on persistent TCP connections and connection reuse. Reopening a connection for every request adds TCP and TLS handshake cost and can cause socket churn.

HTTP/2 uses binary framing and multiplexes multiple streams over one connection. It reduces the need for many parallel TCP connections, but packet loss on the underlying TCP connection can still affect multiple streams.

HTTP/3 runs over QUIC and improves stream independence and connection migration. It can reduce some head-of-line effects, but it does not fix slow application code, database queries, or overloaded dependencies.

Backend engineers should understand protocol behavior without assuming a newer protocol automatically improves every workload.

## Connection reuse

Outbound clients should usually be long-lived and reuse pools.

Avoid creating a brand-new HTTP client per request when the runtime/client library would otherwise support reuse.

Monitor:

- connection count
- idle connections
- per-host limits
- handshake rate
- connection errors
- connection age
- request deadlines

Excessive short-lived connections can contribute to ephemeral-port exhaustion and large `TIME_WAIT` populations.

## Proxy headers

Common proxy headers include:

```text
Forwarded
X-Forwarded-For
X-Forwarded-Proto
X-Forwarded-Host
```

Do not trust them from arbitrary clients. Configure the application to trust only known reverse proxies/load balancers that sanitize or overwrite them.

## Request and response streaming

Large payloads should often be streamed rather than fully buffered.

Benefits:

- lower peak memory
- earlier processing
- better handling of large objects

But streaming requires:

- backpressure
- cancellation
- bounded buffers
- partial-failure semantics
- checksum/integrity strategy

Once response headers are sent, changing the HTTP status code may no longer be possible.

## Body limits

Limit:

- compressed request size
- decompressed request size
- header size
- multipart part count
- nesting depth
- individual field length

Compression bombs and deeply nested payloads can become resource-exhaustion attacks.

---

# Appendix Y — Cancellation, Deadlines, and Request Lifecycles

A production request has a finite time budget.

Example:

```text
client budget      2.0s
gateway overhead   0.1s
application        0.2s
database           0.5s
remote service     0.7s
safety margin      0.5s
```

A downstream call should not get a fresh timeout longer than the parent request's remaining deadline.

Propagate cancellation through:

- HTTP clients
- gRPC calls
- database queries
- worker tasks

However, distinguish request cancellation from durable business workflow cancellation.

If the server already committed a payment, a disconnected client does not erase that fact. The durable operation must finish or reconcile independently of the vanished HTTP request.

---

# Appendix Z — Resource Pools and Hidden Bottlenecks

Backends commonly contain multiple pools:

```text
HTTP worker/thread pool
DB connection pool
HTTP outbound pool
DNS resolver pool
runtime worker pool
queue worker pool
```

A service with 1,000 concurrent requests and 20 DB connections may spend most of its time waiting for the DB pool. Increasing the pool to 1,000 may simply move overload into the database.

Track pool metrics:

- active
- idle
- max
- waiters
- acquisition latency
- timeout count

Pool sizing is a system-wide capacity problem.

Example:

```text
80 pods × 50 DB connections = 4,000 possible DB connections
```

Always multiply per-process settings by fleet size.

---

# Appendix AA — Graceful Startup and Shutdown

## Startup

Validate critical configuration before accepting traffic.

A service may choose to:

- fail fast on impossible configuration
- start unready while a temporary dependency is unavailable
- retry startup dependencies with exponential backoff and jitter

Avoid having thousands of restarted instances reconnect to the same database simultaneously.

## Shutdown

Typical shutdown sequence:

```text
1. receive termination signal
2. stop advertising readiness
3. stop accepting new work
4. finish or safely abandon in-flight requests
5. stop consuming new queue messages
6. release message leases safely
7. flush essential telemetry
8. close pools and sockets
9. exit before platform grace period ends
```

If the grace period expires, orchestrators may send an uncatchable kill signal.

---

# Appendix AB — Data Correctness Patterns

## Unique constraints

Do not rely only on:

```text
SELECT user WHERE email = x
if missing:
    INSERT
```

Concurrent requests can both see "missing."

Use a database unique constraint where uniqueness is a true invariant.

## Optimistic concurrency

Version field:

```text
id
status
version
```

Update:

```sql
UPDATE orders
SET status = 'SHIPPED', version = version + 1
WHERE id = ? AND version = ?;
```

Zero updated rows means another writer changed the record.

## Pessimistic concurrency

Row locks can serialize conflicting work, but introduce blocking and deadlock risk.

Keep lock scope and transaction duration small.

## Compare-and-set

CAS means:

```text
change value only if current value still equals expected value
```

It appears in database optimistic locking, atomic primitives, and distributed coordination.

---

# Appendix AC — State Machines

Explicit state machines prevent impossible combinations of booleans.

Example:

```text
PENDING
  -> AUTHORIZED
  -> CAPTURED
  -> REFUNDED

PENDING
  -> FAILED
```

For each transition define:

- allowed previous states
- authorization
- business preconditions
- database transaction
- external side effects
- idempotency behavior
- emitted events
- retry behavior
- recovery path

Persist a transition version or operation ID when concurrency matters.

---

# Appendix AD — Ambiguous Outcomes

One of the most important distributed-systems cases:

```text
client sends write
server commits write
response is lost
client times out
```

The caller does not know whether the operation succeeded.

Retries alone cannot solve this.

Use:

- idempotency key
- durable operation ID
- queryable operation state
- unique business constraint

Example:

```text
POST /payments
Idempotency-Key: order-891-payment
```

A retry should resolve to the same logical payment, not create a second payment.

Request IDs and idempotency keys are different:

```text
request ID      = one network attempt
idempotency key = one logical operation across attempts
```

---

# Appendix AE — Idempotency Storage Details

A robust idempotency record may contain:

```text
tenant_id
endpoint_scope
idempotency_key
request_hash
status
result_reference
response_code
created_at
expires_at
```

Possible states:

```text
IN_PROGRESS
COMPLETED
FAILED_RETRYABLE
```

Concurrent requests with the same key must not both execute the side effect.

If the same key arrives with a different payload, reject it rather than silently reusing a result.

Define retention based on the realistic retry/replay window.

---

# Appendix AF — Reconciliation

Distributed systems become inconsistent despite careful retries.

Reconciliation continuously compares authoritative states.

Example:

```text
our DB       = PAYMENT_PENDING
provider API = PAYMENT_CAPTURED
```

A reconciliation worker can:

1. select old unresolved records
2. query authoritative external state
3. compare expected vs observed
4. repair local state safely
5. emit missing follow-up event
6. record audit trail
7. alert on unexplained mismatch

Reconciliation is a first-class reliability mechanism for payments, inventory, billing, integrations, and migrations.

---

# Appendix AG — Financial Backend Details

## Money

Represent money with:

```text
amount
currency
```

Prefer exact decimal or integer-minor-unit representation where appropriate.

Do not use ordinary binary floating point for exact financial arithmetic.

Define:

- rounding mode
- currency precision
- exchange-rate source
- conversion timestamp

## Ledger

For financial systems, an immutable ledger is often safer than keeping only a mutable balance.

Double-entry principle:

```text
total debits = total credits
```

Useful properties:

- immutable entries
- unique transaction IDs
- auditability
- reconciliation
- deterministic balance calculation/materialization

---

# Appendix AH — Time, Time Zones, and Clocks

Different concepts:

```text
instant        = exact point in global time
local date     = calendar date such as 2026-08-17
local datetime = wall-clock date/time without universal meaning
time zone      = rules mapping local time to instants
duration       = elapsed amount
```

Use UTC for machine timestamps where practical, but preserve user/business timezone when rules depend on local civil time.

Use monotonic clocks for elapsed durations and timeouts where runtime provides them.

Wall clocks can move due to synchronization adjustments.

Do not rely on unsynchronized machine timestamps alone for total ordering across distributed nodes.

---

# Appendix AI — Read Replicas and Read-After-Write

Typical topology:

```text
writes -> primary
reads  -> replicas
```

Replication lag can produce:

```text
write profile
immediately read profile
old value appears
```

Options:

- route recent reads to primary
- session stickiness
- replication-position tokens where supported
- explicitly accept staleness

Document the chosen consistency semantics.

---

# Appendix AJ — Hot Rows, Hot Keys, and Contention

Hot resource examples:

- one global counter
- celebrity profile
- one giant tenant
- one Kafka partition
- one Redis key

Possible mitigation:

- sharded counters
- local aggregation
- dedicated tenant shard
- better partition key
- multi-level caching
- request coalescing

Cluster-average utilization can hide a single overloaded shard or key. Monitor distribution, not only averages.

---

# Appendix AK — Data Retention, Archival, and Deletion

Every durable dataset should define:

- owner
- retention
- archive policy
- deletion
- legal hold
- backup retention
- derived-data behavior

Deleting a primary row does not necessarily delete:

- cache
- search index
- event log
- warehouse copy
- backup
- object storage
- logs

Privacy and compliance require data lineage across the full architecture.

---

# Appendix AL — Encryption Architecture

Layers include:

- storage/disk encryption
- database encryption
- field/application-level encryption
- transport encryption

Application-level encryption provides stronger separation in some threat models but complicates:

- querying
- indexing
- key rotation
- migration

Use envelope encryption when appropriate:

```text
data -> encrypted with data key
data key -> encrypted with key-encryption key
```

Always store key version metadata and design rotation before deployment.

---

# Appendix AM — Service-to-Service Security

Private network location is not sufficient identity.

Possible workload identity mechanisms:

- mTLS
- cloud workload identity
- signed service tokens
- service mesh identity

Separate:

```text
authentication: which workload is this?
authorization: may this workload perform this action?
```

Apply least privilege to:

- database roles
- queue topics
- object-store prefixes
- cloud APIs

---

# Appendix AN — API Keys and Machine Credentials

API keys should have:

- high entropy
- owner
- scopes
- creation date
- optional expiry
- last-used metadata
- rotation
- revocation

Store only a hash of the secret when feasible.

Never log raw keys.

For high-security integrations, signed requests or workload identity may be better than long-lived bearer keys.

---

# Appendix AO — Webhook Security and Reliability

A production webhook sender/receiver must handle:

- signed payloads
- replay protection
- duplicate events
- event reordering
- retries
- timeout
- per-destination concurrency
- DLQ
- delivery audit
- endpoint health

Receiver verification commonly includes:

```text
HMAC(secret, timestamp + raw_payload)
```

Validate timestamp window and compare signatures safely.

If users configure callback URLs, outbound webhook infrastructure is an SSRF boundary. Restrict dangerous targets and revalidate redirects/resolution according to the security design.

---

# Appendix AP — Queue Visibility, Poison Messages, and Slow Consumers

A visibility/lease-based queue may hide a message while a worker processes it.

If lease expires before completion, another worker may receive the same message.

Therefore workers still need idempotency.

Poison messages fail deterministically. Do not retry forever.

Use:

```text
bounded retry -> DLQ -> alert -> inspect -> repair/replay
```

For slow consumers monitor:

- queue depth
- oldest message age
- processing latency
- retry count
- downstream saturation

Oldest-message age is often more informative than queue depth alone.

---

# Appendix AQ — Event Schema Evolution and Ownership

Every important event should define:

- owner
- semantic meaning
- unique event ID
- partition key
- ordering guarantee
- schema
- compatibility policy
- PII classification
- retention
- replay behavior

Prefer additive evolution.

Do not reuse removed field numbers in Protobuf or silently change field meaning in JSON/Avro events.

Schema compatibility does not guarantee semantic compatibility.

---

# Appendix AR — Events vs Commands

Event:

```text
OrderPlaced
```

means a fact already happened.

Command:

```text
ReserveInventory
```

asks a receiver to perform an action.

Treating every message as an "event" obscures ownership and semantics.

Use clear names and contracts.

---

# Appendix AS — Materialized Read Models

A derived read model can optimize expensive queries.

Example:

```text
orders + customers + payments
        |
        v
customer_order_summary
```

Update via:

- events
- CDC
- scheduled refresh
- application write path

Benefits:

- fast reads
- independent read scaling

Costs:

- staleness
- rebuild logic
- schema evolution

Whenever possible, derived state should be rebuildable from an authoritative source.

---

# Appendix AT — Safe Replays

Before replaying historical events ask:

- will emails resend?
- will payment providers be called again?
- will webhook customers receive duplicates?
- will mutable state regress?

Separate:

```text
rebuilding internal derived state
```

from:

```text
re-executing external side effects
```

Provide dry-run or side-effect-disabled replay modes where appropriate.

---

# Appendix AU — Background Jobs in Depth

Important job fields:

```text
job_id
job_type
payload/reference
status
attempt
run_at
locked_until
created_at
started_at
finished_at
last_error
```

Clarify:

- can jobs overlap?
- what happens after scheduler downtime?
- what does cancellation mean?
- how is progress represented?
- how is duplicate scheduling prevented?

A unique execution key such as:

```text
job_name + scheduled_time
```

can prevent duplicate cron executions across scheduler replicas.

---

# Appendix AV — Long-Running API Operations

For operations taking minutes, prefer:

```text
POST /exports
-> 202 Accepted
-> jobId
```

Then provide:

```text
GET /exports/{jobId}
```

with states such as:

```text
QUEUED
RUNNING
SUCCEEDED
FAILED
CANCEL_REQUESTED
CANCELLED
```

Persist enough state so a server restart does not lose the operation.

---

# Appendix AW — File Backend Deep Dive

A robust upload lifecycle might be:

```text
PENDING_UPLOAD
UPLOADED
SCANNING
READY
REJECTED
DELETED
```

Store metadata:

- object key
- owner/tenant
- content type
- detected type
- size
- checksum
- status
- created time

Do not trust file extension or client-provided MIME type.

For large files use multipart upload and lifecycle cleanup of abandoned parts.

Presigned download URLs should be short-lived and generated only after authorization.

---

# Appendix AX — Search Backend Deep Dive

Search indexes are frequently derived state.

Safe migration:

```text
create index_v2
backfill
catch up changes
compare results
switch alias
keep index_v1 for rollback
remove later
```

Measure not only latency but also quality:

- precision
- recall
- zero-result rate
- ranking quality

Search correctness differs from exact transactional lookup.

---

# Appendix AY — Multi-Tenant Isolation

Shared SaaS architecture must prevent tenant leakage at every layer:

- API authorization
- database predicates
- cache keys
- queue messages
- object keys
- search filters
- observability

Never trust a tenant ID supplied by the client without checking the authenticated caller's relationship to that tenant.

Noisy-neighbor controls:

- quotas
- per-tenant rate limits
- per-tenant concurrency
- dedicated shards for very large tenants

---

# Appendix AZ — Tenant Migration and Placement

As tenants grow, you may move:

```text
shared shard -> dedicated shard
```

A tenant-routing layer can map:

```text
tenant -> shard/cell/region
```

Migration needs:

1. snapshot/copy
2. change capture
3. catch-up
4. validation
5. routing cutover
6. rollback window

This routing abstraction is valuable for very large SaaS systems.

---

# Appendix BA — Zero-Downtime Data Migrations

Use expand/contract:

```text
1. add new schema
2. deploy code compatible with old + new
3. start writing new representation
4. backfill historical data
5. verify parity
6. switch reads
7. stop old writes
8. remove old schema later
```

Backfills should be:

- idempotent
- resumable
- checkpointed
- observable
- rate limited

Watch:

- DB CPU
- locks
- replication lag
- WAL/log growth
- disk usage

---

# Appendix BB — Dual Writes and Shadow Reads

Independent dual writes can diverge:

```text
write DB A succeeds
write DB B fails
```

Prefer one source of truth plus outbox/CDC.

During migration, shadow reads are useful:

```text
serve response from old system
read new system in background
compare normalized result
```

Comparison needs to tolerate legitimate nondeterminism such as timestamp formatting or eventually consistent fields.

---

# Appendix BC — Deployment Compatibility Windows

During rolling deployment:

```text
old code and new code coexist
```

Therefore:

- new DB schema must usually work with old code temporarily
- APIs/events should remain backward compatible
- new enum values may break old consumers

Rollback can be unsafe if new data is unreadable by old code.

Sometimes roll-forward is safer than rollback.

---

# Appendix BD — Canary, Shadow, and Dark Launches

## Canary

Send small real traffic percentage to new version and compare:

- errors
- p95/p99 latency
- saturation
- business metrics

## Shadow traffic

Duplicate production request to new version but ignore its result.

Ensure side effects are disabled or safely isolated.

## Dark launch

Deploy and exercise capability before exposing it broadly.

These techniques reduce release risk when used with good observability.

---

# Appendix BE — Kubernetes Production Details

## Probes

Liveness:

```text
is process fundamentally alive?
```

Readiness:

```text
should it receive traffic?
```

Startup probe:

```text
has slow startup completed?
```

Do not make liveness fail because every downstream dependency is temporarily unavailable; that can cause restart storms.

## Requests and limits

CPU limits can cause throttling.

Memory limits can cause OOM kills.

Measure actual working set and leave headroom for runtime/native buffers.

## Autoscaling

Autoscaling has lag:

```text
metric collection
-> decision
-> scheduling
-> image pull
-> startup
-> readiness
```

Keep enough headroom to survive that delay.

---

# Appendix BF — Cloud Failure Domains

Understand:

```text
instance
rack/fault domain
availability zone
region
provider
```

Two replicas in one zone do not protect against zone outage.

Multiple zones may still share:

- region-level control plane
- regional database
- regional DNS dependency

Map correlated failure, not just node count.

---

# Appendix BG — Multi-Region Design in Depth

Common models:

## Active/passive

One region serves writes; another stands by.

Simpler consistency and conflict model.

## Home-region

Each tenant/user has one write region.

Useful for residency and reducing write conflicts.

## Active/active

Multiple regions accept writes.

Requires explicit conflict model:

- domain-specific merge
- last-write-wins where acceptable
- CRDT for suitable data
- global coordination for strict invariants

Do not choose active/active simply for prestige.

---

# Appendix BH — Failover and Fencing

Region/database failover must ensure old primary cannot continue accepting writes after new primary is promoted.

This is fencing.

Typical conceptual sequence:

```text
1. detect failure
2. stop/fence old writer
3. confirm replication state/RPO
4. promote new writer
5. redirect traffic
6. validate
7. recover/fail back later
```

Without fencing, split brain can corrupt data.

---

# Appendix BI — Backup, Restore, RPO, and RTO

Replica is not backup.

Logical deletion replicates to replicas.

Backups protect against:

- accidental deletion
- bad migration
- corruption
- ransomware, depending on isolation

RPO:

```text
maximum acceptable data loss
```

RTO:

```text
maximum acceptable recovery duration
```

Run restore drills with realistic data size. A backup that has never been restored is an untested assumption.

---

# Appendix BJ — Point-in-Time Recovery

PITR commonly combines:

```text
base backup + transaction/WAL logs
```

to restore state near a target time before an accidental change.

Procedure needs:

- target time
- isolated restore environment
- validation
- data reconciliation
- cutover plan

Test it before an emergency.

---

# Appendix BK — Observability Deep Dive

Useful frameworks:

## RED

For request-driven services:

- Rate
- Errors
- Duration

## USE

For resources:

- Utilization
- Saturation
- Errors

Track user/business signals too:

```text
orders created
payments completed
messages delivered
```

An API can return `200` while silently failing a business action.

---

# Appendix BL — Metric Cardinality

Avoid metric labels such as:

```text
request_id
user_id
order_id
email
```

These can create millions of time series.

Use bounded dimensions:

```text
route=/orders/:id
status=200
region=ap-south
```

Put high-cardinality identifiers in logs/traces instead.

---

# Appendix BM — Tail Latency

Averages hide bad experiences.

Example:

```text
99 requests = 10ms
1 request   = 10s
```

The average can still look acceptable while p99 is terrible.

Track:

- p50
- p90
- p95
- p99

For fan-out requests, total latency is often dominated by the slowest required dependency.

---

# Appendix BN — Little's Law and Queueing

Little's Law:

```text
L = λW
```

Where:

- L = average items in system
- λ = arrival rate
- W = average time in system

Example:

```text
1,000 req/s × 0.2s = ~200 concurrent requests
```

As utilization approaches full capacity, queueing latency can rise dramatically. Always keep operational headroom.

---

# Appendix BO — Load Testing Accuracy

Test:

- smoke
- load
- stress
- spike
- soak

Use realistic:

- dataset size
- tenant skew
- payload sizes
- cache behavior
- traffic mix

Be aware of coordinated omission: a closed-loop load generator may reduce offered load exactly when the server becomes slow, hiding real latency.

Record methodology so benchmark results are reproducible.

---

# Appendix BP — Production Profiling

Profile:

- CPU
- heap
- allocations
- lock contention
- goroutines/threads/tasks
- blocking I/O

High latency with low CPU may indicate waiting on:

- DB locks
- connection pool
- remote service
- queue

Heap size is not always total process RSS because native allocations and buffers also matter.

Treat heap/core dumps as sensitive because they may contain credentials and PII.

---

# Appendix BQ — Runtime-Specific Backend Pitfalls

## Go

Know:

- goroutines
- channels
- contexts
- race detector
- pprof
- goroutine leaks
- unbounded goroutine creation

## Node.js

Know:

- event loop
- libuv worker pool
- streams/backpressure
- CPU blocking
- huge synchronous JSON operations

## Python

Know:

- async vs blocking libraries
- GIL implications by workload/runtime
- thread/process pools
- event-loop blocking

## JVM

Know:

- heap
- GC
- JIT
- thread/virtual-thread model
- executor pools
- allocation profiling

Do not tune runtimes blindly; measure first.

---

# Appendix BR — Security Threat Modeling

For a new backend:

1. list assets
2. draw data flows
3. mark trust boundaries
4. identify actors
5. identify threats
6. select mitigations
7. document residual risk

Ask:

- what if client is malicious?
- what if an internal service is compromised?
- what if a token is stolen?
- what if a message is replayed?
- what if input consumes enormous resources?

Security should happen during design, not after launch.

---

# Appendix BS — Resource-Exhaustion Security

Valid-looking operations can be abusive:

- expensive regex
- deep JSON
- giant GraphQL query
- expensive database filter
- decompression bomb
- repeated password attempts

Protect using:

- input bounds
- query complexity limits
- timeouts
- rate limiting
- concurrency limits
- quotas
- abuse detection

Availability is part of security.

---

# Appendix BT — GraphQL and gRPC Advanced Concerns

## GraphQL

Protect against:

- N+1 queries
- unbounded depth
- expensive nested pagination
- unauthorized field access

Use batching/DataLoader, depth/complexity limits, and field-aware authorization.

## gRPC

Use:

- deadlines
- meaningful status codes
- message size limits
- cancellation
- streaming flow control

A streaming RPC is not an infinite queue; slow consumers still require bounded buffering/backpressure.

---

# Appendix BU — Internal vs Public API Stability

Public APIs require deliberate compatibility and deprecation.

Internal APIs can become equally difficult to change if hundreds of services depend on them.

Track consumers.

For deprecation:

1. announce replacement
2. measure usage
3. migrate clients
4. enforce deadline
5. remove only after verified adoption

An unowned API tends to live forever.

---

# Appendix BV — Service Ownership and Catalogs

Every production service should have:

- owning team
- repository
- deployment
- on-call
- SLO
- runbook
- dependencies
- data stores
- lifecycle state

At organizational scale, a service catalog helps answer:

```text
Who owns this?
What depends on it?
What data does it hold?
What happens if it fails?
```

---

# Appendix BW — Platform Engineering

A backend platform can provide reusable capabilities:

- service templates
- CI/CD
- observability
- authentication middleware
- secrets
- deployment
- service discovery
- queues
- database provisioning

Goal:

> Make the secure, reliable path the easiest path.

Avoid a platform that becomes a central ticket queue or forces every workload into one abstraction.

Provide paved roads with documented escape hatches.

---

# Appendix BX — Architecture Governance

Good standards focus on repeated high-risk concerns:

- API errors
- authentication
- authorization
- telemetry
- retries
- secrets
- event schemas
- deprecation

Automate rules in CI where possible.

Do not create bureaucracy for trivial style preferences.

Architecture governance should reduce risk and cognitive load, not slow teams unnecessarily.

---

# Appendix BY — Cell-Based Architecture

At very large scale, a cell can contain a semi-independent slice of application and data for a subset of users/tenants.

Benefits:

- bounded blast radius
- horizontal scaling
- easier tenant isolation

Challenges:

- routing
- tenant placement
- cross-cell operations
- migration

A routing layer might maintain:

```text
tenant -> region -> cell -> shard
```

Global metadata should stay minimal and highly reliable.

---

# Appendix BZ — Control Plane vs Data Plane

Control plane manages:

- configuration
- provisioning
- routing metadata

Data plane serves user traffic.

A resilient data plane should often continue using last-known-good configuration when control plane is temporarily unavailable.

Global control-plane changes need:

- validation
- staged rollout
- versioning
- audit
- rollback

A bad global config update can cause a larger outage than one service deployment.

---

# Appendix CA — Blast Radius

Ask:

```text
If this component fails, what percentage of users/teams/regions fail?
```

Reduce blast radius through:

- tenant isolation
- cells
- shards
- availability zones
- regions
- independent deployments
- bulkheads

Central platforms create leverage but can also create huge failure domains.

---

# Appendix CB — Architecture Decision Reversibility

Spend more design effort on decisions that are hard to reverse:

Hard:

- public API
- database shard key
- identity model
- event schema
- organization-wide platform

Easy:

- local helper library
- internal implementation detail
- small configuration choice

Preserve optionality where uncertainty is high, but do not abstract everything "just in case."

---

# Appendix CC — Rewrite vs Migration

Full rewrites often underestimate:

- hidden behavior
- edge cases
- integrations
- operational knowledge
- data migration

Prefer incremental migration when feasible:

```text
compatibility layer
-> shadow traffic
-> canary
-> gradual cutover
-> decommission old system
```

A migration is not complete until old infrastructure, code, secrets, alerts, and dependencies are removed.

---

# Appendix CD — Staff-Level Design Document Template

A complete architecture document should usually address:

1. Context
2. Problem statement
3. Goals
4. Non-goals
5. Constraints
6. Assumptions
7. Scale estimates
8. Current architecture
9. Proposed architecture
10. Data model
11. API/event contracts
12. Consistency and invariants
13. Failure modes
14. Security/privacy
15. Observability
16. Capacity
17. Cost
18. Alternatives
19. Migration
20. Rollout
21. Rollback/roll-forward
22. Operational ownership
23. Risks
24. Open questions
25. Decommission plan

Technology names without reasoning are not an architecture design.

---

# Appendix CE — Risk Registers and Migration Milestones

For large initiatives, explicitly track risk.

Example:

| Risk | Probability | Impact | Mitigation |
|---|---:|---:|---|
| DB write ceiling reached | Medium | High | load test + partition plan |
| vendor quota exceeded | High | Medium | quota allocation + buffering |
| rollback impossible | Medium | High | expand/contract + shadow validation |

Break large migration into reversible milestones:

```text
1. compatibility layer
2. shadow reads
3. 1% traffic
4. 10%
5. 50%
6. 100%
7. old system read-only
8. decommission
```

---

# Appendix CF — Technical Strategy

A Staff engineer translates business strategy into technical sequencing.

Example business goal:

```text
Serve customers globally within two years.
```

Possible technical implications:

- data residency
- regional routing
- regional failover
- identity availability
- replication
- observability
- support tooling

The Staff decision is not simply "build active-active now." It is deciding what foundations are needed now, what can wait, and what migration path keeps risk manageable.

---

# Appendix CG — Engineering Economics

Architecture consumes:

- compute
- storage
- network
- licenses
- managed services
- observability
- engineering time
- on-call attention

Useful metrics:

```text
cost per successful request
cost per active tenant
cost per GB ingested
cost per transaction
```

Watch cloud egress, cross-region traffic, verbose telemetry, and overprovisioned databases.

Operational complexity is a real cost even when the cloud bill looks small.

---

# Appendix CH — Build vs Buy

Evaluate:

- strategic differentiation
- time to market
- team expertise
- reliability
- security/compliance
- vendor lock-in
- scale economics
- migration/exit path

Do not build commodity infrastructure merely because it is technically interesting.

Do not buy critical infrastructure without understanding its failure model and contractual limits.

---

# Appendix CI — Incident Management in Depth

During a major incident:

1. determine impact/severity
2. assign incident commander
3. stabilize system
4. preserve useful evidence
5. communicate status
6. mitigate
7. validate recovery
8. close incident
9. perform postmortem

Useful roles:

- incident commander
- technical/operations lead
- communications lead
- scribe

A postmortem action should be specific and systemic.

Weak:

```text
be more careful
```

Strong:

```text
add unique DB invariant preventing duplicate active subscription, owner Billing team
```

---

# Appendix CJ — Runbooks and Kill Switches

A runbook should answer:

- what does alert mean?
- how do I confirm impact?
- what dashboard/log query?
- safe mitigation?
- rollback?
- escalation?

Kill switches should rapidly disable risky capabilities such as:

- outbound webhooks
- expensive recommendation path
- new account creation
- problematic consumer

They must be authenticated, audited, documented, and tested.

---

# Appendix CK — Graceful Degradation and Brownouts

During overload keep critical flows and shed optional ones.

Example:

```text
keep checkout
keep login
reduce recommendation work
disable analytics enrichment
pause low-priority exports
```

This is a brownout strategy.

Define degradation order before an incident.

A fast controlled `503` can be healthier than letting every request queue until the entire fleet collapses.

---

# Appendix CL — Retry Budgets and Layered Retries

If application retries 3× and proxy retries 3×, one logical request can create many attempts.

Assign retry ownership.

Use retry budgets to limit amplification, for example:

```text
retry traffic <= 10% of normal request volume
```

Use jitter so clients do not retry in lockstep.

Never retry a write unless its semantics are safe.

---

# Appendix CM — Dependency Availability Math

If two sequential dependencies each have availability `99.9%`, combined success is approximately:

```text
0.999 × 0.999 = 99.8001%
```

A long synchronous dependency chain can reduce end-to-end availability.

This is why optional work should often leave the critical request path.

---

# Appendix CN — Failure Capacity

If two availability zones each serve 50% of traffic, the remaining zone must survive 100% after one zone fails.

Normal capacity planning should account for:

- one-instance failure
- one-zone failure when required
- deployment overlap
- traffic spikes
- backlog recovery

A system that needs every instance alive to survive normal peak has little fault tolerance.

---

# Appendix CO — Backlog Recovery Math

If incoming rate is:

```text
10,000 events/s
```

and recovery processing rate is:

```text
12,000 events/s
```

spare catch-up rate is only:

```text
2,000 events/s
```

A backlog of 7.2 million events takes roughly one hour to drain.

Design for recovery throughput, not only steady-state throughput.

---

# Appendix CP — Data Integrity Monitoring

Continuously check important invariants:

```text
negative inventory
unbalanced ledger
shipment without confirmed order
duplicate active subscription
cross-tenant reference
```

Infrastructure health can be green while business state is corrupt.

Track reconciliation mismatch counts and age.

---

# Appendix CQ — Data Lineage

Know how data flows:

```text
API
 -> OLTP DB
 -> CDC
 -> Kafka
 -> search index
 -> warehouse
 -> dashboards
```

Lineage helps with:

- deletion
- compliance
- schema changes
- incident debugging
- data quality

At Staff scale, data lineage should become a platform capability rather than tribal knowledge.

---

# Appendix CR — AI/Vector Backend Considerations

Modern backends may include vector search or LLM integrations.

For vector retrieval track:

- embedding model/version
- vector dimension
- similarity metric
- index type
- metadata filters
- recall/latency
- re-embedding migration

For LLM providers enforce:

- timeout
- rate limit
- cost budget
- data privacy
- retries only when safe
- output validation
- prompt/version observability

Generated model output must not automatically gain privileged system authority.

---

# Appendix CS — Internationalization Data Details

Do not assume:

- ASCII-only names
- Western name ordering
- two-part names
- one postal-address shape
- two decimal places for every currency
- integer phone numbers

Phone numbers are identifiers and should usually be stored textually in a normalized representation.

Understand UTF-8, Unicode normalization, code points, and grapheme clusters when implementing length/uniqueness rules.

---

# Appendix CT — API Contract Edge Cases

Define differences between:

```json
{}
```

and:

```json
{"nickname": null}
```

For PATCH semantics, missing may mean "unchanged" while null means "clear."

Also define:

- unknown fields
- new enum values
- default values
- numeric precision
- integer width

JavaScript clients cannot exactly represent every 64-bit integer as a normal number, so some APIs encode large IDs as strings.

---

# Appendix CU — Stable Pagination

Cursor pagination should use a stable, deterministic ordering.

Example:

```sql
ORDER BY created_at DESC, id DESC
```

Cursor contains both values.

Offset pagination can skip/duplicate results when inserts happen between pages.

Cursor pagination still needs documented behavior when filters/sort parameters change.

---

# Appendix CV — Batch API Semantics

Batch endpoints reduce network overhead but require bounds.

Define:

- maximum batch size
- per-item validation
- partial failure response
- transaction scope
- ordering
- idempotency

Do not allow an unbounded `batch=all` request that can consume the entire service.

---

# Appendix CW — Dependency Fan-Out

Suppose a request synchronously calls 20 dependencies.

Even if each is reliable individually, the combined failure probability and tail latency become worse.

Ask:

- can calls be batched?
- can data be locally replicated?
- can optional calls run asynchronously?
- is the service boundary too chatty?

Network-level N+1 is as real as ORM N+1.

---

# Appendix CX — BFF and Aggregation Services

Backend-for-Frontend can adapt APIs for:

- web
- mobile
- partner clients

Keep BFF focused on:

- aggregation
- presentation-oriented shaping
- protocol adaptation

Avoid duplicating core business rules across multiple BFFs.

For partial dependency failure decide whether to:

- fail whole response
- return partial data
- use stale/cached fallback

based on product semantics.

---

# Appendix CY — Service Discovery and Control-Plane Outages

Service discovery may use DNS, registry, or platform-native services.

Clients should tolerate endpoint churn.

A discovery/control-plane outage should not necessarily stop all existing data-plane traffic if cached endpoints are still safe to use.

Design last-known-good behavior intentionally.

---

# Appendix CZ — Sticky Sessions

Sticky sessions route a client to the same server.

They can simplify local session state but create:

- load imbalance
- failover complexity
- scaling coupling

Prefer replaceable stateless request-serving instances where practical.

Long-lived WebSocket connections are naturally bound to the instance holding that connection, but reconnect should be able to land elsewhere.

---

# Appendix DA — WebSocket Capacity

For long-lived connections estimate:

```text
concurrent sockets
memory/socket
file descriptors
heartbeat traffic
outbound queue size
reconnect rate
```

One million mostly-idle WebSockets is a different capacity problem from one million short HTTP requests.

Use bounded send queues and a slow-consumer policy.

---

# Appendix DB — Presence and Real-Time State

Presence is usually eventually consistent.

Use heartbeats/leases:

```text
heartbeat every 20s
consider offline after 60s
```

Do not use expensive global consensus to maintain a social application's green "online" dot unless product semantics truly require that accuracy.

---

# Appendix DC — CDN Cache Safety

When caching API responses at an edge, cache keys must include all dimensions affecting the response.

Potential dimensions:

- path/query
- language
- tenant
- auth state

Under-varying can leak one user's data to another.

Over-varying destroys cache hit rate.

Use `Cache-Control`, `ETag`, and conditional requests deliberately.

---

# Appendix DD — Conditional Requests and Optimistic APIs

ETag can support both caching and concurrency.

Read:

```http
ETag: "v17"
```

Update:

```http
If-Match: "v17"
```

If resource is already at v18:

```text
412 Precondition Failed
```

This prevents accidental overwrite of another user's edit.

---

# Appendix DE — 202 and Async Semantics

`202 Accepted` means processing has not necessarily completed.

Before returning 202, ensure the work is durably recorded or queued.

Return a status resource or operation ID.

Never return 202 for work that exists only in volatile process memory if losing it would violate the API contract.

---

# Appendix DF — Error Taxonomy

Use stable machine-readable errors:

```text
VALIDATION_ERROR
UNAUTHENTICATED
FORBIDDEN
NOT_FOUND
CONFLICT
RATE_LIMITED
DEPENDENCY_UNAVAILABLE
INTERNAL_ERROR
```

Clients should not parse human error text.

Internal errors can wrap root cause while external response stays safe and stable.

---

# Appendix DG — Panic/Exception Boundaries

Unexpected exception should generally fail one request rather than crash the whole service when the runtime can safely recover.

But some failures indicate process corruption or impossible startup state and should terminate so orchestrator can replace the instance.

Do not swallow every exception and pretend the service is healthy.

---

# Appendix DH — Temporary Files and Subprocesses

When using temporary files:

- random names
- restricted permissions
- size quota
- cleanup
- ephemeral disk monitoring

When spawning subprocesses:

- avoid shell concatenation
- use argument arrays
- validate inputs
- timeout
- cap output
- terminate children on shutdown

Unbounded child processes and output buffers are resource leaks.

---

# Appendix DI — Docker Runtime Hygiene

Production container guidelines:

- multi-stage build
- minimal runtime image
- non-root user
- no source/test secrets
- pinned/reproducible dependencies
- proper signal handling
- health endpoints
- explicit resource requirements

Container local disk is normally ephemeral. Do not store durable business state there.

---

# Appendix DJ — Infrastructure as Code

IaC provides:

- reviewability
- version history
- reproducibility
- automation

Protect:

- state files
- destructive changes
- credentials
- production approvals

Use plan/diff before apply.

Tag resources with ownership, service, environment, and cost metadata.

---

# Appendix DK — Environment Drift

Differences between development/staging/production create hidden failures.

Maintain semantic parity for critical dependencies:

- DB engine/version
- queue behavior
- authentication
- deployment topology

Use IaC and automated config management to detect drift.

Avoid copying raw production PII into developer environments.

---

# Appendix DL — Synthetic Monitoring

Black-box probes periodically execute critical user journeys such as:

```text
login
create object
read object
delete object
```

White-box metrics show internal state.

Use both.

Synthetic tests can catch DNS, TLS, routing, and auth failures that internal CPU metrics cannot.

---

# Appendix DM — Alert Quality

A pager alert should be actionable.

Prefer symptom alerts:

```text
checkout success rate below target
```

rather than paging on every infrastructure threshold.

Every high-severity alert should ideally have:

- owner
- severity
- dashboard
- runbook
- immediate action

Remove noisy alerts that nobody acts on.

---

# Appendix DN — Error Budgets

An SLO implies an allowed failure budget.

Use budget policy to guide trade-offs:

```text
budget healthy -> normal feature velocity
budget rapidly burning -> cautious releases
budget exhausted -> prioritize reliability
```

SLOs matter only if they influence decisions.

---

# Appendix DO — Capacity Runway

Do not only alert when disk reaches 95%.

Estimate runway:

```text
free storage 500 GB
growth 100 GB/week
runway ~5 weeks
```

Apply the same thinking to:

- cloud quotas
- certificate expiry
- IP ranges
- partition count
- database connections

---

# Appendix DP — Backend Mastery Practical Standard

For any production feature, be able to answer:

## Request
- protocol?
- payload bounds?
- timeout?

## Identity
- authentication?
- authorization?

## Data
- source of truth?
- invariant?
- transaction?
- consistency?

## Concurrency
- simultaneous writes?
- dedupe?

## Failure
- dependency timeout?
- ambiguous result?
- retry?
- reconciliation?

## Scale
- peak rate?
- bottleneck?
- hot key/shard?

## Reliability
- backpressure?
- circuit breaker?
- degradation?

## Operations
- logs?
- metrics?
- traces?
- runbook?

## Security
- trust boundaries?
- sensitive data?
- abuse?

## Evolution
- compatibility?
- migration?
- rollback?
- decommission?

## Economics
- compute?
- storage?
- network?
- human operating cost?

This checklist is the core habit that separates framework knowledge from real backend engineering.

---

# Final Mastery Challenge

Do not stop after reading. Build and operate progressively harder systems:

1. Auth service
2. CRUD SaaS API
3. File upload platform
4. Notification service
5. Webhook delivery system
6. Rate limiter
7. Background job scheduler
8. Chat backend
9. Order workflow
10. Inventory reservation
11. Payments + ledger
12. Kafka ingestion pipeline
13. Search indexing pipeline
14. Multi-tenant platform
15. Feature flag service
16. Audit platform
17. Workflow engine
18. API gateway
19. Real-time gateway
20. Multi-region backend platform

For each system, document and implement:

```text
requirements
API contracts
data model
transactions
concurrency
idempotency
caching
messaging
failure handling
security
observability
capacity
testing
deployment
migration
cost
operations
```

Then deliberately inject failures:

```text
kill a dependency
add latency
duplicate messages
reorder events
fill a queue
expire credentials
restart a pod mid-job
slow the database
flush the cache
simulate regional failure
```

The goal is not to memorize technology names. The goal is to be able to design, implement, operate, debug, migrate, and simplify backend systems under real failure and scale.

---

# End

If you can reason confidently through the topics and failure modes in this handbook, implement the important patterns, explain their trade-offs, and lead safe production migrations, you are operating across the knowledge expected from strong backend engineers through Senior and toward Staff-level software engineering.
