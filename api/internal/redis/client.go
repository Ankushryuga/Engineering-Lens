package redisclient

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"algo-visualizer/api/internal/models"

	"github.com/redis/go-redis/v9"
)

const resultTTL = 24 * time.Hour

// Client wraps a Redis connection.
type Client struct {
	rdb *redis.Client
}

// New creates a Redis client.
func New(addr, password string) *Client {
	rdb := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: password,
		DB:       0,
	})
	return &Client{rdb: rdb}
}

// Ping checks connectivity.
func (c *Client) Ping(ctx context.Context) error {
	return c.rdb.Ping(ctx).Err()
}

// GetResult fetches a cached result by its hash key.
func (c *Client) GetResult(ctx context.Context, hash string) (*models.Result, error) {
	val, err := c.rdb.Get(ctx, resultKey(hash)).Bytes()
	if err == redis.Nil {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("redis: get result: %w", err)
	}
	var r models.Result
	if err := json.Unmarshal(val, &r); err != nil {
		return nil, fmt.Errorf("redis: unmarshal result: %w", err)
	}
	return &r, nil
}

// SetResult stores a result in Redis keyed by hash and job_id.
func (c *Client) SetResult(ctx context.Context, hash, jobID string, r *models.Result) error {
	stored := *r
	stored.Hash = ""
	data, err := json.Marshal(&stored)
	if err != nil {
		return fmt.Errorf("redis: marshal result: %w", err)
	}
	pipe := c.rdb.Pipeline()
	if hash != "" {
		pipe.Set(ctx, resultKey(hash), data, resultTTL)
	}
	pipe.Set(ctx, jobKey(jobID), data, resultTTL)
	_, err = pipe.Exec(ctx)
	return err
}

// GetResultByJobID fetches a result by job_id.
func (c *Client) GetResultByJobID(ctx context.Context, jobID string) (*models.Result, error) {
	val, err := c.rdb.Get(ctx, jobKey(jobID)).Bytes()
	if err == redis.Nil {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("redis: get result by job_id: %w", err)
	}
	var r models.Result
	if err := json.Unmarshal(val, &r); err != nil {
		return nil, fmt.Errorf("redis: unmarshal result: %w", err)
	}
	return &r, nil
}

// Close closes the Redis connection.
func (c *Client) Close() error {
	return c.rdb.Close()
}

func resultKey(hash string) string { return "result:hash:" + hash }
func jobKey(jobID string) string   { return "result:job:" + jobID }
