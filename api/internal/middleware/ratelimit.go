package middleware

import (
	"net"
	"net/http"
	"strings"
	"sync"

	"golang.org/x/time/rate"
)

// ipLimiter holds a per-IP rate limiter.
type ipLimiter struct {
	limiter *rate.Limiter
}

var (
	limiters sync.Map
)

// getOrCreateLimiter returns the limiter for the given IP, creating one if needed.
func getOrCreateLimiter(ip string, rps float64) *rate.Limiter {
	v, _ := limiters.LoadOrStore(ip, &ipLimiter{
		limiter: rate.NewLimiter(rate.Limit(rps), burstFor(rps)),
	})
	return v.(*ipLimiter).limiter
}

func burstFor(rps float64) int {
	burst := int(rps * 2)
	if burst < 1 {
		return 1
	}
	return burst
}

func clientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		return strings.TrimSpace(strings.Split(xff, ",")[0])
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err == nil {
		return host
	}
	return r.RemoteAddr
}

// RateLimit middleware enforces per-IP rate limiting.
func RateLimit(rps float64) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			lim := getOrCreateLimiter(clientIP(r), rps)
			if !lim.Allow() {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusTooManyRequests)
				_, _ = w.Write([]byte(`{"error":"rate limit exceeded","code":429}`))
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
