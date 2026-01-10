'use client'

import * as React from 'react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from 'recharts'

import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import type { CalendarBreakdownItem } from '@/types/analytics'
import { getValidHexColor } from '@/lib/colorUtils'
import { calculateMax } from '@/lib/dataUtils'

interface TimeAllocationRadarChartProps {
  data: CalendarBreakdownItem[]
  onCalendarClick?: (calendarId: string, calendarName: string, calendarColor: string) => void
}

export const TimeAllocationRadarChart: React.FC<TimeAllocationRadarChartProps> = ({ data, onCalendarClick }) => {
  // For radar chart, we create one data point per calendar (spoke)
  // Each spoke shows that calendar's hours value
  const { chartData, chartConfig, maxHours } = React.useMemo(() => {
    const max = calculateMax(data.map((d) => d.hours), 1)

    // Each calendar becomes a point on the radar
    const transformedData = data.map((item) => ({
      category: item.category,
      hours: item.hours,
      color: getValidHexColor(item.color),
      calendarId: item.calendarId || '',
      fullMark: max,
    }))

    // Chart config for styling
    const config: ChartConfig = {
      hours: {
        label: 'Hours',
        color: '#6366f1',
      },
    }

    return { chartData: transformedData, chartConfig: config, maxHours: max }
  }, [data])

  const handleClick = (entry: typeof chartData[0]) => {
    if (onCalendarClick && entry.calendarId) {
      onCalendarClick(entry.calendarId, entry.category, entry.color)
    }
  }

  // Custom dot component to render each point with its calendar color
  const CustomDot = (props: {
    cx: number
    cy: number
    payload: typeof chartData[0]
    index: number
  }) => {
    const { cx, cy, payload } = props
    return (
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill={payload.color}
        stroke="#fff"
        strokeWidth={2}
        className="cursor-pointer"
        onClick={() => handleClick(payload)}
      />
    )
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
        <PolarGrid
          className="stroke-zinc-200 dark:stroke-zinc-700"
          gridType="polygon"
        />
        <PolarAngleAxis
          dataKey="category"
          tick={({ x, y, payload, index }) => {
            const item = chartData[index]
            const color = item?.color || '#71717a'
            // Truncate long names
            const displayName = payload.value.length > 12
              ? payload.value.substring(0, 10) + '...'
              : payload.value
            return (
              <g transform={`translate(${x},${y})`}>
                <text
                  x={0}
                  y={0}
                  dy={4}
                  textAnchor="middle"
                  fill={color}
                  fontSize={11}
                  fontWeight={600}
                  className="cursor-pointer"
                  onClick={() => item && handleClick(item)}
                >
                  {displayName}
                </text>
              </g>
            )
          }}
          tickLine={false}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, maxHours]}
          tick={{ fill: '#71717a', fontSize: 10 }}
          tickFormatter={(value) => `${value}h`}
          axisLine={false}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length > 0) {
              const item = payload[0].payload as typeof chartData[0]
              return (
                <div className="rounded-lg border border-zinc-700 bg-zinc-900 dark:bg-zinc-800 px-3 py-2 text-white shadow-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-sm">{item.category}</span>
                  </div>
                  <div className="text-zinc-300 text-xs">
                    {item.hours.toFixed(1)} hours
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Radar
          name="Hours"
          dataKey="hours"
          stroke="#6366f1"
          fill="#6366f1"
          fillOpacity={0.2}
          strokeWidth={2}
          dot={CustomDot}
          activeDot={{
            r: 8,
            stroke: '#fff',
            strokeWidth: 2,
          }}
        />
      </RadarChart>
    </ChartContainer>
  )
}
