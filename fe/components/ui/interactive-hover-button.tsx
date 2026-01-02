import { AnimatePresence, motion } from "framer-motion";

import { ArrowRight } from "lucide-react";
import React from "react";
import { cn } from "../../lib/utils";

interface InteractiveHoverButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  loadingText?: string;
  isLoading?: boolean;
  Icon?: React.ReactNode;
  dotClassName?: string;
  hoverContentClassName?: string;
}

/**
 * A minimalist, high-frequency loading indicator that mimics a data handshake.
 */
const ProtocolLoader = () => (
  <div className="relative flex items-center justify-center w-5 h-5">
    <motion.div className="absolute inset-0 border-2 border-white/20 rounded-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
    <motion.div
      className="absolute inset-0 border-2 border-t-white rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
    />
    <motion.div
      className="w-1 h-1 bg-white rounded-full"
      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1, repeat: Infinity }}
    />
  </div>
);

const InteractiveHoverButton = React.forwardRef<HTMLButtonElement, InteractiveHoverButtonProps>(
  ({ text = "Button", loadingText, isLoading = false, Icon, className, dotClassName, hoverContentClassName, ...props }, ref) => {
    const currentText = isLoading && loadingText ? loadingText : text;

    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(
          "group relative w-32 cursor-pointer overflow-hidden rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 text-center font-semibold text-zinc-900 dark:text-zinc-100 transition-all duration-300",
          isLoading && "cursor-wait border-primary/50",
          className
        )}
        {...props}
      >
        {/* Initial state text and icon */}
        <div
          className={cn(
            "relative z-10 flex items-center justify-center gap-2 translate-x-1 transition-all duration-300",
            isLoading ? "opacity-0 -translate-y-4" : "group-hover:translate-x-12 group-hover:opacity-0"
          )}
        >
          {Icon && <div className="shrink-0">{Icon}</div>}
          <span className="whitespace-nowrap">{text}</span>
        </div>

        {/* Hover/Loading state content */}
        <div
          className={cn(
            "absolute inset-0 z-20 flex items-center justify-center gap-2 text-white transition-all duration-300",
            isLoading ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
            hoverContentClassName
          )}
        >
          <span className="whitespace-nowrap font-bold tracking-tight">{currentText}</span>
          <div className="shrink-0">{isLoading ? <ProtocolLoader /> : Icon ? Icon : <ArrowRight className="w-5 h-5" />}</div>
        </div>

        {/* Shimmer Effect for Loading */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 z-10 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
            />
          )}
        </AnimatePresence>

        {/* Background expansion seed (The dot) */}
        <div
          className={cn(
            "absolute left-[10%] top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary transition-all duration-500 z-0",
            isLoading
              ? "left-0 top-0 h-full w-full scale-[2.5] bg-primary opacity-100"
              : "group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[2.5] group-hover:bg-primary",
            dotClassName
          )}
          aria-hidden="true"
        />
      </button>
    );
  }
);

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
