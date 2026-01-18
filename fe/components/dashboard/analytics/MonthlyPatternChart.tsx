'use client'

import React, { useMemo } from 'react'
import { Calendar } from 'lucide-react'
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import type { MonthlyPatternDataPoint } from '@/types/analytics'

interface MonthlyPatternChartProps {
  data: MonthlyPatternDataPoint[]
  isLoading?: boolean
}

const chartConfig = {
  hours: {
    label: 'Hours',
    color: 'hsl(var(--chart-2))',
  },
}

const MonthlyPatternChart: React.FC<MonthlyPatternChartProps> = ({ data, isLoading = false }) => {
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return []
    return data.filter((d) => d.hours > 0 || d.eventCount > 0)
  }, [data])

  if (isLoading) {
    return (
      <div className="bg-background dark:bg-secondary border border dark:border rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-4 w-48 mb-6" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    )
  }

  const hasData = filteredData.length > 0

  return (
    <div className="bg-background dark:bg-secondary border border dark:border rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-lg bg-secondary dark:bg-secondary flex items-center justify-center">
          <Calendar className="w-4 h-4 text-foreground dark:text-primary" />
        </div>
        <h3 className="font-semibold text-foreground dark:text-primary-foreground">Monthly Pattern</h3>
      </div>
      <p className="text-xs text-muted-foreground dark:text-muted-foreground mb-6 ml-10">Hours scheduled per day of month</p>

      {!hasData ? (
        <div className="h-[200px] flex items-center justify-center text-muted-foreground dark:text-zinc-600">
          No events scheduled in this period
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="dayOfMonth"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                interval={filteredData.length > 15 ? 'preserveStartEnd' : 0}
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
                      const payload = props.payload as MonthlyPatternDataPoint
                      return (
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">Day {payload.dayOfMonth}</span>
                          <span>{value}h scheduled</span>
                          <span className="text-xs text-muted-foreground">{payload.eventCount} events</span>
                        </div>
                      )
                    }}
                  />
                }
              />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]} maxBarSize={20}>
                {filteredData.map((entry) => {
                  const maxHours = Math.max(...filteredData.map((d) => d.hours))
                  const intensity = maxHours > 0 ? entry.hours / maxHours : 0
                  const color = intensity > 0.7 ? '#059669' : intensity > 0.4 ? '#34d399' : '#6ee7b7'
                  return <Cell key={entry.dayOfMonth} fill={color} />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}
    </div>
  )
}

export default MonthlyPatternChart
