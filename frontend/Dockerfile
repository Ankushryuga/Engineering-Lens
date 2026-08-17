# ── Go WebAssembly System Design engine ──────────────────────────────────────
FROM golang:1.23-alpine AS system-design-wasm
WORKDIR /src
COPY wasm ./wasm
RUN mkdir -p /out \
    && cd wasm \
    && GOOS=js GOARCH=wasm go build -trimpath -ldflags="-s -w" -o /out/system-design.wasm ./cmd/wasm \
    && cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" /out/wasm_exec.js

# ── Dependencies stage ────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /usr/src/frontend
COPY package.json package-lock.json* ./
RUN npm install

# ── Dev stage (used by docker-compose for local development) ─────────────────
# NOTE: WORKDIR must NOT be "/app" — the React app has a client-side route
# at "/app", and Vite's dev-server resolves request paths against the
# filesystem. If the working directory were literally "/app", a request for
# the "/app" route collides with the real "/app" directory on disk and
# crashes Vite with "EISDIR: illegal operation on a directory, read /app".
FROM node:20-alpine AS dev
WORKDIR /usr/src/frontend
COPY --from=deps /usr/src/frontend/node_modules ./node_modules
COPY . .
COPY --from=system-design-wasm /out/system-design.wasm ./public/system-design.wasm
COPY --from=system-design-wasm /out/wasm_exec.js ./public/wasm_exec.js
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /usr/src/frontend
COPY --from=deps /usr/src/frontend/node_modules ./node_modules
COPY . .
COPY --from=system-design-wasm /out/system-design.wasm ./public/system-design.wasm
COPY --from=system-design-wasm /out/wasm_exec.js ./public/wasm_exec.js
RUN npm run build

# ── Production stage — static files served by nginx ──────────────────────────
FROM nginx:1.27-alpine AS production
COPY --from=build /usr/src/frontend/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
