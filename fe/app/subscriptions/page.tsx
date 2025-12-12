"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["Basic calendar management", "AI assistant queries (50/month)", "Email support", "1 calendar sync"],
    current: true,
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "per month",
    features: [
      "Everything in Free",
      "Unlimited AI assistant queries",
      "Priority support",
      "Unlimited calendar syncs",
      "Advanced scheduling",
      "Custom agent names",
    ],
    current: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: ["Everything in Pro", "Dedicated support", "Custom integrations", "Team management", "Advanced analytics", "SLA guarantee"],
    current: false,
  },
];

export default function SubscriptionsPage() {
  const { isOpen, isMobile } = useSidebar();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className={cn("flex-1 overflow-y-auto", !isMobile && isOpen && "ml-64")}>
        <div className="container mx-auto max-w-6xl space-y-6 p-6">
          <div>
            <h1 className="text-3xl font-bold">Subscriptions</h1>
            <p className="text-muted-foreground">Manage your subscription and billing</p>
          </div>

          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your active subscription plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Free Plan</h3>
                  <p className="text-sm text-muted-foreground">Active since account creation</p>
                </div>
                <Button variant="outline">Upgrade Plan</Button>
              </div>
            </CardContent>
          </Card>

          {/* Available Plans */}
          <div>
            <h2 className="mb-4 text-2xl font-semibold">Available Plans</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {plans.map((plan) => (
                <Card key={plan.name} className={cn(plan.current && "border-primary")}>
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      {plan.period && <span className="text-muted-foreground"> / {plan.period}</span>}
                    </div>
                    {plan.current && <span className="mt-2 inline-block rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">Current Plan</span>}
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="mt-6 w-full" variant={plan.current ? "outline" : "default"} disabled={plan.current}>
                      {plan.current ? "Current Plan" : plan.name === "Enterprise" ? "Contact Sales" : "Upgrade"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>View your past invoices and payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>No billing history available</p>
                <p className="text-sm mt-2">Upgrade to a paid plan to see billing information</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Manage your payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>No payment method on file</p>
                <p className="text-sm mt-2">Add a payment method when upgrading to a paid plan</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
