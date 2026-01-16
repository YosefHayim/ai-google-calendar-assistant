import type { EnhancedAnalyticsData, ComparisonResult } from '@/types/analytics'

export interface BentoStatsGridProps {
  data: EnhancedAnalyticsData
  comparison?: ComparisonResult | null
  isLoading?: boolean
}

export interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number | string
  suffix?: string
  description: string
  trend?: {
    direction: 'up' | 'down' | 'neutral'
    percentage: number
  }
  isLarge?: boolean
}
