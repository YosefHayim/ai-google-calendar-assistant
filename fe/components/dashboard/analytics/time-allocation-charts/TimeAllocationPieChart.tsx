'use client'

import * as React from 'react'
import { Pie, PieChart, Cell, Legend, Tooltip } from 'recharts'

import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import type { CalendarBreakdownItem } from '@/types/analytics'
import { getValidHexColor } from '@/lib/colorUtils'
import { calculatePercentage, sumBy } from '@/lib/dataUtils'
import { formatHours } from '@/lib/formatUtils'

interface TimeAllocationPieChartProps {
  data: CalendarBreakdownItem[]
  onCalendarClick?: (calendarId: string, calendarName: string, calendarColor: string) => void
}

const chartConfig = {
  hours: {
    label: 'Hours',
  },
} satisfies ChartConfig

export const TimeAllocationPieChart: React.FC<TimeAllocationPieChartProps> = ({ data, onCalendarClick }) => {
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
                <div className="rounded-lg border-border bg-secondary dark:bg-secondary px-3 py-2 text-primary-foreground shadow-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getValidHexColor(item.color) }} />
                    <span className="font-medium text-sm">{item.category}</span>
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {formatHours(item.hours, 1)} ({item.percentage}%)
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="right"
          wrapperStyle={{ paddingLeft: '20px' }}
          content={({ payload }) => (
            <ul className="space-y-2 text-sm">
              {payload?.map((entry, index) => {
                const item = chartData[index]
                return (
                  <li
                    key={`legend-${index}`}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleClick(item)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleClick(item)
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className="text-muted-foreground truncate max-w-[100px]">{item.category}</span>
                    <span className="text-muted-foreground dark:text-muted-foreground font-mono text-xs">
                      {formatHours(item.hours)}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        />
        <Pie
          data={chartData}
          cx="40%"
          cy="50%"
          innerRadius={0}
          outerRadius={100}
          dataKey="hours"
          nameKey="category"
          className="cursor-pointer"
          onClick={(_, index) => handleClick(chartData[index])}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
