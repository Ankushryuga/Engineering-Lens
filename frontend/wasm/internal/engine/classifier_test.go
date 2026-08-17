package engine

import "testing"

func TestClassifyRepresentativeTopics(t *testing.T) {
	tests := []struct {
		topic Topic
		want  Family
	}{
		{Topic{Domain: "database", Title: "9. Query Execution and Optimization", Markdown: "Sequential Scan Nested Loop Join Hash Join Merge Join Statistics Explain Plans"}, FamilyQueryPlan},
		{Topic{Domain: "database", Title: "15. MVCC"}, FamilyMVCC},
		{Topic{Domain: "backend", Title: "64. Rate Limiting"}, FamilyRateLimiter},
		{Topic{Domain: "backend", Title: "40. Kafka"}, FamilyQueue},
		{Topic{Domain: "cloud", Title: "17. Cloud Networking Fundamentals", Markdown: "VPC subnet routing NAT"}, FamilyNetwork},
		{Topic{Domain: "cloud", Title: "104. Multi-Region Architecture"}, FamilyMultiRegion},
		{Topic{Domain: "genai", Title: "23. RAG High-Level Architecture"}, FamilyRAGQuery},
		{Topic{Domain: "genai", Title: "60. Agent Loop"}, FamilyAgent},
		{Topic{Domain: "genai", Title: "203. GenAI Gateways", Markdown: "model gateway provider abstraction model routing"}, FamilyModelGateway},
	}
	for _, tt := range tests {
		if got := Classify(tt.topic); got != tt.want {
			t.Fatalf("Classify(%q)=%q want %q", tt.topic.Title, got, tt.want)
		}
	}
}
