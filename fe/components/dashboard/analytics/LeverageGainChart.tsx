'use client'

import * as React from 'react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { Info, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import type { TimeSavedDataPoint } from '@/types/analytics'

interface LeverageGainChartProps {
  data: TimeSavedDataPoint[]
}

const chartConfig = {
  hours: {
    label: 'Hours Saved',
    color: '#f26306',
  },
} satisfies ChartConfig

const LeverageGainChart: React.FC<LeverageGainChartProps> = ({ data }) => {
  const totalHours = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.hours, 0)
  }, [data])

  const averageHours = React.useMemo(() => {
    return data.length > 0 ? totalHours / data.length : 0
  }, [data, totalHours])

  // Transform data for the chart
  const chartData = React.useMemo(() => {
    return data.map((point) => ({
      ...point,
      formattedDate: format(new Date(point.date), 'MMM dd'),
    }))
  }, [data])

  if (!data || data.length === 0) {
    return (
      <Card className="lg:col-span-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Leverage Gain
          </CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="lg:col-span-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 py-0">
      <CardHeader className="flex flex-col items-stretch border-b border-zinc-200 dark:border-zinc-800 !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-4">
          <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
            <TrendingUp className="w-5 h-5 text-primary" />
            Leverage Gain
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
          </CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-400 text-xs font-medium italic">
            Measuring the time Ally returned to your deep work pool.
          </CardDescription>
        </div>
        <div className="flex">
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t border-zinc-200 dark:border-zinc-800 px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
            <span className="text-zinc-500 dark:text-zinc-400 text-xs">Total Saved</span>
            <span className="text-lg leading-none font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
              {totalHours.toFixed(1)}h
            </span>
          </div>
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t border-l border-zinc-200 dark:border-zinc-800 px-6 py-4 text-left sm:border-t-0 sm:px-8 sm:py-6">
            <span className="text-zinc-500 dark:text-zinc-400 text-xs">Daily Avg</span>
            <span className="text-lg leading-none font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
              {averageHours.toFixed(1)}h
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} className="stroke-zinc-200 dark:stroke-zinc-800" />
            <XAxis
              dataKey="formattedDate"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              className="text-zinc-500 dark:text-zinc-400"
              tick={{ fill: 'currentColor', fontSize: 12 }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[180px] bg-zinc-900 dark:bg-zinc-800 text-white border-zinc-700"
                  nameKey="hours"
                  labelFormatter={(value, payload) => {
                    if (payload && payload[0]) {
                      const point = payload[0].payload as TimeSavedDataPoint
                      return (
                        <div className="flex flex-col gap-1">
                          <span className="text-zinc-400 text-xs">Day {point.day}</span>
                          <span className="font-medium">
                            {format(new Date(point.date), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      )
                    }
                    return value
                  }}
                  formatter={(value) => [`${Number(value).toFixed(1)}h saved`, '']}
                />
              }
            />
            <Bar
              dataKey="hours"
              fill="var(--color-hours)"
              radius={[4, 4, 0, 0]}
              className="cursor-pointer"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default LeverageGainChart
