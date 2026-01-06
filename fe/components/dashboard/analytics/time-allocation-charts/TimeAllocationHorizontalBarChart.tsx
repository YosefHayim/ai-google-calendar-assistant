'use client'

import * as React from 'react'
import { Bar, BarChart, XAxis, YAxis, Cell } from 'recharts'

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import type { CalendarBreakdownItem } from '@/types/analytics'
import { getValidHexColor } from '@/lib/colorUtils'
import { calculatePercentage, sumBy } from '@/lib/dataUtils'

interface TimeAllocationHorizontalBarChartProps {
  data: CalendarBreakdownItem[]
  onCalendarClick?: (calendarId: string, calendarName: string, calendarColor: string) => void
}

const chartConfig = {
  hours: {
    label: 'Hours',
  },
} satisfies ChartConfig

export const TimeAllocationHorizontalBarChart: React.FC<TimeAllocationHorizontalBarChartProps> = ({
  data,
  onCalendarClick,
}) => {
  const totalHours = sumBy(data, 'hours')

  const chartData = React.useMemo(() => {
    return data.map((item) => ({
      ...item,
      fill: getValidHexColor(item.color),
      percentage: calculatePercentage(item.hours, totalHours, 1),
    }))
  }, [data, totalHours])

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
      <BarChart
        accessibilityLayer
        data={chartData}
        layout="vertical"
        margin={{ left: 0, right: 24, top: 12, bottom: 12 }}
      >
        <YAxis
          dataKey="category"
          type="category"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={100}
          className="text-zinc-500 dark:text-zinc-400"
          tick={{ fill: 'currentColor', fontSize: 11 }}
        />
        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="text-zinc-500 dark:text-zinc-400"
          tick={{ fill: 'currentColor', fontSize: 11 }}
          tickFormatter={(value) => `${value}h`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              className="w-[180px] bg-zinc-900 dark:bg-zinc-800 text-white border-zinc-700"
              formatter={(value, name, item) => {
                const payload = item.payload as CalendarBreakdownItem & { percentage: number }
                return (
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{payload.category}</span>
                    <span className="text-zinc-300">
                      {Number(value).toFixed(1)} hours ({payload.percentage}%)
                    </span>
                  </div>
                )
              }}
            />
          }
        />
        <Bar
          dataKey="hours"
          radius={[0, 4, 4, 0]}
          className="cursor-pointer"
          onClick={(barData) => {
            if (onCalendarClick && barData?.payload) {
              const payload = barData.payload as CalendarBreakdownItem
              if (payload.calendarId) {
                onCalendarClick(payload.calendarId, payload.category, getValidHexColor(payload.color))
              }
            }
          }}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
