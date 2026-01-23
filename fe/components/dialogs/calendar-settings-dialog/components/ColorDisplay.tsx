'use client'

import { InfoSection } from './InfoSection'
import React from 'react'

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
            <div className="h-8 w-8 rounded-md border" style={{ backgroundColor }} />
            <div>
              <p className="text-xs text-muted-foreground">Background</p>
              <p className="font-mono text-sm text-muted-foreground">{backgroundColor}</p>
            </div>
          </div>
        )}
        {foregroundColor && (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md border" style={{ backgroundColor: foregroundColor }} />
            <div>
              <p className="text-xs text-muted-foreground">Foreground</p>
              <p className="font-mono text-sm text-muted-foreground">{foregroundColor}</p>
            </div>
          </div>
        )}
        {colorId && (
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">Color ID</p>
            <p className="text-sm text-muted-foreground">{colorId}</p>
          </div>
        )}
      </div>
    </InfoSection>
  )
}
