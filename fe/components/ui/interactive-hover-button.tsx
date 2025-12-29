
import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  Icon?: React.ReactNode;
  dotClassName?: string;
  hoverContentClassName?: string;
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Button", Icon, className, dotClassName, hoverContentClassName, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "group relative w-32 cursor-pointer overflow-hidden rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 text-center font-semibold text-zinc-900 dark:text-zinc-100 transition-all duration-300",
        className,
      )}
      {...props}
    >
      {/* Initial state text and icon */}
      <div className="relative z-10 flex items-center justify-center gap-2 translate-x-1 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
        {Icon && <div className="shrink-0">{Icon}</div>}
        <span className="whitespace-nowrap">{text}</span>
      </div>

      {/* Hover state content - top layer */}
      <div className={cn(
        "absolute inset-0 z-20 flex translate-x-12 items-center justify-center gap-2 text-white opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100",
        hoverContentClassName
      )}>
        <span className="whitespace-nowrap font-bold">{text}</span>
        <ArrowRight className="w-5 h-5" />
      </div>

      {/* Background expansion seed (The dot) */}
      <div 
        className={cn(
            "absolute left-[10%] top-1/2 -translate-y-1/2 h-2 w-2 scale-[1] rounded-full bg-primary transition-all duration-500 group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[2.5] group-hover:bg-primary z-0",
            dotClassName
        )}
        aria-hidden="true"
      />
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
