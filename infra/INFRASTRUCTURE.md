# Infrastructure Guide

This document covers the infrastructure improvements for the AI Google Calendar Assistant.

## Table of Contents

1. [CloudFront CDN](#cloudfront-cdn)
2. [Docker Multi-Stage Builds](#docker-multi-stage-builds)
3. [Telegram Webhooks](#telegram-webhooks)

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

**Environment Variables:**
```env
TELEGRAM_BOT_ACCESS_TOKEN=your_bot_token
TELEGRAM_WEBHOOK_SECRET=your_webhook_secret  # Required for production
```

**Automatic Mode Selection:**
- Production + webhook secret configured → Webhook mode
- Development or no secret → Long-polling mode

### Security

The webhook endpoint validates the `X-Telegram-Bot-Api-Secret-Token` header:

```typescript
// Telegram sends this header with every webhook request
const secretToken = req.headers["x-telegram-bot-api-secret-token"]
if (secretToken !== env.integrations.telegram.webhookSecret) {
  return res.status(401).json({ error: "Unauthorized" })
}
```

### Webhook Endpoint

**URL:** `POST /api/telegram/webhook`

**Health Check:** `GET /api/telegram/health`

### Generating Webhook Secret

```bash
# Generate a secure random secret
openssl rand -hex 32
```

Then add to your App Runner environment variables:
- Key: `TELEGRAM_WEBHOOK_SECRET`
- Value: `<generated-secret>`

### Verifying Webhook Setup

After deployment, check webhook status:

```bash
# Check webhook info from Telegram
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo

# Check health endpoint
curl https://api.askally.io/api/telegram/health
```

Expected response:
```json
{
  "status": "healthy",
  "mode": "webhook",
  "webhookConfigured": true
}
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] Build Docker images locally and test
- [ ] Verify environment variables are set in App Runner
- [ ] Ensure ACM certificate is in us-east-1 (for CloudFront)

### CloudFront Setup

- [ ] Create CDN secret in Secrets Manager
- [ ] Deploy CloudFormation stack
- [ ] Update DNS to point to CloudFront
- [ ] Verify cache hit ratios

### Telegram Webhook

- [ ] Generate webhook secret
- [ ] Add `TELEGRAM_WEBHOOK_SECRET` to App Runner env
- [ ] Deploy backend
- [ ] Verify webhook is registered: `getWebhookInfo`
- [ ] Test bot responses

### Post-Deployment

- [ ] Monitor CloudFront cache hit ratio (target: >85%)
- [ ] Check Telegram webhook health endpoint
- [ ] Review App Runner compute metrics (should decrease)
