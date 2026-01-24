'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format, startOfDay, endOfDay, addDays } from 'date-fns'
import {
  Calendar,
  Clock,
  Sparkles,
  Zap,
  Plus,
  CalendarCheck,
  Repeat,
  Search,
  Bell,
  Send,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthContext } from '@/contexts/AuthContext'
import { useEvents } from '@/hooks/queries/events/useEvents'
import { useSubscriptionStatus } from '@/hooks/queries/billing'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
}

function StatCard({ label, value, icon: Icon, change, changeType = 'neutral' }: StatCardProps) {
  return (
    <Card className="flex flex-col gap-3 rounded-xl border border-border p-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="h-[18px] w-[18px] text-muted-foreground" />
      </div>
      <span className="text-4xl font-bold text-foreground">{value}</span>
      {change && (
        <span
          className={cn(
            'flex items-center gap-1 text-[13px]',
            changeType === 'positive' && 'text-green-600',
            changeType === 'negative' && 'text-red-600',
            changeType === 'neutral' && 'text-muted-foreground',
          )}
        >
          {changeType === 'positive' && <ArrowUpRight className="h-3 w-3" />}
          {changeType === 'negative' && <ArrowDownRight className="h-3 w-3" />}
          {change}
        </span>
      )}
    </Card>
  )
}

interface EventCardProps {
  startTime: string
  endTime: string
  title: string
  location?: string
  color: string
}

function EventCard({ startTime, endTime, title, location, color }: EventCardProps) {
  return (
    <Card className="flex items-center gap-4 rounded-[10px] border border-border p-4">
      <div className="flex w-[60px] flex-col items-center gap-0.5">
        <span className="text-base font-semibold text-foreground">{startTime}</span>
        <span className="text-xs text-muted-foreground">{endTime}</span>
      </div>
      <div className="h-10 w-[3px] rounded-sm" style={{ backgroundColor: color }} />
      <div className="flex flex-1 flex-col gap-1">
        <span className="text-[15px] font-medium text-foreground">{title}</span>
        {location && <span className="text-[13px] text-muted-foreground">{location}</span>}
      </div>
    </Card>
  )
}

interface QuickActionProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
}

function QuickActionButton({ icon: Icon, label, onClick }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-secondary/50"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
        <Icon className="h-[18px] w-[18px] text-foreground" />
      </div>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </button>
  )
}

function StatCardSkeleton() {
  return (
    <Card className="flex flex-col gap-3 rounded-xl border border-border p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-[18px] w-[18px] rounded" />
      </div>
      <Skeleton className="h-10 w-16" />
      <Skeleton className="h-4 w-32" />
    </Card>
  )
}

function EventCardSkeleton() {
  return (
    <Card className="flex items-center gap-4 rounded-[10px] border border-border p-4">
      <div className="flex w-[60px] flex-col items-center gap-0.5">
        <Skeleton className="h-5 w-10" />
        <Skeleton className="h-3 w-8" />
      </div>
      <Skeleton className="h-10 w-[3px] rounded-sm" />
      <div className="flex flex-1 flex-col gap-1">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
    </Card>
  )
}

export default function DashboardHomePage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const [aiPrompt, setAiPrompt] = React.useState('')

  const today = useMemo(() => new Date(), [])
  const todayStart = useMemo(() => startOfDay(today), [today])
  const todayEnd = useMemo(() => endOfDay(today), [today])
  const tomorrowEnd = useMemo(() => endOfDay(addDays(today, 1)), [today])

  const { data: events, isLoading: eventsLoading } = useEvents({
    params: {
      timeMin: todayStart.toISOString(),
      timeMax: tomorrowEnd.toISOString(),
      maxResults: 10,
    },
  })

  const { data: billingData, isLoading: billingLoading } = useSubscriptionStatus()

  const todayEvents = useMemo(() => {
    if (!events) return []
    const mappedEvents: Array<{
      id: string
      title: string
      startTime: string
      endTime: string
      location?: string
      color: string
    }> = []

    events.forEach((event, index) => {
      const startDateTime = event.start?.dateTime
      const endDateTime = event.end?.dateTime
      if (startDateTime && endDateTime) {
        const startDate = new Date(startDateTime)
        if (startDate >= todayStart && startDate <= todayEnd) {
          mappedEvents.push({
            id: event.id,
            title: event.summary || 'No Title',
            startTime: format(new Date(startDateTime), 'H:mm'),
            endTime: format(new Date(endDateTime), 'H:mm'),
            location: event.location,
            color: getEventColor(index),
          })
        }
      }
    })

    return mappedEvents.sort((a, b) => a.startTime.localeCompare(b.startTime)).slice(0, 3)
  }, [events, todayStart, todayEnd])

  const totalHoursScheduled = useMemo(() => {
    if (!events) return 0
    let totalMinutes = 0
    events.forEach((event) => {
      const startDateTime = event.start?.dateTime
      const endDateTime = event.end?.dateTime
      if (startDateTime && endDateTime) {
        const startDate = new Date(startDateTime)
        if (startDate >= todayStart && startDate <= todayEnd) {
          const start = new Date(startDateTime)
          const end = new Date(endDateTime)
          totalMinutes += (end.getTime() - start.getTime()) / (1000 * 60)
        }
      }
    })
    return Math.round((totalMinutes / 60) * 10) / 10
  }, [events, todayStart, todayEnd])

  // Handle both User (with user_metadata) and CustomUser (with first_name/display_name)
  const firstName = (() => {
    if (!user) return 'there'
    if ('first_name' in user && user.first_name) return user.first_name
    if ('display_name' in user && user.display_name) return user.display_name.split(' ')[0]
    if ('user_metadata' in user && user.user_metadata?.first_name) return user.user_metadata.first_name
    return user.email?.split('@')[0] || 'there'
  })()
  const greeting = getGreeting()

  const aiRequestsUsed = billingData?.interactions_used || 0
  const aiRequestsRemaining = billingData?.interactions_remaining || 0

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (aiPrompt.trim()) {
      router.push(`/dashboard?prompt=${encodeURIComponent(aiPrompt)}`)
    }
  }

  const handleQuickAction = (action: string) => {
    router.push(`/dashboard?prompt=${encodeURIComponent(action)}`)
  }

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-[28px] font-bold text-foreground">
              {greeting}, {firstName}
            </h1>
            <p className="text-[15px] text-muted-foreground">
              Here&apos;s what&apos;s happening with your calendar today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search..." className="h-10 w-60 rounded-lg border-border bg-background pl-10" />
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-lg">
              <Bell className="h-[18px] w-[18px] text-muted-foreground" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {eventsLoading || billingLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                label="Meetings Today"
                value={todayEvents.length}
                icon={Calendar}
                change={todayEvents.length > 0 ? `${todayEvents.length} scheduled` : 'No meetings'}
                changeType={todayEvents.length > 3 ? 'negative' : 'positive'}
              />
              <StatCard
                label="Hours Scheduled"
                value={`${totalHoursScheduled}h`}
                icon={Clock}
                change={`${Math.max(0, 8 - totalHoursScheduled).toFixed(1)}h free time remaining`}
                changeType="neutral"
              />
              <StatCard
                label="AI Requests"
                value={aiRequestsUsed}
                icon={Sparkles}
                change={aiRequestsRemaining !== null ? `${aiRequestsRemaining} remaining this month` : 'Unlimited'}
                changeType="neutral"
              />
              <StatCard
                label="Time Saved"
                value="3.2h"
                icon={Zap}
                change="+45min from last week"
                changeType="positive"
              />
            </>
          )}
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Upcoming Events</h2>
              <Link href="/dashboard/calendar" className="text-sm text-muted-foreground hover:text-foreground">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {eventsLoading ? (
                <>
                  <EventCardSkeleton />
                  <EventCardSkeleton />
                  <EventCardSkeleton />
                </>
              ) : todayEvents.length > 0 ? (
                todayEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    startTime={event.startTime}
                    endTime={event.endTime}
                    title={event.title}
                    location={event.location}
                    color={event.color}
                  />
                ))
              ) : (
                <Card className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border p-8 text-center">
                  <Calendar className="h-10 w-10 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">No events today</p>
                    <p className="text-sm text-muted-foreground">Your calendar is free!</p>
                  </div>
                </Card>
              )}
            </div>
          </div>

          <div className="w-full space-y-5 lg:w-[360px]">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
              <div className="space-y-2.5">
                <QuickActionButton
                  icon={Plus}
                  label="Schedule a meeting"
                  onClick={() => handleQuickAction('Schedule a meeting')}
                />
                <QuickActionButton
                  icon={CalendarCheck}
                  label="Check availability"
                  onClick={() => handleQuickAction('Check my availability for this week')}
                />
                <QuickActionButton
                  icon={Repeat}
                  label="Reschedule event"
                  onClick={() => handleQuickAction('Help me reschedule an event')}
                />
              </div>
            </div>

            <Card className="flex h-[220px] flex-col gap-4 rounded-xl bg-primary p-5">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
                <span className="text-base font-semibold text-primary-foreground">Ask Ally</span>
              </div>
              <p className="text-sm leading-relaxed text-primary-foreground/70">
                Type a message to schedule meetings, check your calendar, or manage your time.
              </p>
              <form onSubmit={handleAiSubmit} className="mt-auto">
                <div className="flex h-12 items-center gap-3 rounded-lg bg-white/[0.08] px-4">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Schedule a meeting with..."
                    className="flex-1 bg-transparent text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none"
                  />
                  <button type="submit" className="text-primary-foreground/80 hover:text-primary-foreground">
                    <Send className="h-[18px] w-[18px]" />
                  </button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function getEventColor(index: number): string {
  const colors = ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']
  return colors[index % colors.length]
}
