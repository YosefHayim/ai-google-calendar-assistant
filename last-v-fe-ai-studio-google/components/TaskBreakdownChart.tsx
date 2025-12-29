
import React from 'react';
import { motion } from 'framer-motion';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface TaskBreakdownChartProps {
  data: ChartData[];
}

const TaskBreakdownChart: React.FC<TaskBreakdownChartProps> = ({ data }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let accumulatedCircumference = 0;
  const strokeWidth = 16;

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full" viewBox="0 0 180 180">
          {data.map((item, index) => {
            const dashArray = (item.value / total) * circumference;
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
                transition={{ duration: 1.5, delay: index * 0.2, ease: "easeOut" }}
              />
            );
            accumulatedCircumference += dashArray;
            return segment;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{total}</span>
            <span className="text-xs font-medium text-zinc-500">Tasks</span>
        </div>
      </div>
      <ul className="space-y-2">
        {data.map((item) => (
          <li key={item.name} className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
            <div className="flex items-baseline justify-between w-40">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{item.name}</span>
                <span className="text-xs font-mono text-zinc-500">{((item.value / total) * 100).toFixed(0)}%</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskBreakdownChart;
