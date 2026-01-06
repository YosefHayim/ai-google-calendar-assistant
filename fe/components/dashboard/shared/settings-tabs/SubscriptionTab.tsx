'use client'

import React from 'react'
import Link from 'next/link'
import { Brain, Calendar, ExternalLink, Smartphone, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SettingsRow, SettingsSection } from './components'

const features = [
  { icon: Zap, text: 'Unlimited event creations & updates', colorClass: 'text-amber-500' },
  { icon: Brain, text: 'Smart Conflict Resolution Agents', colorClass: 'text-purple-500' },
  { icon: Calendar, text: 'Multi-Calendar Sync', colorClass: 'text-green-600' },
  { icon: Smartphone, text: 'Priority Telegram & WhatsApp Support', colorClass: 'text-blue-500' },
]

export const SubscriptionTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subscription</CardTitle>
          <CardDescription>
            Current Plan: <span className="font-medium">Free Tier</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Unlock the full power of Ally</div>
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <feature.icon className={`h-5 w-5 ${feature.colorClass}`} />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">{feature.text}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full" asChild>
            <Link href="/dashboard/billing">Upgrade to Pro</Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Billing Portal</CardTitle>
          <CardDescription>Manage payment methods, view invoices, and update subscription.</CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsSection>
            <SettingsRow
              id="manage-billing"
              title="Payment & Invoices"
              tooltip="Access Stripe billing portal to manage payment methods, view invoices, and update your subscription"
              control={
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/billing">
                    Manage <ExternalLink className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              }
            />
          </SettingsSection>
        </CardContent>
      </Card>
    </div>
  )
}
