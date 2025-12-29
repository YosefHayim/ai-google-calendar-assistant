'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, CalendarDays, Mic, Plane, User, Check } from 'lucide-react';
import { AllyLogo } from './logo';

const useCases = [
  {
    icon: CalendarDays,
    title: "Intelligent Scheduling",
    description: "Finds the perfect time for meetings, navigating complex calendars and timezones effortlessly.",
    illustration: () => (
      <div className="space-y-3">
        <div className="text-xs font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 p-2 rounded-md rounded-br-none self-end flex items-center gap-2 max-w-max ml-auto">
            <User className="w-3 h-3"/>
            <span>Find 30m for me, Sarah, and Alex.</span>
        </div>
        <div className="text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 p-2 rounded-md rounded-bl-none self-start flex items-center gap-2 max-w-max mr-auto">
            <AllyLogo className="w-4 h-4" />
            <div className="flex flex-col">
                <span>Done. Tuesday at 2:30 PM.</span>
                <div className="flex items-center gap-1 text-emerald-500">
                    <Check className="w-3 h-3" />
                    <span>All calendars updated.</span>
                </div>
            </div>
        </div>
      </div>
    )
  },
  {
    icon: BrainCircuit,
    title: "Focus Time Protection",
    description: "Automatically shields your deep work sessions from interruptions by intelligently rescheduling conflicts.",
    illustration: () => (
        <div className="space-y-3">
            <div className="text-xs font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 p-2 rounded-md rounded-br-none self-end max-w-max ml-auto">
                Protect my morning for Q4 strategy.
            </div>
            <div className="text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 p-2 rounded-md rounded-bl-none self-start max-w-max mr-auto">
                Your calendar is blocked from 9 AM - 12 PM. 
                <span className="font-bold text-primary"> Focus mode is active.</span>
            </div>
        </div>
    )
  },
  {
    icon: Plane,
    title: "Proactive Travel Agent",
    description: "Monitors your travel plans, automatically adjusting to delays and keeping all stakeholders informed.",
    illustration: () => (
        <div className="space-y-3">
            <div className="text-xs font-medium bg-red-500 text-white p-2 rounded-md">
                Flight to SFO delayed by 2 hours.
            </div>
            <div className="text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 p-2 rounded-md rounded-bl-none self-start max-w-max mr-auto flex items-center gap-2">
                 <AllyLogo className="w-4 h-4" />
                <span>Handled. Car service and hotel are updated.</span>
            </div>
        </div>
    )
  },
  {
    icon: Mic,
    title: "Voice-to-Action",
    description: "Capture thoughts and commands on the go. Ally transcribes, understands, and executes tasks instantly.",
    illustration: () => (
        <div className="space-y-3">
            <div className="text-xs font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 p-2 rounded-md rounded-br-none self-end max-w-max ml-auto flex items-center gap-2">
                <div className="flex items-center gap-0.5 h-3">
                    {[...Array(5)].map((_, i) => ( <div key={i} className="w-0.5 bg-primary/80 wave-bar rounded-md" style={{ animationDelay: `${i * 0.1}s` }} /> ))}
                </div>
                <span>"Remind me to call investors at 4pm"</span>
            </div>
            <div className="text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 p-2 rounded-md rounded-bl-none self-start max-w-max mr-auto">
                Reminder set: 'Call investors' at 4:00 PM.
            </div>
        </div>
    )
  }
];

const UseCaseGrid = () => {
  return (
    <div className="w-full max-w-5xl mx-auto mt-20 relative px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {useCases.map((useCase, i) => {
          const Icon = useCase.icon;
          return (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: i * 0.1 }}
              className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col justify-between hover:border-primary/30 dark:hover:border-primary/30 transition-colors"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">{useCase.title}</h3>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                  {useCase.description}
                </p>
              </div>
              <div className="bg-white dark:bg-zinc-800/50 p-4 rounded-md border border-zinc-200 dark:border-zinc-700 min-h-[100px] flex flex-col justify-center">
                <useCase.illustration />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default UseCaseGrid;
