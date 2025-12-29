"use client";

import React, { useState, useEffect } from "react";
import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIVoiceInputProps {
  onStart?: () => void;
  onStop?: (duration: number, transcribedText: string | null) => void;
  onInterimResult?: (text: string) => void;
  visualizerBars?: number;
  demoMode?: boolean;
  demoInterval?: number;
  className?: string;
  isRecordingProp: boolean; // Prop to control recording state from parent
  onToggleRecording: () => void; // Prop to signal parent to toggle recording
  speechRecognitionSupported: boolean;
  speechRecognitionError: string | null;
}

export function AIVoiceInput({
  onStart,
  onStop,
  onInterimResult,
  visualizerBars = 48,
  demoMode = false,
  demoInterval = 3000,
  className,
  isRecordingProp,
  onToggleRecording,
  speechRecognitionSupported,
  speechRecognitionError,
}: AIVoiceInputProps) {
  const [time, setTime] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isDemo, setIsDemo] = useState(demoMode);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Fix: Using ReturnType<typeof setInterval> instead of number to resolve NodeJS.Timeout type mismatch in hybrid environments
    let intervalId: ReturnType<typeof setInterval>;

    if (isRecordingProp) {
      onStart?.();
      intervalId = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    } else {
      // onStop is called by the parent with transcribed text
      setTime(0);
    }

    return () => clearInterval(intervalId);
  }, [isRecordingProp, onStart]); // Removed onStop from dependencies here as it's triggered by parent

  useEffect(() => {
    if (!isDemo) return;

    // Fix: Using ReturnType<typeof setTimeout> instead of number to resolve NodeJS.Timeout type mismatch in hybrid environments
    let timeoutId: ReturnType<typeof setTimeout>;
    const runAnimation = () => {
      onToggleRecording(); // Simulate start
      timeoutId = setTimeout(() => {
        onToggleRecording(); // Simulate stop
        onStop?.(demoInterval / 1000, "This is a demo transcription."); // Simulate transcription
        timeoutId = setTimeout(runAnimation, 1000);
      }, demoInterval);
    };

    const initialTimeout = setTimeout(runAnimation, 100);
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(initialTimeout);
    };
  }, [isDemo, demoInterval, onToggleRecording, onStop]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClick = () => {
    if (isDemo) {
      setIsDemo(false);
      onToggleRecording(); // Stop demo, start actual recording
    } else {
      onToggleRecording(); // Toggle actual recording
    }
  };

  const isButtonDisabled = !speechRecognitionSupported || !!speechRecognitionError;

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative max-w-xl w-full mx-auto flex items-center flex-col gap-2">
        <button
          className={cn(
            "group w-16 h-16 rounded-xl flex items-center justify-center transition-colors",
            isRecordingProp
              ? "bg-none" // No specific background when active, the spinner is the focus
              : "bg-none hover:bg-black/10 dark:hover:bg-white/10",
            isButtonDisabled && "opacity-50 cursor-not-allowed"
          )}
          type="button"
          onClick={handleClick}
          disabled={isButtonDisabled}
          aria-label={isRecordingProp ? "Stop recording" : "Start recording"}
        >
          {isRecordingProp ? (
            <div
              className="w-6 h-6 rounded-sm animate-spin bg-primary dark:bg-primary cursor-pointer pointer-events-auto"
              style={{ animationDuration: "3s" }}
            />
          ) : (
            <Mic className="w-6 h-6 text-black/70 dark:text-white/70" />
          )}
        </button>

        <span
          className={cn(
            "font-mono text-sm transition-opacity duration-300",
            isRecordingProp
              ? "text-black/70 dark:text-white/70"
              : "text-black/30 dark:text-white/30"
          )}
        >
          {formatTime(time)}
        </span>

        <div className="h-4 w-64 flex items-center justify-center gap-0.5">
          {[...Array(visualizerBars)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-0.5 rounded-full transition-all duration-300",
                isRecordingProp
                  ? "bg-primary/50 dark:bg-primary/50 animate-pulse"
                  : "bg-black/10 dark:bg-white/10 h-1"
              )}
              style={
                isRecordingProp && isClient
                  ? {
                      height: `${20 + Math.random() * 80}%`,
                      animationDelay: `${i * 0.05}s`,
                    }
                  : undefined
              }
            />
          ))}
        </div>

        <p className="h-4 text-xs text-black/70 dark:text-white/70">
          {speechRecognitionError ? (
            <span className="text-red-500">{speechRecognitionError}</span>
          ) : isRecordingProp ? (
            "Listening..."
          ) : (
            "Click to speak"
          )}
        </p>
      </div>
    </div>
  );
}
