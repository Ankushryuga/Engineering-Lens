export type DesignCategory = 'backend' | 'database' | 'cloud' | 'genai'
export type DesignLevel = 'Fundamental' | 'Intermediate' | 'Senior' | 'Staff'
export type DesignNodeKind = 'client' | 'edge' | 'service' | 'cache' | 'database' | 'queue' | 'worker' | 'storage' | 'security' | 'observability' | 'ai'
export type DesignEdgeKind = 'sync' | 'async' | 'data'

export interface DesignNode {
  id: string
  label: string
  subtitle: string
  kind: DesignNodeKind
  x: number
  y: number
  details: string
}

export interface DesignEdge {
  id: string
  from: string
  to: string
  label: string
  kind: DesignEdgeKind
}

export interface DesignStep {
  title: string
  description: string
  nodeIds: string[]
  edgeIds: string[]
}

export interface DesignFailure {
  id: string
  label: string
  nodeIds: string[]
  impact: string
  recovery: string
}

export interface ScaleTier {
  multiplier: 1 | 10 | 100
  label: string
  guidance: string
  pressureNodeIds: string[]
}

export interface SystemDesignScenario {
  id: string
  title: string
  category: DesignCategory
  level: DesignLevel
  summary: string
  goal: string
  tags: string[]
  requirements: string[]
  scale: string[]
  metrics: string[]
  decisions: string[]
  tradeoffs: string[]
  nodes: DesignNode[]
  edges: DesignEdge[]
  steps: DesignStep[]
  failures: DesignFailure[]
  scaleTiers: ScaleTier[]
}

const baseScale: ScaleTier = {
  multiplier: 1,
  label: 'Baseline',
  guidance: 'Keep the architecture simple and measurable. Add distributed complexity only for a requirement.',
  pressureNodeIds: [],
}

export const SYSTEM_DESIGN_SCENARIOS: SystemDesignScenario[] = [
  {
    id: 'scalable-api',
    title: 'Scalable API Platform',
    category: 'backend',
    level: 'Fundamental',
    summary: 'A production request path through edge protection, stateless APIs, cache, database, async work, and telemetry.',
    goal: 'Follow one request end-to-end and see where latency, failures, retries, state, and observability enter the system.',
    tags: ['API', 'cache', 'queue', 'observability'],
    requirements: ['Low-latency reads', 'Durable writes', 'Horizontal application scaling', 'Graceful degradation', 'End-to-end traceability'],
    scale: ['Peak: 5k requests/s', 'Read/write: 80/20', 'p95 target: < 200 ms', 'Availability target: 99.9%'],
    metrics: ['RPS and error rate', 'p50/p95/p99 latency', 'cache hit ratio', 'DB pool saturation', 'queue lag'],
    decisions: ['Keep application replicas stateless.', 'Use cache-aside for hot reads.', 'Move slow non-critical side effects to a durable queue.', 'Set deadlines at every network boundary.'],
    tradeoffs: ['Caching improves latency but introduces staleness and invalidation work.', 'Async work shortens the request path but introduces eventual consistency.', 'Adding service replicas can amplify database connection pressure.'],
    nodes: [
      { id: 'client', label: 'Client', subtitle: 'Web / mobile', kind: 'client', x: 8, y: 50, details: 'Originates an authenticated request and retries only when the API contract says the operation is safe.' },
      { id: 'edge', label: 'Edge', subtitle: 'DNS · CDN · WAF', kind: 'edge', x: 24, y: 50, details: 'Terminates public traffic, filters abuse, and can serve cacheable responses near users.' },
      { id: 'api', label: 'API Service', subtitle: 'Stateless replicas', kind: 'service', x: 43, y: 38, details: 'Authenticates, authorizes, validates, executes business logic, and owns request deadlines.' },
      { id: 'cache', label: 'Cache', subtitle: 'Redis', kind: 'cache', x: 64, y: 20, details: 'Protects the database and serves hot data. Needs TTLs, memory limits, and stampede protection.' },
      { id: 'db', label: 'Database', subtitle: 'Primary + replicas', kind: 'database', x: 64, y: 50, details: 'Owns durable state. Query plans, indexes, transactions, and connection pools matter here.' },
      { id: 'queue', label: 'Queue', subtitle: 'Durable broker', kind: 'queue', x: 64, y: 78, details: 'Buffers asynchronous work and short bursts. Monitor oldest-message age and retry behavior.' },
      { id: 'worker', label: 'Worker', subtitle: 'Background jobs', kind: 'worker', x: 84, y: 78, details: 'Processes side effects idempotently and quarantines poison work instead of retrying forever.' },
      { id: 'obs', label: 'Telemetry', subtitle: 'Logs · metrics · traces', kind: 'observability', x: 84, y: 38, details: 'Correlates request traces with service, cache, database, and queue health.' },
    ],
    edges: [
      { id: 'e1', from: 'client', to: 'edge', label: 'HTTPS', kind: 'sync' },
      { id: 'e2', from: 'edge', to: 'api', label: 'route', kind: 'sync' },
      { id: 'e3', from: 'api', to: 'cache', label: 'read', kind: 'data' },
      { id: 'e4', from: 'api', to: 'db', label: 'query / tx', kind: 'data' },
      { id: 'e5', from: 'api', to: 'queue', label: 'publish', kind: 'async' },
      { id: 'e6', from: 'queue', to: 'worker', label: 'consume', kind: 'async' },
      { id: 'e7', from: 'api', to: 'obs', label: 'trace', kind: 'async' },
      { id: 'e8', from: 'db', to: 'api', label: 'result', kind: 'data' },
      { id: 'e9', from: 'api', to: 'client', label: 'response', kind: 'sync' },
    ],
    steps: [
      { title: 'Enter through the edge', description: 'DNS and edge controls route the request, terminate TLS, and apply protection before application code executes.', nodeIds: ['client', 'edge'], edgeIds: ['e1'] },
      { title: 'Execute application logic', description: 'The stateless API replica authenticates, authorizes, validates, and establishes a deadline.', nodeIds: ['api'], edgeIds: ['e2'] },
      { title: 'Check hot data', description: 'Cache-aside tries the cache first. A miss continues to the source of truth.', nodeIds: ['api', 'cache'], edgeIds: ['e3'] },
      { title: 'Read or commit state', description: 'The database handles the query or transaction. Indexes, isolation, and pool pressure are part of the architecture.', nodeIds: ['api', 'db'], edgeIds: ['e4', 'e8'] },
      { title: 'Move side effects off-path', description: 'Non-critical work is published durably so the user request does not wait for every downstream action.', nodeIds: ['queue', 'worker'], edgeIds: ['e5', 'e6'] },
      { title: 'Observe and return', description: 'Trace context records the critical path before the response returns to the client.', nodeIds: ['obs', 'api', 'client'], edgeIds: ['e7', 'e9'] },
    ],
    failures: [
      { id: 'db-down', label: 'Database unavailable', nodeIds: ['db'], impact: 'Writes fail and uncached reads cannot complete. Unbounded retries can create an overload storm.', recovery: 'Fail fast with bounded retries, circuit-break the dependency, preserve safe degraded paths, and restore or fail over the data tier.' },
      { id: 'cache-down', label: 'Cache unavailable', nodeIds: ['cache'], impact: 'Traffic falls through to the database and can overload it.', recovery: 'Use cache timeouts, protect the DB with concurrency limits, and warm/rebuild cache gradually.' },
      { id: 'queue-backlog', label: 'Queue backlog', nodeIds: ['queue', 'worker'], impact: 'Requests may succeed while asynchronous work becomes increasingly stale.', recovery: 'Scale consumers, cap retries, quarantine poison messages, and alert on oldest-message age.' },
    ],
    scaleTiers: [
      baseScale,
      { multiplier: 10, label: '10× traffic', guidance: 'Add API replicas, improve cache effectiveness, and tune DB pools/query plans before scaling the database blindly.', pressureNodeIds: ['api', 'db'] },
      { multiplier: 100, label: '100× traffic', guidance: 'Partition heavy state, isolate noisy tenants, and add admission control around stateful dependencies.', pressureNodeIds: ['db', 'queue'] },
    ],
  },
  {
    id: 'order-events',
    title: 'Event-Driven Order Processing',
    category: 'backend',
    level: 'Senior',
    summary: 'Transactional order state with an outbox, durable event log, idempotent consumers, retries, and DLQ.',
    goal: 'See how reliable business state and asynchronous events stay coordinated without pretending delivery is magically exactly-once.',
    tags: ['Kafka', 'outbox', 'idempotency', 'DLQ'],
    requirements: ['No lost order events', 'Duplicate-safe consumers', 'Auditability', 'Independent downstream scaling', 'Recoverable failures'],
    scale: ['10k orders/min peak', 'Multiple downstream consumers', 'At-least-once delivery', 'Seconds-level async SLO'],
    metrics: ['outbox lag', 'consumer lag', 'duplicate rate', 'DLQ depth', 'end-to-end event latency'],
    decisions: ['Commit order state and outbox row in one local transaction.', 'Publish from committed outbox state.', 'Use stable event IDs and idempotent consumers.', 'Treat DLQ as an operated recovery workflow.'],
    tradeoffs: ['Outbox adds relay/storage complexity but avoids DB+broker dual-write gaps.', 'At-least-once delivery requires duplicate handling.', 'Event-driven autonomy makes end-to-end debugging harder.'],
    nodes: [
      { id: 'client', label: 'Checkout', subtitle: 'Client request', kind: 'client', x: 7, y: 48, details: 'Submits an idempotency key so a retry cannot create a second logical order.' },
      { id: 'orders', label: 'Order API', subtitle: 'Command service', kind: 'service', x: 24, y: 48, details: 'Validates the command and starts one local database transaction.' },
      { id: 'db', label: 'Order DB', subtitle: 'Orders + outbox', kind: 'database', x: 44, y: 48, details: 'Atomically persists business state and event intent.' },
      { id: 'relay', label: 'Outbox Relay', subtitle: 'CDC / poller', kind: 'worker', x: 44, y: 75, details: 'Publishes committed outbox entries and can safely repeat a publish after ambiguous failure.' },
      { id: 'kafka', label: 'Event Log', subtitle: 'Partitioned broker', kind: 'queue', x: 64, y: 48, details: 'Durably retains facts and guarantees ordering within a partition.' },
      { id: 'payment', label: 'Payment', subtitle: 'Consumer', kind: 'service', x: 84, y: 24, details: 'Consumes events idempotently and persists processed event IDs.' },
      { id: 'inventory', label: 'Inventory', subtitle: 'Consumer', kind: 'service', x: 84, y: 50, details: 'Reserves stock in its own state and emits new facts.' },
      { id: 'notify', label: 'Notification', subtitle: 'Consumer', kind: 'service', x: 84, y: 76, details: 'Can lag without blocking checkout and must avoid duplicate messages.' },
    ],
    edges: [
      { id: 'e1', from: 'client', to: 'orders', label: 'POST /orders', kind: 'sync' },
      { id: 'e2', from: 'orders', to: 'db', label: 'atomic tx', kind: 'data' },
      { id: 'e3', from: 'db', to: 'relay', label: 'outbox', kind: 'data' },
      { id: 'e4', from: 'relay', to: 'kafka', label: 'publish', kind: 'async' },
      { id: 'e5', from: 'kafka', to: 'payment', label: 'OrderPlaced', kind: 'async' },
      { id: 'e6', from: 'kafka', to: 'inventory', label: 'OrderPlaced', kind: 'async' },
      { id: 'e7', from: 'kafka', to: 'notify', label: 'OrderPlaced', kind: 'async' },
    ],
    steps: [
      { title: 'Make the command retry-safe', description: 'The client supplies an idempotency key so network retries map to one logical order.', nodeIds: ['client', 'orders'], edgeIds: ['e1'] },
      { title: 'Commit state and event intent together', description: 'Order state and the outbox row share one database transaction.', nodeIds: ['orders', 'db'], edgeIds: ['e2'] },
      { title: 'Relay committed events', description: 'The relay publishes only committed outbox state. Duplicate publish is acceptable because consumers are idempotent.', nodeIds: ['db', 'relay', 'kafka'], edgeIds: ['e3', 'e4'] },
      { title: 'Fan out independently', description: 'Payment, inventory, and notifications consume at their own pace and scale independently.', nodeIds: ['kafka', 'payment', 'inventory', 'notify'], edgeIds: ['e5', 'e6', 'e7'] },
    ],
    failures: [
      { id: 'relay-crash', label: 'Relay crashes after publish', nodeIds: ['relay'], impact: 'The same event may be published again after restart.', recovery: 'Use stable event IDs and idempotent consumers; never depend on transport exactly-once for business correctness.' },
      { id: 'consumer-poison', label: 'Poison event', nodeIds: ['inventory'], impact: 'Infinite retries can block progress and burn capacity.', recovery: 'Bound retries, preserve error context, quarantine to DLQ, and define replay/remediation ownership.' },
      { id: 'broker-down', label: 'Broker unavailable', nodeIds: ['kafka'], impact: 'Checkout can still commit orders while outbox lag grows.', recovery: 'Alert on outbox age and replay safely from durable outbox state after broker recovery.' },
    ],
    scaleTiers: [
      baseScale,
      { multiplier: 10, label: '10× events', guidance: 'Partition by a stable business key, scale consumer groups, and verify hot-key distribution.', pressureNodeIds: ['kafka', 'inventory'] },
      { multiplier: 100, label: '100× events', guidance: 'Split high-volume domains, automate replay/DLQ workflows, and govern event schemas across teams.', pressureNodeIds: ['kafka', 'relay'] },
    ],
  },
  {
    id: 'cache-read-replicas',
    title: 'Cache + Read Replicas',
    category: 'database',
    level: 'Intermediate',
    summary: 'Cache-aside with a write primary and read replicas, including stale-read and stampede failure modes.',
    goal: 'Understand how read scaling changes consistency and how a cache/replica failure can shift load back to the primary.',
    tags: ['cache-aside', 'replication', 'staleness', 'pooling'],
    requirements: ['Fast hot reads', 'Strong writes', 'Read-your-write where required', 'Bounded DB load', 'Graceful cache failure'],
    scale: ['90% reads', 'Hot-key skew', 'Replica lag under write bursts', 'Large connection fan-out'],
    metrics: ['cache hit ratio', 'replica lag', 'primary CPU/IO', 'connections', 'stale-read rate'],
    decisions: ['Primary owns writes.', 'Replicas serve stale-tolerant reads.', 'Cache stores hottest materialized data.', 'Consistency-sensitive post-write reads use primary/version-aware logic.'],
    tradeoffs: ['Replicas increase read capacity but add lag and failover complexity.', 'Caching improves latency but makes invalidation a correctness concern.', 'Large fleets can overwhelm a database through aggregate pool size.'],
    nodes: [
      { id: 'app', label: 'Application', subtitle: 'Read / write path', kind: 'service', x: 12, y: 50, details: 'Classifies operations by consistency needs rather than routing every read identically.' },
      { id: 'cache', label: 'Distributed Cache', subtitle: 'Hot objects', kind: 'cache', x: 36, y: 20, details: 'Cache-aside with TTL, jitter, size bounds, and stampede protection.' },
      { id: 'primary', label: 'Primary DB', subtitle: 'Writes + strong reads', kind: 'database', x: 43, y: 60, details: 'Source of truth protected by bounded pools and query deadlines.' },
      { id: 'replica1', label: 'Read Replica A', subtitle: 'Async replication', kind: 'database', x: 72, y: 40, details: 'Serves stale-tolerant reads while reporting replication lag.' },
      { id: 'replica2', label: 'Read Replica B', subtitle: 'Async replication', kind: 'database', x: 72, y: 72, details: 'Adds read capacity but does not scale write throughput of the primary.' },
    ],
    edges: [
      { id: 'e1', from: 'app', to: 'cache', label: 'cache lookup', kind: 'data' },
      { id: 'e2', from: 'app', to: 'primary', label: 'write / strong read', kind: 'data' },
      { id: 'e3', from: 'primary', to: 'replica1', label: 'replicate', kind: 'async' },
      { id: 'e4', from: 'primary', to: 'replica2', label: 'replicate', kind: 'async' },
      { id: 'e5', from: 'app', to: 'replica1', label: 'read', kind: 'data' },
      { id: 'e6', from: 'app', to: 'replica2', label: 'read', kind: 'data' },
    ],
    steps: [
      { title: 'Try the cache', description: 'Hot reads stop here when the product can tolerate the cached freshness.', nodeIds: ['app', 'cache'], edgeIds: ['e1'] },
      { title: 'Write to one authority', description: 'Writes and strong reads go to the primary so transactional invariants have one owner.', nodeIds: ['app', 'primary'], edgeIds: ['e2'] },
      { title: 'Replicate asynchronously', description: 'Changes flow to replicas; lag is expected and must be measured.', nodeIds: ['primary', 'replica1', 'replica2'], edgeIds: ['e3', 'e4'] },
      { title: 'Route stale-tolerant reads', description: 'Applications use replicas only where product semantics permit stale data.', nodeIds: ['app', 'replica1', 'replica2'], edgeIds: ['e5', 'e6'] },
    ],
    failures: [
      { id: 'cache-stampede', label: 'Mass cache miss', nodeIds: ['cache'], impact: 'Many requests simultaneously fall through to the database.', recovery: 'Use TTL jitter, request coalescing, stale-while-revalidate where safe, and DB concurrency protection.' },
      { id: 'replica-lag', label: 'Replica lag spike', nodeIds: ['replica1', 'replica2'], impact: 'Users may not see recent writes.', recovery: 'Route consistency-sensitive reads to primary and disable replica routing when lag exceeds the product bound.' },
    ],
    scaleTiers: [
      baseScale,
      { multiplier: 10, label: '10× reads', guidance: 'Improve cache hit rate, add replicas for stale-tolerant reads, and measure total connection pressure.', pressureNodeIds: ['primary', 'replica1'] },
      { multiplier: 100, label: '100× workload', guidance: 'If write/state volume is now the bottleneck, partition the dataset; replicas cannot scale one write primary forever.', pressureNodeIds: ['primary'] },
    ],
  },
  {
    id: 'sharded-database',
    title: 'Sharded Database',
    category: 'database',
    level: 'Senior',
    summary: 'A routing layer distributes data by shard key while avoiding scatter-gather on the critical path.',
    goal: 'Practice shard-key selection, hot partitions, secondary lookup, rebalancing, and cross-shard costs.',
    tags: ['sharding', 'partitioning', 'hot keys', 'global index'],
    requirements: ['Scale writes horizontally', 'Keep common transactions local', 'Rebalance online', 'Support critical secondary lookups', 'Limit blast radius'],
    scale: ['100M+ entities', 'High write throughput', 'Skewed tenant sizes', 'Online shard expansion'],
    metrics: ['per-shard QPS/storage', 'hot partition ratio', 'cross-shard requests', 'rebalance lag', 'lookup-index lag'],
    decisions: ['Choose shard key from access patterns.', 'Route deterministically through a shard map.', 'Colocate related transactional records.', 'Treat global secondary lookup as distributed state with an explicit consistency contract.'],
    tradeoffs: ['Sharding scales writes but turns joins, uniqueness, indexes, and migrations into distributed problems.', 'Hashing balances load but reduces range locality.', 'Tenant sharding is simple until a few tenants become much larger than the rest.'],
    nodes: [
      { id: 'app', label: 'Application', subtitle: 'Partition-aware', kind: 'client', x: 6, y: 48, details: 'Carries a partition key on the normal path so routing hits one shard.' },
      { id: 'router', label: 'Shard Router', subtitle: 'Shard map', kind: 'service', x: 27, y: 48, details: 'Maps key ranges or hash tokens to current shard ownership.' },
      { id: 'index', label: 'Lookup Index', subtitle: 'email → shard', kind: 'database', x: 27, y: 78, details: 'Optional global lookup for a secondary access pattern that does not contain the partition key.' },
      { id: 's1', label: 'Shard 1', subtitle: 'Partition A', kind: 'database', x: 58, y: 20, details: 'Owns one subset of keys and local transactions/indexes.' },
      { id: 's2', label: 'Shard 2', subtitle: 'Partition B', kind: 'database', x: 58, y: 48, details: 'Independent capacity/failure domain; a bad key can make this shard hot.' },
      { id: 's3', label: 'Shard 3', subtitle: 'Partition C', kind: 'database', x: 58, y: 76, details: 'Receives moved ranges during rebalancing.' },
      { id: 'rebalance', label: 'Rebalancer', subtitle: 'Move ownership safely', kind: 'worker', x: 84, y: 48, details: 'Copies, catches up, switches ownership, verifies, and cleans old ranges with rollback checkpoints.' },
    ],
    edges: [
      { id: 'e1', from: 'app', to: 'router', label: 'keyed request', kind: 'sync' },
      { id: 'e2', from: 'router', to: 's1', label: 'route', kind: 'data' },
      { id: 'e3', from: 'router', to: 's2', label: 'route', kind: 'data' },
      { id: 'e4', from: 'router', to: 's3', label: 'route', kind: 'data' },
      { id: 'e5', from: 'app', to: 'index', label: 'secondary lookup', kind: 'data' },
      { id: 'e6', from: 'index', to: 'router', label: 'resolved shard', kind: 'data' },
      { id: 'e7', from: 'rebalance', to: 's2', label: 'copy / catch-up', kind: 'async' },
      { id: 'e8', from: 'rebalance', to: 's3', label: 'new owner', kind: 'async' },
    ],
    steps: [
      { title: 'Route by primary key', description: 'The normal request carries a key that maps to exactly one shard.', nodeIds: ['app', 'router'], edgeIds: ['e1'] },
      { title: 'Keep work local', description: 'The router chooses one shard, avoiding scatter-gather in the OLTP critical path.', nodeIds: ['router', 's1', 's2', 's3'], edgeIds: ['e2', 'e3', 'e4'] },
      { title: 'Handle secondary access explicitly', description: 'A global lookup can resolve a secondary key, but it has its own consistency and failure modes.', nodeIds: ['app', 'index', 'router'], edgeIds: ['e5', 'e6'] },
      { title: 'Rebalance without downtime', description: 'Online movement requires copy, catch-up, ownership switch, verification, and rollback.', nodeIds: ['rebalance', 's2', 's3'], edgeIds: ['e7', 'e8'] },
    ],
    failures: [
      { id: 'hot-shard', label: 'Hot shard', nodeIds: ['s2'], impact: 'One partition saturates while the rest remain underused.', recovery: 'Split or salt the hot key space, isolate the oversized tenant, or change the partition model.' },
      { id: 'index-stale', label: 'Lookup index stale', nodeIds: ['index'], impact: 'Secondary lookups can route to the wrong owner after movement or update.', recovery: 'Use versioned shard maps/redirects, define index consistency, and rebuild from canonical data.' },
    ],
    scaleTiers: [
      baseScale,
      { multiplier: 10, label: '10× data', guidance: 'Measure shard skew before adding machines. More shards do not repair a poor partition key.', pressureNodeIds: ['s2'] },
      { multiplier: 100, label: '100× data', guidance: 'Automate rebalancing, isolate giant tenants, and move cross-shard analytics off the OLTP path.', pressureNodeIds: ['router', 'rebalance'] },
    ],
  },
  {
    id: 'ha-cloud',
    title: 'Highly Available Cloud Web App',
    category: 'cloud',
    level: 'Intermediate',
    summary: 'A secure multi-AZ deployment with edge protection, private compute, managed data, backup, and observability.',
    goal: 'See how fault domains, private networking, redundancy, backup, and observability fit together in a regional cloud design.',
    tags: ['multi-AZ', 'VPC', 'load balancing', 'backup'],
    requirements: ['Survive one AZ failure', 'Private application/data tiers', 'Automated scaling', 'Encrypted secrets/data', 'Tested restore path'],
    scale: ['Regional workload', 'Spiky web traffic', 'RPO: 15 min', 'RTO: 60 min'],
    metrics: ['AZ health', 'LB target health', 'autoscaling saturation', 'DB failover time', 'restore-test success'],
    decisions: ['Spread stateless compute across independent AZs.', 'Keep app and data tiers private.', 'Use managed DB HA when it satisfies the requirement.', 'Test restore separately from normal HA.'],
    tradeoffs: ['Multi-AZ protects against many zonal failures but not every regional failure.', 'Managed services reduce operations but not query/schema/security responsibility.', 'NAT, egress, quotas, and cross-AZ traffic can become hidden dependencies.'],
    nodes: [
      { id: 'users', label: 'Users', subtitle: 'Internet', kind: 'client', x: 5, y: 48, details: 'Global clients enter through public edge services while app/data stay private.' },
      { id: 'edge', label: 'DNS · CDN · WAF', subtitle: 'Public edge', kind: 'edge', x: 21, y: 48, details: 'Routes traffic, applies WAF/DDoS policy, and can cache static/cacheable content.' },
      { id: 'lb', label: 'Load Balancer', subtitle: 'Regional', kind: 'edge', x: 37, y: 48, details: 'Sends requests only to healthy targets across zones.' },
      { id: 'aza', label: 'App · AZ A', subtitle: 'Private subnet', kind: 'service', x: 57, y: 27, details: 'Stateless capacity in one failure domain.' },
      { id: 'azb', label: 'App · AZ B', subtitle: 'Private subnet', kind: 'service', x: 57, y: 69, details: 'Independent zonal capacity with enough headroom for failover.' },
      { id: 'db', label: 'Managed DB', subtitle: 'Multi-AZ', kind: 'database', x: 79, y: 48, details: 'Regional HA database that still needs capacity planning and tested recovery.' },
      { id: 'backup', label: 'Backup Vault', subtitle: 'Protected copy', kind: 'storage', x: 92, y: 73, details: 'Recovery copy with retention and restore testing, protected from normal app credentials.' },
      { id: 'obs', label: 'Observability', subtitle: 'Logs · metrics · alarms', kind: 'observability', x: 92, y: 24, details: 'Tracks SLOs, quotas, security signals, failovers, and recovery operations.' },
    ],
    edges: [
      { id: 'e1', from: 'users', to: 'edge', label: 'HTTPS', kind: 'sync' },
      { id: 'e2', from: 'edge', to: 'lb', label: 'origin', kind: 'sync' },
      { id: 'e3', from: 'lb', to: 'aza', label: 'healthy route', kind: 'sync' },
      { id: 'e4', from: 'lb', to: 'azb', label: 'healthy route', kind: 'sync' },
      { id: 'e5', from: 'aza', to: 'db', label: 'private data', kind: 'data' },
      { id: 'e6', from: 'azb', to: 'db', label: 'private data', kind: 'data' },
      { id: 'e7', from: 'db', to: 'backup', label: 'backup', kind: 'async' },
      { id: 'e8', from: 'aza', to: 'obs', label: 'telemetry', kind: 'async' },
      { id: 'e9', from: 'azb', to: 'obs', label: 'telemetry', kind: 'async' },
    ],
    steps: [
      { title: 'Enter through protected edge', description: 'Public traffic is handled by global/edge controls before the regional load balancer.', nodeIds: ['users', 'edge', 'lb'], edgeIds: ['e1', 'e2'] },
      { title: 'Distribute across zones', description: 'Healthy stateless capacity in more than one Availability Zone contains a zonal failure.', nodeIds: ['lb', 'aza', 'azb'], edgeIds: ['e3', 'e4'] },
      { title: 'Keep data private and redundant', description: 'Applications reach the managed database over private networking.', nodeIds: ['aza', 'azb', 'db'], edgeIds: ['e5', 'e6'] },
      { title: 'Operate for recovery', description: 'Backups and telemetry close the gap between “redundant” and “actually recoverable.”', nodeIds: ['db', 'backup', 'obs'], edgeIds: ['e7', 'e8', 'e9'] },
    ],
    failures: [
      { id: 'az-a', label: 'AZ A failure', nodeIds: ['aza'], impact: 'Capacity drops but healthy traffic can continue in AZ B when enough headroom exists.', recovery: 'The load balancer removes failed targets and autoscaling replaces capacity in healthy zones.' },
      { id: 'db-failover', label: 'Database failover', nodeIds: ['db'], impact: 'Connections break and clients can produce a retry spike during promotion.', recovery: 'Use driver-aware reconnect logic, request deadlines, bounded retries, and test failover under load.' },
    ],
    scaleTiers: [
      baseScale,
      { multiplier: 10, label: '10× regional traffic', guidance: 'Scale stateless capacity and caching first; watch quotas, NAT/egress, and database connection limits.', pressureNodeIds: ['aza', 'azb', 'db'] },
      { multiplier: 100, label: '100× + global users', guidance: 'Choose multi-region only for explicit latency, availability, or residency requirements.', pressureNodeIds: ['edge', 'db'] },
    ],
  },
  {
    id: 'multi-region-saas',
    title: 'Multi-Region SaaS',
    category: 'cloud',
    level: 'Staff',
    summary: 'Global traffic management with regional cells and home-region data ownership to reduce conflict complexity.',
    goal: 'Practice regional isolation, failover, data ownership, blast radius, residency, and control-plane trade-offs.',
    tags: ['multi-region', 'cells', 'failover', 'data residency'],
    requirements: ['Regional outage tolerance', 'Low user latency', 'Tenant isolation', 'Residency support', 'Controlled failover'],
    scale: ['Global tenants', 'Multiple regions', 'Regional cells', 'RPO/RTO by data class'],
    metrics: ['regional error rate', 'traffic-shift time', 'replication lag', 'failover success', 'cross-region dependency rate'],
    decisions: ['Global routing selects a regional cell.', 'Use tenant/user home-region writes where possible.', 'Keep cells operationally independent.', 'Define failover ownership before incidents.'],
    tradeoffs: ['Active-active writes lower local latency but create conflict/ordering/uniqueness complexity.', 'Home-region ownership reduces conflicts but can add write latency during travel/failover.', 'Cross-region dependencies can silently defeat regional isolation.'],
    nodes: [
      { id: 'users', label: 'Global Users', subtitle: 'Multiple geographies', kind: 'client', x: 5, y: 48, details: 'Requests carry tenant/user identity used by residency and home-region routing.' },
      { id: 'dns', label: 'Global Traffic', subtitle: 'DNS / anycast', kind: 'edge', x: 21, y: 48, details: 'Chooses a healthy policy-compliant regional cell.' },
      { id: 'r1', label: 'Region A Cell', subtitle: 'App + cache', kind: 'service', x: 47, y: 24, details: 'Self-contained regional serving cell with local dependencies.' },
      { id: 'r2', label: 'Region B Cell', subtitle: 'App + cache', kind: 'service', x: 47, y: 73, details: 'Independent deploy/capacity/failure boundary.' },
      { id: 'd1', label: 'Region A Data', subtitle: 'Home writes', kind: 'database', x: 74, y: 24, details: 'Primary/home data for tenants assigned to Region A.' },
      { id: 'd2', label: 'Region B Data', subtitle: 'Home writes', kind: 'database', x: 74, y: 73, details: 'Primary/home data for tenants assigned to Region B.' },
      { id: 'rep', label: 'Replication', subtitle: 'Async · policy-aware', kind: 'queue', x: 74, y: 48, details: 'Replicates allowed data while exposing lag and residency constraints.' },
      { id: 'control', label: 'Control Plane', subtitle: 'Config · routing · policy', kind: 'security', x: 92, y: 48, details: 'Central coordination that must not become a runtime single point for all regional data planes.' },
    ],
    edges: [
      { id: 'e1', from: 'users', to: 'dns', label: 'request', kind: 'sync' },
      { id: 'e2', from: 'dns', to: 'r1', label: 'route A', kind: 'sync' },
      { id: 'e3', from: 'dns', to: 'r2', label: 'route B', kind: 'sync' },
      { id: 'e4', from: 'r1', to: 'd1', label: 'local data', kind: 'data' },
      { id: 'e5', from: 'r2', to: 'd2', label: 'local data', kind: 'data' },
      { id: 'e6', from: 'd1', to: 'rep', label: 'replicate', kind: 'async' },
      { id: 'e7', from: 'rep', to: 'd2', label: 'allowed copy', kind: 'async' },
      { id: 'e8', from: 'control', to: 'dns', label: 'policy', kind: 'async' },
    ],
    steps: [
      { title: 'Route globally, execute regionally', description: 'Global traffic policy chooses a healthy, compliant regional cell.', nodeIds: ['users', 'dns', 'r1', 'r2'], edgeIds: ['e1', 'e2', 'e3'] },
      { title: 'Keep normal traffic local', description: 'Regional applications use regional data ownership to minimize latency and coupling.', nodeIds: ['r1', 'd1', 'r2', 'd2'], edgeIds: ['e4', 'e5'] },
      { title: 'Replicate with a contract', description: 'Cross-region replication must define lag, residency, conflict, and failover semantics.', nodeIds: ['d1', 'rep', 'd2'], edgeIds: ['e6', 'e7'] },
      { title: 'Bound control-plane blast radius', description: 'Regional data planes should continue with last-known-good policy when central control is degraded.', nodeIds: ['control', 'dns'], edgeIds: ['e8'] },
    ],
    failures: [
      { id: 'region-a', label: 'Region A outage', nodeIds: ['r1', 'd1'], impact: 'Tenants homed in Region A lose their normal serving/write region.', recovery: 'Shift only according to tested failover rules, establish temporary ownership, and reconcile before failback.' },
      { id: 'partition', label: 'Inter-region partition', nodeIds: ['rep'], impact: 'Both regions may stay healthy while replicated state diverges.', recovery: 'Prefer single-home writes when possible; otherwise use conflict/quorum semantics intentionally and expose lag.' },
    ],
    scaleTiers: [
      baseScale,
      { multiplier: 10, label: '10× global load', guidance: 'Add regional cells and tenant-aware capacity instead of stretching one giant global cluster.', pressureNodeIds: ['dns', 'r1', 'r2'] },
      { multiplier: 100, label: '100× organization scale', guidance: 'Standardize cell templates, routing, resilience tests, residency, and ownership across teams.', pressureNodeIds: ['control', 'rep'] },
    ],
  },
  {
    id: 'enterprise-rag',
    title: 'Enterprise RAG Knowledge Base',
    category: 'genai',
    level: 'Senior',
    summary: 'Independent ingestion/query paths with permission-aware retrieval, reranking, grounded generation, and citation validation.',
    goal: 'Design RAG as a complete data + retrieval + model system where permissions, freshness, quality, citations, and cost are measurable.',
    tags: ['RAG', 'vector search', 'reranking', 'citations'],
    requirements: ['Private enterprise knowledge', 'Tenant/ACL isolation', 'Fresh searchable content', 'Grounded citations', 'Measurable retrieval quality'],
    scale: ['Millions of chunks', 'Frequent incremental updates', 'Hybrid lexical + vector retrieval', 'Interactive query latency'],
    metrics: ['recall@k / nDCG', 'answer faithfulness', 'citation accuracy', 'index freshness', 'token and latency cost'],
    decisions: ['Design ingestion and query paths independently.', 'Preserve ACL/version/source metadata through indexing.', 'Use hybrid retrieval + reranking when exact terms matter.', 'Evaluate retrieval separately from answer generation.'],
    tradeoffs: ['Reranking improves relevance but adds latency/cost.', 'Small chunks improve precision but can lose context.', 'Shared indexes are cheaper but require strict tenant filters.', 'More context costs tokens and can add noise.'],
    nodes: [
      { id: 'docs', label: 'Enterprise Sources', subtitle: 'Docs · wiki · tickets', kind: 'storage', x: 5, y: 22, details: 'Canonical content with permissions, versions, and deletion lifecycle.' },
      { id: 'ingest', label: 'Ingestion', subtitle: 'Parse · clean · chunk', kind: 'worker', x: 25, y: 22, details: 'Incremental idempotent pipeline preserving hierarchy, metadata, and lineage.' },
      { id: 'embed', label: 'Embedding Workers', subtitle: 'Batch · dedupe', kind: 'ai', x: 45, y: 22, details: 'Generate versioned embeddings with batching, retry, rate limits, and model lineage.' },
      { id: 'index', label: 'Search Index', subtitle: 'Vector + lexical', kind: 'database', x: 67, y: 22, details: 'Stores vectors, terms, source metadata, ACL filters, and source references.' },
      { id: 'user', label: 'User Question', subtitle: 'Authenticated', kind: 'client', x: 5, y: 72, details: 'Identity and tenant context must exist before retrieval begins.' },
      { id: 'query', label: 'Query Service', subtitle: 'Rewrite · authorize', kind: 'service', x: 25, y: 72, details: 'Builds retrieval queries and deterministic authorization filters.' },
      { id: 'rerank', label: 'Retrieve + Rerank', subtitle: 'Hybrid top-k', kind: 'ai', x: 47, y: 72, details: 'Combines lexical/vector candidates and reranks a bounded candidate set.' },
      { id: 'llm', label: 'Context + LLM', subtitle: 'Grounded generation', kind: 'ai', x: 69, y: 72, details: 'Builds bounded context with source labels before calling the approved model.' },
      { id: 'validate', label: 'Citation Validator', subtitle: 'Grounding check', kind: 'security', x: 88, y: 72, details: 'Maps output claims back to retrieved sources and can reject unsupported responses.' },
    ],
    edges: [
      { id: 'e1', from: 'docs', to: 'ingest', label: 'sync changes', kind: 'async' },
      { id: 'e2', from: 'ingest', to: 'embed', label: 'chunks', kind: 'async' },
      { id: 'e3', from: 'embed', to: 'index', label: 'vector + metadata', kind: 'data' },
      { id: 'e4', from: 'user', to: 'query', label: 'question + identity', kind: 'sync' },
      { id: 'e5', from: 'query', to: 'index', label: 'filtered search', kind: 'data' },
      { id: 'e6', from: 'index', to: 'rerank', label: 'candidates', kind: 'data' },
      { id: 'e7', from: 'rerank', to: 'llm', label: 'top context', kind: 'data' },
      { id: 'e8', from: 'llm', to: 'validate', label: 'answer + sources', kind: 'sync' },
      { id: 'e9', from: 'validate', to: 'user', label: 'grounded response', kind: 'sync' },
    ],
    steps: [
      { title: 'Ingest with lineage and permissions', description: 'Parse, chunk, and preserve source/version/tenant/ACL metadata instead of embedding opaque text.', nodeIds: ['docs', 'ingest'], edgeIds: ['e1'] },
      { title: 'Build a searchable index', description: 'Embedding workers write vectors plus metadata into hybrid search.', nodeIds: ['ingest', 'embed', 'index'], edgeIds: ['e2', 'e3'] },
      { title: 'Authorize before retrieval', description: 'The query service builds filters from authenticated identity; unauthorized content must never reach model context.', nodeIds: ['user', 'query', 'index'], edgeIds: ['e4', 'e5'] },
      { title: 'Retrieve, rerank, bound context', description: 'Hybrid retrieval finds candidates, reranking improves relevance, and context construction enforces a token budget.', nodeIds: ['index', 'rerank', 'llm'], edgeIds: ['e6', 'e7'] },
      { title: 'Validate grounding', description: 'The response is checked against retrieved source references before citations return to the user.', nodeIds: ['llm', 'validate', 'user'], edgeIds: ['e8', 'e9'] },
    ],
    failures: [
      { id: 'vector-down', label: 'Search index outage', nodeIds: ['index'], impact: 'Fresh grounded retrieval is unavailable; blindly calling the model risks unsupported answers.', recovery: 'Fail closed for knowledge-critical queries or use an explicitly approved degraded path; rebuild from canonical source lineage.' },
      { id: 'stale-index', label: 'Stale index', nodeIds: ['index'], impact: 'Answers can cite outdated content after source changes.', recovery: 'Track source/index versions, enforce freshness SLOs, and run incremental reindexing.' },
      { id: 'acl-bug', label: 'ACL filter failure', nodeIds: ['query'], impact: 'Unauthorized or cross-tenant content may leak into model context.', recovery: 'Keep authorization deterministic, deny by default, test retrieval filters independently, and audit retrieval decisions.' },
    ],
    scaleTiers: [
      baseScale,
      { multiplier: 10, label: '10× corpus', guidance: 'Batch embeddings, tune ANN/hybrid retrieval, and scale ingestion independently from query serving.', pressureNodeIds: ['embed', 'index'] },
      { multiplier: 100, label: '100× tenants + corpus', guidance: 'Partition indexes where needed, enforce quotas, automate deletion lineage, and operate evaluation/cost as platform capabilities.', pressureNodeIds: ['index', 'query', 'llm'] },
    ],
  },
  {
    id: 'tool-agent',
    title: 'Tool-Using AI Agent',
    category: 'genai',
    level: 'Senior',
    summary: 'A bounded agent loop where the model proposes actions but deterministic policy controls authorization and side effects.',
    goal: 'Understand planning, tool selection, policy, scoped execution, human approval, idempotency, state, and termination budgets.',
    tags: ['agents', 'tools', 'policy', 'human-in-the-loop'],
    requirements: ['Least-privilege tools', 'Auditable actions', 'Hard step/time/cost budgets', 'Idempotent side effects', 'Approval for high-risk actions'],
    scale: ['Multi-step tasks', 'External APIs', 'Variable model latency', 'Per-tenant budgets'],
    metrics: ['task success', 'tool error rate', 'steps/task', 'cost/task', 'policy denials', 'loop termination rate'],
    decisions: ['The LLM is never the authorization boundary.', 'Tool schemas and allowlists are deterministic.', 'Persist state/checkpoints for long tasks.', 'Gate irreversible or sensitive side effects.'],
    tradeoffs: ['More autonomy increases capability and risk.', 'Human approval adds latency but limits irreversible mistakes.', 'Longer loops may improve hard tasks while increasing cost and runaway-loop risk.'],
    nodes: [
      { id: 'user', label: 'User Goal', subtitle: 'Intent + identity', kind: 'client', x: 5, y: 50, details: 'Provides the task and tenant/user identity context.' },
      { id: 'orchestrator', label: 'Orchestrator', subtitle: 'State · budget · loop', kind: 'service', x: 24, y: 50, details: 'Owns loop control, checkpointing, max steps, deadline, cost budget, and termination.' },
      { id: 'model', label: 'Model', subtitle: 'Plan · choose action', kind: 'ai', x: 44, y: 28, details: 'Interprets state and proposes the next action; it is probabilistic and not an authorization system.' },
      { id: 'policy', label: 'Policy Engine', subtitle: 'Auth · schema · risk', kind: 'security', x: 44, y: 72, details: 'Checks tool allowlist, arguments, tenant permissions, rate limits, and side-effect policy.' },
      { id: 'tools', label: 'Tool Gateway', subtitle: 'Timeout · idempotency', kind: 'service', x: 67, y: 50, details: 'Executes approved calls with scoped credentials, deadlines, and idempotency keys.' },
      { id: 'external', label: 'Business Systems', subtitle: 'Orders · CRM · search', kind: 'database', x: 88, y: 28, details: 'Authoritative systems with their own failure and consistency semantics.' },
      { id: 'human', label: 'Human Approval', subtitle: 'High-risk actions', kind: 'client', x: 88, y: 72, details: 'Explicit approval gate for irreversible or sensitive operations.' },
    ],
    edges: [
      { id: 'e1', from: 'user', to: 'orchestrator', label: 'goal', kind: 'sync' },
      { id: 'e2', from: 'orchestrator', to: 'model', label: 'state', kind: 'sync' },
      { id: 'e3', from: 'model', to: 'policy', label: 'tool proposal', kind: 'sync' },
      { id: 'e4', from: 'policy', to: 'tools', label: 'approved call', kind: 'sync' },
      { id: 'e5', from: 'tools', to: 'external', label: 'scoped request', kind: 'sync' },
      { id: 'e6', from: 'external', to: 'tools', label: 'result', kind: 'sync' },
      { id: 'e7', from: 'tools', to: 'orchestrator', label: 'observation', kind: 'sync' },
      { id: 'e8', from: 'policy', to: 'human', label: 'approval request', kind: 'sync' },
    ],
    steps: [
      { title: 'Start a bounded task', description: 'The orchestrator stores state and establishes hard step, time, and cost limits.', nodeIds: ['user', 'orchestrator'], edgeIds: ['e1'] },
      { title: 'Let the model propose', description: 'The model plans and suggests a structured tool call from current state.', nodeIds: ['orchestrator', 'model'], edgeIds: ['e2'] },
      { title: 'Enforce deterministic policy', description: 'Authorization, schema validation, allowlists, rate limits, and risk checks happen outside the model.', nodeIds: ['model', 'policy'], edgeIds: ['e3'] },
      { title: 'Execute with scoped credentials', description: 'The tool gateway applies timeout and idempotency before touching business systems.', nodeIds: ['policy', 'tools', 'external'], edgeIds: ['e4', 'e5', 'e6'] },
      { title: 'Observe, approve, repeat, or finish', description: 'Results update agent state; high-risk actions can branch through a human approval gate.', nodeIds: ['tools', 'orchestrator', 'human'], edgeIds: ['e7', 'e8'] },
    ],
    failures: [
      { id: 'loop', label: 'Agent loop runaway', nodeIds: ['orchestrator', 'model'], impact: 'The task burns cost/time without converging and may repeatedly call tools.', recovery: 'Hard max steps/deadline/cost budgets, repeated-action detection, and explicit termination policy.' },
      { id: 'duplicate-tool', label: 'Duplicate tool call', nodeIds: ['tools'], impact: 'A retry after an ambiguous timeout can repeat a side effect.', recovery: 'Use stable idempotency keys, tool-side dedupe, operation status checks, and no blind retry for unsafe actions.' },
      { id: 'prompt-injection', label: 'Prompt injection via tool data', nodeIds: ['model', 'policy'], impact: 'Untrusted content may try to manipulate tool usage or expose data.', recovery: 'Treat external content as untrusted, isolate permissions, keep secrets out of prompts, enforce tool policy deterministically, and gate risky actions.' },
    ],
    scaleTiers: [
      baseScale,
      { multiplier: 10, label: '10× agent tasks', guidance: 'Enforce per-tenant concurrency/cost budgets, cache safe reads, and isolate slow external tools.', pressureNodeIds: ['model', 'tools'] },
      { multiplier: 100, label: '100× agent platform', guidance: 'Centralize tool registry, policy, and evaluation standards while keeping product-specific prompts/tools decentralized.', pressureNodeIds: ['policy', 'tools', 'orchestrator'] },
    ],
  },
  {
    id: 'notification-platform',
    title: 'Global Notification Platform',
    category: 'backend',
    level: 'Staff',
    summary: 'Multi-channel notifications with preferences, tenant quotas, durable fan-out, provider isolation, retries, and delivery audit.',
    goal: 'Reason about burst absorption, channel isolation, delivery semantics, provider outages, rate limits, and multi-tenant operations.',
    tags: ['fan-out', 'rate limiting', 'multi-tenant', 'retries'],
    requirements: ['Email/SMS/push channels', 'Per-user preferences', 'Tenant quotas', 'Provider failover policy', 'Delivery audit'],
    scale: ['Millions of notifications/hour', 'Bursty campaigns', 'Per-provider quotas', 'Global recipients'],
    metrics: ['accepted/sent/delivered', 'provider latency/error rate', 'oldest queue age', 'tenant throttles', 'retry/DLQ rate'],
    decisions: ['Accept into durable work quickly.', 'Split workers by channel/provider behavior.', 'Enforce tenant and provider rate limits.', 'Persist delivery attempts and terminal state.'],
    tradeoffs: ['Provider failover improves availability but can change cost or delivery semantics.', 'Aggressive retries can amplify an external outage.', 'Global ordering is expensive and usually unnecessary.'],
    nodes: [
      { id: 'producer', label: 'Product Services', subtitle: 'Notification intents', kind: 'client', x: 6, y: 50, details: 'Submit business intent, recipient, template, and idempotency key.' },
      { id: 'gateway', label: 'Notification API', subtitle: 'Auth · quota · dedupe', kind: 'service', x: 24, y: 50, details: 'Validates tenant, idempotency, template, quota, and channel policy.' },
      { id: 'prefs', label: 'Preference Store', subtitle: 'Opt-in · locale · quiet hours', kind: 'database', x: 44, y: 20, details: 'Stores user/channel preferences that must be applied before delivery.' },
      { id: 'queue', label: 'Delivery Queue', subtitle: 'Priority work lanes', kind: 'queue', x: 44, y: 55, details: 'Absorbs spikes and separates request acceptance from provider latency.' },
      { id: 'state', label: 'Delivery Store', subtitle: 'Attempts · status · audit', kind: 'database', x: 44, y: 84, details: 'Tracks provider IDs, attempts, dedupe, status, and terminal failures.' },
      { id: 'email', label: 'Email Worker', subtitle: 'Provider adapter', kind: 'worker', x: 68, y: 28, details: 'Formats and throttles email work independently.' },
      { id: 'sms', label: 'SMS Worker', subtitle: 'Provider adapter', kind: 'worker', x: 68, y: 55, details: 'Owns SMS quotas, retry rules, and provider-specific errors.' },
      { id: 'push', label: 'Push Worker', subtitle: 'Provider adapter', kind: 'worker', x: 68, y: 82, details: 'Handles device-token invalidation and high fan-out.' },
      { id: 'providers', label: 'External Providers', subtitle: 'Email · SMS · Push', kind: 'edge', x: 90, y: 55, details: 'External failure domain with independent latency, quotas, and incidents.' },
    ],
    edges: [
      { id: 'e1', from: 'producer', to: 'gateway', label: 'send', kind: 'sync' },
      { id: 'e2', from: 'gateway', to: 'prefs', label: 'preferences', kind: 'data' },
      { id: 'e3', from: 'gateway', to: 'queue', label: 'enqueue', kind: 'async' },
      { id: 'e4', from: 'gateway', to: 'state', label: 'accepted', kind: 'data' },
      { id: 'e5', from: 'queue', to: 'email', label: 'email jobs', kind: 'async' },
      { id: 'e6', from: 'queue', to: 'sms', label: 'sms jobs', kind: 'async' },
      { id: 'e7', from: 'queue', to: 'push', label: 'push jobs', kind: 'async' },
      { id: 'e8', from: 'email', to: 'providers', label: 'deliver', kind: 'sync' },
      { id: 'e9', from: 'sms', to: 'providers', label: 'deliver', kind: 'sync' },
      { id: 'e10', from: 'push', to: 'providers', label: 'deliver', kind: 'sync' },
    ],
    steps: [
      { title: 'Validate intent and preferences', description: 'Authenticate the producer, dedupe retries, enforce quota, and resolve recipient preferences.', nodeIds: ['producer', 'gateway', 'prefs'], edgeIds: ['e1', 'e2'] },
      { title: 'Accept durably', description: 'Store acceptance state and enqueue work before depending on external providers.', nodeIds: ['gateway', 'queue', 'state'], edgeIds: ['e3', 'e4'] },
      { title: 'Fan out by channel', description: 'Independent channel workers format, throttle, and retry their own delivery class.', nodeIds: ['queue', 'email', 'sms', 'push'], edgeIds: ['e5', 'e6', 'e7'] },
      { title: 'Cross the provider boundary', description: 'External calls use strict timeouts, circuit breakers, and policy-aware failover.', nodeIds: ['email', 'sms', 'push', 'providers'], edgeIds: ['e8', 'e9', 'e10'] },
    ],
    failures: [
      { id: 'provider-outage', label: 'Provider outage', nodeIds: ['providers'], impact: 'Workers can retry together, grow backlog, and exhaust quotas.', recovery: 'Circuit-break quickly, add jittered backoff, preserve queued work, and fail over only when product semantics allow it.' },
      { id: 'campaign-spike', label: 'Campaign overload', nodeIds: ['queue'], impact: 'Bulk traffic can delay password resets and other transactional notifications.', recovery: 'Separate priority lanes, enforce tenant quotas, and reserve capacity for critical traffic.' },
    ],
    scaleTiers: [
      baseScale,
      { multiplier: 10, label: '10× notifications', guidance: 'Partition work by channel/priority and scale workers independently.', pressureNodeIds: ['queue', 'providers'] },
      { multiplier: 100, label: '100× platform scale', guidance: 'Use regional cells, strict tenant isolation, provider portfolio management, and shared delivery standards.', pressureNodeIds: ['gateway', 'queue', 'providers'] },
    ],
  },
  {
    id: 'outbox-cdc',
    title: 'Transactional Outbox + CDC',
    category: 'database',
    level: 'Senior',
    summary: 'A database-first pattern that turns committed business changes into a replayable stream without unsafe dual writes.',
    goal: 'Connect ACID transactions, outbox/CDC, replay, schema evolution, idempotency, and downstream eventual consistency.',
    tags: ['ACID', 'CDC', 'outbox', 'replay'],
    requirements: ['Atomic business state + event intent', 'Replayable changes', 'No silent event loss', 'Duplicate-safe consumers', 'Schema evolution'],
    scale: ['High write rate', 'Multiple independent consumers', 'Ordered per aggregate', 'Long retention'],
    metrics: ['CDC lag', 'unpublished outbox rows', 'consumer lag', 'duplicate count', 'schema errors'],
    decisions: ['The database commit is the atomic source of truth.', 'Relay only committed changes.', 'Use stable event IDs and versions.', 'Make consumer state transitions idempotent.'],
    tradeoffs: ['CDC reduces custom polling but couples to log/change semantics.', 'Outbox adds relay/storage cleanup work.', 'Replayability makes schema compatibility a long-lived contract.'],
    nodes: [
      { id: 'svc', label: 'Command Service', subtitle: 'Business write', kind: 'service', x: 10, y: 48, details: 'Starts one local transaction for domain state and event intent.' },
      { id: 'db', label: 'Primary DB', subtitle: 'State + outbox', kind: 'database', x: 34, y: 48, details: 'The atomic boundary; both rows commit or neither does.' },
      { id: 'cdc', label: 'CDC / Relay', subtitle: 'Committed changes', kind: 'worker', x: 56, y: 48, details: 'Reads the transaction log or outbox and publishes committed facts.' },
      { id: 'stream', label: 'Event Stream', subtitle: 'Durable replay', kind: 'queue', x: 76, y: 48, details: 'Retains versioned events for many consumers and backfills.' },
      { id: 'projection', label: 'Projection Consumer', subtitle: 'Idempotent read model', kind: 'worker', x: 91, y: 28, details: 'Updates a serving projection and rejects duplicate event IDs.' },
      { id: 'warehouse', label: 'Analytics Sink', subtitle: 'Async copy', kind: 'storage', x: 91, y: 70, details: 'Builds historical analytical data without joining the online transaction.' },
    ],
    edges: [
      { id: 'e1', from: 'svc', to: 'db', label: 'commit', kind: 'data' },
      { id: 'e2', from: 'db', to: 'cdc', label: 'WAL / outbox', kind: 'async' },
      { id: 'e3', from: 'cdc', to: 'stream', label: 'publish', kind: 'async' },
      { id: 'e4', from: 'stream', to: 'projection', label: 'consume', kind: 'async' },
      { id: 'e5', from: 'stream', to: 'warehouse', label: 'consume', kind: 'async' },
    ],
    steps: [
      { title: 'Use one atomic boundary', description: 'Business state and event intent commit together in the database.', nodeIds: ['svc', 'db'], edgeIds: ['e1'] },
      { title: 'Publish committed facts', description: 'CDC/outbox relay converts committed changes into a durable event stream.', nodeIds: ['db', 'cdc', 'stream'], edgeIds: ['e2', 'e3'] },
      { title: 'Build independent downstream views', description: 'Consumers update projections and analytics using their own retry/idempotency policies.', nodeIds: ['stream', 'projection', 'warehouse'], edgeIds: ['e4', 'e5'] },
    ],
    failures: [
      { id: 'cdc-lag', label: 'CDC lag', nodeIds: ['cdc'], impact: 'Primary writes stay healthy while all downstream systems become stale.', recovery: 'Alert on end-to-end freshness, scale relay throughput, preserve checkpoints, and replay after recovery.' },
      { id: 'duplicate', label: 'Duplicate delivery', nodeIds: ['projection'], impact: 'A projection or side effect may be applied twice.', recovery: 'Use event IDs plus a processed-event uniqueness check committed with the business update where possible.' },
    ],
    scaleTiers: [
      baseScale,
      { multiplier: 10, label: '10× changes', guidance: 'Batch relay work, partition streams by aggregate key, and isolate slow consumers.', pressureNodeIds: ['cdc', 'stream'] },
      { multiplier: 100, label: '100× data platform', guidance: 'Govern schemas, tier retention, automate replay, and separate operational from analytical consumption.', pressureNodeIds: ['stream', 'warehouse'] },
    ],
  },
  {
    id: 'cloud-event-pipeline',
    title: 'Cloud Event Pipeline',
    category: 'cloud',
    level: 'Senior',
    summary: 'Durable cloud ingestion with a partitioned stream, lag-based autoscaling, raw object storage, serving projections, and analytics.',
    goal: 'Understand buffering, backpressure, replay, stream/batch separation, quotas, and cost-aware autoscaling.',
    tags: ['event-driven', 'streaming', 'autoscaling', 'data lake'],
    requirements: ['Absorb bursts', 'Replay events', 'Independent processors', 'Durable raw archive', 'Backpressure visibility'],
    scale: ['High sustained ingest', 'Sharp bursts', 'Multiple consumers', 'Long-term raw retention'],
    metrics: ['ingest rate', 'consumer lag', 'oldest event age', 'worker saturation', 'storage/egress cost'],
    decisions: ['Use a durable stream between producers and processors.', 'Archive raw immutable events.', 'Scale consumers from lag and throughput.', 'Make replay/DLQ an operator workflow.'],
    tradeoffs: ['Buffering protects producers but increases freshness latency.', 'Serverless/burst compute is simple but can cost more at steady load.', 'Raw retention enables replay but creates governance and storage cost.'],
    nodes: [
      { id: 'src', label: 'Producers', subtitle: 'Apps · devices', kind: 'client', x: 5, y: 48, details: 'Emit versioned events with stable IDs and partition keys.' },
      { id: 'ingest', label: 'Ingestion API', subtitle: 'Auth · schema · quota', kind: 'service', x: 24, y: 48, details: 'Validates payload contracts and protects downstream quotas.' },
      { id: 'stream', label: 'Event Stream', subtitle: 'Durable partitions', kind: 'queue', x: 44, y: 48, details: 'Buffers producer/consumer mismatch and preserves per-partition ordering.' },
      { id: 'worker', label: 'Stream Workers', subtitle: 'Lag-based autoscaling', kind: 'worker', x: 65, y: 25, details: 'Scale from backlog/throughput and write serving projections.' },
      { id: 'raw', label: 'Object Storage', subtitle: 'Raw immutable lake', kind: 'storage', x: 65, y: 72, details: 'Low-cost replay/backfill source with retention policy.' },
      { id: 'serving', label: 'Serving Store', subtitle: 'Materialized state', kind: 'database', x: 88, y: 25, details: 'Optimized for online product reads instead of historical scans.' },
      { id: 'warehouse', label: 'Warehouse', subtitle: 'Analytics', kind: 'database', x: 88, y: 72, details: 'Receives curated data for analytical workloads.' },
    ],
    edges: [
      { id: 'e1', from: 'src', to: 'ingest', label: 'events', kind: 'sync' },
      { id: 'e2', from: 'ingest', to: 'stream', label: 'append', kind: 'async' },
      { id: 'e3', from: 'stream', to: 'worker', label: 'consume', kind: 'async' },
      { id: 'e4', from: 'worker', to: 'serving', label: 'projection', kind: 'data' },
      { id: 'e5', from: 'stream', to: 'raw', label: 'archive', kind: 'async' },
      { id: 'e6', from: 'raw', to: 'warehouse', label: 'batch load', kind: 'data' },
    ],
    steps: [
      { title: 'Accept validated events', description: 'The ingestion layer enforces contract and quota before appending to a durable stream.', nodeIds: ['src', 'ingest', 'stream'], edgeIds: ['e1', 'e2'] },
      { title: 'Process from backlog', description: 'Workers consume independently and scale from lag so spikes are buffered instead of dropped.', nodeIds: ['stream', 'worker', 'serving'], edgeIds: ['e3', 'e4'] },
      { title: 'Keep a replayable raw path', description: 'Events are archived to object storage and later loaded into analytics without burdening serving state.', nodeIds: ['stream', 'raw', 'warehouse'], edgeIds: ['e5', 'e6'] },
    ],
    failures: [
      { id: 'worker-slow', label: 'Consumers too slow', nodeIds: ['worker'], impact: 'Backlog grows and freshness SLO degrades.', recovery: 'Scale from lag, fix hot partitions, shed optional work, and keep replay available.' },
      { id: 'stream-quota', label: 'Stream quota exhausted', nodeIds: ['stream'], impact: 'Producers cannot append reliably and may create retry storms.', recovery: 'Monitor quotas, use admission control, pre-plan partition capacity, and bound producer retries.' },
    ],
    scaleTiers: [
      baseScale,
      { multiplier: 10, label: '10× ingest', guidance: 'Increase partitions carefully, scale consumers from lag, and inspect hot partition keys.', pressureNodeIds: ['stream', 'worker'] },
      { multiplier: 100, label: '100× ingest', guidance: 'Split independent pipelines/cells, tier storage, and control cross-region and egress cost.', pressureNodeIds: ['stream', 'raw'] },
    ],
  },
  {
    id: 'model-gateway',
    title: 'Multi-Model AI Gateway',
    category: 'genai',
    level: 'Staff',
    summary: 'Central model access with deterministic policy, routing, quotas, fallbacks, privacy-aware choices, telemetry, and cost attribution.',
    goal: 'Treat model access as an enterprise platform where policy, availability, quality, privacy, and unit economics are explicit.',
    tags: ['model gateway', 'routing', 'fallbacks', 'cost'],
    requirements: ['Approved model catalog', 'Tenant/model quotas', 'Provider abstraction', 'Privacy-aware routing', 'Cost attribution', 'Approved fallbacks'],
    scale: ['Hundreds of product teams', 'Multiple providers', 'Streaming + batch traffic', 'Different data classifications'],
    metrics: ['tokens/cost by tenant', 'provider latency/errors', 'fallback rate', 'quality by route', 'quota denials'],
    decisions: ['Apply data/security policy before any provider call.', 'Route only among approved models/providers.', 'Normalize usage for accounting while retaining raw audit data.', 'Validate fallback privacy and quality, not only health.'],
    tradeoffs: ['Abstraction improves portability but can hide provider-specific capability.', 'Central governance can become a development bottleneck if over-centralized.', 'Fallbacks improve availability but may change quality, privacy, latency, and cost.'],
    nodes: [
      { id: 'apps', label: 'Product Apps', subtitle: 'Many teams', kind: 'client', x: 5, y: 48, details: 'Use one governed interface instead of embedding provider credentials and policies.' },
      { id: 'gateway', label: 'AI Gateway', subtitle: 'Auth · quota · streaming', kind: 'service', x: 24, y: 48, details: 'Authenticates workload identity and enforces request/token quotas.' },
      { id: 'policy', label: 'Policy + Catalog', subtitle: 'Data class · approvals', kind: 'security', x: 46, y: 22, details: 'Stores approved models, regions, data classes, capabilities, and status.' },
      { id: 'router', label: 'Model Router', subtitle: 'Quality · cost · health', kind: 'ai', x: 46, y: 72, details: 'Selects among policy-approved routes using health/capability/cost/latency signals.' },
      { id: 'p1', label: 'Provider A', subtitle: 'Hosted model API', kind: 'ai', x: 72, y: 20, details: 'External availability, privacy, quota, and pricing domain.' },
      { id: 'p2', label: 'Provider B', subtitle: 'Hosted model API', kind: 'ai', x: 72, y: 48, details: 'Alternative provider for approved capabilities or regions.' },
      { id: 'self', label: 'Self-Hosted', subtitle: 'GPU inference', kind: 'ai', x: 72, y: 78, details: 'Adds control but also GPU scheduling, batching, capacity, and reliability operations.' },
      { id: 'obs', label: 'AI Telemetry', subtitle: 'Quality · tokens · cost', kind: 'observability', x: 92, y: 48, details: 'Records route, versions, usage, latency, failures, cost, and privacy-safe quality signals.' },
    ],
    edges: [
      { id: 'e1', from: 'apps', to: 'gateway', label: 'model request', kind: 'sync' },
      { id: 'e2', from: 'gateway', to: 'policy', label: 'authorize', kind: 'sync' },
      { id: 'e3', from: 'policy', to: 'router', label: 'allowed routes', kind: 'data' },
      { id: 'e4', from: 'router', to: 'p1', label: 'route', kind: 'sync' },
      { id: 'e5', from: 'router', to: 'p2', label: 'fallback', kind: 'sync' },
      { id: 'e6', from: 'router', to: 'self', label: 'private route', kind: 'sync' },
      { id: 'e7', from: 'gateway', to: 'obs', label: 'usage + trace', kind: 'async' },
    ],
    steps: [
      { title: 'Centralize model access', description: 'Applications authenticate with workload identity and submit requests through one governed gateway.', nodeIds: ['apps', 'gateway'], edgeIds: ['e1'] },
      { title: 'Apply policy before routing', description: 'Data classification, quota, approved catalog, region, and provider restrictions are deterministic checks.', nodeIds: ['gateway', 'policy'], edgeIds: ['e2'] },
      { title: 'Choose an approved route', description: 'Routing balances health, capability, quality, latency, and cost only inside policy-approved choices.', nodeIds: ['policy', 'router', 'p1', 'p2', 'self'], edgeIds: ['e3', 'e4', 'e5', 'e6'] },
      { title: 'Measure quality and unit economics', description: 'Telemetry attributes cost and quality to the actual route, model, tenant, and request.', nodeIds: ['gateway', 'obs'], edgeIds: ['e7'] },
    ],
    failures: [
      { id: 'provider-a', label: 'Provider A outage', nodeIds: ['p1'], impact: 'The preferred route times out or errors; blindly retrying it increases latency and cost.', recovery: 'Circuit-break and route only to a fallback approved for the same data class and use case; measure quality drift.' },
      { id: 'gpu-oom', label: 'Self-hosted GPU OOM', nodeIds: ['self'], impact: 'Inference replicas fail and queues grow.', recovery: 'Cap context/output, enforce admission control/batching limits, evict unhealthy replicas, and use approved overflow routes.' },
      { id: 'cost-spike', label: 'Unexpected cost spike', nodeIds: ['router', 'obs'], impact: 'A routing/model change can multiply unit cost while functional success still looks healthy.', recovery: 'Use budgets, route-level cost telemetry, anomaly alerts, and gated model/prompt changes.' },
    ],
    scaleTiers: [
      baseScale,
      { multiplier: 10, label: '10× AI traffic', guidance: 'Add per-model concurrency controls, token caps, safe caching, and provider quota monitoring.', pressureNodeIds: ['gateway', 'p1', 'self'] },
      { multiplier: 100, label: '100× org adoption', guidance: 'Platformize model access, evaluation, registries, policy, and cost attribution with explicit SLOs and ownership.', pressureNodeIds: ['gateway', 'policy', 'obs'] },
    ],
  }

]

export const CATEGORY_META: Record<DesignCategory, { label: string; description: string }> = {
  backend: { label: 'Backend Systems', description: 'APIs, events, resilience, distributed workflows, and production operations.' },
  database: { label: 'Database Systems', description: 'Transactions, caching, replication, sharding, consistency, and data evolution.' },
  cloud: { label: 'Cloud Architecture', description: 'Fault domains, networking, multi-AZ/region design, security, reliability, and cost.' },
  genai: { label: 'GenAI Systems', description: 'RAG, agents, model access, evaluation, safety, latency, and cost.' },
}
