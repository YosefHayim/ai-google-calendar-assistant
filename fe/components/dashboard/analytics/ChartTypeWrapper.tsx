'use client'

import * as React from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { AreaChart, BarChart3, BarChartHorizontal, CircleDot, Layers, LineChart, PieChart, Radar } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'

const ALL_CHART_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  bar: BarChart3,
  line: LineChart,
  area: AreaChart,
  stacked: Layers,
  pie: PieChart,
  donut: CircleDot,
  radar: Radar,
  horizontal: BarChartHorizontal,
  progress: Layers,
}

const STORAGE_PREFIX = 'analytics_chart_type_'

interface ChartTypeWrapperProps<T extends string> {
  chartId: string
  chartTypes: readonly T[]
  defaultType: T
  labels?: Partial<Record<T, string>>
  children: (chartType: T) => React.ReactNode
  className?: string
  tabsPosition?: 'left' | 'right'
}

export function ChartTypeWrapper<T extends string>({
  chartId,
  chartTypes,
  defaultType,
  labels = {},
  children,
  className,
  tabsPosition = 'right',
}: ChartTypeWrapperProps<T>) {
  const { t } = useLanguage()
  const [chartType, setChartTypeState] = React.useState<T>(defaultType)
  const [isHydrated, setIsHydrated] = React.useState(false)

  React.useEffect(() => {
    const storageKey = `${STORAGE_PREFIX}${chartId}`
    const stored = localStorage.getItem(storageKey)
    if (stored && chartTypes.includes(stored as T)) {
      setChartTypeState(stored as T)
    }
    setIsHydrated(true)
  }, [chartId, chartTypes])

  const setChartType = React.useCallback(
    (type: T) => {
      const storageKey = `${STORAGE_PREFIX}${chartId}`
      localStorage.setItem(storageKey, type)
      setChartTypeState(type)
    },
    [chartId],
  )

  if (!isHydrated) {
    return null
  }

  return (
    <div className={className}>
      <div className={cn('flex mb-4', tabsPosition === 'right' ? 'justify-end' : 'justify-start')}>
        <Tabs value={chartType} onValueChange={(value) => setChartType(value as T)}>
          <TabsList className="h-8">
            {chartTypes.map((type) => {
              const IconComponent = ALL_CHART_ICONS[type] || BarChart3
              // Use provided label, then try i18n translation, then fallback to capitalized type
              const label =
                labels[type] || t(`analytics.chartTypes.${type}`) || type.charAt(0).toUpperCase() + type.slice(1)
              return (
                <TabsTrigger key={type} value={type} className="h-7 px-2 text-xs gap-1" title={label}>
                  <IconComponent size={14} />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={chartType}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {children(chartType)}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default ChartTypeWrapper
