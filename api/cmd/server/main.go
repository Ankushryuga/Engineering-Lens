package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"syscall"
	"time"

	"algo-visualizer/api/internal/handlers"
	"algo-visualizer/api/internal/kafka"
	"algo-visualizer/api/internal/middleware"
	"algo-visualizer/api/internal/models"
	"algo-visualizer/api/internal/postgres"
	redisclient "algo-visualizer/api/internal/redis"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	// ── Config from environment ──────────────────────────────────────────────
	port := getEnv("PORT", "8080")
	postgresDSN := mustEnv("POSTGRES_DSN")
	redisAddr := getEnv("REDIS_ADDR", "localhost:6379")
	redisPassword := getEnv("REDIS_PASSWORD", "")
	kafkaBrokers := splitEnvList(getEnv("KAFKA_BROKERS", "localhost:29092"))
	jobsTopic := getEnv("KAFKA_JOBS_TOPIC", "visualize-jobs")
	resultsTopic := getEnv("KAFKA_RESULTS_TOPIC", "visualize-results")
	corsOrigins := splitEnvList(getEnv("CORS_ORIGINS", "http://localhost:5173"))
	rateLimitRPS := getEnvFloat("RATE_LIMIT_RPS", 10)
	jobTimeout := time.Duration(getEnvFloat("JOB_TIMEOUT_SECONDS", 30) * float64(time.Second))

	// ── Postgres ─────────────────────────────────────────────────────────────
	log.Println("connecting to postgres...")
	db, err := postgres.New(ctx, postgresDSN)
	if err != nil {
		log.Fatalf("postgres: %v", err)
	}
	defer db.Close()
	log.Println("postgres: connected")

	// ── Redis ─────────────────────────────────────────────────────────────────
	log.Println("connecting to redis...")
	rdb := redisclient.New(redisAddr, redisPassword)
	if err := rdb.Ping(ctx); err != nil {
		log.Fatalf("redis: %v", err)
	}
	defer rdb.Close()
	log.Println("redis: connected")

	// ── Kafka: ensure topics exist ────────────────────────────────────────────
	log.Println("ensuring kafka topics...")
	for _, topic := range []string{jobsTopic, resultsTopic} {
		if err := kafka.EnsureTopic(kafkaBrokers[0], topic, 5); err != nil {
			log.Printf("kafka: warn: ensure topic %q: %v", topic, err)
		}
	}

	// ── Kafka producer ────────────────────────────────────────────────────────
	producer := kafka.NewProducer(kafkaBrokers, jobsTopic)
	defer producer.Close()

	// ── Handlers ──────────────────────────────────────────────────────────────
	vh := handlers.NewVisualizeHandler(producer, rdb, jobTimeout)
	wsh := handlers.NewWSHandler(vh, rdb, corsOrigins, jobTimeout)
	th := handlers.NewTemplatesHandler(db)

	// ── Kafka consumer (results) ──────────────────────────────────────────────
	resultConsumer := kafka.NewConsumer(
		kafkaBrokers,
		resultsTopic,
		"api-result-consumer",
		func(result *models.Result) {
			log.Printf("result received: job=%s lang=%s steps=%d dur=%.1fms",
				result.JobID, result.Language, len(result.Steps), result.DurationMS)

			// Cache by submission hash and job ID. The hash is internal routing/cache
			// metadata, so remove it before the result is pushed to clients.
			if err := rdb.SetResult(ctx, result.Hash, result.JobID, result); err != nil {
				log.Printf("redis: failed to cache result for job %s: %v", result.JobID, err)
			}
			result.Hash = ""

			// Notify in-flight WebSocket / long-poll waiters.
			vh.NotifyResult(result)
		},
	)
	defer resultConsumer.Close()
	go resultConsumer.Run(ctx)

	// ── Router ────────────────────────────────────────────────────────────────
	r := chi.NewRouter()
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.Timeout(jobTimeout + 5*time.Second))
	r.Use(middleware.CORS(corsOrigins))

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprint(w, `{"status":"ok"}`)
	})

	// API v1
	r.Route("/api/v1", func(r chi.Router) {
		r.Use(middleware.RateLimit(rateLimitRPS))

		r.Post("/visualize", vh.HandleVisualize)
		r.Get("/visualize/{job_id}", vh.HandleStatus)

		r.Get("/templates", th.HandleList)
		r.Get("/templates/{id}/solution", th.HandleSolution)
	})

	// WebSocket
	r.With(middleware.RateLimit(rateLimitRPS)).Get("/ws/{job_id}", wsh.HandleWS)

	// ── HTTP server ───────────────────────────────────────────────────────────
	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 90 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	go func() {
		log.Printf("API listening on :%s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server: %v", err)
		}
	}()

	<-ctx.Done()
	log.Println("shutting down...")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = srv.Shutdown(shutdownCtx)
	log.Println("goodbye")
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func mustEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		log.Fatalf("required environment variable %q is not set", key)
	}
	return v
}

func getEnvFloat(key string, fallback float64) float64 {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	parsed, err := strconv.ParseFloat(v, 64)
	if err != nil || parsed <= 0 {
		log.Printf("invalid %s=%q; using %.1f", key, v, fallback)
		return fallback
	}
	return parsed
}

func splitEnvList(value string) []string {
	parts := strings.Split(value, ",")
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part != "" {
			out = append(out, part)
		}
	}
	return out
}
