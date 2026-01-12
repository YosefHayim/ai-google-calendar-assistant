# Infrastructure Guide

This document covers the infrastructure improvements for the AI Google Calendar Assistant.

## Table of Contents

1. [CloudFront CDN](#cloudfront-cdn)
2. [Docker Multi-Stage Builds](#docker-multi-stage-builds)
3. [Telegram Webhooks](#telegram-webhooks)
4. [Redis Optimization](#redis-optimization)
5. [Runtime Tuning](#runtime-tuning)
6. [AI Agent Warming](#ai-agent-warming)

---

## CloudFront CDN

### Why CloudFront?

App Runner is a compute service, not a CDN. Without CloudFront:
- Every request (including static assets) hits your App Runner container
- Higher compute costs (paying for CPU to serve images/JS/CSS)
- Slower load times (no edge caching)

With CloudFront:
- ~80% of traffic (static assets) served from edge cache
- 50-80% reduction in App Runner compute
- 2-10x faster load times for static assets globally

### Configuration

See [cloudfront/CLOUDFRONT_SETUP.md](./cloudfront/CLOUDFRONT_SETUP.md) for detailed setup instructions.

**Quick Start:**

```bash
cd infra/cloudfront

# Deploy CloudFront
aws cloudformation deploy \
  --template-file cloudfront-frontend.yaml \
  --stack-name askally-frontend-cdn \
  --parameter-overrides \
    AppRunnerDomain=<your-app-runner-id>.eu-central-1.awsapprunner.com \
    CustomDomainName=askally.io \
    AcmCertificateArn=<your-cert-arn> \
  --region eu-central-1
```

### Cache Behavior

| Content Type | Cache Duration | Notes |
|--------------|----------------|-------|
| `_next/static/*` | 1 year | Hashed, immutable files |
| Images, fonts | 1 day | Public assets |
| HTML, API | No cache | Dynamic content |

---

## Docker Multi-Stage Builds

### Why Multi-Stage?

- Smaller production images (only runtime dependencies)
- Faster deployments (better layer caching)
- Security (no build tools in production)
- Monorepo support (shared folder handling)

### Frontend Dockerfile

Location: `/fe/Dockerfile`

```dockerfile
# Build stage: Full Node.js with build tools
FROM node:22-slim AS builder
# ... install deps, build Next.js

# Production stage: Minimal runtime
FROM node:22-slim AS runner
# ... copy only standalone build + static assets
```

**Build Arguments:**
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth client ID

**Build Command:**
```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.askally.io \
  -t askally-frontend \
  ./fe
```

### Backend Dockerfile

Location: `/be/Dockerfile`

```dockerfile
# Dependencies stage: Install all deps
FROM node:22-slim AS deps
# ... install dependencies

# Build stage: Compile TypeScript
FROM node:22-slim AS builder
# ... build to /app/dist

# Production deps: Only production packages
FROM node:22-slim AS prod-deps
# ... pnpm install --prod

# Runtime: Minimal production image
FROM node:22-slim AS runner
# ... copy dist + prod node_modules
```

**Build Command:**
```bash
docker build -t askally-backend ./be
```

### Image Sizes (Approximate)

| Image | Without Multi-Stage | With Multi-Stage |
|-------|--------------------|--------------------|
| Frontend | ~1.2 GB | ~150 MB |
| Backend | ~800 MB | ~200 MB |

---

## Telegram Webhooks

### Why Webhooks over Polling?

**Problems with Long-Polling (bot.start()) in App Runner:**
- App Runner kills idle connections after timeout
- Auto-scaling creates duplicate bot instances → double replies
- Higher latency (polling interval delay)

**Benefits of Webhooks:**
- No idle connection issues
- Single handler regardless of scaling
- Instant message delivery
- Lower resource usage

### Configuration

**Environment Variable:**
```env
TELEGRAM_BOT_ACCESS_TOKEN=your_bot_token
```

**Automatic Mode Selection:**
- Production (`NODE_ENV=production`) → Webhook mode
- Development → Long-polling mode

### Webhook Endpoint

**URL:** `POST /api/telegram/webhook`

**Health Check:** `GET /api/telegram/health`

### Verifying Webhook Setup

After deployment, check webhook status:

```bash
# Check webhook info from Telegram
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo

# Check health endpoint
curl https://i3fzcpnmmk.eu-central-1.awsapprunner.com/api/telegram/health
```

Expected response:
```json
{
  "status": "healthy",
  "mode": "webhook"
}
```

---

## Redis Optimization

### The 30MB Limit Problem

With Redis Cloud's free tier (30MB), large AI conversation contexts can fill up quickly.

### Solution 1: Eviction Policy (Redis Cloud Settings)

Configure `maxmemory-policy` in Redis Cloud dashboard:

1. Go to Redis Cloud → Your Database → Configuration
2. Set **Eviction Policy** to `allkeys-lru`
3. This ensures oldest keys are deleted when memory is full (instead of crashing)

**Recommended Policies:**
| Policy | Behavior |
|--------|----------|
| `allkeys-lru` | Evict least recently used keys (recommended) |
| `volatile-lru` | Evict LRU keys with TTL set |
| `noeviction` | Return error when full (not recommended) |

### Solution 2: Compression (Optional)

For larger payloads, use the compression utility:

```typescript
import { compressJSON, decompressJSON } from "@/utils/compression"

// Compress before storing (saves 50-70% for JSON > 1KB)
const compressed = await compressJSON(largeContext)
await redis.set(key, compressed)

// Decompress when reading
const data = await redis.get(key)
const context = await decompressJSON(data)
```

**Note:** Current context store uses small objects (~200-500 bytes), so compression isn't needed yet. Use it if you store larger AI conversation histories.

### Solution 3: TTL Best Practices

Current TTLs in `unified-context-store.ts`:
- Event/Calendar references: 24 hours
- Conversation context: 2 hours
- User preferences: 24 hours

These short TTLs prevent stale data buildup.

---

## Runtime Tuning

### Node.js Memory Configuration

For App Runner containers with limited memory, configure V8 heap size:

**In Dockerfile or App Runner environment:**
```env
NODE_OPTIONS=--max-old-space-size=1536
```

This limits V8 heap to ~1.5GB for a 2GB container (leaving room for OS and other processes).

### Bun Runtime (Development)

If using Bun in development:

```env
BUN_JSC_forceRAMSize=1610612736  # ~1.5GB in bytes
```

**Note:** Production currently uses Node.js (`node dist/app.js`), not Bun.

### Container Memory Recommendations

| Container Memory | NODE_OPTIONS |
|------------------|--------------|
| 1 GB | `--max-old-space-size=768` |
| 2 GB | `--max-old-space-size=1536` |
| 4 GB | `--max-old-space-size=3072` |

Rule: Set to ~75-80% of container memory.

---

## AI Agent Warming

### Why Warm Agents?

OpenAI Agents SDK can have cold-start delays when:
- Initializing complex tool definitions
- Loading schema validators
- Setting up agent hierarchies

### Current Implementation (Already Optimized)

The codebase already follows best practices:

**1. Agents initialized at module load (global scope):**
```typescript
// be/ai-agents/agents.ts
export const ORCHESTRATOR_AGENT = new Agent({
  name: "calendar_orchestrator_agent",
  // ... configuration
})
```

**2. Tools defined at import time:**
```typescript
// be/ai-agents/tool-registry.ts
export const DIRECT_TOOLS = {
  validate_user_direct: tool({ ... }),
  insert_event_direct: tool({ ... }),
}
```

**3. OpenAI key set on import:**
```typescript
// be/config/clients/openai.ts
export function initializeOpenAI(): void {
  setDefaultOpenAIKey(env.openAiApiKey)
}
initializeOpenAI() // Called immediately
```

### Verification

To verify agents are warm, check server startup logs:
```
Server successfully started on port 8080
Telegram Bot: Webhook set to https://...
```

If agents were cold-starting per request, you'd see delays in the first few requests after deployment.

---

## Deployment Checklist

### Pre-Deployment

- [ ] Build Docker images locally and test
- [ ] Verify environment variables are set in App Runner
- [ ] Ensure ACM certificate is in us-east-1 (for CloudFront)

### CloudFront Setup

- [ ] Deploy CloudFormation stack
- [ ] Update DNS to point to CloudFront
- [ ] Verify cache hit ratios

### Redis Setup

- [ ] Set eviction policy to `allkeys-lru` in Redis Cloud
- [ ] Monitor memory usage in dashboard

### Telegram Webhook

- [ ] Deploy backend with `TELEGRAM_BOT_ACCESS_TOKEN`
- [ ] Verify webhook is registered: `getWebhookInfo`
- [ ] Test bot responses

### Post-Deployment

- [ ] Monitor CloudFront cache hit ratio (target: >85%)
- [ ] Check Telegram webhook health endpoint
- [ ] Review App Runner compute metrics (should decrease)
- [ ] Monitor Redis memory usage
