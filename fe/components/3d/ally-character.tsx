'use client'

import { useRef, useEffect, useState, useCallback, memo, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Center } from '@react-three/drei'
import * as THREE from 'three'

export type AllyAnimationState = 'idle' | 'talking' | 'listening' | 'thinking' | 'happy' | 'sad'

export interface AllyCharacterProps {
  animationState?: AllyAnimationState
  autoRotate?: boolean
  autoRotateSpeed?: number
  enableControls?: boolean
  backgroundColor?: string | null
  scale?: number
  onAnimationChange?: (state: AllyAnimationState) => void
  className?: string
  mouthOpenness?: number
}

function ThreeJsResourceDisposer() {
  const { gl, scene } = useThree()

  useEffect(() => {
    return () => {
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry?.dispose()
          if (Array.isArray(object.material)) {
            object.material.forEach((m) => m.dispose())
          } else if (object.material) {
            object.material.dispose()
          }
        }
      })
      while (scene.children.length > 0) {
        scene.remove(scene.children[0])
      }
      gl.dispose()
    }
  }, [gl, scene])

  return null
}

function AllyPlaceholder({ animationState }: { animationState: AllyAnimationState }) {
  const groupRef = useRef<THREE.Group>(null)
  const mouthRef = useRef<THREE.Mesh>(null)

  const getColor = () => {
    switch (animationState) {
      case 'happy':
        return '#d8b4fe'
      case 'sad':
        return '#a78bfa'
      case 'thinking':
        return '#c4b5fd'
      default:
        return '#b19cd9'
    }
  }

  useFrame((state) => {
    if (!groupRef.current) return

    const t = state.clock.elapsedTime

    switch (animationState) {
      case 'idle':
        groupRef.current.position.y = Math.sin(t * 1.5) * 0.05
        groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.1
        break
      case 'talking':
        groupRef.current.position.y = Math.sin(t * 2) * 0.03
        if (mouthRef.current) {
          mouthRef.current.scale.y = 0.5 + Math.abs(Math.sin(t * 10)) * 0.5
        }
        break
      case 'listening':
        groupRef.current.rotation.z = Math.sin(t * 0.8) * 0.05
        groupRef.current.rotation.x = 0.1
        break
      case 'thinking':
        groupRef.current.rotation.y = t * 0.2
        groupRef.current.position.y = Math.sin(t) * 0.02
        break
      case 'happy':
        groupRef.current.position.y = Math.abs(Math.sin(t * 4)) * 0.1
        groupRef.current.rotation.z = Math.sin(t * 3) * 0.1
        break
      case 'sad':
        groupRef.current.position.y = -0.05 + Math.sin(t * 0.5) * 0.02
        groupRef.current.rotation.x = 0.15
        break
    }
  })

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color={getColor()} roughness={0.8} metalness={0.1} />
      </mesh>

      <group position={[0, 0.15, 0.55]}>
        <mesh position={[-0.22, 0, 0]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-0.22, 0, 0.12]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color="#4a3728" />
        </mesh>
        <mesh position={[-0.22, 0, 0.16]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>

        <mesh position={[0.22, 0, 0]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.22, 0, 0.12]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color="#4a3728" />
        </mesh>
        <mesh position={[0.22, 0, 0.16]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>

      <mesh ref={mouthRef} position={[0, -0.15, 0.7]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>

      <mesh position={[0, -0.4, 0.2]}>
        <boxGeometry args={[0.7, 0.4, 0.3]} />
        <meshStandardMaterial color="#1e3a5f" />
      </mesh>

      <mesh position={[0, -0.35, 0.35]}>
        <boxGeometry args={[0.15, 0.25, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

const Scene = memo(function Scene({
  animationState,
  autoRotate,
  autoRotateSpeed,
  enableControls,
  scale,
}: {
  animationState: AllyAnimationState
  autoRotate: boolean
  autoRotateSpeed: number
  enableControls: boolean
  scale: number
}) {
  return (
    <>
      <ThreeJsResourceDisposer />
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-5, 3, -5]} intensity={0.5} />
      <pointLight position={[0, 2, 2]} intensity={0.4} />
      <ContactShadows position={[0, -1.2, 0]} opacity={0.4} scale={3} blur={2} far={2} />

      {enableControls && (
        <OrbitControls
          autoRotate={autoRotate && animationState === 'idle'}
          autoRotateSpeed={autoRotateSpeed}
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.8}
        />
      )}

      <Center>
        <group scale={scale}>
          <AllyPlaceholder animationState={animationState} />
        </group>
      </Center>
    </>
  )
})

const CAMERA_CONFIG = { position: [0, 0.3, 2.5] as [number, number, number], fov: 50 }

export const AllyCharacter = memo(function AllyCharacter({
  animationState = 'idle',
  autoRotate = false,
  autoRotateSpeed = 1,
  enableControls = true,
  backgroundColor = null,
  scale = 1,
  className = '',
}: AllyCharacterProps) {
  const [mounted, setMounted] = useState(false)
  const canvasKey = useRef(`ally-canvas-${Date.now()}`).current

  useEffect(() => {
    setMounted(true)
  }, [])

  const glConfig = useMemo(
    () => ({ antialias: true, alpha: !backgroundColor, preserveDrawingBuffer: true }),
    [backgroundColor],
  )

  if (!mounted) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${className}`}>
        <div className="h-24 w-24 animate-pulse rounded-full bg-purple-900" />
      </div>
    )
  }

  return (
    <div className={`h-full w-full ${className}`} style={{ backgroundColor: backgroundColor || 'transparent' }}>
      <Canvas key={canvasKey} shadows dpr={[1, 2]} gl={glConfig} camera={CAMERA_CONFIG}>
        <Scene
          animationState={animationState}
          autoRotate={autoRotate}
          autoRotateSpeed={autoRotateSpeed}
          enableControls={enableControls}
          scale={scale}
        />
      </Canvas>
    </div>
  )
})

export function usePreloadAllyModel() {}

export function useAllyAnimationController() {
  const [animationState, setAnimationState] = useState<AllyAnimationState>('idle')
  const [mouthOpenness, setMouthOpenness] = useState(0)
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const setTemporaryState = useCallback((state: AllyAnimationState, durationMs: number) => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }
    setAnimationState(state)
    animationTimeoutRef.current = setTimeout(() => {
      setAnimationState('idle')
    }, durationMs)
  }, [])

  const simulateTalking = useCallback((durationMs: number) => {
    setAnimationState('talking')
    let elapsed = 0
    const interval = 50

    const talkInterval = setInterval(() => {
      elapsed += interval
      if (elapsed >= durationMs) {
        clearInterval(talkInterval)
        setMouthOpenness(0)
        setAnimationState('idle')
      } else {
        setMouthOpenness(Math.random() * 0.8 + 0.1)
      }
    }, interval)

    return () => clearInterval(talkInterval)
  }, [])

  const updateMouthFromAudio = useCallback((audioLevel: number) => {
    setMouthOpenness(Math.min(1, audioLevel * 1.5))
  }, [])

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  return {
    animationState,
    setAnimationState,
    mouthOpenness,
    setMouthOpenness,
    setTemporaryState,
    simulateTalking,
    updateMouthFromAudio,
  }
}

export default AllyCharacter
