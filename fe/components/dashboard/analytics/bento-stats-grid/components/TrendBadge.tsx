'use client'

import React from 'react'
import { TrendText } from '@/components/ui/trend-badge'

interface TrendBadgeProps {
  direction: 'up' | 'down' | 'neutral'
  percentage: number
}

export function TrendBadge({ direction, percentage }: TrendBadgeProps) {
  const absPercentage = Math.abs(percentage)
  const value = direction === 'up' ? absPercentage : direction === 'down' ? -absPercentage : 0
  return <TrendText value={Number(value.toFixed(1))} />
}
