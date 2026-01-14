'use client'

import * as React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Legend } from 'recharts'
import { format } from 'date-fns'

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import type { DailyAvailableHoursDataPoint } from '@/types/analytics'
import { CALENDAR_CONSTANTS } from '@/lib/constants'
import { formatHours } from '@/lib/formatUtils'

interface DailyHoursStackedChartProps {
  data: DailyAvailableHoursDataPoint[]
  onDayClick?: (date: string, hours: number) => void
}

const chartConfig = {
  available: {
    label: 'Available',
    color: '#f26306',
  },
  used: {
    label: 'Scheduled',
    color: '#6366f1',
  },
} satisfies ChartConfig

export const DailyHoursStackedChart: React.FC<DailyHoursStackedChartProps> = ({ data, onDayClick }) => {
  const chartData = React.useMemo(() => {
    return data.map((point) => ({
      ...point,
      formattedDate: format(new Date(point.date), 'MMM dd'),
      available: point.hours,
      used: Math.max(0, CALENDAR_CONSTANTS.WAKING_HOURS_PER_DAY - point.hours),
    }))
  }, [data])

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
      <AreaChart
        accessibilityLayer
        data={chartData}
        margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
        stackOffset="none"
        onClick={(state) => {
          if (onDayClick && state?.activePayload?.[0]?.payload) {
            const point = state.activePayload[0].payload as DailyAvailableHoursDataPoint
            onDayClick(point.date, point.hours)
          }
        }}
      >
        <defs>
          <linearGradient id="availableGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f26306" stopOpacity={0.5} />
            <stop offset="95%" stopColor="#f26306" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="usedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
        <XAxis
          dataKey="formattedDate"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          className="text-zinc-500 dark:text-zinc-400"
          tick={{ fill: 'currentColor', fontSize: 12 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="text-zinc-500 dark:text-zinc-400"
          tick={{ fill: 'currentColor', fontSize: 11 }}
          tickFormatter={(value) => `${value}h`}
          domain={[0, CALENDAR_CONSTANTS.WAKING_HOURS_PER_DAY]}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              className="w-[200px] bg-zinc-900 dark:bg-zinc-800 text-white border-zinc-700"
              labelFormatter={(value, payload) => {
                if (payload && payload[0]) {
                  const point = payload[0].payload as DailyAvailableHoursDataPoint & {
                    available: number
                    used: number
                  }
                  return (
                    <div className="flex flex-col gap-1">
                      <span className="text-zinc-400 text-xs">Day {point.day}</span>
                      <span className="font-medium">{format(new Date(point.date), 'MMM dd, yyyy')}</span>
                    </div>
                  )
                }
                return value
              }}
              formatter={(value, name) => {
                const label = name === 'available' ? 'Available' : 'Scheduled'
                return [`${formatHours(Number(value))} ${label.toLowerCase()}`, '']
              }}
            />
          }
        />
        <Legend
          verticalAlign="top"
          height={36}
          content={() => (
            <div className="flex justify-center gap-6 text-xs mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#f26306' }} />
                <span className="text-zinc-600 dark:text-zinc-400">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#6366f1' }} />
                <span className="text-zinc-600 dark:text-zinc-400">Scheduled</span>
              </div>
            </div>
          )}
        />
        <Area type="monotone" dataKey="used" stackId="1" stroke="#6366f1" fill="url(#usedGradient)" />
        <Area
          type="monotone"
          dataKey="available"
          stackId="1"
          stroke="#f26306"
          fill="url(#availableGradient)"
          className="cursor-pointer"
          activeDot={{
            r: 5,
            fill: '#f26306',
            stroke: '#fff',
            strokeWidth: 2,
          }}
        />
      </AreaChart>
    </ChartContainer>
  )
}
