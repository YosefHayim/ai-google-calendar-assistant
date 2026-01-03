'use client'

import { Activity, CalendarDays, Dumbbell } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { generateDateRange } from '@/lib/dateUtils'
import {
  getActivityLevelColor,
  getHealthActivityColor,
  type HealthActivity,
} from '@/lib/colorUtils'

const ToggleButton = ({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: any
  children?: React.ReactNode
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 p-1 px-3 rounded-md text-xs font-medium transition-all ${
      active
        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
        : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
    }`}
  >
    <Icon className="w-3.5 h-3.5" />
    {children}
  </button>
)

const ActivityHeatmap: React.FC = () => {
  const [view, setView] = useState<'activity' | 'health'>('activity')

  const data = useMemo(() => {
    const today = new Date()
    const days = generateDateRange(365)

    const healthActivities: HealthActivity[] = ['Gym', 'Run', 'Swim', 'Rest', 'Rest', 'Rest']
    return days.map((date) => ({
      date,
      activityLevel: date > today ? 0 : Math.floor(Math.random() * 20),
      healthType: (date > today ? 'Rest' : healthActivities[Math.floor(Math.random() * healthActivities.length)]) as HealthActivity,
    }))
  }, [])

  const startDay = data[0].date.getDay()
  const placeholders = Array.from({ length: startDay })

  const healthLegend = [
    { label: 'Gym', color: 'bg-emerald-500' },
    { label: 'Run', color: 'bg-sky-500' },
    { label: 'Swim', color: 'bg-indigo-500' },
    { label: 'Rest', color: 'bg-zinc-100 dark:bg-zinc-800/50' },
  ]

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm">
      <div className="p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h3 className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-zinc-400" />
            {view === 'activity' ? 'Full Year Activity' : 'Health & Fitness Tracker'}
          </h3>
          <p className="text-xs text-zinc-500">
            {view === 'activity'
              ? 'Your interaction frequency with Ally over the past year.'
              : 'Your tracked fitness activities over the past year.'}
          </p>
        </div>
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-md self-start sm:self-center">
          <ToggleButton active={view === 'activity'} onClick={() => setView('activity')} icon={Activity}>
            AI Activity
          </ToggleButton>
          <ToggleButton active={view === 'health'} onClick={() => setView('health')} icon={Dumbbell}>
            Health
          </ToggleButton>
        </div>
      </div>

      <div className="p-6 overflow-x-auto">
        <div className="inline-block">
          <div className="flex justify-between text-xs text-zinc-400 mb-2 pl-10">
            {monthLabels.map((month) => (
              <span key={month} className="w-[calc(4.3*4*0.25rem)] text-left">
                {month}
              </span>
            ))}
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col gap-1 text-xs text-zinc-400">
              {weekDays.map((day, i) => (
                <div key={day} className={`h-3.5 flex items-center ${i % 2 === 0 ? 'invisible' : ''}`}>
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-rows-7 grid-flow-col gap-1">
              {placeholders.map((_, i) => (
                <div key={`p-${i}`} className="w-3.5 h-3.5" />
              ))}
              {data.map((day, i) => (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 rounded-sm ${view === 'activity' ? getActivityLevelColor(day.activityLevel) : getHealthActivityColor(day.healthType)}`}
                  title={`${day.date.toDateString()}: ${view === 'activity' ? `${day.activityLevel} interactions` : day.healthType}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 pt-0 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-x-4 gap-y-1 text-xs text-zinc-500 flex-wrap">
        {view === 'activity' && <span className="mr-2">Less</span>}
        {view === 'activity' ? (
          <>
            <div className="w-3 h-3 rounded-sm bg-zinc-100 dark:bg-zinc-800/50" />
            <div className="w-3 h-3 rounded-sm bg-primary/20" />
            <div className="w-3 h-3 rounded-sm bg-primary/40" />
            <div className="w-3 h-3 rounded-sm bg-primary/70" />
            <div className="w-3 h-3 rounded-sm bg-primary" />
          </>
        ) : (
          healthLegend.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-sm ${item.color}`} />
              <span>{item.label}</span>
            </div>
          ))
        )}
        {view === 'activity' && <span>More</span>}
      </div>
    </div>
  )
}

export default ActivityHeatmap
