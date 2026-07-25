package middleware

import (
	"net/http"
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
		limiter: rate.NewLimiter(rate.Limit(rps), int(rps*2)),
	})
	return v.(*ipLimiter).limiter
}

// RateLimit middleware enforces per-IP rate limiting.
func RateLimit(rps float64) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := r.RemoteAddr
			if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
				ip = xff
			}
			lim := getOrCreateLimiter(ip, rps)
			if !lim.Allow() {
				http.Error(w, `{"error":"rate limit exceeded","code":429}`, http.StatusTooManyRequests)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
