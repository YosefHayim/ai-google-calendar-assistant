"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MessageLoadingProps {
  className?: string;
  variant?: "default" | "dots" | "pulse";
}

export function MessageLoading({ className, variant = "default" }: MessageLoadingProps) {
  if (variant === "dots") {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-2 h-2 rounded-full bg-blue-500"
            animate={{
              y: [0, -8, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <motion.div
          className="w-2 h-2 rounded-full bg-blue-500"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="w-2 h-2 rounded-full bg-indigo-500"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: 0.2,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="w-2 h-2 rounded-full bg-cyan-500"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: 0.4,
            ease: "easeInOut",
          }}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <motion.div
        className="h-2 w-2 rounded-full bg-blue-500"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          delay: 0,
        }}
      />
      <motion.div
        className="h-2 w-2 rounded-full bg-indigo-500"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          delay: 0.2,
        }}
      />
      <motion.div
        className="h-2 w-2 rounded-full bg-cyan-500"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          delay: 0.4,
        }}
      />
    </div>
  );
}

interface TypingIndicatorProps {
  className?: string;
  message?: string;
}

export function TypingIndicator({ className, message = "AI is thinking..." }: TypingIndicatorProps) {
  return (
    <div className={cn("flex items-start gap-3 p-4 bg-white/50 dark:bg-black/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10", className)}>
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
        <motion.div
          className="w-3 h-3 rounded-full bg-white"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
        />
      </div>
      <div className="flex-1">
        <p className="text-sm text-muted-foreground mb-2">{message}</p>
        <MessageLoading variant="dots" />
      </div>
    </div>
  );
}

