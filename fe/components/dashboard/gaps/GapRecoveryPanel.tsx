"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Sparkles,
  X,
  AlertCircle,
  Loader2,
  Settings,
  ArrowRight,
  Check,
  SkipForward,
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
  useGaps,
  useFillGap,
  useSkipGap,
  useDismissAllGaps,
} from "@/hooks/queries/gaps";
import type { GapCandidate } from "@/types/api";

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
  const confidenceColor =
    gap.confidence >= 0.8
      ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
      : gap.confidence >= 0.5
        ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20"
        : "text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800";

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:border-primary/50 transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {formatDate(gap.start)}
          </p>
          <p className="text-xs text-zinc-500">
            {formatTime(gap.start)} - {formatTime(gap.end)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
            {gap.durationFormatted}
          </span>
          {gap.confidence > 0 && (
            <span
              className={`text-xs font-medium px-2 py-1 rounded ${confidenceColor}`}
            >
              {Math.round(gap.confidence * 100)}%
            </span>
          )}
        </div>
      </div>

      {/* Context */}
      <div className="flex items-center gap-2 mb-3 text-xs text-zinc-500">
        {gap.precedingEventLink ? (
          <a
            href={gap.precedingEventLink}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate max-w-[100px] hover:text-primary hover:underline transition-colors"
          >
            {gap.precedingEventSummary || "Free time"}
          </a>
        ) : (
          <span className="truncate max-w-[100px]">
            {gap.precedingEventSummary || "Free time"}
          </span>
        )}
        <ArrowRight className="w-3 h-3 flex-shrink-0" />
        {gap.followingEventLink ? (
          <a
            href={gap.followingEventLink}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate max-w-[100px] hover:text-primary hover:underline transition-colors"
          >
            {gap.followingEventSummary || "Free time"}
          </a>
        ) : (
          <span className="truncate max-w-[100px]">
            {gap.followingEventSummary || "Free time"}
          </span>
        )}
      </div>

      {/* Suggestion */}
      {gap.suggestion && (
        <div className="flex items-start gap-2 mb-4 p-2 bg-primary/5 rounded-lg">
          <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            {gap.suggestion}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          onClick={() => onFill(gap)}
          size="sm"
          className="flex-1 bg-primary hover:bg-primary-hover text-white"
        >
          <Calendar className="w-4 h-4 mr-1" />
          Fill Gap
        </Button>
        <Button
          onClick={() => onSkip(gap.id)}
          size="sm"
          variant="outline"
          disabled={isSkipping}
          className="text-zinc-600"
        >
          {isSkipping ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <SkipForward className="w-4 h-4" />
          )}
        </Button>
      </div>
    </motion.div>
  );
};

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-zinc-100">
            Fill This Gap
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            Create an event to fill this gap in your calendar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Time info */}
          <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
            <Clock className="w-5 h-5 text-zinc-400" />
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {formatDateTime(gap.start)}
              </p>
              <p className="text-xs text-zinc-500">
                Duration: {gap.durationFormatted}
              </p>
            </div>
          </div>

          {/* Event name */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Event Name
            </label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="What would you like to do?"
              className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Location (optional) */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
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
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-zinc-200 dark:border-zinc-800"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(gap, summary, location || undefined)}
            disabled={!summary.trim() || isLoading}
            className="bg-primary hover:bg-primary-hover text-white"
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

export const GapRecoveryPanel: React.FC = () => {
  const [selectedGap, setSelectedGap] = useState<GapCandidate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { gaps, totalCount, analyzedRange, isLoading, isError, refetch } =
    useGaps({ limit: 10 });
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
    if (window.confirm("Are you sure you want to dismiss all gaps?")) {
      dismissAll();
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            Failed to load gaps
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (gaps.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
            No Gaps Found
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
            Your calendar looks well-organized! We'll notify you when we detect
            time gaps that could be filled.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Gap Recovery
          </h3>
          <p className="text-sm text-zinc-500">
            {totalCount} gap{totalCount !== 1 ? "s" : ""} found
            {analyzedRange && (
              <span className="text-zinc-400">
                {" "}
                ({analyzedRange.start} - {analyzedRange.end})
              </span>
            )}
          </p>
        </div>
        <Button
          onClick={handleDismissAll}
          variant="ghost"
          size="sm"
          disabled={isDismissing}
          className="text-zinc-500"
        >
          {isDismissing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <X className="w-4 h-4 mr-1" />
          )}
          Dismiss All
        </Button>
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
  );
};

export default GapRecoveryPanel;
