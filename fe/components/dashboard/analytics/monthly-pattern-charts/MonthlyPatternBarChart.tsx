'use client'

import * as React from 'react'
import { Bar, BarChart, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { MonthlyPatternDataPoint } from '@/types/analytics'
import EventsListDialog from '@/components/dialogs/EventsListDialog'

interface MonthlyPatternBarChartProps {
  data: MonthlyPatternDataPoint[]
  onDayClick?: (dayOfMonth: number, events: MonthlyPatternDataPoint['events']) => void
}

export const MonthlyPatternBarChart: React.FC<MonthlyPatternBarChartProps> = ({ data, onDayClick }) => {
  const [activeDataPoint, setActiveDataPoint] = React.useState<MonthlyPatternDataPoint | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const filteredData = React.useMemo(() => {
    if (!data || data.length === 0) return []
    return data.filter((d) => d.hours > 0 || d.eventCount > 0)
  }, [data])

  const maxHours = React.useMemo(() => {
    return Math.max(...filteredData.map((d) => d.hours), 0)
  }, [filteredData])

  const getBarColor = (hours: number) => {
    const intensity = maxHours > 0 ? hours / maxHours : 0
    if (intensity > 0.7) return '#059669'
    if (intensity > 0.4) return '#34d399'
    return '#6ee7b7'
  }

  return (
    <>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={filteredData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            onClick={(state) => {
              if (state?.activePayload?.[0]?.payload) {
                const point = state.activePayload[0].payload as MonthlyPatternDataPoint
                if (point.events.length > 0) {
                  setActiveDataPoint(point)
                  setDialogOpen(true)
                }
                onDayClick?.(point.dayOfMonth, point.events)
              }
            }}
          >
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
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length > 0) {
                  const point = payload[0].payload as MonthlyPatternDataPoint
                  return (
                    <div className="rounded-lg bg-secondary px-3 py-2 text-foreground shadow-lg">
                      <p className="font-medium">Day {point.dayOfMonth}</p>
                      <p className="text-sm">{point.hours}h scheduled</p>
                      <p className="text-xs text-muted-foreground">{point.eventCount} events</p>
                      {point.events.length > 0 && <p className="mt-1 text-xs text-emerald-400">Click to view events</p>}
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="hours" radius={[4, 4, 0, 0]} maxBarSize={20} className="cursor-pointer">
              {filteredData.map((entry) => (
                <Cell key={entry.dayOfMonth} fill={getBarColor(entry.hours)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <EventsListDialog
        isOpen={dialogOpen}
        title={activeDataPoint ? `Day ${activeDataPoint.dayOfMonth}` : ''}
        subtitle={activeDataPoint ? `${activeDataPoint.hours}h scheduled` : undefined}
        events={activeDataPoint?.events ?? []}
        onClose={() => setDialogOpen(false)}
      />
    </>
  )
}
