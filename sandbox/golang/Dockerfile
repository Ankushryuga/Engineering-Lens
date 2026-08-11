# ── Build stage — compiles the worker and pre-warms Go's standard-library cache ──
FROM golang:1.24-alpine AS builder
WORKDIR /app
COPY go.mod go.sum* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /sandbox-go-worker .
RUN printf '%s\n' \
    'package main' \
    'import (' \
    '    _ "container/heap"' \
    '    _ "encoding/json"' \
    '    _ "fmt"' \
    '    _ "math"' \
    '    _ "sort"' \
    '    _ "strings"' \
    ')' \
    'func main() {}' > /tmp/algo-warmup.go \
    && CGO_ENABLED=0 go build -o /tmp/algo-warmup /tmp/algo-warmup.go

# ── Runtime stage — keeps the Go toolchain because submitted code is compiled ──
FROM golang:1.24-alpine

RUN addgroup -S -g 10001 sandbox && adduser -S -D -H -u 10001 -G sandbox sandbox
RUN mkdir -p /tmp/gocache /opt/go-build-cache /go-exec \
    && chown -R sandbox:sandbox /tmp/gocache /go-exec

WORKDIR /app
COPY --from=builder /sandbox-go-worker .
COPY --from=builder /root/.cache/go-build/ /opt/go-build-cache/

USER sandbox
ENV HOME=/tmp/home
ENV GOCACHE=/tmp/gocache
ENV GOPATH=/tmp/gopath
ENV GOMODCACHE=/tmp/gomodcache
ENV GOTMPDIR=/tmp/gotmp
ENV GOTELEMETRY=off
ENV GOMAXPROCS=1
ENV CGO_ENABLED=0

# The container filesystem is read-only in Compose, so seed the writable tmpfs
# cache at startup. This avoids recompiling the Go standard library for the
# first student job and keeps per-job memory use predictable.
CMD ["sh", "-c", "mkdir -p /tmp/gocache /tmp/gopath /tmp/gomodcache /tmp/gotmp /tmp/home /go-exec && cp -R /opt/go-build-cache/. /tmp/gocache/ 2>/dev/null || true; exec ./sandbox-go-worker"]
