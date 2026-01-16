'use client'

import React from 'react'
import { TrendText } from '@/components/ui/trend-badge'

interface TrendBadgeProps {
  direction: 'up' | 'down' | 'neutral'
  percentage: number
}

export function TrendBadge({ direction, percentage }: TrendBadgeProps) {
  const value = direction === 'up' ? percentage : direction === 'down' ? -percentage : 0
  return <TrendText value={Number(value.toFixed(1))} />
}
