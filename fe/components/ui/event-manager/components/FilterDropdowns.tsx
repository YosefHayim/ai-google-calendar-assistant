'use client'

import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { ColorDefinition } from '../types'

interface ColorFilterDropdownProps {
  colors: ColorDefinition[]
  selectedColors: string[]
  onColorToggle: (color: string, checked: boolean) => void
  align: 'start' | 'end'
  mobile?: boolean
}

export function ColorFilterDropdown({
  colors,
  selectedColors,
  onColorToggle,
  align,
  mobile,
}: ColorFilterDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('gap-2 bg-transparent', mobile && 'whitespace-nowrap flex-shrink-0')}
        >
          <Filter className="h-4 w-4" />
          Colors
          {selectedColors.length > 0 && (
            <Badge variant="secondary" className={cn('ml-1 h-5', mobile ? 'px-1.5' : 'px-1')}>
              {selectedColors.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48">
        <DropdownMenuLabel>Filter by Color</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {colors.map((color) => (
          <DropdownMenuCheckboxItem
            key={color.value}
            checked={selectedColors.includes(color.value)}
            onCheckedChange={(checked) => onColorToggle(color.value, checked)}
          >
            <div className="flex items-center gap-2">
              <div
                className={cn('h-3 w-3 rounded', !color.hex && color.bg)}
                style={color.hex ? { backgroundColor: color.hex } : undefined}
              />
              {color.hex ? 'Calendar' : color.name}
            </div>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface TagFilterDropdownProps {
  tags: string[]
  selectedTags: string[]
  onTagToggle: (tag: string, checked: boolean) => void
  align: 'start' | 'end'
  mobile?: boolean
}

export function TagFilterDropdown({ tags, selectedTags, onTagToggle, align, mobile }: TagFilterDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('gap-2 bg-transparent', mobile && 'whitespace-nowrap flex-shrink-0')}
        >
          <Filter className="h-4 w-4" />
          Tags
          {selectedTags.length > 0 && (
            <Badge variant="secondary" className={cn('ml-1 h-5', mobile ? 'px-1.5' : 'px-1')}>
              {selectedTags.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48">
        <DropdownMenuLabel>Filter by Tag</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {tags.map((tag) => (
          <DropdownMenuCheckboxItem
            key={tag}
            checked={selectedTags.includes(tag)}
            onCheckedChange={(checked) => onTagToggle(tag, checked)}
          >
            {tag}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface CategoryFilterDropdownProps {
  categories: string[]
  selectedCategories: string[]
  onCategoryToggle: (category: string, checked: boolean) => void
  align: 'start' | 'end'
  mobile?: boolean
}

export function CategoryFilterDropdown({
  categories,
  selectedCategories,
  onCategoryToggle,
  align,
  mobile,
}: CategoryFilterDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('gap-2 bg-transparent', mobile && 'whitespace-nowrap flex-shrink-0')}
        >
          <Filter className="h-4 w-4" />
          Categories
          {selectedCategories.length > 0 && (
            <Badge variant="secondary" className={cn('ml-1 h-5', mobile ? 'px-1.5' : 'px-1')}>
              {selectedCategories.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48">
        <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {categories.map((category) => (
          <DropdownMenuCheckboxItem
            key={category}
            checked={selectedCategories.includes(category)}
            onCheckedChange={(checked) => onCategoryToggle(category, checked)}
          >
            {category}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
