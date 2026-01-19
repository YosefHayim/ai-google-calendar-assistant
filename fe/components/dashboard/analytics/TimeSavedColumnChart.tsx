'use client'

import React, { useRef, useState } from 'react'
import { calculateAvailableHoursLeft, calculateMax } from '@/lib/dataUtils'

import { CALENDAR_CONSTANTS } from '@/lib/constants'
import { format } from 'date-fns'
import { formatHours } from '@/lib/formatUtils'
import { motion } from 'framer-motion'
import { useContainerDimensions } from '@/hooks/useContainerDimensions'

interface TimeSavedColumnChartProps {
  data: { day: number; date: string; hours: number }[]
}

const TimeSavedColumnChart: React.FC<TimeSavedColumnChartProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const dimensions = useContainerDimensions(containerRef)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Ally Brand Primary Color Hex
  const PRIMARY_COLOR = '#f26306'

  if (!data || data.length === 0) {
    return <div ref={containerRef} className="w-full h-full" />
  }

  const { width, height } = dimensions

  if (width === 0 || height === 0) {
    return <div ref={containerRef} className="w-full h-full" />
  }

  const padding = 20
  const maxY =
    calculateMax(
      data.map((d) => d.hours),
      1,
    ) * 1.1
  const barSpacing = 2
  const availableWidth = width - padding * 2
  const barWidth = Math.max(2, (availableWidth - (data.length - 1) * barSpacing) / data.length)
  const plotHeight = height - padding * 2

  const _getY = (hours: number) => padding + plotHeight - (hours / maxY) * plotHeight
  const getBarHeight = (hours: number) => (hours / maxY) * plotHeight

  return (
    <div ref={containerRef} className="relative w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding + plotHeight * (1 - ratio)
          return (
            <line
              key={ratio}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-zinc-200 dark:text-zinc-800"
              opacity={0.5}
            />
          )
        })}

        {/* Bars */}
        {data.map((point, index) => {
          const x = padding + index * (barWidth + barSpacing)
          const barHeight = getBarHeight(point.hours)
          const y = padding + plotHeight - barHeight
          const isHovered = hoveredIndex === index

          return (
            <g key={index}>
              <motion.rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={PRIMARY_COLOR}
                rx={Math.min(4, barWidth / 2)}
                initial={{ height: 0, y: padding + plotHeight }}
                animate={{
                  height: barHeight,
                  y: y,
                  opacity: isHovered ? 1 : 0.8,
                }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.03,
                  ease: 'easeOut',
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              />
              {isHovered && (
                <g className="pointer-events-none">
                  <rect
                    x={x - 2}
                    y={y - 30}
                    width={Math.max(barWidth + 4, 40)}
                    height={24}
                    fill="rgba(0, 0, 0, 0.8)"
                    rx={4}
                  />
                  <text
                    x={x + barWidth / 2}
                    y={y - 14}
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {formatHours(point.hours)}
                  </text>
                </g>
              )}
            </g>
          )
        })}
      </svg>

      {/* Tooltip Overlay */}
      {hoveredIndex !== null &&
        (() => {
          const point = data[hoveredIndex]
          const availableHoursLeft = calculateAvailableHoursLeft(point.hours, CALENDAR_CONSTANTS.TOTAL_AVAILABLE_HOURS)
          const dateObj = new Date(point.date)
          const formattedDate = format(dateObj, 'MMM dd, yyyy')

          return (
            <div
              className="absolute p-3 text-xs bg-secondary dark:bg-secondary text-primary-foreground rounded-lg shadow-xl pointer-events-none border-border min-w-[180px] z-50"
              style={{
                left: `${((padding + hoveredIndex * (barWidth + barSpacing) + barWidth / 2) / width) * 100}%`,
                top: `${((padding + plotHeight - getBarHeight(point.hours) - 60) / height) * 100}%`,
                transform: `translate(-50%, -100%)`,
                zIndex: 50,
              }}
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                    Day {point.day}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">{formattedDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-sm font-bold text-white">{formatHours(point.hours)} saved</span>
                </div>
                <div className="pt-1 border-t border-border">
                  <span className="text-xs text-zinc-300 dark:text-muted-foreground">
                    Available Hours Left:{' '}
                    <span className="font-bold text-white">{formatHours(availableHoursLeft)}</span>
                  </span>
                </div>
              </div>
            </div>
          )
        })()}
    </div>
  )
}

export default TimeSavedColumnChart
