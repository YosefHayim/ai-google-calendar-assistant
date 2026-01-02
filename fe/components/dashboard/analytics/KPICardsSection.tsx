"use client";

import React from "react";
import { CalendarDays, Clock, BarChart3, Target } from "lucide-react";
import StatsCard from "./StatsCard";
import type { KPICardsSectionProps } from "@/types/analytics";

const KPICardsSection: React.FC<KPICardsSectionProps> = ({
  totalEvents,
  totalDurationHours,
  averageEventDuration,
  busiestDayHours,
  comparison,
  isLoading = false,
}) => {
  const totalEventsTrend = comparison?.trends.totalEvents;
  const totalDurationTrend = comparison?.trends.totalDuration;
  const avgEventTrend = comparison?.trends.avgEventDuration;
  const busiestDayTrend = comparison?.trends.busiestDay;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatsCard
        label="Total Events"
        value={totalEvents}
        previousValue={comparison?.previous.totalEvents}
        icon={CalendarDays}
        iconColor="text-sky-500"
        iconBg="bg-sky-50 dark:bg-sky-900/30"
        showTrend={!!totalEventsTrend}
        trendDirection={totalEventsTrend?.direction}
        trendPercentage={totalEventsTrend?.percentageChange}
        isLoading={isLoading}
      />
      <StatsCard
        label="Total Duration"
        value={totalDurationHours}
        previousValue={comparison?.previous.totalDurationHours}
        suffix="h"
        icon={Clock}
        iconColor="text-emerald-500"
        iconBg="bg-emerald-50 dark:bg-emerald-900/30"
        showTrend={!!totalDurationTrend}
        trendDirection={totalDurationTrend?.direction}
        trendPercentage={totalDurationTrend?.percentageChange}
        isLoading={isLoading}
      />
      <StatsCard
        label="Avg Event"
        value={averageEventDuration}
        previousValue={comparison?.previous.averageEventDuration}
        suffix="h"
        icon={BarChart3}
        iconColor="text-rose-500"
        iconBg="bg-rose-50 dark:bg-rose-900/30"
        showTrend={!!avgEventTrend}
        trendDirection={avgEventTrend?.direction}
        trendPercentage={avgEventTrend?.percentageChange}
        isLoading={isLoading}
      />
      <StatsCard
        label="Busiest Day"
        value={busiestDayHours}
        previousValue={comparison?.previous.busiestDayHours}
        suffix="h"
        icon={Target}
        iconColor="text-indigo-500"
        iconBg="bg-indigo-50 dark:bg-indigo-900/30"
        showTrend={!!busiestDayTrend}
        trendDirection={busiestDayTrend?.direction}
        trendPercentage={busiestDayTrend?.percentageChange}
        isLoading={isLoading}
      />
    </div>
  );
};

export default KPICardsSection;
