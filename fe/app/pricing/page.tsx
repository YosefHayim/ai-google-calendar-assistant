"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { RippleButton } from "@/components/ui/ripple-button";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out CAL AI",
    features: [
      "Basic calendar management",
      "AI scheduling suggestions",
      "Up to 3 calendars",
      "Email support",
      "Basic reminders",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "per month",
    description: "For professionals who need more",
    features: [
      "Everything in Free",
      "Unlimited calendars",
      "Advanced AI scheduling",
      "Priority support",
      "Smart time optimization",
      "Custom reminders",
      "Calendar analytics",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "pricing",
    description: "For teams and organizations",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Advanced security",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
      "Onboarding assistance",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Simple, Transparent Pricing
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Choose the plan that's right for you. All plans include a 14-day free trial. No credit card required.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="h-full"
              >
                <Card
                  className={`h-full relative transition-all ${
                    plan.popular
                      ? "border-blue-500 shadow-xl scale-105 border-2"
                      : "hover:shadow-lg"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-lg">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-5xl font-bold">{plan.price}</span>
                      {plan.period !== "forever" && plan.period !== "pricing" && (
                        <span className="text-muted-foreground text-lg">/{plan.period}</span>
                      )}
                    </div>
                    <CardDescription className="text-base">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-4">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href={plan.name === "Enterprise" ? "/contact" : "/register"} className="block">
                      {plan.popular ? (
                        <RainbowButton className="w-full h-11">
                          {plan.cta}
                        </RainbowButton>
                      ) : (
                        <RippleButton
                          className="w-full"
                          variant="outline"
                          size="lg"
                        >
                          {plan.cta}
                        </RippleButton>
                      )}
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-6 py-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground">
                All plans include a 14-day free trial. Need help choosing?{" "}
                <Link href="/contact" className="text-primary hover:underline font-medium">
                  Contact us
                </Link>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
