import React from 'react'
import { cn } from '@/lib/utils'
import { PatternPlaceholder } from '@/components/shared/PatternPlaceholder'

interface BackgroundPattern1Props {
  className?: string
  children?: React.ReactNode
}

const BackgroundPattern1 = ({ className, children }: BackgroundPattern1Props) => {
  return (
    <section className={cn('relative min-h-screen w-full overflow-hidden bg-background', className)}>
      <PatternPlaceholder />
      {/* Top Primary Radial Background Pattern */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(125% 125% at 50% 10%, rgba(255,255,255,0) 40%, rgba(99,102,241,0.05) 100%)',
        }}
      />
      {/* Content for the hero section, positioned on top of the background */}
      <div className="relative z-10 flex w-full flex-col items-center pb-32 pt-48">{children}</div>
    </section>
  )
}

export { BackgroundPattern1 }
