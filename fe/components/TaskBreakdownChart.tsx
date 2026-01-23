'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface ChartData {
  name: string
  value: number
  color: string
}

interface TaskBreakdownChartProps {
  data: ChartData[]
}

const TaskBreakdownChart: React.FC<TaskBreakdownChartProps> = ({ data }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0)
  const radius = 70
  const circumference = 2 * Math.PI * radius
  let accumulatedCircumference = 0
  const strokeWidth = 16

  return (
    <div className="flex flex-col items-center justify-center gap-8 md:flex-row">
      <div className="relative h-40 w-40">
        <svg className="h-full w-full" viewBox="0 0 180 180">
          {data.map((item, index) => {
            const dashArray = (item.value / total) * circumference
            const segment = (
              <motion.circle
                key={item.name}
                cx="90"
                cy="90"
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dashArray} ${circumference - dashArray}`}
                strokeDashoffset={-accumulatedCircumference}
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: -accumulatedCircumference }}
                transition={{ duration: 1.5, delay: index * 0.2, ease: 'easeOut' }}
              />
            )
            accumulatedCircumference += dashArray
            return segment
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-foreground">{total}</span>
          <span className="text-xs font-medium text-muted-foreground">Tasks</span>
        </div>
      </div>
      <ul className="space-y-2">
        {data.map((item) => (
          <li key={item.name} className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: item.color }} />
            <div className="flex w-40 items-baseline justify-between">
              <span className="text-sm font-medium text-foreground text-muted-foreground">{item.name}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {((item.value / total) * 100).toFixed(0)}%
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TaskBreakdownChart
