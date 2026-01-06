import {
  Activity,
  Award,
  BarChart3,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  Coffee,
  Compass,
  Flame,
  Heart,
  Layers,
  Moon,
  PieChart,
  Sun,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react'

import type { InsightIconName } from '@/types/analytics'

/**
 * Maps icon string names from the API to Lucide React components
 */
export const insightIconMap: Record<InsightIconName, LucideIcon> = {
  zap: Zap,
  users: Users,
  coffee: Coffee,
  'bar-chart': BarChart3,
  calendar: Calendar,
  clock: Clock,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  sun: Sun,
  moon: Moon,
  target: Target,
  activity: Activity,
  award: Award,
  briefcase: Briefcase,
  'check-circle': CheckCircle,
  compass: Compass,
  flame: Flame,
  heart: Heart,
  layers: Layers,
  'pie-chart': PieChart,
}

/**
 * Get a Lucide icon component from an icon name string
 * Falls back to Zap if the icon name is not recognized
 *
 * @param name - The icon name from the API
 * @returns The corresponding Lucide icon component
 */
export function getInsightIcon(name: InsightIconName): LucideIcon {
  return insightIconMap[name] || Zap
}
