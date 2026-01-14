'use client'

import * as React from 'react'
import { Info } from 'lucide-react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { cn } from '@/lib/utils'

interface InfoTooltipProps {
  /** Title displayed in bold at the top of the tooltip */
  title?: string
  /** Main content/description of the tooltip */
  children: React.ReactNode
  /** Side of the trigger to display the tooltip */
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** Alignment of the tooltip relative to the trigger */
  align?: 'start' | 'center' | 'end'
  /** Custom width for the tooltip content */
  width?: string
  /** Custom icon to use instead of Info icon */
  icon?: React.ReactNode
  /** Additional className for the trigger icon */
  iconClassName?: string
  /** Additional className for the content container */
  contentClassName?: string
}

/**
 * InfoTooltip - A reusable hover card component for displaying contextual information.
 *
 * @example
 * // Basic usage
 * <InfoTooltip title="Calendar ID">
 *   A unique ID assigned by Google Calendar to identify this calendar.
 * </InfoTooltip>
 *
 * @example
 * // With custom positioning
 * <InfoTooltip title="Help" side="right" align="start">
 *   Additional information here.
 * </InfoTooltip>
 */
export function InfoTooltip({
  title,
  children,
  side = 'top',
  align = 'center',
  width = 'w-64',
  icon,
  iconClassName,
  contentClassName,
}: InfoTooltipProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span
          className={cn(
            'inline-flex cursor-help text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors',
            iconClassName,
          )}
        >
          {icon || <Info className="w-3.5 h-3.5" />}
        </span>
      </HoverCardTrigger>
      <HoverCardContent side={side} align={align} className={cn(width, 'text-xs', contentClassName)}>
        {title && <p className="font-medium mb-1">{title}</p>}
        <div className="text-zinc-500 dark:text-zinc-400">{children}</div>
      </HoverCardContent>
    </HoverCard>
  )
}
