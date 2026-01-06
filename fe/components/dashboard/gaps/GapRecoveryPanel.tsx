"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarPlus,
  Clock,
  MapPin,
  Sparkles,
  AlertCircle,
  Loader2,
  Check,
  EyeOff,
  RefreshCw,
  CalendarCheck,
  Info,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useGaps,
  useFillGap,
  useSkipGap,
  useDismissAllGaps,
} from "@/hooks/queries/gaps";
import type { GapCandidate, GapQueryParams } from "@/types/api";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";

// ============================================
// Gap Card Component
// ============================================

interface GapCardProps {
  gap: GapCandidate;
  onFill: (gap: GapCandidate) => void;
  onSkip: (gapId: string) => void;
  isSkipping: boolean;
}

const GapCard: React.FC<GapCardProps> = ({
  gap,
  onFill,
  onSkip,
  isSkipping,
}) => {
  const getConfidenceInfo = (confidence: number) => {
    if (confidence >= 0.8) {
      return {
        label: "High confidence",
        color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
        tooltip: "Ally is confident this is a genuine gap in your schedule",
      };
    }
    if (confidence >= 0.5) {
      return {
        label: "Medium confidence",
        color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
        tooltip: "This might be intentional free time - review before scheduling",
      };
    }
    return {
      label: "Low confidence",
      color: "text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700",
      tooltip: "This could be intentional - Ally is less certain about this gap",
    };
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const confidenceInfo = getConfidenceInfo(gap.confidence);

  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:border-primary/50 hover:shadow-md transition-all duration-200"
      >
        {/* Header with Date Badge */}
        <div className="px-4 pt-4 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-1 bg-primary/10 dark:bg-primary/20 rounded-md">
                <p className="text-xs font-semibold text-primary">
                  {formatDate(gap.start)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Duration Badge */}
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md">
                {gap.durationFormatted}
              </span>
              {/* Confidence Badge with Tooltip */}
              {gap.confidence > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-md border cursor-help flex items-center gap-1 ${confidenceInfo.color}`}
                    >
                      {Math.round(gap.confidence * 100)}%
                      <Info className="w-3 h-3" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px]">
                    <p className="font-medium">{confidenceInfo.label}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{confidenceInfo.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 space-y-4">
          {/* Time Slot Section */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
              Available Time Slot
            </p>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-400" />
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {formatTime(gap.start)} – {formatTime(gap.end)}
              </p>
            </div>
          </div>

          {/* Between Events Section */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
              Between Events
            </p>
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              {gap.precedingEventLink ? (
                <a
                  href={gap.precedingEventLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate max-w-[120px] hover:text-primary hover:underline transition-colors font-medium"
                >
                  {gap.precedingEventSummary || "Free time"}
                </a>
              ) : (
                <span className="truncate max-w-[120px] font-medium">
                  {gap.precedingEventSummary || "Free time"}
                </span>
              )}
              <span className="text-zinc-300 dark:text-zinc-600">→</span>
              {gap.followingEventLink ? (
                <a
                  href={gap.followingEventLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate max-w-[120px] hover:text-primary hover:underline transition-colors font-medium"
                >
                  {gap.followingEventSummary || "Free time"}
                </a>
              ) : (
                <span className="truncate max-w-[120px] font-medium">
                  {gap.followingEventSummary || "Free time"}
                </span>
              )}
            </div>
          </div>

          {/* AI Suggestion Section */}
          {gap.suggestion && (
            <div className="flex items-start gap-2.5 p-3 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 rounded-lg border border-primary/10">
              <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary/70 mb-0.5">
                  Ally's Suggestion
                </p>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  {gap.suggestion}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="px-4 pb-4 pt-2 flex items-center gap-2">
          <Button
            onClick={() => onFill(gap)}
            size="sm"
            className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium shadow-sm"
          >
            <CalendarPlus className="w-4 h-4 mr-1.5" />
            Schedule Event
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => onSkip(gap.id)}
                size="sm"
                variant="outline"
                disabled={isSkipping}
                className="text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                {isSkipping ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <EyeOff className="w-4 h-4 mr-1.5" />
                    Skip
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Ignore this gap for now</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

// ============================================
// Fill Gap Dialog Component
// ============================================

interface FillGapDialogProps {
  gap: GapCandidate | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (gap: GapCandidate, summary: string, location?: string) => void;
  isLoading: boolean;
}

const FillGapDialog: React.FC<FillGapDialogProps> = ({
  gap,
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) => {
  const [summary, setSummary] = useState(gap?.suggestion || "");
  const [location, setLocation] = useState("");

  React.useEffect(() => {
    if (gap) {
      setSummary(gap.suggestion || "");
      setLocation("");
    }
  }, [gap]);

  if (!gap) return null;

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatEndTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 dark:bg-primary/20">
              <CalendarPlus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-zinc-900 dark:text-zinc-100">
                Schedule New Event
              </DialogTitle>
              <DialogDescription className="text-zinc-500 text-sm">
                Fill this time slot with a new calendar event
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Time Slot Info */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
              Time Slot
            </p>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {formatDateTime(gap.start)} – {formatEndTime(gap.end)}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Duration: {gap.durationFormatted}
                </p>
              </div>
            </div>
          </div>

          {/* Event Name Input */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Event Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="What would you like to schedule?"
              className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              autoFocus
            />
          </div>

          {/* Location Input */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Location{" "}
              <span className="text-zinc-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add a location"
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(gap, summary, location || undefined)}
            disabled={!summary.trim() || isLoading}
            className="bg-primary hover:bg-primary/90 text-white shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Create Event
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// Main Gap Recovery Panel Component
// ============================================

export const GapRecoveryPanel: React.FC = () => {
  const [selectedGap, setSelectedGap] = useState<GapCandidate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const queryParams: GapQueryParams = {
    limit: 10,
    ...(dateRange?.from && {
      startDate: format(dateRange.from, "yyyy-MM-dd'T'00:00:00'Z'"),
    }),
    ...(dateRange?.to && {
      endDate: format(dateRange.to, "yyyy-MM-dd'T'23:59:59'Z'"),
    }),
  };

  const {
    gaps,
    totalCount,
    analyzedRange,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGaps(queryParams);
  const { mutate: fillGap, isPending: isFilling } = useFillGap();
  const {
    mutate: skipGap,
    isPending: isSkipping,
    variables: skippingVariables,
  } = useSkipGap();
  const { mutate: dismissAll, isPending: isDismissing } = useDismissAllGaps();

  const handleFillClick = (gap: GapCandidate) => {
    setSelectedGap(gap);
    setIsDialogOpen(true);
  };

  const handleConfirmFill = (
    gap: GapCandidate,
    summary: string,
    location?: string
  ) => {
    fillGap(
      {
        gapId: gap.id,
        data: { summary, location },
      },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          setSelectedGap(null);
        },
      }
    );
  };

  const handleSkip = (gapId: string) => {
    skipGap({ gapId });
  };

  const handleDismissAll = () => {
    if (window.confirm("Clear all gaps from this list?\n\nThey may reappear on the next calendar scan.")) {
      dismissAll();
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8">
        <div className="flex flex-col items-center justify-center h-48">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-sm text-zinc-500">Analyzing your calendar...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8">
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100 mb-2">
            Unable to Load Gaps
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 max-w-sm">
            We couldn't analyze your calendar. Please try again.
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Empty State
  if (gaps.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8">
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
            <CalendarCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
            All Caught Up!
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
            Your calendar looks well-organized. Ally will notify you when new time gaps are detected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-6">
        {/* Header Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                {totalCount} Available Time Slot{totalCount !== 1 ? "s" : ""}
              </h3>
              {analyzedRange && (
                <p className="text-sm text-zinc-500 mt-0.5">
                  Analyzed from {analyzedRange.start} to {analyzedRange.end}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => refetch()}
                    variant="outline"
                    size="sm"
                    disabled={isFetching}
                    className="border-zinc-200 dark:border-zinc-700"
                  >
                    {isFetching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Rescan calendar for gaps</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleDismissAll}
                    variant="outline"
                    size="sm"
                    disabled={isDismissing}
                    className="text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:text-red-600 hover:border-red-200 dark:hover:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    {isDismissing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-1.5" />
                        Clear All
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[200px]">
                  <p>Remove all gaps from this list</p>
                  <p className="text-xs text-zinc-500 mt-0.5">They may reappear on next scan</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
              Filter by Date Range
            </p>
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          </div>
        </div>

        {/* Gap List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {gaps.map((gap) => (
              <GapCard
                key={gap.id}
                gap={gap}
                onFill={handleFillClick}
                onSkip={handleSkip}
                isSkipping={isSkipping && skippingVariables?.gapId === gap.id}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Fill Dialog */}
        <FillGapDialog
          gap={selectedGap}
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setSelectedGap(null);
          }}
          onConfirm={handleConfirmFill}
          isLoading={isFilling}
        />
      </div>
    </TooltipProvider>
  );
};

export default GapRecoveryPanel;
