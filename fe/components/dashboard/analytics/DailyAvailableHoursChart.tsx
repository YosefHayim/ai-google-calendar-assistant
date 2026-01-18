'use client'

import * as React from 'react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { Clock, Info } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import type { DailyAvailableHoursDataPoint } from '@/types/analytics'
import { CALENDAR_CONSTANTS } from '@/lib/constants'
import { calculateAverage } from '@/lib/dataUtils'
import { formatHours } from '@/lib/formatUtils'

interface DailyAvailableHoursChartProps {
  data: DailyAvailableHoursDataPoint[]
  onDayClick?: (date: string, hours: number) => void
}

const chartConfig = {
  hours: {
    label: 'Available Hours',
    color: '#f26306',
  },
} satisfies ChartConfig

const DailyAvailableHoursChart: React.FC<DailyAvailableHoursChartProps> = ({ data, onDayClick }) => {
  const totalAvailableHours = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.hours, 0)
  }, [data])

  const averageAvailableHours = React.useMemo(() => {
    return calculateAverage(data.map((point) => point.hours))
  }, [data])

  // Transform data for the chart
  const chartData = React.useMemo(() => {
    return data.map((point) => ({
      ...point,
      formattedDate: format(new Date(point.date), 'MMM dd'),
    }))
  }, [data])

  if (!data || data.length === 0) {
    return (
      <Card className="lg:col-span-3 bg-background dark:bg-secondary border border dark:border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Daily Available Hours
          </CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="lg:col-span-3 bg-background dark:bg-secondary border border dark:border py-0">
      <CardHeader className="flex flex-col items-stretch border-b border dark:border !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-4">
          <CardTitle className="flex items-center gap-2 text-foreground dark:text-primary-foreground">
            <Clock className="w-5 h-5 text-primary" />
            Daily Available Hours
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  <Info size={16} />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Daily Available Hours</h4>
                  <p className="text-xs text-zinc-600 dark:text-muted-foreground">
                    Shows your available hours remaining each day after scheduled events. Based on{' '}
                    {CALENDAR_CONSTANTS.WAKING_HOURS_PER_DAY} waking hours per day (assuming ~8 hours of sleep), minus
                    time spent in calendar events.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </CardTitle>
          <CardDescription className="text-muted-foreground dark:text-muted-foreground text-xs font-medium italic">
            Hours remaining after scheduled events each day.
          </CardDescription>
        </div>
        <div className="flex">
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t border dark:border px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-6 sm:py-4 lg:px-8 lg:py-6">
            <span className="text-muted-foreground dark:text-muted-foreground text-xs">Total Available</span>
            <span className="text-lg leading-none font-bold text-foreground dark:text-primary-foreground sm:text-xl lg:text-3xl">
              {formatHours(totalAvailableHours)}
            </span>
          </div>
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t border-l border dark:border px-6 py-4 text-left sm:border-t-0 sm:px-6 sm:py-4 lg:px-8 lg:py-6">
            <span className="text-muted-foreground dark:text-muted-foreground text-xs">Daily Avg</span>
            <span className="text-lg leading-none font-bold text-foreground dark:text-primary-foreground sm:text-xl lg:text-3xl">
              {formatHours(averageAvailableHours)}
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
              onClick={(data) => {
                if (onDayClick && data?.payload) {
                  const point = data.payload as DailyAvailableHoursDataPoint & { formattedDate: string }
                  onDayClick(point.date, point.hours)
                }
              }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default DailyAvailableHoursChart
