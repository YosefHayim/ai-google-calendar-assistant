'use client'

import { Card, CardContent } from '@/components/ui/card'

import React from 'react'
import { Zap } from 'lucide-react'

export function PayAsYouGoCard() {
  return (
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
          <Zap className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground dark:text-white">Pay As You Go</p>
            <p className="text-xs text-muted-foreground">$1 = 100 AI interactions</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
