# CloudFront CDN Setup for Next.js Frontend

This guide explains how to deploy CloudFront in front of your App Runner service to:
- Offload ~80% of traffic (static assets) from App Runner
- Reduce compute costs significantly
- Speed up global load times via edge caching

## Architecture

```
Users → CloudFront Edge → App Runner (Next.js)
           ↓
    Cached Static Assets
    (_next/static/*, images, fonts)
```

## Prerequisites

1. AWS CLI configured with appropriate permissions
2. App Runner frontend service deployed and running
3. (Optional) ACM certificate in us-east-1 for custom domain

## Deployment Steps

### 1. Create CDN Secret (for origin validation)

First, create a secret in AWS Secrets Manager to validate requests come from CloudFront:

```bash
# Generate a secure random token
TOKEN=$(openssl rand -hex 32)

# Create the secret
aws secretsmanager create-secret \
  --name cloudfront-cdn-secret \
  --secret-string "{\"token\":\"$TOKEN\"}" \
  --region eu-central-1
```

### 2. Deploy CloudFront Stack

**Without custom domain:**

```bash
aws cloudformation deploy \
  --template-file cloudfront-frontend.yaml \
  --stack-name askally-frontend-cdn \
  --parameter-overrides \
    AppRunnerDomain=<your-app-runner-id>.eu-central-1.awsapprunner.com \
    Environment=production \
  --region eu-central-1
```

**With custom domain (askally.io):**

```bash
# Note: ACM certificate must be in us-east-1 for CloudFront
aws cloudformation deploy \
  --template-file cloudfront-frontend.yaml \
  --stack-name askally-frontend-cdn \
  --parameter-overrides \
    AppRunnerDomain=<your-app-runner-id>.eu-central-1.awsapprunner.com \
    CustomDomainName=askally.io \
    AcmCertificateArn=arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID \
    Environment=production \
  --region eu-central-1
```

### 3. Update DNS (if using custom domain)

After deployment, update your DNS to point to CloudFront:

```bash
# Get the CloudFront domain
aws cloudformation describe-stacks \
  --stack-name askally-frontend-cdn \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDomainName`].OutputValue' \
  --output text
```

Create a CNAME or ALIAS record:
- **Name:** askally.io (or www.askally.io)
- **Type:** CNAME (or ALIAS for root domain in Route 53)
- **Value:** d1234abcd.cloudfront.net

### 4. (Optional) Validate Origin Requests in App Runner

To ensure requests only come through CloudFront, add middleware to your Next.js app:

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // In production, validate CDN secret header
  if (process.env.NODE_ENV === 'production') {
    const cdnSecret = request.headers.get('x-cdn-secret')
    const expectedSecret = process.env.CDN_SECRET

    if (expectedSecret && cdnSecret !== expectedSecret) {
      // Allow health checks without the header
      if (request.nextUrl.pathname === '/api/health') {
        return NextResponse.next()
      }
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

## Cache Behavior Summary

| Path Pattern | Cache Duration | Notes |
|--------------|----------------|-------|
| `_next/static/*` | 1 year | Immutable, hashed files |
| `_next/image*` | 1 day | Image optimization API |
| `*.ico, *.png, *.jpg, *.svg` | 1 day | Public assets |
| `*.woff2` | 1 day | Font files |
| `robots.txt, sitemap*.xml` | 1 day | SEO files |
| Everything else | 0 (no cache) | Dynamic content |

## Estimated Cost Savings

With CloudFront serving static assets:
- **Before:** Every request hits App Runner (compute + data transfer)
- **After:** ~80% of requests served from edge cache

Typical savings for a Next.js app:
- App Runner compute: 50-80% reduction
- Data transfer: 60-90% reduction
- Response latency: 2-10x improvement for static assets

## Monitoring

### CloudFront Metrics
- Cache hit ratio (target: >85% for static assets)
- Origin latency
- Error rates (4xx, 5xx)

### Useful CLI Commands

```bash
# Check cache statistics
aws cloudfront get-distribution \
  --id DISTRIBUTION_ID \
  --query 'Distribution.DistributionConfig.CacheBehaviors'

# Invalidate cache (use sparingly)
aws cloudfront create-invalidation \
  --distribution-id DISTRIBUTION_ID \
  --paths "/*"

# Invalidate specific paths
aws cloudfront create-invalidation \
  --distribution-id DISTRIBUTION_ID \
  --paths "/_next/static/*" "/favicon.ico"
```

## Troubleshooting

### Cache Not Working
1. Check `Cache-Control` headers from origin
2. Verify cache policy is attached to behavior
3. Check for `Vary` headers that might prevent caching

### 502/503 Errors
1. Check App Runner health
2. Verify origin domain is correct
3. Check origin timeout settings (default: 30s)

### CORS Issues
1. Ensure origin returns proper CORS headers
2. Add CORS headers in response headers policy if needed

## Rolling Back

To remove CloudFront and revert to direct App Runner access:

```bash
# Delete the CloudFront stack
aws cloudformation delete-stack --stack-name askally-frontend-cdn

# Update DNS back to App Runner domain
# (manual step in your DNS provider)
```

Note: CloudFront distributions take 15-30 minutes to delete.
