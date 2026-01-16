'use client'

import React from 'react'
import NumberFlow from '@number-flow/react'
import { getScoreColor } from '../utils'

interface CircularProgressProps {
  value: number
  size?: number
  className?: string
}

export function CircularProgress({ value, size = 80, className = '' }: CircularProgressProps) {
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <div className={`relative flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-zinc-200 dark:text-zinc-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getScoreColor(value)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
          <NumberFlow value={value} />
        </span>
      </div>
    </div>
  )
}
