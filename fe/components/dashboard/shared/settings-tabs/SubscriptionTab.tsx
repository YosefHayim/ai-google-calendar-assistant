'use client'

import React from 'react'
import { Brain, Calendar, Smartphone, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const features = [
  { icon: Zap, text: 'Unlimited event creations & updates', colorClass: 'text-amber-500' },
  { icon: Brain, text: 'Smart Conflict Resolution Agents', colorClass: 'text-purple-500' },
  { icon: Calendar, text: 'Multi-Calendar Sync', colorClass: 'text-green-600' },
  { icon: Smartphone, text: 'Priority Telegram & WhatsApp Support', colorClass: 'text-blue-500' },
]

export const SubscriptionTab: React.FC = () => {
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subscription</CardTitle>
          <CardDescription>
            Current Plan: <span className="font-medium">Free Tier</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Unlock the full power of Ally</div>
          <ul className="grid gap-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <feature.icon className={`h-5 w-5 ${feature.colorClass}`} />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">{feature.text}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Upgrade to Pro</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Billing Portal</CardTitle>
          <CardDescription>Manage payment methods and invoices via Stripe.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline">Manage Billing</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
