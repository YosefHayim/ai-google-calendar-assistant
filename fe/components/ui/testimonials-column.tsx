'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MessageSquarePlus } from 'lucide-react'

export interface Testimonial {
  text: string
  image: string
  name: string
  role: string
  isPlaceholder?: boolean
}

export const TestimonialsColumn = (props: { className?: string; testimonials: Testimonial[]; duration?: number }) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{
          translateY: '-50%',
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: 'linear',
          repeatType: 'loop',
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, name, role, isPlaceholder }, i) => {
                const cardContent = (
                  <>
                    <div className="text-sm leading-relaxed text-muted-foreground dark:text-muted-foreground group-hover:text-zinc-700 dark:group-hover:text-zinc-300">
                      {text}
                    </div>
                    <div className="flex items-center gap-3 mt-5">
                      <div className="h-10 w-10 rounded-full border-2 border-dashed border-primary/40 group-hover:border-primary flex items-center justify-center bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <MessageSquarePlus className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <div className="font-medium tracking-tight leading-5 text-primary">{name}</div>
                        <div className="text-sm leading-5 tracking-tight text-primary/70">{role}</div>
                      </div>
                    </div>
                  </>
                )

                return isPlaceholder ? (
                  <Link
                    href="/contact"
                    className="p-8 rounded-3xl border max-w-xs w-full transition-all duration-300 border-dashed border-primary/40 bg-primary/5 dark:bg-primary/10 hover:border-primary hover:bg-primary/10 dark:hover:bg-primary/20 cursor-pointer group block"
                    key={i}
                  >
                    {cardContent}
                  </Link>
                ) : (
                  <div
                    className="p-8 rounded-3xl border max-w-xs w-full transition-all duration-300 border-dashed border-primary/40 bg-primary/5 dark:bg-primary/10 hover:border-primary hover:bg-primary/10 dark:hover:bg-primary/20 cursor-pointer group"
                    key={i}
                  >
                    {cardContent}
                  </div>
                )
              })}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  )
}
