'use client'

import { Calendar, Star } from 'lucide-react'

import React from 'react'
import { motion } from 'framer-motion'

const testimonials = [
  {
    name: 'Alex Rivera',
    role: 'Venture Partner',
    image: 'https://i.pravatar.cc/150?u=alex',
    content:
      'Ally has transformed how I manage my time. I just message the bot on WhatsApp to audit my day, and it automatically reshuffles my Google Calendar to prioritize my deep work windows.',
    date: 'Nov 12, 2024',
  },
  {
    name: 'Sarah Chen',
    role: 'Solo Founder',
    image: 'https://i.pravatar.cc/150?u=sarah',
    content:
      "The Telegram relay is flawless. I can block deep work sessions and resolve calendar overlaps via voice note while walking between appointments. It's truly a private office experience.",
    date: 'Jan 05, 2025',
  },
  {
    name: 'James Wilson',
    role: 'Private Investor',
    image: 'https://i.pravatar.cc/150?u=james',
    content:
      "I've finally reclaimed my mornings. Ally understands my productivity habits better than I do, shielding my focus blocks like a hawk from low-value calendar invites.",
    date: 'Aug 22, 2024',
  },
  {
    name: 'Elena Rodriguez',
    role: 'Lead Counsel',
    image: 'https://i.pravatar.cc/150?u=elena',
    content:
      'The quantitative approach to my time ledger was the deciding factor. Seeing my focus ratio and context-switching costs in real-time has made me a much more effective executive.',
    date: 'Dec 15, 2024',
  },
  {
    name: 'Marcus Thorne',
    role: 'Managing Director',
    image: 'https://i.pravatar.cc/150?u=marcus',
    content:
      'Capturing schedule adjustments via voice on Telegram has changed my workflow. Ally understands intent, not just keywords, making the automated conflict resolution incredibly reliable.',
    date: 'Oct 03, 2024',
  },
  {
    name: 'Lila Vance',
    role: 'Strategy Consultant',
    image: 'https://i.pravatar.cc/150?u=lila',
    content:
      "The intelligence analytics show me exactly where my focus leaks are. I've increased my deep work ratio by 40% since Ally took over my neural scheduling and calendar management.",
    date: 'Feb 18, 2025',
  },
]

const Testimonials = () => {
  return (
    <div className="w-full py-20 overflow-hidden bg-white dark:bg-[#030303]">
      <div className="container mx-auto px-4 mb-12 text-center">
        <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4">Verification Layer</p>
        <h2 className="text-4xl md:text-5xl font-medium text-zinc-900 dark:text-zinc-100 tracking-tight">
          Trusted by the world's most <br /> ambitious high-performers.
        </h2>
      </div>

      <div className="relative flex flex-col gap-6">
        {/* First Row Moving Left */}
        <div className="flex w-fit animate-marquee-left hover:[animation-play-state:paused]">
          {[...testimonials, ...testimonials].map((testimonial, idx) => (
            <TestimonialCard key={idx} {...testimonial} />
          ))}
        </div>

        {/* Second Row Moving Right */}
        <div className="flex w-fit animate-marquee-right hover:[animation-play-state:paused]">
          {[...testimonials.reverse(), ...testimonials].map((testimonial, idx) => (
            <TestimonialCard key={idx} {...testimonial} />
          ))}
        </div>

        {/* Gradient Overlays for smooth edges */}
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

const TestimonialCard = ({ name, role, image, content, date }: any) => (
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
          Verified
        </span>
      </div>
    </div>
  </div>
)

export default Testimonials
