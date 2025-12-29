"use client"

import React from "react"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/ThemeProvider"

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div
      className={cn(
        "flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300",
        isDarkMode 
          ? "bg-zinc-950 border border-zinc-800" 
          : "bg-white border border-zinc-200",
        className
      )}
      onClick={toggleTheme}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          toggleTheme();
        }
      }}
    >
      <div className="flex justify-between items-center w-full">
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300",
            isDarkMode 
              ? "transform translate-x-0 bg-zinc-800" 
              : "transform translate-x-8 bg-zinc-200"
          )}
        >
          {isDarkMode ? (
            <Moon 
              className="w-4 h-4 text-white" 
              strokeWidth={1.5}
            />
          ) : (
            <Sun 
              className="w-4 h-4 text-zinc-700" 
              strokeWidth={1.5}
            />
          )}
        </div>
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300",
            isDarkMode 
              ? "bg-transparent" 
              : "transform -translate-x-8"
          )}
        >
          {isDarkMode ? (
            <Sun 
              className="w-4 h-4 text-zinc-500" 
              strokeWidth={1.5}
            />
          ) : (
            <Moon 
              className="w-4 h-4 text-zinc-900" 
              strokeWidth={1.5}
            />
          )}
        </div>
      </div>
    </div>
  )
}
