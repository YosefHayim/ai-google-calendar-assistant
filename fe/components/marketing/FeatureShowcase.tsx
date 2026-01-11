'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Calendar,
  Check,
  Clock,
  MessageSquare,
  Mic,
  Bell,
  BarChart3,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Globe,
  Smartphone,
} from 'lucide-react'
import { TelegramIcon } from '@/components/shared/Icons'
import { AllyLogo } from '@/components/shared/logo'
import { cn } from '@/lib/utils'

interface Feature {
  id: string
  icon: React.ElementType
  titleKey: string
  descriptionKey: string
  telegram: {
    userMessage: string
    allyResponse: string
    extra?: React.ReactNode
  }
  web: {
    component: React.ReactNode
  }
}

// Phone mockup component for Telegram
const PhoneMockup = ({ children }: { children: React.ReactNode }) => (
  <div className="relative mx-auto w-[280px] h-[560px]">
    {/* Phone frame */}
    <div className="absolute inset-0 bg-zinc-900 rounded-[3rem] shadow-2xl border-[8px] border-zinc-800">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-zinc-800 rounded-b-2xl" />
      {/* Screen */}
      <div className="absolute inset-2 top-8 bg-white dark:bg-zinc-900 rounded-[2rem] overflow-hidden">
        {children}
      </div>
    </div>
  </div>
)

// Browser mockup component for Web
const BrowserMockup = ({ children }: { children: React.ReactNode }) => (
  <div className="relative mx-auto w-full max-w-[500px] h-[360px]">
    {/* Browser frame */}
    <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      {/* Browser header */}
      <div className="h-10 bg-zinc-200 dark:bg-zinc-700 flex items-center px-4 gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 mx-4">
          <div className="bg-white dark:bg-zinc-600 rounded-md h-6 flex items-center px-3 text-xs text-zinc-500 dark:text-zinc-400">
            app.getally.ai
          </div>
        </div>
      </div>
      {/* Browser content */}
      <div className="h-[calc(100%-2.5rem)] bg-white dark:bg-zinc-900 overflow-hidden">
        {children}
      </div>
    </div>
  </div>
)

// Telegram chat interface
const TelegramChat = ({
  userMessage,
  allyResponse,
  extra,
}: {
  userMessage: string
  allyResponse: string
  extra?: React.ReactNode
}) => (
  <div className="h-full flex flex-col">
    {/* Telegram header */}
    <div className="bg-[#0088cc] px-4 py-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
        <AllyLogo className="w-6 h-6 text-white" />
      </div>
      <div>
        <div className="text-white font-medium text-sm">Ally Assistant</div>
        <div className="text-white/70 text-xs">online</div>
      </div>
    </div>
    {/* Chat messages */}
    <div className="flex-1 p-4 space-y-3 bg-[#e5ddd5] dark:bg-zinc-800 overflow-y-auto">
      {/* User message */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end"
      >
        <div className="bg-[#dcf8c6] dark:bg-emerald-800 text-zinc-800 dark:text-white px-3 py-2 rounded-lg rounded-tr-none max-w-[80%] text-sm shadow">
          {userMessage}
        </div>
      </motion.div>
      {/* Ally response */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }}
        className="flex justify-start"
      >
        <div className="bg-white dark:bg-zinc-700 text-zinc-800 dark:text-white px-3 py-2 rounded-lg rounded-tl-none max-w-[85%] text-sm shadow">
          <div className="flex items-center gap-2 mb-1">
            <AllyLogo className="w-4 h-4 text-primary" />
            <span className="font-medium text-primary text-xs">Ally</span>
          </div>
          {allyResponse}
          {extra}
        </div>
      </motion.div>
    </div>
    {/* Input area */}
    <div className="bg-[#f0f0f0] dark:bg-zinc-700 px-4 py-3 flex items-center gap-3">
      <div className="flex-1 bg-white dark:bg-zinc-600 rounded-full px-4 py-2 text-sm text-zinc-400">
        Message...
      </div>
      <div className="w-10 h-10 rounded-full bg-[#0088cc] flex items-center justify-center">
        <Mic className="w-5 h-5 text-white" />
      </div>
    </div>
  </div>
)

// Web dashboard views
const WebCalendarView = () => (
  <div className="h-full p-4">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">Today's Schedule</h3>
      <Plus className="w-5 h-5 text-primary" />
    </div>
    <div className="space-y-2">
      {[
        { time: '9:00 AM', title: 'Team Standup', color: 'bg-blue-500' },
        { time: '11:00 AM', title: 'Client Meeting', color: 'bg-purple-500' },
        { time: '2:00 PM', title: 'Deep Work Block', color: 'bg-emerald-500' },
        { time: '4:00 PM', title: 'Review Session', color: 'bg-orange-500' },
      ].map((event, i) => (
        <motion.div
          key={event.title}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 + i * 0.1 }}
          className="flex items-center gap-3 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800"
        >
          <div className={cn('w-1 h-10 rounded-full', event.color)} />
          <div>
            <div className="text-xs text-zinc-500">{event.time}</div>
            <div className="text-sm font-medium text-zinc-900 dark:text-white">{event.title}</div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
)

const WebAnalyticsView = () => (
  <div className="h-full p-4">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">Weekly Analytics</h3>
      <BarChart3 className="w-5 h-5 text-primary" />
    </div>
    <div className="grid grid-cols-2 gap-3 mb-4">
      {[
        { label: 'Meetings', value: '12h', change: '-15%', positive: true },
        { label: 'Focus Time', value: '18h', change: '+23%', positive: true },
      ].map((stat) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800"
        >
          <div className="text-xs text-zinc-500">{stat.label}</div>
          <div className="text-xl font-bold text-zinc-900 dark:text-white">{stat.value}</div>
          <div className={cn('text-xs', stat.positive ? 'text-emerald-500' : 'text-red-500')}>
            {stat.change}
          </div>
        </motion.div>
      ))}
    </div>
    {/* Simple bar chart */}
    <div className="flex items-end gap-1 h-20">
      {[40, 65, 45, 80, 55, 70, 60].map((height, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${height}%` }}
          transition={{ delay: 0.3 + i * 0.05 }}
          className="flex-1 bg-primary/20 rounded-t"
        >
          <div className="w-full bg-primary rounded-t" style={{ height: '60%' }} />
        </motion.div>
      ))}
    </div>
  </div>
)

const WebChatView = () => (
  <div className="h-full flex flex-col">
    <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <AllyLogo className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="font-medium text-sm text-zinc-900 dark:text-white">Chat with Ally</div>
          <div className="text-xs text-emerald-500 flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Online
          </div>
        </div>
      </div>
    </div>
    <div className="flex-1 p-4 space-y-3 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end"
      >
        <div className="bg-primary text-white px-3 py-2 rounded-lg rounded-tr-none text-sm max-w-[80%]">
          What's my schedule like tomorrow?
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-start"
      >
        <div className="bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded-lg rounded-tl-none text-sm max-w-[80%]">
          <p className="text-zinc-700 dark:text-zinc-300">
            Tomorrow you have <strong>3 meetings</strong> scheduled:
          </p>
          <ul className="mt-2 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
            <li>• 9:00 AM - Team Sync</li>
            <li>• 2:00 PM - Project Review</li>
            <li>• 4:30 PM - 1:1 with Manager</li>
          </ul>
        </div>
      </motion.div>
    </div>
  </div>
)

const FEATURES: Feature[] = [
  {
    id: 'schedule',
    icon: Calendar,
    titleKey: 'showcase.schedule.title',
    descriptionKey: 'showcase.schedule.description',
    telegram: {
      userMessage: 'Schedule a meeting with John tomorrow at 2pm',
      allyResponse: 'Meeting scheduled with John for tomorrow at 2:00 PM.',
      extra: (
        <div className="flex items-center gap-1 text-emerald-500 mt-2 text-xs">
          <Check className="w-4 h-4" />
          <span>Added to calendar</span>
        </div>
      ),
    },
    web: { component: <WebCalendarView /> },
  },
  {
    id: 'voice',
    icon: Mic,
    titleKey: 'showcase.voice.title',
    descriptionKey: 'showcase.voice.description',
    telegram: {
      userMessage: '🎤 "Block 2 hours for deep work this afternoon"',
      allyResponse: 'Done! I\'ve blocked 2:00 PM - 4:00 PM as "Deep Work" and marked you as busy.',
      extra: (
        <div className="flex items-center gap-1 text-primary mt-2 text-xs">
          <Clock className="w-4 h-4" />
          <span>Focus mode enabled</span>
        </div>
      ),
    },
    web: { component: <WebChatView /> },
  },
  {
    id: 'analytics',
    icon: BarChart3,
    titleKey: 'showcase.analytics.title',
    descriptionKey: 'showcase.analytics.description',
    telegram: {
      userMessage: 'How did I spend my time this week?',
      allyResponse:
        'This week: 12h meetings (-15%), 18h focus time (+23%). Your most productive day was Wednesday!',
    },
    web: { component: <WebAnalyticsView /> },
  },
  {
    id: 'reminders',
    icon: Bell,
    titleKey: 'showcase.reminders.title',
    descriptionKey: 'showcase.reminders.description',
    telegram: {
      userMessage: 'Remind me to prepare the presentation 1 hour before the meeting',
      allyResponse: 'Reminder set! I\'ll ping you at 1:00 PM to prepare for your 2:00 PM meeting.',
      extra: (
        <div className="flex items-center gap-1 text-orange-500 mt-2 text-xs">
          <Bell className="w-4 h-4" />
          <span>Reminder active</span>
        </div>
      ),
    },
    web: { component: <WebCalendarView /> },
  },
  {
    id: 'search',
    icon: Search,
    titleKey: 'showcase.search.title',
    descriptionKey: 'showcase.search.description',
    telegram: {
      userMessage: 'When was my last meeting with Sarah?',
      allyResponse:
        'Your last meeting with Sarah was on January 5th at 3:00 PM - "Project Kickoff". Next one is scheduled for January 15th.',
    },
    web: { component: <WebChatView /> },
  },
]

const FeatureShowcase = () => {
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % FEATURES.length)
  }, [])

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + FEATURES.length) % FEATURES.length)
  }, [])

  // Auto-rotate
  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [isPaused, nextSlide])

  const activeFeature = FEATURES[activeIndex]

  return (
    <section className="py-24 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-medium text-zinc-900 dark:text-zinc-100 mb-4">
            {t('showcase.title')}
          </h2>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
            {t('showcase.subtitle')}
          </p>
        </div>

        {/* Feature indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon
            return (
              <button
                key={feature.id}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                  index === activeIndex
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{t(feature.titleKey)}</span>
              </button>
            )
          })}
        </div>

        {/* Main showcase area */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Navigation arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-lg flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-lg flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-primary transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Devices container */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 px-12">
            {/* Telegram Phone */}
            <div className="relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#0088cc] text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-lg">
                <TelegramIcon className="w-4 h-4" />
                <span>Telegram</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`phone-${activeIndex}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PhoneMockup>
                    <TelegramChat
                      userMessage={activeFeature.telegram.userMessage}
                      allyResponse={activeFeature.telegram.allyResponse}
                      extra={activeFeature.telegram.extra}
                    />
                  </PhoneMockup>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Web Browser */}
            <div className="relative w-full max-w-[500px]">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-1.5 rounded-full text-sm font-medium shadow-lg">
                <Globe className="w-4 h-4" />
                <span>Web Dashboard</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`browser-${activeIndex}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <BrowserMockup>{activeFeature.web.component}</BrowserMockup>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Feature description */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`desc-${activeIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center mt-12"
            >
              <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                {t(activeFeature.titleKey)}
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
                {t(activeFeature.descriptionKey)}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Progress bar */}
          <div className="flex justify-center gap-2 mt-8">
            {FEATURES.map((_, index) => (
              <div
                key={index}
                className="h-1 w-12 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden"
              >
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: '0%' }}
                  animate={{
                    width: index === activeIndex ? '100%' : index < activeIndex ? '100%' : '0%',
                  }}
                  transition={{
                    duration: index === activeIndex && !isPaused ? 5 : 0.3,
                    ease: 'linear',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeatureShowcase
