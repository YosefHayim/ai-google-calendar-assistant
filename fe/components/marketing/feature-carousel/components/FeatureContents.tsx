'use client'

import { AlertCircle, ArrowRight, Check, MapPin, ShieldCheck } from 'lucide-react'

import { AllyLogo } from '@/components/shared/logo'
import React from 'react'
import { WhatsAppIcon } from '@/components/shared/Icons'
import { motion } from 'framer-motion'

export function SchedulingContent() {
  return (
    <div className="space-y-2 pt-10">
      <div className="flex justify-end">
        <div className="flex max-w-[80%] items-center gap-2 rounded-2xl rounded-tr-none bg-secondary px-3 py-2 text-xs font-medium text-foreground shadow-lg">
          Find 30m for me, Sarah, and Alex tomorrow.
        </div>
      </div>
      <div className="flex justify-start">
        <div className="flex max-w-[80%] flex-col gap-1 rounded-2xl rounded-tl-none bg-background bg-secondary px-3 py-2 text-xs font-medium shadow-sm">
          <div className="flex items-center gap-2 text-foreground">
            <AllyLogo className="h-3.5 w-3.5" />
            <span>Scanning calendars...</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-primary">
            <Check size={16} />
            <span>Done. Tuesday 2:30 PM.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function WhatsAppContent() {
  return (
    <div className="space-y-2 pt-10">
      <div className="flex justify-start">
        <div className="flex max-w-[85%] flex-col gap-1 rounded-2xl rounded-tl-none bg-primary px-3 py-2 text-xs font-medium text-primary-foreground shadow-lg">
          <div className="mb-1 flex items-center gap-2">
            <WhatsAppIcon className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider opacity-70">Ally AI</span>
          </div>
          <span>&quot;Move the board call back 15 mins and notify stakeholders.&quot;</span>
        </div>
      </div>
      <div className="flex justify-end">
        <div className="rounded-2xl rounded-tr-none bg-background bg-secondary px-3 py-2 text-xs font-medium shadow-sm">
          <div className="flex items-center gap-2 font-bold text-primary">
            <Check size={16} />
            <span>Acknowledged. 2:15 PM.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SummariesContent() {
  return (
    <div className="space-y-2 pt-10">
      <div className="rounded-xl border bg-muted bg-secondary p-3">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Board Call Summary</span>
        </div>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-xs font-medium text-muted-foreground">
            <Check className="h-3 w-3 shrink-0 text-primary" /> Approved Q4 budget
          </li>
          <li className="flex items-start gap-2 text-xs font-medium text-muted-foreground">
            <Check className="h-3 w-3 shrink-0 text-primary" /> Hiring for AI Ops leads
          </li>
        </ul>
      </div>
      <div className="flex items-center justify-between rounded-lg bg-primary p-2">
        <span className="ml-2 text-xs font-bold uppercase text-foreground">3 Tasks Created</span>
        <ArrowRight className="mr-2 h-3 w-3 text-foreground" />
      </div>
    </div>
  )
}

export function LogisticsContent() {
  return (
    <div className="flex flex-col gap-4 pt-10">
      <div className="bg-destructive/5/20 border-destructive/20/30 rounded-xl p-3 text-center">
        <p className="mb-1 text-xs font-bold uppercase text-destructive">Flight Delayed</p>
        <p className="text-xl font-bold text-foreground">+2h 15m</p>
      </div>
      <div className="bg-primary/10/20 border-primary/20/30 rounded-xl p-3 text-center">
        <p className="mb-1 text-xs font-bold uppercase text-primary">Ally Resolved</p>
        <p className="text-xs font-bold text-foreground">Hotel & Limo Synced</p>
      </div>
      <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
        <MapPin size={16} /> Stakeholders updated
      </div>
    </div>
  )
}

export function FocusContent() {
  return (
    <div className="flex flex-col items-center gap-4 pt-20">
      <div className="relative">
        <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-2xl" />
        <div className="relative flex flex-col items-center gap-2 rounded-3xl bg-background bg-secondary p-4 text-foreground shadow-2xl">
          <ShieldCheck className="h-10 w-10 text-primary" />
          <span className="text-center text-sm font-bold tracking-tight">SHIELD ON</span>
        </div>
      </div>
      <div className="w-full rounded-xl bg-background bg-secondary p-3 text-center shadow-sm">
        <p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">Interruption Filter</p>
        <p className="text-xs font-bold text-foreground">2 syncs rescheduled</p>
      </div>
    </div>
  )
}

export function ConflictContent() {
  return (
    <div className="w-full space-y-2 pt-12">
      <div className="bg-destructive/10/20 border-destructive/20/30 rounded-xl p-3">
        <div className="mb-2 flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-destructive" />
          <span className="text-xs font-bold text-destructive">Overlap Detected</span>
        </div>
        <p className="text-xs font-bold text-foreground text-muted-foreground">Demo vs. All Hands</p>
      </div>
      <div className="flex justify-center">
        <div className="rounded-xl border-white/10 bg-secondary p-3 text-center text-foreground shadow-xl">
          <p className="text-xs font-bold uppercase opacity-60">Ally&apos;s Solution</p>
          <p className="text-xs font-bold">Record one, attend the other</p>
        </div>
      </div>
    </div>
  )
}

export function VoiceContent() {
  return (
    <div className="flex w-full flex-col items-center space-y-2 pt-20">
      <div className="flex h-10 items-center gap-1">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1 origin-bottom rounded-full bg-primary"
            animate={{ scaleY: [0.27, 1, 0.5, 0.83, 0.27] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
            style={{ height: '30px' }}
          />
        ))}
      </div>
      <div className="px-4 text-center text-xs font-medium italic text-muted-foreground">
        &quot;Remind me to check the Q3 forecasts when I land.&quot;
      </div>
      <div className="bg-primary/10/30 border-primary/20/50 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold text-primary">
        <Check size={16} />
        Task created & Geofenced
      </div>
    </div>
  )
}

export function IntelligenceContent() {
  return (
    <div className="grid w-full grid-cols-1 gap-3 pt-10">
      <div className="flex flex-col items-center rounded-xl bg-muted bg-secondary p-3 shadow-sm">
        <span className="text-xl font-bold text-primary">12h</span>
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Time Reclaimed</span>
      </div>
      <div className="flex flex-col items-center rounded-xl bg-muted bg-secondary p-3 shadow-sm">
        <span className="text-xl font-bold text-accent">84%</span>
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Focus Ratio</span>
      </div>
      <div className="mt-2 flex h-16 items-end gap-1 px-2">
        {[30, 60, 40, 90, 60, 80, 50, 95].map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 origin-bottom rounded-t-[2px] bg-primary/80"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: h / 100 }}
            transition={{ delay: i * 0.05, duration: 0.8 }}
            style={{ height: '100%' }}
          />
        ))}
      </div>
    </div>
  )
}
