'use client'

import { Suspense } from 'react'
import GapsDashboard from '@/components/dashboard/gaps/GapsDashboard'
import { LoadingSection } from '@/components/ui/loading-spinner'

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