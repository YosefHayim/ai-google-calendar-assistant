'use client'

import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SlackIcon, TelegramIcon, WhatsAppIcon } from '@/components/shared/Icons'
import { useCallback, useEffect, useState } from 'react'

import { FEATURES } from './data/features'
import { PhoneMockup } from './components/PhoneMockup'
import type { Platform } from './types'
import { PlatformToggle } from './components/PlatformToggle'
import { SlackChat } from './components/SlackChat'
import { TelegramChat } from './components/TelegramChat'
import { WhatsAppChat } from './components/WhatsAppChat'
import { cn } from '@/lib/utils'

export const FeatureShowcase = React.memo(function FeatureShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [platform, setPlatform] = useState<Platform>('telegram')

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % FEATURES.length)
  }, [])

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + FEATURES.length) % FEATURES.length)
  }, [])

  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(nextSlide, 6000)
    return () => clearInterval(interval)
  }, [isPaused, nextSlide])

  return (
    <section>
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none" aria-hidden="true">
        <div className="absolute bottom-0 left-[-10%] top-[20%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(var(--primary-rgb,34,197,94),0.2),rgba(255,255,255,0))]" />
        <div className="absolute bottom-0 right-[-10%] top-[10%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(139,92,246,0.15),rgba(255,255,255,0))]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <PlatformToggle platform={platform} onToggle={setPlatform} />
        <div className="relative" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-background/80 dark:bg-secondary/80 backdrop-blur-sm shadow-xl flex items-center justify-center text-zinc-600 dark:text-muted-foreground hover:text-primary hover:scale-110 transition-all border border dark:border-zinc-700"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-background/80 dark:bg-secondary/80 backdrop-blur-sm shadow-xl flex items-center justify-center text-zinc-600 dark:text-muted-foreground hover:text-primary hover:scale-110 transition-all border border dark:border-zinc-700"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div className="relative w-full h-[450px] sm:h-[500px] md:h-[550px] flex items-center justify-center [perspective:1200px]">
            {FEATURES.map((feature, index) => {
              const offset = index - activeIndex
              const total = FEATURES.length
              let pos = (offset + total) % total
              if (pos > Math.floor(total / 2)) {
                pos = pos - total
              }

              const isCenter = pos === 0
              const isAdjacent = Math.abs(pos) === 1

              return (
                <div
                  key={feature.id}
                  className={cn('absolute transition-all duration-500 ease-out flex items-center justify-center')}
                  style={{
                    transform: `
                      translateX(${pos * 55}%) 
                      scale(${isCenter ? 1 : isAdjacent ? 0.75 : 0.5})
                      rotateY(${pos * -12}deg)
                      translateZ(${isCenter ? 0 : -100}px)
                    `,
                    zIndex: isCenter ? 10 : isAdjacent ? 5 : 1,
                    opacity: isCenter ? 1 : isAdjacent ? 0.5 : 0,
                    filter: isCenter ? 'blur(0px)' : `blur(${isAdjacent ? 2 : 4}px)`,
                    visibility: Math.abs(pos) > 2 ? 'hidden' : 'visible',
                    pointerEvents: isCenter ? 'auto' : 'none',
                  }}
                >
                  <div className="relative">
                    <AnimatePresence mode="wait">
                      {isCenter && (
                        <motion.div
                          key={platform}
                          initial={{ opacity: 0, y: -10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.9 }}
                          transition={{ duration: 0.3 }}
                          className={cn(
                            'absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg z-20 whitespace-nowrap',
                            platform === 'telegram'
                              ? 'bg-gradient-to-r from-[#0088cc] to-[#00a2e8] shadow-[#0088cc]/30'
                              : platform === 'slack'
                                ? 'bg-gradient-to-r from-[#611f69] to-[#4A154B] shadow-[#611f69]/30'
                                : 'bg-gradient-to-r from-[#25D366] to-[#128C7E] shadow-[#25D366]/30',
                          )}
                        >
                          {platform === 'telegram' ? (
                            <>
                              <TelegramIcon className="w-3.5 h-3.5" />
                              <span>Telegram Bot</span>
                            </>
                          ) : platform === 'slack' ? (
                            <>
                              <SlackIcon className="w-3.5 h-3.5" />
                              <span>Slack App</span>
                            </>
                          ) : (
                            <>
                              <WhatsAppIcon className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div
                      className={cn('transform transition-transform duration-500', isCenter ? 'scale-100' : 'scale-90')}
                    >
                      <PhoneMockup>
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={`${feature.id}-${platform}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="h-full"
                          >
                            {platform === 'telegram' ? (
                              <TelegramChat messages={feature.telegram.messages} />
                            ) : platform === 'slack' ? (
                              <SlackChat messages={feature.slack.messages} />
                            ) : (
                              <WhatsAppChat messages={feature.whatsapp.messages} />
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </PhoneMockup>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {FEATURES.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className="h-2 rounded-full overflow-hidden bg-accent dark:bg-zinc-700 transition-all duration-300"
                style={{ width: index === activeIndex ? 48 : 12 }}
              >
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: '0%' }}
                  animate={{
                    width: index === activeIndex ? '100%' : '0%',
                  }}
                  transition={{
                    duration: index === activeIndex && !isPaused ? 6 : 0.3,
                    ease: 'linear',
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
})

FeatureShowcase.displayName = 'FeatureShowcase'

export default FeatureShowcase
