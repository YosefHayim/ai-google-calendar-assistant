'use client'

import { useTranslation } from 'react-i18next'
import { GapRecoveryPanel } from '@/components/dashboard/gaps/GapRecoveryPanel'

export default function GapsPage() {
  const { t } = useTranslation()

  return (
    <div className="flex-1 h-full overflow-auto">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{t('gaps.title')}</h1>
          <p className="text-zinc-500 dark:text-zinc-400">{t('gaps.description')}</p>
        </div>
        <GapRecoveryPanel />
      </div>
    </div>
  )
}
