'use client'

import { ArrowRight, Clock, Link as LinkIcon, Sparkles, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import React, { useEffect, useRef, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'

interface TimelineItem {
  id: number
  title: string
  date: string
  content: string
  category: string
  icon: React.ComponentType<{ size?: number }>
  relatedIds: number[]
  status: 'completed' | 'in-progress' | 'pending'
  energy: number
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[]
}

export default function RadialOrbitalTimeline({ timelineData }: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({})
  const [isHubHovered, setIsHubHovered] = useState(false)
  const [viewMode] = useState<'orbital'>('orbital')
  const [rotationAngle, setRotationAngle] = useState<number>(0)
  const [autoRotate, setAutoRotate] = useState<boolean>(true)
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({})
  const [centerOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  })
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const orbitRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({})

  if (!timelineData || timelineData.length === 0) {
    return (
      <div className="flex h-[700px] w-full flex-col items-center justify-center bg-background">
        <EmptyState
          icon={<Clock />}
          title="No timeline data"
          description="There are no events to display in the orbital timeline."
          size="lg"
        />
      </div>
    )
  }

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({})
      setActiveNodeId(null)
      setPulseEffect({})
      setAutoRotate(true)
    }
  }

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const newState = { ...prev }
      Object.keys(newState).forEach((key) => {
        if (parseInt(key) !== id) {
          newState[parseInt(key)] = false
        }
      })

      newState[id] = !prev[id]

      if (!prev[id]) {
        setActiveNodeId(id)
        setAutoRotate(false)

        const relatedItems = getRelatedItems(id)
        const newPulseEffect: Record<number, boolean> = {}
        relatedItems.forEach((relId) => {
          newPulseEffect[relId] = true
        })
        setPulseEffect(newPulseEffect)

        centerViewOnNode(id)
      } else {
        setActiveNodeId(null)
        setAutoRotate(true)
        setPulseEffect({})
      }

      return newState
    })
  }

  useEffect(() => {
    let rotationTimer: any

    if (autoRotate && viewMode === 'orbital') {
      rotationTimer = setInterval(() => {
        setRotationAngle((prev) => {
          const newAngle = (prev + 0.5) % 360 // Slightly faster rotation
          return Number(newAngle.toFixed(1)) // Less precision to reduce calculations
        })
      }, 100) // Reduced frequency from 50ms to 100ms
    }

    return () => {
      if (rotationTimer) {
        clearInterval(rotationTimer)
      }
    }
  }, [autoRotate, viewMode])

  const centerViewOnNode = (nodeId: number) => {
    if (viewMode !== 'orbital' || !nodeRefs.current[nodeId]) return

    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId)
    const totalNodes = timelineData.length
    const targetAngle = (nodeIndex / totalNodes) * 360

    setRotationAngle(270 - targetAngle)
  }

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360
    const radius = 200
    const radian = (angle * Math.PI) / 180

    const x = radius * Math.cos(radian) + centerOffset.x
    const y = radius * Math.sin(radian) + centerOffset.y

    const zIndex = Math.round(100 + 50 * Math.cos(radian))
    const opacity = Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2)))

    return { x, y, angle, zIndex, opacity }
  }

  const getRelatedItems = (itemId: number): number[] => {
    const currentItem = timelineData.find((item) => item.id === itemId)
    return currentItem ? currentItem.relatedIds : []
  }

  const isRelatedToActive = (itemId: number): boolean => {
    if (!activeNodeId) return false
    const relatedItems = getRelatedItems(activeNodeId)
    return relatedItems.includes(itemId)
  }

  const getStatusStyles = (status: TimelineItem['status']): string => {
    switch (status) {
      case 'completed':
        return 'text-primary-foreground bg-primary border-primary'
      case 'in-progress':
        return 'text-foreground bg-background border-border'
      case 'pending':
        return 'text-secondary-foreground bg-secondary/40 border-border/50'
      default:
        return 'text-secondary-foreground bg-secondary/40 border-border/50'
    }
  }

  return (
    <div
      className="relative flex h-[700px] w-full flex-col items-center justify-center overflow-hidden bg-background"
      ref={containerRef}
      onClick={handleContainerClick}
    >
      <div className="absolute top-10 z-10 px-4 text-center">
        <h2 className="text-3xl font-medium tracking-tight text-foreground md:text-5xl">Evolution of Intelligence</h2>
        <p className="mx-auto mb-16 mt-4 max-w-lg text-sm font-medium text-muted-foreground md:text-base">
          Click a node to explore the depth of Ally&apos;s neural capabilities.
        </p>
      </div>

      <div className="relative flex h-full w-full max-w-4xl items-center justify-center">
        <div
          className="absolute flex h-full w-full items-center justify-center"
          ref={orbitRef}
          style={{
            perspective: '1000px',
            transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`,
          }}
        >
          {/* Central Neural Hub */}
          <div
            className="group/hub absolute z-10 flex h-16 w-16 animate-pulse cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-primary via-amber-500 to-amber-600 shadow-[0_0_50px_rgba(242,99,6,0.3)]"
            onMouseEnter={() => setIsHubHovered(true)}
            onMouseLeave={() => setIsHubHovered(false)}
          >
            <div className="absolute h-20 w-20 animate-ping rounded-full border-primary/20 opacity-70"></div>
            <div
              className="absolute h-24 w-24 animate-ping rounded-full border-primary/10 opacity-50"
              style={{ animationDelay: '0.5s' }}
            ></div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background bg-secondary backdrop-blur-md transition-transform group-hover/hub:scale-110">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
          </div>

          <div className="absolute h-96 w-96 rounded-full border-border opacity-50"></div>

          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length)
            const isExpanded = expandedItems[item.id]
            const isRelated = isRelatedToActive(item.id)
            const isPulsing = pulseEffect[item.id]
            const Icon = item.icon

            const nodeStyle = {
              transform: `translate(${position.x}px, ${position.y}px)`,
              zIndex: isExpanded ? 200 : position.zIndex,
              opacity: isExpanded ? 1 : position.opacity,
            }

            return (
              <div
                key={item.id}
                ref={(el) => {
                  nodeRefs.current[item.id] = el
                }}
                className="absolute cursor-pointer transition-all duration-700"
                style={nodeStyle}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleItem(item.id)
                }}
              >
                <div
                  className={`absolute -inset-1 rounded-full transition-opacity duration-300 ${
                    isPulsing || isHubHovered ? 'animate-pulse opacity-100 duration-1000' : 'opacity-0'
                  }`}
                  style={{
                    background: `radial-gradient(circle, rgba(242,99,6,0.2) 0%, rgba(242,99,6,0) 70%)`,
                    width: `${item.energy * 0.5 + 40}px`,
                    height: `${item.energy * 0.5 + 40}px`,
                    left: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                    top: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                  }}
                ></div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    isExpanded || isHubHovered
                      ? 'bg-gradient-to-br from-primary via-amber-500 to-amber-600 text-foreground'
                      : isRelated
                        ? 'bg-primary/50 text-primary-foreground'
                        : 'bg-secondary text-muted-foreground'
                  } border ${
                    isExpanded || isHubHovered
                      ? 'border-primary/50 shadow-xl shadow-primary/30'
                      : isRelated
                        ? 'animate-pulse border-primary'
                        : 'border-border'
                  } transform transition-all duration-300 ${isExpanded ? 'scale-125' : isHubHovered ? 'scale-110' : 'hover:scale-110'} `}
                >
                  <Icon size={20} />
                </div>

                <div
                  className={`absolute left-1/2 top-14 -translate-x-1/2 whitespace-nowrap text-xs font-bold uppercase tracking-widest transition-all duration-300 ${isExpanded || isHubHovered ? 'scale-110 text-primary opacity-100' : 'text-muted-foreground opacity-70'} `}
                >
                  {item.title}
                </div>

                {isExpanded && (
                  <Card className="absolute left-1/2 top-24 z-50 w-72 -translate-x-1/2 overflow-visible bg-background/95 bg-secondary/95 shadow-2xl backdrop-blur-xl">
                    <div className="absolute -top-3 left-1/2 h-3 w-px -translate-x-1/2 bg-primary/50"></div>
                    <CardHeader className="p-4 pb-2">
                      <div className="mb-1 flex items-center justify-between">
                        <Badge className={`px-2 py-0 text-xs font-bold ${getStatusStyles(item.status)}`}>
                          {item.status === 'completed'
                            ? 'OPERATIONAL'
                            : item.status === 'in-progress'
                              ? 'OPTIMIZING'
                              : 'QUEUED'}
                        </Badge>
                        <span className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">
                          {item.date}
                        </span>
                      </div>
                      <CardTitle className="text-sm font-bold uppercase tracking-tight text-foreground">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
                      <p className="leading-relaxed">{item.content}</p>

                      <div className="mt-4 border-t border-border pt-3">
                        <div className="mb-1 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                          <span className="flex items-center text-muted-foreground">
                            <Zap size={10} className="mr-1 text-primary" />
                            Efficiency Rating
                          </span>
                          <span className="font-mono text-primary">{item.energy}%</span>
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-amber-500"
                            style={{ width: `${item.energy}%` }}
                          ></div>
                        </div>
                      </div>

                      {item.relatedIds.length > 0 && (
                        <div className="mt-4 border-t border-border pt-3">
                          <div className="mb-2 flex items-center">
                            <LinkIcon size={10} className="mr-1 text-muted-foreground" />
                            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                              Neural Links
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.relatedIds.map((relatedId) => {
                              const relatedItem = timelineData.find((i) => i.id === relatedId)
                              return (
                                <Button
                                  key={relatedId}
                                  variant="outline"
                                  size="sm"
                                  className="flex h-6 items-center rounded-md border bg-muted bg-secondary/50 px-2 py-0 text-xs text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleItem(relatedId)
                                  }}
                                >
                                  {relatedItem?.title}
                                  <ArrowRight size={8} className="ml-1" />
                                </Button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
