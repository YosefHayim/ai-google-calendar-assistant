'use client'

import React from 'react'
import { InfoSection } from './InfoSection'

interface ColorDisplayProps {
  backgroundColor?: string
  foregroundColor?: string
  colorId?: string
}

export function ColorDisplay({ backgroundColor, foregroundColor, colorId }: ColorDisplayProps) {
  return (
    <InfoSection
      title="Color"
      tooltipTitle="Display Color"
      tooltipDescription="The color used to display this calendar and its events in the UI. Helps distinguish between multiple calendars."
    >
      <div className="space-y-2">
        {backgroundColor && (
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-md border border-zinc-200 dark:border-zinc-800"
              style={{ backgroundColor }}
            />
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Background</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 font-mono">{backgroundColor}</p>
            </div>
          </div>
        )}
        {foregroundColor && (
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-md border border-zinc-200 dark:border-zinc-800"
              style={{ backgroundColor: foregroundColor }}
            />
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Foreground</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 font-mono">{foregroundColor}</p>
            </div>
          </div>
        )}
        {colorId && (
          <div className="flex items-center gap-2">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Color ID</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{colorId}</p>
          </div>
        )}
      </div>
    </InfoSection>
  )
}
