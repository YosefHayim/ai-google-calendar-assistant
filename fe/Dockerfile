# Frontend Dockerfile - Multi-Stage Build for Next.js + AWS App Runner
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

# Enable corepack for pnpm
RUN corepack enable

# =============================================================================
# Stage 2: Dependencies - Install all dependencies
# =============================================================================
FROM base AS deps

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies for Next.js build)
RUN pnpm install --no-frozen-lockfile

# =============================================================================
# Stage 3: Builder - Build Next.js application
# =============================================================================
FROM base AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Copy source code and configuration
COPY . .

# Build Next.js application (standalone output for App Runner)
RUN pnpm build

# =============================================================================
# Stage 4: Production Dependencies - Install only production deps
# =============================================================================
FROM base AS prod-deps

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --no-frozen-lockfile --prod

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
ENV NEXT_TELEMETRY_DISABLED=1

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

# Copy Next.js standalone build from builder stage
COPY --from=builder --chown=appuser:appuser /app/.next/standalone ./

# Copy static assets
COPY --from=builder --chown=appuser:appuser /app/.next/static ./.next/static

# Copy public assets
COPY --from=builder --chown=appuser:appuser /app/public ./public

# Switch to non-privileged user
USER appuser

# Expose the port Next.js runs on
EXPOSE 3000

# Set port environment variable
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Health check - use Next.js health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start the Next.js server
CMD ["node", "server.js"]