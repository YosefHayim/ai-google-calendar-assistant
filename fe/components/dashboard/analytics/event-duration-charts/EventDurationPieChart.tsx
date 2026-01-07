'use client'

import * as React from 'react'
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { EventDurationCategory } from '@/types/analytics'
import { EventsListPopover } from '../EventsListPopover'

interface EventDurationPieChartProps {
  data: EventDurationCategory[]
  onCategoryClick?: (category: EventDurationCategory) => void
}

export const EventDurationPieChart: React.FC<EventDurationPieChartProps> = ({ data, onCategoryClick }) => {
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
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="count"
                nameKey="label"
                className="cursor-pointer"
                onClick={(_, index) => {
                  const category = chartData[index]
                  if (category.events.length > 0) {
                    setActiveCategory(category)
                    setPopoverOpen(true)
                  }
                  onCategoryClick?.(category)
                }}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} />
                ))}
              </Pie>
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
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => {
                  const cat = chartData.find(c => c.label === value)
                  return <span className="text-xs">{value} ({cat?.count || 0})</span>
                }}
              />
            </PieChart>
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
