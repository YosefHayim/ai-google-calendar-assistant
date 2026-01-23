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
      className="w-full relative group/carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={prev}
        className="absolute left-2 lg:-left-6 top-1/2 -translate-y-1/2 z-30 rounded-full bg-background/90 dark:bg-secondary/90 backdrop-blur-sm  shadow-xl text-muted-foreground hover:text-primary opacity-100 lg:opacity-0 lg:group-hover/carousel:opacity-100 hover:scale-110 active:scale-95"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={next}
        className="absolute right-2 lg:-right-6 top-1/2 -translate-y-1/2 z-30 rounded-full bg-background/90 dark:bg-secondary/90 backdrop-blur-sm  shadow-xl text-muted-foreground hover:text-primary opacity-100 lg:opacity-0 lg:group-hover/carousel:opacity-100 hover:scale-110 active:scale-95"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-muted dark:bg-secondary/50 rounded-[2.5rem] p-8 md:p-12 lg:p-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />

        <div className="lg:col-span-5 flex flex-col gap-6 relative z-10">
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
                  className={`w-12 h-12 rounded-xl bg-background dark:bg-secondary  flex items-center justify-center shadow-sm ${translatedFeatures[active].color}`}
                >
                  {React.createElement(translatedFeatures[active].icon, { className: 'w-6 h-6' })}
                </div>
                <h3 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground dark:text-primary-foreground leading-tight">
                  {translatedFeatures[active].title}
                </h3>
                <p className="text-lg text-muted-foreground dark:text-muted-foreground font-medium leading-relaxed">
                  {translatedFeatures[active].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex gap-2 flex-wrap max-w-xs">
              {translatedFeatures.map((_, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  onClick={() => setActive(i)}
                  className={cn(
                    'h-1.5 p-0 rounded-full transition-all duration-500 mb-2 min-w-0',
                    i === active ? 'w-8 bg-primary hover:bg-primary' : 'w-2 bg-accent -zinc-700 hover:bg-zinc-300',
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 flex items-center justify-center relative">
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
