"use client";

import { ArrowRight, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface VanishInputProps {
  onSubmit?: (value: string) => void;
  onVoiceRecord?: (audioBlob: Blob) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showVoiceButton?: boolean;
}

export function VanishInput({
  onSubmit,
  onVoiceRecord,
  placeholder = "Start typing here...",
  disabled = false,
  className,
  showVoiceButton = true,
}: VanishInputProps) {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (input.length > 0) {
      setShowPlaceholder(false);
    } else {
      setShowPlaceholder(true);
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && onSubmit) {
      onSubmit(input.trim());
      setInput("");
      setShowPlaceholder(true);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (onVoiceRecord) {
          onVoiceRecord(audioBlob);
        }
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Microphone access denied. Please enable microphone permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const placeholders = [
    "Schedule a meeting tomorrow at 2 PM",
    "What's on my calendar today?",
    "Cancel my 3 PM meeting",
    "Add a reminder for Friday",
    "Show me next week's events",
  ];

  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);

  useEffect(() => {
    if (showPlaceholder && input.length === 0) {
      const interval = setInterval(() => {
        setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [showPlaceholder, input.length]);

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200" />
          <div className="relative bg-white/5 dark:bg-black/20 backdrop-blur-xl rounded-lg border border-white/10 dark:border-white/20 p-2 flex items-center gap-2">
            {showVoiceButton && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={disabled}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  isRecording
                    ? "bg-red-500/20 text-red-400"
                    : "bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground"
                )}
              >
                <Mic className="h-4 w-4" />
              </motion.button>
            )}

            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setShowPlaceholder(false)}
                onBlur={() => {
                  if (input.length === 0) {
                    setShowPlaceholder(true);
                  }
                }}
                placeholder={showPlaceholder ? placeholders[currentPlaceholder] : ""}
                disabled={disabled || isRecording}
                className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/50 text-sm md:text-base pr-12"
              />
              <AnimatePresence>
                {showPlaceholder && input.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute inset-0 flex items-center pointer-events-none"
                  >
                    <span className="text-muted-foreground/50 text-sm md:text-base">
                      {placeholders[currentPlaceholder]}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={disabled || !input.trim() || isRecording}
              className={cn(
                "p-2 rounded-full transition-all",
                input.trim() && !isRecording
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/50"
                  : "bg-white/5 text-muted-foreground cursor-not-allowed"
              )}
            >
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  );
}

