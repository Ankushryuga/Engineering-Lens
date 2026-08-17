package engine

import "strings"

type Family string

const (
	FamilyQueryPlan      Family = "query-plan"
	FamilyBTree          Family = "btree"
	FamilyMVCC           Family = "mvcc"
	FamilyDeadlock       Family = "deadlock"
	FamilyReplication    Family = "replication"
	FamilySharding       Family = "sharding"
	FamilyOutboxCDC      Family = "outbox-cdc"
	FamilyDBStorage      Family = "db-storage"
	FamilyDBBackup       Family = "db-backup"
	FamilyTransaction    Family = "transaction"
	FamilyRequestFlow    Family = "request-flow"
	FamilyCache          Family = "cache"
	FamilyQueue          Family = "queue"
	FamilyResilience     Family = "resilience"
	FamilyRateLimiter    Family = "rate-limiter"
	FamilySaga           Family = "saga"
	FamilyCQRS           Family = "cqrs"
	FamilyAuth           Family = "auth"
	FamilyRealtime       Family = "realtime"
	FamilyNetwork        Family = "network"
	FamilyMultiAZ        Family = "multi-az"
	FamilyMultiRegion    Family = "multi-region"
	FamilyIAM            Family = "iam"
	FamilyKubernetes     Family = "kubernetes"
	FamilyAutoscale      Family = "autoscale"
	FamilyCloudBackup    Family = "cloud-backup"
	FamilyServiceMesh    Family = "service-mesh"
	FamilyServerless     Family = "serverless"
	FamilyCloudStorage   Family = "cloud-storage"
	FamilyCloudCost      Family = "cloud-cost"
	FamilyDelivery       Family = "delivery"
	FamilyRAGIngest      Family = "rag-ingest"
	FamilyRAGQuery       Family = "rag-query"
	FamilyRetrieval      Family = "retrieval"
	FamilyAgent          Family = "agent"
	FamilySafety         Family = "safety"
	FamilyModelGateway   Family = "model-gateway"
	FamilyEvalCost       Family = "eval-cost"
	FamilyInference      Family = "inference"
	FamilyFineTune       Family = "fine-tune"
	FamilyMemory         Family = "memory"
	FamilyMultimodal     Family = "multimodal"
	FamilyPromptFlow     Family = "prompt-flow"
	FamilyStructuredFlow Family = "structured-flow"
)

func Classify(topic Topic) Family {
	s := strings.ToLower(strings.Join([]string{topic.Title, topic.Summary, strings.Join(topic.Tags, " "), strings.Join(topic.Subtopics, " "), topic.Markdown}, " "))
	has := func(words ...string) bool {
		for _, word := range words {
			if strings.Contains(s, word) {
				return true
			}
		}
		return false
	}

	switch topic.Domain {
	case "database":
		switch {
		case has("query execution", "query optimization", "execution plan", "sequential scan", "index scan", "index-only scan", "nested loop", "hash join", "merge join", "explain plan", "n+1"):
			return FamilyQueryPlan
		case has("b-tree", "b+ tree", "covering index", "composite index", "unique index", "partial index", "indexes"):
			return FamilyBTree
		case has("mvcc", "isolation level", "snapshot isolation", "dirty read", "non-repeatable", "phantom", "lost update", "concurrency control"):
			return FamilyMVCC
		case has("deadlock", "locks, deadlocks", "pessimistic locking", "optimistic locking", "lock contention"):
			return FamilyDeadlock
		case has("replication", "read replica", "primary replica", "leader election", "replica lag"):
			return FamilyReplication
		case has("shard", "partitioning", "partition key", "consistent hashing", "hot partition", "rebalancing", "global secondary index", "cross-shard"):
			return FamilySharding
		case has("outbox", "change data capture", " cdc", "exactly-once", "idempotency"):
			return FamilyOutboxCDC
		case has("storage internals", "lsm", "sstable", "write-ahead log", "wal", "storage engine", "heap storage", "append-only"):
			return FamilyDBStorage
		case has("backup", "restore", "disaster recovery", "point-in-time recovery"):
			return FamilyDBBackup
		case has("transaction", "acid", "2pc", "two-phase commit", "distributed transaction"):
			return FamilyTransaction
		}
	case "backend":
		switch {
		case has("rate limiting", "token bucket", "leaky bucket", "sliding window", "fixed window"):
			return FamilyRateLimiter
		case has("circuit breaker", "retry storm", "timeouts", "backpressure", "bulkhead", "load shedding", "resilience engineering"):
			return FamilyResilience
		case has("cache", "redis"):
			return FamilyCache
		case has("kafka", "messaging", "message broker", "queue", "consumer group", "pub/sub", "event-driven"):
			return FamilyQueue
		case has("saga", "distributed transaction"):
			return FamilySaga
		case has("cqrs", "event sourcing"):
			return FamilyCQRS
		case has("oauth", "openid connect", "authentication", "authorization", "jwt", "sessions, cookies", "identity"):
			return FamilyAuth
		case has("websocket", "server-sent events", "sse", "real-time"):
			return FamilyRealtime
		case has("api", "http", "grpc", "graphql", "request", "load balancer", "reverse proxy", "backend system"):
			return FamilyRequestFlow
		}
	case "cloud":
		switch {
		case has("multi-region", "active-active", "active-passive", "regional failover", "failback", "rpo", "rto", "disaster recovery"):
			return FamilyMultiRegion
		case has("multi-az", "availability zone", "fault domain", "high availability"):
			return FamilyMultiAZ
		case has("iam", "federation", "workload identity", "least privilege", "sso", "permission boundary"):
			return FamilyIAM
		case has("kubernetes", "container", "pod", "cluster"):
			return FamilyKubernetes
		case has("autoscaling", "capacity planning", "quota", "performance architecture"):
			return FamilyAutoscale
		case has("backup", "restore"):
			return FamilyCloudBackup
		case has("service mesh", "service discovery", "api gateway", "microservices in the cloud"):
			return FamilyServiceMesh
		case has("serverless", "function as a service", "managed application platform"):
			return FamilyServerless
		case has("object storage", "block storage", "file storage", "storage lifecycle", "data durability"):
			return FamilyCloudStorage
		case has("finops", "cost architecture", "cost allocation", "tagging", "unit economics"):
			return FamilyCloudCost
		case has("terraform", "infrastructure as code", "gitops", "ci/cd", "deployment strateg", "immutable infrastructure"):
			return FamilyDelivery
		case has("vpc", "virtual network", "subnet", "cidr", "routing", "nat", "dns", "load balancing", "cdn", "waf", "firewall", "private endpoint", "zero trust networking", "hybrid connectivity", "peering"):
			return FamilyNetwork
		}
	case "genai":
		switch {
		case has("document ingestion", "parsing and content extraction", "chunking", "embedding pipeline", "rag freshness", "rag deletion", "data lifecycle"):
			return FamilyRAGIngest
		case has("rag high-level architecture", "retrieval-augmented generation", "rag context construction", "citations and grounding", "rag hallucination"):
			return FamilyRAGQuery
		case has("vector search", "ann", "hnsw", "ivf", "similarity metric", "metadata filtering", "hybrid search", "bm25", "reranking", "query rewriting", "query expansion", "multi-query", "parent-child retrieval", "contextual compression"):
			return FamilyRetrieval
		case has("agent", "tool selection", "tool execution", "planning", "human-in-the-loop", "tool protocol"):
			return FamilyAgent
		case has("prompt injection", "guardrail", "jailbreak", "tool abuse", "data exfiltration", "safety", "policy enforcement", "tenant isolation", "pii", "privacy", "audit logging"):
			return FamilySafety
		case has("model gateway", "genai gateway", "model routing", "provider abstraction", "multi-model", "multi-provider", "centralized model access", "model catalog"):
			return FamilyModelGateway
		case has("evaluation", "observability", "token metrics", "quality metrics", "cost attribution", "cost architecture", "cost optimization", "latency evaluation", "llm-as-a-judge", "golden dataset"):
			return FamilyEvalCost
		case has("inference", "gpu", "quantization", "batching", "kv cache", "speculative decoding", "tensor parallel", "pipeline parallel", "model serving", "model parallelism"):
			return FamilyInference
		case has("fine-tuning", "supervised fine-tuning", "lora", "peft", "preference optimization", "distillation", "training data", "synthetic data", "dataset versioning"):
			return FamilyFineTune
		case has("conversation state", "short-term memory", "long-term memory", "memory retrieval", "memory summarization", "memory safety"):
			return FamilyMemory
		case has("multimodal", "vision-language", "speech system", "image generation", "video generation", "document ai"):
			return FamilyMultimodal
		case has("prompt engineering", "system prompt", "structured outputs", "function calling", "prompt template", "prompt version"):
			return FamilyPromptFlow
		}
	}

	return FamilyStructuredFlow
}

func FamilyLabel(f Family) string {
	labels := map[Family]string{
		FamilyQueryPlan: "Execution plan tree", FamilyBTree: "B-Tree / index", FamilyMVCC: "MVCC timeline", FamilyDeadlock: "Lock wait graph",
		FamilyReplication: "Replication flow", FamilySharding: "Shard routing", FamilyOutboxCDC: "Outbox + CDC", FamilyDBStorage: "Storage engine", FamilyDBBackup: "Backup / recovery", FamilyTransaction: "Transaction boundary",
		FamilyRequestFlow: "Request sequence", FamilyCache: "Cache behavior", FamilyQueue: "Queue / stream", FamilyResilience: "Retry + circuit breaker", FamilyRateLimiter: "Rate limiter", FamilySaga: "Saga workflow", FamilyCQRS: "CQRS / event sourcing", FamilyAuth: "Auth trust flow", FamilyRealtime: "Realtime connection",
		FamilyNetwork: "Cloud network topology", FamilyMultiAZ: "Multi-AZ topology", FamilyMultiRegion: "Multi-region failover", FamilyIAM: "IAM trust chain", FamilyKubernetes: "Kubernetes topology", FamilyAutoscale: "Autoscaling simulation", FamilyCloudBackup: "Cloud backup / restore", FamilyServiceMesh: "Service mesh traffic", FamilyServerless: "Serverless event flow", FamilyCloudStorage: "Cloud storage lifecycle", FamilyCloudCost: "Cloud cost model", FamilyDelivery: "IaC delivery pipeline",
		FamilyRAGIngest: "RAG ingestion", FamilyRAGQuery: "RAG query pipeline", FamilyRetrieval: "Retrieval ranking", FamilyAgent: "Agent loop", FamilySafety: "Safety boundary", FamilyModelGateway: "Model gateway", FamilyEvalCost: "Evaluation + cost", FamilyInference: "Inference serving", FamilyFineTune: "Fine-tuning pipeline", FamilyMemory: "AI memory lifecycle", FamilyMultimodal: "Multimodal pipeline", FamilyPromptFlow: "Prompt / tool flow", FamilyStructuredFlow: "Source-derived engineering flow",
	}
	if label, ok := labels[f]; ok {
		return label
	}
	return "Engineering visualization"
}
