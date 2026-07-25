package kafka

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"algo-visualizer/api/internal/models"

	"github.com/segmentio/kafka-go"
)

// ResultHandler is called for each result message consumed from Kafka.
type ResultHandler func(result *models.Result)

// Consumer reads from the visualize-results topic and dispatches results.
type Consumer struct {
	reader  *kafka.Reader
	handler ResultHandler
}

// NewConsumer creates a consumer for the given topic and group.
func NewConsumer(brokers []string, topic, groupID string, handler ResultHandler) *Consumer {
	r := kafka.NewReader(kafka.ReaderConfig{
		Brokers:        brokers,
		Topic:          topic,
		GroupID:        groupID,
		MinBytes:       1,
		MaxBytes:       10 << 20, // 10 MB
		CommitInterval: time.Second,
		StartOffset:    kafka.LastOffset,
	})
	return &Consumer{reader: r, handler: handler}
}

// Run blocks, reading messages until ctx is cancelled.
func (c *Consumer) Run(ctx context.Context) {
	for {
		msg, err := c.reader.FetchMessage(ctx)
		if err != nil {
			if ctx.Err() != nil {
				return // graceful shutdown
			}
			log.Printf("kafka consumer: fetch error: %v", err)
			time.Sleep(time.Second)
			continue
		}

		var result models.Result
		if err := json.Unmarshal(msg.Value, &result); err != nil {
			log.Printf("kafka consumer: unmarshal error: %v — skipping", err)
		} else {
			c.handler(&result)
		}

		if err := c.reader.CommitMessages(ctx, msg); err != nil {
			log.Printf("kafka consumer: commit error: %v", err)
		}
	}
}

// Close shuts down the reader.
func (c *Consumer) Close() error {
	return c.reader.Close()
}

// MockConsumer is used in tests / dev mode when Kafka is not available.
type MockConsumer struct{}

func (m *MockConsumer) Run(_ context.Context) {}
func (m *MockConsumer) Close() error          { return nil }

// resultKey formats: "result:job:<id>"
func resultJobKey(jobID string) string {
	return fmt.Sprintf("result:job:%s", jobID)
}
