# ─── Frontend Dockerfile: React (Vite) + nginx ─────────────────────────────────
# Multi-stage build: compile the bundle with Node, then serve the static output
# with nginx. No Node runtime or source ships in the final image.

# Stage 1: build the production bundle
FROM node:20-alpine AS build

WORKDIR /app

# Dependencies are installed in their own layer for build-cache reuse.
COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.js ./
COPY src ./src

# VITE_API_URL is read at BUILD time by Vite (import.meta.env is inlined into
# the bundle). It must be a browser-reachable URL: the frontend JS runs in the
# user's browser, so it points at the host-mapped backend port, NOT at the
# Docker-internal hostname `backend`, which the host browser cannot resolve.
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: serve the built assets
FROM nginx:alpine

# nginx.conf listens on 5173 and handles the SPA history fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]