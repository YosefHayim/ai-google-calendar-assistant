'use client'

import { Calendar, Star } from 'lucide-react'

import React from 'react'
import { useTranslation } from 'react-i18next'

const TESTIMONIAL_KEYS = ['alex', 'sarah', 'james', 'elena', 'marcus', 'lila'] as const
const TESTIMONIAL_IMAGES = {
  alex: 'https://i.pravatar.cc/150?u=alex',
  sarah: 'https://i.pravatar.cc/150?u=sarah',
  james: 'https://i.pravatar.cc/150?u=james',
  elena: 'https://i.pravatar.cc/150?u=elena',
  marcus: 'https://i.pravatar.cc/150?u=marcus',
  lila: 'https://i.pravatar.cc/150?u=lila',
}
const TESTIMONIAL_DATES = {
  alex: 'Nov 12, 2024',
  sarah: 'Jan 05, 2025',
  james: 'Aug 22, 2024',
  elena: 'Dec 15, 2024',
  marcus: 'Oct 03, 2024',
  lila: 'Feb 18, 2025',
}

const Testimonials = () => {
  const { t } = useTranslation()

  const testimonials = TESTIMONIAL_KEYS.map((key) => ({
    key,
    name: t(`testimonials.reviews.${key}.name`),
    role: t(`testimonials.reviews.${key}.role`),
    content: t(`testimonials.reviews.${key}.content`),
    image: TESTIMONIAL_IMAGES[key],
    date: TESTIMONIAL_DATES[key],
  }))

  const reversedTestimonials = [...testimonials].reverse()

  return (
    <div className="w-full py-20 overflow-hidden bg-white dark:bg-[#030303]">
      <div className="container mx-auto px-4 mb-12 text-center">
        <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4">{t('testimonials.badge')}</p>
        <h2 className="text-4xl md:text-5xl font-medium text-zinc-900 dark:text-zinc-100 tracking-tight">
          {t('testimonials.title')}
        </h2>
      </div>

      <div className="relative flex flex-col gap-6">
        <div className="flex w-fit animate-marquee-left hover:[animation-play-state:paused]">
          {[...testimonials, ...testimonials].map((testimonial, idx) => (
            <TestimonialCard
              key={idx}
              name={testimonial.name}
              role={testimonial.role}
              content={testimonial.content}
              image={testimonial.image}
              date={testimonial.date}
              verified={t('testimonials.verified')}
            />
          ))}
        </div>

        <div className="flex w-fit animate-marquee-right hover:[animation-play-state:paused]">
          {[...reversedTestimonials, ...reversedTestimonials].map((testimonial, idx) => (
            <TestimonialCard
              key={idx}
              name={testimonial.name}
              role={testimonial.role}
              content={testimonial.content}
              image={testimonial.image}
              date={testimonial.date}
              verified={t('testimonials.verified')}
            />
          ))}
        </div>

        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white dark:from-[#030303] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white dark:from-[#030303] to-transparent z-10 pointer-events-none" />
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee-left {
          animation: marquee-left 60s linear infinite;
        }
        .animate-marquee-right {
          animation: marquee-right 60s linear infinite;
        }
      `,
        }}
      />
    </div>
  )
}

interface TestimonialCardProps {
  name: string
  role: string
  image: string
  content: string
  date: string
  verified: string
}

const TestimonialCard = ({ name, role, image, content, date, verified }: TestimonialCardProps) => (
  <div className="w-[380px] mx-3 shrink-0 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm hover:border-primary/20 transition-all hover:-translate-y-1">
    <div className="flex items-center gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
    <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed mb-8 font-medium italic">"{content}"</p>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img
          src={image}
          alt={name}
          className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
        />
        <div>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{name}</h4>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-tight">{role}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 opacity-40">
        <div className="flex items-center gap-1">
          <Calendar className="w-2.5 h-2.5" />
          <span className="text-xs font-bold uppercase tracking-tighter">{date}</span>
        </div>
        <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-1 rounded">
          {verified}
        </span>
      </div>
    </div>
  </div>
)

export default Testimonials
