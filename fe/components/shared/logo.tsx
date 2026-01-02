import Image from 'next/image'
import React from 'react'

/**
 * AllyLogo component using an inline SVG to ensure perfect visibility
 * and zero external dependencies for the brand mark.
 */
export const AllyLogo = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <Image src="/logo.png" alt="Ally Logo" width={40} height={40} className={className} />
)

export const BetaBadge = () => (
  <span className="bg-primary/10 text-primary text-[6px] font-bold px-1.5 py-0.5 rounded-sm ml-1.5 uppercase tracking-wider self-center border border-primary/20 leading-none">
    BETA
  </span>
)
