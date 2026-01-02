'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TimeSavedColumnChartProps {
  data: { day: string; hours: number }[];
}

const TimeSavedColumnChart: React.FC<TimeSavedColumnChartProps> = ({ data }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // Ally Brand Primary Color Hex
    const PRIMARY_COLOR = "#f26306";

    useEffect(() => {
        if (containerRef.current) {
            const observer = new ResizeObserver(entries => {
                if (entries[0]) {
                    const { width, height } = entries[0].contentRect;
                    setDimensions({ width, height });
                }
            });
            observer.observe(containerRef.current);
            return () => observer.disconnect();
        }
    }, []);

    if (!data || data.length === 0) {
        return <div ref={containerRef} className="w-full h-full" />;
    }

    const { width, height } = dimensions;

    if (width === 0 || height === 0) {
        return <div ref={containerRef} className="w-full h-full" />;
    }

    const padding = 20;
    const maxY = Math.max(...data.map(d => d.hours), 1) * 1.1;
    const barSpacing = 2;
    const availableWidth = width - padding * 2;
    const barWidth = Math.max(2, (availableWidth - (data.length - 1) * barSpacing) / data.length);
    const plotHeight = height - padding * 2;

    const getY = (hours: number) => padding + plotHeight - (hours / maxY) * plotHeight;
    const getBarHeight = (hours: number) => (hours / maxY) * plotHeight;

    return (
        <div ref={containerRef} className="relative w-full h-full">
            <svg 
                viewBox={`0 0 ${width} ${height}`} 
                className="w-full h-full overflow-visible"
            >
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                    const y = padding + plotHeight * (1 - ratio);
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
                    );
                })}

                {/* Bars */}
                {data.map((point, index) => {
                    const x = padding + index * (barWidth + barSpacing);
                    const barHeight = getBarHeight(point.hours);
                    const y = padding + plotHeight - barHeight;
                    const isHovered = hoveredIndex === index;

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
                                    opacity: isHovered ? 1 : 0.8
                                }}
                                transition={{ 
                                    duration: 0.6, 
                                    delay: index * 0.03,
                                    ease: "easeOut"
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
                                        {point.hours.toFixed(1)}h
                                    </text>
                                </g>
                            )}
                        </g>
                    );
                })}
            </svg>

            {/* Tooltip Overlay */}
            {hoveredIndex !== null && (
                <div
                    className="absolute p-2.5 text-xs bg-zinc-900 dark:bg-zinc-800 text-white rounded-lg shadow-xl pointer-events-none border border-white/10 dark:border-zinc-700"
                    style={{
                        left: `${((padding + hoveredIndex * (barWidth + barSpacing) + barWidth / 2) / width) * 100}%`,
                        top: `${((padding + plotHeight - getBarHeight(data[hoveredIndex].hours) - 40) / height) * 100}%`,
                        transform: `translate(-50%, -100%)`,
                        whiteSpace: 'nowrap',
                        zIndex: 50
                    }}
                >
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                            {data[hoveredIndex].day}
                        </span>
                        <span className="text-sm font-bold text-white flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {data[hoveredIndex].hours.toFixed(1)}h saved
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimeSavedColumnChart;
