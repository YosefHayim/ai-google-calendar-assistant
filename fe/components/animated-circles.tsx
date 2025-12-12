"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface Circle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  initialX: number;
  initialY: number;
}

export function AnimatedCircles() {
  const circles = useMemo(() => {
    const circleArray: Circle[] = [];
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      circleArray.push({
        id: i,
        x,
        y,
        size: Math.random() * 150 + 80,
        duration: Math.random() * 25 + 20,
        delay: Math.random() * 3,
        initialX: x,
        initialY: y,
      });
    }
    return circleArray;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {circles.map((circle) => (
        <motion.div
          key={circle.id}
          className="absolute rounded-full border border-white/20 bg-white/5 backdrop-blur-[1px]"
          style={{
            width: circle.size,
            height: circle.size,
            left: `${circle.x}%`,
            top: `${circle.y}%`,
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            x: [
              0,
              (Math.random() - 0.5) * 200,
              (Math.random() - 0.5) * 200,
              (Math.random() - 0.5) * 200,
              0,
            ],
            y: [
              0,
              (Math.random() - 0.5) * 200,
              (Math.random() - 0.5) * 200,
              (Math.random() - 0.5) * 200,
              0,
            ],
            scale: [1, 1.1, 0.9, 1.05, 1],
            opacity: [0.2, 0.4, 0.3, 0.35, 0.2],
          }}
          transition={{
            duration: circle.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: circle.delay,
          }}
        />
      ))}
    </div>
  );
}
