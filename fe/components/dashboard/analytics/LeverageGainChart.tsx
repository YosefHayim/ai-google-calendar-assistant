'use client'

import { BarChart3, Info, LineChart, TrendingUp } from 'lucide-react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import React, { useState } from 'react'

import TimeSavedChart from './TimeSavedChart'
import TimeSavedColumnChart from './TimeSavedColumnChart'
import type { TimeSavedDataPoint } from '@/types/analytics'

interface LeverageGainChartProps {
  data: TimeSavedDataPoint[]
}

const LeverageGainChart: React.FC<LeverageGainChartProps> = ({ data }) => {
  // Chart type state with localStorage persistence
  const [chartType, setChartType] = useState<'line' | 'column'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('AnalyticsChartType')
      return saved === 'line' || saved === 'column' ? saved : 'column'
    }
    return 'column'
  })

  const handleChartTypeChange = (type: 'line' | 'column') => {
    setChartType(type)
    if (typeof window !== 'undefined') {
      localStorage.setItem('AnalyticsChartType', type)
    }
  }

  return (
    <div className="lg:col-span-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-primary" /> Leverage Gain
            <HoverCard>
              <HoverCardTrigger asChild>
                <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                  <Info size={16} />
                </button>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Leverage Gain</h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    This chart measures the time that Ally has returned to your deep work pool by automating calendar
                    management tasks. Higher values indicate more time saved for focused work.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </h3>
          <p className="text-xs text-zinc-500 font-medium italic">
            Measuring the time Ally returned to your deep work pool.
          </p>
        </div>
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1">
          <button
            onClick={() => handleChartTypeChange('column')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              chartType === 'column'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
            title="Column Chart"
          >
            <BarChart3 size={16} />
          </button>
          <button
            onClick={() => handleChartTypeChange('line')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              chartType === 'line'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
            title="Line Chart"
          >
            <LineChart size={16} />
          </button>
        </div>
      </div>
      <div className="h-64 overflow-visible">
        {chartType === 'column' ? (
          <TimeSavedColumnChart data={data} />
        ) : (
          <TimeSavedChart
            data={data.map((d) => ({
              day: `Day ${d.day}`,
              hours: d.hours,
            }))}
          />
        )}
      </div>
    </div>
  )
}

export default LeverageGainChart
