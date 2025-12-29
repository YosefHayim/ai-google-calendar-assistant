'use client';

import React from "react";
import { motion, Variants } from "framer-motion";

interface HandWrittenTitleProps {
    title?: string;
    subtitle?: string;
    hideCircle?: boolean;
}

export const HandWrittenTitle: React.FC<HandWrittenTitleProps> = ({
    title = "Hand Written",
    subtitle = "Optional subtitle",
    hideCircle = false,
}) => {
    const draw: Variants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
                pathLength: { 
                  duration: 2.5, 
                  ease: [0.43, 0.13, 0.23, 0.96] as [number, number, number, number]
                },
                opacity: { duration: 0.5 },
            },
        },
    };

    return (
        <div className="relative w-full max-w-4xl mx-auto py-24 px-4">
            {!hideCircle && (
                <div className="absolute inset-0">
                    <motion.svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 1200 600"
                        initial="hidden"
                        animate="visible"
                        className="w-full h-full"
                    >
                        <title>Ally Highlight</title>
                        <motion.path
                            d="M 120 300 C 150 100, 400 50, 600 90 S 1000 150, 1080 300 S 1050 550, 600 510 S 150 500, 120 300 Z"
                            fill="none"
                            strokeWidth="12"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            variants={draw}
                            className="text-black dark:text-white opacity-90"
                        />
                    </motion.svg>
                </div>
            )}
            <div className="relative text-center z-10 flex flex-col items-center justify-center">
                <motion.h1
                    className="text-3xl md:text-5xl lg:text-6xl text-black dark:text-white tracking-tighter font-medium max-w-3xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                >
                    {title}
                </motion.h1>
                {subtitle && (
                    <motion.p
                        className="text-lg md:text-xl text-black/80 dark:text-white/80 mt-4 font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 0.8 }}
                    >
                        {subtitle}
                    </motion.p>
                )}
            </div>
        </div>
    );
};