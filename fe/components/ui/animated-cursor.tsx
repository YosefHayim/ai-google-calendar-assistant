'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CursorContextProps {
  mouseX: any;
  mouseY: any;
  isVisible: boolean;
  isHovering: boolean;
  setIsHovering: (val: boolean) => void;
}

const CursorContext = createContext<CursorContextProps | undefined>(undefined);

// Fix: Use PropsWithChildren or explicit React.FC for better component typing
export const CursorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible, mouseX, mouseY]);

  return (
    <CursorContext.Provider value={{ mouseX, mouseY, isVisible, isHovering, setIsHovering }}>
      {children}
    </CursorContext.Provider>
  );
};

export const useCursor = () => {
  const context = useContext(CursorContext);
  if (!context) throw new Error('useCursor must be used within a CursorProvider');
  return context;
};

/**
 * Main Cursor component. 
 * Updated to use raw MotionValues directly (mouseX, mouseY) instead of springs 
 * to ensure zero latency with the hardware cursor.
 * Z-index is set to 99999 to always stay on top of everything.
 */
export const Cursor: React.FC<{ children: ReactNode; className?: string }> = ({ children, className }) => {
  const { mouseX, mouseY, isVisible } = useCursor();
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          style={{ x: mouseX, y: mouseY, translateX: '-20%', translateY: '-20%' }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className={cn('fixed top-0 left-0 z-[99999] pointer-events-none', className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * CursorFollow component for secondary effects.
 * Retains a spring for a smooth "trailing" feel.
 */
export const CursorFollow: React.FC<{ children: ReactNode; className?: string }> = ({ children, className }) => {
  const { mouseX, mouseY, isVisible } = useCursor();
  
  const springConfig = { damping: 30, stiffness: 150, mass: 0.8 };
  const sx = useSpring(mouseX, springConfig);
  const sy = useSpring(mouseY, springConfig);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          style={{ x: sx, y: sy, translateX: '20px', translateY: '20px' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className={cn('fixed top-0 left-0 z-[99998] pointer-events-none', className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};