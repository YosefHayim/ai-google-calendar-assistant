'use client'

import React, { useMemo } from 'react'
import { CalendarDays } from 'lucide-react'
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import type { WeeklyPatternDataPoint } from '@/types/analytics'

interface WeeklyPatternChartProps {
  data: WeeklyPatternDataPoint[]
  isLoading?: boolean
}

const chartConfig = {
  hours: {
    label: 'Hours',
    color: 'hsl(var(--chart-1))',
  },
}

const WeeklyPatternChart: React.FC<WeeklyPatternChartProps> = ({ data, isLoading = false }) => {
  const orderedData = useMemo(() => {
    if (!data || data.length === 0) return []
    const sorted = [...data].sort((a, b) => {
      const orderA = a.dayIndex === 0 ? 7 : a.dayIndex
      const orderB = b.dayIndex === 0 ? 7 : b.dayIndex
      return orderA - orderB
    })
    return sorted
  }, [data])

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-4 w-48 mb-6" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    )
  }

  const hasData = orderedData.some((d) => d.hours > 0)

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
          <CalendarDays className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Weekly Pattern</h3>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 ml-10">Hours scheduled per day of week</p>

      {!hasData ? (
        <div className="h-[200px] flex items-center justify-center text-zinc-400 dark:text-zinc-600">
          No events scheduled in this period
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={orderedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="dayShort"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => `${value}h`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name, props) => {
                      const payload = props.payload as WeeklyPatternDataPoint
                      return (
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{payload.day}</span>
                          <span>
                            {value}h scheduled
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {payload.eventCount} events
                          </span>
                        </div>
                      )
                    }}
                  />
                }
              />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {orderedData.map((entry) => (
                  <Cell
                    key={entry.dayIndex}
                    fill={entry.dayIndex === 0 || entry.dayIndex === 6 ? '#a5b4fc' : '#6366f1'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}
    </div>
  )
}

export default WeeklyPatternChart
