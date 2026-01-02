'use client'

import React from 'react'
import type { InsightCardProps } from '@/types/analytics'

const colorClasses = {
  amber: { bg: 'bg-amber-100/50 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-500' },
  sky: { bg: 'bg-sky-100/50 dark:bg-sky-900/30', text: 'text-sky-600 dark:text-sky-500' },
  emerald: { bg: 'bg-emerald-100/50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-500' },
  rose: { bg: 'bg-rose-100/50 dark:bg-rose-900/30', text: 'text-rose-600 dark:text-rose-500' },
  indigo: { bg: 'bg-indigo-100/50 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-500' },
  orange: { bg: 'bg-orange-100/50 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-500' },
}

const InsightCard: React.FC<InsightCardProps> = ({ icon: Icon, title, value, description, color }) => {
  const selectedColor = colorClasses[color] || colorClasses.amber

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm p-6 flex flex-col gap-4 transition-all hover:shadow-md hover:-translate-y-1">
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
