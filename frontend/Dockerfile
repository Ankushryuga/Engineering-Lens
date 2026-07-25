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
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /usr/src/frontend
COPY --from=deps /usr/src/frontend/node_modules ./node_modules
COPY . .
RUN npm run build

# ── Production stage — static files served by nginx ──────────────────────────
FROM nginx:1.27-alpine AS production
COPY --from=build /usr/src/frontend/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
