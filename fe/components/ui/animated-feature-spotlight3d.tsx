'use client'

import * as React from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button, type ButtonProps } from '@/components/ui/button'

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
    const uniqueHeadingId = headingId || `feature-spotlight-heading-${React.useId()}`
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
          'w-full max-w-6xl mx-auto p-6 md:p-12 rounded-2xl bg-muted dark:bg-secondary border border dark:border overflow-hidden',
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
              <motion.img
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
