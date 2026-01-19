'use client'

import GapsDashboard from '@/components/dashboard/gaps/GapsDashboard'
import { LoadingSection } from '@/components/ui/loading-spinner'
import { Suspense } from 'react'

function GapsContent() {
  return <GapsDashboard />
}

export default function GapsPage() {
  return (
    <Suspense fallback={<LoadingSection text="Loading gaps analysis..." />}>
      <GapsContent />
    </Suspense>
  )
}
