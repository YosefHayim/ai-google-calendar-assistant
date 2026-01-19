'use client'

import * as React from 'react'
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { format } from 'date-fns'

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { formatHours } from '@/lib/formatUtils'
import type { DailyAvailableHoursDataPoint } from '@/types/analytics'

interface DailyHoursLineChartProps {
  data: DailyAvailableHoursDataPoint[]
  onDayClick?: (date: string, hours: number) => void
}

const chartConfig = {
  hours: {
    label: 'Available Hours',
    color: '#f26306',
  },
} satisfies ChartConfig

export const DailyHoursLineChart: React.FC<DailyHoursLineChartProps> = ({ data, onDayClick }) => {
  const chartData = React.useMemo(() => {
    return data.map((point) => ({
      ...point,
      formattedDate: format(new Date(point.date), 'MMM dd'),
    }))
  }, [data])

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
        onClick={(state) => {
          if (onDayClick && state?.activePayload?.[0]?.payload) {
            const point = state.activePayload[0].payload as DailyAvailableHoursDataPoint
            onDayClick(point.date, point.hours)
          }
        }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
        <XAxis
          dataKey="formattedDate"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          className="text-muted-foreground dark:text-muted-foreground"
          tick={{ fill: 'currentColor', fontSize: 12 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="text-muted-foreground dark:text-muted-foreground"
          tick={{ fill: 'currentColor', fontSize: 11 }}
          tickFormatter={(value) => `${value}h`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              className="w-[180px] bg-secondary dark:bg-secondary text-primary-foreground border-border"
              nameKey="hours"
              labelFormatter={(value, payload) => {
                if (payload && payload[0]) {
                  const point = payload[0].payload as DailyAvailableHoursDataPoint
                  return (
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground text-xs">Day {point.day}</span>
                      <span className="font-medium">{format(new Date(point.date), 'MMM dd, yyyy')}</span>
                    </div>
                  )
                }
                return value
              }}
              formatter={(value) => [`${formatHours(Number(value))} available`, '']}
            />
          }
        />
        <Line
          type="monotone"
          dataKey="hours"
          stroke="var(--color-hours)"
          strokeWidth={2}
          dot={{
            fill: 'var(--color-hours)',
            r: 4,
            strokeWidth: 0,
            cursor: 'pointer',
          }}
          activeDot={{
            r: 6,
            fill: 'var(--color-hours)',
            stroke: '#fff',
            strokeWidth: 2,
            cursor: 'pointer',
          }}
        />
      </LineChart>
    </ChartContainer>
  )
}
