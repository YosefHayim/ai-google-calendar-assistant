'use client'

import * as React from 'react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from 'recharts'

import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import type { CalendarBreakdownItem } from '@/types/analytics'
import { getValidHexColor } from '@/lib/colorUtils'
import { calculateMax } from '@/lib/dataUtils'

interface TimeAllocationRadarChartProps {
  data: CalendarBreakdownItem[]
  onCalendarClick?: (calendarId: string, calendarName: string, calendarColor: string) => void
}

const chartConfig = {
  hours: {
    label: 'Hours',
    color: '#f26306',
  },
} satisfies ChartConfig

export const TimeAllocationRadarChart: React.FC<TimeAllocationRadarChartProps> = ({ data, onCalendarClick }) => {
  const chartData = React.useMemo(() => {
    return data.map((item) => ({
      ...item,
      fill: getValidHexColor(item.color),
    }))
  }, [data])

  const maxHours = React.useMemo(() => {
    return calculateMax(data.map((d) => d.hours), 1)
  }, [data])

  const _handleClick = (entry: CalendarBreakdownItem) => {
    if (onCalendarClick && entry.calendarId) {
      onCalendarClick(entry.calendarId, entry.category, getValidHexColor(entry.color))
    }
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
        <PolarGrid
          className="stroke-zinc-200 dark:stroke-zinc-700"
          gridType="polygon"
        />
        <PolarAngleAxis
          dataKey="category"
          className="text-zinc-600 dark:text-zinc-400"
          tick={{ fill: 'currentColor', fontSize: 11 }}
          tickLine={false}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, maxHours]}
          className="text-zinc-500 dark:text-zinc-400"
          tick={{ fill: 'currentColor', fontSize: 10 }}
          tickFormatter={(value) => `${value}h`}
          axisLine={false}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length > 0) {
              const item = payload[0].payload as CalendarBreakdownItem
              return (
                <div className="rounded-lg border border-zinc-700 bg-zinc-900 dark:bg-zinc-800 px-3 py-2 text-white shadow-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: getValidHexColor(item.color) }}
                    />
                    <span className="font-medium text-sm">{item.category}</span>
                  </div>
                  <div className="text-zinc-300 text-xs">
                    {item.hours.toFixed(1)} hours
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Radar
          name="Hours"
          dataKey="hours"
          stroke="#f26306"
          fill="#f26306"
          fillOpacity={0.4}
          className="cursor-pointer"
        />
      </RadarChart>
    </ChartContainer>
  )
}
