/**
 * Email Templates
 *
 * This folder contains React Email components for use with Resend.
 *
 * Prerequisites:
 *   npm install @react-email/components @react-email/render
 *   # or
 *   bun add @react-email/components @react-email/render
 *
 * Usage Example:
 *
 *   import { render } from "@react-email/render";
 *   import { DailyDigest } from "./emails";
 *   import { Resend } from "resend";
 *
 *   const resend = new Resend(process.env.RESEND_API_KEY);
 *
 *   // Option 1: Use React component directly (Resend supports this!)
 *   await resend.emails.send({
 *     from: "hello@askally.io",
 *     to: user.email,
 *     subject: "Your Daily Digest",
 *     react: <DailyDigest userName="John" dateFormatted="Wednesday, January 15" events={[...]} />,
 *   });
 *
 *   // Option 2: Render to HTML string
 *   const html = await render(
 *     <DailyDigest
 *       userName="John"
 *       dateFormatted="Wednesday, January 15"
 *       events={[
 *         { id: "1", summary: "Team Standup", start: "9:00 AM", duration: "30 min" },
 *         { id: "2", summary: "Client Call", start: "2:00 PM", duration: "1 hour", meetLink: "https://meet.google.com/xxx" },
 *       ]}
 *       aiSummary="You have a productive day ahead! Start with your team sync, then focus on deep work before your afternoon call."
 *       totalMeetingTime="1h 30m"
 *     />
 *   );
 *
 *   await resend.emails.send({
 *     from: "hello@askally.io",
 *     to: user.email,
 *     subject: "Your Daily Digest - 2 events today",
 *     html: html,
 *   });
 */

export {
  type CalendarEvent,
  DailyDigest,
  type DailyDigestProps,
} from "./DailyDigest";
export { MagicLinkEmail, type MagicLinkEmailProps } from "./MagicLinkEmail";
export {
  NewsletterEmail,
  type NewsletterEmailProps,
  type NewsletterFeature,
} from "./NewsletterEmail";
export {
  NotificationEmail,
  type NotificationEmailProps,
} from "./NotificationEmail";
export { ReceiptEmail, type ReceiptEmailProps } from "./ReceiptEmail";
export {
  ResetPasswordEmail,
  type ResetPasswordEmailProps,
} from "./ResetPasswordEmail";
export { WelcomeEmail, type WelcomeEmailProps } from "./WelcomeEmail";
