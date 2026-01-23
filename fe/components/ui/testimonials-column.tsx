'use client'

import Link from 'next/link'
import { MessageSquarePlus } from 'lucide-react'
import React from 'react'
import { motion } from 'framer-motion'

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
                    <div className="text-sm leading-relaxed text-muted-foreground group-hover:text-foreground">
                      {text}
                    </div>
                    <div className="mt-5 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-primary/40 bg-primary/10 transition-colors group-hover:border-primary group-hover:bg-primary/20">
                        <MessageSquarePlus className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <div className="font-medium leading-5 tracking-tight text-primary">{name}</div>
                        <div className="text-sm leading-5 tracking-tight text-primary/70">{role}</div>
                      </div>
                    </div>
                  </>
                )

                return isPlaceholder ? (
                  <Link
                    href="/contact"
                    className="bg-primary/5/10 group block w-full max-w-xs cursor-pointer rounded-3xl border border-dashed border-primary/40 p-8 transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:bg-primary/20"
                    key={i}
                  >
                    {cardContent}
                  </Link>
                ) : (
                  <div
                    className="bg-primary/5/10 group w-full max-w-xs cursor-pointer rounded-3xl border border-dashed border-primary/40 p-8 transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:bg-primary/20"
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
