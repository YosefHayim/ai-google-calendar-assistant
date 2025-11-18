# Migration Rollback Plan

## Overview

This document outlines the procedures for rolling back the new architecture implementation if issues are discovered during the migration process.

## Rollback Triggers

### Automatic Rollback Triggers

The following conditions will trigger **immediate automatic rollback**:

1. **Error Rate Threshold**
   - Error rate > 1% for more than 5 minutes
   - Critical error rate > 0.1%

2. **Latency Threshold**
   - P95 latency increase > 50% compared to baseline
   - P99 latency > 5 seconds

3. **Data Integrity Issues**
   - Mismatched results between old and new implementations > 1%
   - Database constraint violations

4. **Service Availability**
   - Service availability < 99.5%
   - Complete service outage

### Manual Rollback Triggers

The on-call engineer may initiate **manual rollback** for:

1. **User Impact**
   - Multiple user complaints about functionality
   - Critical feature not working
   - Security vulnerability discovered

2. **Resource Exhaustion**
   - Database connection pool exhausted
   - Memory leaks detected
   - CPU usage > 90% sustained

3. **External Dependencies**
   - Google Calendar API rate limits exceeded
   - Supabase connection issues
   - Third-party service failures

4. **Business Decision**
   - Business requirements change
   - Compliance issues identified

## Rollback Procedures

### Level 1: Feature Flag Rollback (Immediate - < 1 minute)

**Fastest rollback method** - Simply disable feature flags:

#### Via API

```bash
# Rollback repository pattern
curl -X POST http://localhost:3000/api/feature-flags/disable \
  -H "Content-Type: application/json" \
  -d '{"flag": "use_repository_pattern"}'

# Rollback service layer
curl -X POST http://localhost:3000/api/feature-flags/disable \
  -H "Content-Type: application/json" \
  -d '{"flag": "use_service_layer"}'

# Rollback enhanced clients
curl -X POST http://localhost:3000/api/feature-flags/disable \
  -H "Content-Type: application/json" \
  -d '{"flag": "use_enhanced_clients"}'
```

#### Via Code

```typescript
import { getFeatureFlagService, FeatureFlags } from "@/infrastructure/feature-flags/FeatureFlagService";

const featureFlags = getFeatureFlagService();

// Disable all new features immediately
featureFlags.disable(FeatureFlags.USE_REPOSITORY_PATTERN);
featureFlags.disable(FeatureFlags.USE_SERVICE_LAYER);
featureFlags.disable(FeatureFlags.USE_ENHANCED_CLIENTS);
featureFlags.disable(FeatureFlags.USE_EVENT_REPOSITORY);
featureFlags.disable(FeatureFlags.USE_CALENDAR_REPOSITORY);
featureFlags.disable(FeatureFlags.USE_USER_REPOSITORY);

console.log("✅ All new features disabled - rolled back to old implementation");
```

#### Via Environment Variable (Emergency)

```bash
# Add to .env or environment variables
DISABLE_ALL_FEATURE_FLAGS=true

# Restart service
pm2 restart ai-google-calendar-assistant
```

**Verification**:
```bash
# Check feature flag status
curl http://localhost:3000/api/feature-flags/status

# Should show all flags as disabled
```

### Level 2: Percentage Reduction (Gradual - < 5 minutes)

Reduce rollout percentage instead of full rollback:

```typescript
const featureFlags = getFeatureFlagService();

// Reduce from 50% to 25%
featureFlags.setRolloutPercentage(FeatureFlags.USE_REPOSITORY_PATTERN, 25);

// Reduce further to 10%
featureFlags.setRolloutPercentage(FeatureFlags.USE_REPOSITORY_PATTERN, 10);

// Reduce to 5% (canary only)
featureFlags.setRolloutPercentage(FeatureFlags.USE_REPOSITORY_PATTERN, 5);
```

### Level 3: Code Deployment Rollback (Moderate - < 15 minutes)

If feature flags are not responding or code issues exist:

#### Using Git

```bash
# Find last stable commit
git log --oneline -10

# Rollback to previous commit
git revert <commit-hash>

# Or reset to last stable version
git reset --hard <last-stable-commit>

# Deploy
git push origin main --force-with-lease
```

#### Using Docker/Container

```bash
# Rollback to previous Docker image
docker pull your-registry/ai-calendar:previous-stable

# Stop current container
docker stop ai-calendar-current

# Start previous version
docker run -d --name ai-calendar your-registry/ai-calendar:previous-stable
```

#### Using PM2

```bash
# Checkout previous version
git checkout <last-stable-commit>

# Install dependencies
pnpm install

# Restart
pm2 restart ai-google-calendar-assistant
```

### Level 4: Database Rollback (Extended - < 30 minutes)

**⚠️ Use only if database schema changes were made**

```bash
# Restore from backup
pg_restore -d ai_calendar_db backup_before_migration.sql

# Or rollback migrations
npx supabase db reset --db-url $DATABASE_URL

# Restore to specific migration
npx supabase db reset --version <migration-version>
```

## Rollback Checklist

### Pre-Rollback
- [ ] Identify rollback trigger and severity
- [ ] Notify team of impending rollback
- [ ] Document reason for rollback
- [ ] Capture current metrics and logs
- [ ] Verify old implementation is still functional

### During Rollback
- [ ] Execute appropriate rollback level
- [ ] Monitor error rates during rollback
- [ ] Verify old implementation is serving traffic
- [ ] Check all critical paths are functional
- [ ] Confirm user impact has been mitigated

### Post-Rollback
- [ ] Verify all metrics returned to baseline
- [ ] Confirm zero errors from old implementation
- [ ] Update stakeholders on rollback status
- [ ] Conduct incident review
- [ ] Document lessons learned
- [ ] Create plan to address root cause
- [ ] Update rollout plan if needed

## Rollback Decision Matrix

| Error Rate | Latency Increase | Impact | Action |
|-----------|------------------|---------|--------|
| < 0.5% | < 20% | Low | Monitor closely |
| 0.5% - 1% | 20% - 50% | Medium | Level 2 (Reduce %) |
| > 1% | > 50% | High | Level 1 (Disable flags) |
| > 5% | > 100% | Critical | Level 3 (Code rollback) |

## Communication Protocol

### Internal Communication

**Immediate (< 5 min)**:
```
🚨 ROLLBACK INITIATED

Trigger: [Error rate/Latency/Data integrity]
Current rollout: [X%]
Action taken: [Feature flags disabled/Percentage reduced]
Status: [In progress/Complete]
ETA: [X minutes]

Incident Commander: [@engineer]
```

**Update (Every 15 min)**:
```
📊 ROLLBACK UPDATE

Time elapsed: [X minutes]
Current status: [Rolling back/Verifying/Complete]
Metrics:
- Error rate: [X%]
- Latency P95: [X ms]
- Traffic on old impl: [X%]

Next steps: [Description]
```

**Resolution**:
```
✅ ROLLBACK COMPLETE

Total duration: [X minutes]
Final state: [All traffic on old implementation]
Impact: [Number of affected requests/users]
Next steps: [Root cause analysis/Update plan]

Post-mortem: [Link to document]
```

### External Communication (If Needed)

**Status Page Update**:
```
⚠️ Service Update

We've identified an issue during a planned update and have
rolled back to the previous stable version. All services
are now operating normally.

Impact: [Minimal/None]
Duration: [X minutes]

We apologize for any inconvenience.
```

## Monitoring During Rollback

### Key Metrics to Watch

```typescript
import { getMetricsService } from "@/infrastructure/monitoring/MetricsService";

const metrics = getMetricsService();

// Monitor rollback progress
setInterval(() => {
  const oldImplRequests = metrics.getMetrics("migration.old_implementation.requests");
  const newImplRequests = metrics.getMetrics("migration.new_implementation.requests");

  const totalRequests = oldImplRequests.length + newImplRequests.length;
  const oldPercentage = (oldImplRequests.length / totalRequests) * 100;

  console.log(`Rollback progress: ${oldPercentage.toFixed(1)}% on old implementation`);

  // Should reach 100% quickly after rollback
  if (oldPercentage >= 99.5) {
    console.log("✅ Rollback complete - all traffic on old implementation");
  }
}, 10000); // Check every 10 seconds
```

### Rollback Validation Queries

```bash
# Check current feature flag state
curl http://localhost:3000/api/feature-flags/status | jq '.flags'

# Verify error rate
curl http://localhost:3000/api/metrics/errors | jq '.errorRate'

# Check latency
curl http://localhost:3000/api/metrics/latency | jq '.p95'

# Implementation distribution
curl http://localhost:3000/api/metrics/implementation-split
```

## Testing Rollback Procedures

### Regular Rollback Drills

**Monthly drill schedule**:
1. Announce drill to team
2. Enable feature flags to 10%
3. Simulate issue (inject errors)
4. Execute rollback procedure
5. Verify rollback success
6. Document time taken and issues
7. Update procedures if needed

### Automated Rollback Tests

```typescript
// Test in staging environment
describe("Rollback Procedures", () => {
  it("should rollback via feature flags within 1 minute", async () => {
    const startTime = Date.now();

    // Enable feature
    featureFlags.enable(FeatureFlags.USE_REPOSITORY_PATTERN, 50);

    // Simulate issue
    simulateHighErrorRate();

    // Rollback
    featureFlags.disable(FeatureFlags.USE_REPOSITORY_PATTERN);

    // Verify
    const rollbackTime = Date.now() - startTime;
    expect(rollbackTime).toBeLessThan(60000); // < 1 minute
    expect(await getErrorRate()).toBeLessThan(0.1);
  });
});
```

## Post-Rollback Analysis

After any rollback, conduct analysis:

1. **Root Cause Identification**
   - What triggered the rollback?
   - Was it preventable?
   - What tests would have caught it?

2. **Impact Assessment**
   - How many requests were affected?
   - How many users experienced issues?
   - What was the financial impact?

3. **Process Improvements**
   - What can prevent similar issues?
   - Are rollback procedures adequate?
   - Do we need additional monitoring?

4. **Documentation Updates**
   - Update known issues
   - Improve rollback procedures
   - Add new test cases

5. **Communication Review**
   - Was notification timely?
   - Were stakeholders informed?
   - Can we improve communication?

## Rollback Success Criteria

A rollback is considered successful when:

- ✅ Error rate returns to < 0.1%
- ✅ Latency returns to baseline (within 10%)
- ✅ All traffic is on old implementation (if full rollback)
- ✅ No user-reported issues after rollback
- ✅ All critical functionality verified as working
- ✅ Monitoring shows stable metrics
- ✅ Team has conducted post-rollback review

## Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| On-Call Engineer | [Name] | [Phone/Slack] |
| Engineering Lead | [Name] | [Phone/Slack] |
| DevOps Lead | [Name] | [Phone/Slack] |
| Product Manager | [Name] | [Phone/Slack] |

## Rollback Runbook Summary

| Step | Action | Time | Verification |
|------|--------|------|--------------|
| 1 | Disable feature flags | < 1 min | Check flag status API |
| 2 | Monitor error rate | 5 min | Should drop to < 0.1% |
| 3 | Verify traffic split | 5 min | 100% on old impl |
| 4 | Check critical paths | 5 min | All features working |
| 5 | Notify stakeholders | Immediate | Confirmation received |
| 6 | Document incident | 30 min | Issue created |
| 7 | Schedule post-mortem | 24 hrs | Meeting scheduled |
