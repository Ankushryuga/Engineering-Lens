package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"algo-visualizer/api/internal/models"
	redisclient "algo-visualizer/api/internal/redis"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

// WSHandler handles WebSocket connections at /ws/:job_id.
type WSHandler struct {
	vh             *VisualizeHandler
	redis          *redisclient.Client
	allowedOrigins map[string]bool
	timeout        time.Duration
}

// NewWSHandler constructs a WSHandler.
func NewWSHandler(vh *VisualizeHandler, rdb *redisclient.Client, origins []string, timeout time.Duration) *WSHandler {
	allowed := make(map[string]bool, len(origins))
	for _, origin := range origins {
		allowed[origin] = true
	}
	return &WSHandler{vh: vh, redis: rdb, allowedOrigins: allowed, timeout: timeout}
}

// HandleWS upgrades the connection, waits for a result, then pushes it.
func (h *WSHandler) HandleWS(w http.ResponseWriter, r *http.Request) {
	jobID := chi.URLParam(r, "job_id")
	if _, err := uuid.Parse(jobID); err != nil {
		http.Error(w, "invalid job id", http.StatusBadRequest)
		return
	}

	upgrader := websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(req *http.Request) bool {
			origin := req.Header.Get("Origin")
			return origin == "" || h.allowedOrigins["*"] || h.allowedOrigins[origin]
		},
	}
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("ws: upgrade error: %v", err)
		return
	}
	defer conn.Close()

	// Subscribe before checking Redis so a completion cannot be missed in the
	// small window between the cache lookup and waiter registration.
	ch := h.vh.subscribe(jobID)
	defer h.vh.unsubscribe(jobID, ch)

	// Check Redis after subscribing (job may already be done).
	result, err := h.redis.GetResultByJobID(r.Context(), jobID)
	if err == nil && result != nil {
		sendWSResult(conn, result)
		return
	}

	// Send a "pending" ping every 5 s so the client knows we're alive.
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	timeout := time.After(h.timeout)

	for {
		select {
		case result := <-ch:
			sendWSResult(conn, result)
			return
		case <-ticker.C:
			_ = conn.WriteMessage(websocket.TextMessage, []byte(`{"status":"pending"}`))
		case <-timeout:
			_ = conn.WriteMessage(websocket.TextMessage, []byte(`{"status":"timeout"}`))
			return
		case <-r.Context().Done():
			return
		}
	}
}

func sendWSResult(conn *websocket.Conn, result *models.Result) {
	data, err := json.Marshal(map[string]interface{}{
		"status": "done",
		"result": result,
	})
	if err != nil {
		log.Printf("ws: marshal result: %v", err)
		return
	}
	_ = conn.WriteMessage(websocket.TextMessage, data)
}
