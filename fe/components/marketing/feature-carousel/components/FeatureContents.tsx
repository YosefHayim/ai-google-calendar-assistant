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
        <div className="bg-secondary dark:bg-secondary text-white dark:text-foreground px-3 py-2 rounded-2xl rounded-tr-none text-xs font-medium shadow-lg flex items-center gap-2 max-w-[80%]">
          Find 30m for me, Sarah, and Alex tomorrow.
        </div>
      </div>
      <div className="flex justify-start">
        <div className="bg-background dark:bg-secondary px-3 py-2 rounded-2xl rounded-tl-none text-xs font-medium shadow-sm flex flex-col gap-1 max-w-[80%]">
          <div className="flex items-center gap-2 text-foreground dark:text-primary-foreground">
            <AllyLogo className="w-3.5 h-3.5" />
            <span>Scanning calendars...</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-500 text-xs mt-1">
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
        <div className="bg-emerald-500 text-white px-3 py-2 rounded-2xl rounded-tl-none text-xs font-medium shadow-lg flex flex-col gap-1 max-w-[85%]">
          <div className="flex items-center gap-2 mb-1">
            <WhatsAppIcon className="w-4 h-4" />
            <span className="text-xs opacity-70 font-bold uppercase tracking-wider">Ally AI</span>
          </div>
          <span>&quot;Move the board call back 15 mins and notify stakeholders.&quot;</span>
        </div>
      </div>
      <div className="flex justify-end">
        <div className="bg-background dark:bg-secondary px-3 py-2 rounded-2xl rounded-tr-none text-xs font-medium shadow-sm">
          <div className="flex items-center gap-2 text-emerald-500 font-bold">
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
      <div className="p-3 bg-muted dark:bg-secondary rounded-xl border ">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Board Call Summary</span>
        </div>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
            <Check className="w-3 h-3 text-emerald-500 shrink-0" /> Approved Q4 budget
          </li>
          <li className="flex items-start gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
            <Check className="w-3 h-3 text-emerald-500 shrink-0" /> Hiring for AI Ops leads
          </li>
        </ul>
      </div>
      <div className="p-2 bg-emerald-500 rounded-lg flex items-center justify-between">
        <span className="text-xs font-bold text-white uppercase ml-2">3 Tasks Created</span>
        <ArrowRight className="w-3 h-3 text-white mr-2" />
      </div>
    </div>
  )
}

export function LogisticsContent() {
  return (
    <div className="flex flex-col gap-4 pt-10">
      <div className="p-3 bg-destructive/5 dark:bg-red-900/20 border-red-100 -red-900/30 rounded-xl text-center">
        <p className="text-xs font-bold text-destructive uppercase mb-1">Flight Delayed</p>
        <p className="text-xl font-bold text-foreground dark:text-primary-foreground">+2h 15m</p>
      </div>
      <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 -emerald-900/30 rounded-xl text-center">
        <p className="text-xs font-bold text-emerald-500 uppercase mb-1">Ally Resolved</p>
        <p className="text-xs font-bold text-foreground dark:text-primary-foreground">Hotel & Limo Synced</p>
      </div>
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-medium">
        <MapPin size={16} /> Stakeholders updated
      </div>
    </div>
  )
}

export function FocusContent() {
  return (
    <div className="flex flex-col items-center gap-4 pt-20">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
        <div className="relative bg-secondary dark:bg-background text-white dark:text-foreground p-4 rounded-3xl shadow-2xl flex flex-col items-center gap-2">
          <ShieldCheck className="w-10 h-10 text-primary" />
          <span className="text-sm font-bold tracking-tight text-center">SHIELD ON</span>
        </div>
      </div>
      <div className="bg-background dark:bg-secondary  -zinc-700 p-3 rounded-xl shadow-sm text-center w-full">
        <p className="text-xs font-medium text-muted-foreground dark:text-muted-foreground uppercase tracking-widest mb-1">
          Interruption Filter
        </p>
        <p className="text-foreground dark:text-primary-foreground font-bold text-xs">2 syncs rescheduled</p>
      </div>
    </div>
  )
}

export function ConflictContent() {
  return (
    <div className="w-full space-y-2 pt-12">
      <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl border-rose-100 -rose-900/30">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
          <span className="text-xs font-bold text-rose-700 dark:text-rose-400">Overlap Detected</span>
        </div>
        <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Demo vs. All Hands</p>
      </div>
      <div className="flex justify-center">
        <div className="p-3 bg-secondary dark:bg-secondary text-white dark:text-foreground rounded-xl shadow-xl text-center border-white/10">
          <p className="text-xs font-bold uppercase opacity-60">Ally&apos;s Solution</p>
          <p className="text-xs font-bold">Record one, attend the other</p>
        </div>
      </div>
    </div>
  )
}

export function VoiceContent() {
  return (
    <div className="space-y-2 flex flex-col items-center w-full pt-20">
      <div className="flex items-center gap-1 h-10">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1 bg-primary rounded-full origin-bottom"
            animate={{ scaleY: [0.27, 1, 0.5, 0.83, 0.27] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
            style={{ height: '30px' }}
          />
        ))}
      </div>
      <div className="text-center italic text-muted-foreground dark:text-muted-foreground text-xs px-4 font-medium">
        &quot;Remind me to check the Q3 forecasts when I land.&quot;
      </div>
      <div className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 -emerald-900/50 px-3 py-1.5 rounded-full text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
        <Check size={16} />
        Task created & Geofenced
      </div>
    </div>
  )
}

export function IntelligenceContent() {
  return (
    <div className="grid grid-cols-1 gap-3 w-full pt-10">
      <div className="bg-muted dark:bg-secondary p-3 rounded-xl shadow-sm flex flex-col items-center">
        <span className="text-xl font-bold text-primary">12h</span>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Time Reclaimed</span>
      </div>
      <div className="bg-muted dark:bg-secondary p-3 rounded-xl shadow-sm flex flex-col items-center">
        <span className="text-xl font-bold text-indigo-500">84%</span>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Focus Ratio</span>
      </div>
      <div className="h-16 flex items-end px-2 gap-1 mt-2">
        {[30, 60, 40, 90, 60, 80, 50, 95].map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 bg-primary/80 rounded-t-[2px] origin-bottom"
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
