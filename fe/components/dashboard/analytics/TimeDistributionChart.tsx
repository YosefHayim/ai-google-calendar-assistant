'use client'

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import React, { useMemo } from 'react'

import { Clock } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { TimeOfDayDistribution } from '@/types/analytics'

interface TimeDistributionChartProps {
  data: TimeOfDayDistribution
  isLoading?: boolean
}

const TIME_PERIODS = [
  { key: 'morning', label: 'Morning', range: '6am - 12pm', color: 'hsl(var(--secondary))' },
  { key: 'afternoon', label: 'Afternoon', range: '12pm - 6pm', color: 'hsl(var(--accent))' },
  { key: 'evening', label: 'Evening', range: '6pm - 10pm', color: 'hsl(var(--primary))' },
  { key: 'night', label: 'Night', range: '10pm - 6am', color: 'hsl(var(--muted))' },
] as const

const chartConfig = {
  morning: { label: 'Morning', color: 'hsl(var(--secondary))' },
  afternoon: { label: 'Afternoon', color: 'hsl(var(--accent))' },
  evening: { label: 'Evening', color: 'hsl(var(--primary))' },
  night: { label: 'Night', color: 'hsl(var(--muted))' },
}

const TimeDistributionChart: React.FC<TimeDistributionChartProps> = ({ data, isLoading = false }) => {
  const chartData = useMemo(() => {
    return TIME_PERIODS.map((period) => ({
      name: period.label,
      value: data[period.key],
      color: period.color,
      range: period.range,
    }))
  }, [data])

  const total = useMemo(() => {
    return data.morning + data.afternoon + data.evening + data.night
  }, [data])

  if (isLoading) {
    return (
      <div className="rounded-xl bg-background bg-secondary p-6 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-28" />
        </div>
        <Skeleton className="mb-6 h-4 w-44" />
        <div className="flex justify-center">
          <Skeleton className="h-[160px] w-[160px] rounded-full" />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      </div>
    )
  }

  const hasData = total > 0

  return (
    <div className="rounded-xl bg-background bg-secondary p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-1 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
          <Clock className="h-4 w-4 text-foreground" />
        </div>
        <h3 className="font-semibold text-foreground">Time of Day</h3>
      </div>
      <p className="mb-4 ml-10 text-xs text-muted-foreground">When your events are scheduled</p>

      {!hasData ? (
        <div className="flex h-[160px] items-center justify-center text-muted-foreground">No events in this period</div>
      ) : (
        <ChartContainer config={chartConfig} className="mx-auto aspect-auto h-[180px]">
          <div className="relative flex h-full items-center justify-center">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, props) => {
                        const payload = props.payload
                        const percentage = total > 0 ? ((payload.value / total) * 100).toFixed(0) : 0
                        return (
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">{payload.name}</span>
                            <span className="text-xs text-muted-foreground">{payload.range}</span>
                            <span>
                              {value} events ({percentage}%)
                            </span>
                          </div>
                        )
                      }}
                    />
                  }
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{total}</p>
                <p className="text-xs text-muted-foreground">events</p>
              </div>
            </div>
          </div>
        </ChartContainer>
      )}

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
        {TIME_PERIODS.map((period) => {
          const count = data[period.key]
          const percentage = total > 0 ? ((count / total) * 100).toFixed(0) : 0
          return (
            <div key={period.key} className="flex items-center gap-2 text-sm">
              <div className="h-3 w-3 flex-shrink-0 rounded-sm" style={{ backgroundColor: period.color }} />
              <div className="min-w-0 flex-1">
                <span className="truncate text-foreground text-muted-foreground">{period.label}</span>
                <span className="ml-1 text-muted-foreground">
                  {count} ({percentage}%)
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TimeDistributionChart
