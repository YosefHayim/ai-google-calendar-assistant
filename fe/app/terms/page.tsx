"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";

export default function TermsOfUsePage() {
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using CAL AI ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with
                any part of these terms, then you may not access the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                CAL AI is an AI-powered calendar assistant that helps users manage their schedules, optimize their time, and receive
                intelligent scheduling suggestions. The Service integrates with third-party calendar providers to provide these features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
              <h3 className="text-xl font-medium mb-3">3.1 Account Creation</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To use certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information to keep it accurate</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-6">3.2 Account Termination</h3>
              <p className="text-muted-foreground leading-relaxed">
                You may terminate your account at any time. We reserve the right to suspend or terminate your account if you violate these
                Terms or engage in fraudulent, abusive, or illegal activity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Use the Service for any illegal purpose or in violation of any laws</li>
                <li>Violate or infringe upon the rights of others</li>
                <li>Transmit any harmful code, viruses, or malicious software</li>
                <li>Attempt to gain unauthorized access to the Service or related systems</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use automated systems to access the Service without permission</li>
                <li>Impersonate any person or entity</li>
                <li>Collect or harvest information about other users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The Service and its original content, features, and functionality are owned by CAL AI and are protected by international
                copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You retain ownership of any content you submit to the Service. By submitting content, you grant us a worldwide, non-exclusive,
                royalty-free license to use, reproduce, modify, and distribute your content solely for the purpose of providing the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Third-Party Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service integrates with third-party calendar services and other providers. Your use of these third-party services is
                subject to their respective terms and conditions. We are not responsible for the availability, accuracy, or content of
                third-party services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Subscription and Payment</h2>
              <h3 className="text-xl font-medium mb-3">7.1 Subscription Plans</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We offer various subscription plans with different features and pricing. Subscription fees are billed in advance on a monthly
                or annual basis, as selected.
              </p>

              <h3 className="text-xl font-medium mb-3 mt-6">7.2 Payment Terms</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                By subscribing, you agree to pay all fees associated with your selected plan. All fees are non-refundable except as required
                by law or as explicitly stated in our refund policy.
              </p>

              <h3 className="text-xl font-medium mb-3 mt-6">7.3 Cancellation</h3>
              <p className="text-muted-foreground leading-relaxed">
                You may cancel your subscription at any time. Cancellation will take effect at the end of your current billing period. You
                will continue to have access to paid features until the end of your billing period.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Disclaimers and Limitations of Liability</h2>
              <h3 className="text-xl font-medium mb-3">8.1 Service Availability</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We strive to provide a reliable service but do not guarantee that the Service will be available at all times or free from
                errors, interruptions, or defects.
              </p>

              <h3 className="text-xl font-medium mb-3 mt-6">8.2 AI Suggestions</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                AI-powered scheduling suggestions are provided for informational purposes only. You are responsible for reviewing and
                approving all calendar changes. We are not liable for any scheduling conflicts or issues arising from AI suggestions.
              </p>

              <h3 className="text-xl font-medium mb-3 mt-6">8.3 Limitation of Liability</h3>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, CAL AI shall not be liable for any indirect, incidental, special, consequential, or
                punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use,
                goodwill, or other intangible losses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Indemnification</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to indemnify and hold harmless CAL AI, its officers, directors, employees, and agents from any claims, damages,
                losses, liabilities, and expenses (including legal fees) arising out of or relating to your use of the Service or violation
                of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the updated
                Terms on this page and updating the "Last updated" date. Your continued use of the Service after such modifications
                constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which CAL AI operates,
                without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                Email: <Link href="mailto:legal@calai.com" className="text-primary hover:underline">legal@calai.com</Link>
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

