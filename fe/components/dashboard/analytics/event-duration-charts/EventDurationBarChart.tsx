'use client'

import * as React from 'react'
import { Bar, BarChart, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { EventDurationCategory } from '@/types/analytics'
import { EventsListPopover } from '../EventsListPopover'

interface EventDurationBarChartProps {
  data: EventDurationCategory[]
  onCategoryClick?: (category: EventDurationCategory) => void
}

export const EventDurationBarChart: React.FC<EventDurationBarChartProps> = ({ data, onCategoryClick }) => {
  const [activeCategory, setActiveCategory] = React.useState<EventDurationCategory | null>(null)
  const [popoverOpen, setPopoverOpen] = React.useState(false)

  const chartData = React.useMemo(() => {
    return data.filter((d) => d.count > 0)
  }, [data])

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              onClick={(state) => {
                if (state?.activePayload?.[0]?.payload) {
                  const category = state.activePayload[0].payload as EventDurationCategory
                  if (category.events.length > 0) {
                    setActiveCategory(category)
                    setPopoverOpen(true)
                  }
                  onCategoryClick?.(category)
                }
              }}
            >
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length > 0) {
                    const category = payload[0].payload as EventDurationCategory
                    return (
                      <div className="bg-zinc-900 dark:bg-zinc-800 text-white px-3 py-2 rounded-lg shadow-lg">
                        <p className="font-medium">{category.label}</p>
                        <p className="text-xs text-zinc-400">{category.range}</p>
                        <p className="text-sm">{category.count} events ({category.percentage.toFixed(0)}%)</p>
                        {category.events.length > 0 && (
                          <p className="text-xs text-emerald-400 mt-1">Click to view events</p>
                        )}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={60} className="cursor-pointer">
                {chartData.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </PopoverTrigger>
      {activeCategory && activeCategory.events.length > 0 && (
        <PopoverContent side="top" align="center" className="p-0">
          <EventsListPopover
            events={activeCategory.events}
            title={`${activeCategory.label} (${activeCategory.range})`}
          />
        </PopoverContent>
      )}
    </Popover>
  )
}
