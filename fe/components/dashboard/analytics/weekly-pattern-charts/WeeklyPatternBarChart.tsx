'use client'

import * as React from 'react'
import { Bar, BarChart, XAxis, YAxis, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart'
import type { WeeklyPatternDataPoint } from '@/types/analytics'
import EventsListDialog from '@/components/dialogs/EventsListDialog'

interface WeeklyPatternBarChartProps {
  data: WeeklyPatternDataPoint[]
  onDayClick?: (dayIndex: number, events: WeeklyPatternDataPoint['events']) => void
}

const chartConfig = {
  hours: {
    label: 'Hours',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig

export const WeeklyPatternBarChart: React.FC<WeeklyPatternBarChartProps> = ({ data, onDayClick }) => {
  const [activeDataPoint, setActiveDataPoint] = React.useState<WeeklyPatternDataPoint | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const orderedData = React.useMemo(() => {
    if (!data || data.length === 0) return []
    const sorted = [...data].sort((a, b) => {
      const orderA = a.dayIndex === 0 ? 7 : a.dayIndex
      const orderB = b.dayIndex === 0 ? 7 : b.dayIndex
      return orderA - orderB
    })
    return sorted
  }, [data])

  return (
    <>
      <ChartContainer config={chartConfig} className="h-[200px] w-full">
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
            content={({ active, payload }) => {
              if (active && payload && payload.length > 0) {
                const point = payload[0].payload as WeeklyPatternDataPoint
                return (
                  <div className="rounded-lg bg-secondary px-3 py-2 text-foreground shadow-lg">
                    <p className="font-medium">{point.day}</p>
                    <p className="text-sm">{point.hours}h scheduled</p>
                    <p className="text-xs text-muted-foreground">{point.eventCount} events</p>
                    {point.events.length > 0 && <p className="mt-1 text-xs text-accent">Click to view events</p>}
                  </div>
                )
              }
              return null
            }}
          />
          <Bar
            dataKey="hours"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
            className="cursor-pointer"
            onClick={(data, index) => {
              // In Recharts, data contains the payload directly when clicking cells
              const point = data as unknown as WeeklyPatternDataPoint
              if (point && point.events) {
                if (point.events.length > 0) {
                  setActiveDataPoint(point)
                  setDialogOpen(true)
                }
                onDayClick?.(point.dayIndex, point.events)
              }
            }}
          >
            {orderedData.map((entry) => (
              <Cell key={entry.dayIndex} fill={entry.dayIndex === 0 || entry.dayIndex === 6 ? '#a5b4fc' : '#6366f1'} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>

      <EventsListDialog
        isOpen={dialogOpen}
        title={activeDataPoint?.day ?? ''}
        subtitle={activeDataPoint ? `${activeDataPoint.hours}h scheduled` : undefined}
        events={activeDataPoint?.events ?? []}
        onClose={() => setDialogOpen(false)}
      />
    </>
  )
}
