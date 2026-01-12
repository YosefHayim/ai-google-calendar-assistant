'use client'

import type { InsightCardProps } from '@/types/analytics'
import React from 'react'
import { getInsightColorClasses } from '@/lib/colorUtils'

const InsightCard: React.FC<InsightCardProps> = ({ icon: Icon, title, value, description, color }) => {
  const selectedColor = getInsightColorClasses(color)

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 transition-all hover:shadow-md hover:-translate-y-1">
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 flex items-center justify-center rounded-md shrink-0 ${selectedColor.bg} ${selectedColor.text}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-zinc-600 dark:text-zinc-400 text-sm">{title}</h3>
      </div>
      <div>
        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
        <p className="text-sm text-zinc-500 leading-relaxed font-medium">{description}</p>
      </div>
    </div>
  )
}

export default InsightCard
