package kafka

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"strconv"
	"time"

	"github.com/segmentio/kafka-go"
)

// Producer publishes messages to a Kafka topic.
type Producer struct {
	writer *kafka.Writer
}

// NewProducer returns a ready producer for the given topic.
func NewProducer(brokers []string, topic string) *Producer {
	w := &kafka.Writer{
		Addr:         kafka.TCP(brokers...),
		Topic:        topic,
		Balancer:     &kafka.LeastBytes{},
		BatchTimeout: 10 * time.Millisecond,
		RequiredAcks: kafka.RequireOne,
		Async:        false,
	}
	return &Producer{writer: w}
}

// Publish serialises v as JSON and sends it with the given key.
func (p *Producer) Publish(ctx context.Context, key string, v interface{}) error {
	data, err := json.Marshal(v)
	if err != nil {
		return fmt.Errorf("kafka producer: marshal: %w", err)
	}
	return p.writer.WriteMessages(ctx, kafka.Message{
		Key:   []byte(key),
		Value: data,
	})
}

// Close flushes and closes the writer.
func (p *Producer) Close() error {
	return p.writer.Close()
}

// EnsureTopic creates the topic if it does not exist.
func EnsureTopic(broker, topic string, partitions int) error {
	conn, err := kafka.Dial("tcp", broker)
	if err != nil {
		return err
	}
	defer conn.Close()

	controller, err := conn.Controller()
	if err != nil {
		return err
	}

	controllerConn, err := kafka.Dial("tcp", net.JoinHostPort(controller.Host, strconv.Itoa(controller.Port)))
	if err != nil {
		return err
	}
	defer controllerConn.Close()

	topicCfg := kafka.TopicConfig{
		Topic:             topic,
		NumPartitions:     partitions,
		ReplicationFactor: 1,
	}
	err = controllerConn.CreateTopics(topicCfg)
	// Ignore "topic already exists" errors
	if err != nil && err.Error() != "kafka server: Topic with this name already exists." {
		return err
	}
	return nil
}
