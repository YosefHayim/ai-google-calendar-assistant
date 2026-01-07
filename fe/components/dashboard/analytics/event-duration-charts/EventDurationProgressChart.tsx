'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { EventDurationCategory } from '@/types/analytics'
import { EventsListPopover } from '../EventsListPopover'

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
  const [popoverOpen, setPopoverOpen] = React.useState(false)

  const segments = React.useMemo(() => {
    return data.filter((s) => s.count > 0)
  }, [data])

  const handleCategoryClick = (category: EventDurationCategory) => {
    if (category.events.length > 0) {
      setActiveCategory(category)
      setPopoverOpen(true)
    }
    onCategoryClick?.(category)
  }

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <div className="space-y-6">
          <div className="relative h-8 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
            {segments.map((segment, index) => (
              <Button
                key={segment.key}
                variant="ghost"
                className="h-full p-0 transition-all duration-500 relative group cursor-pointer hover:opacity-80 rounded-none"
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
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {segment.percentage >= 15 && (
                    <span className="text-xs font-medium text-white drop-shadow-sm">
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
                className="flex items-center gap-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg p-1 -m-1 h-auto justify-start"
                onClick={() => handleCategoryClick(cat)}
              >
                <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: cat.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{cat.label}</span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">({cat.range})</span>
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {cat.count} events ({totalEvents > 0 ? ((cat.count / totalEvents) * 100).toFixed(0) : 0}%)
                  </div>
                </div>
              </Button>
            ))}
          </div>
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
