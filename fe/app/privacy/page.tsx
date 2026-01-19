'use client'

import Link from 'next/link'
import MarketingLayout from '@/components/marketing/MarketingLayout'

export default function PrivacyPolicyPage() {
  const lastUpdated = 'January 11, 2026'
  const effectiveDate = 'January 5, 2026'

  return (
    <MarketingLayout>
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-foreground dark:text-primary-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground dark:text-muted-foreground">
              Last Updated: {lastUpdated} | Effective Date: {effectiveDate}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-zinc dark:prose-invert max-w-none">
            {/* Introduction */}
            <section className="mb-12">
              <h2 className="text-2xl font-medium text-foreground dark:text-primary-foreground mb-4">
                1. Introduction
              </h2>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                Welcome to Ally (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). Ally Technologies Inc. operates
                the Ally application and related services (collectively, the &quot;Service&quot;). This Privacy Policy
                explains how we collect, use, disclose, and safeguard your information when you use our Service.
              </p>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                By accessing or using Ally, you agree to this Privacy Policy. If you do not agree with the terms of this
                Privacy Policy, please do not access the Service.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-12">
              <h2 className="text-2xl font-medium text-foreground dark:text-primary-foreground mb-4">
                2. Contact Information
              </h2>
              <div className="bg-muted dark:bg-secondary/50 rounded-xl p-6 border ">
                <p className="text-zinc-600 dark:text-zinc-300 mb-2">
                  <strong>Company:</strong> Ally Technologies Inc.
                </p>
                <p className="text-zinc-600 dark:text-zinc-300 mb-2">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:hello@askally.io" className="text-primary hover:underline">
                    hello@askally.io
                  </a>
                </p>
                <p className="text-zinc-600 dark:text-zinc-300">
                  <strong>Website:</strong>{' '}
                  <a href="https://askally.io" className="text-primary hover:underline">
                    https://askally.io
                  </a>
                </p>
              </div>
            </section>

            {/* Information We Collect */}
            <section className="mb-12">
              <h2 className="text-2xl font-medium text-foreground dark:text-primary-foreground mb-4">
                3. Information We Collect
              </h2>

              <h3 className="text-xl font-medium text-foreground dark:text-primary-foreground mb-3 mt-6">
                3.1 Information You Provide
              </h3>
              <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-300 space-y-2 mb-4">
                <li>
                  <strong>Account Information:</strong> Email address, name, profile picture, and timezone when you
                  create an account.
                </li>
                <li>
                  <strong>Communication Data:</strong> Messages and instructions you send to our AI assistant.
                </li>
                <li>
                  <strong>Payment Information:</strong> Billing details processed securely through Lemon Squeezy (we do
                  not store your full payment card details).
                </li>
              </ul>

              <h3 className="text-xl font-medium text-foreground dark:text-primary-foreground mb-3 mt-6">
                3.2 Information from Third-Party Services
              </h3>
              <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-300 space-y-2 mb-4">
                <li>
                  <strong>Google Account:</strong> Basic profile information (name, email, profile picture) when you
                  authenticate with Google.
                </li>
                <li>
                  <strong>Google Calendar:</strong> Calendar events, event details, and calendar settings to provide our
                  core scheduling features.
                </li>
                <li>
                  <strong>Telegram:</strong> Telegram user ID, username, and chat messages when you link your Telegram
                  account.
                </li>
                <li>
                  <strong>WhatsApp:</strong> Your phone number and chat messages when you interact with Ally via
                  WhatsApp.
                </li>
              </ul>

              <h3 className="text-xl font-medium text-foreground dark:text-primary-foreground mb-3 mt-6">
                3.3 Automatically Collected Information
              </h3>
              <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-300 space-y-2">
                <li>Device information and browser type</li>
                <li>IP address and approximate location</li>
                <li>Usage patterns and feature interactions</li>
                <li>Error logs and performance data</li>
              </ul>
            </section>

            {/* Google User Data - CRITICAL SECTION */}
            <section className="mb-12 bg-primary/5 dark:bg-blue-950/30 rounded-xl p-6 border-primary/20 -blue-800">
              <h2 className="text-2xl font-medium text-foreground dark:text-primary-foreground mb-4">
                4. Google User Data
              </h2>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                This section specifically addresses how Ally accesses, uses, stores, and shares Google user data
                obtained through Google OAuth authentication.
              </p>

              <h3 className="text-xl font-medium text-foreground dark:text-primary-foreground mb-3 mt-6">
                4.1 Google Scopes We Request
              </h3>
              <p className="text-zinc-600 dark:text-zinc-300 mb-4">
                Ally requests access to the following Google OAuth scopes. Each scope is necessary for specific features
                of our AI calendar assistant:
              </p>

              <h4 className="text-lg font-medium text-foreground dark:text-primary-foreground mb-2 mt-4">
                Authentication Scopes
              </h4>
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm text-zinc-600 dark:text-zinc-300 border-collapse">
                  <thead>
                    <tr className="border-b ">
                      <th className="text-left py-2 pr-4 font-medium">Scope</th>
                      <th className="text-left py-2 font-medium">Purpose & Justification</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-zinc-100 ">
                      <td className="py-2 pr-4 font-mono text-xs">openid</td>
                      <td className="py-2">Required for secure authentication using OpenID Connect protocol</td>
                    </tr>
                    <tr className="border-b border-zinc-100 ">
                      <td className="py-2 pr-4 font-mono text-xs">email</td>
                      <td className="py-2">
                        Access your email address to create your account and send important notifications about your
                        calendar
                      </td>
                    </tr>
                    <tr className="border-b border-zinc-100 ">
                      <td className="py-2 pr-4 font-mono text-xs">profile</td>
                      <td className="py-2">
                        Access your name and profile picture to personalize your Ally dashboard experience
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h4 className="text-lg font-medium text-foreground dark:text-primary-foreground mb-2 mt-4">
                Calendar Access Scopes
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-zinc-600 dark:text-zinc-300 border-collapse">
                  <thead>
                    <tr className="border-b ">
                      <th className="text-left py-2 pr-4 font-medium">Scope</th>
                      <th className="text-left py-2 font-medium">Purpose & Justification</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-zinc-100 ">
                      <td className="py-2 pr-4 font-mono text-xs">calendar</td>
                      <td className="py-2">
                        <strong>Full calendar access:</strong> Required to create, edit, move, and delete events when
                        you instruct Ally via chat. This is the core functionality of our AI assistant.
                      </td>
                    </tr>
                    <tr className="border-b border-zinc-100 ">
                      <td className="py-2 pr-4 font-mono text-xs">calendar.events</td>
                      <td className="py-2">
                        <strong>Event management:</strong> Enables Ally to create new events, update existing ones, and
                        delete events across all your calendars based on your natural language instructions.
                      </td>
                    </tr>
                    <tr className="border-b border-zinc-100 ">
                      <td className="py-2 pr-4 font-mono text-xs">calendar.events.owned</td>
                      <td className="py-2">
                        <strong>Your owned events:</strong> Manage events that you own (created by you), ensuring Ally
                        can properly handle event modifications and deletions.
                      </td>
                    </tr>
                    <tr className="border-b border-zinc-100 ">
                      <td className="py-2 pr-4 font-mono text-xs">calendar.events.owned.readonly</td>
                      <td className="py-2">
                        <strong>Read your owned events:</strong> View events you created to provide analytics, insights,
                        and AI-powered schedule optimization suggestions.
                      </td>
                    </tr>
                    <tr className="border-b border-zinc-100 ">
                      <td className="py-2 pr-4 font-mono text-xs">calendar.readonly</td>
                      <td className="py-2">
                        <strong>View calendar data:</strong> Read your calendar to understand your schedule, detect
                        conflicts, find available time slots, and provide intelligent scheduling suggestions.
                      </td>
                    </tr>
                    <tr className="border-b border-zinc-100 ">
                      <td className="py-2 pr-4 font-mono text-xs">calendar.calendarlist</td>
                      <td className="py-2">
                        <strong>Calendar list access:</strong> View and manage your list of calendars so you can choose
                        which calendars Ally should work with.
                      </td>
                    </tr>
                    <tr className="border-b border-zinc-100 ">
                      <td className="py-2 pr-4 font-mono text-xs">calendar.calendarlist.readonly</td>
                      <td className="py-2">
                        <strong>View calendar list:</strong> See all your calendars (work, personal, shared) to display
                        them in your dashboard and let you select which ones to manage.
                      </td>
                    </tr>
                    <tr className="border-b border-zinc-100 ">
                      <td className="py-2 pr-4 font-mono text-xs">calendar.freebusy</td>
                      <td className="py-2">
                        <strong>Free/busy information:</strong> Check when you&apos;re available or busy to help
                        schedule new events at optimal times without conflicts.
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-mono text-xs">calendar.app.created</td>
                      <td className="py-2">
                        <strong>App-created calendars:</strong> Manage calendars that Ally creates on your behalf (if
                        you request Ally to create a new calendar).
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-primary/5 dark:bg-blue-950/30 rounded-lg p-4 border-primary/20 -blue-800 mt-4">
                <p className="text-zinc-700 dark:text-zinc-200 text-sm">
                  <strong>Why we need these permissions:</strong> Ally is a full-featured AI calendar assistant that
                  manages your schedule through natural language. To understand commands like &quot;Move my 3pm meeting
                  to tomorrow&quot; or &quot;Find a free slot for a dentist appointment next week,&quot; we need
                  comprehensive access to read your calendar and make changes on your behalf. You can revoke these
                  permissions at any time.
                </p>
              </div>

              <h3 className="text-xl font-medium text-foreground dark:text-primary-foreground mb-3 mt-6">
                4.2 How We Use Google Data
              </h3>
              <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-300 space-y-2 mb-4">
                <li>
                  <strong>Calendar Management:</strong> Create, edit, move, and delete events based on your instructions
                  to the AI assistant.
                </li>
                <li>
                  <strong>Schedule Analysis:</strong> Analyze your calendar to identify gaps, conflicts, and
                  optimization opportunities.
                </li>
                <li>
                  <strong>AI Assistance:</strong> Provide context to our AI so it can understand your schedule and
                  respond intelligently to your requests.
                </li>
                <li>
                  <strong>Notifications:</strong> Send you reminders and updates about your calendar events.
                </li>
              </ul>

              <h3 className="text-xl font-medium text-foreground dark:text-primary-foreground mb-3 mt-6">
                4.3 Google Data Storage
              </h3>
              <p className="text-zinc-600 dark:text-zinc-300 mb-4">
                We store the following Google-related data in our secure database (Supabase):
              </p>
              <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-300 space-y-2 mb-4">
                <li>OAuth access tokens and refresh tokens (encrypted)</li>
                <li>Your Google profile information (name, email, profile picture)</li>
                <li>Calendar metadata (calendar names, colors, timezone)</li>
                <li>Event data necessary for AI context and gap analysis</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground dark:text-primary-foreground mb-3 mt-6">
                4.4 No Human Access to Your Data
              </h3>
              <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border-green-200 -green-800 mb-4">
                <p className="text-zinc-700 dark:text-zinc-200 font-medium">
                  Ally employees and contractors do not read your Google Calendar data unless:
                </p>
                <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-300 mt-2 space-y-1">
                  <li>You explicitly request human support and grant permission</li>
                  <li>Required by law or to investigate security incidents</li>
                  <li>Necessary to enforce our Terms of Service</li>
                </ul>
              </div>

              <h3 className="text-xl font-medium text-foreground dark:text-primary-foreground mb-3 mt-6">
                4.5 Google API Services User Data Policy Compliance
              </h3>
              <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 border-amber-200 -amber-800">
                <p className="text-zinc-700 dark:text-zinc-200 leading-relaxed">
                  <strong>
                    Ally&apos;s use and transfer to any other app of information received from Google APIs will adhere
                    to the{' '}
                    <a
                      href="https://developers.google.com/terms/api-services-user-data-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Google API Services User Data Policy
                    </a>
                    , including the Limited Use requirements.
                  </strong>
                </p>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section className="mb-12">
              <h2 className="text-2xl font-medium text-foreground dark:text-primary-foreground mb-4">
                5. How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-300 space-y-2">
                <li>Provide, maintain, and improve our Service</li>
                <li>Process your AI assistant requests and calendar operations</li>
                <li>Send you service-related communications</li>
                <li>Analyze usage patterns to enhance user experience</li>
                <li>Detect and prevent fraud, abuse, and security incidents</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            {/* Third-Party Data Sharing */}
            <section className="mb-12">
              <h2 className="text-2xl font-medium text-foreground dark:text-primary-foreground mb-4">
                6. Third-Party Data Sharing
              </h2>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                We share your data with the following third parties only as necessary to provide our Service:
              </p>

              <div className="space-y-4">
                <div className="bg-muted dark:bg-secondary/50 rounded-lg p-4 border ">
                  <h4 className="font-medium text-foreground dark:text-primary-foreground mb-2">OpenAI</h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    <strong>Purpose:</strong> AI processing of your messages and calendar context to generate
                    intelligent responses.
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">
                    <strong>Data Shared:</strong> Your chat messages, event summaries (not full details), and
                    conversation history.
                  </p>
                </div>

                <div className="bg-muted dark:bg-secondary/50 rounded-lg p-4 border ">
                  <h4 className="font-medium text-foreground dark:text-primary-foreground mb-2">Supabase</h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    <strong>Purpose:</strong> Secure database hosting and authentication services.
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">
                    <strong>Data Shared:</strong> All user data is stored in Supabase&apos;s PostgreSQL database with
                    Row-Level Security enabled.
                  </p>
                </div>

                <div className="bg-muted dark:bg-secondary/50 rounded-lg p-4 border ">
                  <h4 className="font-medium text-foreground dark:text-primary-foreground mb-2">Lemon Squeezy</h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    <strong>Purpose:</strong> Payment processing for subscription plans.
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">
                    <strong>Data Shared:</strong> Email, name, and payment information required for transactions.
                  </p>
                </div>

                <div className="bg-muted dark:bg-secondary/50 rounded-lg p-4 border ">
                  <h4 className="font-medium text-foreground dark:text-primary-foreground mb-2">Telegram Bot API</h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    <strong>Purpose:</strong> Enable chat-based calendar management via Telegram.
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">
                    <strong>Data Shared:</strong> Your Telegram user ID, messages sent to the bot, and AI responses.
                  </p>
                </div>

                <div className="bg-muted dark:bg-secondary/50 rounded-lg p-4 border ">
                  <h4 className="font-medium text-foreground dark:text-primary-foreground mb-2">
                    WhatsApp Business API (Meta)
                  </h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    <strong>Purpose:</strong> Enable chat-based calendar management via WhatsApp messaging.
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">
                    <strong>Data Shared:</strong> Your WhatsApp phone number, messages sent to our business number, and
                    AI responses.
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">
                    <strong>Note:</strong> WhatsApp messages are processed through Meta&apos;s WhatsApp Business
                    Platform. See{' '}
                    <a
                      href="https://www.whatsapp.com/legal/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      WhatsApp&apos;s Privacy Policy
                    </a>{' '}
                    for details on their data handling.
                  </p>
                </div>
              </div>

              <p className="text-zinc-600 dark:text-zinc-300 mt-4">
                <strong>We do not sell your personal data to third parties.</strong>
              </p>
            </section>

            {/* Data Retention */}
            <section className="mb-12">
              <h2 className="text-2xl font-medium text-foreground dark:text-primary-foreground mb-4">
                7. Data Retention
              </h2>
              <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-300 space-y-2">
                <li>
                  <strong>Account Data:</strong> Retained while your account is active and for up to 30 days after
                  deletion request.
                </li>
                <li>
                  <strong>Conversation History:</strong> Retained for 90 days to provide context for AI interactions,
                  then automatically summarized and archived.
                </li>
                <li>
                  <strong>OAuth Tokens:</strong> Retained while your account is active; immediately revoked upon
                  disconnection or account deletion.
                </li>
                <li>
                  <strong>AI Session Data:</strong> Automatically expired and cleaned up after session completion.
                </li>
                <li>
                  <strong>Gap Analysis Data:</strong> Pending gaps are automatically cleaned up after 7 days.
                </li>
              </ul>
            </section>

            {/* Your Rights */}
            <section className="mb-12">
              <h2 className="text-2xl font-medium text-foreground dark:text-primary-foreground mb-4">8. Your Rights</h2>
              <p className="text-zinc-600 dark:text-zinc-300 mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-300 space-y-2">
                <li>
                  <strong>Access:</strong> Request a copy of the personal data we hold about you.
                </li>
                <li>
                  <strong>Correction:</strong> Request correction of inaccurate personal data.
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your personal data and revocation of Google access.
                </li>
                <li>
                  <strong>Portability:</strong> Request your data in a machine-readable format.
                </li>
                <li>
                  <strong>Disconnect Google:</strong> Revoke Ally&apos;s access to your Google Calendar at any time from
                  your dashboard or{' '}
                  <a
                    href="https://myaccount.google.com/permissions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google Account settings
                  </a>
                  .
                </li>
              </ul>
              <p className="text-zinc-600 dark:text-zinc-300 mt-4">
                To exercise these rights, contact us at{' '}
                <a href="mailto:hello@askally.io" className="text-primary hover:underline">
                  hello@askally.io
                </a>
                .
              </p>
            </section>

            {/* Security */}
            <section className="mb-12">
              <h2 className="text-2xl font-medium text-foreground dark:text-primary-foreground mb-4">9. Security</h2>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-300 space-y-2">
                <li>HTTPS encryption for all data in transit</li>
                <li>Encrypted storage for OAuth tokens and sensitive data</li>
                <li>Row-Level Security (RLS) policies in our database</li>
                <li>Rate limiting and abuse prevention</li>
                <li>Regular security audits and monitoring</li>
                <li>HTTP-only cookies for session management</li>
              </ul>
            </section>

            {/* Children's Privacy */}
            <section className="mb-12">
              <h2 className="text-2xl font-medium text-foreground dark:text-primary-foreground mb-4">
                10. Children&apos;s Privacy
              </h2>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Ally is not intended for users under 13 years of age. We do not knowingly collect personal information
                from children under 13. If you believe we have collected data from a child under 13, please contact us
                immediately at{' '}
                <a href="mailto:hello@askally.io" className="text-primary hover:underline">
                  hello@askally.io
                </a>
                .
              </p>
            </section>

            {/* International Data Transfers */}
            <section className="mb-12">
              <h2 className="text-2xl font-medium text-foreground dark:text-primary-foreground mb-4">
                11. International Data Transfers
              </h2>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Your data may be transferred to and processed in countries other than your country of residence,
                including the United States. We ensure appropriate safeguards are in place to protect your data in
                accordance with this Privacy Policy and applicable data protection laws.
              </p>
            </section>

            {/* Changes to This Policy */}
            <section className="mb-12">
              <h2 className="text-2xl font-medium text-foreground dark:text-primary-foreground mb-4">
                12. Changes to This Privacy Policy
              </h2>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by
                posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date. We encourage
                you to review this Privacy Policy periodically.
              </p>
            </section>

            {/* Contact Us */}
            <section className="mb-12">
              <h2 className="text-2xl font-medium text-foreground dark:text-primary-foreground mb-4">13. Contact Us</h2>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-muted dark:bg-secondary/50 rounded-xl p-6 border ">
                <p className="text-zinc-600 dark:text-zinc-300 mb-2">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:hello@askally.io" className="text-primary hover:underline">
                    hello@askally.io
                  </a>
                </p>
                <p className="text-zinc-600 dark:text-zinc-300">
                  <strong>Company:</strong> Ally Technologies Inc.
                </p>
              </div>
            </section>

            {/* Back to Home */}
            <div className="pt-8 border-t border ">
              <Link href="/" className="text-primary hover:underline">
                &larr; Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  )
}
