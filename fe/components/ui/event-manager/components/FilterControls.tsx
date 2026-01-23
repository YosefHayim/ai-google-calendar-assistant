'use client'

import { CategoryFilterDropdown, ColorFilterDropdown, TagFilterDropdown } from './FilterDropdowns'
import { Search, X } from 'lucide-react'

import type { AvailableFilters } from '../types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface FilterControlsProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedColors: string[]
  onColorsChange: (colors: string[]) => void
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  selectedCategories: string[]
  onCategoriesChange: (categories: string[]) => void
  availableFilters: AvailableFilters
  hasActiveFilters: boolean
  onClearFilters: () => void
}

export function FilterControls({
  searchQuery,
  onSearchChange,
  selectedColors,
  onColorsChange,
  selectedTags,
  onTagsChange,
  selectedCategories,
  onCategoriesChange,
  availableFilters,
  hasActiveFilters,
  onClearFilters,
}: FilterControlsProps) {
  const handleColorToggle = (colorValue: string, checked: boolean) => {
    onColorsChange(checked ? [...selectedColors, colorValue] : selectedColors.filter((c) => c !== colorValue))
  }

  const handleTagToggle = (tag: string, checked: boolean) => {
    onTagsChange(checked ? [...selectedTags, tag] : selectedTags.filter((t) => t !== tag))
  }

  const handleCategoryToggle = (category: string, checked: boolean) => {
    onCategoriesChange(checked ? [...selectedCategories, category] : selectedCategories.filter((c) => c !== category))
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
            onClick={() => onSearchChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <MobileFilters
        availableFilters={availableFilters}
        selectedColors={selectedColors}
        selectedTags={selectedTags}
        selectedCategories={selectedCategories}
        onColorToggle={handleColorToggle}
        onTagToggle={handleTagToggle}
        onCategoryToggle={handleCategoryToggle}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
      />

      <DesktopFilters
        availableFilters={availableFilters}
        selectedColors={selectedColors}
        selectedTags={selectedTags}
        selectedCategories={selectedCategories}
        onColorToggle={handleColorToggle}
        onTagToggle={handleTagToggle}
        onCategoryToggle={handleCategoryToggle}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
      />
    </div>
  )
}

interface FilterSectionProps {
  availableFilters: AvailableFilters
  selectedColors: string[]
  selectedTags: string[]
  selectedCategories: string[]
  onColorToggle: (color: string, checked: boolean) => void
  onTagToggle: (tag: string, checked: boolean) => void
  onCategoryToggle: (category: string, checked: boolean) => void
  hasActiveFilters: boolean
  onClearFilters: () => void
}

function MobileFilters({
  availableFilters,
  selectedColors,
  selectedTags,
  selectedCategories,
  onColorToggle,
  onTagToggle,
  onCategoryToggle,
  hasActiveFilters,
  onClearFilters,
}: FilterSectionProps) {
  return (
    <div className="-mx-4 px-4 sm:hidden">
      <div className="scrollbar-hide flex flex-wrap gap-2 overflow-x-auto pb-2">
        {availableFilters.colors.length > 0 && (
          <ColorFilterDropdown
            colors={availableFilters.colors}
            selectedColors={selectedColors}
            onColorToggle={onColorToggle}
            align="start"
            mobile
          />
        )}
        {availableFilters.tags.length > 0 && (
          <TagFilterDropdown
            tags={availableFilters.tags}
            selectedTags={selectedTags}
            onTagToggle={onTagToggle}
            align="start"
            mobile
          />
        )}
        {availableFilters.categories.length > 0 && (
          <CategoryFilterDropdown
            categories={availableFilters.categories}
            selectedCategories={selectedCategories}
            onCategoryToggle={onCategoryToggle}
            align="start"
            mobile
          />
        )}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="flex-shrink-0 gap-2 whitespace-nowrap">
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  )
}

function DesktopFilters({
  availableFilters,
  selectedColors,
  selectedTags,
  selectedCategories,
  onColorToggle,
  onTagToggle,
  onCategoryToggle,
  hasActiveFilters,
  onClearFilters,
}: FilterSectionProps) {
  return (
    <div className="hidden items-center gap-2 sm:flex">
      {availableFilters.colors.length > 0 && (
        <ColorFilterDropdown
          colors={availableFilters.colors}
          selectedColors={selectedColors}
          onColorToggle={onColorToggle}
          align="end"
        />
      )}
      {availableFilters.tags.length > 0 && (
        <TagFilterDropdown
          tags={availableFilters.tags}
          selectedTags={selectedTags}
          onTagToggle={onTagToggle}
          align="end"
        />
      )}
      {availableFilters.categories.length > 0 && (
        <CategoryFilterDropdown
          categories={availableFilters.categories}
          selectedCategories={selectedCategories}
          onCategoryToggle={onCategoryToggle}
          align="end"
        />
      )}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters} className="gap-2">
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  )
}
