import React, { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/components/../lib/utils'
import { Button } from '@/components/ui/button'

// Changed to React.FC and made children optional to resolve "Property 'children' is missing" errors in consumers
const BentoGrid: React.FC<{
  children?: ReactNode
  className?: string
}> = ({ children, className }) => {
  return (
    <div
      className={cn('grid w-full auto-rows-[16rem] grid-cols-1 gap-4 md:auto-rows-[22rem] md:grid-cols-3', className)}
    >
      {children}
    </div>
  )
}

// Changed to React.FC to allow reserved props like 'key' when mapping over features
const BentoCard: React.FC<{
  name: string
  className: string
  background: ReactNode
  Icon: any
  description: string
  href: string
  cta: string
}> = ({ name, className, background, Icon, description, href, cta }) => (
  <div
    className={cn(
      'group relative col-span-1 flex flex-col justify-between overflow-hidden rounded-xl transition-all duration-300',
      // light styles
      'bg-background [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]',
      // dark styles
      'transform-gpu bg-secondary/50',
      className,
    )}
  >
    <div className="absolute inset-0 z-0">{background}</div>

    <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-4 transition-all duration-300 group-hover:-translate-y-10 md:p-6">
      <Icon className="h-8 w-8 origin-left transform-gpu text-foreground transition-all duration-300 ease-in-out group-hover:scale-75 md:h-12 md:w-12" />
      <h3 className="text-lg font-semibold text-foreground md:text-xl">{name}</h3>
      <p className="line-clamp-3 max-w-lg text-xs text-muted-foreground md:line-clamp-none md:text-sm">{description}</p>
    </div>

    <div
      className={cn(
        'pointer-events-none absolute bottom-0 z-20 flex w-full translate-y-10 transform-gpu flex-row items-center p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:p-4',
      )}
    >
      <Button
        variant="ghost"
        asChild
        size="sm"
        className="pointer-events-auto text-primary hover:bg-primary/10 hover:text-primary-hover"
      >
        <a href={href} className="flex items-center">
          {cta}
          <ArrowRight className="ml-2 h-4 w-4" />
        </a>
      </Button>
    </div>
    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-secondary/[.02] group-hover:bg-secondary/[.03]" />
  </div>
)

export { BentoCard, BentoGrid }
