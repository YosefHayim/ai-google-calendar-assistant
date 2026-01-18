import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/components/../lib/utils' // Adjusted import path

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-white',
        secondary: 'border-transparent bg-accent dark:bg-zinc-700 text-foreground dark:text-primary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  // Fix: Explicitly declare className and variant as optional to help TypeScript
  // with inference, even though they should be inherited from extended types.
  className?: string
  variant?: VariantProps<typeof badgeVariants>['variant']
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(({ className, variant, ...props }, ref) => {
  return <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
})
Badge.displayName = 'Badge'

export { Badge, badgeVariants }
