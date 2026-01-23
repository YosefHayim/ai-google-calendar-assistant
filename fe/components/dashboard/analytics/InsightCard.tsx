'use client'

import type { InsightCardProps } from '@/types/analytics'
import React from 'react'
import { getInsightColorClasses } from '@/lib/colorUtils'

const InsightCard: React.FC<InsightCardProps> = ({ icon: Icon, title, value, description, color }) => {
  const selectedColor = getInsightColorClasses(color)

  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-md bg-background bg-secondary p-3 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md sm:gap-3 sm:p-4 md:gap-4 md:p-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md sm:h-8 sm:w-8 ${selectedColor.bg} ${selectedColor.text}`}
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <h3 className="line-clamp-2 min-w-0 text-xs font-semibold text-muted-foreground sm:text-sm">{title}</h3>
      </div>
      <div>
        <p className="text-xl font-bold text-foreground sm:text-2xl">{value}</p>
        <p className="line-clamp-2 text-xs font-medium leading-relaxed text-muted-foreground sm:text-sm">
          {description}
        </p>
      </div>
    </div>
  )
}

export default InsightCard
