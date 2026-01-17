# Backend Dockerfile - Multi-Stage Build for Express + TypeScript
# Optimized for App Runner deployment with minimal production image
# syntax=docker/dockerfile:1

# =============================================================================
# Stage 1: Base - Common setup for all stages
# =============================================================================
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-slim AS base

# Install system dependencies
# ca-certificates: enables TLS/SSL for secure HTTPS connections
# curl: useful for health checks
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
        ca-certificates \
        curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# =============================================================================
# Stage 2: Dependencies - Install all dependencies
# =============================================================================
FROM base AS deps

# Copy package files for dependency installation
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for TypeScript build)
RUN npm ci

# =============================================================================
# Stage 3: Builder - Compile TypeScript to JavaScript
# =============================================================================
FROM base AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy TypeScript configuration
COPY tsconfig.json ./

# Copy source code
# The shared folder is inside /be/shared, so it's included automatically
COPY . .

# Build TypeScript to JavaScript
# Output goes to /app/dist
RUN npm run build

# =============================================================================
# Stage 4: Production Dependencies - Install only production deps
# =============================================================================
FROM base AS prod-deps

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# =============================================================================
# Stage 5: Runner - Minimal production image
# =============================================================================
FROM node:${NODE_VERSION}-slim AS runner

WORKDIR /app

# Install only runtime dependencies
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
        ca-certificates \
        curl && \
    rm -rf /var/lib/apt/lists/*

# Set production environment
ENV NODE_ENV=production

# Memory tuning: Limit V8 heap to ~1.5GB (adjust based on container size)
# For 2GB container, use 1536. For 1GB container, use 768.
ENV NODE_OPTIONS="--max-old-space-size=1536"

# Create non-privileged user for security
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/app" \
    --shell "/sbin/nologin" \
    --uid "${UID}" \
    appuser

# Copy production dependencies from prod-deps stage
COPY --from=prod-deps --chown=appuser:appuser /app/node_modules ./node_modules

# Copy package.json for reference
COPY --from=prod-deps --chown=appuser:appuser /app/package.json ./

# Copy compiled JavaScript from builder stage
COPY --from=builder --chown=appuser:appuser /app/dist ./dist

# Copy any public/static assets if they exist
# Using a conditional pattern to avoid errors if directory doesn't exist
COPY --from=builder --chown=appuser:appuser /app/public ./public 2>/dev/null || true

# Switch to non-privileged user
USER appuser

# Expose the port Express runs on
EXPOSE 8080

# Set port environment variable
ENV PORT=8080

# Health check - use root /health endpoint for faster response
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Start the server
CMD ["node", "dist/app.js"]
