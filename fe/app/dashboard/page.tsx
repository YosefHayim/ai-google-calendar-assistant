"use client";

import { AnimatePresence, motion } from "framer-motion";

import { AIVoiceInput } from "@/components/ui/ai-voice-input";
import { Mic, PlayCircle, Calendar as CalendarIcon } from "lucide-react";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { InteractiveOnboardingChecklist, type Step } from "@/components/ui/onboarding-checklist";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { usersClient, agentClient, calendarClient } from "@/lib/api/client";
import confetti from "canvas-confetti";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { hasCompletedOnboarding, markOnboardingCompleted, isNewUser } from "@/lib/onboarding";
import { ANIMATIONS, TIMEOUTS } from "@/lib/constants";
import { Sidebar } from "@/components/sidebar";
import { useSidebar } from "@/hooks/use-sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import type { CalendarEvent as ApiCalendarEvent } from "@/lib/api/types";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { isOpen, isMobile } = useSidebar();
  const supabase = createClient();
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [agentName, setAgentName] = useState<string | null>(null);
  const [isLoadingAgentName, setIsLoadingAgentName] = useState(true);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentResponse, setAgentResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<
    Array<{ id?: string; summary?: string | null; start?: { date?: string; dateTime?: string }; end?: { date?: string; dateTime?: string } }>
  >([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

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
    setAgentResponse(null);
    setError(null);
  };

  const handleVoiceStop = async (duration: number, audioBlob?: Blob) => {
    setIsRecording(false);
    console.log("Recording stopped, duration:", duration);

    if (!audioBlob) {
      console.error("No audio blob received");
      setError("No audio recorded. Please try again.");
      setIsVoiceMode(false);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Send audio directly to backend - backend will transcribe and process
      console.log("Sending audio to backend agent...");
      const agentResponse = await agentClient.queryAgentWithAudio(audioBlob);

      if (agentResponse.error || !agentResponse.data?.response) {
        throw new Error(agentResponse.message || "Failed to process audio query");
      }

      setAgentResponse(agentResponse.data.response);
      console.log("Agent response:", agentResponse.data.response);
    } catch (err) {
      console.error("Error processing voice input:", err);
      setError(err instanceof Error ? err.message : "An error occurred while processing your request");
    } finally {
      setIsProcessing(false);
      // Return to chat mode after processing
      setIsVoiceMode(false);
    }
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

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        setLoadingEvents(true);
        const now = new Date();
        const timeMin = now.toISOString();
        const timeMax = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(); // Next 7 days

        const response = await calendarClient.getFilteredEvents({
          timeMin,
          timeMax,
          singleEvents: true,
          orderBy: "startTime",
          maxResults: 10,
        });

        if (response.data) {
          const events = (response.data as ApiCalendarEvent[]).map((event) => ({
            id: event.id,
            summary: event.summary,
            start: event.start,
            end: event.end,
          }));
          setCalendarEvents(events);
        }
      } catch (error) {
        console.error("Failed to fetch calendar events:", error);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchUpcomingEvents();
  }, []);

  // Check if user has completed onboarding and show onboarding for new users
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (authLoading) {
        return; // Wait for auth to load
      }

      setIsCheckingOnboarding(true);

      try {
        const userId = user?.id;
        const completed = await hasCompletedOnboarding(supabase, userId);

        if (!completed) {
          // Check if user is new (first time signing in)
          const newUser = await isNewUser(supabase, userId);

          // Show onboarding for new users or users who haven't completed it
          setOnboardingOpen(true);
        } else {
          setOnboardingOpen(false);
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        // On error, don't show onboarding to avoid annoying users
        setOnboardingOpen(false);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, [user, authLoading, supabase]);

  const handleCompleteStep = (stepId: string) => {
    setCompletedSteps((prev) => new Set([...prev, stepId]));
  };

  const handleFinish = async () => {
    // Fire confetti celebration (limited to 2-3 popups max)
    const { DEFAULTS, ORIGIN_RANGES, MAX_POPUPS, PARTICLE_COUNT } = ANIMATIONS.CONFETTI;
    const totalPopups = Math.min(MAX_POPUPS, 3); // Fire exactly 2-3 popups total
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    // Fire confetti popups with slight delays for visual effect
    // First popup - immediate
    confetti({
      ...DEFAULTS,
      particleCount: PARTICLE_COUNT,
      origin: { x: randomInRange(ORIGIN_RANGES.LEFT.min, ORIGIN_RANGES.LEFT.max), y: Math.random() + ORIGIN_RANGES.Y_OFFSET },
    });

    // Second popup - after delay
    if (totalPopups >= 2) {
      setTimeout(() => {
        confetti({
          ...DEFAULTS,
          particleCount: PARTICLE_COUNT,
          origin: { x: randomInRange(ORIGIN_RANGES.RIGHT.min, ORIGIN_RANGES.RIGHT.max), y: Math.random() + ORIGIN_RANGES.Y_OFFSET },
        });
      }, TIMEOUTS.CONFETTI_POPUP_DELAY);
    }

    // Third popup - after another delay (if max is 3)
    if (totalPopups >= 3) {
      setTimeout(() => {
        confetti({
          ...DEFAULTS,
          particleCount: PARTICLE_COUNT,
          origin: { x: randomInRange(ORIGIN_RANGES.LEFT.min, ORIGIN_RANGES.LEFT.max), y: Math.random() + ORIGIN_RANGES.Y_OFFSET },
        });
      }, TIMEOUTS.CONFETTI_POPUP_DELAY * 2);
    }

    // Mark onboarding as completed in user metadata
    if (user?.id) {
      await markOnboardingCompleted(supabase, user.id);
    }

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
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className={cn("flex-1 overflow-y-auto transition-all duration-300", !isMobile && isOpen && "ml-64")}>
        <div className="container mx-auto max-w-7xl space-y-6 p-6">
          {/* AI Chat Section */}
          <div className="h-[40rem] flex flex-col justify-center items-center px-4 relative">
            <h2 data-onboard="heading" className="mb-10 sm:mb-20 text-xl text-center sm:text-5xl dark:text-white text-black">
              {getHeadingText()}
            </h2>

            {/* Show agent response or error */}
            {(agentResponse || error) && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl mx-auto mt-4 p-4 rounded-lg border">
                {error ? (
                  <div className="text-red-600 dark:text-red-400">
                    <p className="font-semibold">Error:</p>
                    <p>{error}</p>
                  </div>
                ) : (
                  <div className="text-black dark:text-white">
                    <p className="font-semibold mb-2">Response:</p>
                    <p>{agentResponse}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Show processing indicator */}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full max-w-xl mx-auto mt-4 p-4 rounded-lg border border-gray-300 dark:border-gray-700"
              >
                <div className="flex items-center gap-2 text-black dark:text-white">
                  <div className="w-4 h-4 border-2 border-gray-600 dark:border-gray-400 border-t-transparent rounded-full animate-spin" />
                  <p>Processing your request...</p>
                </div>
              </motion.div>
            )}

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

          {/* Calendar Preview Section */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Upcoming Events</CardTitle>
                    <CardDescription>Your calendar for the next 7 days</CardDescription>
                  </div>
                  <Link href="/calendar">
                    <Button variant="outline" size="sm">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      View Full Calendar
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loadingEvents ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-4 h-4 border-2 border-gray-600 dark:border-gray-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : calendarEvents.length > 0 ? (
                  <div className="space-y-2">
                    {calendarEvents.slice(0, 5).map((event) => (
                      <div key={event.id} className="rounded-lg border p-3">
                        <h3 className="font-semibold">{event.summary || "Untitled Event"}</h3>
                        {event.start?.dateTime && (
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.start.dateTime).toLocaleString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                        {event.start?.date && (
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.start.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No upcoming events</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calendar Preview</CardTitle>
                <CardDescription>Quick view of your calendar</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar events={calendarEvents} />
              </CardContent>
            </Card>
          </div>
        </div>

        <InteractiveOnboardingChecklist
          steps={onboardingSteps}
          open={onboardingOpen}
          onOpenChange={(open) => {
            setOnboardingOpen(open);
            // If user manually closes onboarding without completing, don't auto-open again
            // They can still reopen it via the button if they want
          }}
          onCompleteStep={handleCompleteStep}
          onFinish={handleFinish}
        />

        {/* Only show the onboarding button if onboarding is not open, not complete, and user has completed onboarding check */}
        {!onboardingOpen && !isOnboardingComplete && !isCheckingOnboarding && (
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
      </main>
    </div>
  );
}
