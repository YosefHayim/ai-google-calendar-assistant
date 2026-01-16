'use client'

import React from 'react'
import { PricingSection } from '@/components/ui/pricing-section'
import { HandWrittenTitleDemo } from '@/components/ui/hand-writing-text-demo'
import { PAYMENT_FREQUENCIES, TIERS, transformLemonSqueezyProductsToTiers } from '@/lib/constants/plans'
import { useLemonSqueezyProducts } from '@/hooks/queries/billing'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'

export { PAYMENT_FREQUENCIES, TIERS }

function PricingSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm"
          >
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-4 w-full mb-6" />
            <Skeleton className="h-10 w-32 mb-6" />
            <Skeleton className="h-10 w-full mb-6 rounded-md" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PricingError() {
  return (
    <div className="w-full max-w-md mx-auto text-center py-12">
      <div className="flex justify-center mb-4">
        <AlertCircle className="h-12 w-12 text-amber-500" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Unable to load pricing</h3>
      <p className="text-zinc-600 dark:text-zinc-400 mb-4">
        We couldn&apos;t fetch the latest pricing information. Showing default plans below.
      </p>
    </div>
  )
}

export function PricingSectionDemo() {
  const { data: lsProducts, isLoading, isError } = useLemonSqueezyProducts()

  const tiers = React.useMemo(() => {
    if (!lsProducts || lsProducts.length === 0) {
      return TIERS
    }
    return transformLemonSqueezyProductsToTiers(lsProducts)
  }, [lsProducts])

  return (
    <div className="relative flex flex-col justify-center items-center w-full min-h-[600px]">
      <div className="absolute inset-0 -z-10">
        <div className="h-full w-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:35px_35px] opacity-30 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>
      <HandWrittenTitleDemo />
      {isLoading ? (
        <PricingSkeleton />
      ) : (
        <>
          {isError && <PricingError />}
          <PricingSection title="" subtitle="" frequencies={PAYMENT_FREQUENCIES} tiers={tiers} />
        </>
      )}
    </div>
  )
}
