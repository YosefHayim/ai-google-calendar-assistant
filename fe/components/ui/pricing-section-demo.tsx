'use client'

import React from 'react'
import { PricingSection } from '@/components/ui/pricing-section'
import { HandWrittenTitleDemo } from '@/components/ui/hand-writing-text-demo'
import { PAYMENT_FREQUENCIES, TIERS, transformLemonSqueezyProductsToTiers } from '@/lib/constants/plans'
import { useLemonSqueezyProducts } from '@/hooks/queries/billing'

export { PAYMENT_FREQUENCIES, TIERS }

export function PricingSectionDemo() {
  const { data: lsProducts, isLoading } = useLemonSqueezyProducts()

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
      <PricingSection title="" subtitle="" frequencies={PAYMENT_FREQUENCIES} tiers={tiers} />
    </div>
  )
}
