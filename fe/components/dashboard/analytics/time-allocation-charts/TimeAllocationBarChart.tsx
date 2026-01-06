'use client'

import * as React from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts'

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import type { CalendarBreakdownItem } from '@/types/analytics'
import { getValidHexColor } from '@/lib/colorUtils'

interface TimeAllocationBarChartProps {
  data: CalendarBreakdownItem[]
  onCalendarClick?: (calendarId: string, calendarName: string, calendarColor: string) => void
}

const chartConfig = {
  hours: {
    label: 'Hours',
  },
} satisfies ChartConfig

export const TimeAllocationBarChart: React.FC<TimeAllocationBarChartProps> = ({ data, onCalendarClick }) => {
  const chartData = React.useMemo(() => {
    return data.map((item) => ({
      ...item,
      fill: getValidHexColor(item.color),
    }))
  }, [data])

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
      <BarChart
        accessibilityLayer
        data={chartData}
        margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
      >
        <CartesianGrid vertical={false} className="stroke-zinc-200 dark:stroke-zinc-800" />
        <XAxis
          dataKey="category"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="text-zinc-500 dark:text-zinc-400"
          tick={{ fill: 'currentColor', fontSize: 11 }}
          interval={0}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis
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
              className="w-[160px] bg-zinc-900 dark:bg-zinc-800 text-white border-zinc-700"
              formatter={(value, name, item) => {
                const payload = item.payload as CalendarBreakdownItem
                return (
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{payload.category}</span>
                    <span className="text-zinc-300">{Number(value).toFixed(1)} hours</span>
                  </div>
                )
              }}
            />
          }
        />
        <Bar
          dataKey="hours"
          radius={[4, 4, 0, 0]}
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
