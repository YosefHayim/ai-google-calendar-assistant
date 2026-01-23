'use client'

import * as React from 'react'
import { Bar, BarChart, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { EventDurationCategory } from '@/types/analytics'
import EventsListDialog from '@/components/dialogs/EventsListDialog'

interface EventDurationBarChartProps {
  data: EventDurationCategory[]
  onCategoryClick?: (category: EventDurationCategory) => void
}

export const EventDurationBarChart: React.FC<EventDurationBarChartProps> = ({ data, onCategoryClick }) => {
  const [activeCategory, setActiveCategory] = React.useState<EventDurationCategory | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const chartData = React.useMemo(() => {
    return data.filter((d) => d.count > 0)
  }, [data])

  return (
    <>
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
                  setDialogOpen(true)
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
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length > 0) {
                  const category = payload[0].payload as EventDurationCategory
                  return (
                    <div className="rounded-lg bg-secondary px-3 py-2 text-foreground shadow-lg">
                      <p className="font-medium">{category.label}</p>
                      <p className="text-xs text-muted-foreground">{category.range}</p>
                      <p className="text-sm">
                        {category.count} events ({category.percentage.toFixed(0)}%)
                      </p>
                      {category.events.length > 0 && (
                        <p className="mt-1 text-xs text-emerald-400">Click to view events</p>
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
