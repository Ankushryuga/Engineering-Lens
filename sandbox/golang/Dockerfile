# ── Build stage — compiles the worker binary itself ──────────────────────────
FROM golang:1.24-alpine AS builder
WORKDIR /app
COPY go.mod go.sum* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /sandbox-go-worker .

# ── Runtime stage — needs the full Go toolchain to `go run` submitted code ───
FROM golang:1.24-alpine

RUN addgroup -S sandbox && adduser -S sandbox -G sandbox
RUN mkdir -p /tmp/gocache && chown -R sandbox:sandbox /tmp/gocache

WORKDIR /app
COPY --from=builder /sandbox-go-worker .

USER sandbox
ENV GOCACHE=/tmp/gocache
ENV CGO_ENABLED=0

CMD ["./sandbox-go-worker"]
