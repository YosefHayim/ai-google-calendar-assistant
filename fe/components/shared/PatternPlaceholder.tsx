import React from 'react'
import { cn } from '@/lib/utils'

interface PatternPlaceholderProps {
  className?: string
}

export const PatternPlaceholder = ({ className }: PatternPlaceholderProps) => {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 z-0 opacity-10', className)}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zm0 16v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0 16v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0 16v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zm0-30V0H4v4H0v2h4v4h2V6h4V4H6zm0 16v-4H4v4H0v2h4v4h2v-4h4v-2H6zm0 16v-4H4v4H0v2h4v4h2v-4h4v-2H6zm0 16v-4H4v4H0v2h4v4h2v-4h4v-2H6zM42 2v-2h-2v2h-4v2h4v4h2V4h4V2h-4zm0 16v-2h-2v2h-4v2h4v4h2v-4h4v-2h-4zm0 16v-2h-2v2h-4v2h4v4h2v-4h4v-2h-4zm0 16v-2h-2v2h-4v2h4v4h2v-4h4v-2h-4zm0 16v-2h-2v2h-4v2h4v4h2v-4h4v-2h-4zM12 2v-2h-2v2h-4v2h4v4h2V4h4V2h-4zm0 16v-2h-2v2h-4v2h4v4h2v-4h4v-2h-4zm0 16v-2h-2v2h-4v2h4v4h2v-4h4v-2h-4zm0 16v-2h-2v2h-4v2h4v4h2v-4h4v-2h-4zm0 16v-2h-2v2h-4v2h4v4h2v-4h4v-2h-4zm42 0v-2h-2v2h-4v2h4v4h2v-4h4v-2h-4zm0-16v-2h-2v2h-4v2h4v4h2v-4h4v-2h-4zm0-16v-2h-2v2h-4v2h4v4h2v-4h4v-2h-4zm0-16v-2h-2v2h-4v2h4v4h2V4h4V2h-4zm0-16v-2h-2v2h-4v2h4v4h2V4h4V2h-4zm-6 0v-2h-2v2h-4v2h4v4h2V4h4V2h-4zm0 16v-2h-2v2h-4v2h4v4h2v-4h4v-2h-4zm0 16v-2h-2v2h-4v2h4v4h2v-4h4v-2h-4zm0 16v-2h-2v2h-4v2h4v4h2v-4h4v-2h-4zm0 16v-2h-2v2h-4v2h4v4h2v-4h4v-2h-4zM24 2v-2h-2v2h-4v2h4v4h2V4h4V2h-4zm0 16v-2h-2v2h-4v2h4v4h2v-4h4v-2h-4zm0 16v-2h-2v2h-4v2h4v4h2v-4h4v-2h-4zm0 16v-2h-2v2h-4v2h4v4h2v-4h4v-2h-4zm0 16v-2h-2v2h-4v2h4v4h2v-4h4v-2h-4zm30 0v-2h-2v2h-4v2h4v4h2v-4h4v-2h-4zm0-16v-2h-2v2h-4v2h4v4h2v-4h4v-2h-4zm0-16v-2h-2v2h-4v2h4v4h2v-4h4v-2h-4zm0-16v-2h-2v2h-4v2h4v4h2V4h4V2h-4zm0-16v-2h-2v2h-4v2h4v4h2V4h4V2h-4zM30 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zm0 16v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0 16v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0 16v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM0 0v2h2v4h4v2h-4v4H0v-2h-2V6h2V0zm0 16v2h2v4h4v2h-4v4H0v-2h-2v-4h2v-4zm0 16v2h2v4h4v2h-4v4H0v-2h-2v-4h2v-4zm0 16v2h2v4h4v2h-4v4H0v-2h-2v-4h2v-4zm0 16v2h2v4h4v2h-4v4H0v-2h-2v-4h2v-4' fill='%23000000' fill-opacity='0.05'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '30px 30px',
      }}
    />
  )
}
