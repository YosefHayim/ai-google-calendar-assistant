'use client'

import { PAYMENT_FREQUENCIES } from '@/lib/constants/plans'
import { usePlans, useSubscriptionStatus } from '@/hooks/queries/billing'

import { AlertCircle } from 'lucide-react'
import { HandWrittenTitleDemo } from '@/components/ui/hand-writing-text-demo'
import type { Plan } from '@/services/payment-service'
import { PricingSection } from '@/components/ui/pricing-section'
import type { PricingTier } from '@/lib/constants/plans'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthContext } from '@/contexts/AuthContext'
import { useTranslation } from 'react-i18next'

export { PAYMENT_FREQUENCIES }

function PricingSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border-border bg-background bg-secondary p-6 shadow-sm">
            <Skeleton className="mb-2 h-6 w-24" />
            <Skeleton className="mb-6 h-4 w-full" />
            <Skeleton className="mb-6 h-10 w-32" />
            <Skeleton className="mb-6 h-10 w-full rounded-md" />
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
  const { t } = useTranslation()

  return (
    <div className="mx-auto w-full max-w-md py-12 text-center">
      <div className="mb-4 flex justify-center">
        <AlertCircle className="h-12 w-12 text-primary" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{t('pricing.error.title')}</h3>
      <p className="mb-4 text-muted-foreground">{t('pricing.error.description')}</p>
    </div>
  )
}

const transformPlansToTiers = (plans: Plan[]): PricingTier[] => {
  return plans.map((plan) => ({
    id: plan.slug,
    name: plan.name,
    price: {
      monthly: plan.pricing.monthly === 0 ? 'Free' : plan.pricing.monthly,
      yearly: plan.pricing.yearly === 0 ? 'Free' : plan.pricing.yearly,
      'per use': plan.pricing.perUse,
    },
    description: plan.description,
    features: plan.features,
    cta: plan.isHighlighted ? 'Gain Sovereignty' : plan.isPopular ? 'Scale Rigor' : 'Start Audit',
    popular: plan.isPopular,
    highlighted: plan.isHighlighted,
    isCustom: plan.isHighlighted,
    buyNowUrlMonthly: plan.buyNowUrlMonthly,
    buyNowUrlYearly: plan.buyNowUrlYearly,
    hasFreeTrial: plan.hasFreeTrial,
    trialDays: plan.trialDays,
  }))
}

export function PricingSectionDemo() {
  const { data: plans, isLoading, isError } = usePlans()
  const { isAuthenticated } = useAuthContext()
  const { data: subscriptionStatus } = useSubscriptionStatus({ enabled: isAuthenticated })

  const currentPlanSlug = subscriptionStatus?.plan_slug ?? null
  const tiers = plans && plans.length > 0 ? transformPlansToTiers(plans) : []

  return (
    <div className="relative flex min-h-[600px] w-full flex-col items-center justify-center">
      <div className="absolute inset-0 -z-10">
        <div className="h-full w-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:35px_35px] opacity-30 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>
      <HandWrittenTitleDemo />
      {isLoading ? (
        <PricingSkeleton />
      ) : isError || tiers.length === 0 ? (
        <PricingError />
      ) : (
        <PricingSection
          title=""
          subtitle=""
          frequencies={PAYMENT_FREQUENCIES}
          tiers={tiers}
          currentPlanSlug={currentPlanSlug}
        />
      )}
    </div>
  )
}
