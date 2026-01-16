export interface Event {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  color: string
  hexColor?: string
  category?: string
  attendees?: string[]
  tags?: string[]
  calendarId?: string
}

export type ViewType = 'month' | 'week' | 'day' | 'list' | 'year'

export interface ColorDefinition {
  name: string
  value: string
  bg: string
  text: string
  hex?: string
}

export interface EventManagerProps {
  events?: Event[]
  onEventCreate?: (event: Omit<Event, 'id'>) => void
  onEventUpdate?: (id: string, event: Partial<Event>) => void
  onEventDelete?: (id: string) => void
  onNewEventClick?: () => void
  categories?: string[]
  colors?: ColorDefinition[]
  defaultView?: ViewType
  className?: string
  availableTags?: string[]
}

export interface AvailableFilters {
  colors: ColorDefinition[]
  tags: string[]
  categories: string[]
}

export interface ActionResult {
  type: 'updated' | 'deleted' | 'none'
  message: string
}

export const defaultColors: ColorDefinition[] = [
  { name: 'Blue', value: 'blue', bg: 'bg-blue-500', text: 'text-blue-700' },
  { name: 'Green', value: 'green', bg: 'bg-green-500', text: 'text-green-700' },
  { name: 'Purple', value: 'purple', bg: 'bg-purple-500', text: 'text-purple-700' },
  { name: 'Orange', value: 'orange', bg: 'bg-orange-500', text: 'text-orange-700' },
  { name: 'Pink', value: 'pink', bg: 'bg-pink-500', text: 'text-pink-700' },
  { name: 'Red', value: 'red', bg: 'bg-red-500', text: 'text-red-700' },
]

export const defaultCategories = ['Meeting', 'Task', 'Reminder', 'Personal']

export const defaultTags = ['Important', 'Urgent', 'Work', 'Personal', 'Team', 'Client']
