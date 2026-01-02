"use client";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

import { Info } from "lucide-react";
import React from "react";
import type { TimeAllocationChartProps } from "@/types/analytics";
import { motion } from "framer-motion";

const DEFAULT_COLOR = "#6366f1";

const getValidColor = (color: string | undefined | null): string => {
  if (!color || typeof color !== "string") return DEFAULT_COLOR;
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
    return color;
  }
  return DEFAULT_COLOR;
};

const TimeAllocationChart: React.FC<TimeAllocationChartProps> = ({ data, onCalendarClick }) => {
  const totalHours = data.reduce((acc, item) => acc + item.hours, 0);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 22;
  let accumulatedPercentage = 0;

  if (totalHours === 0) {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm p-6 flex items-center justify-center h-full">
        <p className="text-zinc-500">No time allocation data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm p-6 flex flex-col xl:flex-row items-center gap-2">
      <div className="relative w-44 h-44 flex-shrink-0">
        <svg className="w-full h-full" viewBox="0 0 180 180">
          <circle cx="90" cy="90" r={radius} fill="transparent" stroke="currentColor" strokeWidth={strokeWidth} className="text-zinc-100 dark:text-zinc-800" />
          {data.map((item, index) => {
            const percentage = item.hours / totalHours;
            const dashArray = percentage * circumference;
            const rotation = accumulatedPercentage * 360;
            accumulatedPercentage += percentage;
            const safeColor = getValidColor(item.color);

            return (
              <motion.circle
                key={item.category}
                cx="90"
                cy="90"
                r={radius}
                fill="transparent"
                stroke={safeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="butt"
                strokeDasharray={circumference}
                style={{ transform: `rotate(${rotation - 90}deg)`, transformOrigin: "center" }}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - dashArray }}
                transition={{ duration: 1, delay: index * 0.15, ease: "easeOut" }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{totalHours.toFixed(1)}h</span>
          <span className="text-xs font-medium text-zinc-500">Tracked</span>
        </div>
      </div>
      <div className="w-full">
        <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
          Time Allocation
          <HoverCard>
            <HoverCardTrigger asChild>
              <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                <Info className="w-3 h-3" />
              </button>
            </HoverCardTrigger>
            <HoverCardContent>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Time Allocation</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Visual breakdown of how your time is distributed across different calendars. Each segment represents the total hours spent in that calendar
                  during the selected date range.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </h3>
        <ul className="space-y-2">
          {data.map((item) => {
            const safeColor = getValidColor(item.color);
            return (
              <li
                key={item.category}
                className={`border border-transparent hover:border-black hover:border flex items-center gap-3 text-sm rounded-md p-2 -m-2 transition-colors ${
                  onCalendarClick && item.calendarId ? "cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900/50" : ""
                }`}
                data-calendar-id={item.calendarId || ""}
                style={{ backgroundColor: `${safeColor}10` }}
                onClick={() => {
                  if (onCalendarClick && item.calendarId) {
                    onCalendarClick(item.calendarId, item.category, safeColor);
                  }
                }}
              >
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: safeColor }} />
                <span className="flex-1 font-medium text-zinc-800 dark:text-zinc-200 truncate">{item.category}</span>
                <span className="font-mono text-zinc-500 dark:text-zinc-400">{item.hours.toFixed(1)}h</span>
                <span className="text-xs text-zinc-400 w-10 text-right">{((item.hours / totalHours) * 100).toFixed(0)}%</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default TimeAllocationChart;
