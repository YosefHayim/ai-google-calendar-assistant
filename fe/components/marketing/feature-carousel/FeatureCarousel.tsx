'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { FEATURES } from './constants'
import { PhoneFrame } from './components'
import { cn } from '@/lib/utils'

export function FeatureCarousel() {
  const { t } = useTranslation()
  const [active, setActive] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Create translated features
  const translatedFeatures = FEATURES.map((feature) => ({
    ...feature,
    title: t(`featureCarousel.${feature.id}.title`),
    description: t(`featureCarousel.${feature.id}.description`),
  }))

  useEffect(() => {
    if (isPaused) return

    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % translatedFeatures.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [isPaused])

  const next = () => setActive((prev) => (prev + 1) % translatedFeatures.length)
  const prev = () => setActive((prev) => (prev - 1 + translatedFeatures.length) % translatedFeatures.length)

  return (
    <div
      className="group/carousel relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={prev}
        className="absolute left-2 top-1/2 z-30 -translate-y-1/2 rounded-full bg-background/90 bg-secondary/90 text-muted-foreground opacity-100 shadow-xl backdrop-blur-sm hover:scale-110 hover:text-primary active:scale-95 lg:-left-6 lg:opacity-0 lg:group-hover/carousel:opacity-100"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={next}
        className="absolute right-2 top-1/2 z-30 -translate-y-1/2 rounded-full bg-background/90 bg-secondary/90 text-muted-foreground opacity-100 shadow-xl backdrop-blur-sm hover:scale-110 hover:text-primary active:scale-95 lg:-right-6 lg:opacity-0 lg:group-hover/carousel:opacity-100"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      <div className="relative grid grid-cols-1 items-center gap-12 overflow-hidden rounded-[2.5rem] bg-muted bg-secondary/50 p-8 md:p-12 lg:grid-cols-12 lg:p-16">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-primary/5 to-transparent" />

        <div className="relative z-10 flex flex-col gap-6 lg:col-span-5">
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={translatedFeatures[active].id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col gap-4"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-background bg-secondary shadow-sm ${translatedFeatures[active].color}`}
                >
                  {React.createElement(translatedFeatures[active].icon, { className: 'w-6 h-6' })}
                </div>
                <h3 className="text-3xl font-medium leading-tight tracking-tight text-foreground md:text-4xl">
                  {translatedFeatures[active].title}
                </h3>
                <p className="text-lg font-medium leading-relaxed text-muted-foreground">
                  {translatedFeatures[active].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex max-w-xs flex-wrap gap-2">
              {translatedFeatures.map((_, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  onClick={() => setActive(i)}
                  className={cn(
                    'mb-2 h-1.5 min-w-0 rounded-full p-0 transition-all duration-500',
                    i === active ? 'w-8 bg-primary hover:bg-primary' : 'w-2 bg-accent bg-secondary hover:bg-secondary',
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center lg:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={translatedFeatures[active].id}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -10 }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              className="w-full"
            >
              <PhoneFrame>{translatedFeatures[active].content}</PhoneFrame>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default FeatureCarousel
