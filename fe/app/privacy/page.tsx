"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-16 max-w-4xl flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to CAL AI ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI calendar assistant
                service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-medium mb-3">2.1 Information You Provide</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Account information (name, email address, password)</li>
                <li>Calendar data and scheduling preferences</li>
                <li>Communication preferences</li>
                <li>Payment information (processed through secure third-party providers)</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-6">2.2 Automatically Collected Information</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                When you use our service, we automatically collect certain information, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages visited, features used, time spent)</li>
                <li>Calendar metadata (event titles, times, participants - not content)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide, maintain, and improve our services</li>
                <li>Process your transactions and send related information</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Monitor and analyze trends and usage</li>
                <li>Detect, prevent, and address technical issues</li>
                <li>Personalize your experience with AI-powered scheduling suggestions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Information Sharing and Disclosure</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We do not sell your personal information. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  <strong>Service Providers:</strong> We may share information with third-party service providers who perform services on our
                  behalf
                </li>
                <li>
                  <strong>Legal Requirements:</strong> We may disclose information if required by law or in response to valid requests by public
                  authorities
                </li>
                <li>
                  <strong>Business Transfers:</strong> Information may be transferred in connection with a merger, acquisition, or sale of assets
                </li>
                <li>
                  <strong>With Your Consent:</strong> We may share information with your explicit consent
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information. However, no method
                of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to
                protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights and Choices</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Access and receive a copy of your personal data</li>
                <li>Rectify inaccurate or incomplete data</li>
                <li>Request deletion of your personal data</li>
                <li>Object to or restrict processing of your data</li>
                <li>Data portability (receive your data in a structured format)</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Third-Party Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service integrates with third-party calendar services (such as Google Calendar). When you connect these services, you are
                subject to their respective privacy policies. We encourage you to review the privacy policies of these third-party services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children
                under 13. If you become aware that a child has provided us with personal information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on
                this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                Email: <Link href="mailto:privacy@calai.com" className="text-primary hover:underline">privacy@calai.com</Link>
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Or visit our <Link href="/contact" className="text-primary hover:underline">Contact page</Link> for more information.
              </p>
            </section>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

