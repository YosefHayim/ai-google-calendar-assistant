'use client'

import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type LoaderSize = 'xs' | 'sm' | 'md' | 'lg'

const sizeClasses: Record<LoaderSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
}

interface InlineLoaderProps {
  size?: LoaderSize
  className?: string
  label?: string
}

export function InlineLoader({ size = 'md', className, label }: InlineLoaderProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Loader2 className={cn(sizeClasses[size], 'animate-spin')} />
      {label && <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>}
    </span>
  )
}

interface ButtonLoaderProps {
  size?: LoaderSize
  className?: string
}

export function ButtonLoader({ size = 'sm', className }: ButtonLoaderProps) {
  return <Loader2 className={cn(sizeClasses[size], 'animate-spin', className)} />
}

interface FullPageLoaderProps {
  label?: string
}

export function FullPageLoader({ label = 'Loading...' }: FullPageLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  )
}
