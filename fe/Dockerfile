# Frontend Dockerfile - Multi-Stage Build for Next.js
# Optimized for App Runner deployment with standalone output
# syntax=docker/dockerfile:1

# =============================================================================
# Stage 1: Base - Install dependencies
# =============================================================================
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-slim AS base

# Configure pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Install system dependencies
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y ca-certificates && \
    rm -rf /var/lib/apt/lists/* && \
    npm install -g pnpm@10

WORKDIR /app

# =============================================================================
# Stage 2: Dependencies - Install all dependencies
# =============================================================================
FROM base AS deps

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# =============================================================================
# Stage 3: Builder - Build the Next.js application
# =============================================================================
FROM base AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
# Note: If you have a shared folder at the monorepo root, uncomment the next line
# and adjust the path. The shared code will be copied into the build context.
# COPY ../shared ./shared

COPY . .

# Set build-time environment variables
# These are baked into the client bundle at build time
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_CLIENT_ID}

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
# This creates the .next/standalone directory with a minimal Node.js server
RUN pnpm build

# =============================================================================
# Stage 4: Runner - Production runtime
# =============================================================================
FROM node:${NODE_VERSION}-slim AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-privileged user for security
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/app" \
    --shell "/sbin/nologin" \
    --uid "${UID}" \
    appuser

# Copy only the necessary files from builder
# The standalone build includes everything needed to run

# Copy the standalone server
COPY --from=builder --chown=appuser:appuser /app/.next/standalone ./

# Copy static files (these are not included in standalone by default)
COPY --from=builder --chown=appuser:appuser /app/.next/static ./.next/static

# Copy public folder
COPY --from=builder --chown=appuser:appuser /app/public ./public

# Switch to non-privileged user
USER appuser

# Expose the port Next.js runs on
EXPOSE 3000

# Set the hostname to listen on all interfaces
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the server
CMD ["node", "server.js"]
