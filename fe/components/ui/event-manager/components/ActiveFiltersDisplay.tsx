'use client'

import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { AvailableFilters } from '../types'

interface ActiveFiltersDisplayProps {
  availableFilters: AvailableFilters
  selectedColors: string[]
  selectedTags: string[]
  selectedCategories: string[]
  onRemoveColor: (color: string) => void
  onRemoveTag: (tag: string) => void
  onRemoveCategory: (category: string) => void
}

export function ActiveFiltersDisplay({
  availableFilters,
  selectedColors,
  selectedTags,
  selectedCategories,
  onRemoveColor,
  onRemoveTag,
  onRemoveCategory,
}: ActiveFiltersDisplayProps) {
  const hasActiveFilters = selectedColors.length > 0 || selectedTags.length > 0 || selectedCategories.length > 0

  if (!hasActiveFilters) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Active filters:</span>
      {selectedColors.map((colorValue) => {
        const colorDef = availableFilters.colors.find((c) => c.value === colorValue)
        const isHex = colorValue.startsWith('#')
        return (
          <Badge key={colorValue} variant="secondary" className="gap-1">
            <div
              className={cn('h-2 w-2 rounded-full', !isHex && colorDef?.bg)}
              style={isHex ? { backgroundColor: colorValue } : undefined}
            />
            {isHex ? 'Calendar' : colorDef?.name || colorValue}
            <button onClick={() => onRemoveColor(colorValue)} className="ml-1 hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )
      })}
      {selectedTags.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1">
          {tag}
          <button onClick={() => onRemoveTag(tag)} className="ml-1 hover:text-foreground">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {selectedCategories.map((category) => (
        <Badge key={category} variant="secondary" className="gap-1">
          {category}
          <button onClick={() => onRemoveCategory(category)} className="ml-1 hover:text-foreground">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  )
}
