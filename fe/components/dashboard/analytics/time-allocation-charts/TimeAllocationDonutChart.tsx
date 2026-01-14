'use client'

import * as React from 'react'
import { Pie, PieChart, Cell, Label, Tooltip } from 'recharts'

import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import type { CalendarBreakdownItem } from '@/types/analytics'
import { getValidHexColor } from '@/lib/colorUtils'
import { calculatePercentage, sumBy } from '@/lib/dataUtils'
import { formatHours } from '@/lib/formatUtils'

interface TimeAllocationDonutChartProps {
  data: CalendarBreakdownItem[]
  onCalendarClick?: (calendarId: string, calendarName: string, calendarColor: string) => void
}

const chartConfig = {
  hours: {
    label: 'Hours',
  },
} satisfies ChartConfig

export const TimeAllocationDonutChart: React.FC<TimeAllocationDonutChartProps> = ({ data, onCalendarClick }) => {
  const totalHours = sumBy(data, 'hours')

  const chartData = React.useMemo(() => {
    return data.map((item) => ({
      ...item,
      fill: getValidHexColor(item.color),
      percentage: calculatePercentage(item.hours, totalHours, 1),
    }))
  }, [data, totalHours])

  const handleClick = (entry: CalendarBreakdownItem) => {
    if (onCalendarClick && entry.calendarId) {
      onCalendarClick(entry.calendarId, entry.category, getValidHexColor(entry.color))
    }
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
      <PieChart>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length > 0) {
              const item = payload[0].payload as CalendarBreakdownItem & { percentage: number }
              return (
                <div className="rounded-lg border border-zinc-700 bg-zinc-900 dark:bg-zinc-800 px-3 py-2 text-white shadow-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getValidHexColor(item.color) }} />
                    <span className="font-medium text-sm">{item.category}</span>
                  </div>
                  <div className="text-zinc-300 text-xs">
                    {formatHours(item.hours, 1)} ({item.percentage}%)
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={110}
          dataKey="hours"
          nameKey="category"
          className="cursor-pointer"
          onClick={(_, index) => handleClick(chartData[index])}
          paddingAngle={2}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
          ))}
          <Label
            content={({ viewBox }) => {
              if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-zinc-900 dark:fill-zinc-100 text-3xl font-bold"
                    >
                      {formatHours(totalHours)}
                    </tspan>
                    <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-zinc-500 text-xs font-medium">
                      Tracked
                    </tspan>
                  </text>
                )
              }
              return null
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
