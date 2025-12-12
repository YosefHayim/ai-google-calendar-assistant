/**
 * Error Message Component
 * Displays authentication errors in a consistent format
 */

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  error: string | null;
  className?: string;
}

export function ErrorMessage({ error, className }: ErrorMessageProps) {
  if (!error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "p-4 rounded-full text-sm text-center",
        "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
        "border border-red-200 dark:border-red-800",
        className
      )}
    >
      {error}
    </motion.div>
  );
}
