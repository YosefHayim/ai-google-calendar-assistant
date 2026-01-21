'use client'

import Link from 'next/link'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import { Shield, Lock, Eye, Server, AlertTriangle, Mail, ExternalLink, FileText, Users, Database } from 'lucide-react'

export default function SecurityPage() {
  const lastUpdated = 'January 21, 2026'

  return (
    <MarketingLayout>
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-10 w-10 text-primary" />
              <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-foreground dark:text-primary-foreground">
                Security
              </h1>
            </div>
            <p className="text-muted-foreground dark:text-muted-foreground">Last Updated: {lastUpdated}</p>
            <p className="text-lg text-zinc-600 dark:text-zinc-300 mt-4">
              At Ally Technologies Inc., security is foundational to everything we build. This page outlines our
              security practices, certifications, and how to report vulnerabilities.
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            <Link
              href="#vulnerability-disclosure"
              className="bg-muted dark:bg-secondary/50 rounded-lg p-4 border hover:border-primary transition-colors"
            >
              <AlertTriangle className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-medium text-foreground dark:text-primary-foreground">Report a Vulnerability</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">Responsible disclosure program</p>
            </Link>
            <Link
              href="/security/sub-processors"
              className="bg-muted dark:bg-secondary/50 rounded-lg p-4 border hover:border-primary transition-colors"
            >
              <Users className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-medium text-foreground dark:text-primary-foreground">Sub-Processors</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">Third-party service providers</p>
            </Link>
            <Link
              href="/privacy"
              className="bg-muted dark:bg-secondary/50 rounded-lg p-4 border hover:border-primary transition-colors"
            >
              <Eye className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-medium text-foreground dark:text-primary-foreground">Privacy Policy</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">How we handle your data</p>
            </Link>
          </div>

          {/* Content */}
          <div className="prose prose-zinc dark:prose-invert max-w-none">
            {/* Security Overview */}
            <section className="mb-12">
              <h2 className="text-2xl font-medium text-foreground dark:text-primary-foreground mb-4 flex items-center gap-2">
                <Lock className="h-6 w-6" />
                1. Security Overview
              </h2>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                Ally is an AI-powered calendar assistant that integrates with Google Calendar. We take the security of
                your data seriously and implement industry-standard security measures to protect your information.
              </p>
              <div className="bg-muted dark:bg-secondary/50 rounded-lg p-6 border">
                <h4 className="font-medium text-foreground dark:text-primary-foreground mb-3">Key Security Features</h4>
                <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-300 space-y-2">
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
              <h2 className="text-2xl font-medium text-foreground dark:text-primary-foreground mb-4 flex items-center gap-2">
                <Server className="h-6 w-6" />
                2. Infrastructure Security
              </h2>
              <div className="space-y-6">
                <div className="bg-muted dark:bg-secondary/50 rounded-lg p-6 border">
                  <h3 className="text-xl font-medium text-foreground dark:text-primary-foreground mb-3">
                    Cloud Infrastructure
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-foreground dark:text-primary-foreground mb-1">Hosting Provider</p>
                      <p className="text-zinc-600 dark:text-zinc-300">AWS App Runner (SOC 2, ISO 27001 certified)</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground dark:text-primary-foreground mb-1">Database</p>
                      <p className="text-zinc-600 dark:text-zinc-300">Supabase PostgreSQL (SOC 2 Type II certified)</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground dark:text-primary-foreground mb-1">
                        Data Center Location
                      </p>
                      <p className="text-zinc-600 dark:text-zinc-300">United States (AWS us-east-1)</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground dark:text-primary-foreground mb-1">CDN</p>
                      <p className="text-zinc-600 dark:text-zinc-300">Vercel Edge Network (Global)</p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted dark:bg-secondary/50 rounded-lg p-6 border">
                  <h3 className="text-xl font-medium text-foreground dark:text-primary-foreground mb-3">
                    Access Controls
                  </h3>
                  <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-300 space-y-2">
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
              <h2 className="text-2xl font-medium text-foreground dark:text-primary-foreground mb-4 flex items-center gap-2">
                <Database className="h-6 w-6" />
                3. Data Security
              </h2>
              <div className="space-y-4">
                <div className="bg-muted dark:bg-secondary/50 rounded-lg p-6 border">
                  <h3 className="text-xl font-medium text-foreground dark:text-primary-foreground mb-3">
                    Data Retention
                  </h3>
                  <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-300 space-y-2">
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

                <div className="bg-muted dark:bg-secondary/50 rounded-lg p-6 border">
                  <h3 className="text-xl font-medium text-foreground dark:text-primary-foreground mb-3">
                    AI/LLM Data Handling
                  </h3>
                  <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-300 space-y-2">
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
              <h2 className="text-2xl font-medium text-foreground dark:text-primary-foreground mb-4 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6" />
                4. Vulnerability Disclosure Program
              </h2>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                We appreciate the security research community and welcome responsible disclosure of security
                vulnerabilities. If you discover a security issue, please report it to us following the guidelines
                below.
              </p>

              <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-6 border border-primary/30 mb-6">
                <h3 className="text-xl font-medium text-foreground dark:text-primary-foreground mb-3">How to Report</h3>
                <p className="text-zinc-600 dark:text-zinc-300 mb-4">Please send vulnerability reports to:</p>
                <a
                  href="mailto:security@askally.io"
                  className="inline-flex items-center gap-2 text-primary hover:underline font-medium text-lg"
                >
                  <Mail className="h-5 w-5" />
                  security@askally.io
                </a>
              </div>

              <div className="bg-muted dark:bg-secondary/50 rounded-lg p-6 border mb-6">
                <h3 className="text-xl font-medium text-foreground dark:text-primary-foreground mb-3">
                  What to Include
                </h3>
                <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-300 space-y-2">
                  <li>Description of the vulnerability and its potential impact</li>
                  <li>Steps to reproduce the issue</li>
                  <li>Any proof-of-concept code or screenshots</li>
                  <li>Your contact information for follow-up</li>
                  <li>Whether you would like public acknowledgment</li>
                </ul>
              </div>

              <div className="bg-muted dark:bg-secondary/50 rounded-lg p-6 border mb-6">
                <h3 className="text-xl font-medium text-foreground dark:text-primary-foreground mb-3">Scope</h3>
                <p className="text-zinc-600 dark:text-zinc-300 mb-3">
                  The following are in scope for our vulnerability disclosure program:
                </p>
                <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-300 space-y-2">
                  <li>askally.io and all subdomains</li>
                  <li>Ally web application</li>
                  <li>Ally Telegram bot (@AskAllyBot)</li>
                  <li>Ally Slack app</li>
                  <li>Ally API endpoints</li>
                </ul>
              </div>

              <div className="bg-muted dark:bg-secondary/50 rounded-lg p-6 border">
                <h3 className="text-xl font-medium text-foreground dark:text-primary-foreground mb-3">
                  Our Commitment
                </h3>
                <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-300 space-y-2">
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
              <h2 className="text-2xl font-medium text-foreground dark:text-primary-foreground mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6" />
                5. Compliance
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted dark:bg-secondary/50 rounded-lg p-6 border">
                  <h3 className="text-lg font-medium text-foreground dark:text-primary-foreground mb-2">GDPR</h3>
                  <p className="text-zinc-600 dark:text-zinc-300 text-sm">
                    We comply with the General Data Protection Regulation for EU users, including data portability and
                    right to deletion.
                  </p>
                </div>
                <div className="bg-muted dark:bg-secondary/50 rounded-lg p-6 border">
                  <h3 className="text-lg font-medium text-foreground dark:text-primary-foreground mb-2">CCPA</h3>
                  <p className="text-zinc-600 dark:text-zinc-300 text-sm">
                    We comply with the California Consumer Privacy Act for California residents.
                  </p>
                </div>
                <div className="bg-muted dark:bg-secondary/50 rounded-lg p-6 border">
                  <h3 className="text-lg font-medium text-foreground dark:text-primary-foreground mb-2">
                    SOC 2 Infrastructure
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-300 text-sm">
                    Our infrastructure providers (AWS, Supabase, Vercel) maintain SOC 2 Type II certification.
                  </p>
                </div>
                <div className="bg-muted dark:bg-secondary/50 rounded-lg p-6 border">
                  <h3 className="text-lg font-medium text-foreground dark:text-primary-foreground mb-2">
                    Google API Compliance
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-300 text-sm">
                    We comply with Google API Services User Data Policy and Limited Use requirements.
                  </p>
                </div>
              </div>
            </section>

            {/* Third-Party Integrations */}
            <section className="mb-12">
              <h2 className="text-2xl font-medium text-foreground dark:text-primary-foreground mb-4">
                6. Third-Party Integrations
              </h2>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                Ally integrates with the following third-party services. Each integration is secured using
                industry-standard protocols:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-foreground dark:text-primary-foreground">
                        Service
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground dark:text-primary-foreground">
                        Purpose
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground dark:text-primary-foreground">
                        Authentication
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-zinc-600 dark:text-zinc-300">
                    <tr className="border-b">
                      <td className="py-3 px-4">Google Calendar</td>
                      <td className="py-3 px-4">Calendar data access</td>
                      <td className="py-3 px-4">OAuth 2.0</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Slack</td>
                      <td className="py-3 px-4">Bot integration</td>
                      <td className="py-3 px-4">OAuth 2.0 + HMAC-SHA256 signing</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Telegram</td>
                      <td className="py-3 px-4">Bot integration</td>
                      <td className="py-3 px-4">Bot Token + User verification</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">OpenAI</td>
                      <td className="py-3 px-4">AI processing</td>
                      <td className="py-3 px-4">API Key (server-side only)</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Lemon Squeezy</td>
                      <td className="py-3 px-4">Payment processing</td>
                      <td className="py-3 px-4">Webhook signing</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-zinc-600 dark:text-zinc-300 mt-4">
                For a complete list of sub-processors, see our{' '}
                <Link href="/security/sub-processors" className="text-primary hover:underline">
                  Sub-Processors page
                </Link>
                .
              </p>
            </section>

            {/* Contact */}
            <section className="mb-12">
              <h2 className="text-2xl font-medium text-foreground dark:text-primary-foreground mb-4">
                7. Security Contacts
              </h2>
              <div className="bg-muted dark:bg-secondary/50 rounded-xl p-6 border">
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-foreground dark:text-primary-foreground mb-1">Security Issues</p>
                    <a
                      href="mailto:security@askally.io"
                      className="text-primary hover:underline flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      security@askally.io
                    </a>
                  </div>
                  <div>
                    <p className="font-medium text-foreground dark:text-primary-foreground mb-1">General Support</p>
                    <a
                      href="mailto:support@askally.io"
                      className="text-primary hover:underline flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      support@askally.io
                    </a>
                  </div>
                  <div>
                    <p className="font-medium text-foreground dark:text-primary-foreground mb-1">Privacy Inquiries</p>
                    <a
                      href="mailto:privacy@askally.io"
                      className="text-primary hover:underline flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      privacy@askally.io
                    </a>
                  </div>
                  <div>
                    <p className="font-medium text-foreground dark:text-primary-foreground mb-1">Security.txt</p>
                    <a
                      href="/.well-known/security.txt"
                      className="text-primary hover:underline flex items-center gap-2"
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
            <div className="pt-8 border-t border">
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
