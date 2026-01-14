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

1. **UX | Toast Notifications for Actions**
   Trigger Toast notifications for specific actions: "Hear Response" toggle (Activate/Disable sound), "Copy Text," and "Reset/Re-trigger."

2. **UI | Sidebar Navigation Update**
   Replace the "Quick Add Event" button in the top sidebar with a **"New Chat"** button. (Note: Remove the old "Quick Add Event" functionality entirely).

3. **Branding | Email Mentions**
   Scan the frontend for any hardcoded email addresses and replace them with `@askally.io`.

4. **UI | Input Textarea Expansion**
   Increase the visual weight of the input area on both desktop and mobile.

- Set fixed rows to `4`.
- Enable `overflow-auto` with a `max-height` of `200px`.
- Add more padding for a "fatter" look.

5. **Refactor | Component Reusability**
   Identify and refactor duplicate UI patterns into modular, reusable components to improve maintainability and architecture.

6. **UI | Pricing Consistency**
   Ensure the Pricing Plans displayed in the Dashboard/Billing section strictly match the external Pricing page components and data.

7. **Mobile UI | Sidebar Alignment**
   Ensure the mobile sidebar matches the desktop sidebar in terms of item width and general visual proportions.

8. **Feature | Team Invite**
   Implement a feature allowing users to invite team members to join their Ally workspace.

9. **Feature | Affiliate/Referral Program**
   Implement a referral system: "Invite a friend, get 1 month free."

10. **Feature | Geo-Location Toggle**
    Implement a "Real-time Location" toggle (Default: `false`).

- If `true`: Use the user's lat/long for event creation context.
- Check feasibility for implementation on WhatsApp and Slack integrations.

11. **UX | Onboarding Wizard 2.0**
    Overhaul the onboarding flow:

- **Audio Support:** Auto-play audio instructions (with toggle OFF).
- **Step-by-Step:** Guided navigation highlighting specific components.
- **Content:** Detailed, marketing-focused explanations of the platform.
- **Logic:** Advance to the next step only after audio finishes or user clicks "Next."
