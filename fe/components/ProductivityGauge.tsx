'use client'
import React from 'react'
import { motion } from 'framer-motion'

interface ProductivityGaugeProps {
  score: number // 0 to 100
}

const ProductivityGauge: React.FC<ProductivityGaugeProps> = ({ score }) => {
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
      <div className="relative h-40 w-40">
        <svg className="h-full w-full" viewBox="0 0 140 140">
          <circle
            className="text-muted-foreground"
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            r={radius}
            cx="70"
            cy="70"
          />
          <motion.circle
            className="text-primary"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx="70"
            cy="70"
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-foreground">{score}</span>
          <span className="text-xs font-medium text-muted-foreground">Score</span>
        </div>
      </div>
      <div className="text-center">
        <h4 className="font-medium text-foreground">Productivity Score</h4>
        <p className="text-xs text-muted-foreground">Based on task completion & focus time.</p>
      </div>
    </div>
  )
}

export default ProductivityGauge
