package handlers

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	"algo-visualizer/api/internal/kafka"
	"algo-visualizer/api/internal/models"
	redisclient "algo-visualizer/api/internal/redis"
	"algo-visualizer/api/internal/validator"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

// VisualizeHandler handles the visualize endpoints and manages in-flight jobs.
type VisualizeHandler struct {
	producer *kafka.Producer
	redis    *redisclient.Client
	timeout  time.Duration

	// waiters maps job_id → channel that receives the Result when ready.
	mu      sync.RWMutex
	waiters map[string][]chan *models.Result
}

// NewVisualizeHandler constructs a VisualizeHandler.
func NewVisualizeHandler(producer *kafka.Producer, rdb *redisclient.Client, timeout time.Duration) *VisualizeHandler {
	return &VisualizeHandler{
		producer: producer,
		redis:    rdb,
		timeout:  timeout,
		waiters:  make(map[string][]chan *models.Result),
	}
}

// NotifyResult is called by the Kafka consumer when a result arrives.
func (h *VisualizeHandler) NotifyResult(result *models.Result) {
	h.mu.Lock()
	chans := h.waiters[result.JobID]
	delete(h.waiters, result.JobID)
	h.mu.Unlock()

	for _, ch := range chans {
		select {
		case ch <- result:
		default:
		}
	}
}

// subscribe registers a channel to be notified when a job completes.
func (h *VisualizeHandler) subscribe(jobID string) chan *models.Result {
	ch := make(chan *models.Result, 1)
	h.mu.Lock()
	h.waiters[jobID] = append(h.waiters[jobID], ch)
	h.mu.Unlock()
	return ch
}

// unsubscribe removes a waiter channel.
func (h *VisualizeHandler) unsubscribe(jobID string, ch chan *models.Result) {
	h.mu.Lock()
	defer h.mu.Unlock()
	chans := h.waiters[jobID]
	for i, c := range chans {
		if c == ch {
			h.waiters[jobID] = append(chans[:i], chans[i+1:]...)
			return
		}
	}
}

// codeHash returns a deterministic cache key for a (code, language) pair.
func codeHash(code string, lang models.Language) string {
	h := sha256.Sum256([]byte(string(lang) + ":" + code))
	return fmt.Sprintf("%x", h)
}

// writeJSON writes a JSON response.
func writeJSON(w http.ResponseWriter, code int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(v)
}

// HandleVisualize handles POST /api/v1/visualize.
func (h *VisualizeHandler) HandleVisualize(w http.ResponseWriter, r *http.Request) {
	var req models.VisualizeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, models.ErrorResponse{Error: "invalid JSON body", Code: 400})
		return
	}

	if err := validator.ValidateRequest(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, models.ErrorResponse{Error: err.Error(), Code: 400})
		return
	}

	hash := codeHash(req.Code, req.Language)

	// Check Redis cache.
	cached, err := h.redis.GetResult(r.Context(), hash)
	if err == nil && cached != nil {
		writeJSON(w, http.StatusOK, models.VisualizeResponse{JobID: cached.JobID, Cached: true})
		return
	}

	jobID := uuid.New().String()
	job := models.Job{
		ID:       jobID,
		Code:     req.Code,
		Language: req.Language,
		Hash:     hash,
	}

	if err := h.producer.Publish(r.Context(), string(req.Language), job); err != nil {
		writeJSON(w, http.StatusInternalServerError, models.ErrorResponse{Error: "failed to enqueue job", Code: 500})
		return
	}

	writeJSON(w, http.StatusAccepted, models.VisualizeResponse{JobID: jobID})
}

// HandleStatus handles GET /api/v1/visualize/:job_id (polling fallback).
func (h *VisualizeHandler) HandleStatus(w http.ResponseWriter, r *http.Request) {
	jobID := chi.URLParam(r, "job_id")
	if _, err := uuid.Parse(jobID); err != nil {
		writeJSON(w, http.StatusBadRequest, models.ErrorResponse{Error: "invalid job id", Code: 400})
		return
	}

	// Subscribe before checking Redis so a result cannot land between the cache check
	// and waiter registration. NotifyResult uses a buffered channel, so an in-flight
	// completion is safely retained while we perform the Redis lookup.
	ch := h.subscribe(jobID)
	defer h.unsubscribe(jobID, ch)

	// Fast path: check Redis.
	result, err := h.redis.GetResultByJobID(r.Context(), jobID)
	if err == nil && result != nil {
		writeJSON(w, http.StatusOK, models.JobStatusResponse{
			JobID:  jobID,
			Status: "done",
			Result: result,
		})
		return
	}

	// Long-poll for the configured job timeout.
	ctx, cancel := context.WithTimeout(r.Context(), h.timeout)
	defer cancel()

	select {
	case result := <-ch:
		writeJSON(w, http.StatusOK, models.JobStatusResponse{
			JobID:  jobID,
			Status: "done",
			Result: result,
		})
	case <-ctx.Done():
		writeJSON(w, http.StatusOK, models.JobStatusResponse{
			JobID:  jobID,
			Status: "pending",
		})
	}
}
