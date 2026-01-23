'use client'

import * as React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { format } from 'date-fns'

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { formatHours } from '@/lib/formatUtils'
import type { DailyAvailableHoursDataPoint } from '@/types/analytics'

interface DailyHoursAreaChartProps {
  data: DailyAvailableHoursDataPoint[]
  onDayClick?: (date: string, hours: number) => void
}

const chartConfig = {
  hours: {
    label: 'Available Hours',
    color: '#f26306',
  },
} satisfies ChartConfig

export const DailyHoursAreaChart: React.FC<DailyHoursAreaChartProps> = ({ data, onDayClick }) => {
  const chartData = React.useMemo(() => {
    return data.map((point) => ({
      ...point,
      formattedDate: format(new Date(point.date), 'MMM dd'),
    }))
  }, [data])

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
      <AreaChart
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
        <defs>
          <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f26306" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#f26306" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted dark:stroke-muted" />
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
        <Area
          type="monotone"
          dataKey="hours"
          stroke="var(--color-hours)"
          strokeWidth={2}
          fill="url(#hoursGradient)"
          className="cursor-pointer"
          dot={{
            fill: 'var(--color-hours)',
            r: 3,
            strokeWidth: 0,
          }}
          activeDot={{
            r: 5,
            fill: 'var(--color-hours)',
            stroke: '#fff',
            strokeWidth: 2,
          }}
        />
      </AreaChart>
    </ChartContainer>
  )
}
