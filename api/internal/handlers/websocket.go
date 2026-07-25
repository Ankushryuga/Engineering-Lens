package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"algo-visualizer/api/internal/models"
	redisclient "algo-visualizer/api/internal/redis"

	"github.com/go-chi/chi/v5"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // origin check is handled by CORS middleware
	},
}

// WSHandler handles WebSocket connections at /ws/:job_id.
type WSHandler struct {
	vh    *VisualizeHandler
	redis *redisclient.Client
}

// NewWSHandler constructs a WSHandler.
func NewWSHandler(vh *VisualizeHandler, rdb *redisclient.Client) *WSHandler {
	return &WSHandler{vh: vh, redis: rdb}
}

// HandleWS upgrades the connection, waits for a result, then pushes it.
func (h *WSHandler) HandleWS(w http.ResponseWriter, r *http.Request) {
	jobID := chi.URLParam(r, "job_id")

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("ws: upgrade error: %v", err)
		return
	}
	defer conn.Close()

	// Check Redis first (job may already be done).
	result, err := h.redis.GetResultByJobID(r.Context(), jobID)
	if err == nil && result != nil {
		sendWSResult(conn, result)
		return
	}

	// Subscribe to in-memory notifier.
	ch := h.vh.subscribe(jobID)
	defer h.vh.unsubscribe(jobID, ch)

	// Send a "pending" ping every 5 s so the client knows we're alive.
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	timeout := time.After(60 * time.Second)

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
