"use client";

import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { calendarsService } from "@/lib/api/services/calendars.service";
import type { CreateCalendarDialogProps } from "@/types/analytics";

const CreateCalendarDialog: React.FC<CreateCalendarDialogProps> = ({ isOpen, onClose, onSuccess }) => {
  const [calendarPrompt, setCalendarPrompt] = useState("");
  const [isCreatingCalendar, setIsCreatingCalendar] = useState(false);
  const queryClient = useQueryClient();

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!calendarPrompt.trim()) {
      toast.error("Please enter a name for your calendar");
      return;
    }

    setIsCreatingCalendar(true);
    try {
      const response = await calendarsService.createCalendar({
        summary: calendarPrompt.trim(),
        description: `Created from Analytics Dashboard`,
      });

      if (response.status === "success") {
        toast.success("Calendar created successfully!");
        setCalendarPrompt("");
        queryClient.invalidateQueries({ queryKey: ["calendars-list"] });
        onSuccess?.();
        onClose();
      } else {
        toast.error(response.message || "Failed to create calendar");
      }
    } catch (error) {
      console.error("Error creating calendar:", error);
      toast.error("Failed to create calendar. Please try again.");
    } finally {
      setIsCreatingCalendar(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-xl max-w-md w-full relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">Create New Calendar</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Enter a name for your new calendar. It will be added to your Google Calendar account.</p>
        <input
          type="text"
          value={calendarPrompt}
          onChange={(e) => setCalendarPrompt(e.target.value)}
          placeholder="e.g., Work Projects, Personal Goals, Fitness"
          className="w-full p-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={isCreatingCalendar}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isCreatingCalendar && calendarPrompt.trim()) {
              e.preventDefault();
              handleCreate();
            }
          }}
        />
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => {
              onClose();
              setCalendarPrompt("");
            }}
            disabled={isCreatingCalendar}
            className="flex-1 px-4 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreatingCalendar}
            className="flex-1 px-4 py-2 rounded-md bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCreatingCalendar ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Calendar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCalendarDialog;
