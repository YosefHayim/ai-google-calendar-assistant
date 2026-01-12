'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { MessageSquarePlus, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { TestimonialsColumn, Testimonial } from '@/components/ui/testimonials-column'

const placeholderTestimonials: Testimonial[] = [
  {
    text: 'This could be you! Be one of the first to try Ally and share your experience. Your feedback shapes our product.',
    image: '',
    name: 'This Could Be You',
    role: 'Early Adopter',
    isPlaceholder: true,
  },
  {
    text: 'Your voice matters! Join our early users and help us build the calendar assistant you have always wanted.',
    image: '',
    name: 'Share Your Story',
    role: 'Feedback Welcome',
    isPlaceholder: true,
  },
  {
    text: 'Be among the first to experience AI-powered scheduling. Sign up now and let us know what you think!',
    image: '',
    name: 'Join Us Today',
    role: 'Pioneer User',
    isPlaceholder: true,
  },
  {
    text: 'We are building Ally for you. Try it out and tell us how we can make your calendar management even better.',
    image: '',
    name: 'Your Feedback Counts',
    role: 'Beta Tester',
    isPlaceholder: true,
  },
  {
    text: 'Help us shape the future of calendar management. Your experience and suggestions drive our development.',
    image: '',
    name: 'Shape The Future',
    role: 'Early Contributor',
    isPlaceholder: true,
  },
  {
    text: 'Be a founding voice! Early feedback helps us build features that truly matter to busy professionals like you.',
    image: '',
    name: 'Founding Voice',
    role: 'First User',
    isPlaceholder: true,
  },
  {
    text: 'Your story could inspire others. Share how Ally helps you manage your time and we will feature it here.',
    image: '',
    name: 'Inspire Others',
    role: 'Community Member',
    isPlaceholder: true,
  },
  {
    text: 'Join the conversation! Tell us what works, what does not, and what features you would love to see next.',
    image: '',
    name: 'Join The Conversation',
    role: 'Active User',
    isPlaceholder: true,
  },
  {
    text: 'Every great product starts with great feedback. Be part of the Ally story from the very beginning.',
    image: '',
    name: 'Be Part Of Our Story',
    role: 'Early Supporter',
    isPlaceholder: true,
  },
  {
    text: 'We read every piece of feedback. Share your thoughts and help us create something amazing together.',
    image: '',
    name: 'We Are Listening',
    role: 'Valued Tester',
    isPlaceholder: true,
  },
  {
    text: 'Your experience matters more than you know. Drop us a line and let us know how Ally is working for you.',
    image: '',
    name: 'Your Experience Matters',
    role: 'Feedback Provider',
    isPlaceholder: true,
  },
  {
    text: 'Ready to try something new? Give Ally a spin and share your honest thoughts. We can handle it!',
    image: '',
    name: 'Try Something New',
    role: 'Adventurer',
    isPlaceholder: true,
  },
]

const firstColumn = placeholderTestimonials.slice(0, 4)
const secondColumn = placeholderTestimonials.slice(4, 8)
const thirdColumn = placeholderTestimonials.slice(8, 12)

const Testimonials = () => {
  const { t } = useTranslation()

  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[10%] left-[10%] h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(var(--primary-rgb,34,197,94),0.15),rgba(255,255,255,0))]" />
        <div className="absolute bottom-[10%] right-[10%] h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(139,92,246,0.1),rgba(255,255,255,0))]" />
      </div>

      <div className="container z-10 mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[600px] mx-auto mb-12"
        >
          <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4">
            {t('testimonials.badge')}
          </p>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-center text-zinc-900 dark:text-zinc-100">
            {t('testimonials.title')}
          </h2>

          <p className="text-center mt-5 text-zinc-500 dark:text-zinc-400 max-w-md">
            {t('testimonials.subtitle', 'See what early users are saying about Ally. Your feedback could be here too!')}
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-6 flex items-center gap-3"
          >
            <Link
              href="/contact"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
            >
              <Send className="w-4 h-4" />
              {t('testimonials.feedbackButton', 'Share Your Feedback')}
            </Link>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <MessageSquarePlus className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {t('testimonials.cta', 'Be one of the first')}
              </span>
            </div>
          </motion.div>
        </motion.div>

        <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={18} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={22} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={20} />
        </div>
      </div>
    </section>
  )
}

export default Testimonials
