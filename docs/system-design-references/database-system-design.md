# Database System Design: Zero to Senior/Staff Engineer

> A practical, end-to-end handbook for designing database-backed systems—from first principles to senior/staff-level architecture decisions.

---

## Table of Contents

1. [How to Use This Guide](#1-how-to-use-this-guide)
2. [What a Database Actually Does](#2-what-a-database-actually-does)
3. [Core Vocabulary](#3-core-vocabulary)
4. [Database Categories](#4-database-categories)
5. [Relational Databases](#5-relational-databases)
6. [NoSQL Databases](#6-nosql-databases)
7. [Database Storage Internals](#7-database-storage-internals)
8. [Indexes](#8-indexes)
9. [Query Execution and Optimization](#9-query-execution-and-optimization)
10. [Data Modeling](#10-data-modeling)
11. [Transactions and ACID](#11-transactions-and-acid)
12. [Concurrency Control](#12-concurrency-control)
13. [Isolation Levels](#13-isolation-levels)
14. [Locks, Deadlocks, and Contention](#14-locks-deadlocks-and-contention)
15. [MVCC](#15-mvcc)
16. [Consistency Models](#16-consistency-models)
17. [CAP and PACELC](#17-cap-and-pacelc)
18. [Replication](#18-replication)
19. [Partitioning and Sharding](#19-partitioning-and-sharding)
20. [Rebalancing and Hot Partitions](#20-rebalancing-and-hot-partitions)
21. [Distributed Consensus](#21-distributed-consensus)
22. [Leader Election](#22-leader-election)
23. [Distributed Transactions](#23-distributed-transactions)
24. [2PC, Sagas, Outbox, and Idempotency](#24-2pc-sagas-outbox-and-idempotency)
25. [Change Data Capture](#25-change-data-capture)
26. [Event Sourcing and CQRS](#26-event-sourcing-and-cqrs)
27. [Caching with Databases](#27-caching-with-databases)
28. [Connection Management](#28-connection-management)
29. [Schema Evolution and Migrations](#29-schema-evolution-and-migrations)
30. [Data Integrity](#30-data-integrity)
31. [Multi-Tenancy](#31-multi-tenancy)
32. [Time-Series Data](#32-time-series-data)
33. [Search Systems](#33-search-systems)
34. [Graph Databases](#34-graph-databases)
35. [Vector Databases](#35-vector-databases)
36. [Analytical Databases and Warehouses](#36-analytical-databases-and-warehouses)
37. [OLTP vs OLAP](#37-oltp-vs-olap)
38. [Lake, Warehouse, and Lakehouse](#38-lake-warehouse-and-lakehouse)
39. [Storage Formats](#39-storage-formats)
40. [Backup, Restore, and Disaster Recovery](#40-backup-restore-and-disaster-recovery)
41. [Security](#41-security)
42. [Privacy, Retention, and Compliance](#42-privacy-retention-and-compliance)
43. [Observability](#43-observability)
44. [Capacity Planning](#44-capacity-planning)
45. [Performance Engineering](#45-performance-engineering)
46. [Common Database Failure Modes](#46-common-database-failure-modes)
47. [Database Selection Framework](#47-database-selection-framework)
48. [Design Patterns](#48-design-patterns)
49. [Anti-Patterns](#49-anti-patterns)
50. [System Design Examples](#50-system-design-examples)
51. [Interview Framework](#51-interview-framework)
52. [Senior-Level Expectations](#52-senior-level-expectations)
53. [Staff-Level Expectations](#53-staff-level-expectations)
54. [Production Readiness Checklist](#54-production-readiness-checklist)
55. [Learning Roadmap](#55-learning-roadmap)
56. [Practice Questions](#56-practice-questions)
57. [Final Mental Models](#57-final-mental-models)

---

# 1. How to Use This Guide

Do not try to memorize database products. Learn the engineering principles that make the products behave differently.

A strong engineer should be able to answer:

- What access patterns does the system have?
- What guarantees does the business actually require?
- What can be eventually consistent?
- What must be strongly consistent?
- What is the expected read/write volume?
- What happens when one node, one availability zone, or one region fails?
- How is data partitioned?
- How is data recovered?
- How do schema changes happen without downtime?
- How do you prevent duplicate processing?
- What are your bottlenecks at 10x and 100x scale?
- Why was this database chosen instead of another?

The progression is roughly:

**Beginner** → understand CRUD, schemas, keys, SQL, indexes, transactions.

**Intermediate** → understand execution plans, locking, replication, partitioning, caching, migrations.

**Senior** → understand consistency trade-offs, failure modes, distributed transactions, scaling, observability, capacity planning.

**Staff** → define data architecture across teams, make reversible vs irreversible choices, manage migrations, reliability, cost, compliance, multi-region trade-offs, and long-term platform strategy.

---

# 2. What a Database Actually Does

A database is not just a place to store records.

A production database usually provides some combination of:

- Persistent storage
- Data organization
- Query execution
- Indexing
- Concurrency control
- Transaction management
- Durability
- Replication
- Recovery
- Access control
- Constraints
- Change tracking
- Backup
- Monitoring hooks

At the lowest level, the database converts logical operations such as:

```sql
SELECT * FROM users WHERE email = 'user@example.com';
```

into physical work such as:

1. Parse SQL.
2. Validate tables and columns.
3. Rewrite query if necessary.
4. Choose an execution plan.
5. Locate relevant pages/index nodes.
6. Read from memory or disk.
7. Apply visibility rules.
8. Return matching tuples.

That physical work is what system designers need to understand when scale becomes important.

---

# 3. Core Vocabulary

## Row / Record

One logical entity instance.

## Column / Field

One property of an entity.

## Table / Collection

A group of records.

## Primary Key

A unique identifier for a record.

Examples:

```text
user_id
order_id
payment_id
```

A good primary key should be:

- Unique
- Stable
- Compact where possible
- Efficient for the expected access pattern

## Foreign Key

A reference between records.

Example:

```text
orders.user_id -> users.id
```

## Candidate Key

Any field or combination of fields that could uniquely identify a row.

## Composite Key

A key made from multiple columns.

```text
(user_id, product_id)
```

## Surrogate Key

A generated identifier with no business meaning.

Examples:

- auto-increment integer
- UUID
- ULID
- Snowflake-style ID

## Natural Key

A business identifier.

Examples:

- email
- passport number
- SKU

Natural keys can change, so they are often poor primary keys.

## Cardinality

Number of distinct values in a column.

High-cardinality example:

```text
user_id
```

Low-cardinality example:

```text
status = ACTIVE | INACTIVE
```

Cardinality heavily affects index usefulness.

## Selectivity

How much a condition narrows a result set.

Highly selective:

```sql
WHERE id = 123
```

Poorly selective:

```sql
WHERE is_active = true
```

## Page

Databases usually read/write fixed-size blocks called pages rather than arbitrary individual bytes.

## Tuple

Database-internal term commonly used for a row or row version.

## WAL

Write-Ahead Log. Changes are logged before data pages are considered safely persisted.

## Checkpoint

A process that makes recovery faster by flushing dirty state and establishing a known recovery point.

---

# 4. Database Categories

There is no universally best database. The correct choice depends on the workload.

## Relational

Examples:

- PostgreSQL
- MySQL
- SQL Server
- Oracle

Best when:

- Relationships matter
- Transactions matter
- Constraints matter
- Flexible querying matters
- Data structure is reasonably stable

## Key-Value

Examples:

- Redis
- Dynamo-style systems

Best when:

```text
key -> value
```

is the main access pattern.

## Document

Examples:

- MongoDB
- Couchbase

Best when data naturally forms aggregate documents.

## Wide-Column

Examples:

- Cassandra
- ScyllaDB
- HBase

Best for:

- Extremely large write workloads
- Predictable query patterns
- Horizontally partitioned datasets

## Graph

Examples:

- Neo4j
- Neptune-style managed graph systems

Best when relationship traversal is the primary workload.

## Search Engine

Examples:

- Elasticsearch
- OpenSearch

Best for:

- Full-text search
- Ranking
- Inverted indexes
- Aggregation over search-oriented documents

## Time-Series

Examples:

- TimescaleDB
- InfluxDB
- Prometheus TSDB

Best for timestamp-indexed measurements.

## Analytical / Columnar

Examples:

- ClickHouse
- BigQuery
- Snowflake
- Redshift

Best for analytical scans over huge datasets.

## Vector

Examples include dedicated vector databases and relational/search systems with vector extensions.

Best for:

- Embedding similarity search
- Semantic retrieval
- RAG
- Recommendation retrieval

---

# 5. Relational Databases

Relational databases model data as relations—commonly represented as tables.

Example:

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE orders (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(32) NOT NULL,
    created_at TIMESTAMP NOT NULL
);
```

Relational systems are powerful because they combine:

- Declarative query language
- Constraints
- Transactions
- Joins
- Mature optimizers
- Mature operational tooling

Do not reject SQL simply because the application may become large. Many very large systems use relational databases with replication, partitioning, caching, and specialized secondary stores.

---

# 6. NoSQL Databases

“NoSQL” is not one database model.

It is an umbrella term for non-relational or less-relational data systems.

The most important question is not:

> SQL or NoSQL?

It is:

> Which data model and operational guarantees best match the access patterns?

NoSQL often sacrifices some combination of:

- Arbitrary joins
- Multi-record transaction flexibility
- centralized relational constraints
- strongly normalized models

in exchange for some combination of:

- Easier horizontal partitioning
- Higher write scale
- Flexible records
- Simpler known access patterns
- Distribution-aware design

---

# 7. Database Storage Internals

Understanding storage engines is a major step toward senior-level database reasoning.

## B-Tree / B+ Tree Storage

Common in relational database indexes.

Properties:

- Ordered
- Efficient point lookup
- Efficient range scan
- Typically O(log n) lookup
- Good for ordered indexes

A B+ tree keeps values or tuple references primarily at leaves, while internal nodes guide traversal.

Useful for:

```sql
WHERE id = ?
WHERE created_at BETWEEN ? AND ?
ORDER BY created_at
```

## LSM Tree

Log-Structured Merge Tree.

Common in write-heavy distributed stores.

Basic idea:

1. Write to memory structure.
2. Append to durable log.
3. Flush sorted data to immutable disk files.
4. Merge files through compaction.

Strengths:

- High sequential write throughput
- Good for write-heavy workloads

Costs:

- Read amplification
- Write amplification through compaction
- Space amplification
- Operational impact of compaction

Key concepts:

- Memtable
- SSTable
- Bloom filter
- Compaction
- Tombstone

## Heap Storage

Rows are stored without primary ordering.

An index then points to row locations.

## Append-Only Storage

New versions are appended rather than overwritten in place.

Useful for:

- Logging
- Event systems
- MVCC
- Immutable histories

---

# 8. Indexes

An index speeds reads by maintaining an auxiliary data structure.

But every index has a cost.

## Costs of an Index

- Extra storage
- Extra memory pressure
- Slower INSERT
- Slower UPDATE when indexed fields change
- Slower DELETE
- Maintenance overhead
- Potential fragmentation/bloat

Do not create indexes “just in case.”

## Single-Column Index

```sql
CREATE INDEX idx_users_email ON users(email);
```

## Composite Index

```sql
CREATE INDEX idx_orders_user_created
ON orders(user_id, created_at DESC);
```

Column order matters.

An index on:

```text
(user_id, created_at)
```

can commonly support:

```text
user_id
user_id + created_at
```

but not necessarily an efficient search only by `created_at`.

## Covering Index

An index contains all information required by a query so the engine can avoid visiting the base table in some cases.

## Unique Index

Enforces uniqueness.

## Partial / Filtered Index

Indexes only records matching a condition.

Example concept:

```sql
CREATE INDEX ... WHERE status = 'PENDING';
```

Useful when only a small subset is frequently queried.

## Functional Index

Indexes a computed expression.

```sql
LOWER(email)
```

## Full-Text Index

Used for language-oriented search rather than exact equality.

## Hash Index

Good for equality lookup in systems that support it, but not range scans.

## Bloom Filter

Probabilistic membership structure.

It can say:

- definitely not present
- maybe present

Useful for avoiding unnecessary disk reads.

False positives are possible; false negatives are not expected in a correctly implemented Bloom filter.

## Index Selectivity

A low-cardinality boolean field often makes a weak standalone index.

Example:

```sql
WHERE is_active = true
```

If 95% of rows are active, a full scan may be cheaper.

## Index Design Rule

Design indexes from **real query patterns**, not only from schema fields.

For each important query, ask:

1. Filter columns?
2. Join columns?
3. Sort columns?
4. Returned columns?
5. Cardinality?
6. Expected result count?
7. Read/write frequency?

---

# 9. Query Execution and Optimization

SQL is declarative.

You describe what you want, not exactly how to fetch it.

The optimizer chooses an execution plan.

Common plan operators:

- Sequential scan
- Index scan
- Index-only scan
- Nested loop join
- Hash join
- Merge join
- Sort
- Aggregate
- Materialize

## Sequential Scan

Reads large portions of the table.

Not always bad.

If a query needs 70% of a table, sequential I/O can beat many random index lookups.

## Nested Loop Join

Good when one side is small and the other has an efficient index.

## Hash Join

Good for equality joins over larger datasets.

## Merge Join

Good when both inputs are ordered by join key.

## Statistics

Optimizers rely on statistics such as:

- row counts
- cardinality
- histograms
- value distributions

Stale statistics can create poor plans.

## Explain Plans

Senior engineers should be comfortable reading `EXPLAIN` / `EXPLAIN ANALYZE` equivalents.

Look for:

- estimated vs actual rows
- unexpected sequential scans
- loops multiplied many times
- expensive sorts
- spills to disk
- bad join order
- missing indexes
- low-selectivity indexes

## N+1 Query Problem

Bad pattern:

1. Query 100 users.
2. Run one additional query per user.

Total = 101 queries.

Solutions:

- joins
- batching
- eager loading
- data loader patterns
- precomputed views where appropriate

---

# 10. Data Modeling

Data modeling begins with access patterns and invariants, not tables.

Questions:

- What are the entities?
- What are the relationships?
- Which writes must be atomic?
- Which reads are frequent?
- Which queries are latency-sensitive?
- Which records grow without bound?
- Which fields change frequently?
- Which data requires history?

## One-to-One

```text
User -> UserProfile
```

## One-to-Many

```text
Customer -> Orders
```

## Many-to-Many

```text
Students <-> Courses
```

Usually modeled with a join table:

```text
student_courses(student_id, course_id)
```

## Normalization

Normalization reduces duplication and anomalies.

### First Normal Form

Atomic values; no repeating groups.

### Second Normal Form

Non-key columns depend on the entire composite key.

### Third Normal Form

Non-key columns should not depend transitively on another non-key column.

### BCNF

Stronger form addressing additional dependency anomalies.

## Denormalization

Intentional duplication to improve read performance or simplify distributed access.

Examples:

- storing `customer_name` in a read model
- precomputed counters
- materialized views

Denormalization creates synchronization responsibilities.

Staff-level principle:

> Denormalize because you measured a need, not because joins feel scary.

---

# 11. Transactions and ACID

A transaction groups operations into one logical unit.

## Atomicity

All or nothing.

## Consistency

A valid transaction moves the database from one valid state to another, preserving defined rules.

## Isolation

Concurrent transactions behave according to a defined visibility model.

## Durability

Committed data survives expected failures according to the database's durability configuration.

Example:

```text
Transfer ₹100 from account A to account B
```

Operations:

```text
A -= 100
B += 100
```

Without atomicity, one side could happen without the other.

---

# 12. Concurrency Control

Multiple clients operate concurrently.

Without concurrency control, data races appear at the database layer.

Example lost update:

```text
Balance = 100
T1 reads 100
T2 reads 100
T1 writes 90
T2 writes 80
```

One update disappears.

Common techniques:

- Pessimistic locking
- Optimistic concurrency control
- MVCC
- Serializable execution

## Optimistic Concurrency Control

Store a version:

```text
id | balance | version
```

Update:

```sql
UPDATE accounts
SET balance = ?, version = version + 1
WHERE id = ? AND version = ?;
```

If zero rows update, someone else modified the record.

Good when conflicts are rare.

## Pessimistic Locking

Lock before modification.

Good when conflicts are frequent and retry cost is high.

---

# 13. Isolation Levels

Isolation level controls which concurrency anomalies are allowed.

Common conceptual levels:

## Read Uncommitted

May allow reading uncommitted data.

## Read Committed

Prevents dirty reads, but repeated reads can change.

## Repeatable Read

Provides stronger repeat-read guarantees, though exact behavior varies by database.

## Serializable

Strongest common transaction isolation. Transactions behave as if executed in some serial order.

Potential anomalies to understand:

- Dirty read
- Non-repeatable read
- Phantom read
- Lost update
- Write skew

Important:

Do not assume two databases implement an isolation label identically.

Read the actual database semantics.

---

# 14. Locks, Deadlocks, and Contention

Locks may exist at different levels:

- row
- page
- table
- metadata
- advisory/application-defined

## Shared Lock

Typically allows reads while preventing conflicting writes.

## Exclusive Lock

Used for conflicting modifications.

## Deadlock

Example:

```text
T1 locks A
T2 locks B
T1 waits for B
T2 waits for A
```

Neither can progress.

Databases commonly detect this and abort one transaction.

Mitigations:

- consistent lock ordering
- short transactions
- smaller transactional scope
- proper indexes
- fewer interactive user operations inside transactions

Never hold a transaction open while waiting on a human or remote service unless you fully understand the consequences.

---

# 15. MVCC

Multi-Version Concurrency Control allows multiple logical versions of rows.

Instead of readers blocking writers and writers blocking readers in every case, transactions can see a consistent snapshot.

Benefits:

- better read concurrency
- snapshot-style visibility

Costs:

- old row versions
- vacuum/cleanup requirements
- transaction ID/version maintenance
- potential table/index bloat

Long-running transactions can prevent cleanup of old versions.

This is a classic production issue.

---

# 16. Consistency Models

“Consistency” is overloaded.

You must state which consistency guarantee you mean.

## Strong Consistency

A read observes the latest successfully completed write according to the system's model.

## Eventual Consistency

If writes stop, replicas eventually converge.

## Read-Your-Writes

A client sees its own previous successful writes.

## Monotonic Reads

Once a client sees a newer value, it does not later see an older one.

## Monotonic Writes

A client's writes are applied in order.

## Causal Consistency

Causally related operations are observed in causal order.

## Linearizability

Operations appear to occur atomically in real-time order.

## Serializability

Concurrent transactions behave equivalent to some serial transaction order.

Linearizability and serializability are different concepts.

---

# 17. CAP and PACELC

## CAP

Under a network partition, a distributed system must choose between:

- Consistency
- Availability

Partition tolerance is generally not optional in distributed deployments because networks can fail.

CAP does **not** mean a database is permanently “CP” or “AP” in all situations.

It describes behavior under partition.

## PACELC

PACELC expands the idea:

```text
If Partition: choose Availability or Consistency
Else: choose Latency or Consistency
```

This is often more useful in real architecture discussions because most of the system's lifetime is not spent in a partition.

---

# 18. Replication

Replication maintains copies of data across nodes.

Reasons:

- high availability
- read scaling
- disaster recovery
- geographic proximity

## Leader-Follower

One leader accepts writes.

Followers replicate.

Advantages:

- simple write ordering
- easier consistency reasoning

Problems:

- leader bottleneck
- failover complexity
- replica lag

## Multi-Leader

Multiple leaders accept writes.

Useful for:

- multi-region writes
- occasionally disconnected operation

Problems:

- conflict resolution
- write ordering
- duplicate keys
- semantic conflicts

## Leaderless

Clients/coordinators write to multiple replicas.

Often uses quorum concepts.

If:

```text
N = replicas
W = write acknowledgements
R = read replicas
```

then `R + W > N` can create overlapping quorums, but this alone does not magically provide perfect strong consistency under all implementation details.

## Synchronous Replication

Commit waits for replica acknowledgement.

Pros:

- lower data-loss window

Cons:

- higher latency
- lower availability under some failures

## Asynchronous Replication

Leader commits without waiting for all followers.

Pros:

- lower latency
- higher write availability

Cons:

- replica lag
- potential recent data loss on failover

## Replica Lag

A user writes to leader and immediately reads from follower.

They may not see the update.

Mitigations:

- read-after-write routing to leader
- session stickiness
- causal tokens/version tracking
- wait for replication position

---

# 19. Partitioning and Sharding

Partitioning splits data into subsets.

## Horizontal Partitioning

Different rows go to different partitions.

## Vertical Partitioning

Different columns/features are separated.

## Sharding

Usually refers to horizontal partitioning across independent database nodes or clusters.

## Range-Based Sharding

Example:

```text
A-F -> shard 1
G-M -> shard 2
N-Z -> shard 3
```

Good for range scans.

Risk:

- hotspot if new writes cluster in one range

## Hash-Based Sharding

```text
shard = hash(key) % N
```

Good distribution.

Poorer for range scans.

Naive modulo hashing causes heavy movement when shard count changes.

## Consistent Hashing

Reduces remapping when nodes are added or removed.

Uses a logical hash ring or equivalent partition-token model.

## Directory-Based Sharding

A mapping service tracks:

```text
tenant_id -> shard
```

Flexible, but the mapping layer becomes critical infrastructure.

## Geo Sharding

Partition data by region.

Useful for:

- data residency
- latency
- regulatory requirements

But cross-region queries and users become harder.

---

# 20. Rebalancing and Hot Partitions

A partitioning scheme can be mathematically even and still operationally uneven.

Example:

One celebrity account receives 20% of all traffic.

The partition containing that account becomes hot.

Solutions:

- split hot keys
- write bucketing
- cache aggressively
- isolate heavy tenants
- custom partition assignment
- time bucket keys
- adaptive repartitioning

Example write-sharded counter:

```text
post:123:likes:0
post:123:likes:1
...
post:123:likes:31
```

Read aggregates all buckets.

Trade-off:

- more expensive reads
- dramatically improved write distribution

---

# 21. Distributed Consensus

Consensus algorithms allow nodes to agree on a value/order despite failures.

Important families:

- Paxos
- Raft

Used for:

- leader election
- replicated logs
- metadata
- configuration
- strongly consistent replicated state

Key ideas:

- term/epoch
- leader
- quorum
- replicated log
- commit index

Consensus is not “free.”

It adds:

- coordination latency
- quorum dependency
- operational complexity

Use strong coordination for invariants that genuinely need it.

---

# 22. Leader Election

When a leader fails, a replacement must be chosen.

Problems:

- split brain
- stale leaders
- network partition
- duplicate writers

## Fencing Token

A monotonically increasing token identifies the newest legitimate leader/lease holder.

A storage system rejects operations from older tokens.

This is stronger than merely using a time-based lease if old actors can continue executing.

---

# 23. Distributed Transactions

A transaction spanning multiple services/databases is much harder than one local transaction.

Example:

```text
Order service
Payment service
Inventory service
Shipping service
```

You should usually avoid creating a distributed transaction unless required.

Question:

Can the workflow be modeled as a state machine with compensating actions instead?

---

# 24. 2PC, Sagas, Outbox, and Idempotency

## Two-Phase Commit

Phase 1:

```text
Prepare
```

Phase 2:

```text
Commit / Abort
```

Advantages:

- atomic-style coordination across participants

Disadvantages:

- coordinator dependency
- blocking behavior under failures
- operational complexity
- poor fit for many microservice architectures

## Saga

A business transaction becomes a sequence of local transactions.

Example:

```text
Create order
Reserve inventory
Charge payment
Create shipment
```

If payment fails:

```text
Release inventory
Cancel order
```

Two styles:

### Orchestration

One coordinator tells participants what to do.

### Choreography

Services react to events.

Choreography can become hard to understand at large scale if event flows are not explicitly governed.

## Transactional Outbox

Problem:

```text
1. write DB
2. publish event
```

If the process crashes between steps, state and event diverge.

Outbox solution:

In one local transaction:

```text
1. write business row
2. write outbox row
```

A separate publisher sends outbox events.

This gives atomic persistence between business state and publication intent.

## Idempotency

An operation can be safely repeated without creating additional unintended effects.

Example:

```text
POST /payments
Idempotency-Key: abc123
```

Store:

```text
abc123 -> result
```

Retries return the same logical result.

Idempotency is fundamental to distributed reliability because retries are unavoidable.

---

# 25. Change Data Capture

CDC captures row-level database changes and publishes them downstream.

Uses:

- search indexing
- analytics pipelines
- cache invalidation
- data synchronization
- event generation

Log-based CDC reads database transaction logs instead of polling tables repeatedly.

Risks:

- schema evolution
- duplicate delivery
- ordering assumptions
- backfill coordination
- replay semantics

Consumers should generally be idempotent.

---

# 26. Event Sourcing and CQRS

## Event Sourcing

Instead of storing only current state:

```text
balance = 500
```

store events:

```text
AccountCreated
MoneyDeposited 1000
MoneyWithdrawn 500
```

Current state is derived by replay.

Advantages:

- auditability
- time travel
- event-driven integration

Costs:

- event schema permanence
- replay complexity
- projections
- storage growth
- developer complexity

Do not use event sourcing simply because the architecture already uses Kafka.

## CQRS

Command Query Responsibility Segregation separates write and read models.

Useful when:

- read model differs heavily from write model
- scale characteristics differ
- multiple optimized projections are needed

Costs:

- duplication
- eventual consistency
- synchronization complexity

---

# 27. Caching with Databases

Caching reduces load and latency but creates invalidation problems.

## Cache-Aside

Read:

```text
1. check cache
2. miss -> read DB
3. populate cache
```

Write:

```text
1. write DB
2. invalidate/update cache
```

## Read-Through

Cache layer fetches missing values itself.

## Write-Through

Writes go through cache and then persistent store.

## Write-Behind

Cache acknowledges first and persists later.

Fast, but increases durability complexity.

## TTL

Time-based expiration.

## Cache Stampede

Many requests miss the same key simultaneously.

Mitigations:

- request coalescing/singleflight
- randomized TTL jitter
- stale-while-revalidate
- locking

## Cache Penetration

Repeated requests for nonexistent keys bypass cache.

Mitigations:

- negative caching
- Bloom filters

## Cache Consistency

Never say “Redis makes it faster” without explaining:

- invalidation
- failure behavior
- stale tolerance
- TTL
- memory policy
- authoritative source

---

# 28. Connection Management

Database connections are expensive resources.

Each connection may consume:

- memory
- backend worker/process resources
- transaction state
- socket resources

Do not allow every application instance to open unlimited connections.

Example:

```text
500 pods × 100 connections = 50,000 DB connections
```

That can destroy a database before query load does.

Use:

- connection pools
- bounded pool sizes
- queueing/backpressure
- connection proxies where appropriate

## Pool Sizing

Bigger is not always better.

After the database's useful concurrency is saturated, more concurrent queries create contention and latency.

Monitor:

- active connections
- idle connections
- waiters
- pool timeout
- DB CPU
- disk I/O
- lock waits

---

# 29. Schema Evolution and Migrations

Production databases must evolve without long downtime.

## Expand-and-Contract Pattern

Instead of changing everything at once:

### Phase 1: Expand

Add new nullable column/table/index.

### Phase 2: Deploy Compatible Code

Code understands old and new schema.

### Phase 3: Backfill

Migrate historical data gradually.

### Phase 4: Switch Reads/Writes

Use new representation.

### Phase 5: Contract

Remove obsolete schema later.

## Dangerous Migration Examples

- large table rewrite
- adding a non-null column with expensive default on systems where it rewrites rows
- building blocking index
- deleting a column before all old app versions are gone
- renaming a field used by old workers

## Backfill Principles

- chunk work
- checkpoint progress
- throttle
- make idempotent
- monitor replication lag
- avoid unbounded transactions
- support pause/resume

At staff level, migration design is often more important than the final schema.

---

# 30. Data Integrity

Use database constraints where they represent real invariants.

Examples:

- PRIMARY KEY
- UNIQUE
- NOT NULL
- CHECK
- FOREIGN KEY

Application-only validation is insufficient for important invariants because:

- multiple services may write
- bugs happen
- races happen
- scripts bypass application code

Example:

```sql
UNIQUE(user_id, product_id)
```

is often safer than:

```text
SELECT if exists
then INSERT
```

because concurrent requests can race.

---

# 31. Multi-Tenancy

Common strategies:

## Shared Database, Shared Tables

```text
tenant_id column everywhere
```

Pros:

- efficient resource usage
- simpler fleet

Cons:

- isolation risk
- noisy neighbors
- harder per-tenant restore

## Shared Database, Separate Schemas

Better logical isolation.

Operational complexity increases with many tenants.

## Database per Tenant

Pros:

- strong isolation
- easier tenant-specific backup/restore
- independent scaling

Cons:

- operational explosion at high tenant count
- migrations across many databases

## Hybrid

Small tenants share shards; large tenants receive dedicated databases.

Important topics:

- tenant-aware partitioning
- row-level security
- encryption keys
- rate limits
- noisy-neighbor protection
- tenant migrations
- data residency

---

# 32. Time-Series Data

Time-series workloads commonly have:

- append-heavy writes
- timestamp-oriented queries
- retention windows
- downsampling
- aggregation

Example:

```text
(device_id, timestamp, temperature)
```

Common techniques:

- partition by time
- retention policies
- compression
- rollups
- pre-aggregation

Avoid creating one table per device.

---

# 33. Search Systems

Search is a different problem from transactional lookup.

A full-text search engine commonly uses an inverted index:

```text
word -> documents containing word
```

Features:

- tokenization
- stemming
- analyzers
- ranking
- fuzzy matching
- phrase queries
- faceting

A common architecture:

```text
Primary database -> CDC/outbox -> Search index
```

The primary DB remains authoritative.

Search may be eventually consistent.

---

# 34. Graph Databases

Graph model:

```text
Nodes + Edges + Properties
```

Useful for:

- social relationships
- fraud networks
- knowledge graphs
- dependency graphs
- recommendation traversals

Relational databases can model graphs, but deep variable-hop traversals can become awkward or expensive.

Choose graph databases when traversal is truly central to the workload.

---

# 35. Vector Databases

Vector search stores embeddings such as:

```text
[0.13, -0.72, ...]
```

and finds nearby vectors.

Common similarity metrics:

- cosine similarity
- dot product
- Euclidean distance

Exact nearest-neighbor search is expensive at large scale.

Approximate Nearest Neighbor techniques include:

- HNSW
- IVF
- Product Quantization

Important design questions:

- vector dimension
- index build cost
- recall target
- latency target
- metadata filtering
- freshness
- write/update rate
- memory usage

For RAG, do not treat vector similarity as the whole retrieval problem.

Also consider:

- lexical search
- metadata filters
- hybrid ranking
- reranking
- chunking quality
- tenant isolation

---

# 36. Analytical Databases and Warehouses

Analytical systems optimize scans, aggregations, and large datasets.

Typical queries:

```sql
SELECT region, SUM(revenue)
FROM sales
WHERE date >= ...
GROUP BY region;
```

They often use:

- columnar storage
- compression
- vectorized execution
- partition pruning
- massively parallel processing

Do not run heavy BI workloads on a latency-sensitive OLTP primary if it can be avoided.

---

# 37. OLTP vs OLAP

## OLTP

Online Transaction Processing.

Characteristics:

- short transactions
- point reads/writes
- high concurrency
- low latency

Examples:

- checkout
- account update
- order creation

## OLAP

Online Analytical Processing.

Characteristics:

- large scans
- aggregations
- historical analysis
- fewer but heavier queries

Examples:

- business intelligence
- monthly revenue analysis
- cohort analysis

Separate workload types when necessary.

---

# 38. Lake, Warehouse, and Lakehouse

## Data Warehouse

Structured analytical platform with governed schemas and query engines.

## Data Lake

Low-cost storage for raw/semi-structured/structured data.

Risks:

- poor governance
- “data swamp”

## Lakehouse

Attempts to combine:

- object-storage economics
- warehouse-style reliability and table semantics

At staff level, the concern is not terminology—it is data ownership, lineage, freshness, schema governance, quality, and cost.

---

# 39. Storage Formats

## Row-Oriented

Stores a row's values together.

Good for OLTP.

## Column-Oriented

Stores column values together.

Good for analytical scans.

Benefits:

- better compression
- read only required columns
- vectorized processing

## Common Data File Formats

Understand the trade-offs of formats such as:

- CSV
- JSON
- Avro
- Parquet
- ORC

For data platforms, schema evolution and compression matter as much as serialization speed.

---

# 40. Backup, Restore, and Disaster Recovery

A backup is useful only if you can restore it.

## Full Backup

Complete dataset.

## Incremental Backup

Changes since previous backup.

## Differential Backup

Changes since last full backup.

## Point-in-Time Recovery

Restore to a specific time using base backup + logs.

## RPO

Recovery Point Objective.

How much data can be lost?

Example:

```text
RPO = 5 minutes
```

## RTO

Recovery Time Objective.

How long can restoration take?

Example:

```text
RTO = 30 minutes
```

## Backups vs Replication

Replication is not backup.

If a bad `DELETE` replicates instantly, every replica may contain the same mistake.

Backups protect against:

- accidental deletion
- corruption
- ransomware
- bad migrations
- logical mistakes

## Restore Testing

Practice restores.

Measure:

- recovery time
- backup integrity
- operational steps
- application reconnect behavior

---

# 41. Security

Database security is part of system design.

## Authentication

Who are you?

## Authorization

What are you allowed to do?

## Least Privilege

Applications should not connect as database superusers.

Separate permissions for:

- app runtime
- migrations
- analytics
- support tooling
- backup

## Encryption in Transit

Use secure transport between application and database.

## Encryption at Rest

Protect stored data and backups.

## Secrets Management

Do not hard-code credentials.

Prefer:

- managed secret stores
- rotation
- short-lived credentials where possible

## SQL Injection

Use parameterized queries.

Bad:

```text
"SELECT * FROM users WHERE email = '" + email + "'"
```

Good:

```text
prepared statement / parameter binding
```

## Audit Logs

Track important administrative and data-access operations where required.

---

# 42. Privacy, Retention, and Compliance

Ask:

- How long should data live?
- Can a user request deletion?
- Where is data physically located?
- Are backups included in deletion policies?
- Which fields are sensitive?
- Is masking required?
- Is production data allowed in lower environments?

Strategies:

- data classification
- tokenization
- encryption
- pseudonymization
- retention jobs
- lifecycle policies
- auditability

A staff engineer should understand data lifecycle, not only query performance.

---

# 43. Observability

Monitor the database like any other critical distributed system.

## Core Metrics

- query latency p50/p95/p99
- QPS/TPS
- rows read/written
- CPU
- memory
- cache hit ratio
- disk IOPS
- disk latency
- disk utilization
- connections
- connection wait time
- lock waits
- deadlocks
- replication lag
- transaction duration
- buffer/cache usage
- temp file/spill volume
- checkpoint pressure
- WAL/log generation
- compaction backlog
- storage growth

## Slow Query Logs

Capture expensive queries.

## Query Fingerprinting

Group similar SQL statements regardless of parameter values.

## Tracing

Trace application request -> ORM -> DB query.

Important question:

```text
Is the database slow, or is the application waiting because the connection pool is exhausted?
```

---

# 44. Capacity Planning

Senior engineers estimate before designing.

Suppose:

```text
10 million daily active users
20 reads/user/day
2 writes/user/day
```

Then:

```text
Reads/day  = 200 million
Writes/day = 20 million
```

Average QPS:

```text
200,000,000 / 86,400 ≈ 2,315 reads/sec
20,000,000 / 86,400 ≈ 231 writes/sec
```

But systems do not receive uniform traffic.

Apply a peak factor, e.g. 5x–10x depending on workload.

At 10x:

```text
~23,150 reads/sec
~2,310 writes/sec
```

## Storage Estimate

Suppose:

```text
20M records/day
1 KB average record
```

Raw:

```text
~20 GB/day
~600 GB/month
~7.3 TB/year
```

Then add:

- indexes
- replication
- WAL/logs
- backups
- temporary space
- growth headroom

A “7 TB dataset” can require multiples of 7 TB of provisioned infrastructure.

---

# 45. Performance Engineering

Optimize based on evidence.

## Typical Order of Investigation

1. Identify slow endpoint/query.
2. Measure latency distribution.
3. Inspect query plan.
4. Check indexes.
5. Check rows scanned vs returned.
6. Check lock/transaction waits.
7. Check pool waits.
8. Check CPU/memory/I/O.
9. Check replica lag.
10. Check application query pattern.

## Common Improvements

- add/remove/reorder indexes
- rewrite query
- batch requests
- reduce columns fetched
- pagination
- archive cold data
- cache
- partition
- precompute
- denormalize selectively
- move analytics off primary

## Pagination

Offset pagination:

```sql
LIMIT 50 OFFSET 1000000
```

can become expensive and unstable under concurrent writes.

Keyset/cursor pagination:

```sql
WHERE created_at < :last_created_at
ORDER BY created_at DESC
LIMIT 50
```

is often better for large ordered feeds.

---

# 46. Common Database Failure Modes

You should design for these explicitly.

## Node Crash

What happens to in-flight writes?

## Disk Full

What fails first?

Can the database still checkpoint or write logs?

## Slow Disk

Latency can explode while CPU remains low.

## Network Partition

Which side accepts writes?

## Replica Lag

Can stale reads break business flows?

## Split Brain

Can two leaders accept conflicting writes?

## Clock Skew

Are timestamps being used incorrectly for ordering or correctness?

## Bad Query Deployment

One new query can overload the cluster.

## Connection Storm

Application restart creates thousands of simultaneous connections.

## Thundering Herd

Cache expiry sends massive traffic to the database.

## Large Transaction

Causes:

- long locks
- huge WAL
- replication lag
- rollback cost

## Schema Migration Gone Wrong

Locks table or consumes I/O.

## Compaction Storm

LSM database spends heavy resources compacting.

## Hot Key

One partition becomes overloaded.

## Backup Failure

Backups appear successful but are unrecoverable.

---

# 47. Database Selection Framework

Never answer “Which database should I use?” with a product name first.

Use this framework.

## 1. Data Model

- relational?
- document?
- graph?
- time-series?
- vector?
- analytical?

## 2. Access Patterns

- point lookups?
- range scans?
- joins?
- full-text?
- similarity search?
- aggregates?

## 3. Scale

- dataset size
- read QPS
- write QPS
- peak traffic
- growth rate

## 4. Consistency Requirements

- strong consistency?
- eventual consistency?
- read-your-writes?
- serializable transaction?

## 5. Transaction Boundaries

- one row?
- one aggregate?
- multiple tables?
- multiple services?

## 6. Availability

- acceptable downtime?
- multi-AZ?
- multi-region?

## 7. Latency

- p99 target?
- global users?

## 8. Operations

- managed service available?
- team expertise?
- backup tooling?
- observability?

## 9. Cost

- compute
- storage
- network
- replicas
- licensing
- engineer time

## 10. Ecosystem

- connectors
- CDC
- BI tooling
- ORM support
- admin tooling

A boring database with strong team expertise is often better than a trendy database operated poorly.

---

# 48. Design Patterns

## Primary DB + Cache

```text
Client -> Service -> Cache -> Database
```

## Primary DB + Read Replicas

```text
Writes -> Leader
Reads  -> Followers
```

## Primary DB + Search Index

```text
DB -> CDC/outbox -> Search
```

## Primary DB + Warehouse

```text
OLTP -> CDC/ETL -> OLAP
```

## Sharded Relational DB

```text
Router -> Shard A
       -> Shard B
       -> Shard C
```

## Tenant-Based Sharding

```text
hash(tenant_id) -> shard
```

## Write-Ahead Event Publication

```text
Transaction:
  business row
  outbox row

Publisher:
  outbox -> broker
```

## Materialized Read Model

Write model emits changes; read-optimized projection answers expensive queries.

## Immutable Ledger

For money-like systems, keep immutable entries rather than repeatedly mutating one balance field without traceability.

---

# 49. Anti-Patterns

## Using the Database as an Unbounded Queue

Can work for small workloads but often causes polling, locking, and cleanup issues at scale.

## One Giant JSON Column for Everything

Convenient initially; painful for validation, indexing, analytics, migrations, and constraints.

## No Constraints Because “The App Handles It”

Races and scripts eventually violate assumptions.

## Index Every Column

Write amplification and storage explode.

## SELECT * Everywhere

Wastes I/O, memory, and network.

## Long Transactions

Increase contention and cleanup/recovery pressure.

## Synchronous Cross-Service Calls Inside DB Transaction

Remote latency now determines transaction lifetime.

## Auto-Increment ID Used as Global Shard Key Without Thought

Can produce hotspot/sequencing problems depending on storage design.

## Random UUID as Clustered Primary Key Without Understanding Cost

May cause poor locality and page fragmentation in some storage engines.

## Premature Sharding

Sharding increases:

- operational complexity
- cross-shard query complexity
- transaction complexity
- migration complexity

Scale vertically and optimize access patterns before adding distributed complexity unless requirements clearly demand it.

## Treating Replicas as Backups

They replicate mistakes too.

---

# 50. System Design Examples

## 50.1 URL Shortener

Data:

```text
short_code -> long_url
```

Access pattern:

- enormous reads
- relatively fewer writes
- key lookup

Possible design:

- key-value or relational primary store
- cache popular mappings
- generate unique short IDs
- asynchronously collect analytics

Questions:

- custom alias uniqueness
- TTL links
- malicious URLs
- hot links
- multi-region redirects

## 50.2 Social Feed

Tables/concepts:

```text
users
posts
follows
feed_entries
```

Strategies:

### Fanout on Write

When creator posts, insert into followers' feeds.

Good for normal users.

Problem:

- celebrity with 100M followers

### Fanout on Read

Build feed when requested.

Good for celebrity case.

Real systems often use hybrid fanout.

Database concerns:

- timeline partitioning
- cursor pagination
- cache
- hot accounts
- eventual consistency

## 50.3 E-Commerce Orders

Data:

```text
orders
order_items
payments
inventory
shipments
```

Critical invariants:

- order identity
- payment idempotency
- inventory reservation
- audit trail

Do not hold a database transaction open across external payment gateway calls.

Use state machine + idempotency + outbox/saga.

## 50.4 Payment Ledger

Prefer immutable double-entry-like records.

Concept:

```text
transactions
ledger_entries
accounts
```

Rules:

- every movement balanced
- unique idempotency key
- immutable ledger entries
- reconciliation process
- strong auditability

Avoid using floating point for money.

Use fixed precision/integers representing smallest currency unit as appropriate.

## 50.5 Chat System

Data:

```text
conversation_id
message_id
sender_id
created_at
content
```

Partition naturally by conversation for ordered access.

Challenges:

- very large group chats
- unread counters
- message ordering
- deletion
- attachments
- search

## 50.6 Metrics Platform

Write pattern:

```text
metric_name + labels + timestamp + value
```

Requirements:

- high write rate
- retention
- downsampling
- compressed time-series blocks

Do not store all metrics as random JSON documents if you need high-scale time-window aggregation.

## 50.7 Notification System

Primary relational DB for notification state.

Queue/event broker for asynchronous delivery.

Potential read model for user inbox.

Use idempotent delivery keys.

## 50.8 Ride Sharing

Different data stores may serve different purposes:

- transactional DB for trips/payments
- geospatial index for nearby drivers
- cache for online driver state
- analytics warehouse for reporting

One database does not need to solve every workload.

---

# 51. Interview Framework

When designing any database-backed system, follow a repeatable sequence.

## Step 1: Requirements

Functional:

- What must the system do?

Non-functional:

- latency
- availability
- durability
- consistency
- scale
- compliance

## Step 2: Estimate Scale

Calculate:

- DAU/MAU
- reads/sec
- writes/sec
- peak QPS
- storage/day
- annual growth
- bandwidth

## Step 3: Define Data Model

Write entities and relationships.

Example:

```text
User
Order
OrderItem
Payment
```

## Step 4: Define Access Patterns

Example:

```text
Get order by ID
List user's orders by date
Find payment by idempotency key
```

## Step 5: Select Database Type

Justify with access patterns and guarantees.

## Step 6: Choose Keys and Indexes

For every critical endpoint, identify the expected lookup path.

## Step 7: Define Transaction Boundaries

Which operations must commit atomically?

## Step 8: Define Scaling Strategy

- vertical scaling
- replicas
- cache
- partitioning
- sharding

## Step 9: Define Failure Behavior

- node failover
- replica lag
- retries
- duplicate events
- network partition

## Step 10: Define Data Lifecycle

- backup
- restore
- migration
- retention
- deletion

## Step 11: Observability

- latency
- slow queries
- lock waits
- replication lag
- pool saturation

## Step 12: Trade-Offs

Always state what the design intentionally does **not** optimize for.

---

# 52. Senior-Level Expectations

A senior engineer should be able to:

- design relational schemas from domain invariants
- identify correct transaction boundaries
- choose indexes from access patterns
- diagnose slow query plans
- understand MVCC and locking behavior
- reason about isolation anomalies
- design safe schema migrations
- size connection pools
- use read replicas correctly
- reason about stale reads
- design cache invalidation
- know when partitioning is needed
- choose a shard key
- design idempotent APIs
- use outbox/CDC patterns
- plan backup/restore
- identify hot partitions
- estimate capacity
- design for graceful degradation
- explain database selection trade-offs

A senior engineer does not merely say:

```text
Use PostgreSQL + Redis + Kafka.
```

They explain:

```text
Why each component exists, its source of truth, consistency model,
failure behavior, scaling limit, and operational cost.
```

---

# 53. Staff-Level Expectations

Staff engineering goes beyond designing one service.

You should be able to reason across an organization.

## Data Ownership

Who owns each dataset?

Avoid multiple services directly mutating the same tables without ownership boundaries.

## Platform Standardization

Decide which databases are supported internally.

Too many technologies create:

- fragmented expertise
- duplicated tooling
- security complexity
- backup complexity
- on-call complexity

## Build vs Buy

A managed database may cost more per compute unit but save substantial engineering time.

Staff decisions include total cost of ownership.

## Migration Strategy

Example:

```text
single PostgreSQL -> partitioned PostgreSQL -> sharded platform
```

You need an incremental path.

## Reversibility

Prefer reversible decisions early.

Examples:

- abstracting data access only where it provides real migration value
- CDC-based dual-write avoidance
- shadow reads
- backfills
- feature flags

## Multi-Region Strategy

Ask:

- active/passive or active/active?
- write home region?
- conflict resolution?
- user pinning?
- data residency?
- failover RTO?

## Organizational Scalability

The best database architecture must also be operable by real teams.

Consider:

- ownership
- runbooks
- SLOs
- migrations
- incident response
- cost allocation
- tenant isolation

## Governance

Define:

- schema ownership
- migration review
- backup requirements
- production access
- retention
- PII handling
- capacity alerts
- deprecation processes

## Staff-Level Trade-Off Statement Example

> We will keep orders in a strongly consistent relational database because payment and inventory invariants require transactional correctness. Search and analytics will be asynchronous projections because they tolerate seconds of lag. We will initially scale the primary vertically and through read replicas. Tenant-based partitioning will be introduced only after measurements show write or storage limits, because early sharding would significantly increase operational complexity.

That is stronger than listing technologies.

---

# 54. Production Readiness Checklist

Before shipping a database-backed service, verify:

## Schema

- [ ] Primary keys defined
- [ ] Unique constraints defined
- [ ] Foreign keys considered
- [ ] Nullability intentional
- [ ] Data types sized correctly
- [ ] Money does not use floating point
- [ ] Timestamps use consistent timezone strategy

## Queries

- [ ] Critical access patterns documented
- [ ] Critical queries have execution plans reviewed
- [ ] Appropriate indexes exist
- [ ] N+1 queries removed
- [ ] Pagination strategy defined
- [ ] Query timeouts configured

## Transactions

- [ ] Transaction boundaries documented
- [ ] Isolation level understood
- [ ] Retry behavior defined
- [ ] Deadlocks handled
- [ ] Long transactions avoided

## Connections

- [ ] Pool size bounded
- [ ] Connection timeout configured
- [ ] Pool metrics exposed
- [ ] Deployment connection storm considered

## Reliability

- [ ] Replication configured where required
- [ ] Failover behavior understood
- [ ] Backup configured
- [ ] Restore tested
- [ ] RPO defined
- [ ] RTO defined

## Distributed Workflows

- [ ] Idempotency keys used where needed
- [ ] Duplicate events tolerated
- [ ] Outbox/CDC used when atomic state + event publication is needed
- [ ] Retry policy bounded
- [ ] Poison messages handled

## Migrations

- [ ] Migration is backward compatible
- [ ] Backfill is resumable
- [ ] Migration can be throttled
- [ ] Rollback/forward-fix strategy exists

## Security

- [ ] TLS/in-transit encryption
- [ ] Least privilege
- [ ] Secrets managed securely
- [ ] Sensitive fields classified
- [ ] Audit access considered

## Observability

- [ ] Query latency dashboards
- [ ] Slow-query visibility
- [ ] Connection pool metrics
- [ ] Lock wait metrics
- [ ] Replication lag metrics
- [ ] Storage growth alerts
- [ ] Disk saturation alerts

## Capacity

- [ ] Current QPS known
- [ ] Peak QPS known
- [ ] Data growth known
- [ ] Headroom defined
- [ ] 10x bottleneck identified

---

# 55. Learning Roadmap

## Level 0 — Fundamentals

Learn:

- tables
- rows
- columns
- keys
- CRUD
- SQL
- joins
- constraints

Practice:

- design user/order/product schemas
- write SELECT/INSERT/UPDATE/DELETE
- write joins

## Level 1 — Practical Backend Database Work

Learn:

- indexes
- query plans
- transactions
- normalization
- connection pooling
- migrations

Practice:

- PostgreSQL/MySQL locally
- create indexes
- compare plans
- intentionally create a slow query
- measure before/after

## Level 2 — Concurrency and Reliability

Learn:

- locks
- MVCC
- isolation
- deadlocks
- optimistic locking
- backup/restore

Practice:

- reproduce lost update
- reproduce deadlock
- implement optimistic locking
- restore from backup

## Level 3 — Scaling

Learn:

- cache
- read replicas
- partitioning
- sharding
- consistent hashing
- hot keys

Practice:

- partition a large table
- introduce Redis cache
- simulate stale reads
- choose shard keys for different products

## Level 4 — Distributed Data

Learn:

- CAP
- PACELC
- quorums
- consensus
- CDC
- outbox
- sagas
- idempotency

Practice:

- implement transactional outbox
- build idempotent consumer
- design order/payment workflow

## Level 5 — Specialized Stores

Learn:

- Cassandra-style modeling
- search indexes
- time-series databases
- graph databases
- vector retrieval
- analytical warehouses

Practice:

Choose one workload and explain why the specialized store beats a general relational schema.

## Level 6 — Senior

Practice system designs:

- payment platform
- chat system
- notification system
- URL shortener
- social feed
- ride sharing
- metrics platform
- e-commerce marketplace

For every design, write:

```text
Requirements
Scale
Data model
Access patterns
Indexes
Consistency
Transactions
Replication
Partitioning
Caching
Failure modes
Backups
Observability
Trade-offs
```

## Level 7 — Staff

Practice architecture evolution:

```text
10K users
100K users
1M users
10M users
100M users
```

For each stage, identify:

- what breaks next
- what should stay simple
- when to migrate
- migration risk
- cost
- operational burden
- ownership model

Also practice writing Architecture Decision Records explaining why a choice was made and what alternatives were rejected.

---

# 56. Practice Questions

## Beginner

1. What is a primary key?
2. Primary key vs unique key?
3. What is a foreign key?
4. What is normalization?
5. What is an index?
6. Why can an index slow writes?
7. INNER JOIN vs LEFT JOIN?
8. What is a transaction?
9. What does ACID mean?
10. Why is `SELECT *` sometimes undesirable?

## Intermediate

11. When will a database ignore an index?
12. Why does composite index order matter?
13. What is a covering index?
14. What is an execution plan?
15. Nested loop vs hash join?
16. What is MVCC?
17. What is a deadlock?
18. Optimistic vs pessimistic locking?
19. What is replica lag?
20. What is keyset pagination?

## Senior

21. How do you migrate a billion-row table safely?
22. How do you prevent duplicate payment requests?
23. How do you publish an event reliably after a DB write?
24. How do you choose a shard key?
25. How do you fix a hot shard?
26. When should reads go to replicas?
27. How do you provide read-your-writes?
28. What does CAP actually say?
29. What is write skew?
30. What is the difference between serializability and linearizability?
31. How do you size a connection pool?
32. When should you denormalize?
33. When is event sourcing appropriate?
34. How do you design restore testing?
35. How do you handle backfills without overwhelming production?

## Staff

36. Your company uses PostgreSQL, MongoDB, Cassandra, Dynamo-style KV, Redis, Elasticsearch, and three warehouses. How do you decide what to standardize?
37. How do you migrate a globally used service from one database technology to another without downtime?
38. How do you design tenant isolation for 100,000 tenants with 20 very large enterprise tenants?
39. How do you make a data-residency architecture for EU, US, and India while supporting global users?
40. How do you evaluate active-active multi-region writes?
41. What data should be authoritative vs derived?
42. How do you build a company-wide schema/migration governance model without blocking teams?
43. How do you define SLOs for a shared database platform?
44. How do you attribute database cost to tenants/services?
45. How do you decide when sharding is justified?
46. How do you build an escape plan from a vendor-specific managed database?
47. How do you perform a migration where old and new schemas must coexist for weeks?
48. How do you test failure modes before a real outage?
49. How do you decide which invariants require strong consistency?
50. How do you prevent data architecture from becoming an organization-wide bottleneck?

---

# 57. Final Mental Models

## Mental Model 1: Start with Access Patterns

Schema is not the first question.

Start with:

```text
What will be read?
What will be written?
How often?
Under what consistency requirements?
```

## Mental Model 2: Every Optimization Moves Cost

Examples:

```text
Index -> faster reads, slower writes
Cache -> lower DB load, harder consistency
Replication -> availability/read scale, more lag/ops complexity
Sharding -> horizontal scale, harder joins/transactions/operations
Denormalization -> faster reads, harder synchronization
Strong consistency -> simpler correctness, higher coordination cost
```

## Mental Model 3: The Source of Truth Must Be Explicit

If PostgreSQL, Redis, Kafka, Elasticsearch, and a warehouse contain the same logical information, one must be authoritative.

Derived stores should be rebuildable when possible.

## Mental Model 4: Retries Are Normal

Networks fail.

Clients timeout.

Messages redeliver.

Leaders fail over.

Design idempotency from the beginning.

## Mental Model 5: Failures Are Part of Normal Operation

Design for:

```text
node failure
network partition
slow dependency
replica lag
duplicate message
partial deployment
bad migration
traffic spike
disk pressure
```

## Mental Model 6: Correctness Before Scale

A fast system that charges a customer twice is a bad system.

Establish invariants before optimizing throughput.

## Mental Model 7: Do Not Distribute Until Necessary

A single well-tuned relational database can go much farther than many teams expect.

Distributed databases solve real problems but introduce new ones.

## Mental Model 8: Staff Engineering Includes Migration

The final architecture matters less if there is no safe path from today's architecture to the future one.

Always design:

```text
Current state -> migration path -> target state -> rollback/forward-fix
```

## Mental Model 9: Operational Simplicity Is a Feature

A theoretically elegant system that the team cannot operate reliably is not a good architecture.

## Mental Model 10: Explain Trade-Offs, Not Brands

Weak:

> Use Cassandra because it scales.

Strong:

> This workload is append-heavy, naturally partitioned by device ID and time bucket, requires predictable high write throughput, does not need arbitrary joins, and tolerates eventual consistency for most reads. A wide-column distributed store is therefore a reasonable fit, provided we design partitions to avoid hotspots and plan compaction/tombstone behavior.

That difference is what moves you toward senior and staff-level system design.

---

# Appendix A — Quick Database Comparison

| Database style | Excellent for | Main trade-offs |
|---|---|---|
| Relational | transactions, constraints, joins | horizontal distribution can require more work |
| Key-value | simple fast key lookup | weak ad-hoc query flexibility |
| Document | aggregate documents, flexible schema | joins/invariants can be harder |
| Wide-column | large distributed write-heavy workloads | query-first modeling, operational complexity |
| Search | text search and ranking | not ideal as transactional source of truth |
| Graph | deep relationship traversal | specialized operational/query model |
| Time-series | timestamped metrics/events | specialized access pattern |
| Columnar analytics | scans and aggregations | not ideal for OLTP |
| Vector | semantic similarity retrieval | approximate search, memory/index trade-offs |

---

# Appendix B — ID Strategy

## Auto-Increment Integer

Pros:

- compact
- index-friendly
- easy

Cons:

- central sequence coordination
- predictable IDs
- harder global generation in some distributed designs

## UUID v4

Pros:

- decentralized generation
- huge address space

Cons:

- larger indexes
- random insertion patterns in some engines

## Time-Ordered UUID / ULID-Like IDs

Pros:

- decentralization
- roughly sortable
- often better locality

Cons:

- larger than integers
- timestamp information may be exposed

## Snowflake-Style ID

Typically combines:

```text
timestamp + worker/node + sequence
```

Pros:

- globally unique
- roughly ordered
- decentralized within coordinated worker ID scheme

Cons:

- clock/worker-ID operational concerns

Choose IDs based on:

- locality
- privacy
- generation topology
- storage size
- sorting requirements

---

# Appendix C — Database Numbers You Should Be Able to Estimate

Know how to calculate:

```text
average QPS
peak QPS
read/write ratio
storage/day
storage/year
index overhead
replication overhead
network egress
cache working set
connection count
```

Example:

```text
1 KB row
1 billion rows
= ~1 TB raw data
```

But actual provisioned storage may be several TB after indexes, replicas, WAL/logs, temporary working space, and operational headroom.

---

# Appendix D — Questions to Ask During a Database Incident

1. What changed recently?
2. Is latency in the application, pool, or DB execution?
3. Is CPU saturated?
4. Is storage latency high?
5. Are connections exhausted?
6. Are transactions waiting on locks?
7. Did a query plan change?
8. Did row counts/data distribution change?
9. Is replication lagging?
10. Did a migration start?
11. Did cache hit rate collapse?
12. Is a single tenant/key hot?
13. Is compaction/checkpoint/vacuum pressure high?
14. Is disk nearly full?
15. Can load be shed safely?
16. Can expensive features be disabled?
17. Can traffic be routed to healthy replicas/regions?
18. What is the recovery path if the primary fails?

---

# Appendix E — Architecture Decision Template

Use this for senior/staff-level decisions.

## Context

What problem are we solving?

## Requirements

- throughput
- latency
- consistency
- availability
- durability
- data size
- retention
- residency

## Options

Example:

```text
PostgreSQL
Dynamo-style key-value
Cassandra-style wide-column
MongoDB
```

## Decision

Which option did we choose?

## Why

Tie the choice to measurable workload characteristics.

## Rejected Alternatives

Why were they rejected?

## Risks

What could go wrong?

## Mitigations

How will the risks be managed?

## Migration Path

How do we get there safely?

## Exit Strategy

How difficult is it to reverse this decision?

---

# Appendix F — What “Staff-Level Database Design” Sounds Like

Instead of:

> We need NoSQL because we will have millions of users.

Say:

> The current relational workload is still within a single primary's estimated capacity. Our immediate bottleneck is read amplification from an unindexed access pattern, not write throughput. We should fix indexing and add a bounded cache/read replica before introducing sharding. We will instrument per-tenant QPS and storage growth, and define an explicit threshold for moving to tenant-based partitioning.

Instead of:

> We need eventual consistency for scale.

Say:

> Order acceptance and payment state require strong transactional guarantees, but search, recommendations, analytics, and notification feeds can tolerate seconds of staleness. We will keep the order database authoritative and distribute derived projections asynchronously through an outbox/CDC pipeline.

Instead of:

> Add more replicas.

Say:

> Read replicas help only the read workload. The current bottleneck is write I/O and lock contention, so more followers will not solve it. We need to reduce write amplification, shorten transactions, and evaluate partitioning before adding replicas for this specific problem.

---

# Closing

To become a senior or staff engineer, do not focus on memorizing product features. Build the habit of reasoning from:

```text
Business invariants
        ↓
Access patterns
        ↓
Scale estimates
        ↓
Consistency requirements
        ↓
Data model
        ↓
Indexes and transaction boundaries
        ↓
Replication / caching / partitioning
        ↓
Failure handling
        ↓
Migration and recovery
        ↓
Observability and operations
        ↓
Trade-offs and organizational impact
```

If you can consistently explain those layers, defend your decisions with measurable constraints, predict failure modes, and design safe migration paths, you are operating far beyond “I know SQL” and much closer to senior/staff-level database system design.

---

# Appendix G — Read Path and Write Path Internals

A system designer does not need to implement a storage engine, but should understand what happens behind a read or write.

## Simplified Relational Read Path

```text
Application
   ↓
Connection pool
   ↓
SQL parser
   ↓
Planner / optimizer
   ↓
Execution plan
   ↓
Buffer pool lookup
   ↓
Index/table pages
   ↓
Visibility / transaction checks
   ↓
Result
```

If a required page is not already in memory, the engine may fetch it from storage.

This is why memory working-set size matters so much.

## Simplified Relational Write Path

```text
Application sends UPDATE
        ↓
Database validates transaction/constraints
        ↓
Relevant pages changed in memory
        ↓
WAL/log record generated
        ↓
Commit log durability requirement satisfied
        ↓
Client receives commit success
        ↓
Dirty data pages flushed later
```

The exact implementation varies, but the important idea is:

> A database does not necessarily flush every changed table page to its final on-disk location before acknowledging a commit.

The transaction log allows recovery.

## Simplified LSM Write Path

```text
Client write
    ↓
WAL
    ↓
Memtable
    ↓
Acknowledgement
    ↓
Memtable flush
    ↓
SSTable
    ↓
Background compaction
```

## Simplified LSM Read Path

```text
Memtable
   ↓
Immutable memtables
   ↓
Bloom filters/indexes
   ↓
Multiple SSTable levels
   ↓
Merge visible result
```

Compaction reduces the number of files a read must inspect.

---

# Appendix H — WAL, fsync, Checkpoints, and Crash Recovery

## Write-Ahead Logging

The key durability idea:

```text
Log the change before relying on the changed data page.
```

If the server crashes after the log is durable but before the data page is written, recovery can replay the log.

## fsync

Operating-system writes may initially enter caches.

A durable database commit may require mechanisms that ensure data reaches storage according to configured durability guarantees.

Turning down durability settings can improve throughput but changes the failure guarantee.

Do not tune this blindly.

## Group Commit

Instead of forcing storage independently for every transaction, a database can group multiple transaction log flushes.

This improves throughput while maintaining durability semantics.

## Checkpoint

A checkpoint reduces how much log must be replayed after a crash.

Too-aggressive checkpoints can create heavy write I/O.

Too-infrequent checkpoints can increase recovery time and log growth.

## Redo

Reapply changes that were committed but not fully reflected in data pages.

## Undo

Some recovery designs need to ensure uncommitted effects are removed/ignored.

## Crash Recovery Questions

Ask:

- What is durable after an acknowledged commit?
- Is storage itself replicated?
- What happens after power loss?
- How long can crash recovery take?
- Can recovery time violate RTO?

---

# Appendix I — Buffer Pools, Working Sets, and Memory

Databases rely heavily on memory.

## Buffer Pool

Caches database pages in memory.

A high hit rate means many reads avoid physical storage.

## Working Set

The actively accessed subset of data and indexes.

A 20 TB database can still perform well if the hot working set is 50 GB and fits in memory, depending on workload.

## Memory Pressure

If the hot working set exceeds available cache:

```text
cache misses ↑
storage reads ↑
latency ↑
throughput ↓
```

## Why Adding RAM Can Help

More memory may:

- cache more indexes
- cache hot table pages
- reduce physical I/O

But RAM does not solve:

- lock contention
- bad query plans
- connection storms
- CPU-bound execution
- hot partitioning

---

# Appendix J — B-Tree Page Splits, Locality, and Fragmentation

B-tree pages have finite capacity.

When inserting into a full page, the tree may split the page.

Sequential keys often have good insertion locality.

Random keys can distribute inserts across many pages.

Potential consequences:

- more random I/O
- cache churn
- page splits
- fragmentation depending on engine

This is why primary-key choice can affect physical performance.

Do not automatically conclude that random UUIDs are “bad.” Their effect depends on database engine, workload, scale, and index design.

---

# Appendix K — LSM Compaction Deep Dive

Compaction merges immutable sorted files.

Goals:

- discard obsolete versions
- remove tombstones when safe
- reduce read amplification
- reorganize data into levels

## Leveled Compaction

Maintains structured levels with limited overlap.

Typical advantages:

- predictable reads

Potential cost:

- higher write amplification

## Size-Tiered Compaction

Merges similarly sized files.

Typical advantages:

- efficient writes

Potential cost:

- greater read/space amplification

## Tombstones

A delete in an immutable storage design is often represented by a deletion marker.

Too many tombstones can harm reads and compaction.

## Compaction Debt

If writes arrive faster than compaction can process them:

```text
SSTables accumulate
read amplification rises
storage rises
latency becomes unstable
```

Capacity planning for an LSM system must include compaction throughput, not just application write throughput.

---

# Appendix L — Distributed Replication Internals

## Replication Log

A leader often records an ordered sequence of changes and followers apply that sequence.

Followers track some concept of replication position.

## Physical Replication

Replicates low-level database changes/pages/log records.

Pros:

- close replica fidelity

Cons:

- often engine/version coupled

## Logical Replication

Replicates logical row/table changes.

Pros:

- selective replication
- useful for migrations/CDC

Cons:

- more logical transformation complexity

## Read Replica Failover

Failover is not merely:

```text
promote replica
```

You must consider:

- how far behind it is
- whether old primary can still receive traffic
- DNS/service discovery propagation
- connection retry behavior
- fencing
- client transaction failures

---

# Appendix M — Leaderless Replication, Repair, and Quorums

Leaderless systems often replicate each key to `N` nodes.

Example:

```text
N = 3
W = 2
R = 2
```

A successful write waits for 2 replicas.

A read queries enough replicas to detect/reconcile versions.

Important mechanisms can include:

## Read Repair

A read discovers replicas disagree and repairs stale copies.

## Anti-Entropy Repair

Background comparison/repair ensures replicas converge even for rarely read keys.

## Hinted Handoff

If a target replica is unavailable, another node temporarily records a hint and forwards it later.

## Sloppy Quorum

Some systems accept writes on alternative nodes during failures to preserve availability.

This can weaken simple quorum assumptions.

## Last-Write-Wins

Choose value with “latest” timestamp/version.

Risk:

- legitimate concurrent updates can be silently discarded
- clocks complicate ordering

Use only when semantic loss is acceptable.

---

# Appendix N — Clocks, Ordering, and Versioning

Distributed systems do not have one perfectly reliable global wall clock.

## Physical Clock

Machine wall-clock time.

Problems:

- skew
- drift
- NTP adjustment

## Logical Clock

Represents ordering without requiring exact wall time.

## Lamport Clock

Provides a logical happens-before-compatible ordering, but does not capture full concurrency information.

## Vector Clock / Version Vector

Tracks causal versions across participants and can identify concurrent updates.

Costs:

- metadata grows with participants/version structure

## Hybrid Logical Clock

Combines physical time with logical ordering techniques.

Useful for distributed systems needing roughly wall-time-aligned monotonic ordering.

## Design Rule

Do not use `updated_at` timestamps alone as a correctness mechanism unless clock and concurrency semantics are explicitly understood.

---

# Appendix O — Conflict Resolution and CRDT Concepts

In active-active or offline-capable systems, concurrent writes can conflict.

Resolution strategies:

- last-write-wins
- merge sets
- application-specific merge
- reject conflict
- CRDT-style convergent structures

## CRDT

Conflict-Free Replicated Data Type.

Designed so concurrent independently updated replicas can merge deterministically.

Examples of concepts:

- grow-only counter
- positive/negative counter
- grow-only set
- observed-remove set

CRDTs are powerful but do not eliminate business-level conflict questions.

“Two users booked the same last hotel room” is not solved simply by merging two values.

---

# Appendix P — Distributed SQL / NewSQL

Distributed SQL systems attempt to provide relational SQL and transactional semantics across multiple nodes.

Typical goals:

- horizontal scale
- SQL
- transactions
- automatic replication
- distributed consensus

Trade-offs:

- coordination latency
- distributed transaction cost
- operational complexity
- topology-sensitive performance

A distributed SQL database is not automatically the right choice for a globally distributed system.

Ask:

- How many transactions cross partitions?
- Is locality aligned with partitioning?
- What is cross-region commit latency?
- Can users/data be region-affined?

---

# Appendix Q — Global and Secondary Indexes in Sharded Systems

A secondary index is simple on one database node but harder across shards.

Suppose data is sharded by:

```text
user_id
```

but you need:

```text
lookup by email
```

Options:

## Scatter-Gather

Query every shard.

Usually poor at scale.

## Global Secondary Index

Maintain:

```text
email -> user_id/shard
```

Challenges:

- consistency with base data
- transactional update
- hotspotting
- failure/rebuild

## Dedicated Lookup Service/Table

Maintain a smaller strongly consistent mapping.

## Change the Primary Partition Model

If lookup-by-email is dominant, current shard key may be wrong.

This demonstrates a major truth:

> Sharding converts some formerly-local indexes and constraints into distributed systems problems.

---

# Appendix R — Cross-Shard Joins and Aggregations

Queries such as:

```sql
SELECT ... JOIN ...
```

become harder when related rows live on different shards.

Strategies:

- colocate related records
- duplicate read data
- query service aggregation
- distributed query engine
- offline warehouse
- precomputed projection

For real-time OLTP, prefer partition keys that keep common transactional access local.

---

# Appendix S — Multi-Region Database Design

Multi-region design exists for latency, availability, residency, or all three.

## Active-Passive

One write region; standby region receives replication.

Pros:

- simpler consistency

Cons:

- remote write latency for global clients
- failover process

## Active-Active

Multiple regions accept writes.

Pros:

- local write latency
- regional autonomy

Cons:

- conflicts
- global ordering
- unique constraints
- distributed transactions

## Home-Region Model

Each tenant/user/account has one write home.

```text
user A -> India region
user B -> EU region
```

This reduces write conflicts while allowing global deployment.

## Multi-Region Questions

- Can writes be routed to a home region?
- What data needs global uniqueness?
- How does failover change ownership?
- What happens during inter-region partition?
- How are cross-region transfers handled?
- What is acceptable replication lag?

---

# Appendix T — Exactly-Once: What You Should Say

“Exactly once” is often used too casually.

In distributed applications, delivery retries and ambiguous failures are normal.

A safer architecture generally aims for:

```text
at-least-once delivery
+
idempotent processing
+
transactional state transitions where required
```

Example:

A consumer receives `PaymentCaptured(payment_id=123)` twice.

Use a uniqueness constraint or processed-event table:

```text
processed_events(event_id PRIMARY KEY)
```

and commit processing + event marker atomically when possible.

This prevents duplicate side effects.

---

# Appendix U — Data Backpressure and Admission Control

A database can collapse when allowed to accept unlimited parallel work.

Symptoms:

```text
latency rises
clients retry
load rises further
latency rises more
```

This is a retry storm / overload feedback loop.

Protect the DB with:

- bounded pools
- queue limits
- request deadlines
- circuit breakers
- concurrency limits
- load shedding
- rate limits
- prioritized traffic

A healthy system should fail some low-priority work quickly rather than make every request fail slowly.

---

# Appendix V — Database Timeouts

Define explicit timeouts for:

- connection acquisition
- connection establishment
- statement execution
- transaction duration
- lock wait
- network read/write

Infinite waits turn partial failures into resource exhaustion.

Timeouts must align with end-to-end request deadlines.

If the HTTP request deadline is 2 seconds, a DB statement timeout of 30 seconds is usually meaningless for that path.

---

# Appendix W — Retries and Transaction Retry Loops

Retry only errors that can reasonably succeed on another attempt.

Examples:

- serialization conflict
- deadlock victim
- transient failover

Use:

- bounded attempt count
- exponential backoff
- jitter
- idempotency
- total deadline

Do not blindly retry:

- syntax errors
- constraint violations that represent business failure
- permanently invalid data

---

# Appendix X — Online Index Creation and DDL

DDL operations can be expensive.

Examples:

- creating index
- dropping index
- adding constraint
- altering column type

Questions before production DDL:

- Does it lock reads/writes?
- Is there an online/concurrent option?
- How much extra disk is required?
- Will replication lag spike?
- Can it be cancelled safely?
- How long on production-sized data?

Test DDL against realistic data volumes.

---

# Appendix Y — Zero-Downtime Data Type Changes

Suppose:

```text
user_id INT -> BIGINT
```

A direct type change may lock/rewrite a huge table.

An expand-and-contract approach may be safer:

```text
1. Add new BIGINT column
2. Dual-populate safely
3. Backfill old records
4. Verify equality
5. Switch readers
6. Switch writers
7. Remove old column later
```

The exact process varies by database, but the migration principle is universal.

---

# Appendix Z — Dual Writes: Why They Are Dangerous

Application code:

```text
write DB A
write DB B
```

Failure cases:

```text
A succeeds, B fails
A times out but succeeded, retry writes B twice
process crashes between writes
```

Safer migration/integration options often include:

- transactional outbox
- CDC
- durable log
- one authoritative writer + derived copy

If dual writes are unavoidable, define reconciliation explicitly.

---

# Appendix AA — Shadow Reads and Migration Validation

During a database migration:

```text
Old DB = authoritative
New DB = shadow
```

For selected traffic:

1. Read authoritative result.
2. Read shadow result asynchronously or within safe budget.
3. Compare.
4. Record mismatch.

Do not let shadow failures break production while shadow is non-authoritative.

Compare semantics, not only raw serialization.

---

# Appendix AB — Reconciliation

Distributed systems need repair mechanisms.

Example:

Payment provider says captured, internal DB says pending.

Reconciliation process:

```text
periodically compare authoritative external/internal records
identify mismatch
repair or escalate
record audit trail
```

Critical financial systems need reconciliation even if primary request flows are designed well.

---

# Appendix AC — Materialized Views

A materialized view stores a precomputed query result.

Useful for expensive aggregation/read patterns.

Trade-offs:

- refresh complexity
- staleness
- extra storage

Refresh styles:

- full rebuild
- incremental
- event-driven projection

A materialized view is a form of deliberate denormalization.

---

# Appendix AD — Database vs Object Storage for Files

Do not automatically store large binaries directly in the relational database.

Common architecture:

```text
Metadata -> Database
Binary    -> Object storage
```

Database row:

```text
file_id
owner_id
object_key
content_type
size
checksum
created_at
```

Object storage handles large blobs more naturally.

Reasons:

- cheaper storage
- independent scaling
- CDN integration
- streaming/range requests

Direct BLOB-in-database storage can still be valid for some transactional/compliance requirements, but should be intentional.

---

# Appendix AE — Geospatial Data

Geospatial workloads include:

- nearby restaurants
- drivers within radius
- points inside polygon
- routes

Common index concepts:

- R-tree
- GiST-like spatial indexing
- geohash
- S2/H3-style hierarchical cells

A common approximation:

```text
lat/lon -> cell ID
```

Nearby queries search the current and neighboring cells, then calculate precise distance.

Challenges:

- poles/dateline
- variable cell density
- hotspot urban areas
- moving entities

---

# Appendix AF — Counters at Scale

Simple counter:

```sql
UPDATE posts SET likes = likes + 1 WHERE id = ?;
```

can create a hot row under extreme traffic.

Strategies:

- sharded counters
- event aggregation
- approximate counters
- asynchronous rollups

But if exact inventory count determines whether an item can be sold, approximate eventual counters are not enough.

Always connect counter strategy to correctness requirement.

---

# Appendix AG — Unique Constraints in Distributed Systems

Local uniqueness is easy:

```text
UNIQUE(email)
```

Global uniqueness across shards is harder.

Options:

- route all values for uniqueness domain to same shard
- centralized reservation/lookup service
- globally coordinated database
- deterministic ownership by hash

If two shards can independently accept the same email, uniqueness is no longer a local constraint.

---

# Appendix AH — Foreign Keys in Sharded Architectures

Foreign keys work best when referenced data is local to the same database/partition.

Across services/shards, referential integrity may become application-controlled.

Possible approach:

```text
Order stores user_id
Order service does not synchronously require a cross-shard FK
```

Then ownership and deletion semantics must be explicitly designed.

Do not casually replace database-enforced integrity with distributed application logic without understanding the cost.

---

# Appendix AI — Soft Delete vs Hard Delete

## Hard Delete

Record is physically/logically removed from active dataset.

## Soft Delete

```text
deleted_at = timestamp
```

Advantages:

- recovery/audit convenience

Costs:

- every query must handle deleted rows
- indexes/storage retain data
- uniqueness becomes tricky
- privacy deletion may still require actual removal

Alternative:

- immutable audit log + actual active-row deletion

Choose based on business and compliance needs.

---

# Appendix AJ — Retention, Archival, and Tiered Storage

Not all data needs to stay in the primary database forever.

Lifecycle example:

```text
0–30 days   -> hot OLTP
30–365 days -> cheaper queryable store
>365 days   -> archival object storage
```

Archival reduces:

- primary storage
- index size
- backup time
- maintenance cost

But increases complexity for historical reads and legal holds.

---

# Appendix AK — ORM System Design Pitfalls

ORMs improve productivity but can hide expensive behavior.

Watch for:

- N+1 queries
- loading entire object graphs
- accidental transactions
- hidden lazy loads
- SELECT *
- poorly generated joins
- unbounded queries
- one connection per unit of work held too long

Senior engineers inspect generated SQL and query plans.

The ORM is not the database architecture.

---

# Appendix AL — Database Access Layer Design

A good service should expose domain-oriented persistence operations.

Prefer:

```text
GetUserByID
ListOrdersForCustomer
ReserveInventory
```

over leaking arbitrary DB queries throughout the codebase.

Benefits:

- ownership
- observability
- migration control
- consistent transaction behavior

But avoid pointless repository abstractions that merely rename every ORM function without adding boundaries or policy.

---

# Appendix AM — Read/Write Splitting

Routing reads to replicas can reduce primary load.

But not every read is safe on a replica.

Examples that may require leader/strong read:

- immediately after user changes password
- confirming payment state after capture
- authorization decision after permission update

Examples often tolerant of replica lag:

- product catalog browsing
- historical analytics
- public profile view

Classify reads by consistency need instead of routing every SELECT to replicas.

---

# Appendix AN — Database Proxies

A database proxy can provide:

- connection multiplexing
- pooling
- failover routing
- authentication integration
- read/write routing

Potential costs:

- another network hop
- transaction/session compatibility constraints
- hidden bottleneck

Understand whether your application depends on session-level features before aggressive multiplexing.

---

# Appendix AO — Prepared Statements

Prepared statements can provide:

- parameter safety
- possible parse/plan savings

But plan caching can have edge cases when parameter distributions vary dramatically.

Example:

```text
tenant A has 10 rows
tenant B has 500 million rows
```

One generic plan may be poor for one tenant.

This is an advanced example of why data distribution matters.

---

# Appendix AP — Data Skew

Average distribution can hide pathological tenants/keys.

Example:

```text
99% tenants < 10K records
1 tenant = 2 billion records
```

Design capacity around percentiles and worst meaningful tenants, not only averages.

Track:

- rows per tenant
- QPS per tenant
- bytes per partition
- hottest keys

---

# Appendix AQ — Testing Database Systems

## Unit Tests

Test domain rules independently where appropriate.

## Integration Tests

Run against real database behavior for:

- SQL
- constraints
- transactions
- isolation
- migrations

Mocks do not reproduce real locking, query plans, or database errors.

## Migration Tests

Test:

```text
old schema + old data
        ↓ migration
new schema
        ↓
new application
```

Also test rollback/forward compatibility when required.

## Load Tests

Measure:

- p50/p95/p99
- throughput
- connection waits
- DB utilization
- errors

## Soak Tests

Run long enough to expose:

- memory leaks
- compaction debt
- index/table bloat
- connection leaks

## Failure Tests

Inject:

- primary restart
- replica failure
- packet delay
- timeout
- disk pressure

Verify application behavior, not only database recovery.

---

# Appendix AR — Database SLOs

Example service indicators:

- successful transaction rate
- query latency
- failover recovery time
- replication freshness

Example SLO thinking:

```text
99.9% of critical DB-backed requests complete successfully within 200 ms over 30 days
```

Database-level metrics are supporting indicators; user-visible reliability is the goal.

Define separate SLOs for:

- critical write path
- eventually consistent read models
- analytics freshness

---

# Appendix AS — Cost Engineering

Database architecture cost includes more than storage price.

## Direct Costs

- compute
- storage
- provisioned IOPS
- backups
- replicas
- cross-region traffic
- data egress
- licenses

## Indirect Costs

- on-call burden
- upgrades
- migrations
- specialized expertise
- incident risk
- developer productivity

A managed service with a higher infrastructure bill may still have lower total cost of ownership.

---

# Appendix AT — Database Operational Runbook Template

Every critical database should have a runbook.

## Ownership

```text
Team:
On-call:
Escalation:
```

## Architecture

```text
Primary region:
Replica regions:
Replication mode:
Connection endpoint:
```

## SLOs

```text
Availability:
Latency:
RPO:
RTO:
```

## Common Alerts

```text
CPU high
storage high
replication lag
connections high
lock waits
backup failure
```

## Incident Actions

For each alert:

- how to verify
- safe mitigations
- dangerous actions
- escalation threshold

## Recovery

- failover process
- restore process
- validation process

## Contacts and Dependencies

- cloud/platform team
- networking
- security
- application owner

---

# Appendix AU — Disaster Recovery Exercise

A real DR exercise should test more than “replica exists.”

Scenario:

```text
Primary region is unavailable.
```

Validate:

1. Detection.
2. Incident ownership.
3. Failover decision.
4. Database promotion/recovery.
5. Application routing.
6. Credential/network configuration.
7. Background workers.
8. Data consistency.
9. Customer-visible functionality.
10. Return/failback strategy.

Record actual RTO and data loss, then compare to objectives.

---

# Appendix AV — Bulk Imports and Exports

Large data movement can overwhelm normal production paths.

For bulk import:

- chunk records
- use database-native bulk APIs where appropriate
- throttle
- monitor WAL/log growth
- monitor replication lag
- consider temporarily different index strategy when safe
- validate counts/checksums

For export:

- avoid locking giant transactions
- use snapshots where available
- stream results
- bound memory

---

# Appendix AW — Batch vs Streaming Data Movement

## Batch

Move/process data periodically.

Pros:

- simple
- cost-efficient

Cons:

- freshness delay

## Streaming

Process changes continuously.

Pros:

- low latency

Cons:

- ordering/retry/state complexity

Use business freshness requirements to choose.

Not every pipeline needs streaming.

---

# Appendix AX — Data Quality

A technically available database can still contain bad data.

Data quality dimensions:

- completeness
- validity
- uniqueness
- consistency
- timeliness
- accuracy

Controls:

- constraints
- validation
- reconciliation
- schema contracts
- anomaly monitoring

Staff-level data architecture includes trustworthiness of data, not only availability.

---

# Appendix AY — Database Ownership in Microservices

A useful default:

> A service owns its data and other services access it through defined contracts/events, not by writing its tables directly.

Why?

- schema independence
- clear ownership
- safer migrations
- security boundaries

But strict “one physical DB server per service” is not mandatory.

Multiple services can use one managed database cluster while maintaining logical ownership through separate databases/schemas/users, depending on constraints.

---

# Appendix AZ — Shared Database vs Database per Service

## Shared Database

Pros:

- easy joins
- simpler transactions
- fewer infrastructure units

Cons:

- coupling
- blast radius
- unclear ownership

## Database per Service

Pros:

- autonomy
- independent schema evolution
- technology choice

Cons:

- distributed transactions
- duplicated data
- operational overhead

The right answer depends on organization and domain boundaries.

Do not adopt microservice database patterns for a small monolith merely because they are fashionable.

---

# Appendix BA — Polyglot Persistence

Polyglot persistence means using different storage technologies for different workloads.

Example:

```text
Orders      -> relational DB
Session     -> Redis
Search      -> OpenSearch/Elasticsearch
Analytics   -> columnar warehouse
Embeddings  -> vector index
```

This can be excellent when each store has a clear role.

It becomes harmful when every team independently introduces a new database without operational standards.

---

# Appendix BB — Source of Truth vs System of Record

Clarify terminology in architecture documents.

Example:

```text
Order DB = authoritative transactional state
Search index = derived projection
Warehouse = analytical copy
Cache = disposable acceleration layer
```

If derived storage is lost, the architecture should ideally define how it is rebuilt.

---

# Appendix BC — Database State Machines

Many complex workflows become easier when represented explicitly as states.

Example order:

```text
CREATED
  ↓
PAYMENT_PENDING
  ↓
PAID
  ↓
FULFILLING
  ↓
SHIPPED
```

Invalid transitions should be rejected.

Example:

```text
SHIPPED -> PAYMENT_PENDING
```

should normally be impossible.

Use conditional updates/version checks to avoid races between workers.

---

# Appendix BD — Compare-and-Swap

Atomic conditional update:

```text
change value only if current value/version matches expectation
```

SQL example:

```sql
UPDATE jobs
SET status = 'RUNNING'
WHERE id = ? AND status = 'PENDING';
```

Exactly one worker wins if implemented atomically.

This pattern is useful for:

- job claiming
- state transitions
- optimistic concurrency

---

# Appendix BE — Leasing Work from a Database

For moderate job workloads, a relational DB can be used as a work queue using careful locking/claiming semantics.

Important properties:

- atomically claim work
- lease timeout
- retry failed workers
- avoid multiple workers blocking on same jobs
- indexes on claim query

At very high messaging scale or when broadcast/stream semantics are needed, a dedicated broker may be more appropriate.

The lesson is not “never use DB as queue”; it is to understand workload and semantics.

---

# Appendix BF — Checksums and Corruption Detection

Checksums help detect accidental corruption during storage or transfer.

Examples:

- page checksums
- object/file checksum
- backup verification

A checksum is not authentication unless used in a cryptographically secure keyed/authenticated construction for that purpose.

For database backup pipelines, verify both:

- integrity
- restorable semantics

---

# Appendix BG — Compression

Compression trades CPU for storage/network reduction.

Columnar databases often compress extremely well because adjacent values are similar.

Compression can improve query performance if reduced I/O outweighs decompression CPU.

Common conceptual techniques:

- dictionary encoding
- run-length encoding
- delta encoding
- general-purpose compression

---

# Appendix BH — Data Partition Pruning

If a large table is partitioned by date:

```text
orders_2026_06
orders_2026_07
orders_2026_08
```

then a query restricted to August should ideally read only August partitions.

This is partition pruning.

If queries do not include the partition key, partitioning may provide little benefit or make queries more complex.

---

# Appendix BI — Time-Based Partition Maintenance

For time-series/event tables:

```text
partition by day/month
```

Retention can become:

```text
drop old partition
```

instead of deleting billions of individual rows.

Benefits:

- predictable cleanup
- less transactional work

But too many tiny partitions create metadata/planning overhead.

---

# Appendix BJ — Hotspot Avoidance for Time-Ordered Keys

Time-ordered keys improve locality but can concentrate writes at one end of an ordered index/partition.

Whether this is a problem depends on:

- single-node vs distributed storage
- page-level contention
- partition algorithm

Possible distributed strategies:

- hash prefix + time suffix
- multiple write buckets
- partition by tenant before timestamp

Trade-off: spreading writes can make range reads harder.

---

# Appendix BK — Read Amplification, Write Amplification, Space Amplification

These three ideas help compare storage engines.

## Read Amplification

How much extra data/work is read to answer a logical read?

## Write Amplification

How many physical bytes/writes occur for each logical write?

Indexes and compaction can raise write amplification.

## Space Amplification

How much extra disk is used beyond current logical data?

Old versions, tombstones, indexes, and temporary compaction files matter.

A database optimized for one dimension often pays in another.

---

# Appendix BL — Benchmarking Databases Correctly

Bad benchmark:

```text
Database X handled 1 million QPS on a blog.
```

Useful benchmark mirrors your workload:

- row/document sizes
- read/write ratio
- query distribution
- consistency level
- replica count
- dataset larger than memory if applicable
- realistic network
- realistic indexes
- peak concurrency

Measure tail latency, not only average throughput.

---

# Appendix BM — Tail Latency

Users experience slow outliers.

For a page making 20 backend calls, even moderate per-call p99 latency can make overall tail behavior poor.

Track:

```text
p50
p95
p99
p99.9 where justified
```

Database saturation often first appears as rapidly worsening tail latency.

---

# Appendix BN — Little's Law for Database Thinking

A useful queueing relationship:

```text
Concurrency ≈ Throughput × Latency
```

If a database handles:

```text
2,000 queries/sec
average latency = 50 ms = 0.05 sec
```

then roughly:

```text
2,000 × 0.05 = 100
```

queries are in flight on average.

If latency jumps to 500 ms at the same arrival rate:

```text
2,000 × 0.5 = 1,000
```

concurrent requests accumulate.

This is why latency spikes can rapidly exhaust pools and threads.

---

# Appendix BO — Queuing Before the Database

If a service receives 10x the DB's sustainable capacity, increasing the connection pool merely moves the queue into the database.

Better:

```text
bounded application concurrency
+
short queues
+
backpressure
```

Protect scarce DB resources.

---

# Appendix BP — When to Scale Up vs Scale Out

## Scale Up

More CPU/RAM/faster storage on one node.

Pros:

- simple
- keeps transactions local

Cons:

- hardware ceiling
- larger failure domain

## Scale Out

More nodes.

Pros:

- higher aggregate capacity

Cons:

- distributed coordination
- partitioning
- more failure modes

A mature answer often chooses scale-up first when it is economically and operationally reasonable.

---

# Appendix BQ — Vertical Partitioning

Split rarely used or huge columns from frequently accessed rows.

Example:

```text
users
  id
  email
  name

user_profiles
  user_id
  biography
  preferences_blob
```

This can improve cache locality for hot paths.

But unnecessary vertical splitting adds joins and complexity.

---

# Appendix BR — Read Models and API Shape

Database design should consider API access patterns.

If API always returns:

```text
Order + latest shipment + payment summary
```

and generating it requires ten expensive joins across services, a dedicated read projection may be justified.

Do not force the write-normalized model to be the only read model.

---

# Appendix BS — Security: Row-Level and Tenant-Level Isolation

Shared-table multi-tenancy can use database-enforced row policies where supported.

Defense in depth:

```text
API authentication
    ↓
service authorization
    ↓
tenant-scoped query
    ↓
database-level row restrictions where appropriate
```

Never trust a tenant ID supplied by the client without binding it to authenticated identity/authorization.

---

# Appendix BT — Encryption Key Strategy

At higher compliance levels, you may need:

- envelope encryption
- per-tenant keys
- key rotation
- key revocation

Separating encryption keys from encrypted data reduces blast radius.

Deleting a key can be part of crypto-shredding strategies, but legal/compliance requirements must be validated carefully.

---

# Appendix BU — Auditability vs Mutable State

For sensitive changes, store enough history to answer:

```text
Who changed it?
What changed?
When?
From what value?
To what value?
Why/request ID?
```

Audit trails should be protected from unauthorized alteration.

Application logs alone may not meet audit requirements.

---

# Appendix BV — Database Feature Flags and Rollout Safety

Large data changes can be rolled out gradually.

Example:

```text
1% new read path
10%
50%
100%
```

Monitor:

- error differences
- latency
- DB load
- data mismatches

Feature flags help separate code deployment from behavior activation.

---

# Appendix BW — Capacity Headroom

Do not run a critical database continuously at 95–100% of its sustainable capacity.

Headroom is needed for:

- traffic spikes
- failover
- maintenance
- compaction
- backups
- schema migration

If one of three replicas fails, the remaining nodes must survive redistributed load.

Capacity planning should include degraded-mode capacity.

---

# Appendix BX — Failure Domains

Replicas should not all share the same failure domain.

Examples of failure domains:

- process
- VM
- physical host
- rack
- availability zone
- region
- cloud provider

Three replicas on one physical host are not high availability against host failure.

---

# Appendix BY — Split-Brain Prevention

Split brain occurs when multiple nodes believe they are primary/leader.

Mitigation concepts:

- quorum
- consensus
- fencing
- leases with strong backing store
- STONITH-style infrastructure fencing in some systems

The goal is to ensure stale leaders cannot continue making authoritative writes.

---

# Appendix BZ — Backup Retention Strategy

Example policy:

```text
hourly PITR logs: 7 days
daily backups: 30 days
monthly backups: 12 months
```

Real policy depends on:

- compliance
- RPO
- corruption detection window
- cost

Store backups in failure domains separate from primary infrastructure where appropriate.

---

# Appendix CA — Restore Granularity

Sometimes you need to restore:

- one row
- one tenant
- one table
- one database
- whole cluster

A database-per-tenant architecture makes tenant restore easier but creates fleet complexity.

A shared database makes fleet management easier but tenant-level restore harder.

This is a real multi-tenancy trade-off.

---

# Appendix CB — Data Deletion in Derived Systems

Deleting a user from the primary DB may not delete them from:

- cache
- search
- warehouse
- feature store
- backups
- event log

Design deletion propagation and retention explicitly.

Derived systems create data-lifecycle obligations.

---

# Appendix CC — Change Event Ordering

A CDC stream may preserve ordering only within a partition/key/transaction log, not necessarily globally.

Consumers should avoid assuming global event order unless guaranteed.

Prefer entity-level versions:

```text
user_id=123 version=42
```

so stale updates can be detected.

---

# Appendix CD — Poison Events and DLQs

A malformed or incompatible event can repeatedly fail.

Use:

- bounded retries
- dead-letter handling
- alerting
- replay tooling

Do not let one poison event permanently block an entire ordered partition without an operational plan.

---

# Appendix CE — Rebuilding Derived Stores

A derived search/cache/read model should have a rebuild strategy.

Possible sources:

- authoritative DB snapshot + CDC catch-up
- replayable event log
- batch export

Rebuild procedure:

```text
1. take snapshot position
2. load snapshot
3. apply changes after position
4. validate
5. switch traffic
```

This pattern is essential for safe large reindexing/migrations.

---

# Appendix CF — Schema Versioning for Events

Database schema and event schema evolve differently.

Events may live for years and be replayed by old/new consumers.

Prefer additive compatible evolution where possible.

Consider:

- default values
- optional fields
- versioned event types for semantic breaks
- schema registry/contract validation where useful

Never assume you can rewrite all historical events after changing a field.

---

# Appendix CG — Choosing Consistency Per Operation

One system can use multiple consistency strengths.

Example marketplace:

```text
Product description -> eventual okay
Search index         -> eventual okay
Inventory decrement  -> stronger guarantee required
Payment capture      -> idempotent + strong state transition
Analytics            -> delayed okay
```

This is more mature than labeling the entire application “strongly consistent” or “eventually consistent.”

---

# Appendix CH — Invariants First

Write the invariant before choosing technology.

Examples:

```text
One coupon can be redeemed at most once per user.
An order cannot be shipped before payment approval.
A ledger transaction must balance to zero.
A username must be globally unique.
Inventory must never become negative for strict stock items.
```

Then ask where/how the invariant is enforced.

This is one of the most important staff-level habits.

---

# Appendix CI — Final Staff-Level Database Review Questions

Before approving a major database architecture, ask:

1. What are the explicit business invariants?
2. Which store is authoritative for each entity?
3. What are the top five read patterns?
4. What are the top five write patterns?
5. What is current and 3-year expected scale?
6. What is peak load, not average load?
7. Which operations require strong consistency?
8. Which can tolerate stale data, and for how long?
9. What are transaction boundaries?
10. How are duplicate requests/events handled?
11. What happens when the primary dies during a write?
12. What happens during network partition?
13. Can the system operate with one AZ unavailable?
14. Can it operate with one region unavailable?
15. What is the shard/partition key and why?
16. What keys could become hot?
17. Which queries become cross-partition?
18. What is the migration path from current state?
19. Can schema changes be deployed without downtime?
20. How is backfill throttled and resumed?
21. How is derived data rebuilt?
22. How are backups verified?
23. What are actual measured RPO/RTO?
24. How is tenant isolation enforced?
25. How does deletion propagate?
26. What happens if cache disappears?
27. What happens if search disappears?
28. What happens if CDC is delayed for six hours?
29. What is the maximum safe connection count?
30. What overload controls protect the DB?
31. Which dashboards reveal saturation early?
32. Which alerts require immediate action?
33. What is the largest single tenant/key?
34. What does this cost today and at 10x?
35. Which technology-specific feature creates lock-in?
36. What is the exit strategy?
37. Which team owns operations and on-call?
38. What is the rollback or forward-fix strategy?
39. What failure test has actually been performed?
40. Which assumption, if wrong, invalidates the design?

If you can answer these clearly, quantitatively, and with failure-aware trade-offs, you are reasoning at senior/staff system-design depth.
