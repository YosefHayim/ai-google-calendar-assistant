'use client'

import * as React from 'react'
import { motion, useMotionValue, useTransform, type TargetAndTransition } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button, type ButtonProps } from '@/components/ui/button'
import { useState, useRef, useEffect } from 'react'

interface AnimatedFeatureSpotlight3DProps extends React.HTMLAttributes<HTMLElement> {
  preheaderIcon?: React.ReactNode
  preheaderText: string
  heading: React.ReactNode
  description: string
  buttonText?: string
  buttonProps?: ButtonProps
  imageUrl: string
  imageAlt?: string
  reverse?: boolean
  onButtonClick?: () => void
  headingId?: string
}

// Lazy loading image component
interface LazyImageProps {
  src: string
  alt: string
  className?: string
  whileHover?: TargetAndTransition
  transition?: Record<string, unknown>
}

const LazyImage = ({ src, alt, className, whileHover, transition }: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '50px' },
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleLoad = () => setIsLoaded(true)
  const handleError = () => setHasError(true)

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded-xl flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin opacity-50" />
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 bg-muted rounded-xl flex items-center justify-center">
          <div className="text-muted-foreground text-sm">Failed to load image</div>
        </div>
      )}
      {isInView && (
        <motion.img
          src={src}
          alt={alt}
          className={cn(className, isLoaded ? 'opacity-100' : 'opacity-0')}
          onLoad={handleLoad}
          onError={handleError}
          transition={{ duration: 0.3, ...transition }}
          whileHover={whileHover}
        />
      )}
    </div>
  )
}

export const AnimatedFeatureSpotlight3D = React.forwardRef<HTMLElement, AnimatedFeatureSpotlight3DProps>(
  (
    {
      className,
      preheaderIcon,
      preheaderText,
      heading,
      description,
      buttonText,
      buttonProps,
      imageUrl,
      imageAlt = 'Feature image',
      reverse = false,
      onButtonClick,
      headingId,
      ...props
    },
    ref,
  ) => {
    const componentId = React.useId()
    const uniqueHeadingId = headingId || `feature-spotlight-heading-${componentId}`
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const rotateX = useTransform(y, [-100, 100], [15, -15])
    const rotateY = useTransform(x, [-100, 100], [-15, 15])

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const offsetX = e.clientX - rect.left - rect.width / 2
      const offsetY = e.clientY - rect.top - rect.height / 2
      x.set(offsetX)
      y.set(offsetY)
    }

    const handleMouseLeave = () => {
      x.set(0)
      y.set(0)
    }

    return (
      <section
        ref={ref}
        className={cn(
          'w-full max-w-6xl mx-auto p-6 md:p-12 rounded-2xl bg-muted dark:bg-secondary  overflow-hidden',
          className,
        )}
        aria-labelledby={uniqueHeadingId}
        {...props}
      >
        <div
          className={cn(
            'grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center',
            reverse && 'md:[&>*:first-child]:order-2',
          )}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col space-y-4 md:space-y-6 text-center md:text-left items-center md:items-start"
          >
            <div className="flex items-center space-x-2 text-sm font-medium text-primary">
              {preheaderIcon}
              <span>{preheaderText}</span>
            </div>
            <motion.h2
              id={uniqueHeadingId}
              className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground dark:text-primary-foreground"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {heading}
            </motion.h2>
            <motion.p
              className="text-base md:text-lg text-muted-foreground dark:text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {description}
            </motion.p>
            {buttonText && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <Button size="lg" onClick={onButtonClick} {...buttonProps}>
                  {buttonText}
                </Button>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            className="relative w-full min-h-[200px] md:min-h-[280px] flex items-center justify-center"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ perspective: 1000 }}
          >
            <motion.div
              style={{
                rotateX,
                rotateY,
                x,
                y,
                transformStyle: 'preserve-3d',
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-full max-w-sm relative"
            >
              <LazyImage
                src={imageUrl}
                alt={imageAlt}
                className="w-full object-contain rounded-xl"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>
    )
  },
)

AnimatedFeatureSpotlight3D.displayName = 'AnimatedFeatureSpotlight3D'
