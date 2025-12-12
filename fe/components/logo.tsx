"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export function Logo({ className, size = "md", animated = true }: LogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <motion.div
      className={cn("flex items-center gap-2", className)}
      initial={animated ? { opacity: 0, scale: 0.8 } : false}
      animate={animated ? { opacity: 1, scale: 1 } : false}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className={cn(
          "relative rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center",
          sizeClasses[size]
        )}
        whileHover={animated ? { rotate: 5, scale: 1.1 } : false}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <motion.svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          className="p-2"
          initial={animated ? { rotate: -180 } : false}
          animate={animated ? { rotate: 0 } : false}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.path
            d="M 20 50 Q 30 30, 50 30 Q 70 30, 80 50 Q 70 70, 50 70 Q 30 70, 20 50"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            initial={animated ? { pathLength: 0 } : false}
            animate={animated ? { pathLength: 1 } : false}
            transition={{ duration: 1, delay: 0.2 }}
          />
          <motion.circle
            cx="50"
            cy="50"
            r="8"
            fill="white"
            initial={animated ? { scale: 0 } : false}
            animate={animated ? { scale: 1 } : false}
            transition={{ duration: 0.3, delay: 0.8 }}
          />
        </motion.svg>
      </motion.div>
      <motion.span
        className={cn(
          "font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent",
          textSizes[size]
        )}
        initial={animated ? { opacity: 0, x: -10 } : false}
        animate={animated ? { opacity: 1, x: 0 } : false}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        CAL AI
      </motion.span>
    </motion.div>
  );
}

