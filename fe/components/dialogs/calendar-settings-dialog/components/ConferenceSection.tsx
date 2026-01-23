'use client'

import React from 'react'
import { Video } from 'lucide-react'
import { InfoSection } from './InfoSection'

interface ConferenceSectionProps {
  allowedTypes: string[]
}

export function ConferenceSection({ allowedTypes }: ConferenceSectionProps) {
  if (!allowedTypes || allowedTypes.length === 0) return null

  return (
    <InfoSection
      title="Conference Properties"
      tooltipTitle="Allowed Conference Solutions"
      tooltipDescription="Types of video conferencing solutions that can be added to events in this calendar."
      icon={<Video className="h-4 w-4 text-muted-foreground" />}
    >
      <div className="space-y-1">
        {allowedTypes.map((type, index) => (
          <div key={index} className="text-sm capitalize text-muted-foreground">
            {type.replace(/([A-Z])/g, ' $1').trim()}
          </div>
        ))}
      </div>
    </InfoSection>
  )
}
