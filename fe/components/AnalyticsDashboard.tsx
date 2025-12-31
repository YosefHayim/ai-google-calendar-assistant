'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Clock,
  Briefcase,
  TrendingUp,
  ListChecks,
  CalendarDays,
  Zap,
  Coffee,
  Dumbbell,
  Users,
  ChevronDown,
  Brain,
  ZapOff,
  Target,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import TimeSavedChart from '@/components/TimeSavedChart';
import ActivityHeatmap from '@/components/ActivityHeatmap';
import {
  Skeleton,
  SkeletonCard,
  SkeletonChart,
  SkeletonDonutChart,
  SkeletonList,
  SkeletonCalendarSources,
  SkeletonInsightCard,
  SkeletonHeatmap
} from '@/components/ui/skeleton';

interface TimeAllocationChartProps {
  data: { category: string; hours: number; color: string }[];
}

const TimeAllocationChart: React.FC<TimeAllocationChartProps> = ({ data }) => {
  const totalHours = data.reduce((acc, item) => acc + item.hours, 0);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 22;
  let accumulatedPercentage = 0;

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm p-6 flex flex-col xl:flex-row items-center gap-6 h-full">
      <div className="relative w-44 h-44 flex-shrink-0">
        <svg className="w-full h-full" viewBox="0 0 180 180">
          <circle cx="90" cy="90" r={radius} fill="transparent" stroke="currentColor" strokeWidth={strokeWidth} className="text-zinc-100 dark:text-zinc-800" />
          {data.map((item, index) => {
            const percentage = item.hours / totalHours;
            const dashArray = percentage * circumference;
            const rotation = accumulatedPercentage * 360;
            accumulatedPercentage += percentage;

            return (
              <motion.circle
                key={item.category}
                cx="90"
                cy="90"
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeLinecap="butt"
                strokeDasharray={circumference}
                style={{ transform: `rotate(${rotation - 90}deg)`, transformOrigin: 'center' }}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - dashArray }}
                transition={{ duration: 1, delay: index * 0.15, ease: 'easeOut' }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{totalHours}h</span>
            <span className="text-xs font-medium text-zinc-500">Tracked</span>
        </div>
      </div>
      <div className="w-full">
         <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-4">Time Allocation</h3>
         <ul className="space-y-2">
          {data.map((item) => (
            <li key={item.category} className="flex items-center gap-3 text-sm">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="flex-1 font-medium text-zinc-800 dark:text-zinc-200">{item.category}</span>
              <span className="font-mono text-zinc-500 dark:text-zinc-400">{item.hours}h</span>
              <span className="text-xs text-zinc-400 w-10 text-right">{((item.hours / totalHours) * 100).toFixed(0)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

interface InsightCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  description: string;
  color: 'amber' | 'sky' | 'emerald' | 'rose' | 'indigo' | 'orange';
}

const InsightCard: React.FC<InsightCardProps> = ({ icon: Icon, title, value, description, color }) => {
    const colorClasses = {
        amber: { bg: 'bg-amber-100/50 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-500' },
        sky: { bg: 'bg-sky-100/50 dark:bg-sky-900/30', text: 'text-sky-600 dark:text-sky-500' },
        emerald: { bg: 'bg-emerald-100/50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-500' },
        rose: { bg: 'bg-rose-100/50 dark:bg-rose-900/30', text: 'text-rose-600 dark:text-rose-500' },
        indigo: { bg: 'bg-indigo-100/50 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-500' },
        orange: { bg: 'bg-orange-100/50 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-500' },
    };
    const selectedColor = colorClasses[color] || colorClasses.amber;

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm p-6 flex flex-col gap-4 transition-all hover:shadow-md hover:-translate-y-1">
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 flex items-center justify-center rounded-md shrink-0 ${selectedColor.bg} ${selectedColor.text}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-zinc-600 dark:text-zinc-400 text-sm">{title}</h3>
            </div>
            <div>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
                <p className="text-sm text-zinc-500 leading-relaxed font-medium">{description}</p>
            </div>
        </div>
    );
};


interface AnalyticsDashboardProps {
  isLoading?: boolean;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ isLoading: isLoadingProp }) => {
  // Simulate initial loading state if no prop is provided (for demonstration)
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching delay - remove this when using real API
    const timer = setTimeout(() => setIsInitialLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const isLoading = isLoadingProp ?? isInitialLoading;

  const mainStats = [
    { label: 'Deep Work Ratio', value: '68%', icon: Brain, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-900/30' },
    { label: 'Context Switches', value: '12', icon: ZapOff, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/30' },
    { label: 'Peak Performance', value: '9-11am', icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
  ];

  const timeAllocationData = [
    { category: 'Deep Focus', hours: 45, color: '#f26306' },
    { category: 'Client Meetings', hours: 15, color: '#1489b4' },
    { category: 'Internal Ops', hours: 20, color: '#2d9663' },
    { category: 'Strategic Planning', hours: 12, color: '#6366f1' },
    { category: 'Admin/Email', hours: 8, color: '#64748b' },
  ];
  
  const weeklyInsights = [
    {
      icon: Zap,
      title: "Focus Velocity",
      value: "+15%",
      description: "Your deep work output increased this week.",
      color: "amber" as const,
    },
    {
      icon: Users,
      title: "Collaborative Load",
      value: "14h",
      description: "Balanced ratio of talk vs. execution time.",
      color: "sky" as const,
    },
    {
      icon: Coffee,
      title: "Refocus Window",
      value: "22 min",
      description: "Avg. time to resume focus after meetings.",
      color: "emerald" as const,
    },
    {
      icon: BarChart3,
      title: "Task Completion",
      value: "92%",
      description: "Nearly perfect hit rate on scheduled tasks.",
      color: "indigo" as const,
    }
  ];

  const timeSavedData = Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    hours: 1 + Math.sin(i / 4) * 1.5 + Math.random() * 1 + i * 0.15,
  })).map(d => ({...d, hours: Math.max(0, d.hours)}));

  const recentActivities = [
    { action: 'Auto-blocked Friday PM focus', time: '1h ago', icon: Brain },
    { action: 'Condensed Monday morning syncs', time: '3h ago', icon: Zap },
    { action: 'Resolved Q4 strategy overlap', time: 'Yesterday', icon: Briefcase },
    { action: 'Summarized 3 board calls', time: 'Yesterday', icon: ListChecks },
  ];

  const connectedCalendars = [
    { name: 'Executive Main', color: 'bg-primary', status: 'Primary' },
    { name: 'Client Facing', color: 'bg-sky-500', status: 'Active' },
    { name: 'Personal/Health', color: 'bg-emerald-500', status: 'Private' },
    { name: 'Advisory Board', color: 'bg-purple-500', status: 'Synced' },
  ];

  // Loading skeleton state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto w-full p-6 animate-in fade-in duration-500 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-40 rounded-md" />
            <Skeleton className="h-9 w-36 rounded-md" />
          </div>
        </header>

        {/* Cognitive Metrics Row Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend Analysis Skeleton */}
          <div className="lg:col-span-3">
            <SkeletonChart />
          </div>

          {/* Intelligence Insights Skeleton */}
          <div className="lg:col-span-3">
            <Skeleton className="h-6 w-48 mb-6 ml-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonInsightCard key={i} />
              ))}
            </div>
          </div>

          {/* Time Mix Skeleton */}
          <div className="lg:col-span-2">
            <SkeletonDonutChart />
          </div>

          {/* Ops & Calendars Skeleton */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <SkeletonList items={4} className="flex-1" />
            <SkeletonCalendarSources items={4} />
          </div>

          {/* Long term heatmap Skeleton */}
          <div className="lg:col-span-3 mt-4">
            <SkeletonHeatmap />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full p-6 animate-in fade-in duration-500 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium text-zinc-900 dark:text-zinc-100 tracking-tight">Intelligence</h1>
          <p className="text-zinc-500 font-medium">Quantifying your executive leverage.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative group">
            <select className="bg-white dark:bg-zinc-900 p-2 px-3 pr-8 rounded-md text-xs font-bold border border-zinc-300 dark:border-zinc-800 outline-none appearance-none text-zinc-900 dark:text-zinc-100 hover:border-zinc-400 transition-colors shadow-sm">
                <option value="7d">Last 7 Days (Weekly)</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="all">All Time</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 dark:text-zinc-400 pointer-events-none" />
          </div>
          <button className="bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 p-2 px-4 rounded-md text-xs font-bold hover:opacity-90 transition-opacity shadow-sm">Export Intelligence</button>
        </div>
      </header>

      {/* Cognitive Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {mainStats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md p-6 shadow-sm transition-all hover:border-primary/30">
            <div className={`w-10 h-10 rounded-md ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{stat.value}</p>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Analysis */}
        <div className="lg:col-span-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm p-6">
            <div className="mb-6">
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 text-lg"><TrendingUp className="w-5 h-5 text-primary"/> Leverage Gain</h3>
                <p className="text-xs text-zinc-500 font-medium italic">Measuring the time Ally returned to your deep work pool.</p>
            </div>
            <div className="h-64">
                <TimeSavedChart data={timeSavedData} />
            </div>
        </div>

        {/* Intelligence Insights */}
        <div className="lg:col-span-3">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 px-2">Performance Intelligence</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {weeklyInsights.map((insight) => (
              <InsightCard key={insight.title} {...insight} />
            ))}
          </div>
        </div>

        {/* Time Mix */}
        <div className="lg:col-span-2">
            <TimeAllocationChart data={timeAllocationData} />
        </div>

        {/* Ops & Calendars */}
        <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm p-6 flex-1">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2"><ListChecks className="w-4 h-4 text-zinc-400"/> Recent Operations</h3>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded">Real-time</span>
                </div>
                <ul className="space-y-4">
                  {recentActivities.map((activity, i) => (
                    <li key={i} className="flex items-start gap-3 group">
                      <div className="w-8 h-8 rounded-md bg-zinc-100 dark:bg-zinc-900 group-hover:bg-primary/10 transition-colors flex items-center justify-center text-zinc-500 group-hover:text-primary shrink-0 mt-0.5">
                        <activity.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{activity.action}</p>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase">{activity.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
            </div>

            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm p-6">
                <div className="mb-6">
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2"><CalendarDays className="w-4 h-4 text-zinc-400"/> Managed Sources</h3>
                </div>
                <div className="space-y-3">
                  {connectedCalendars.map((calendar, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 group">
                      <div className={`w-2.5 h-2.5 rounded-full ${calendar.color} shadow-sm group-hover:scale-125 transition-transform`} />
                      <span className="flex-1 text-sm font-bold text-zinc-800 dark:text-zinc-200">{calendar.name}</span>
                      <span className="text-[9px] font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 uppercase tracking-tighter">
                        {calendar.status}
                      </span>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-2 rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900/30 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all active:scale-[0.98]">
                  + Add Data Source
                </button>
            </div>
        </div>

        {/* Long term heatmap */}
        <div className="lg:col-span-3 mt-4">
            <ActivityHeatmap />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;