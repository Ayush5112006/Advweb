FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY task-manager-api ./task-manager-api

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# The server reads MONGODB_URI from the environment; inside the Docker network
# the database is reachable by the compose service name, not localhost.
CMD ["node", "task-manager-api/server.js"]