package engine

import "strings"

func BuildSpec(topic Topic) Spec {
	family := Classify(topic)
	spec := Spec{
		Family:      family,
		FamilyLabel: FamilyLabel(family),
		Description: "Interactive visualization selected from the topic's engineering behavior rather than its heading structure.",
		Inspector:   sourceInspector(topic),
	}

	switch family {
	case FamilyQueryPlan:
		spec.Steps = []Step{
			{"Parse & plan", "The optimizer transforms declarative SQL into physical operators and estimates cardinality/cost.", []string{"sql", "planner"}},
			{"Access base data", "Leaf scans fetch candidate rows. A sequential scan and an index scan have different I/O trade-offs.", []string{"seq", "index"}},
			{"Join inputs", "The join operator combines both inputs. Join choice depends heavily on cardinality, ordering, and available indexes.", []string{"join"}},
			{"Aggregate / return", "Higher operators consume child rows and produce the final result.", []string{"agg", "result"}},
		}
		spec.Failures = []Failure{
			{"bad-cardinality", "Bad cardinality estimate", "The optimizer may pick the wrong join or access path and amplify work.", "Refresh statistics, inspect EXPLAIN/ANALYZE, compare estimated vs actual rows, then address the root access-pattern/index issue.", []string{"planner", "join"}},
			{"missing-index", "Missing / unsuitable index", "A selective lookup degrades into a large scan.", "Create an index only when the access pattern justifies its write/storage cost; verify column order for composite indexes.", []string{"seq", "index"}},
			{"nplus1", "N+1 query pattern", "Many small dependent queries dominate latency even if each plan looks cheap.", "Batch, join, prefetch, or use DataLoader-style access while preserving correctness and memory bounds.", []string{"sql", "result"}},
		}
		spec.Tradeoffs = []string{"Sequential scans are efficient when much of a table must be read; indexes are not automatically faster.", "Nested-loop joins can be excellent for small/selective outer inputs but disastrous with underestimated cardinality.", "Hash joins trade memory for fast equality joins; merge joins benefit from sorted inputs and can support range-like processing.", "Every index improves some reads while increasing storage and write-maintenance cost."}
	case FamilyBTree:
		spec.Steps = []Step{{"Choose search key", "The root page narrows the key range.", []string{"root"}}, {"Traverse internal page", "A separator key selects the child page.", []string{"internal"}}, {"Reach leaf", "The leaf contains the matching key or tuple reference.", []string{"leaf2"}}, {"Insert and split", "When a page fills, keys are redistributed and a separator can propagate upward.", []string{"leaf2", "split"}}}
		spec.Failures = []Failure{{"wrong-order", "Composite index order mismatch", "The index cannot efficiently serve a query that does not constrain the useful leading prefix.", "Align index columns with the dominant equality/range/order-by access pattern and validate with the execution plan.", []string{"root"}}, {"bloat", "Index bloat / write pressure", "Excessive indexes increase INSERT/UPDATE/DELETE work and memory/storage pressure.", "Remove unused indexes, monitor bloat/maintenance, and keep only indexes justified by measured access patterns.", []string{"leaf1", "leaf2", "leaf3"}}}
		spec.Tradeoffs = []string{"B+ trees provide ordered lookups and range scans at the cost of page maintenance on writes.", "Covering indexes can avoid base-table visits but make the index wider.", "Low-selectivity indexes may not reduce I/O enough for the optimizer to use them."}
	case FamilyMVCC:
		spec.Steps = []Step{{"T1 reads snapshot", "Transaction T1 observes the row version visible to its snapshot.", []string{"t1r"}}, {"T2 updates", "T2 creates a new row version while the old version remains available to snapshots that still need it.", []string{"t2w"}}, {"T2 commits", "The new version becomes committed, but visibility still depends on T1's isolation/snapshot semantics.", []string{"t2c"}}, {"T1 reads again", "The second read illustrates whether T1 sees the original or new version under the selected isolation model.", []string{"t1r2"}}}
		spec.Failures = []Failure{{"lost-update", "Lost update", "Two transactions read the same state and overwrite each other's result.", "Use atomic updates, locking, compare-and-swap/version columns, or serializable semantics where the invariant requires it.", []string{"t1r", "t2w"}}, {"long-tx", "Long-running snapshot", "Old row versions cannot be reclaimed promptly, increasing storage/bloat pressure.", "Bound transaction duration, monitor oldest snapshots, and avoid holding transactions open across user/network waits.", []string{"t1r", "t1r2"}}}
		spec.Tradeoffs = []string{"MVCC improves read/write concurrency by keeping multiple row versions, but vacuum/garbage collection becomes operationally important.", "Stronger isolation reduces anomalies but may increase blocking, retries, or serialization failures."}
	case FamilyDeadlock:
		spec.Steps = []Step{{"T1 locks row A", "Transaction 1 obtains an exclusive lock on resource A.", []string{"t1", "a"}}, {"T2 locks row B", "Transaction 2 independently locks resource B.", []string{"t2", "b"}}, {"T1 waits for B", "T1 cannot continue until T2 releases B.", []string{"t1", "b", "wait1"}}, {"T2 waits for A", "The wait-for graph now contains a cycle: neither transaction can progress.", []string{"t2", "a", "wait2"}}, {"Detector aborts one", "The database chooses a victim, rolls it back, and lets the other transaction continue.", []string{"abort"}}}
		spec.Failures = []Failure{{"deadlock", "Deadlock cycle", "Transactions wait on each other forever without detection/timeout.", "Acquire resources in a consistent order, keep transactions short, rely on deadlock detection, and retry only the aborted transaction with bounded backoff.", []string{"wait1", "wait2"}}}
		spec.Tradeoffs = []string{"Pessimistic locking prevents conflicting work but can reduce concurrency and create deadlocks.", "Optimistic locking avoids long waits when conflicts are rare but pushes conflict handling/retries to the application."}
	case FamilyReplication:
		spec.Steps = []Step{{"Commit on primary", "The write is committed on the authoritative node according to the configured durability rule.", []string{"primary"}}, {"Ship log", "WAL/change records are sent to replicas.", []string{"wal"}}, {"Replay on replicas", "Replicas apply changes asynchronously or synchronously depending on the architecture.", []string{"r1", "r2"}}, {"Serve reads", "Read routing can reduce primary load but may expose replication lag.", []string{"read"}}}
		spec.Failures = []Failure{{"lag", "Replica lag", "A read replica serves stale state after a recent write.", "Route read-your-write paths to the primary or use session/version-aware routing; monitor replication lag explicitly.", []string{"r2"}}, {"primary-down", "Primary failure", "Writes stop until ownership is safely transferred.", "Promote a sufficiently caught-up replica according to quorum/fencing rules, redirect clients, and handle broken connections/retries.", []string{"primary"}}}
		spec.Tradeoffs = []string{"Replication scales reads and improves availability but does not automatically scale a single write leader.", "Synchronous replicas reduce data-loss windows but add commit latency and availability coupling."}
	case FamilySharding:
		spec.Steps = []Step{{"Extract shard key", "The request carries a partition key such as tenant_id or user_id.", []string{"request"}}, {"Route", "A shard map/hash chooses one owner without querying every shard.", []string{"router"}}, {"Execute locally", "Common transactional work stays on one shard when the data model is aligned with access patterns.", []string{"s2"}}, {"Rebalance", "Ownership moves through copy, catch-up, route flip, and cleanup rather than a one-shot move.", []string{"rebalance"}}}
		spec.Failures = []Failure{{"hot", "Hot shard", "One shard saturates while others remain underused.", "Split/salt the key space, isolate oversized tenants, or change the partition model based on measured skew.", []string{"s2"}}, {"scatter", "Scatter-gather query", "A lookup missing the shard key fans out to every shard and becomes expensive at scale.", "Add a dedicated/global lookup for the access pattern, colocate data, or redesign the partition key.", []string{"router", "s1", "s2", "s3"}}}
		spec.Tradeoffs = []string{"Sharding scales storage/write capacity but turns formerly local joins, indexes, and uniqueness checks into distributed-system problems.", "Hash partitioning balances keys; range/tenant partitioning can improve locality but risks skew."}
	case FamilyOutboxCDC:
		spec.Steps = []Step{{"Local transaction", "Business state and event intent are committed atomically in one database transaction.", []string{"service", "db"}}, {"Capture committed change", "CDC or an outbox relay reads only committed state.", []string{"relay"}}, {"Publish", "The event is appended to a durable broker/stream.", []string{"broker"}}, {"Consume idempotently", "Consumers use event IDs/constraints so a replay does not duplicate side effects.", []string{"consumer"}}}
		spec.Failures = []Failure{{"relay-crash", "Relay crashes after publish", "The same event can be published again after restart.", "Keep stable event IDs and make consumers idempotent instead of assuming exactly-once delivery across the whole system.", []string{"relay", "broker"}}, {"consumer-fail", "Consumer fails after side effect", "A retry can repeat the effect if progress was not committed atomically.", "Commit state and dedupe marker together where possible; use idempotency keys for external effects.", []string{"consumer"}}}
		spec.Tradeoffs = []string{"Outbox avoids a database+broker dual-write gap but adds relay/storage/cleanup work.", "CDC reduces application polling but introduces log semantics, schema evolution, and connector operations."}
	case FamilyDBStorage:
		spec.Steps = []Step{{"Write enters memory/log", "A durable log protects the mutation before or while mutable in-memory state changes.", []string{"wal", "mem"}}, {"Flush immutable file/page", "Buffered state becomes durable on disk in an organized structure.", []string{"sst1"}}, {"Read path", "Indexes/Bloom filters/pages narrow which disk structures must be inspected.", []string{"read"}}, {"Compaction / checkpoint", "Background maintenance merges or flushes state to control recovery/read amplification.", []string{"compact"}}}
		spec.Failures = []Failure{{"compaction", "Compaction pressure", "Write amplification and background I/O compete with foreground requests.", "Rate-limit/shape compaction, maintain disk headroom, and monitor read/write/space amplification.", []string{"compact"}}}
		spec.Tradeoffs = []string{"B-tree engines favor in-place ordered page structures; LSM-style engines trade read/compaction cost for sequential write throughput.", "Storage-engine behavior matters because disk I/O, caching, and amplification dominate at scale."}
	case FamilyRequestFlow:
		spec.Steps = []Step{{"Receive", "Client traffic reaches the edge/load balancer and a stateless application instance.", []string{"client", "edge", "api"}}, {"Authenticate + validate", "Identity, authorization, input validation, and request deadlines are established before business work.", []string{"auth"}}, {"Read/write state", "The service uses cache/database/external dependencies according to consistency requirements.", []string{"cache", "db"}}, {"Publish async work", "Slow or decoupled side effects move through a durable broker when appropriate.", []string{"queue"}}, {"Respond + record telemetry", "The response returns while logs/metrics/traces preserve operational context.", []string{"obs", "client"}}}
		spec.Failures = []Failure{{"dependency", "Slow dependency", "Request latency rises and retries can multiply load.", "Set per-hop deadlines, circuit-break persistent failures, cap concurrency, and degrade noncritical features.", []string{"db"}}, {"overload", "Traffic overload", "Queues/pools saturate and latency grows nonlinearly.", "Apply admission control, rate limits, load shedding, and scale stateless capacity without overwhelming stateful tiers.", []string{"api", "db"}}}
		spec.Tradeoffs = []string{"Synchronous calls are simple and immediate but couple latency/availability across dependencies.", "Asynchronous work decouples the user request but introduces eventual consistency, replay, and operational lag."}
	case FamilyCache:
		spec.Steps = []Step{{"Read cache", "The application checks a fast cache before the source of truth.", []string{"app", "cache"}}, {"Cache miss", "A miss reads the backing database.", []string{"db"}}, {"Populate", "The result is cached with an expiry/invalidation strategy.", []string{"populate"}}, {"Next read hits", "Subsequent reads avoid the database until data expires or is invalidated.", []string{"hit"}}}
		spec.Failures = []Failure{{"stampede", "Cache stampede", "Many clients miss the same hot key and hammer the database simultaneously.", "Use request coalescing/single-flight, TTL jitter, stale-while-revalidate where safe, and database admission control.", []string{"db"}}, {"stale", "Stale cache", "Users observe old state after a write.", "Choose explicit TTL/invalidation/version semantics based on product consistency needs.", []string{"cache"}}}
		spec.Tradeoffs = []string{"Caching improves latency and protects expensive dependencies but creates invalidation and staleness semantics.", "Write-through simplifies read freshness at the cost of synchronous cache work; write-behind increases durability/ordering risk."}
	case FamilyQueue:
		spec.Steps = []Step{{"Produce", "A producer appends a durable message/event using a partitioning key when ordering matters.", []string{"producer"}}, {"Partition", "The broker stores the record in one partition/queue and exposes an offset/position.", []string{"p2"}}, {"Consume", "A consumer group member processes the record and advances committed progress.", []string{"consumer"}}, {"Build backlog", "If producers outrun consumers, lag grows rather than immediately dropping work.", []string{"lag"}}}
		spec.Failures = []Failure{{"consumer-down", "Consumer failure", "Lag grows and processing freshness degrades.", "Rebalance/scale consumers, bound retries, and quarantine poison messages without silently losing them.", []string{"consumer", "lag"}}, {"hot-partition", "Hot partition", "One partition receives disproportionate traffic and limits throughput despite idle peers.", "Choose/adjust partition keys and isolate pathological tenants/keys.", []string{"p2"}}}
		spec.Tradeoffs = []string{"Queues absorb bursts and decouple producers from consumers but add latency and eventual consistency.", "Ordering is usually local to a partition/key; demanding global order drastically limits scale."}
	case FamilyResilience:
		spec.Steps = []Step{{"Healthy request", "Calls pass while dependency latency/error rate remains within policy.", []string{"closed"}}, {"Failures accumulate", "Timeouts or errors consume retry budget; backoff and jitter prevent synchronization.", []string{"fail"}}, {"Circuit opens", "Calls fail fast instead of sending more load to a persistently unhealthy dependency.", []string{"open"}}, {"Half-open probe", "A small number of test requests determine whether service has recovered.", []string{"half"}}, {"Close or reopen", "Successful probes restore traffic; failed probes extend isolation.", []string{"closed2"}}}
		spec.Failures = []Failure{{"retry-storm", "Retry storm", "Clients retry faster than the dependency recovers, increasing load and latency.", "Use bounded retry budgets, exponential backoff with jitter, deadlines, circuit breakers, and load shedding.", []string{"fail"}}}
		spec.Tradeoffs = []string{"Retries improve availability for transient faults but can duplicate side effects and amplify overload.", "Circuit breakers protect dependencies but intentionally reject some traffic during recovery."}
	case FamilyRateLimiter:
		spec.Steps = []Step{{"Refill", "Tokens are added at the configured steady rate up to bucket capacity.", []string{"bucket"}}, {"Request arrives", "A request consumes one token if available.", []string{"req1"}}, {"Burst drains tokens", "Short bursts are allowed until the bucket becomes empty.", []string{"req2", "req3"}}, {"Reject / wait", "Further requests are denied or delayed until capacity replenishes.", []string{"deny"}}}
		spec.Failures = []Failure{{"shared-limit", "Single tenant exhausts global capacity", "One caller starves unrelated traffic.", "Layer limits by tenant/user/IP/resource and protect critical control-plane traffic separately.", []string{"deny"}}}
		spec.Tradeoffs = []string{"Token bucket permits bounded bursts while enforcing an average rate.", "Strict distributed limits require coordination; approximate/local limits scale better but can overshoot."}
	case FamilySaga:
		spec.Steps = []Step{{"Create order", "The first local transaction commits and emits/returns its outcome.", []string{"order"}}, {"Charge payment", "The payment service performs its own local transaction.", []string{"payment"}}, {"Reserve inventory", "Inventory commits independently.", []string{"inventory"}}, {"Failure occurs", "A downstream step fails after earlier commits.", []string{"failure"}}, {"Compensate", "Explicit compensating actions undo or neutralize prior business effects.", []string{"compensate"}}}
		spec.Failures = []Failure{{"comp-fail", "Compensation fails", "The system is left in an intermediate business state requiring recovery.", "Make saga state durable, retry compensations idempotently, expose manual repair, and define business reconciliation rules.", []string{"compensate"}}}
		spec.Tradeoffs = []string{"Sagas avoid holding a distributed transaction across services but expose intermediate states and require compensation semantics.", "Orchestration centralizes workflow visibility; choreography reduces central coupling but can become difficult to reason about."}
	case FamilyCQRS:
		spec.Steps = []Step{{"Command", "A command validates intent and updates the authoritative write model.", []string{"command"}}, {"Append event", "A durable event represents the committed state transition.", []string{"event"}}, {"Project", "Consumers build denormalized read models suited to query patterns.", []string{"projection"}}, {"Query", "Reads use the projection and may lag behind the command side.", []string{"query"}}}
		spec.Failures = []Failure{{"projection-lag", "Projection lag", "Read models temporarily show older state than the command model.", "Expose freshness, make consumers replayable/idempotent, and route strongly consistent reads to the authoritative model when required.", []string{"projection"}}}
		spec.Tradeoffs = []string{"CQRS allows read/write models to scale and evolve independently but duplicates models and introduces consistency lag.", "Event sourcing gives audit/replay but makes schema evolution, external side effects, and replay operationally significant."}
	case FamilyAuth:
		spec.Steps = []Step{{"Authenticate", "The user/workload proves identity to an identity provider or auth service.", []string{"principal", "idp"}}, {"Issue credential", "A short-lived session/token carries identity and claims.", []string{"token"}}, {"Authorize", "The resource service evaluates action, resource, tenant, and policy.", []string{"policy"}}, {"Access resource", "The operation proceeds only after deterministic authorization.", []string{"resource"}}}
		spec.Failures = []Failure{{"stolen", "Credential compromise", "An attacker can act with the credential's privileges until revoked/expired.", "Use short lifetimes, MFA/workload identity, audience/scope restrictions, rotation, revocation, and audit.", []string{"token"}}}
		spec.Tradeoffs = []string{"Central identity simplifies lifecycle and policy but becomes critical shared infrastructure.", "JWT validation is scalable but immediate revocation is harder than server-side sessions unless extra mechanisms are added."}
	case FamilyRealtime:
		spec.Steps = []Step{{"Upgrade / subscribe", "The client establishes a long-lived connection or event stream.", []string{"client", "gateway"}}, {"Register connection", "A realtime gateway maps identity/session to an active connection.", []string{"session"}}, {"Publish event", "Backend state changes are delivered through a broker/fan-out path.", []string{"broker"}}, {"Push", "The gateway emits ordered/filtered events to the connected client.", []string{"push"}}}
		spec.Failures = []Failure{{"disconnect", "Client disconnect", "Messages can be missed during a network interruption.", "Define replay/resume cursor semantics where loss is unacceptable; otherwise treat the stream as best-effort presence.", []string{"client"}}}
		spec.Tradeoffs = []string{"Long-lived connections reduce polling latency but require connection state, backpressure, and reconnection semantics."}
	case FamilyNetwork:
		spec.Steps = []Step{{"Internet edge", "DNS/CDN/WAF handle public ingress and route to a regional boundary.", []string{"internet", "edge"}}, {"Public subnet", "A load balancer/ingress terminates public traffic while application nodes remain private.", []string{"public"}}, {"Private compute", "Application workloads use private addresses/security policy.", []string{"app"}}, {"Private data", "Databases and internal services are not directly internet-reachable.", []string{"db"}}, {"Controlled egress", "NAT/private endpoints govern outbound connectivity and cost/blast radius.", []string{"nat"}}}
		spec.Failures = []Failure{{"route", "Bad route / ACL", "Healthy instances become unreachable despite no application failure.", "Inspect route tables, security groups/firewalls, subnet scopes, DNS, and network telemetry by hop.", []string{"app"}}, {"nat", "NAT/egress exhaustion", "Private workloads cannot open new outbound connections.", "Monitor ports/connections, scale or shard egress, prefer private endpoints, and reduce connection churn.", []string{"nat"}}}
		spec.Tradeoffs = []string{"Private networking reduces exposure but increases routing/DNS/egress design complexity.", "Centralized network hubs simplify policy but can increase blast radius and cross-zone/region cost."}
	case FamilyMultiAZ:
		spec.Steps = []Step{{"Distribute", "Stateless capacity is spread across independent Availability Zones.", []string{"aza", "azb"}}, {"Health check", "The regional load balancer routes only to healthy targets.", []string{"lb"}}, {"Data HA", "The data tier uses an explicit multi-AZ durability/failover mechanism.", []string{"db"}}, {"Lose one AZ", "Traffic shifts to remaining healthy zones if there is enough spare capacity.", []string{"aza-fail", "azb"}}}
		spec.Failures = []Failure{{"az", "Availability Zone outage", "Compute and zonal dependencies in one failure domain disappear together.", "Keep dependencies multi-AZ, pre-provision/auto-scale headroom, and test zone evacuation rather than only instance failure.", []string{"aza"}}}
		spec.Tradeoffs = []string{"Multi-AZ protects against many zonal failures but not all regional/control-plane dependencies.", "Running spare capacity across zones costs more but reduces recovery time."}
	case FamilyMultiRegion:
		spec.Steps = []Step{{"Route to home/healthy region", "Global traffic policy selects the appropriate regional cell.", []string{"global", "r1"}}, {"Use regional data", "Normal writes stay local to the designated home/leader region where possible.", []string{"d1"}}, {"Replicate", "Cross-region replication exposes an explicit lag/consistency contract.", []string{"rep"}}, {"Regional failure", "Routing and write ownership change according to a tested failover plan.", []string{"r1-fail", "r2"}}, {"Fail back carefully", "Ownership and divergent state are reconciled before returning to normal routing.", []string{"failback"}}}
		spec.Failures = []Failure{{"partition", "Inter-region partition", "Both regions can be healthy while unable to coordinate, creating stale or conflicting state.", "Prefer home-region ownership when possible; otherwise use explicit quorum/conflict/uniqueness semantics.", []string{"rep"}}, {"region", "Region outage", "A full application/data failure domain becomes unavailable.", "Shift traffic only after establishing safe data/write ownership and verify RPO/RTO with rehearsed failover/failback.", []string{"r1"}}}
		spec.Tradeoffs = []string{"Active-active lowers local write latency but creates conflict, ordering, and global uniqueness complexity.", "Active-passive simplifies writes but has failover time and remote-user latency trade-offs."}
	case FamilyIAM:
		spec.Steps = []Step{{"Federate identity", "Human/workload identity is established by a trusted identity provider.", []string{"idp"}}, {"Assume role", "A short-lived role/session is issued instead of long-lived shared credentials.", []string{"role"}}, {"Evaluate policy", "Principal, action, resource, and conditions are checked.", []string{"policy"}}, {"Access", "Only the permitted operation reaches the resource and is audited.", []string{"resource"}}}
		spec.Failures = []Failure{{"wildcard", "Over-broad permission", "One compromised principal has a large blast radius.", "Use least privilege, explicit resource scoping, permission boundaries, short-lived credentials, and audit/policy-as-code.", []string{"policy"}}}
		spec.Tradeoffs = []string{"Central federation improves lifecycle/MFA/audit but makes identity a critical dependency.", "Fine-grained IAM reduces blast radius but increases policy complexity and testing needs."}
	case FamilyKubernetes:
		spec.Steps = []Step{{"Desired state", "A deployment declares the desired replica count and pod template.", []string{"api"}}, {"Schedule", "The scheduler chooses nodes according to resources/constraints.", []string{"sched"}}, {"Run pods", "Kubelet/container runtime starts isolated pod workloads.", []string{"pod1", "pod2"}}, {"Service routing", "A stable service/ingress routes traffic to healthy pods.", []string{"svc"}}, {"Reschedule", "Failed pods/nodes are replaced elsewhere when capacity permits.", []string{"fail"}}}
		spec.Failures = []Failure{{"node", "Node failure", "All pods on one node disappear at once.", "Use multiple nodes/zones, readiness probes, disruption budgets, anti-affinity/topology spread, and enough spare capacity.", []string{"node1"}}}
		spec.Tradeoffs = []string{"Kubernetes standardizes scheduling and orchestration but adds control-plane, networking, storage, and operational complexity.", "Use it when workload/platform needs justify that complexity—not by default."}
	case FamilyAutoscale:
		spec.Steps = []Step{{"Load rises", "Traffic exceeds the comfortable capacity of the current replica count.", []string{"traffic1"}}, {"Signal crosses threshold", "CPU, queue lag, concurrency, or a custom metric triggers scaling.", []string{"threshold"}}, {"Add capacity", "New instances/pods start after provisioning/warm-up delay.", []string{"replicas"}}, {"Stabilize", "Latency returns toward target when downstream dependencies can also absorb the load.", []string{"latency"}}}
		spec.Failures = []Failure{{"slow-scale", "Autoscaling too slow", "Latency/queue backlog explodes before new capacity becomes ready.", "Use predictive/minimum capacity, faster startup, queue buffering, admission control, and scale on leading indicators.", []string{"latency"}}, {"db-limit", "Downstream database limit", "Adding app replicas increases connection/query pressure and makes the bottleneck worse.", "Scale the actual bottleneck and cap application concurrency/pools.", []string{"db"}}}
		spec.Tradeoffs = []string{"Reactive autoscaling saves steady-state cost but cannot eliminate provisioning delay.", "Scaling stateless compute is useful only if stateful dependencies and quotas have headroom."}
	case FamilyCloudBackup, FamilyDBBackup:
		spec.Steps = []Step{{"Create recovery point", "Data is copied/snapshotted according to retention and durability policy.", []string{"source", "backup"}}, {"Protect copy", "Backup credentials/account/region are isolated from normal application blast radius.", []string{"vault"}}, {"Restore", "A recovery environment is created from the selected recovery point.", []string{"restore"}}, {"Validate", "Checks prove data and application behavior before traffic is cut over.", []string{"validate"}}}
		spec.Failures = []Failure{{"untested", "Backup cannot restore", "Backups exist but recovery fails when needed.", "Automate restore tests, measure real RPO/RTO, validate integrity, and protect recovery credentials separately.", []string{"restore"}}}
		spec.Tradeoffs = []string{"More frequent backups reduce potential data loss but cost more storage/I/O and do not by themselves guarantee low recovery time."}
	case FamilyServiceMesh:
		spec.Steps = []Step{{"Ingress", "North-south traffic enters through an API gateway/ingress boundary.", []string{"gateway"}}, {"Service call", "East-west traffic uses service identity/discovery.", []string{"a", "mesh"}}, {"Policy", "mTLS, retries, telemetry, and routing policy apply at the communication layer.", []string{"policy"}}, {"Destination", "The request reaches the target service instance.", []string{"b"}}}
		spec.Failures = []Failure{{"hidden-retry", "Hidden retry amplification", "Infrastructure retries combine with application retries and multiply requests.", "Define retry ownership/budgets, expose mesh telemetry, and keep business retry logic explicit.", []string{"mesh"}}}
		spec.Tradeoffs = []string{"A service mesh centralizes transport security/telemetry but adds resource use and debugging complexity."}
	case FamilyServerless:
		spec.Steps = []Step{{"Event/request", "An event or HTTP request triggers a managed function runtime.", []string{"event"}}, {"Cold/warm start", "The provider allocates or reuses an execution environment.", []string{"runtime"}}, {"Invoke dependencies", "The function uses managed data/services with explicit IAM and timeouts.", []string{"db"}}, {"Scale", "Concurrency grows automatically within account/service quotas.", []string{"scale"}}}
		spec.Failures = []Failure{{"cold", "Cold-start / concurrency spike", "Latency rises or provider concurrency quota is exhausted.", "Use provisioned/minimum concurrency where justified, optimize initialization, queue bursty work, and monitor quotas.", []string{"runtime"}}}
		spec.Tradeoffs = []string{"Serverless reduces server operations and fits bursty/event workloads, but has runtime limits, cold starts, quotas, and potentially higher sustained unit cost."}
	case FamilyCloudStorage:
		spec.Steps = []Step{{"Write data", "The workload selects object, block, or file semantics based on access pattern.", []string{"write"}}, {"Replicate / persist", "The platform protects data across its durability domain.", []string{"durable"}}, {"Lifecycle", "Older data moves to cheaper tiers or expires according to policy.", []string{"archive"}}, {"Restore / access", "Retrieval latency/cost depends on the selected storage class and consistency semantics.", []string{"read"}}}
		spec.Failures = []Failure{{"public", "Accidental public exposure", "Misconfiguration exposes sensitive objects/data.", "Deny public access by default, use least privilege, policy-as-code, encryption, and audit alerts.", []string{"write"}}}
		spec.Tradeoffs = []string{"Object storage provides cheap durable scale but different latency/semantics from block or POSIX-like file systems."}
	case FamilyCloudCost:
		spec.Steps = []Step{{"Measure usage", "Tag/attribute compute, storage, requests, and network usage to owner/tenant/product.", []string{"usage"}}, {"Normalize unit cost", "Convert provider bills into meaningful units such as cost/request or cost/tenant.", []string{"unit"}}, {"Detect waste/anomaly", "Rightsizing and anomaly signals reveal inefficient or unexpected spend.", []string{"anomaly"}}, {"Choose trade-off", "Architecture changes are judged against reliability/performance/product value.", []string{"decision"}}}
		spec.Failures = []Failure{{"egress", "Unexpected egress cost", "Cross-region/provider traffic grows with scale and dominates unit economics.", "Measure bytes by path, keep chatty data local, compress/cache, and include egress in design reviews.", []string{"anomaly"}}}
		spec.Tradeoffs = []string{"Cheapest infrastructure is not always the lowest total cost once operations/reliability/developer time are included."}
	case FamilyDelivery:
		spec.Steps = []Step{{"Declare", "Infrastructure/application desired state is versioned as code.", []string{"git"}}, {"Plan/test", "CI validates policy, dependencies, tests, and proposed changes.", []string{"plan"}}, {"Apply progressively", "Changes roll out through controlled environments/canaries/blue-green stages.", []string{"deploy"}}, {"Observe/rollback", "Telemetry validates the change and rollback restores a known-safe state when needed.", []string{"observe"}}}
		spec.Failures = []Failure{{"drift", "Configuration drift", "Manual changes diverge production from version-controlled intent.", "Restrict console mutation, detect drift, and reconcile through the delivery pipeline.", []string{"deploy"}}}
		spec.Tradeoffs = []string{"Automation improves repeatability and auditability but requires safe state/locking/rollout design for infrastructure changes."}
	case FamilyRAGIngest:
		spec.Steps = []Step{{"Read source", "Connectors fetch canonical documents plus permissions/version metadata.", []string{"source"}}, {"Parse + chunk", "Structure is preserved and content is split into retrieval units.", []string{"chunk"}}, {"Embed", "Versioned embedding workers batch and deduplicate chunk work.", []string{"embed"}}, {"Index", "Vector/lexical index stores content references, metadata filters, and ACL data.", []string{"index"}}, {"Update/delete", "Lineage makes freshness and deletion propagate through derived artifacts.", []string{"lineage"}}}
		spec.Failures = []Failure{{"stale", "Stale index", "Changed documents are not reflected in retrieval within the freshness SLO.", "Track source/index versions, incremental sync checkpoints, retries, and freshness metrics.", []string{"index"}}, {"delete", "Incomplete deletion", "Raw content is deleted but chunks/embeddings/cache still expose derived data.", "Maintain document→chunk→embedding→index lineage and test deletion end-to-end.", []string{"lineage"}}}
		spec.Tradeoffs = []string{"Small chunks improve retrieval precision but lose context; large chunks preserve context but add noise/token cost.", "Shared indexes are cheaper but require strict tenant/ACL filtering."}
	case FamilyRAGQuery:
		spec.Steps = []Step{{"Question + identity", "The query enters with authenticated user/tenant context.", []string{"user"}}, {"Understand / rewrite", "The system may normalize or expand the query while preserving intent.", []string{"query"}}, {"Retrieve with filters", "Hybrid/vector/keyword retrieval executes inside deterministic authorization filters.", []string{"retrieve"}}, {"Rerank + build context", "A bounded candidate set is reranked and assembled under a token budget.", []string{"context"}}, {"Generate + validate citations", "The LLM answers using supplied context and citations are checked against retrieved sources.", []string{"llm", "cite"}}}
		spec.Failures = []Failure{{"acl", "ACL filter failure", "Unauthorized cross-tenant content can enter model context.", "Enforce authorization before/inside retrieval, deny by default, and audit retrieval decisions independently of the model.", []string{"retrieve"}}, {"hallucination", "Insufficient evidence", "The model produces a confident answer despite weak/missing retrieval.", "Evaluate retrieval separately, allow explicit insufficient-evidence responses, rerank, and validate citations.", []string{"llm"}}}
		spec.Tradeoffs = []string{"Reranking usually improves relevance but adds model latency/cost.", "More context can improve coverage but also adds noise and token cost; retrieval quality matters more than simply using a vector database."}
	case FamilyRetrieval:
		spec.Steps = []Step{{"Candidate generation", "Lexical and/or vector search produce a broader candidate set.", []string{"query", "candidates"}}, {"Metadata filter", "Tenant, permission, freshness, and product filters reduce the set deterministically.", []string{"filter"}}, {"Rerank", "A stronger scorer reorders a bounded candidate set.", []string{"rerank"}}, {"Top-k context", "Only the highest-value unique context is sent downstream.", []string{"topk"}}}
		spec.Failures = []Failure{{"wrong-metric", "Poor retrieval metric/index tuning", "Semantically relevant chunks rank below irrelevant ones.", "Measure recall@k/MRR/nDCG on a representative eval set and tune embedding/index/filter/reranker jointly.", []string{"candidates"}}}
		spec.Tradeoffs = []string{"Vector retrieval captures semantics while lexical/BM25 excels at exact IDs, names, codes, and terms; hybrid search combines both at extra complexity.", "Higher candidate counts improve recall but increase latency and reranking cost."}
	case FamilyAgent:
		spec.Steps = []Step{{"Goal + state", "The orchestrator stores task state and hard limits for steps/time/cost.", []string{"goal", "state"}}, {"Model proposes action", "The model plans/selects a structured tool call but does not authorize itself.", []string{"model"}}, {"Policy validates", "Allowlist, schema, identity, tenant permissions, risk, and budgets are checked deterministically.", []string{"policy"}}, {"Tool executes", "A gateway uses scoped credentials, timeout, and idempotency rules.", []string{"tool"}}, {"Observe / loop / finish", "Results update state; the loop continues only within termination and budget rules.", []string{"observe"}}}
		spec.Failures = []Failure{{"loop", "Runaway agent loop", "The agent consumes time/tokens and repeats actions without convergence.", "Hard max steps/deadline/cost, repeated-action detection, and explicit termination conditions.", []string{"state", "model"}}, {"duplicate", "Duplicate side-effecting tool call", "An ambiguous retry repeats an irreversible action.", "Stable idempotency keys, operation-status lookup, tool-side dedupe, and human approval for high-risk actions.", []string{"tool"}}}
		spec.Tradeoffs = []string{"More autonomy improves capability but increases safety, cost, and debugging complexity.", "Human approval reduces risk for irreversible actions but adds latency and workflow friction."}
	case FamilySafety:
		spec.Steps = []Step{{"Untrusted input/content", "Prompts, retrieved documents, and tool output are treated as untrusted data.", []string{"untrusted"}}, {"Deterministic policy boundary", "Authorization, schema validation, data classification, and tool permissions execute outside the model.", []string{"policy"}}, {"Model reasoning", "The probabilistic model can interpret/generate but cannot bypass deterministic controls.", []string{"model"}}, {"Tool / output guard", "High-risk actions may require approval and outputs are validated/audited.", []string{"guard"}}}
		spec.Failures = []Failure{{"injection", "Prompt injection", "Malicious content attempts to override instructions or trigger unauthorized tools/data access.", "Isolate tool permissions, do not expose secrets in prompts, enforce policy outside the model, validate outputs, and use human approval for high-risk actions.", []string{"untrusted", "policy"}}}
		spec.Tradeoffs = []string{"Safety is an architecture property spanning data, tools, permissions, workflow, human approval, and audit—not only a final text filter."}
	case FamilyModelGateway:
		spec.Steps = []Step{{"Authenticate workload", "Applications use one governed enterprise endpoint and workload identity.", []string{"apps", "gateway"}}, {"Apply policy + quotas", "Data class, tenant quota, approved models/regions, and privacy restrictions are checked before routing.", []string{"policy"}}, {"Route", "Capability, latency, health, cost, region, and quality choose among approved providers/models.", []string{"router"}}, {"Fallback", "A failure can route elsewhere only if privacy and quality policy allow it.", []string{"providers"}}, {"Account", "Token/cost/latency/quality are attributed to the tenant/application and model version.", []string{"obs"}}}
		spec.Failures = []Failure{{"provider", "Provider outage", "Requests timeout/error and naive retries increase latency/cost.", "Circuit-break the provider and fail over only to policy-approved alternatives; measure quality/privacy differences.", []string{"p1"}}, {"quota", "Provider quota exhausted", "One application can starve organization-wide model capacity.", "Enforce tenant/model/provider quotas and route/admit work according to priority.", []string{"gateway"}}}
		spec.Tradeoffs = []string{"Central gateways improve governance and portability but can become a platform bottleneck if they hide product-specific needs.", "Fallback models improve availability but may change quality, privacy, latency, and cost."}
	case FamilyEvalCost:
		spec.Steps = []Step{{"Version change", "A model/prompt/retriever/tool change creates a candidate behavior.", []string{"change"}}, {"Offline eval", "Golden/task datasets measure correctness, retrieval, safety, and regressions.", []string{"offline"}}, {"Online metrics", "Latency, tokens, cost, user/task success, and incidents are observed in production.", []string{"online"}}, {"Gate / rollback", "Thresholds decide promotion, continued rollout, or rollback.", []string{"gate"}}}
		spec.Failures = []Failure{{"quality", "Quality regression hidden by aggregate metrics", "A cheaper/faster route damages an important slice of tasks.", "Use representative sliced evals, explicit owners/thresholds, and compare quality-cost-latency together.", []string{"offline", "online"}}}
		spec.Tradeoffs = []string{"Evaluation infrastructure is the portability layer that lets models/prompts/retrievers change safely.", "Lower model cost is not a win if quality loss increases human rework or product failure."}
	case FamilyInference:
		spec.Steps = []Step{{"Queue requests", "A scheduler groups compatible requests under latency/concurrency limits.", []string{"queue"}}, {"Batch", "Continuous/static batching improves GPU utilization while respecting per-request deadlines.", []string{"batch"}}, {"Model execution", "Weights, KV cache, quantization, and parallelism determine memory/throughput behavior.", []string{"gpu"}}, {"Stream tokens", "Decoded tokens stream to clients while cancellation frees capacity.", []string{"stream"}}}
		spec.Failures = []Failure{{"oom", "GPU OOM", "Large context/batch/KV cache exhausts device memory and drops capacity.", "Enforce context/output limits, admission control, memory-aware scheduling, smaller batches/quantization, and safe overflow routing.", []string{"gpu"}}}
		spec.Tradeoffs = []string{"Bigger batches improve throughput/utilization but can hurt tail latency.", "Self-hosting trades provider API cost/constraints for GPU scheduling, capacity, reliability, and model-serving operations."}
	case FamilyFineTune:
		spec.Steps = []Step{{"Curate/version data", "Training examples are cleaned, permissioned, versioned, and split for evaluation.", []string{"data"}}, {"Train adapter/model", "SFT/PEFT/LoRA or other optimization updates selected parameters.", []string{"train"}}, {"Evaluate", "Quality, safety, latency, and regression tests compare against the baseline.", []string{"eval"}}, {"Register/deploy", "Artifacts, dataset, hyperparameters, and model lineage are registered before controlled rollout.", []string{"registry"}}}
		spec.Failures = []Failure{{"overfit", "Overfit / regression", "Fine-tuning improves one slice while degrading general capability or safety.", "Use held-out/sliced evaluations, baseline comparisons, rollback, and only fine-tune when the task/data justify it over prompting/RAG.", []string{"eval"}}}
		spec.Tradeoffs = []string{"RAG changes knowledge at query time; fine-tuning changes model behavior. They solve different problems and can be combined."}
	case FamilyMemory:
		spec.Steps = []Step{{"Conversation event", "Messages/tool results update short-term task state.", []string{"recent"}}, {"Select durable memory", "Policy decides which facts/preferences deserve longer retention.", []string{"select"}}, {"Index/store", "Durable memory is versioned with user/tenant isolation and lifecycle controls.", []string{"store"}}, {"Retrieve", "Relevance, recency, importance, or explicit keys choose memory for a future task.", []string{"retrieve"}}, {"Delete/expire", "Retention and user/policy deletion remove durable and derived memory.", []string{"delete"}}}
		spec.Failures = []Failure{{"bad-memory", "Incorrect summary becomes durable", "A mistaken compressed memory repeatedly biases future behavior.", "Keep source lineage when policy permits, version memories, allow correction/deletion, and evaluate whether retrieval actually helps.", []string{"store"}}}
		spec.Tradeoffs = []string{"Memory improves continuity but creates a sensitive data system with consent, retention, deletion, isolation, and audit requirements."}
	case FamilyMultimodal:
		spec.Steps = []Step{{"Ingest modalities", "Text, image, audio, video, or documents enter modality-specific preprocessors.", []string{"input"}}, {"Encode / extract", "Models convert content into representations/transcripts/features with provenance.", []string{"encode"}}, {"Fuse context", "A multimodal model or orchestrator combines the relevant signals.", []string{"fuse"}}, {"Generate / act", "The system produces text/media/structured output under safety and latency limits.", []string{"output"}}}
		spec.Failures = []Failure{{"mismatch", "Modality extraction error", "OCR/transcription/vision mistakes contaminate downstream reasoning.", "Preserve original source/provenance, expose confidence, validate critical fields, and use human review where risk is high.", []string{"encode"}}}
		spec.Tradeoffs = []string{"Multimodal systems improve coverage of real-world data but multiply model cost, preprocessing errors, storage, privacy, and evaluation complexity."}
	case FamilyPromptFlow:
		spec.Steps = []Step{{"System policy", "Stable product/system instructions define behavior and constraints.", []string{"system"}}, {"User input", "Untrusted user content is clearly separated from privileged instructions.", []string{"user"}}, {"Structured tool/output contract", "Schemas constrain tool arguments or machine-readable output.", []string{"schema"}}, {"Version + evaluate", "Prompt/model/tool versions are recorded so behavior can be tested and reproduced.", []string{"version"}}}
		spec.Failures = []Failure{{"drift", "Prompt/model behavior drift", "A model upgrade changes output even when the prompt text is unchanged.", "Version prompts and models together, maintain eval suites, and gate changes through regression tests.", []string{"version"}}}
		spec.Tradeoffs = []string{"Prompt engineering is fast and reversible but model-specific behavior can make portability fragile without evaluation."}
	default:
		spec.Steps = genericSteps(topic)
		spec.Failures = []Failure{{"failure", "Production failure / overload", "A dependency, assumption, or capacity boundary fails under real load.", "Use the source section's stated failure modes and trade-offs; add observability, bounded retries/timeouts, and recovery ownership appropriate to the component.", []string{"step2"}}}
		spec.Tradeoffs = genericTradeoffs(topic)
	}

	if len(spec.Steps) == 0 {
		spec.Steps = genericSteps(topic)
	}
	return spec
}

func sourceInspector(topic Topic) []string {
	out := make([]string, 0, 6)
	if topic.Summary != "" {
		out = append(out, topic.Summary)
	}
	for _, point := range topic.KeyPoints {
		point = strings.TrimSpace(point)
		if point != "" {
			out = append(out, point)
		}
		if len(out) >= 6 {
			break
		}
	}
	return out
}

func genericSteps(topic Topic) []Step {
	items := topic.Subtopics
	if len(items) == 0 {
		items = topic.KeyPoints
	}
	if len(items) == 0 {
		items = []string{"Input / requirement", "Core mechanism", "State / dependency", "Failure / recovery", "Operational trade-off"}
	}
	limit := 5
	if len(items) < limit {
		limit = len(items)
	}
	steps := make([]Step, 0, limit)
	for i := 0; i < limit; i++ {
		steps = append(steps, Step{Title: items[i], Description: "This stage is taken from the supplied topic structure. Use Source notes for the full source wording and constraints.", Active: []string{"step" + string(rune('1'+i))}})
	}
	return steps
}

func genericTradeoffs(topic Topic) []string {
	out := make([]string, 0, 4)
	for _, p := range topic.KeyPoints {
		l := strings.ToLower(p)
		if strings.Contains(l, "trade") || strings.Contains(l, "cost") || strings.Contains(l, "risk") || strings.Contains(l, "failure") || strings.Contains(l, "latency") || strings.Contains(l, "consistency") {
			out = append(out, p)
		}
		if len(out) >= 4 {
			break
		}
	}
	if len(out) == 0 {
		out = []string{"Use the source notes to evaluate correctness, scale, failure behavior, operational burden, and cost before choosing this mechanism.", "Prefer the simplest design that satisfies the stated requirements; add distributed complexity only when a measured requirement forces it."}
	}
	return out
}
