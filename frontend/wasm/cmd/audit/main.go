package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"sort"

	"engineering-lens/systemdesign/internal/engine"
)

func main() {
	path := flag.String("file", "../public/system-design-topics.json", "topic JSON")
	flag.Parse()
	data, err := os.ReadFile(*path)
	if err != nil {
		panic(err)
	}
	var payload engine.TopicPayload
	if err := json.Unmarshal(data, &payload); err != nil {
		panic(err)
	}
	counts := map[engine.Family]int{}
	byDomain := map[string]int{}
	invalidReferenceOnly := []string{}
	for _, topic := range payload.Topics {
		if engine.ReferenceOnlyTitle(topic.Title) {
			invalidReferenceOnly = append(invalidReferenceOnly, topic.Title)
		}
		counts[engine.Classify(topic)]++
		byDomain[topic.Domain]++
	}
	if len(invalidReferenceOnly) > 0 {
		fmt.Fprintln(os.Stderr, "reference-only sections leaked into visualization dataset:")
		for _, title := range invalidReferenceOnly {
			fmt.Fprintln(os.Stderr, " -", title)
		}
		os.Exit(2)
	}
	families := make([]string, 0, len(counts))
	for family := range counts {
		families = append(families, string(family))
	}
	sort.Strings(families)
	fmt.Printf("topics=%d referenceOnly=%d sourceSections=%d domains=%v families=%d\n", len(payload.Topics), payload.Totals["referenceOnly"], payload.Totals["sourceSections"], byDomain, len(families))
	for _, family := range families {
		fmt.Printf("%-22s %d\n", family, counts[engine.Family(family)])
	}
}
