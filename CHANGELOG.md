# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.139] - 2026-01-12

### Week of January 6-12, 2026

#### Features

- **Security**: Implement Google RISC (Cross-Account Protection) endpoint (`86045ca`)
- **Infrastructure**: Add CloudFront CDN, multi-stage Docker builds, and Telegram webhooks (`08b1316`)
- **Performance**: Add Redis compression, runtime tuning, and performance docs (`396da5b`)
- **Frontend**: Hardcode backend URL based on hostname detection (`eaac6c5`)
- **Security**: Implement HTML sanitization and input validation utilities (`4b083a9`)
- **Calendar**: Enhance alias resolution and search strategy in event handling (`1de354a`)
- **Media**: Add image viewing lightbox and database storage (`69adf8b`)
- **Web**: Add image upload support to web chat UI (`08cc512`)
- **Telegram**: Add image upload support with AI vision (`98c6e31`)
- **UX**: Add typing indicator while processing Telegram requests (`4a8dde3`)
- **Frontend**: Integrate RescheduleDialog into EventDetailsDialog (`2ea1d18`)
- **i18n**: Add reschedule translations to all Telegram locales (`32df467`)
- **Calendar**: Add Google Meet auto-add for event creation (`a94e839`)
- **Calendar**: Add smart reschedule feature for both Telegram and web (`386a981`)
- **Frontend**: Enhance feature showcase with all Telegram bot features (`733e65d`)
- **Frontend**: Add auto-carousel feature showcase on homepage (`658cade`)
- **Frontend**: Add Telegram bot CTA to homepage and footer (`96c4250`)
- **Telegram**: Add /website command to navigate to web dashboard (`b43714c`)
- **Frontend**: Implement suspense loading state in dashboard layout (`fab2288`)
- **Analytics**: Add calendar filtering functionality to analytics dashboard (`f9c7813`)
- **Billing**: Add confirmation dialogs for subscription cancellation and refund requests (`b59c9f7`)
- **Billing**: Enhance billing overview with subscription lifecycle events (`887e444`)
- **Backend**: Add cron route and controller for daily briefings (`05cf839`)
- **Billing**: Enhance subscription management with LemonSqueezy integration (`57858d4`)
- **User**: Implement daily briefing feature for user preferences (`a50ac58`)
- **Database**: Add whatsapp_users table to database schema (`a393281`)
- **Messaging**: Integrate WhatsApp Cloud API for enhanced messaging capabilities (`e119d6f`)
- **Chat**: Add conversation management and memory reset functionalities (`f5b2c7f`)
- **Admin**: Implement admin user info retrieval and enhance pagination utilities (`66b35ca`)
- **Admin**: Implement admin dashboard and user management features (`484b3be`)
- **Billing**: Migrate from Stripe to Lemon Squeezy for subscription management (`88a4dbd`)
- **Agent**: Enhance agent management and UI components (`6a1c9e4`)
- **Calendar**: Enhance calendar integration and improve event handling (`1e66ce8`)
- **Docker**: Enhance Docker setup and update agent configuration (`f74ebb4`)
- **Agent**: Implement agent profile management and enhance chat functionality (`c8599dd`)
- **Voice**: Enhance voice interaction capabilities and agent profile management (`23a30f8`)
- **Voice**: Add repeat last response functionality as text and voice (`bc2727e`)
- **3D**: Update AllyCharacter component and integrate 3D model (`e7bb47c`)
- **3D**: Add 3D character components and animations for Ally (`dc2de59`)
- **Voice**: Integrate TTS caching and enhance voice preview functionality (`4161b45`)
- **Voice**: Implement voice preference settings and text-to-speech functionality (`8162d22`)
- **Calendar**: Implement reminder management features for calendar events (`5fa9cde`)
- **i18n**: Enhance localization and error handling in various components (`02b5406`)
- **i18n**: Enhance localization across multiple components (`1bda5f2`)
- **Chat**: Enhance chat streaming functionality and title generation support (`76cc3a0`)
- **Agent**: Enhance agent handler and prompt localization support (`db88f44`)
- **Calendar**: Implement conflict detection for event updates across all calendars (`c425e1c`)
- **UI**: Replace button elements with Button component in analytics and marketing sections (`c631277`)
- **Chat**: Implement streaming chat functionality and enhance chat components (`fa04285`)
- **i18n**: Enhance localization in EventDurationDashboard component (`46c4719`)
- **i18n**: Enhance localization in dashboard components (`ecccb9f`, `d68a713`, `32d58e6`)
- **API**: Add new conversation endpoint and enhance localization in dashboard components (`245d192`)
- **Chat**: Add start new conversation functionality and enhance chat service (`4a2d17a`)
- **Chat**: Enhance chat functionality and localization support (`8c78736`)
- **Analytics**: Enhance analytics dashboard with monthly and weekly pattern charts (`2128813`)
- **Telegram**: Enhance Telegram bot functionality and configuration (`9436c70`)
- **Dev**: Update ESLint configuration and refactor QuickEventDialog component (`45a8bdf`)
- **Backend**: Integrate date-fns library and refactor user controllers (`0414cfa`)
- **Calendar**: Enhance Google Calendar integration and user management (`1696883`)
- **Docs**: Restructure documentation and introduce AI agents and Telegram bot modules (`53b055f`)
- **Calendar**: Refactor quick add event functionality and introduce orchestrator for event creation (`b8338fc`)
- **Voice**: Add voice transcription feature and related routes (`bf8b169`)
- **Contact**: Add contact form and webhook handling for user inquiries (`9a08f5b`)
- **Telegram**: Implement brain feature for user preferences in Telegram bot (`63cfd92`)
- **Database**: Update database types and relationships for improved structure and clarity (`5ea9038`)
- **i18n**: Enhance language support and user settings in gap recovery (`c6db544`)
- **Types**: Enhance gap recovery types and improve code formatting (`3898f2f`)
- **Callback**: Enhance callback handling for pending plans in user flow (`41a8460`)
- **Deps**: Update package dependencies and modify start script (`35f6043`)

#### Bug Fixes

- **Mobile**: Add mobile hamburger menu button for sidebar access (`1cb4360`)
- **CSP**: Add AWS App Runner backend URL to CSP connect-src directive (`f4cdaeb`)
- **Env**: Use port-based environment detection instead of NODE_ENV (`434f57a`)
- **URL**: Remove trailing slash from baseUrl to prevent double slashes in webhook URL (`79e1c00`)
- **Port**: Use port 8080 in production, 3000 in development (`d17e447`)
- **Logging**: Use console logging only in production for AWS App Runner (`2ec6fab`)
- **Build**: Resolve frontend build failures on AWS App Runner (`ebd5aff`)
- **Deps**: Add missing dependencies and apprunner.yaml for BE deployment (`eb99b92`)
- **Types**: Pin uuid@9 with @types/uuid@9 to fix TypeScript build (`066bef4`)
- **Deploy**: App Runner configs for BE and FE deployments (`f5317d3`)
- **OAuth**: Strip trailing slashes from BASE_URL and FRONTEND_URL (`4051d85`)
- **OAuth**: Add production warnings for missing BASE_URL in OAuth config (`c8e85e4`)
- **Build**: Configure TypeScript build for App Runner deployment (`fbaa26f`)
- **Analytics**: Standardize time unit formatting in analytics components (`611b792`)
- **Encoding**: Update text encoding for consistency across components (`8848951`)
- **3D**: Remove color export option in ally animations setup (`c0af66e`)

#### Refactoring

- **Telegram**: Remove TELEGRAM_WEBHOOK_SECRET - simplify webhook setup (`1d1ae0a`)
- **Telegram**: Make TELEGRAM_WEBHOOK_SECRET optional but recommended (`5bd4ac6`)
- **UUID**: Replace uuid with Node.js crypto.randomUUID() (`20aa575`)
- **Config**: Update environment variable management and configuration structure (`cd4bed3`)
- **Meet**: Use Date.now() for Google Meet requestId instead of uuid (`8ce6592`)
- **Conversation**: Update conversation message handling and improve logging (`1eb68ac`)
- **Schema**: Simplify database schema and remove gap recovery features (`a73fd70`)
- **Config**: Remove Lemon Squeezy products guide and update environment configurations (`98a8e5d`)
- **Docker**: Update Dockerfile and .dockerignore for improved build efficiency (`8349db8`)
- **Auth**: Update authentication flow and integrate user service (`58d145e`)
- **Imports**: Standardize imports and enhance code readability in conversation services (`c828dc8`)
- **Chat**: Improve chat message handling and enhance localization in dashboard components (`600d535`)
- **Chat**: Streamline chat controller and enhance chat input components (`022bf38`)
- **Analytics**: Enhance analytics dashboard components and improve user interaction (`e6e2891`)
- **Analytics**: Improve event handling and UI components in analytics dashboard (`f95ae6d`)
- **Analytics**: Update analytics dashboard styles and configuration (`1a03626`)
- **Analytics**: Enhance analytics dashboard and improve number formatting (`844c292`)
- **User**: Update user preferences and enhance analytics dashboard (`0945563`)

#### Documentation

- **Utils**: Add comprehensive JSDoc docstrings to all utility functions (`3374fbe`)
- **README**: Comprehensive README updates for root, backend, and frontend (`2095f41`)
- **Env**: Simplify .env.example to show only required env vars (`1918a53`)
- **Backend**: Clarify NEXT_PUBLIC_BACKEND_URL is critical for production (`5b45ec0`)
- **Legal**: Update privacy policy and terms with complete Google OAuth scopes and WhatsApp integration (`6273872`)
- **README**: Update README and environment files for enhanced features and integrations (`d848175`)

#### Chores

- **LiveKit**: Remove LiveKit integration and related configurations (`95758cd`)
- **Env**: Refine environment configuration and update production URLs (`d06042c`)
- **URLs**: Update URLs and contact information across the application (`ea5c463`)
- **CSP**: Update environment variable loading logic and enhance CSP configuration (`cd37f39`)
- **Types**: Update route import path in next-env.d.ts to development types directory (`c0e7764`)
- **Deps**: Update dependencies in bun.lock and adjust route import in next-env.d.ts (`0523ce3`)
- **Build**: Update auto-generated files from build (`b336798`)
- **Env**: Simplify .env.example to required values only (`bfddd98`)
- **Env**: Update environment variable configurations for backend and frontend (`e3c3f98`)

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Total Commits | 139 |
| Features | 70+ |
| Bug Fixes | 16 |
| Refactoring | 17 |
| Documentation | 6 |
| Chores | 9 |

### Key Highlights

1. **Google RISC Integration** - Added Cross-Account Protection for enhanced security
2. **CloudFront CDN** - Improved performance with CDN and multi-stage Docker builds
3. **WhatsApp Integration** - Full WhatsApp Cloud API support for messaging
4. **LemonSqueezy Migration** - Moved from Stripe to LemonSqueezy for subscriptions
5. **Image Upload Support** - AI vision capabilities for both Telegram and web
6. **Smart Rescheduling** - Intelligent event rescheduling across platforms
7. **Voice Features** - TTS, voice preferences, and transcription capabilities
8. **3D Character** - Ally 3D character with animations
9. **Admin Dashboard** - Full admin panel with user management
10. **Analytics** - Enhanced dashboards with weekly/monthly pattern charts

---

*Generated on 2026-01-12*
