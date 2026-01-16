'use client'

import { useState, useMemo, useCallback } from 'react'
import type { Event, ColorDefinition, AvailableFilters } from '../types'

interface UseEventFiltersProps {
  events: Event[]
  colors: ColorDefinition[]
}

interface UseEventFiltersReturn {
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedColors: string[]
  setSelectedColors: React.Dispatch<React.SetStateAction<string[]>>
  selectedTags: string[]
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>
  selectedCategories: string[]
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>
  filteredEvents: Event[]
  availableFilters: AvailableFilters
  hasActiveFilters: boolean
  clearFilters: () => void
}

export function useEventFilters({ events, colors }: UseEventFiltersProps): UseEventFiltersReturn {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const availableFilters = useMemo(() => {
    const colorsSet = new Set<string>()
    const hexColorsMap = new Map<string, string>()
    const tagsSet = new Set<string>()
    const categoriesSet = new Set<string>()

    events.forEach((event) => {
      if (event.hexColor) {
        hexColorsMap.set(event.hexColor, event.hexColor)
      } else if (event.color) {
        colorsSet.add(event.color)
      }
      event.tags?.forEach((tag) => tagsSet.add(tag))
      if (event.category) categoriesSet.add(event.category)
    })

    const eventColors: ColorDefinition[] = []

    hexColorsMap.forEach((hex) => {
      eventColors.push({ name: hex, value: hex, bg: '', text: '', hex })
    })

    colorsSet.forEach((colorValue) => {
      const colorDef = colors.find((c) => c.value === colorValue)
      if (colorDef) eventColors.push(colorDef)
    })

    return {
      colors: eventColors,
      tags: Array.from(tagsSet),
      categories: Array.from(categoriesSet),
    }
  }, [events, colors])

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          event.title.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.category?.toLowerCase().includes(query) ||
          event.tags?.some((tag) => tag.toLowerCase().includes(query))

        if (!matchesSearch) return false
      }

      if (selectedColors.length > 0) {
        const eventColorValue = event.hexColor || event.color
        if (!selectedColors.includes(eventColorValue)) return false
      }

      if (selectedTags.length > 0) {
        const hasMatchingTag = event.tags?.some((tag) => selectedTags.includes(tag))
        if (!hasMatchingTag) return false
      }

      if (selectedCategories.length > 0 && event.category && !selectedCategories.includes(event.category)) {
        return false
      }

      return true
    })
  }, [events, searchQuery, selectedColors, selectedTags, selectedCategories])

  const hasActiveFilters = selectedColors.length > 0 || selectedTags.length > 0 || selectedCategories.length > 0

  const clearFilters = useCallback(() => {
    setSelectedColors([])
    setSelectedTags([])
    setSelectedCategories([])
    setSearchQuery('')
  }, [])

  return {
    searchQuery,
    setSearchQuery,
    selectedColors,
    setSelectedColors,
    selectedTags,
    setSelectedTags,
    selectedCategories,
    setSelectedCategories,
    filteredEvents,
    availableFilters,
    hasActiveFilters,
    clearFilters,
  }
}
