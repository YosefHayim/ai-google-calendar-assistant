"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Calendar, MessageSquare, Smartphone, Zap, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Confetti, type ConfettiRef } from "@/components/ui/confetti";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  highlightElement?: "heading" | "input" | "mic" | "voice";
}

interface OnboardingWizardProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const confettiRef = useRef<ConfettiRef>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const micRef = useRef<HTMLButtonElement>(null);

  const steps: OnboardingStep[] = [
    {
      title: "Welcome to CAL AI",
      description: "Your intelligent calendar assistant powered by AI",
      icon: <Calendar className="w-8 h-8" />,
      highlightElement: "heading",
      content: (
        <div className="space-y-4 text-center">
          <p className="text-lg text-muted-foreground">
            Connect your Google Calendar and let AI manage your schedule effortlessly.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>✨ Natural language calendar operations</p>
            <p>🤖 Multi-agent orchestration system</p>
            <p>📱 Access from Telegram, WhatsApp, and Web</p>
          </div>
        </div>
      ),
    },
    {
      title: "Natural Language Processing",
      description: "Just talk to your calendar like a friend",
      icon: <MessageSquare className="w-8 h-8" />,
      highlightElement: "input",
      content: (
        <div className="space-y-4 text-center">
          <p className="text-lg text-muted-foreground">
            Our AI understands natural language. No need to learn complex commands.
          </p>
          <div className="space-y-3 text-left max-w-md mx-auto">
            <div className="p-3 rounded-lg bg-muted">
              <p className="font-medium">Try saying:</p>
              <p className="text-sm text-muted-foreground mt-1">
                "Schedule a meeting with John tomorrow at 2 PM"
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="font-medium">Or:</p>
              <p className="text-sm text-muted-foreground mt-1">
                "What's on my calendar today?"
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Telegram Integration",
      description: "Manage your calendar directly from Telegram",
      icon: <Smartphone className="w-8 h-8" />,
      content: (
        <div className="space-y-4 text-center">
          <p className="text-lg text-muted-foreground">
            Connect your Telegram account to access your calendar on the go.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>💬 Chat with your calendar assistant</p>
            <p>🎤 Send voice messages for hands-free scheduling</p>
            <p>🌍 Automatic language detection</p>
            <p>📅 Real-time calendar updates</p>
          </div>
        </div>
      ),
    },
    {
      title: "WhatsApp Integration",
      description: "Coming soon - Calendar access via WhatsApp",
      icon: <Zap className="w-8 h-8" />,
      content: (
        <div className="space-y-4 text-center">
          <p className="text-lg text-muted-foreground">
            WhatsApp integration is currently in development.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>🚀 Full calendar management via WhatsApp</p>
            <p>📱 Native WhatsApp interface</p>
            <p>🔔 Real-time notifications</p>
            <p className="text-xs text-muted-foreground/70 mt-4">
              Stay tuned for updates!
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Web Dashboard",
      description: "Voice & text input at your fingertips",
      icon: <Zap className="w-8 h-8" />,
      highlightElement: "mic",
      content: (
        <div className="space-y-4 text-center">
          <p className="text-lg text-muted-foreground">
            Use voice or text to interact with your calendar assistant.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>🎤 Click the microphone for voice input</p>
            <p>⌨️ Type naturally in the input field</p>
            <p>✨ Watch your requests vanish with style</p>
            <p>🤖 Get intelligent responses instantly</p>
          </div>
        </div>
      ),
    },
  ];

  // Get element positions for highlighting
  useEffect(() => {
    // This will be handled by the parent component passing refs
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Fire confetti celebration
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

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

    setTimeout(() => {
      onComplete();
    }, 500);
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  const [highlightedElement, setHighlightedElement] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const updateHighlight = () => {
      const element = steps[currentStep].highlightElement;
      if (!element) {
        setHighlightedElement(null);
        return;
      }
      
      let targetElement: HTMLElement | null = null;
      
      switch (element) {
        case "heading":
          targetElement = document.querySelector('h2[class*="text-5xl"]') as HTMLElement;
          break;
        case "input":
          targetElement = document.querySelector('form[class*="max-w-xl"]') as HTMLElement;
          break;
        case "mic":
          targetElement = document.querySelector('button[class*="rounded-full"][class*="ml-[0.5em]"]') as HTMLElement;
          break;
      }
      
      if (!targetElement) {
        setHighlightedElement(null);
        return;
      }
      
      const rect = targetElement.getBoundingClientRect();
      setHighlightedElement({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    };

    updateHighlight();
    window.addEventListener("resize", updateHighlight);
    window.addEventListener("scroll", updateHighlight);
    
    // Small delay to ensure DOM is ready
    const timeout = setTimeout(updateHighlight, 100);

    return () => {
      window.removeEventListener("resize", updateHighlight);
      window.removeEventListener("scroll", updateHighlight);
      clearTimeout(timeout);
    };
  }, [currentStep]);

  return (
    <>
      {/* Dark Overlay with Spotlight Effect */}
      <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm">
        {highlightedElement && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <mask id="spotlight-mask">
                <rect width="100%" height="100%" fill="black" />
                <rect
                  x={highlightedElement.left - 8}
                  y={highlightedElement.top - 8}
                  width={highlightedElement.width + 16}
                  height={highlightedElement.height + 16}
                  rx="8"
                  fill="white"
                />
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.7)"
              mask="url(#spotlight-mask)"
            />
          </svg>
        )}
        {highlightedElement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute border-2 border-primary rounded-lg shadow-lg"
            style={{
              top: highlightedElement.top - 8,
              left: highlightedElement.left - 8,
              width: highlightedElement.width + 16,
              height: highlightedElement.height + 16,
              boxShadow: "0 0 0 4px rgba(59, 130, 246, 0.2), 0 0 30px rgba(59, 130, 246, 0.3)",
            }}
          />
        )}
      </div>

      {/* Wizard Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <Confetti ref={confettiRef} className="absolute inset-0 pointer-events-none" manualstart />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl mx-4 bg-card border rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
        >
          {/* Close Button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-muted transition-colors bg-background/80 backdrop-blur-sm"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Progress Bar */}
          <div className="h-1.5 bg-muted">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Content */}
          <div className="p-8 md:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Icon with Arrow */}
                <div className="flex justify-center relative">
                  <div className="relative">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-4 rounded-full bg-primary/10 text-primary relative"
                    >
                      {steps[currentStep].icon}
                      {/* Arrow pointing from icon to dashboard element */}
                      {steps[currentStep].highlightElement && highlightedElement && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ 
                            opacity: [0.5, 1, 0.5],
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="absolute -right-16 top-1/2 -translate-y-1/2 text-primary z-10"
                        >
                          <ArrowRight className="w-8 h-8 drop-shadow-lg" />
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold">{steps[currentStep].title}</h2>
                  <p className="text-muted-foreground">{steps[currentStep].description}</p>
                </div>

                {/* Content */}
                <div className="min-h-[200px] flex items-center justify-center">
                  {steps[currentStep].content}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Step Indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {steps.map((_, index) => (
                <motion.div
                  key={index}
                  initial={false}
                  animate={{
                    width: index === currentStep ? 32 : index < currentStep ? 8 : 8,
                    opacity: index === currentStep ? 1 : index < currentStep ? 0.5 : 0.3,
                  }}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    index === currentStep
                      ? "bg-primary"
                      : index < currentStep
                        ? "bg-primary/50"
                        : "bg-muted"
                  )}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex gap-2">
                {currentStep < steps.length - 1 ? (
                  <Button onClick={handleNext}>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleComplete}>
                    Get Started
                    <Check className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
