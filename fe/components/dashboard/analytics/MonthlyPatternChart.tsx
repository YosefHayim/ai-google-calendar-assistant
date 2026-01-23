'use client'

import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import React, { useMemo } from 'react'

import { Calendar } from 'lucide-react'
import type { MonthlyPatternDataPoint } from '@/types/analytics'
import { Skeleton } from '@/components/ui/skeleton'

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
      <div className="rounded-xl bg-background bg-secondary p-6 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="mb-6 h-4 w-48" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    )
  }

  const hasData = filteredData.length > 0

  return (
    <div className="rounded-xl bg-background bg-secondary p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-1 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
          <Calendar className="h-4 w-4 text-foreground" />
        </div>
        <h3 className="font-semibold text-foreground">Monthly Pattern</h3>
      </div>
      <p className="mb-6 ml-10 text-xs text-muted-foreground">Hours scheduled per day of month</p>

      {!hasData ? (
        <div className="flex h-[200px] items-center justify-center text-muted-foreground">
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
