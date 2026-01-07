'use client'

import { useState, useEffect, useCallback } from 'react'

export type ChartType = 'bar' | 'line' | 'area' | 'stacked'

const STORAGE_PREFIX = 'analytics_chart_type_'

export function useChartPreference(chartId: string, defaultType: ChartType = 'bar') {
  const [chartType, setChartTypeState] = useState<ChartType>(defaultType)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const storageKey = `${STORAGE_PREFIX}${chartId}`
    const stored = localStorage.getItem(storageKey)
    if (stored && ['bar', 'line', 'area', 'stacked'].includes(stored)) {
      setChartTypeState(stored as ChartType)
    }
    setIsHydrated(true)
  }, [chartId])

  const setChartType = useCallback(
    (type: ChartType) => {
      const storageKey = `${STORAGE_PREFIX}${chartId}`
      localStorage.setItem(storageKey, type)
      setChartTypeState(type)
    },
    [chartId],
  )

  return { chartType, setChartType, isHydrated }
}
