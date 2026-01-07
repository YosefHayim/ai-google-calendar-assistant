'use client'

import * as React from 'react'
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { MonthlyPatternDataPoint } from '@/types/analytics'
import { EventsListPopover } from '../EventsListPopover'

interface MonthlyPatternAreaChartProps {
  data: MonthlyPatternDataPoint[]
  onDayClick?: (dayOfMonth: number, events: MonthlyPatternDataPoint['events']) => void
}

export const MonthlyPatternAreaChart: React.FC<MonthlyPatternAreaChartProps> = ({ data, onDayClick }) => {
  const [activeDataPoint, setActiveDataPoint] = React.useState<MonthlyPatternDataPoint | null>(null)
  const [popoverOpen, setPopoverOpen] = React.useState(false)

  const filteredData = React.useMemo(() => {
    if (!data || data.length === 0) return []
    return data.filter((d) => d.hours > 0 || d.eventCount > 0)
  }, [data])

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
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
              <defs>
                <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
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
              <Area
                type="monotone"
                dataKey="hours"
                stroke="#059669"
                strokeWidth={2}
                fill="url(#monthlyGradient)"
                dot={{ fill: '#059669', strokeWidth: 2, r: 3, cursor: 'pointer' }}
                activeDot={{ r: 5, fill: '#059669', stroke: '#fff', strokeWidth: 2, cursor: 'pointer' }}
              />
            </AreaChart>
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
