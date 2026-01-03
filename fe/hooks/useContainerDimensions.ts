'use client'

import { useState, useEffect, RefObject } from 'react'

interface Dimensions {
  width: number
  height: number
}

/**
 * Hook to track container dimensions using ResizeObserver
 * @param containerRef - React ref to the container element
 * @returns Current dimensions { width, height }
 */
export const useContainerDimensions = (
  containerRef: RefObject<HTMLElement | null>
): Dimensions => {
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 })

  useEffect(() => {
    if (!containerRef.current) return

    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect
        setDimensions({ width, height })
      }
    })

    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [containerRef])

  return dimensions
}
