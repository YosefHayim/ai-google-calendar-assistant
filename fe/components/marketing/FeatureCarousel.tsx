"use client";

import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Battery,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
  MapPin,
  Mic,
  NotebookTabs,
  Plane,
  ShieldCheck,
  Smartphone,
  User,
  Users,
  Wifi,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { TelegramIcon, WhatsAppIcon } from "@/components/shared/Icons";

import { AllyLogo } from "@/components/shared/logo";

// Fix: Use React.FC and make children optional to resolve "Property 'children' is missing" errors in consumers
const PhoneFrame: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative mx-auto w-[280px] h-[580px] bg-zinc-900 rounded-[3rem] border-[8px] border-zinc-800 shadow-2xl overflow-hidden ring-1 ring-white/10">
      {/* Side Buttons */}
      <div className="absolute -left-[10px] top-24 w-[2px] h-12 bg-zinc-700 rounded-l-md" />
      <div className="absolute -left-[10px] top-40 w-[2px] h-16 bg-zinc-700 rounded-l-md" />
      <div className="absolute -right-[10px] top-32 w-[2px] h-20 bg-zinc-700 rounded-r-md" />

      {/* Screen Content */}
      <div className="w-full h-full bg-white dark:bg-zinc-950 relative flex flex-col pt-12">
        {/* Dynamic Island */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-50 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500/20 mr-1" />
        </div>

        {/* Status Bar */}
        <div className="absolute top-4 left-0 right-0 px-8 flex justify-between items-center z-40">
          <span className="text-[10px] font-bold dark:text-white">9:41</span>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-2.5 h-2.5 dark:text-white" />
            <Battery className="w-3 h-3 dark:text-white" />
          </div>
        </div>

        {/* Gloss Effect */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 to-transparent z-30" />

        <div className="flex-1 overflow-hidden p-4 relative">{children}</div>
      </div>
    </div>
  );
};

const FEATURES = [
  {
    id: "scheduling",
    title: "Intelligent Scheduling",
    description: "Ally orchestrates complex meetings across teams and timezones with zero friction.",
    icon: Calendar,
    color: "text-blue-500",
    content: (
      <div className="space-y-2 pt-10">
        <div className="flex justify-end">
          <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-2 rounded-2xl rounded-tr-none text-[11px] font-medium shadow-lg flex items-center gap-2 max-w-[80%]">
            Find 30m for me, Sarah, and Alex tomorrow.
          </div>
        </div>
        <div className="flex justify-start">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-2xl rounded-tl-none text-[11px] font-medium shadow-sm flex flex-col gap-1 max-w-[80%]">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <AllyLogo className="w-3.5 h-3.5" />
              <span>Scanning calendars...</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-500 text-[10px] mt-1">
              <Check className="w-3 h-3" />
              <span>Done. Tuesday 2:30 PM.</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "whatsapp",
    title: "WhatsApp Relay",
    description: "The world's most popular messenger, now your executive command line. Private, fast, and always accessible.",
    icon: WhatsAppIcon,
    color: "text-emerald-500",
    content: (
      <div className="space-y-2 pt-10">
        <div className="flex justify-start">
          <div className="bg-emerald-500 text-white px-3 py-2 rounded-2xl rounded-tl-none text-[11px] font-medium shadow-lg flex flex-col gap-1 max-w-[85%]">
            <div className="flex items-center gap-2 mb-1">
              <WhatsAppIcon className="w-3 h-3" />
              <span className="text-[8px] opacity-70 font-bold uppercase tracking-wider">Ally AI</span>
            </div>
            <span>"Move the board call back 15 mins and notify stakeholders."</span>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-2xl rounded-tr-none text-[10px] font-medium shadow-sm">
            <div className="flex items-center gap-2 text-emerald-500 font-bold">
              <Check className="w-3 h-3" />
              <span>Acknowledged. 2:15 PM.</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "summaries",
    title: "Executive Digests",
    description: "Turns hour-long transcripts into 5-minute actionable summaries and next steps.",
    icon: NotebookTabs,
    color: "text-amber-500",
    content: (
      <div className="space-y-2 pt-10">
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Board Call Summary</span>
          </div>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-[10px] font-medium text-zinc-600 dark:text-zinc-300">
              <Check className="w-3 h-3 text-emerald-500 shrink-0" /> Approved Q4 budget
            </li>
            <li className="flex items-start gap-2 text-[10px] font-medium text-zinc-600 dark:text-zinc-300">
              <Check className="w-3 h-3 text-emerald-500 shrink-0" /> Hiring for AI Ops leads
            </li>
          </ul>
        </div>
        <div className="p-2 bg-emerald-500 rounded-lg flex items-center justify-between">
          <span className="text-[9px] font-bold text-white uppercase ml-2">3 Tasks Created</span>
          <ArrowRight className="w-3 h-3 text-white mr-2" />
        </div>
      </div>
    ),
  },
  {
    id: "logistics",
    title: "Proactive Logistics",
    description: "Monitors flights and car services, adjusting your schedule in real-time for delays.",
    icon: Plane,
    color: "text-sky-500",
    content: (
      <div className="flex flex-col gap-4 pt-10">
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl text-center">
          <p className="text-[9px] font-bold text-red-500 uppercase mb-1">Flight Delayed</p>
          <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">+2h 15m</p>
        </div>
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-center">
          <p className="text-[9px] font-bold text-emerald-500 uppercase mb-1">Ally Resolved</p>
          <p className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100">Hotel & Limo Synced</p>
        </div>
        <div className="flex items-center justify-center gap-2 text-[9px] text-zinc-400 font-medium">
          <MapPin className="w-3 h-3" /> Stakeholders updated
        </div>
      </div>
    ),
  },
  {
    id: "focus",
    title: "Focus Protection",
    description: "Automatically shields your deep work sessions and blocks interruptions.",
    icon: ShieldCheck,
    color: "text-primary",
    content: (
      <div className="flex flex-col items-center gap-4 pt-20">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
          <div className="relative bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 p-4 rounded-3xl shadow-2xl flex flex-col items-center gap-2">
            <ShieldCheck className="w-10 h-10 text-primary" />
            <span className="text-sm font-bold tracking-tight text-center">SHIELD ON</span>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 rounded-xl shadow-sm text-center w-full">
          <p className="text-[9px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1">Interruption Filter</p>
          <p className="text-zinc-900 dark:text-zinc-100 font-bold text-[11px]">2 syncs rescheduled</p>
        </div>
      </div>
    ),
  },
  {
    id: "conflict",
    title: "Conflict Arbitrator",
    description: "Ally identifies calendar overlaps and proactively suggests logical resolutions.",
    icon: AlertCircle,
    color: "text-rose-500",
    content: (
      <div className="w-full space-y-2 pt-12">
        <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-900/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400">Overlap Detected</span>
          </div>
          <p className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">Demo vs. All Hands</p>
        </div>
        <div className="flex justify-center">
          <div className="p-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl shadow-xl text-center border border-white/10">
            <p className="text-[8px] font-bold uppercase opacity-60">Ally's Solution</p>
            <p className="text-[10px] font-bold">Record one, attend the other</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "voice",
    title: "Voice-to-Action",
    description: "Record commands on the go. Ally executes complex tasks from simple audio.",
    icon: Mic,
    color: "text-emerald-500",
    content: (
      <div className="space-y-2 flex flex-col items-center w-full pt-20">
        <div className="flex items-center gap-1 h-10">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-primary rounded-full"
              animate={{ height: [8, 30, 15, 25, 8] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </div>
        <div className="text-center italic text-zinc-500 dark:text-zinc-400 text-[11px] px-4 font-medium">
          "Remind me to check the Q3 forecasts when I land."
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 px-3 py-1.5 rounded-full text-emerald-600 dark:text-emerald-400 text-[9px] font-bold flex items-center gap-2">
          <Check className="w-3 h-3" />
          Task created & Geofenced
        </div>
      </div>
    ),
  },
  {
    id: "intelligence",
    title: "Leverage Analytics",
    description: "Quantify your impact with deep insights into your productivity patterns.",
    icon: BarChart3,
    color: "text-zinc-900 dark:text-white",
    content: (
      <div className="grid grid-cols-1 gap-3 w-full pt-10">
        <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center">
          <span className="text-xl font-bold text-primary">12h</span>
          <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Time Reclaimed</span>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center">
          <span className="text-xl font-bold text-indigo-500">84%</span>
          <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Focus Ratio</span>
        </div>
        <div className="h-16 flex items-end px-2 gap-1 mt-2">
          {[30, 60, 40, 90, 60, 80, 50, 95].map((h, i) => (
            <motion.div
              key={i}
              className="flex-1 bg-primary/80 rounded-t-[2px]"
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: i * 0.05, duration: 0.8 }}
            />
          ))}
        </div>
      </div>
    ),
  },
];

const FeatureCarousel = () => {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % FEATURES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const next = () => setActive((prev) => (prev + 1) % FEATURES.length);
  const prev = () => setActive((prev) => (prev - 1 + FEATURES.length) % FEATURES.length);

  return (
    <div className="w-full relative group/carousel" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <button
        onClick={prev}
        className="absolute left-0 lg:-left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm border border-zinc-200 dark:border-zinc-700 shadow-xl text-zinc-500 hover:text-primary transition-all opacity-0 group-hover/carousel:opacity-100 hover:scale-110 active:scale-95"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={next}
        className="absolute right-0 lg:-right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm border border-zinc-200 dark:border-zinc-700 shadow-xl text-zinc-500 hover:text-primary transition-all opacity-0 group-hover/carousel:opacity-100 hover:scale-110 active:scale-95"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-zinc-50 dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-8 md:p-12 lg:p-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />

        {/* Left Side: Text Info */}
        <div className="lg:col-span-5 flex flex-col gap-6 relative z-10">
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={FEATURES[active].id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col gap-4"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shadow-sm ${FEATURES[active].color}`}
                >
                  {React.createElement(FEATURES[active].icon, { className: "w-6 h-6" })}
                </div>
                <h3 className="text-3xl md:text-4xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">{FEATURES[active].title}</h3>
                <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">{FEATURES[active].description}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex gap-2 flex-wrap max-w-xs">
              {FEATURES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 mb-2 ${i === active ? "w-8 bg-primary" : "w-2 bg-zinc-200 dark:border-zinc-700"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: iPhone Frame Area */}
        <div className="lg:col-span-7 flex items-center justify-center relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={FEATURES[active].id}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -10 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="w-full"
            >
              <PhoneFrame>{FEATURES[active].content}</PhoneFrame>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default FeatureCarousel;
