"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface RainbowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const RainbowButton = React.forwardRef<HTMLButtonElement, RainbowButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(
          "group relative inline-flex h-11 items-center justify-center rounded-lg px-8 text-sm font-semibold text-white",
          "overflow-hidden transition-all duration-300",
          "hover:scale-105 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-2">{children}</span>
        <motion.div
          className="absolute inset-0 rounded-lg"
          style={{
            background: "linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6, #ec4899, #ef4444, #f59e0b, #10b981, #3b82f6)",
            backgroundSize: "300% 100%",
          }}
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </motion.button>
    );
  }
);

RainbowButton.displayName = "RainbowButton";
