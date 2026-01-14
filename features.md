### **Features & Bug Fixes (In Progress & Pending)**

⏱️ **Backend | Voice & Agent Optimization**
Replace OpenAI Whisper with ElevenLabs to improve voice synthesis quality. Refactor backend prompts to be provider-agnostic, enabling support for multiple AI agents (ElevenLabs, Gemini, Claude) alongside existing ones.

⏱️ **Feature | Google Meet Integration**
Implement logic to verify if the "Invite to Google Meet" feature is enabled when a user provides an email. If enabled, execute the invite; if not, handle the error gracefully or prompt for enablement.

⏱️ **Backend/Frontend | Organization Support**
Implement "Organization" vs. "Individual" user logic.

- **DB:** Add necessary columns to Supabase tables via CLI and regenerate `package.json` types.
- **Validation:** Ensure cross-user validation within organizations to resolve conflicts.
- **FE:** Add a setting in the Settings Modal to identify and manage user types.

16. **UX | Analytics Dashboard Overhaul**
    Redesign the Analytics page to be more inviting and hierarchical. Organize data by importance (top-down) or introduce tabs to segment insights logically.
17. **UX | Toast Notifications for Actions**
    Trigger Toast notifications for specific actions: "Hear Response" toggle (Activate/Disable sound), "Copy Text," and "Reset/Re-trigger."
18. **Feature | Inline Message Editing**
    Allow users to inline-edit their previous messages in the chat interface. Submitting an edit should trigger a re-generation of the AI response (simulating a "step back" in the conversation).
19. **UI | Sidebar Navigation Update**
    Replace the "Quick Add Event" button in the top sidebar with a **"New Chat"** button. (Note: Remove the old "Quick Add Event" functionality entirely).
20. **Branding | Email Mentions**
    Scan the frontend for any hardcoded email addresses and replace them with `@askally.io`.
21. **UI | Input Textarea Expansion**
    Increase the visual weight of the input area on both desktop and mobile.

- Set fixed rows to `4`.
- Enable `overflow-auto` with a `max-height` of `200px`.
- Add more padding for a "fatter" look.

22. **Refactor | Component Reusability**
    Identify and refactor duplicate UI patterns into modular, reusable components to improve maintainability and architecture.
23. **UI | Pricing Consistency**
    Ensure the Pricing Plans displayed in the Dashboard/Billing section strictly match the external Pricing page components and data.
24. **Content | Help Center**
    Design and implement a dedicated Help Center page.
25. **Content | Changelog**
    Design and implement a UI page for the application Changelog.
26. **Content | Blog**
    Create a Blog section optimized for SEO.
27. **SEO | AI Crawler Optimization**
    Optimize all public pages (meta tags, structure) for better indexing by AI search engines (ChatGPT, Gemini, Claude).
28. **Mobile UI | Sidebar Alignment**
    Ensure the mobile sidebar matches the desktop sidebar in terms of item width and general visual proportions.
29. **Feature | Team Invite**
    Implement a feature allowing users to invite team members to join their Ally workspace.
30. **Feature | Affiliate/Referral Program**
    Implement a referral system: "Invite a friend, get 1 month free."
31. **UI | Timezone Dropdown Fix**
    Fix the Z-Index issue causing the Timezone dropdown in the Settings Modal to appear "behind" or outside the modal boundaries.
32. **Feature | Geo-Location Toggle**
    Implement a "Real-time Location" toggle (Default: `false`).

- If `true`: Use the user's lat/long for event creation context.
- Check feasibility for implementation on WhatsApp and Slack integrations.

33. **UX | Onboarding Wizard 2.0**
    Overhaul the onboarding flow:

- **Audio Support:** Auto-play audio instructions (with toggle OFF).
- **Step-by-Step:** Guided navigation highlighting specific components.
- **Content:** Detailed, marketing-focused explanations of the platform.
- **Logic:** Advance to the next step only after audio finishes or user clicks "Next."

34. **UI | Logo & Sidebar Spacing**

- Ensure the logo in the Settings Modal matches the Sidebar logo exactly.
- Adjust sidebar items to `justify-start` to reduce the large gap between the logo and the first menu item.
