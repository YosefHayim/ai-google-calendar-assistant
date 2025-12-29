import React from 'react';
import { cn } from '@/lib/utils';
import { PatternPlaceholder } from '@/components/PatternPlaceholder';

interface BackgroundPattern1Props {
  className?: string;
  children?: React.ReactNode;
}

const BackgroundPattern1 = ({ className, children }: BackgroundPattern1Props) => {
  return (
    <section className={cn("relative min-h-screen w-full overflow-hidden bg-white dark:bg-[#030303]", className)}>
      <PatternPlaceholder />
      {/* Top Primary Radial Background Pattern */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(125% 125% at 50% 10%, rgba(255,255,255,0) 40%, rgba(99,102,241,0.05) 100%)",
        }}
      />
      {/* Content for the hero section, positioned on top of the background */}
      <div className="relative z-10 w-full pt-48 pb-32 flex flex-col items-center">
        {children}
      </div>
    </section>
  );
};

export { BackgroundPattern1 };