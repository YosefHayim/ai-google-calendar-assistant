'use client'

import React, { useRef, useState } from 'react'

import { calculateMax } from '@/lib/dataUtils'
import { formatHours } from '@/lib/formatUtils'
import { motion } from 'framer-motion'
import { useContainerDimensions } from '@/hooks/useContainerDimensions'

interface TimeSavedChartProps {
  data: { day: string; hours: number }[]
}

const TimeSavedChart: React.FC<TimeSavedChartProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const dimensions = useContainerDimensions(containerRef)
  const [hoveredData, setHoveredData] = useState<{ day: string; hours: number; x: number; y: number } | null>(null)

  // Ally Brand Primary Color Hex
  const PRIMARY_COLOR = '#f26306'

  if (!data || data.length === 0) {
    return <div ref={containerRef} className="w-full h-full" />
  }

  const { width, height } = dimensions

  if (width === 0 || height === 0) {
    return <div ref={containerRef} className="w-full h-full" />
  }

  const padding = 10
  const maxX = data.length - 1
  const maxY =
    calculateMax(
      data.map((d) => d.hours),
      1,
    ) * 1.1

  const getX = (index: number) => padding + (index / maxX) * (width - padding * 2)
  const getY = (hours: number) => height - padding - (hours / maxY) * (height - padding * 2)

  const pathD = data
    .map((point, i) => {
      const x = getX(i)
      const y = getY(point.hours)
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
    })
    .join(' ')

  const areaPathD = `${pathD} V ${height - padding} L ${padding} ${height - padding} Z`

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()

    if (rect.width === 0) return

    const mouseX = e.clientX - rect.left
    const viewBoxX = (mouseX / rect.width) * width

    const plotAreaWidth = width - padding * 2
    const xInPlotArea = viewBoxX - padding

    const fractionX = xInPlotArea / plotAreaWidth

    let index = Math.round(fractionX * maxX)
    index = Math.max(0, Math.min(maxX, index))

    const point = data[index]
    if (point) {
      setHoveredData({
        day: point.day,
        hours: point.hours,
        x: getX(index),
        y: getY(point.hours),
      })
    }
  }

  const handleMouseLeave = () => {
    setHoveredData(null)
  }

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full cursor-crosshair overflow-visible"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PRIMARY_COLOR} stopOpacity={0.4} />
            <stop offset="100%" stopColor={PRIMARY_COLOR} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Background Area Gradient */}
        <motion.path
          d={areaPathD}
          fill="url(#areaGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />

        {/* Main Trend Line */}
        <motion.path
          d={pathD}
          fill="none"
          stroke={PRIMARY_COLOR}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-sm"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />

        {/* Hover States */}
        {hoveredData && (
          <g className="pointer-events-none">
            <line
              x1={hoveredData.x}
              y1={padding}
              x2={hoveredData.x}
              y2={height - padding}
              stroke={PRIMARY_COLOR}
              strokeWidth="1"
              strokeDasharray="4 2"
              opacity="0.5"
            />
            <circle
              cx={hoveredData.x}
              cy={hoveredData.y}
              r="5"
              fill={PRIMARY_COLOR}
              className="stroke-white dark:stroke-zinc-900"
              strokeWidth="2"
            />
          </g>
        )}
      </svg>

      {/* Tooltip Overlay */}
      {hoveredData && (
        <div
          className="absolute p-2.5 text-xs bg-secondary dark:bg-secondary text-primary-foreground rounded-lg shadow-xl pointer-events-none border-border"
          style={{
            left: `${(hoveredData.x / width) * 100}%`,
            top: `${(hoveredData.y / height) * 100}%`,
            transform: `translate(-50%, -130%)`,
            whiteSpace: 'nowrap',
            zIndex: 50,
          }}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{hoveredData.day}</span>
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              {formatHours(hoveredData.hours)} saved
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default TimeSavedChart
