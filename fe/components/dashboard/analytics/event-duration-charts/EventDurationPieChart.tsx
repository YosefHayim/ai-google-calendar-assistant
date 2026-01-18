'use client'

import * as React from 'react'
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { EventDurationCategory } from '@/types/analytics'
import EventsListDialog from '@/components/dialogs/EventsListDialog'

interface EventDurationPieChartProps {
  data: EventDurationCategory[]
  onCategoryClick?: (category: EventDurationCategory) => void
}

export const EventDurationPieChart: React.FC<EventDurationPieChartProps> = ({ data, onCategoryClick }) => {
  const [activeCategory, setActiveCategory] = React.useState<EventDurationCategory | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const chartData = React.useMemo(() => {
    return data.filter((d) => d.count > 0)
  }, [data])

  return (
    <>
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
                  setDialogOpen(true)
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
                    <div className="bg-secondary dark:bg-secondary text-white px-3 py-2 rounded-lg shadow-lg">
                      <p className="font-medium">{category.label}</p>
                      <p className="text-xs text-muted-foreground">{category.range}</p>
                      <p className="text-sm">
                        {category.count} events ({category.percentage.toFixed(0)}%)
                      </p>
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
                const cat = chartData.find((c) => c.label === value)
                return (
                  <span className="text-xs">
                    {value} ({cat?.count || 0})
                  </span>
                )
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <EventsListDialog
        isOpen={dialogOpen}
        title={activeCategory ? `${activeCategory.label}` : ''}
        subtitle={activeCategory ? activeCategory.range : undefined}
        events={activeCategory?.events ?? []}
        onClose={() => setDialogOpen(false)}
      />
    </>
  )
}
