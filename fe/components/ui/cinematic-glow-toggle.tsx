
"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "framer-motion";

interface CinematicGlowToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export default function CinematicGlowToggle({
  checked,
  onChange,
  className,
}: CinematicGlowToggleProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-1 rounded-full bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 shadow-inner cursor-pointer transition-all duration-300",
        className
      )}
      onClick={() => onChange(!checked)}
    >
      {/* 'OFF' Label */}
      <span
        className={cn(
          "text-[10px] font-bold tracking-wider transition-colors duration-300 ml-2 select-none",
          !checked ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-300 dark:text-zinc-700"
        )}
      >
        OFF
      </span>

      {/* Switch Track */}
      <motion.div
        className="relative w-12 h-6 rounded-full shadow-inner overflow-hidden"
        initial={false}
        animate={{
          backgroundColor: checked ? "#f2630620" : "#27272a20",
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Switch Thumb */}
        <motion.div
          className="absolute top-1 left-1 w-4 h-4 rounded-full border border-white/20 shadow-lg z-10"
          initial={false}
          animate={{
            x: checked ? 24 : 0,
            backgroundColor: checked ? "#f26306" : "#71717a",
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          whileTap={{ scale: 0.9 }}
        >
          {/* Thumb Highlight (Gloss) */}
          <div className="absolute top-0.5 left-1 w-1.5 h-0.5 bg-white/40 rounded-full blur-[0.5px]" />
          
          {/* Active Glow */}
          {checked && (
             <motion.div 
               layoutId="glow"
               className="absolute inset-0 rounded-full bg-primary blur-md opacity-50 -z-10"
             />
          )}
        </motion.div>
      </motion.div>

      {/* 'ON' Label */}
      <span
        className={cn(
          "text-[10px] font-bold tracking-wider transition-colors duration-300 mr-2 select-none",
          checked
            ? "text-primary drop-shadow-[0_0_8px_rgba(242,99,6,0.4)]"
            : "text-zinc-300 dark:text-zinc-700"
        )}
      >
        ON
      </span>
    </div>
  );
}
