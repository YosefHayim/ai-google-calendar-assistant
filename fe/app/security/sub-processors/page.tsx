'use client'

import Link from 'next/link'
import MarketingLayout from '@/components/marketing/MarketingLayout'

export default function SubProcessorsPage() {
  const lastUpdated = 'January 21, 2026'
  const effectiveDate = 'January 15, 2026'

  return (
    <MarketingLayout>
      <div className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-12">
            <h1 className="mb-4 text-4xl font-medium tracking-tight text-foreground dark:text-primary-foreground md:text-5xl">
              Sub-Processors
            </h1>
            <p className="text-muted-foreground dark:text-muted-foreground">
              Last Updated: {lastUpdated} | Effective Date: {effectiveDate}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-zinc max-w-none dark:prose-invert">
            {/* Introduction */}
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-medium text-foreground dark:text-primary-foreground">
                1. Introduction
              </h2>
              <p className="mb-4 leading-relaxed text-zinc-600 dark:text-zinc-300">
                Ally Technologies Inc. (&quot;we,&quot; &quot;our,&quot; or &quot;Ally&quot;) uses various third-party
                service providers (sub-processors) to help us deliver our AI-powered calendar assistant service. This
                page lists our sub-processors and explains our requirements for them.
              </p>
              <p className="leading-relaxed text-zinc-600 dark:text-zinc-300">
                We carefully select sub-processors that meet our high standards for security, privacy, and compliance.
                All sub-processors are contractually obligated to maintain appropriate technical and organizational
                measures to protect your data.
              </p>
            </section>

            {/* Sub-Processor Requirements */}
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-medium text-foreground dark:text-primary-foreground">
                2. Sub-Processor Requirements
              </h2>
              <p className="mb-4 leading-relaxed text-zinc-600 dark:text-zinc-300">
                Before engaging any sub-processor, we require them to meet the following minimum standards:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-zinc-600 dark:text-zinc-300">
                <li>
                  <strong>Security Certifications:</strong> SOC 2 Type II, ISO 27001, or equivalent certification
                </li>
                <li>
                  <strong>GDPR Compliance:</strong> Valid data processing agreements and GDPR compliance
                </li>
                <li>
                  <strong>Data Protection:</strong> Industry-standard encryption and security measures
                </li>
                <li>
                  <strong>Audit Rights:</strong> Right to audit their security and compliance practices
                </li>
                <li>
                  <strong>Incident Response:</strong> 24-hour incident notification and response procedures
                </li>
                <li>
                  <strong>Data Deletion:</strong> Ability to delete customer data upon request or termination
                </li>
                <li>
                  <strong>Regular Assessments:</strong> Annual security audits and vulnerability assessments
                </li>
              </ul>
            </section>

            {/* Core Infrastructure Sub-Processors */}
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-medium text-foreground dark:text-primary-foreground">
                3. Core Infrastructure Sub-Processors
              </h2>

              <div className="space-y-6">
                <div className="rounded-lg border bg-muted p-6 dark:bg-secondary/50">
                  <h3 className="mb-3 text-xl font-medium text-foreground dark:text-primary-foreground">Supabase</h3>
                  <div className="grid gap-4 text-sm md:grid-cols-2">
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Purpose</p>
                      <p className="text-zinc-600 dark:text-zinc-300">
                        Database hosting, authentication, and real-time features
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Location</p>
                      <p className="text-zinc-600 dark:text-zinc-300">USA</p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Certification</p>
                      <p className="text-zinc-600 dark:text-zinc-300">SOC 2 Type II</p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Data Stored</p>
                      <p className="text-zinc-600 dark:text-zinc-300">
                        User profiles, calendar data, conversation history
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted p-6 dark:bg-secondary/50">
                  <h3 className="mb-3 text-xl font-medium text-foreground dark:text-primary-foreground">
                    Google Cloud Platform
                  </h3>
                  <div className="grid gap-4 text-sm md:grid-cols-2">
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Purpose</p>
                      <p className="text-zinc-600 dark:text-zinc-300">
                        Calendar API, cloud infrastructure, and data processing
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Location</p>
                      <p className="text-zinc-600 dark:text-zinc-300">USA</p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Certification</p>
                      <p className="text-zinc-600 dark:text-zinc-300">ISO 27001, SOC 2/3</p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Data Stored</p>
                      <p className="text-zinc-600 dark:text-zinc-300">OAuth tokens, calendar metadata</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted p-6 dark:bg-secondary/50">
                  <h3 className="mb-3 text-xl font-medium text-foreground dark:text-primary-foreground">
                    Redis Labs (Upstash)
                  </h3>
                  <div className="grid gap-4 text-sm md:grid-cols-2">
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Purpose</p>
                      <p className="text-zinc-600 dark:text-zinc-300">Session storage and caching</p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Location</p>
                      <p className="text-zinc-600 dark:text-zinc-300">USA</p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Certification</p>
                      <p className="text-zinc-600 dark:text-zinc-300">Enterprise-grade security</p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Data Stored</p>
                      <p className="text-zinc-600 dark:text-zinc-300">Session data, temporary cache</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted p-6 dark:bg-secondary/50">
                  <h3 className="mb-3 text-xl font-medium text-foreground dark:text-primary-foreground">
                    Amazon Web Services (AWS)
                  </h3>
                  <div className="grid gap-4 text-sm md:grid-cols-2">
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Purpose</p>
                      <p className="text-zinc-600 dark:text-zinc-300">
                        Cloud hosting and infrastructure for the application backend
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Location</p>
                      <p className="text-zinc-600 dark:text-zinc-300">USA</p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Certification</p>
                      <p className="text-zinc-600 dark:text-zinc-300">SOC 2, ISO 27001</p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Data Stored</p>
                      <p className="text-zinc-600 dark:text-zinc-300">
                        Application infrastructure and temporary processing data
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Service Sub-Processors */}
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-medium text-foreground dark:text-primary-foreground">
                4. Service Sub-Processors
              </h2>

              <div className="space-y-6">
                <div className="rounded-lg border bg-muted p-6 dark:bg-secondary/50">
                  <h3 className="mb-3 text-xl font-medium text-foreground dark:text-primary-foreground">
                    OpenAI / Anthropic / Google Gemini
                  </h3>
                  <div className="grid gap-4 text-sm md:grid-cols-2">
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Purpose</p>
                      <p className="text-zinc-600 dark:text-zinc-300">
                        Large Language Model processing for AI assistant features
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Location</p>
                      <p className="text-zinc-600 dark:text-zinc-300">USA</p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Certification</p>
                      <p className="text-zinc-600 dark:text-zinc-300">Enterprise security with data encryption</p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Data Stored</p>
                      <p className="text-zinc-600 dark:text-zinc-300">
                        No permanent storage - data processed in sessions only
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted p-6 dark:bg-secondary/50">
                  <h3 className="mb-3 text-xl font-medium text-foreground dark:text-primary-foreground">
                    Lemon Squeezy
                  </h3>
                  <div className="grid gap-4 text-sm md:grid-cols-2">
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Purpose</p>
                      <p className="text-zinc-600 dark:text-zinc-300">Payment processing for subscriptions</p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Location</p>
                      <p className="text-zinc-600 dark:text-zinc-300">USA</p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Certification</p>
                      <p className="text-zinc-600 dark:text-zinc-300">PCI DSS certified</p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Data Stored</p>
                      <p className="text-zinc-600 dark:text-zinc-300">
                        Payment information (we don't store card details)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted p-6 dark:bg-secondary/50">
                  <h3 className="mb-3 text-xl font-medium text-foreground dark:text-primary-foreground">Vercel</h3>
                  <div className="grid gap-4 text-sm md:grid-cols-2">
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Purpose</p>
                      <p className="text-zinc-600 dark:text-zinc-300">Frontend hosting and content delivery</p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Location</p>
                      <p className="text-zinc-600 dark:text-zinc-300">Global CDN</p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Certification</p>
                      <p className="text-zinc-600 dark:text-zinc-300">SOC 2 Type II</p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Data Stored</p>
                      <p className="text-zinc-600 dark:text-zinc-300">Static assets, no user data</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted p-6 dark:bg-secondary/50">
                  <h3 className="mb-3 text-xl font-medium text-foreground dark:text-primary-foreground">Resend</h3>
                  <div className="grid gap-4 text-sm md:grid-cols-2">
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Purpose</p>
                      <p className="text-zinc-600 dark:text-zinc-300">Sending transactional emails and notifications</p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Location</p>
                      <p className="text-zinc-600 dark:text-zinc-300">USA</p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Certification</p>
                      <p className="text-zinc-600 dark:text-zinc-300">SOC 2 certified</p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Data Stored</p>
                      <p className="text-zinc-600 dark:text-zinc-300">Email delivery logs and metadata</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted p-6 dark:bg-secondary/50">
                  <h3 className="mb-3 text-xl font-medium text-foreground dark:text-primary-foreground">LiveKit</h3>
                  <div className="grid gap-4 text-sm md:grid-cols-2">
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Purpose</p>
                      <p className="text-zinc-600 dark:text-zinc-300">
                        Real-time audio and voice processing for the AI assistant
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Location</p>
                      <p className="text-zinc-600 dark:text-zinc-300">USA</p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Certification</p>
                      <p className="text-zinc-600 dark:text-zinc-300">Enterprise-grade security</p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Data Stored</p>
                      <p className="text-zinc-600 dark:text-zinc-300">Temporary audio streams, no permanent storage</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Monitoring Sub-Processors */}
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-medium text-foreground dark:text-primary-foreground">
                5. Monitoring Sub-Processors
              </h2>

              <div className="space-y-6">
                <div className="rounded-lg border bg-muted p-6 dark:bg-secondary/50">
                  <h3 className="mb-3 text-xl font-medium text-foreground dark:text-primary-foreground">Sentry</h3>
                  <div className="grid gap-4 text-sm md:grid-cols-2">
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Purpose</p>
                      <p className="text-zinc-600 dark:text-zinc-300">Error monitoring and crash reporting</p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Location</p>
                      <p className="text-zinc-600 dark:text-zinc-300">EU / US data centers</p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Certification</p>
                      <p className="text-zinc-600 dark:text-zinc-300">SOC 2 certified</p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Data Stored</p>
                      <p className="text-zinc-600 dark:text-zinc-300">Error logs and stack traces</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted p-6 dark:bg-secondary/50">
                  <h3 className="mb-3 text-xl font-medium text-foreground dark:text-primary-foreground">PostHog</h3>
                  <div className="grid gap-4 text-sm md:grid-cols-2">
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Purpose</p>
                      <p className="text-zinc-600 dark:text-zinc-300">Analytics and user behavior tracking</p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Location</p>
                      <p className="text-zinc-600 dark:text-zinc-300">EU data residency available</p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Certification</p>
                      <p className="text-zinc-600 dark:text-zinc-300">SOC 2 certified</p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Data Stored</p>
                      <p className="text-zinc-600 dark:text-zinc-300">Usage analytics and user events</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Processing Agreements */}
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-medium text-foreground dark:text-primary-foreground">
                6. Data Processing Agreements
              </h2>
              <p className="mb-4 leading-relaxed text-zinc-600 dark:text-zinc-300">
                All sub-processors sign data processing agreements that include:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-zinc-600 dark:text-zinc-300">
                <li>GDPR compliance and data protection obligations</li>
                <li>Standard contractual clauses for international data transfers</li>
                <li>Security incident notification within 24 hours</li>
                <li>Right to audit and assess security measures</li>
                <li>Data deletion and return obligations</li>
                <li>Liability and indemnification provisions</li>
              </ul>
            </section>

            {/* Changes to Sub-Processors */}
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-medium text-foreground dark:text-primary-foreground">
                7. Changes to Sub-Processors
              </h2>
              <p className="mb-4 leading-relaxed text-zinc-600 dark:text-zinc-300">
                We may update our list of sub-processors from time to time to improve our service. When we add or change
                sub-processors, we will:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-zinc-600 dark:text-zinc-300">
                <li>Update this page with the new sub-processor information</li>
                <li>Notify users via email or in-app notifications for significant changes</li>
                <li>Provide a transition period for users to evaluate the change</li>
                <li>Ensure all new sub-processors meet our security and compliance requirements</li>
              </ul>
            </section>

            {/* Contact Information */}
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-medium text-foreground dark:text-primary-foreground">
                8. Contact Information
              </h2>
              <p className="mb-4 leading-relaxed text-zinc-600 dark:text-zinc-300">
                If you have questions about our sub-processors or data processing practices, please contact us:
              </p>
              <div className="rounded-xl border bg-muted p-6 dark:bg-secondary/50">
                <p className="mb-2 text-zinc-600 dark:text-zinc-300">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:privacy@askally.io" className="text-primary hover:underline">
                    privacy@askally.io
                  </a>
                </p>
                <p className="text-zinc-600 dark:text-zinc-300">
                  <strong>Company:</strong> Ally Technologies Inc.
                </p>
              </div>
            </section>

            {/* Back to Home */}
            <div className="border border-t pt-8">
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
