package engine

import "testing"

func TestReferenceOnlyTitleExcludesLearningAndNavigationSections(t *testing.T) {
	tests := []string{
		"1. How to Use This Handbook",
		"1. How to Use This Guide",
		"96. Senior-Level Expectations",
		"97. Staff-Level Expectations",
		"98. Backend Design Exercises",
		"99. Backend Mastery Checklist",
		"100. Suggested Learning Path",
		"54. Production Readiness Checklist",
		"55. Learning Roadmap",
		"56. Practice Questions",
		"57. Final Mental Models",
		"Appendix T — Backend Design Review Questions",
		"Appendix CD — Staff-Level Design Document Template",
		"Appendix A — Cloud Resource Scope Cheat Sheet",
		"Appendix ED — RAG Review Checklist",
		"Final Mastery Challenge",
		"Closing",
		"End",
	}
	for _, title := range tests {
		if !ReferenceOnlyTitle(title) {
			t.Fatalf("ReferenceOnlyTitle(%q)=false, want true", title)
		}
	}
}

func TestReferenceOnlyTitleKeepsTechnicalSystemDesignTopics(t *testing.T) {
	tests := []string{
		"2. What a Backend System Actually Is",
		"9. Query Execution and Optimization",
		"15. MVCC",
		"40. Kafka",
		"64. Rate Limiting",
		"95. System Design Interview Framework",
		"104. Multi-Region Architecture",
		"43. Kubernetes",
		"Appendix Q — Global and Secondary Indexes in Sharded Systems",
		"Appendix M — NAT Port Exhaustion",
		"23. RAG High-Level Architecture",
		"60. Agent Loop",
		"Appendix R — Tool-Calling State Machine",
		"Appendix FI — AI Gateway as Policy Enforcement Point",
	}
	for _, title := range tests {
		if ReferenceOnlyTitle(title) {
			t.Fatalf("ReferenceOnlyTitle(%q)=true, want false", title)
		}
	}
}
