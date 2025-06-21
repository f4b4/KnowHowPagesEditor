# syntax=docker/dockerfile:1

# -------------------- base --------------------
FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies first (leverage Docker layer cache)
COPY package.json package-lock.json ./
RUN npm ci

# Install server dependencies
COPY server/package.json ./server/package.json
COPY server/package-lock.json ./server/package-lock.json
RUN npm ci --prefix server

# -------------------- dev stage --------------------
FROM node:18-alpine AS dev
WORKDIR /app

# Copy project files (bind-mounted at runtime, but needed for cold start)
COPY --from=base /app/node_modules ./node_modules
COPY . .

# Enable faster rebuilds
RUN npm install -g nodemon concurrently

# Default command will be overridden by compose but keep for clarity
CMD ["npm", "run", "dev"]

# -------------------- build stage --------------------
FROM base AS build
COPY . .

# Build frontend static assets
RUN npm run build
# Compile TypeScript backend
RUN npm --prefix server run build

# -------------------- production-runtime --------------------
FROM node:18-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production

# 1️⃣  Copy client runtime (React) dependencies
COPY --from=base /app/node_modules ./node_modules
# 2️⃣  Copy entire server folder from the base stage – this
#     includes server/node_modules where fastify lives.
COPY --from=base /app/server ./server

# 3️⃣  Copy the compiled artefacts produced in the build stage
#     (over-writing only the dist sub-folder, leaving node_modules intact)
COPY --from=build /app/dist         ./dist
COPY --from=build /app/server/dist  ./server/dist

# Install tiny static file server
RUN npm install -g serve@14.2.1

# Expose 3000 (static) and 3001 (API)
EXPOSE 3000 3001

# Launch backend and static server simultaneously
#  • Fastify API on 3001
#  • serve on 3000 – use -p (port) and --no-port-switching so it doesn't fall back to 80
CMD ["sh", "-c", "node server/dist/index.js & serve -s dist -p 3000 --no-port-switching"] 