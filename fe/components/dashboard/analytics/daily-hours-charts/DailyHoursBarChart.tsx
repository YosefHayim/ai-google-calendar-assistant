'use client'

import * as React from 'react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { format } from 'date-fns'

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { formatHours } from '@/lib/formatUtils'
import type { DailyAvailableHoursDataPoint } from '@/types/analytics'

interface DailyHoursBarChartProps {
  data: DailyAvailableHoursDataPoint[]
  onDayClick?: (date: string, hours: number) => void
}

const chartConfig = {
  hours: {
    label: 'Available Hours',
    color: '#f26306',
  },
} satisfies ChartConfig

export const DailyHoursBarChart: React.FC<DailyHoursBarChartProps> = ({ data, onDayClick }) => {
  const chartData = React.useMemo(() => {
    return data.map((point) => ({
      ...point,
      formattedDate: format(new Date(point.date), 'MMM dd'),
    }))
  }, [data])

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
      <BarChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
        <CartesianGrid vertical={false} className="stroke-zinc-200 dark:stroke-zinc-800" />
        <XAxis
          dataKey="formattedDate"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          className="text-muted-foreground dark:text-muted-foreground"
          tick={{ fill: 'currentColor', fontSize: 12 }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              className="w-[180px] bg-secondary dark:bg-secondary text-white border-zinc-700"
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
        <Bar
          dataKey="hours"
          fill="var(--color-hours)"
          radius={[4, 4, 0, 0]}
          className="cursor-pointer"
          onClick={(barData) => {
            if (onDayClick && barData?.payload) {
              const point = barData.payload as DailyAvailableHoursDataPoint
              onDayClick(point.date, point.hours)
            }
          }}
        />
      </BarChart>
    </ChartContainer>
  )
}
