'use client'

import { useTranslation } from 'react-i18next'

import { PricingSectionDemo } from '@/components/ui/pricing-section-demo'
import FAQs from '@/components/marketing/FAQs'
import { AnimatedTestimonials } from '@/components/ui/animated-testimonials'
import MarketingLayout from '@/components/marketing/MarketingLayout'

const MOCK_TESTIMONIALS = [
  {
    id: 1,
    name: 'Marcus Thorne',
    role: 'Managing Director',
    company: 'Capital Growth',
    content:
      "Ally has completely eliminated the 2-hour daily struggle of calendar management. By auditing my habits via WhatsApp, it's the best investment I've made in executive leverage this year.",
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=250&auto=format&fit=crop',
  },
  {
    id: 2,
    name: 'Sarah Chen',
    role: 'Founder',
    company: 'GreenScale',
    content:
      'The voice-to-action on Telegram is a game changer. I handle all my scheduling adjustments and focus-block audits while on the move. Simple, fast, and remarkably intuitive.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=250&auto=format&fit=crop',
  },
  {
    id: 3,
    name: 'Alex Rivera',
    role: 'CEO',
    company: 'TechFlow',
    content:
      "We've integrated Ally across our entire leadership team. The coordination speed between our Google Calendars and the automated conflict resolution has been immediate and profound.",
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=250&auto=format&fit=crop',
  },
]

export default function PricingPage() {
  const { t } = useTranslation()

  return (
    <MarketingLayout>
      <div className="flex w-full flex-col items-center justify-center">
        <PricingSectionDemo />

        <AnimatedTestimonials
          title={t('pricing.testimonialsTitle')}
          subtitle={t('pricing.testimonialsSubtitle')}
          badgeText={t('pricing.testimonialsBadge')}
          testimonials={MOCK_TESTIMONIALS}
          autoRotateInterval={5000}
        />

        <FAQs />
      </div>
    </MarketingLayout>
  )
}
