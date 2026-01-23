'use client'

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { calculatePercentage, formatHours } from '@/lib/formatUtils'

import { Button } from '@/components/ui/button'
import { Info } from 'lucide-react'
import React from 'react'
import type { TimeAllocationChartProps } from '@/types/analytics'
import { getValidHexColor } from '@/lib/colorUtils'
import { motion } from 'framer-motion'
import { sumBy } from '@/lib/dataUtils'

const TimeAllocationChart: React.FC<TimeAllocationChartProps> = ({ data, onCalendarClick }) => {
  const totalHours = sumBy(data, 'hours')
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const strokeWidth = 22
  let accumulatedPercentage = 0

  if (totalHours === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-md bg-background bg-secondary p-6 shadow-sm">
        <p className="text-muted-foreground">No time allocation data available.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2 rounded-md bg-background bg-secondary p-6 shadow-sm xl:flex-row">
      <div className="relative h-44 w-44 flex-shrink-0">
        <svg className="h-full w-full" viewBox="0 0 180 180">
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-primary-foreground"
          />
          {data.map((item, index) => {
            const percentage = item.hours / totalHours
            const dashArray = percentage * circumference
            const rotation = accumulatedPercentage * 360
            accumulatedPercentage += percentage
            const safeColor = getValidHexColor(item.color)

            return (
              <motion.circle
                key={item.category}
                cx="90"
                cy="90"
                r={radius}
                fill="transparent"
                stroke={safeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="butt"
                strokeDasharray={circumference}
                style={{ transform: `rotate(${rotation - 90}deg)`, transformOrigin: 'center' }}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - dashArray }}
                transition={{ duration: 1, delay: index * 0.15, ease: 'easeOut' }}
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-foreground">{formatHours(totalHours)}</span>
          <span className="text-xs font-medium text-muted-foreground">Tracked</span>
        </div>
      </div>
      <div className="w-full">
        <h3 className="mb-4 flex items-center gap-2 font-medium text-foreground">
          Time Allocation
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                <Info size={16} />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Time Allocation</h4>
                <p className="text-xs text-muted-foreground">
                  Visual breakdown of how your time is distributed across different calendars. Each segment represents
                  the total hours spent in that calendar during the selected date range.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </h3>
        <ul className="space-y-2">
          {data.map((item) => {
            const safeColor = getValidHexColor(item.color)
            return (
              <li
                key={item.category}
                className={`-m-2 flex items-center gap-3 rounded-md border-transparent p-2 text-sm transition-colors hover:border hover:border-black ${
                  onCalendarClick && item.calendarId ? 'cursor-pointer hover:bg-secondary/50' : ''
                }`}
                data-calendar-id={item.calendarId || ''}
                style={{ backgroundColor: `${safeColor}10` }}
                onClick={() => {
                  if (onCalendarClick && item.calendarId) {
                    onCalendarClick(item.calendarId, item.category, safeColor)
                  }
                }}
              >
                <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: safeColor }} />
                <span className="flex-1 truncate font-medium text-foreground">{item.category}</span>
                <span className="font-mono text-muted-foreground">{formatHours(item.hours)}</span>
                <span className="w-10 text-right text-xs text-muted-foreground">
                  {calculatePercentage(item.hours, totalHours, 0)}%
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export default TimeAllocationChart
