'use client'

import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type FeatureDisabledProps = {
  featureName: string
  description?: string
  showUpgrade?: boolean
}

export function FeatureDisabled({
  featureName,
  description = 'This feature is currently not available.',
  showUpgrade = true,
}: FeatureDisabledProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Lock className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold">{featureName} Unavailable</h2>
      <p className="max-w-md text-muted-foreground">{description}</p>
      {showUpgrade && (
        <Button asChild variant="default" className="mt-2">
          <Link href="/dashboard/billing">Upgrade Plan</Link>
        </Button>
      )}
    </div>
  )
}
