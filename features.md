### **Features & Bug Fixes (`features.md`)**

⏱️ **Backend | Voice & Agent Optimization**
   Replace OpenAI Whisper with ElevenLabs to improve voice synthesis quality. Refactor backend prompts to be provider-agnostic, enabling support for multiple AI agents (ElevenLabs, Gemini, Claude) alongside existing ones.
⏱️ **Feature | Google Meet Integration**
   Implement logic to verify if the "Invite to Google Meet" feature is enabled when a user provides an email. If enabled, execute the invite; if not, handle the error gracefully or prompt for enablement.
✅ **UI | Font Update**
   Update the application's font family to a more "futuristic" style that better aligns with the AI branding.
⏱️ **Backend/Frontend | Organization Support**
   Implement "Organization" vs. "Individual" user logic.

- **DB:** Add necessary columns to Supabase tables via CLI and regenerate `package.json` types.
- **Validation:** Ensure cross-user validation within organizations to resolve conflicts.
- **FE:** Add a setting in the Settings Modal to identify and manage user types.

⏱️ **Mobile UI | Homepage Carousel**
   Fix the vertical alignment of carousel buttons in mobile view. They are currently positioned at the bottom 80%; center them vertically relative to the component.
✅ **Infra | AWS Region Latency Review**
   Evaluate latency for users in Israel connecting to the Frankfurt AWS region. Determine if moving services to a closer region (or a multi-region setup) is necessary for performance.
⏱️ **Infra | Frontend Build Fix**
   Investigate and fix the build failure causing rollbacks in the AWS App Runner service for the frontend.
⏱️ **UI | Dynamic Feature Carousel**
   Refactor the features carousel to dynamically toggle between Telegram and Slack showcases. Do not show both simultaneously; alternate them to simplify the marketing message.
✅ **UI | Settings Logout**
   Change the text color of the "Logout" button in the Settings Modal to **red** on hover.
⏱️ **UI | Settings Tooltips**
    Fix the tooltip behavior in the Settings Modal. Hovering/clicking on setting rows currently fails to display the informational card.
⏱️ **UI | Subscription Loader Alignment**
    Center the loading animation within the Subscription tab of the Settings Modal (currently misaligned to the top).
✅ **UI | Integrations Tab Cleanup**

- Replace custom SVGs with standard **React Icons** or **Lucide Icons** (specifically for Slack, WhatsApp, Google Calendar, and Telegram).
- Add `overflow-auto` and set `max-height` to match the modal height.
- _Note to Agent:_ If a specific icon is missing, flag it for manual review.

13. **Refactor | Shadcn UI Enforcement**
    Audit the codebase to ensure all dialogs, popups, and overlays strictly use **Shadcn UI** components. Replace any custom implementations.
14. **UI | Icon Theme Consistency**
    Standardize icon colors: **Black** for Light Mode, **Orange** for Dark Mode. Remove any multi-colored ("rainbow") icon styles.
15. **Feature | Cross-Platform Sync**
    Implement an optional synchronization feature. If enabled (default: `true`), conversations started on Telegram/Slack automatically sync with the web interface. Add a toggle for this in the Settings Modal.
16. **UX | Analytics Dashboard Overhaul**
    Redesign the Analytics page to be more inviting and hierarchical. Organize data by importance (top-down) or introduce tabs to segment insights logically.
17. **UI | Sidebar Buttons & Info Icons**

- Update icons for "Assistant," "Analytics," and "Quick Add Event" to better match the brand.
- Add an "Info" (i) icon next to these buttons that reveals a tooltip only on hover.

18. **Feature | Secure Conversation Sharing**
    Implement a "Share Link" feature allowing users to generate a unique link for a conversation. Ensure access is restricted so only the intended recipient can view it.
19. **Feature | Analytics URL Mirroring**
    Sync Analytics filters (dates, calendars) with the URL query parameters. This allows users to share or bookmark specific dashboard views (e.g., specific date ranges) across devices.
20. **UI | Dashboard Loader & Empty State**

- Fix the loader alignment (center it) when navigating to Dashboard/Billing.
- If no subscription actions exist, display an "Info" icon with explanatory text (similar to Transaction History).

21. **UI | Badge Styling**
    Remove hover effects on badges. They should maintain a static background color based on the active theme (Light/Dark).
22. **Mobile UI | File Attachment Input**

- Fix the "Remove" button on file attachments (currently cut off by `overflow-hidden`).
- Replace the remove button with a **Trash Icon** to match the conversation sidebar style.

23. **UI | Microphone Input Padding**
    Increase the padding of the microphone button in the input area to prevent layout breakage and match the text input height.
24. **UX | Toast Notifications for Actions**
    Trigger Toast notifications for specific actions: "Hear Response" toggle (Activate/Disable sound), "Copy Text," and "Reset/Re-trigger."
25. **Feature | Inline Message Editing**
    Allow users to inline-edit their previous messages in the chat interface. Submitting an edit should trigger a re-generation of the AI response (simulating a "step back" in the conversation).
26. **UI | Sidebar Navigation Update**
    Replace the "Quick Add Event" button in the top sidebar with a **"New Chat"** button. (Note: Remove the old "Quick Add Event" functionality entirely).
27. **Branding | Email Mentions**
    Scan the frontend for any hardcoded email addresses and replace them with `@askally.io`.
28. **UI | Input Textarea Expansion**
    Increase the visual weight of the input area on both desktop and mobile.

- Set fixed rows to `4`.
- Enable `overflow-auto` with a `max-height` of `200px`.
- Add more padding for a "fatter" look.

29. **Refactor | Component Reusability**
    Identify and refactor duplicate UI patterns into modular, reusable components to improve maintainability and architecture.
30. **UI | Pricing Consistency**
    Ensure the Pricing Plans displayed in the Dashboard/Billing section strictly match the external Pricing page components and data.
31. **UI | Footer Cleanup**
    Remove **Discord** from the footer social links (Supported platforms: Slack, Telegram, Google Calendar).
32. **Content | Help Center**
    Design and implement a dedicated Help Center page.
33. **Content | Changelog**
    Design and implement a UI page for the application Changelog.
34. **Content | Blog**
    Create a Blog section optimized for SEO.
35. **SEO | AI Crawler Optimization**
    Optimize all public pages (meta tags, structure) for better indexing by AI search engines (ChatGPT, Gemini, Claude).
36. **Mobile UI | Sidebar Alignment**
    Ensure the mobile sidebar matches the desktop sidebar in terms of item width and general visual proportions.
37. **Feature | Team Invite**
    Implement a feature allowing users to invite team members to join their Ally workspace.
38. **Feature | Affiliate/Referral Program**
    Implement a referral system: "Invite a friend, get 1 month free."
39. **UI | Timezone Dropdown Fix**
    Fix the Z-Index issue causing the Timezone dropdown in the Settings Modal to appear "behind" or outside the modal boundaries.
40. **Feature | Geo-Location Toggle**
    Implement a "Real-time Location" toggle (Default: `false`).

- If `true`: Use the user's lat/long for event creation context.
- Check feasibility for implementation on WhatsApp and Slack integrations.

41. **UX | Onboarding Wizard 2.0**
    Overhaul the onboarding flow:

- **Audio Support:** Auto-play audio instructions (with toggle OFF).
- **Step-by-Step:** Guided navigation highlighting specific components.
- **Content:** Detailed, marketing-focused explanations of the platform.
- **Logic:** Advance to the next step only after audio finishes or user clicks "Next."

42. **UI | Logo & Sidebar Spacing**

- Ensure the logo in the Settings Modal matches the Sidebar logo exactly.
- Adjust sidebar items to `justify-start` to reduce the large gap between the logo and the first menu item.
