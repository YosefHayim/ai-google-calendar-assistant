"use client";

import { AnimatePresence, motion } from "framer-motion";

import { AIVoiceInput } from "@/components/ui/ai-voice-input";
import { Mic, PlayCircle } from "lucide-react";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { InteractiveOnboardingChecklist, type Step } from "@/components/ui/onboarding-checklist";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { usersClient } from "@/lib/api/client";
import confetti from "canvas-confetti";

export default function DashboardPage() {
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [agentName, setAgentName] = useState<string | null>(null);
  const [isLoadingAgentName, setIsLoadingAgentName] = useState(true);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

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

  const handleMicClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
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
      setOnboardingOpen(true);
    }
  }, []);

  const handleCompleteStep = (stepId: string) => {
    setCompletedSteps((prev) => new Set([...prev, stepId]));
  };

  const handleFinish = () => {
    // Fire confetti celebration
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    localStorage.setItem("cal-ai-onboarding-completed", "true");
    setOnboardingOpen(false);
  };

  const onboardingSteps: Step[] = [
    {
      id: "welcome",
      title: "Welcome to CAL AI",
      description: "Your intelligent calendar assistant powered by AI. Get started by exploring the dashboard.",
      targetSelector: "[data-onboard='heading']",
      completed: completedSteps.has("welcome"),
    },
    {
      id: "input",
      title: "Natural Language Input",
      description: "Type your calendar requests naturally. Try 'Schedule a meeting tomorrow at 2 PM' or 'What's on my calendar today?'",
      targetSelector: "[data-onboard='input']",
      completed: completedSteps.has("input"),
    },
    {
      id: "voice",
      title: "Voice Input",
      description: "Click the microphone button to use voice input for hands-free calendar management.",
      targetSelector: "[data-onboard='mic-button']",
      completed: completedSteps.has("voice"),
    },
  ];

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

  const completedCount = onboardingSteps.filter((step) => completedSteps.has(step.id)).length;
  const isOnboardingComplete = completedCount === onboardingSteps.length;

  return (
    <>
      <div className="h-[40rem] flex flex-col justify-center items-center px-4 relative">
        <h2 data-onboard="heading" className="mb-10 sm:mb-20 text-xl text-center sm:text-5xl dark:text-white text-black">
          {getHeadingText()}
        </h2>

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
              <div data-onboard="input">
                <PlaceholdersAndVanishInput
                  placeholders={placeholders}
                  onChange={handleChange}
                  onSubmit={onSubmit}
                  leftButton={
                    !isVoiceMode ? (
                      <motion.button
                        data-onboard="mic-button"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={handleMicClick}
                        className={cn(
                          "relative z-[100] h-8 w-8 rounded-full transition-all duration-200",
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
                    ) : undefined
                  }
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <InteractiveOnboardingChecklist
        steps={onboardingSteps}
        open={onboardingOpen}
        onOpenChange={setOnboardingOpen}
        onCompleteStep={handleCompleteStep}
        onFinish={handleFinish}
      />

      {!onboardingOpen && !isOnboardingComplete && (
        <div className="fixed bottom-4 right-4 z-40">
          <Button
            onClick={() => setOnboardingOpen(true)}
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group"
            size="icon"
          >
            {completedCount > 0 ? (
              <div className="flex items-center justify-center relative">
                <PlayCircle className="h-6 w-6" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary-foreground text-primary rounded-full flex items-center justify-center text-xs font-bold">
                  {completedCount}
                </div>
              </div>
            ) : (
              <PlayCircle className="h-6 w-6" />
            )}
          </Button>
        </div>
      )}
    </>
  );
}
