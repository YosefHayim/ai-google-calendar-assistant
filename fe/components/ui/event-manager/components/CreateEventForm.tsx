'use client'

import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Event, ColorDefinition } from '../types'

interface CreateEventFormProps {
  newEvent: Partial<Event>
  onNewEventChange: (event: Partial<Event>) => void
  onCreateEvent: () => void
  onCancel: () => void
  categories: string[]
  colors: ColorDefinition[]
  availableTags: string[]
  toggleTag: (tag: string) => void
}

export function CreateEventForm({
  newEvent,
  onNewEventChange,
  onCreateEvent,
  onCancel,
  categories,
  colors,
  availableTags,
  toggleTag,
}: CreateEventFormProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Create Event</DialogTitle>
        <DialogDescription>Add a new event to your calendar</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={newEvent.title}
            onChange={(e) => onNewEventChange({ ...newEvent, title: e.target.value })}
            placeholder="Event title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={newEvent.description}
            onChange={(e) => onNewEventChange({ ...newEvent, description: e.target.value })}
            placeholder="Event description"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="datetime-local"
              value={
                newEvent.startTime
                  ? new Date(newEvent.startTime.getTime() - newEvent.startTime.getTimezoneOffset() * 60000)
                      .toISOString()
                      .slice(0, 16)
                  : ''
              }
              onChange={(e) => {
                const date = new Date(e.target.value)
                if (!isNaN(date.getTime())) {
                  onNewEventChange({ ...newEvent, startTime: date })
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              type="datetime-local"
              value={
                newEvent.endTime
                  ? new Date(newEvent.endTime.getTime() - newEvent.endTime.getTimezoneOffset() * 60000)
                      .toISOString()
                      .slice(0, 16)
                  : ''
              }
              onChange={(e) => {
                const date = new Date(e.target.value)
                if (!isNaN(date.getTime())) {
                  onNewEventChange({ ...newEvent, endTime: date })
                }
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={newEvent.category}
              onValueChange={(value) => onNewEventChange({ ...newEvent, category: value })}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Select value={newEvent.color} onValueChange={(value) => onNewEventChange({ ...newEvent, color: value })}>
              <SelectTrigger id="color">
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                {colors.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div className={cn('h-4 w-4 rounded', color.bg)} />
                      {color.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const isSelected = newEvent.tags?.includes(tag)
              return (
                <Badge
                  key={tag}
                  variant={isSelected ? 'default' : 'outline'}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              )
            })}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onCreateEvent}>Create</Button>
      </DialogFooter>
    </>
  )
}
