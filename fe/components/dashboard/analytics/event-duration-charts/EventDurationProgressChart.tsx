'use client'

import * as React from 'react'

import { Button } from '@/components/ui/button'
import type { EventDurationCategory } from '@/types/analytics'
import EventsListDialog from '@/components/dialogs/EventsListDialog'

interface EventDurationProgressChartProps {
  data: EventDurationCategory[]
  totalEvents: number
  onCategoryClick?: (category: EventDurationCategory) => void
}

export const EventDurationProgressChart: React.FC<EventDurationProgressChartProps> = ({
  data,
  totalEvents,
  onCategoryClick,
}) => {
  const [activeCategory, setActiveCategory] = React.useState<EventDurationCategory | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const segments = React.useMemo(() => {
    return data.filter((s) => s.count > 0)
  }, [data])

  const handleCategoryClick = (category: EventDurationCategory) => {
    if (category.events.length > 0) {
      setActiveCategory(category)
      setDialogOpen(true)
    }
    onCategoryClick?.(category)
  }

  return (
    <>
      <div className="space-y-6">
        <div className="relative flex h-8 overflow-hidden rounded-full bg-secondary">
          {segments.map((segment, index) => (
            <Button
              key={segment.key}
              variant="ghost"
              className="group relative h-full cursor-pointer rounded-none p-0 transition-all duration-500 hover:opacity-80"
              style={{
                width: `${segment.percentage}%`,
                backgroundColor: segment.color,
                borderTopLeftRadius: index === 0 ? '9999px' : 0,
                borderBottomLeftRadius: index === 0 ? '9999px' : 0,
                borderTopRightRadius: index === segments.length - 1 ? '9999px' : 0,
                borderBottomRightRadius: index === segments.length - 1 ? '9999px' : 0,
              }}
              onClick={() => handleCategoryClick(segment)}
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                {segment.percentage >= 15 && (
                  <span className="text-xs font-medium text-foreground drop-shadow-sm">
                    {segment.percentage.toFixed(0)}%
                  </span>
                )}
              </div>
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {data.map((cat) => (
            <Button
              key={cat.key}
              variant="ghost"
              className="-m-1 flex h-auto items-center justify-start gap-2 rounded-lg p-1 text-left hover:bg-muted hover:bg-secondary/50"
              onClick={() => handleCategoryClick(cat)}
            >
              <div className="h-3 w-3 flex-shrink-0 rounded-sm" style={{ backgroundColor: cat.color }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-medium text-muted-foreground">{cat.label}</span>
                  <span className="text-xs text-muted-foreground">({cat.range})</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {cat.count} events ({totalEvents > 0 ? ((cat.count / totalEvents) * 100).toFixed(0) : 0}%)
                </div>
              </div>
            </Button>
          ))}
        </div>
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
