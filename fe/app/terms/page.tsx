'use client'

import Link from 'next/link'
import MarketingLayout from '@/components/marketing/MarketingLayout'

export default function TermsOfServicePage() {
  const lastUpdated = 'January 11, 2026'
  const effectiveDate = 'January 5, 2026'

  return (
    <MarketingLayout>
      <div className="px-4 py-16 sm:px-6 md:py-20">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-10">
            <h1 className="mb-3 text-4xl font-bold tracking-tight text-foreground md:text-5xl">Terms of Service</h1>
            <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              Welcome to Ally. By accessing or using our service, you agree to be bound by these Terms of Service.
              Please read them carefully before using our calendar assistant.
            </p>
          </div>

          {/* Content */}
          <div className="space-y-10">
            {/* Introduction */}
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">1. Acceptance of Terms</h2>
              <p className="mb-4 leading-relaxed text-muted-foreground">
                By accessing or using Ally (the &quot;Service&quot;), operated by Ally Technologies Inc.
                (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), you agree to be bound by these Terms of Service
                (&quot;Terms&quot;). If you do not agree to these Terms, you may not use the Service.
              </p>
              <p className="leading-relaxed text-muted-foreground">
                These Terms apply to all users of the Service, including visitors, registered users, and users accessing
                the Service via third-party integrations (Telegram, WhatsApp).
              </p>
            </section>

            {/* Description of Service */}
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">2. Description of Service</h2>
              <p className="mb-4 leading-relaxed text-muted-foreground">
                Ally is an AI-powered calendar assistant that integrates with Google Calendar. Our Service provides:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                <li>Natural language calendar management through AI chat</li>
                <li>Automated event creation, modification, and deletion</li>
                <li>Schedule analysis, gap detection, and optimization recommendations</li>
                <li>Multi-platform access via web dashboard, Telegram bot, and WhatsApp</li>
                <li>Calendar insights and productivity analytics</li>
              </ul>
            </section>

            {/* Account Registration */}
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">3. Account Registration</h2>
              <p className="mb-4 leading-relaxed text-muted-foreground">
                To use Ally, you must create an account and connect your Google Calendar. By registering, you agree to:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                <li>Provide accurate, current, and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Promptly update your information if it changes</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access</li>
              </ul>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                You must be at least 13 years old to use the Service. If you are under 18, you represent that you have
                parental or guardian consent.
              </p>
            </section>

            {/* Google Calendar Integration */}
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">4. Google Calendar Integration</h2>
              <p className="mb-4 leading-relaxed text-muted-foreground">
                Ally requires access to your Google Calendar to function. By connecting your Google account, you:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                <li>
                  Grant Ally permission to read, create, modify, and delete calendar events on your behalf based on your
                  instructions
                </li>
                <li>Understand that Ally will access your calendar data to provide AI-powered assistance</li>
                <li>
                  Can revoke access at any time through your{' '}
                  <a
                    href="https://myaccount.google.com/permissions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google Account permissions
                  </a>{' '}
                  or Ally dashboard
                </li>
              </ul>

              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
                <p className="leading-relaxed text-muted-foreground">
                  <strong className="text-foreground">Important:</strong> Ally&apos;s use and transfer of information
                  received from Google APIs adheres to the{' '}
                  <a
                    href="https://developers.google.com/terms/api-services-user-data-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google API Services User Data Policy
                  </a>
                  , including the Limited Use requirements.
                </p>
              </div>
            </section>

            {/* Acceptable Use */}
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">5. Acceptable Use</h2>
              <p className="mb-4 leading-relaxed text-muted-foreground">
                You agree to use the Service only for lawful purposes and in compliance with these Terms. You agree NOT
                to:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Attempt to gain unauthorized access to our systems or other users&apos; accounts</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use automated systems (bots, scrapers) to access the Service without permission</li>
                <li>Transmit malware, spam, or other harmful content</li>
                <li>Impersonate any person or entity</li>
                <li>Use the AI assistant to generate harmful, abusive, or illegal content</li>
                <li>Attempt to reverse engineer, decompile, or extract source code from the Service</li>
                <li>Violate any applicable laws or regulations</li>
                <li>
                  Violate{' '}
                  <a
                    href="https://policies.google.com/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google&apos;s Terms of Service
                  </a>{' '}
                  or Acceptable Use Policy
                </li>
              </ul>
            </section>

            {/* Subscription and Payment */}
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">6. Subscription and Payment</h2>

              <h3 className="mb-3 mt-6 text-xl font-semibold text-foreground">6.1 Free Tier</h3>
              <p className="mb-4 leading-relaxed text-muted-foreground">
                Ally offers a free tier with limited features. Free accounts are subject to usage limits and may not
                include all features available to paid subscribers.
              </p>

              <h3 className="mb-3 mt-6 text-xl font-semibold text-foreground">6.2 Paid Subscriptions</h3>
              <p className="mb-4 leading-relaxed text-muted-foreground">
                Paid subscriptions provide access to premium features. By subscribing, you agree to:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-muted-foreground">
                <li>Pay the subscription fees at the frequency selected (monthly or annually)</li>
                <li>Automatic renewal unless you cancel before the renewal date</li>
                <li>Provide accurate billing information</li>
              </ul>

              <h3 className="mb-3 mt-6 text-xl font-semibold text-foreground">6.3 Cancellation</h3>
              <p className="mb-4 leading-relaxed text-muted-foreground">
                You may cancel your subscription at any time from your account settings. Upon cancellation:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                <li>Your subscription remains active until the end of the current billing period</li>
                <li>You will not be charged for subsequent periods</li>
                <li>Access to premium features will be removed at the end of the billing period</li>
              </ul>

              <h3 className="mb-3 mt-6 text-xl font-semibold text-foreground">6.4 Refunds</h3>
              <p className="leading-relaxed text-muted-foreground">
                Subscription fees are generally non-refundable. However, we may consider refund requests on a
                case-by-case basis. Contact{' '}
                <a href="mailto:hello@askally.io" className="text-primary hover:underline">
                  hello@askally.io
                </a>{' '}
                for refund inquiries.
              </p>
            </section>

            {/* Intellectual Property */}
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">7. Intellectual Property</h2>
              <p className="mb-4 leading-relaxed text-muted-foreground">
                The Service, including its original content, features, and functionality, is owned by Ally Technologies
                Inc. and is protected by intellectual property laws. This includes:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-muted-foreground">
                <li>Ally branding, logos, and visual design</li>
                <li>Software code and AI models</li>
                <li>Documentation and educational content</li>
              </ul>
              <p className="leading-relaxed text-muted-foreground">
                You retain ownership of your calendar data and content. By using the Service, you grant us a limited
                license to process your data solely to provide and improve the Service.
              </p>
            </section>

            {/* Privacy */}
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">8. Privacy</h2>
              <p className="leading-relaxed text-muted-foreground">
                Your privacy is important to us. Please review our{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                , which explains how we collect, use, and protect your data. By using the Service, you consent to the
                data practices described in our Privacy Policy.
              </p>
            </section>

            {/* Third-Party Services */}
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">9. Third-Party Services</h2>
              <p className="mb-4 leading-relaxed text-muted-foreground">
                The Service integrates with third-party services, including:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-muted-foreground">
                <li>
                  <strong className="text-foreground">Google Calendar:</strong> Subject to{' '}
                  <a
                    href="https://policies.google.com/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google&apos;s Terms of Service
                  </a>
                </li>
                <li>
                  <strong className="text-foreground">Telegram:</strong> Subject to{' '}
                  <a
                    href="https://telegram.org/tos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Telegram&apos;s Terms of Service
                  </a>
                </li>
                <li>
                  <strong className="text-foreground">WhatsApp:</strong> Subject to{' '}
                  <a
                    href="https://www.whatsapp.com/legal/terms-of-service"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    WhatsApp&apos;s Terms of Service
                  </a>
                </li>
                <li>
                  <strong className="text-foreground">Lemon Squeezy:</strong> Subject to{' '}
                  <a
                    href="https://www.lemonsqueezy.com/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Lemon Squeezy&apos;s Terms of Service
                  </a>
                </li>
                <li>
                  <strong className="text-foreground">OpenAI:</strong> AI processing subject to{' '}
                  <a
                    href="https://openai.com/policies/terms-of-use"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    OpenAI&apos;s Terms of Use
                  </a>
                </li>
              </ul>
              <p className="leading-relaxed text-muted-foreground">
                We are not responsible for the terms, practices, or availability of third-party services.
              </p>
            </section>

            {/* Disclaimers */}
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">10. Disclaimers</h2>
              <div className="rounded-xl border border-border bg-muted p-4">
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  <strong className="text-foreground">
                    THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY
                    KIND, EITHER EXPRESS OR IMPLIED.
                  </strong>
                </p>
                <p className="mb-4 leading-relaxed text-muted-foreground">We do not warrant that:</p>
                <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                  <li>The Service will be uninterrupted, secure, or error-free</li>
                  <li>AI-generated responses will be accurate or appropriate for your needs</li>
                  <li>Calendar operations will execute correctly in all circumstances</li>
                  <li>The Service will meet your specific requirements</li>
                </ul>
              </div>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                <strong className="text-foreground">AI Limitation:</strong> Ally uses artificial intelligence to process
                your requests. AI responses are generated based on patterns and may occasionally produce inaccurate or
                unexpected results. Always verify important calendar changes.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">11. Limitation of Liability</h2>
              <div className="rounded-xl border border-border bg-muted p-4">
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  <strong className="text-foreground">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, ALLY TECHNOLOGIES INC. SHALL NOT BE LIABLE FOR ANY INDIRECT,
                    INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
                  </strong>
                </p>
                <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                  <li>Loss of profits, data, or business opportunities</li>
                  <li>Missed appointments or scheduling conflicts</li>
                  <li>Errors in AI-generated calendar operations</li>
                  <li>Service interruptions or data loss</li>
                </ul>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  <strong className="text-foreground">
                    Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
                  </strong>
                </p>
              </div>
            </section>

            {/* Indemnification */}
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">12. Indemnification</h2>
              <p className="leading-relaxed text-muted-foreground">
                You agree to indemnify, defend, and hold harmless Ally Technologies Inc. and its officers, directors,
                employees, and agents from any claims, damages, losses, or expenses arising from:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
                <li>Content you provide through the Service</li>
              </ul>
            </section>

            {/* Termination */}
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">13. Termination</h2>
              <p className="mb-4 leading-relaxed text-muted-foreground">
                <strong className="text-foreground">By You:</strong> You may terminate your account at any time by
                disconnecting your Google Calendar and deleting your account from the dashboard, or by contacting us at{' '}
                <a href="mailto:hello@askally.io" className="text-primary hover:underline">
                  hello@askally.io
                </a>
                .
              </p>
              <p className="mb-4 leading-relaxed text-muted-foreground">
                <strong className="text-foreground">By Us:</strong> We may suspend or terminate your access to the
                Service immediately, without prior notice, if:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                <li>You breach these Terms</li>
                <li>Your use poses a security risk to the Service or other users</li>
                <li>Required by law</li>
                <li>Your account has been inactive for an extended period</li>
              </ul>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Upon termination, your right to use the Service will cease immediately, and we may delete your data in
                accordance with our Privacy Policy.
              </p>
            </section>

            {/* Changes to Terms */}
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">14. Changes to Terms</h2>
              <p className="leading-relaxed text-muted-foreground">
                We reserve the right to modify these Terms at any time. We will notify you of material changes by
                posting the updated Terms on this page and updating the &quot;Last Updated&quot; date. Your continued
                use of the Service after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            {/* Governing Law */}
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">15. Governing Law</h2>
              <p className="leading-relaxed text-muted-foreground">
                These Terms shall be governed by and construed in accordance with the laws of the State of Delaware,
                United States, without regard to its conflict of law provisions. Any disputes arising from these Terms
                or the Service shall be resolved in the courts of Delaware.
              </p>
            </section>

            {/* Severability */}
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">16. Severability</h2>
              <p className="leading-relaxed text-muted-foreground">
                If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in
                full force and effect.
              </p>
            </section>

            {/* Entire Agreement */}
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">17. Entire Agreement</h2>
              <p className="leading-relaxed text-muted-foreground">
                These Terms, together with our{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                , constitute the entire agreement between you and Ally Technologies Inc. regarding the Service.
              </p>
            </section>

            {/* Contact Us */}
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">18. Contact Us</h2>
              <p className="mb-4 leading-relaxed text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="rounded-xl border border-border bg-muted p-6">
                <p className="mb-2 text-muted-foreground">
                  <strong className="text-foreground">Email:</strong>{' '}
                  <a href="mailto:hello@askally.io" className="text-primary hover:underline">
                    hello@askally.io
                  </a>
                </p>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Company:</strong> Ally Technologies Inc.
                </p>
              </div>
            </section>

            {/* Back to Home */}
            <div className="border-t border-border pt-8">
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
