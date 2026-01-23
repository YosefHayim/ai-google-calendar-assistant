'use client'

import * as React from 'react'
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import type { WeeklyPatternDataPoint } from '@/types/analytics'
import EventsListDialog from '@/components/dialogs/EventsListDialog'

interface WeeklyPatternLineChartProps {
  data: WeeklyPatternDataPoint[]
  onDayClick?: (dayIndex: number, events: WeeklyPatternDataPoint['events']) => void
}

export const WeeklyPatternLineChart: React.FC<WeeklyPatternLineChartProps> = ({ data, onDayClick }) => {
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
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={orderedData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            onClick={(state) => {
              if (state?.activePayload?.[0]?.payload) {
                const point = state.activePayload[0].payload as WeeklyPatternDataPoint
                if (point.events.length > 0) {
                  setActiveDataPoint(point)
                  setDialogOpen(true)
                }
                onDayClick?.(point.dayIndex, point.events)
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted dark:stroke-muted" />
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
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length > 0) {
                  const point = payload[0].payload as WeeklyPatternDataPoint
                  return (
                    <div className="bg-secondary dark:bg-secondary text-white px-3 py-2 rounded-lg shadow-lg">
                      <p className="font-medium">{point.day}</p>
                      <p className="text-sm">{point.hours}h scheduled</p>
                      <p className="text-xs text-muted-foreground">{point.eventCount} events</p>
                      {point.events.length > 0 && <p className="text-xs text-accent mt-1">Click to view events</p>}
                    </div>
                  )
                }
                return null
              }}
            />
            <Line
              type="monotone"
              dataKey="hours"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ fill: '#6366f1', strokeWidth: 2, r: 4, cursor: 'pointer' }}
              activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2, cursor: 'pointer' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

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
