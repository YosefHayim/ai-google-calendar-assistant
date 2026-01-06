# Security Documentation

## Overview

This document outlines the security measures implemented in the AI Google Calendar Assistant backend.

## Security Controls

### Authentication & Authorization

- **Supabase JWT Authentication**: All protected endpoints require valid JWT tokens
- **Google OAuth2**: Calendar API access uses OAuth2 with proper token verification
- **Token Refresh**: Automatic token refresh with secure cookie storage
- **Session Management**: HTTP-only, secure, SameSite cookies

### Rate Limiting

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Authentication (`/signin`, `/signup`) | 5 requests | 15 minutes |
| OTP Verification | 3 requests | 5 minutes |
| Token Refresh | 30 requests | 15 minutes |
| General API | 100 requests | 1 minute |

### Input Validation

- **Zod Schemas**: Runtime type checking for all request bodies
- **Email Validation**: Proper email format validation and normalization
- **Password Requirements**: Minimum 8 characters, requires uppercase, lowercase, and number
- **Input Sanitization**: XSS prevention through input sanitization

### Security Headers (Helmet.js)

- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security (HSTS)
- Cross-Origin-Resource-Policy

### AI Safety Guardrails

- **Pre-check Validation**: Fast regex-based injection detection
- **LLM-based Safety Check**: Semantic analysis for:
  - Mass deletion attempts
  - Prompt injection/jailbreak attempts
  - PII exposure attempts
  - Vague destructive intent
- **Fail-closed Mode**: Requests blocked if safety cannot be verified

### Audit Logging

- Request correlation IDs for tracing
- Security event logging for:
  - Authentication events (login, logout, signup)
  - Failed access attempts
  - Modification operations
  - OAuth callbacks
- PII masking in logs

## Security Checklist

### Critical (CVSS 9.0+)
- [x] Token exposure in OAuth redirect URLs - FIXED
- [x] JWT verification instead of decode only - FIXED
- [x] Telegram email verification via OTP - FIXED
- [x] IDOR on user info endpoint - FIXED

### High (CVSS 7.0-8.9)
- [x] Rate limiting on auth endpoints - IMPLEMENTED
- [x] Security headers (Helmet) - IMPLEMENTED
- [x] Authentication on all routes - IMPLEMENTED
- [x] Input validation with Zod - IMPLEMENTED

### Medium (CVSS 4.0-6.9)
- [x] Security audit logging - IMPLEMENTED
- [x] AI guardrail improvements - IMPLEMENTED
- [x] Error message sanitization - IMPROVED
- [x] Cookie security settings - VERIFIED

## Environment Configuration

Required environment variables:
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (backend only)
- `GOOGLE_CLIENT_ID`: OAuth client ID
- `GOOGLE_CLIENT_SECRET`: OAuth client secret
- `OPEN_API_KEY`: OpenAI API key

### Production Requirements

1. Set `NODE_ENV=production`
2. Configure CORS origins to actual frontend domain
3. Use HTTPS only
4. Rotate all API keys
5. Enable Supabase RLS policies

## Reporting Security Issues

Please report security vulnerabilities responsibly by contacting the maintainers directly.

---
Last Updated: 2026-01-04
