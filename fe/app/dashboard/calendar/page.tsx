'use client'

import { Suspense, useState } from 'react'
import { EventManager, type Event } from '@/components/ui/event-manager'
import AIAllySidebar from '@/components/dashboard/shared/AIAllySidebar'
import { LoadingSection } from '@/components/ui/loading-spinner'

const demoEvents: Event[] = [
  {
    id: '1',
    title: 'Team Standup',
    description: 'Daily sync with the engineering team to discuss progress and blockers',
    startTime: new Date(new Date().setHours(9, 0, 0, 0)),
    endTime: new Date(new Date().setHours(9, 30, 0, 0)),
    color: 'blue',
    category: 'Meeting',
    attendees: ['Alice', 'Bob', 'Charlie'],
    tags: ['Work', 'Team'],
  },
  {
    id: '2',
    title: 'Product Design Review',
    description: 'Review new mockups for the dashboard redesign with stakeholders',
    startTime: new Date(new Date().setHours(14, 0, 0, 0)),
    endTime: new Date(new Date().setHours(15, 30, 0, 0)),
    color: 'purple',
    category: 'Meeting',
    attendees: ['Sarah', 'Mike'],
    tags: ['Important', 'Client'],
  },
  {
    id: '3',
    title: 'Code Review',
    description: 'Review pull requests for the authentication feature',
    startTime: new Date(new Date().setDate(new Date().getDate() + 1)),
    endTime: new Date(new Date().setDate(new Date().getDate() + 1)),
    color: 'green',
    category: 'Task',
    tags: ['Work', 'Urgent'],
  },
  {
    id: '4',
    title: 'Client Presentation',
    description: 'Present Q4 roadmap and feature updates to key stakeholders',
    startTime: new Date(new Date().setDate(new Date().getDate() + 2)),
    endTime: new Date(new Date().setDate(new Date().getDate() + 2)),
    color: 'orange',
    category: 'Meeting',
    attendees: ['John', 'Emma', 'David'],
    tags: ['Important', 'Client'],
  },
  {
    id: '5',
    title: 'Deep Work Session',
    description: 'Focused time for complex feature development',
    startTime: new Date(new Date().setHours(10, 0, 0, 0)),
    endTime: new Date(new Date().setHours(12, 0, 0, 0)),
    color: 'pink',
    category: 'Personal',
    tags: ['Personal'],
  },
]

function CalendarContent() {
  const [isAllySidebarOpen, setIsAllySidebarOpen] = useState(false)
  const [events, setEvents] = useState<Event[]>(demoEvents)

  const handleEventCreate = (event: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...event,
      id: Math.random().toString(36).substr(2, 9),
    }
    setEvents((prev) => [...prev, newEvent])
  }

  const handleEventUpdate = (id: string, updatedEvent: Partial<Event>) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updatedEvent } : e)))
  }

  const handleEventDelete = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <EventManager
          events={events}
          onEventCreate={handleEventCreate}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
          categories={['Meeting', 'Task', 'Reminder', 'Personal']}
          availableTags={['Important', 'Urgent', 'Work', 'Personal', 'Team', 'Client']}
          defaultView="month"
        />
      </div>
      <AIAllySidebar
        isOpen={isAllySidebarOpen}
        onClose={() => setIsAllySidebarOpen(false)}
        onOpen={() => setIsAllySidebarOpen(true)}
      />
    </div>
  )
}

export default function CalendarPage() {
  return (
    <Suspense fallback={<LoadingSection text="Loading calendar..." />}>
      <CalendarContent />
    </Suspense>
  )
}
