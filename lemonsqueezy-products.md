# Lemon Squeezy Products Setup Guide

> This guide helps you configure Lemon Squeezy products for the AI Google Calendar Assistant app.

---

## Table of Contents
1. [Store Setup Checklist](#store-setup-checklist)
2. [Product Configuration](#product-configuration)
3. [Subscription Plans](#subscription-plans)
4. [Webhook Configuration](#webhook-configuration)
5. [Environment Variables](#environment-variables)
6. [Product IDs Reference](#product-ids-reference)

---

## Store Setup Checklist

Before creating products, complete these steps in your Lemon Squeezy dashboard:

- [ ] Create account at [lemonsqueezy.com](https://lemonsqueezy.com)
- [ ] Verify email address
- [ ] Create your store (choose subdomain)
- [ ] Complete store activation (for live mode)
- [ ] Set up payout method
- [ ] Configure tax settings

---

## Product Configuration

### Create Main Product

Go to **Dashboard > Products > + New Product**

| Field | Value | Notes |
|-------|-------|-------|
| **Product Name** | `[YOUR_APP_NAME]` | e.g., "AI Calendar Assistant Pro" |
| **Description** | `[YOUR_DESCRIPTION]` | See template below |
| **Product Status** | Published | Enable when ready |
| **Tax Category** | SaaS - Software as a Service | Required for proper tax handling |

#### Product Description Template
```
[YOUR_APP_NAME] - Your AI-powered calendar management solution.

Features include:
- [FEATURE_1]
- [FEATURE_2]
- [FEATURE_3]
- [FEATURE_4]

Get started today and transform how you manage your calendar.
```

#### Product Images
Upload up to 10 images (recommended):
- Main product hero image (1200x630px recommended)
- Feature screenshots
- UI previews

---

## Subscription Plans

### Plan Structure

For SaaS, create **ONE product** with **multiple variants** for each pricing tier.

### Recommended Tier Structure

#### Free Tier (Lead Magnet - Optional)
| Field | Value |
|-------|-------|
| **Variant Name** | Free |
| **Price** | $0.00 |
| **Billing Interval** | Monthly |
| **Description** | `[FREE_TIER_DESCRIPTION]` |

#### Monthly Plan Variant

| Field | Value |
|-------|-------|
| **Variant Name** | Monthly |
| **Price** | `$[MONTHLY_PRICE]` |
| **Billing Interval** | Monthly |
| **Pricing Model** | Standard (flat-rate) |
| **Free Trial** | `[TRIAL_DAYS]` days (optional) |
| **Setup Fee** | `$[SETUP_FEE]` (optional) |

#### Yearly Plan Variant

| Field | Value |
|-------|-------|
| **Variant Name** | Yearly |
| **Price** | `$[YEARLY_PRICE]` |
| **Billing Interval** | Yearly |
| **Pricing Model** | Standard (flat-rate) |
| **Free Trial** | `[TRIAL_DAYS]` days (optional) |
| **Setup Fee** | `$[SETUP_FEE]` (optional) |

### Pricing Models Available

| Model | Best For | Description |
|-------|----------|-------------|
| **Standard** | Fixed subscription | Single flat fee per period |
| **Package** | Bundle pricing | Fixed amount for fixed units |
| **Volume** | Seat-based SaaS | Per-unit cost based on tier |
| **Graduated** | Usage tiers | Variable prices across usage levels |

---

## Webhook Configuration

### Required Webhooks

Go to **Settings > Webhooks > + Add Webhook**

| Field | Value |
|-------|-------|
| **Endpoint URL** | `https://[YOUR_DOMAIN]/api/webhooks/lemonsqueezy` |
| **Signing Secret** | `[GENERATE_SECURE_SECRET]` |

### Events to Subscribe

Select these webhook events:

#### Order Events
- [ ] `order_created`
- [ ] `order_refunded`

#### Subscription Events
- [ ] `subscription_created`
- [ ] `subscription_updated`
- [ ] `subscription_cancelled`
- [ ] `subscription_resumed`
- [ ] `subscription_expired`
- [ ] `subscription_paused`
- [ ] `subscription_unpaused`

#### Payment Events
- [ ] `subscription_payment_success`
- [ ] `subscription_payment_failed`
- [ ] `subscription_payment_recovered`

#### License Events (if applicable)
- [ ] `license_key_created`
- [ ] `license_key_updated`

---

## Environment Variables

Add these to your `.env` file:

```env
# Lemon Squeezy Configuration
LEMONSQUEEZY_API_KEY=[YOUR_API_KEY]
LEMONSQUEEZY_STORE_ID=[YOUR_STORE_ID]
LEMONSQUEEZY_WEBHOOK_SECRET=[YOUR_WEBHOOK_SECRET]

# Product/Variant IDs (get from dashboard after creating products)
LEMONSQUEEZY_PRODUCT_ID=[YOUR_PRODUCT_ID]

# Variant IDs
LEMONSQUEEZY_VARIANT_ID_FREE=[FREE_VARIANT_ID]
LEMONSQUEEZY_VARIANT_ID_MONTHLY=[MONTHLY_VARIANT_ID]
LEMONSQUEEZY_VARIANT_ID_YEARLY=[YEARLY_VARIANT_ID]

# Optional: Checkout customization
LEMONSQUEEZY_CHECKOUT_MODE=overlay  # or 'redirect'
```

### How to Get IDs

1. **API Key**: Settings > API > Create API Key
2. **Store ID**: Settings > Stores > Copy Store ID
3. **Product ID**: Products > Click product > Copy ID from URL or sidebar
4. **Variant IDs**: Products > Click product > Variants tab > Copy ID for each variant

---

## Product IDs Reference

Fill in after creating products:

| Plan | Product ID | Variant ID | Price | Interval |
|------|-----------|------------|-------|----------|
| Free | `________` | `________` | $0 | - |
| Monthly | `________` | `________` | $__/mo | Monthly |
| Yearly | `________` | `________` | $__/yr | Yearly |

---

## Checkout Integration

### Overlay Mode (Recommended)
```html
<script src="https://app.lemonsqueezy.com/js/lemon.js" defer></script>

<a href="https://[YOUR_STORE].lemonsqueezy.com/checkout/buy/[VARIANT_ID]"
   class="lemonsqueezy-button">
  Subscribe Now
</a>
```

### Passing Customer Data
```
https://[YOUR_STORE].lemonsqueezy.com/checkout/buy/[VARIANT_ID]
  ?checkout[email]=[USER_EMAIL]
  &checkout[custom][user_id]=[YOUR_USER_ID]
```

---

## Testing Checklist

Before going live:

- [ ] Test purchase in Test Mode
- [ ] Verify webhook receives events
- [ ] Test subscription creation flow
- [ ] Test subscription cancellation
- [ ] Test subscription upgrade/downgrade
- [ ] Verify customer portal access
- [ ] Switch to Live Mode
- [ ] Update API keys to production

---

## Platform Fees

| Fee Type | Amount |
|----------|--------|
| Transaction Fee | 5% + $0.50 per transaction |
| Monthly Fee | None |
| Setup Fee | None |

---

## Useful Links

- [Lemon Squeezy Dashboard](https://app.lemonsqueezy.com)
- [Getting Started Guide](https://docs.lemonsqueezy.com/guides/getting-started)
- [Adding Products](https://docs.lemonsqueezy.com/help/products/adding-products)
- [Pricing Models](https://docs.lemonsqueezy.com/help/products/pricing-models)
- [Subscriptions](https://docs.lemonsqueezy.com/help/products/subscriptions)
- [Webhooks Guide](https://docs.lemonsqueezy.com/guides/developer-guide/webhooks)
- [API Reference](https://docs.lemonsqueezy.com/api)
- [SaaS Subscription Plans Tutorial](https://docs.lemonsqueezy.com/guides/tutorials/saas-subscription-plans)

---

## Quick Fill Template

Copy and customize this for your product:

```yaml
Product Name: AI Calendar Assistant Pro
Description: |
  AI-powered calendar management that saves you hours every week.

  - Smart event scheduling with AI
  - Automatic conflict resolution
  - Natural language event creation
  - Multi-calendar sync
  - Meeting prep summaries

Tax Category: SaaS - Software as a Service

Variants:
  - name: Monthly
    price: 9.99
    interval: month
    trial_days: 7

  - name: Yearly
    price: 99.99
    interval: year
    trial_days: 14
    savings: "Save 17%"
```

---

*Last updated: January 2026*
