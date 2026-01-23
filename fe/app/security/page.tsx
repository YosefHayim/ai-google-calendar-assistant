'use client'

import Link from 'next/link'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import { Shield, Lock, Eye, Server, AlertTriangle, Mail, ExternalLink, FileText, Users, Database } from 'lucide-react'

export default function SecurityPage() {
  const lastUpdated = 'January 21, 2026'

  return (
    <MarketingLayout>
      <div className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-12">
            <div className="mb-4 flex items-center gap-3">
              <Shield className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-medium tracking-tight text-foreground dark:text-primary-foreground md:text-5xl">
                Security
              </h1>
            </div>
            <p className="text-muted-foreground dark:text-muted-foreground">Last Updated: {lastUpdated}</p>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-300">
              At Ally Technologies Inc., security is foundational to everything we build. This page outlines our
              security practices, certifications, and how to report vulnerabilities.
            </p>
          </div>

          {/* Quick Links */}
          <div className="mb-12 grid gap-4 md:grid-cols-3">
            <Link
              href="#vulnerability-disclosure"
              className="rounded-lg border bg-muted p-4 transition-colors hover:border-primary dark:bg-secondary/50"
            >
              <AlertTriangle className="mb-2 h-6 w-6 text-primary" />
              <h3 className="font-medium text-foreground dark:text-primary-foreground">Report a Vulnerability</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">Responsible disclosure program</p>
            </Link>
            <Link
              href="/security/sub-processors"
              className="rounded-lg border bg-muted p-4 transition-colors hover:border-primary dark:bg-secondary/50"
            >
              <Users className="mb-2 h-6 w-6 text-primary" />
              <h3 className="font-medium text-foreground dark:text-primary-foreground">Sub-Processors</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">Third-party service providers</p>
            </Link>
            <Link
              href="/privacy"
              className="rounded-lg border bg-muted p-4 transition-colors hover:border-primary dark:bg-secondary/50"
            >
              <Eye className="mb-2 h-6 w-6 text-primary" />
              <h3 className="font-medium text-foreground dark:text-primary-foreground">Privacy Policy</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">How we handle your data</p>
            </Link>
          </div>

          {/* Content */}
          <div className="prose prose-zinc max-w-none dark:prose-invert">
            {/* Security Overview */}
            <section className="mb-12">
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-medium text-foreground dark:text-primary-foreground">
                <Lock className="h-6 w-6" />
                1. Security Overview
              </h2>
              <p className="mb-4 leading-relaxed text-zinc-600 dark:text-zinc-300">
                Ally is an AI-powered calendar assistant that integrates with Google Calendar. We take the security of
                your data seriously and implement industry-standard security measures to protect your information.
              </p>
              <div className="rounded-lg border bg-muted p-6 dark:bg-secondary/50">
                <h4 className="mb-3 font-medium text-foreground dark:text-primary-foreground">Key Security Features</h4>
                <ul className="list-disc space-y-2 pl-6 text-zinc-600 dark:text-zinc-300">
                  <li>
                    <strong>Encryption in Transit:</strong> All data is encrypted using TLS 1.3
                  </li>
                  <li>
                    <strong>Encryption at Rest:</strong> AES-256 encryption for stored data
                  </li>
                  <li>
                    <strong>OAuth 2.0:</strong> Secure Google Calendar integration without storing passwords
                  </li>
                  <li>
                    <strong>Row-Level Security:</strong> Database-level isolation using Supabase RLS policies
                  </li>
                  <li>
                    <strong>Rate Limiting:</strong> Protection against abuse and DDoS attacks
                  </li>
                  <li>
                    <strong>Security Headers:</strong> Helmet.js for HTTP security headers
                  </li>
                  <li>
                    <strong>Audit Logging:</strong> Comprehensive logging of security-relevant events
                  </li>
                  <li>
                    <strong>Request Signing:</strong> HMAC-SHA256 verification for webhook endpoints
                  </li>
                </ul>
              </div>
            </section>

            {/* Infrastructure Security */}
            <section className="mb-12">
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-medium text-foreground dark:text-primary-foreground">
                <Server className="h-6 w-6" />
                2. Infrastructure Security
              </h2>
              <div className="space-y-6">
                <div className="rounded-lg border bg-muted p-6 dark:bg-secondary/50">
                  <h3 className="mb-3 text-xl font-medium text-foreground dark:text-primary-foreground">
                    Cloud Infrastructure
                  </h3>
                  <div className="grid gap-4 text-sm md:grid-cols-2">
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Hosting Provider</p>
                      <p className="text-zinc-600 dark:text-zinc-300">AWS App Runner (SOC 2, ISO 27001 certified)</p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Database</p>
                      <p className="text-zinc-600 dark:text-zinc-300">Supabase PostgreSQL (SOC 2 Type II certified)</p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">
                        Data Center Location
                      </p>
                      <p className="text-zinc-600 dark:text-zinc-300">United States (AWS us-east-1)</p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">CDN</p>
                      <p className="text-zinc-600 dark:text-zinc-300">Vercel Edge Network (Global)</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted p-6 dark:bg-secondary/50">
                  <h3 className="mb-3 text-xl font-medium text-foreground dark:text-primary-foreground">
                    Access Controls
                  </h3>
                  <ul className="list-disc space-y-2 pl-6 text-zinc-600 dark:text-zinc-300">
                    <li>Multi-factor authentication required for all administrative access</li>
                    <li>Principle of least privilege for service accounts</li>
                    <li>Regular access reviews and credential rotation</li>
                    <li>Encrypted secrets management via environment variables</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section className="mb-12">
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-medium text-foreground dark:text-primary-foreground">
                <Database className="h-6 w-6" />
                3. Data Security
              </h2>
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted p-6 dark:bg-secondary/50">
                  <h3 className="mb-3 text-xl font-medium text-foreground dark:text-primary-foreground">
                    Data Retention
                  </h3>
                  <ul className="list-disc space-y-2 pl-6 text-zinc-600 dark:text-zinc-300">
                    <li>
                      <strong>Account Data:</strong> Retained while account is active, deleted within 30 days of
                      deletion request
                    </li>
                    <li>
                      <strong>Conversation History:</strong> Retained for 90 days for AI context, then archived
                    </li>
                    <li>
                      <strong>OAuth Tokens:</strong> Immediately revoked upon disconnection or account deletion
                    </li>
                    <li>
                      <strong>AI Session Data:</strong> Ephemeral - deleted immediately after processing
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border bg-muted p-6 dark:bg-secondary/50">
                  <h3 className="mb-3 text-xl font-medium text-foreground dark:text-primary-foreground">
                    AI/LLM Data Handling
                  </h3>
                  <ul className="list-disc space-y-2 pl-6 text-zinc-600 dark:text-zinc-300">
                    <li>
                      <strong>Provider:</strong> OpenAI API (GPT-4, GPT-4 Turbo), Google Gemini
                    </li>
                    <li>
                      <strong>Zero Data Retention:</strong> We use the official OpenAI API with Zero Data Retention
                      (ZDR) - your data is NOT used to train models
                    </li>
                    <li>
                      <strong>Data Isolation:</strong> Each user session is isolated; no cross-customer data sharing
                    </li>
                    <li>
                      <strong>Ephemeral Processing:</strong> LLM inference data is deleted immediately after response
                      generation
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Vulnerability Disclosure */}
            <section className="mb-12" id="vulnerability-disclosure">
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-medium text-foreground dark:text-primary-foreground">
                <AlertTriangle className="h-6 w-6" />
                4. Vulnerability Disclosure Program
              </h2>
              <p className="mb-4 leading-relaxed text-zinc-600 dark:text-zinc-300">
                We appreciate the security research community and welcome responsible disclosure of security
                vulnerabilities. If you discover a security issue, please report it to us following the guidelines
                below.
              </p>

              <div className="mb-6 rounded-lg border border-primary/30 bg-primary/10 p-6 dark:bg-primary/20">
                <h3 className="mb-3 text-xl font-medium text-foreground dark:text-primary-foreground">How to Report</h3>
                <p className="mb-4 text-zinc-600 dark:text-zinc-300">Please send vulnerability reports to:</p>
                <a
                  href="mailto:security@askally.io"
                  className="inline-flex items-center gap-2 text-lg font-medium text-primary hover:underline"
                >
                  <Mail className="h-5 w-5" />
                  security@askally.io
                </a>
              </div>

              <div className="mb-6 rounded-lg border bg-muted p-6 dark:bg-secondary/50">
                <h3 className="mb-3 text-xl font-medium text-foreground dark:text-primary-foreground">
                  What to Include
                </h3>
                <ul className="list-disc space-y-2 pl-6 text-zinc-600 dark:text-zinc-300">
                  <li>Description of the vulnerability and its potential impact</li>
                  <li>Steps to reproduce the issue</li>
                  <li>Any proof-of-concept code or screenshots</li>
                  <li>Your contact information for follow-up</li>
                  <li>Whether you would like public acknowledgment</li>
                </ul>
              </div>

              <div className="mb-6 rounded-lg border bg-muted p-6 dark:bg-secondary/50">
                <h3 className="mb-3 text-xl font-medium text-foreground dark:text-primary-foreground">Scope</h3>
                <p className="mb-3 text-zinc-600 dark:text-zinc-300">
                  The following are in scope for our vulnerability disclosure program:
                </p>
                <ul className="list-disc space-y-2 pl-6 text-zinc-600 dark:text-zinc-300">
                  <li>askally.io and all subdomains</li>
                  <li>Ally web application</li>
                  <li>Ally Telegram bot (@AskAllyBot)</li>
                  <li>Ally Slack app</li>
                  <li>Ally API endpoints</li>
                </ul>
              </div>

              <div className="rounded-lg border bg-muted p-6 dark:bg-secondary/50">
                <h3 className="mb-3 text-xl font-medium text-foreground dark:text-primary-foreground">
                  Our Commitment
                </h3>
                <ul className="list-disc space-y-2 pl-6 text-zinc-600 dark:text-zinc-300">
                  <li>We will acknowledge receipt of your report within 48 hours</li>
                  <li>We will provide an initial assessment within 7 business days</li>
                  <li>We will keep you informed of our progress</li>
                  <li>We will not take legal action against researchers who follow responsible disclosure</li>
                  <li>We will credit researchers who report valid vulnerabilities (if desired)</li>
                </ul>
              </div>
            </section>

            {/* Compliance */}
            <section className="mb-12">
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-medium text-foreground dark:text-primary-foreground">
                <FileText className="h-6 w-6" />
                5. Compliance
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border bg-muted p-6 dark:bg-secondary/50">
                  <h3 className="mb-2 text-lg font-medium text-foreground dark:text-primary-foreground">GDPR</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    We comply with the General Data Protection Regulation for EU users, including data portability and
                    right to deletion.
                  </p>
                </div>
                <div className="rounded-lg border bg-muted p-6 dark:bg-secondary/50">
                  <h3 className="mb-2 text-lg font-medium text-foreground dark:text-primary-foreground">CCPA</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    We comply with the California Consumer Privacy Act for California residents.
                  </p>
                </div>
                <div className="rounded-lg border bg-muted p-6 dark:bg-secondary/50">
                  <h3 className="mb-2 text-lg font-medium text-foreground dark:text-primary-foreground">
                    SOC 2 Infrastructure
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    Our infrastructure providers (AWS, Supabase, Vercel) maintain SOC 2 Type II certification.
                  </p>
                </div>
                <div className="rounded-lg border bg-muted p-6 dark:bg-secondary/50">
                  <h3 className="mb-2 text-lg font-medium text-foreground dark:text-primary-foreground">
                    Google API Compliance
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    We comply with Google API Services User Data Policy and Limited Use requirements.
                  </p>
                </div>
              </div>
            </section>

            {/* Third-Party Integrations */}
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-medium text-foreground dark:text-primary-foreground">
                6. Third-Party Integrations
              </h2>
              <p className="mb-4 leading-relaxed text-zinc-600 dark:text-zinc-300">
                Ally integrates with the following third-party services. Each integration is secured using
                industry-standard protocols:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left font-medium text-foreground dark:text-primary-foreground">
                        Service
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-foreground dark:text-primary-foreground">
                        Purpose
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-foreground dark:text-primary-foreground">
                        Authentication
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-zinc-600 dark:text-zinc-300">
                    <tr className="border-b">
                      <td className="px-4 py-3">Google Calendar</td>
                      <td className="px-4 py-3">Calendar data access</td>
                      <td className="px-4 py-3">OAuth 2.0</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3">Slack</td>
                      <td className="px-4 py-3">Bot integration</td>
                      <td className="px-4 py-3">OAuth 2.0 + HMAC-SHA256 signing</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3">Telegram</td>
                      <td className="px-4 py-3">Bot integration</td>
                      <td className="px-4 py-3">Bot Token + User verification</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3">OpenAI</td>
                      <td className="px-4 py-3">AI processing</td>
                      <td className="px-4 py-3">API Key (server-side only)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">Lemon Squeezy</td>
                      <td className="px-4 py-3">Payment processing</td>
                      <td className="px-4 py-3">Webhook signing</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-zinc-600 dark:text-zinc-300">
                For a complete list of sub-processors, see our{' '}
                <Link href="/security/sub-processors" className="text-primary hover:underline">
                  Sub-Processors page
                </Link>
                .
              </p>
            </section>

            {/* Contact */}
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-medium text-foreground dark:text-primary-foreground">
                7. Security Contacts
              </h2>
              <div className="rounded-xl border bg-muted p-6 dark:bg-secondary/50">
                <div className="space-y-4">
                  <div>
                    <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Security Issues</p>
                    <a
                      href="mailto:security@askally.io"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Mail className="h-4 w-4" />
                      security@askally.io
                    </a>
                  </div>
                  <div>
                    <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">General Support</p>
                    <a
                      href="mailto:support@askally.io"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Mail className="h-4 w-4" />
                      support@askally.io
                    </a>
                  </div>
                  <div>
                    <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Privacy Inquiries</p>
                    <a
                      href="mailto:privacy@askally.io"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Mail className="h-4 w-4" />
                      privacy@askally.io
                    </a>
                  </div>
                  <div>
                    <p className="mb-1 font-medium text-foreground dark:text-primary-foreground">Security.txt</p>
                    <a
                      href="/.well-known/security.txt"
                      className="flex items-center gap-2 text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                      /.well-known/security.txt
                    </a>
                  </div>
                </div>
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
