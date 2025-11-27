"use client";

import { AnimatePresence, motion } from "framer-motion";

import { AIVoiceInput } from "@/components/ui/ai-voice-input";
import { Mic } from "lucide-react";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { OnboardingWizard } from "@/components/ui/onboarding-wizard";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { usersClient } from "@/lib/api/client";

export default function DashboardPage() {
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [agentName, setAgentName] = useState<string | null>(null);
  const [isLoadingAgentName, setIsLoadingAgentName] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const placeholders = [
    "What's the first rule of Fight Club?",
    "Who is Tyler Durden?",
    "Where is Andrew Laeddis Hiding?",
    "Write a Javascript method to reverse a string",
    "How to assemble your own PC?",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submitted");
  };

  const handleVoiceStart = () => {
    setIsRecording(true);
  };

  const handleVoiceStop = (duration: number) => {
    setIsRecording(false);
    console.log("Recording stopped, duration:", duration);
    // Return to chat mode when recording stops
    setIsVoiceMode(false);
  };

  const handleMicClick = () => {
    setIsVoiceMode(true);
  };

  useEffect(() => {
    const fetchAgentName = async () => {
      try {
        setIsLoadingAgentName(true);
        const response = await usersClient.getAgentName();
        if (response.data?.agent_name) {
          setAgentName(response.data.agent_name);
        }
      } catch (error) {
        console.error("Failed to fetch agent name:", error);
      } finally {
        setIsLoadingAgentName(false);
      }
    };

    fetchAgentName();
  }, []);

  // Check if user has completed onboarding
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem("cal-ai-onboarding-completed");
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem("cal-ai-onboarding-completed", "true");
    setShowOnboarding(false);
  };

  // Generate the heading text based on agent name
  const getHeadingText = () => {
    if (isLoadingAgentName) {
      return "Ask CAL AI Anything";
    }
    if (agentName) {
      return `Ask ${agentName} Anything`;
    }
    return "Ask CAL AI Anything";
  };

  return (
    <>
      {showOnboarding && (
        <OnboardingWizard
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingComplete}
        />
      )}
      <div className="h-[40rem] flex flex-col justify-center items-center px-4 relative">
        <h2 className="mb-10 sm:mb-20 text-xl text-center sm:text-5xl dark:text-white text-black">{getHeadingText()}</h2>

      {/* Toggle between Chat and Voice Input */}
      <AnimatePresence mode="wait">
        {isVoiceMode ? (
          <motion.div
            key="voice"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <AIVoiceInput onStart={handleVoiceStart} onStop={handleVoiceStop} visualizerBars={48} autoStart={true} />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full relative max-w-xl mx-auto"
          >
            {/* Microphone Icon Button - Overlapping the right edge of input */}
            <AnimatePresence>
              {!isVoiceMode && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={handleMicClick}
                  className={cn(
                    "relative ml-[0.5em] z-50",
                    "h-8 w-8 rounded-full transition-all duration-200",
                    "bg-black dark:bg-zinc-900 hover:bg-black/90 dark:hover:bg-zinc-800",
                    "flex items-center justify-center",
                    "border border-white/20",
                    "shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),_0px_1px_0px_0px_rgba(25,28,33,0.02),_0px_0px_0px_1px_rgba(25,28,33,0.08)]"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Mic className="w-4 h-4 text-white" />
                </motion.button>
              )}
            </AnimatePresence>
            <PlaceholdersAndVanishInput placeholders={placeholders} onChange={handleChange} onSubmit={onSubmit} />
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </>
  );
}
