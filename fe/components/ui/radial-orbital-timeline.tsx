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
      <div className="w-full h-[700px] flex flex-col items-center justify-center bg-background dark:bg-[#030303]">
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
          const newAngle = (prev + 0.3) % 360
          return Number(newAngle.toFixed(3))
        })
      }, 50)
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
        return 'text-white bg-primary border-primary'
      case 'in-progress':
        return 'text-foreground bg-background border-border'
      case 'pending':
        return 'text-white bg-secondary/40 border-border/50'
      default:
        return 'text-white bg-secondary/40 border-border/50'
    }
  }

  return (
    <div
      className="w-full h-[700px] flex flex-col items-center justify-center bg-background dark:bg-[#030303] overflow-hidden relative"
      ref={containerRef}
      onClick={handleContainerClick}
    >
      <div className="absolute top-10 text-center z-10 px-4">
        <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-foreground dark:text-primary-foreground">
          Evolution of Intelligence
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto mt-4 mb-16 font-medium text-sm md:text-base">
          Click a node to explore the depth of Ally&apos;s neural capabilities.
        </p>
      </div>

      <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
        <div
          className="absolute w-full h-full flex items-center justify-center"
          ref={orbitRef}
          style={{
            perspective: '1000px',
            transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`,
          }}
        >
          {/* Central Neural Hub */}
          <div
            className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-primary via-amber-500 to-amber-600 animate-pulse flex items-center justify-center z-10 shadow-[0_0_50px_rgba(242,99,6,0.3)] cursor-pointer group/hub"
            onMouseEnter={() => setIsHubHovered(true)}
            onMouseLeave={() => setIsHubHovered(false)}
          >
            <div className="absolute w-20 h-20 rounded-full border border-primary/20 animate-ping opacity-70"></div>
            <div
              className="absolute w-24 h-24 rounded-full border border-primary/10 animate-ping opacity-50"
              style={{ animationDelay: '0.5s' }}
            ></div>
            <div className="w-8 h-8 rounded-full bg-background dark:bg-secondary backdrop-blur-md flex items-center justify-center transition-transform group-hover/hub:scale-110">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
          </div>

          <div className="absolute w-96 h-96 rounded-full border-border opacity-50"></div>

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
                className="absolute transition-all duration-700 cursor-pointer"
                style={nodeStyle}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleItem(item.id)
                }}
              >
                <div
                  className={`absolute rounded-full -inset-1 transition-opacity duration-300 ${
                    isPulsing || isHubHovered ? 'opacity-100 animate-pulse duration-1000' : 'opacity-0'
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
                  className={`
                  w-12 h-12 rounded-2xl flex items-center justify-center
                  ${
                    isExpanded || isHubHovered
                      ? 'bg-gradient-to-br from-primary via-amber-500 to-amber-600 text-white'
                      : isRelated
                        ? 'bg-primary/50 text-white'
                        : 'bg-secondary dark:bg-secondary text-muted-foreground dark:text-muted-foreground'
                  }
                  border 
                  ${
                    isExpanded || isHubHovered
                      ? 'border-primary/50 shadow-xl shadow-primary/30'
                      : isRelated
                        ? 'border-primary animate-pulse'
                        : 'border border-border'
                  }
                  transition-all duration-300 transform
                  ${isExpanded ? 'scale-125' : isHubHovered ? 'scale-110' : 'hover:scale-110'}
                `}
                >
                  <Icon size={20} />
                </div>

                <div
                  className={`
                  absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap
                  text-xs font-bold tracking-widest uppercase
                  transition-all duration-300
                  ${isExpanded || isHubHovered ? 'text-primary scale-110 opacity-100' : 'text-muted-foreground opacity-70'}
                `}
                >
                  {item.title}
                </div>

                {isExpanded && (
                  <Card className="absolute top-24 left-1/2 -translate-x-1/2 w-72 bg-background/95 dark:bg-secondary/95 backdrop-blur-xl border dark:border shadow-2xl overflow-visible z-50">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-primary/50"></div>
                    <CardHeader className="pb-2 p-4">
                      <div className="flex justify-between items-center mb-1">
                        <Badge className={`px-2 py-0 text-xs font-bold ${getStatusStyles(item.status)}`}>
                          {item.status === 'completed'
                            ? 'OPERATIONAL'
                            : item.status === 'in-progress'
                              ? 'OPTIMIZING'
                              : 'QUEUED'}
                        </Badge>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">{item.date}</span>
                      </div>
                      <CardTitle className="text-sm font-bold text-foreground dark:text-primary-foreground uppercase tracking-tight">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground p-4 pt-0">
                      <p className="leading-relaxed">{item.content}</p>

                      <div className="mt-4 pt-3 border-t border-border">
                        <div className="flex justify-between items-center text-xs font-bold mb-1 uppercase tracking-wider">
                          <span className="flex items-center text-muted-foreground">
                            <Zap size={10} className="mr-1 text-primary" />
                            Efficiency Rating
                          </span>
                          <span className="font-mono text-primary">{item.energy}%</span>
                        </div>
                        <div className="w-full h-1 bg-secondary dark:bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-amber-500"
                            style={{ width: `${item.energy}%` }}
                          ></div>
                        </div>
                      </div>

                      {item.relatedIds.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-border">
                          <div className="flex items-center mb-2">
                            <LinkIcon size={10} className="text-muted-foreground mr-1" />
                            <h4 className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Neural Links</h4>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.relatedIds.map((relatedId) => {
                              const relatedItem = timelineData.find((i) => i.id === relatedId)
                              return (
                                <Button
                                  key={relatedId}
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center h-6 px-2 py-0 text-xs rounded-md border bg-muted dark:bg-secondary/50 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
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
