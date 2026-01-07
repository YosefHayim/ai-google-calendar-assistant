'use client'

import * as React from 'react'
import { Bar, BarChart, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { MonthlyPatternDataPoint } from '@/types/analytics'
import { EventsListPopover } from '../EventsListPopover'

interface MonthlyPatternBarChartProps {
  data: MonthlyPatternDataPoint[]
  onDayClick?: (dayOfMonth: number, events: MonthlyPatternDataPoint['events']) => void
}

export const MonthlyPatternBarChart: React.FC<MonthlyPatternBarChartProps> = ({ data, onDayClick }) => {
  const [activeDataPoint, setActiveDataPoint] = React.useState<MonthlyPatternDataPoint | null>(null)
  const [popoverOpen, setPopoverOpen] = React.useState(false)

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
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
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
                    setPopoverOpen(true)
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
                      <div className="bg-zinc-900 dark:bg-zinc-800 text-white px-3 py-2 rounded-lg shadow-lg">
                        <p className="font-medium">Day {point.dayOfMonth}</p>
                        <p className="text-sm">{point.hours}h scheduled</p>
                        <p className="text-xs text-zinc-400">{point.eventCount} events</p>
                        {point.events.length > 0 && (
                          <p className="text-xs text-emerald-400 mt-1">Click to view events</p>
                        )}
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
      </PopoverTrigger>
      {activeDataPoint && activeDataPoint.events.length > 0 && (
        <PopoverContent side="top" align="center" className="p-0">
          <EventsListPopover
            events={activeDataPoint.events}
            title={`Day ${activeDataPoint.dayOfMonth}`}
          />
        </PopoverContent>
      )}
    </Popover>
  )
}
