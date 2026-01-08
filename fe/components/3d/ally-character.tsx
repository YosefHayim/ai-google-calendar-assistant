'use client'

import { useRef, useEffect, useState, Suspense, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useAnimations, OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import type { GLTF } from 'three-stdlib'

// ============================================================================
// TYPES
// ============================================================================

export type AllyAnimationState = 'idle' | 'talking' | 'listening' | 'thinking' | 'happy' | 'sad'

export interface AllyCharacterProps {
  /** Current animation state */
  animationState?: AllyAnimationState
  /** Whether to auto-rotate the character */
  autoRotate?: boolean
  /** Rotation speed when auto-rotating */
  autoRotateSpeed?: number
  /** Enable orbit controls for user interaction */
  enableControls?: boolean
  /** Background color or transparent */
  backgroundColor?: string | null
  /** Scale multiplier */
  scale?: number
  /** Callback when animation changes */
  onAnimationChange?: (state: AllyAnimationState) => void
  /** Custom className for container */
  className?: string
  /** Mouth openness for lip-sync (0-1) */
  mouthOpenness?: number
}

interface AllyModelProps {
  animationState: AllyAnimationState
  mouthOpenness: number
  onAnimationChange?: (state: AllyAnimationState) => void
}

interface GLTFWithAnimations {
  scene: THREE.Group
  animations: THREE.AnimationClip[]
}

// Animation name mapping
const ANIMATION_MAP: Record<AllyAnimationState, string> = {
  idle: 'Ally_Idle',
  talking: 'Ally_Talking',
  listening: 'Ally_Listening',
  thinking: 'Ally_Thinking',
  happy: 'Ally_Happy',
  sad: 'Ally_Sad',
}

// ============================================================================
// ALLY 3D MODEL COMPONENT
// ============================================================================

function AllyModel({ animationState, mouthOpenness, onAnimationChange }: AllyModelProps) {
  const group = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF('/ally-3d.glb') as GLTFWithAnimations
  const { actions, mixer } = useAnimations(animations, group)
  const [currentAction, setCurrentAction] = useState<THREE.AnimationAction | null>(null)

  // Morph target refs for lip-sync
  const meshWithMorphs = useRef<THREE.Mesh | null>(null)

  // Find mesh with morph targets on mount
  useEffect(() => {
    scene.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh && child.morphTargetInfluences && child.morphTargetDictionary) {
        meshWithMorphs.current = child
      }
    })
  }, [scene])

  // Handle animation state changes
  useEffect(() => {
    const actionName = ANIMATION_MAP[animationState]
    const newAction = actions[actionName]

    if (newAction && newAction !== currentAction) {
      // Crossfade to new animation
      if (currentAction) {
        currentAction.fadeOut(0.3)
      }
      newAction.reset().fadeIn(0.3).play()
      setCurrentAction(newAction)
      onAnimationChange?.(animationState)
    }
  }, [animationState, actions, currentAction, onAnimationChange])

  // Update mouth morph target for lip-sync
  useFrame(() => {
    if (
      meshWithMorphs.current &&
      meshWithMorphs.current.morphTargetDictionary &&
      meshWithMorphs.current.morphTargetInfluences
    ) {
      const mouthIndex = meshWithMorphs.current.morphTargetDictionary['MouthOpen']
      if (mouthIndex !== undefined) {
        // Smooth interpolation for mouth movement
        const currentValue = meshWithMorphs.current.morphTargetInfluences[mouthIndex]
        meshWithMorphs.current.morphTargetInfluences[mouthIndex] = THREE.MathUtils.lerp(
          currentValue,
          mouthOpenness,
          0.2,
        )
      }
    }
  })

  // Subtle idle animation enhancement
  useFrame((state) => {
    if (group.current && animationState === 'idle') {
      // Add subtle breathing/floating effect on top of animation
      group.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.02
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05
    }
  })

  return <primitive ref={group} object={scene} dispose={null} />
}

// ============================================================================
// FALLBACK PLACEHOLDER (when GLB not loaded)
// ============================================================================

function AllyPlaceholder() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle bobbing and rotation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
    }
  })

  return (
    <mesh ref={meshRef}>
      {/* Main fluffy body - sphere */}
      <sphereGeometry args={[0.8, 32, 32]} />
      <meshStandardMaterial color="#b19cd9" roughness={0.8} metalness={0.1} />

      {/* Eyes */}
      <group position={[0, 0.2, 0.6]}>
        {/* Left eye */}
        <mesh position={[-0.25, 0, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-0.25, 0, 0.1]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#4a3728" />
        </mesh>

        {/* Right eye */}
        <mesh position={[0.25, 0, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.25, 0, 0.1]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#4a3728" />
        </mesh>
      </group>

      {/* Suit collar hint */}
      <mesh position={[0, -0.5, 0.3]}>
        <boxGeometry args={[0.6, 0.3, 0.2]} />
        <meshStandardMaterial color="#1e3a5f" />
      </mesh>
    </mesh>
  )
}

// ============================================================================
// LOADING COMPONENT
// ============================================================================

function LoadingIndicator() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
    }
  })

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[0.3, 0.1, 16, 32]} />
      <meshStandardMaterial color="#b19cd9" wireframe />
    </mesh>
  )
}

// ============================================================================
// SCENE SETUP
// ============================================================================

function SceneSetup({
  autoRotate,
  autoRotateSpeed,
  enableControls,
}: {
  autoRotate: boolean
  autoRotateSpeed: number
  enableControls: boolean
}) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-5, 3, -5]} intensity={0.3} />

      {/* Environment for reflections */}
      <Environment preset="studio" />

      {/* Soft shadow beneath character */}
      <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={3} blur={2} far={2} />

      {/* Camera controls */}
      {enableControls && (
        <OrbitControls
          autoRotate={autoRotate}
          autoRotateSpeed={autoRotateSpeed}
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
        />
      )}
    </>
  )
}

// ============================================================================
// CAMERA CONTROLLER
// ============================================================================

function CameraController() {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(0, 0.5, 3)
    camera.lookAt(0, 0, 0)
  }, [camera])

  return null
}

// ============================================================================
// MAIN EXPORT COMPONENT
// ============================================================================

export function AllyCharacter({
  animationState = 'idle',
  autoRotate = false,
  autoRotateSpeed = 1,
  enableControls = true,
  backgroundColor = null,
  scale = 1,
  onAnimationChange,
  className = '',
  mouthOpenness = 0,
}: AllyCharacterProps) {
  const [modelLoaded, setModelLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Check if GLB file exists
  useEffect(() => {
    fetch('/ally-3d.glb', { method: 'HEAD' })
      .then((res) => {
        if (res.ok) {
          setModelLoaded(true)
        } else {
          setHasError(true)
        }
      })
      .catch(() => {
        setHasError(true)
      })
  }, [])

  return (
    <div className={`w-full h-full ${className}`} style={{ backgroundColor: backgroundColor || 'transparent' }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: !backgroundColor }}
        camera={{ position: [0, 0.5, 3], fov: 45 }}
      >
        <CameraController />
        <SceneSetup autoRotate={autoRotate} autoRotateSpeed={autoRotateSpeed} enableControls={enableControls} />

        <Suspense fallback={<LoadingIndicator />}>
          <group scale={scale}>
            {modelLoaded && !hasError ? (
              <AllyModel
                animationState={animationState}
                mouthOpenness={mouthOpenness}
                onAnimationChange={onAnimationChange}
              />
            ) : (
              <AllyPlaceholder />
            )}
          </group>
        </Suspense>
      </Canvas>
    </div>
  )
}

// ============================================================================
// PRELOAD HOOK
// ============================================================================

export function usePreloadAllyModel() {
  useEffect(() => {
    useGLTF.preload('/ally-3d.glb')
  }, [])
}

// ============================================================================
// ANIMATION CONTROLLER HOOK
// ============================================================================

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

  // Simulate lip-sync from audio
  const simulateTalking = useCallback((durationMs: number) => {
    setAnimationState('talking')
    let elapsed = 0
    const interval = 50 // Update every 50ms

    const talkInterval = setInterval(() => {
      elapsed += interval
      if (elapsed >= durationMs) {
        clearInterval(talkInterval)
        setMouthOpenness(0)
        setAnimationState('idle')
      } else {
        // Random mouth movement to simulate speech
        setMouthOpenness(Math.random() * 0.8 + 0.1)
      }
    }, interval)

    return () => clearInterval(talkInterval)
  }, [])

  // Lip-sync from audio data (for real TTS integration)
  const updateMouthFromAudio = useCallback((audioLevel: number) => {
    // audioLevel should be 0-1, representing volume/amplitude
    setMouthOpenness(Math.min(1, audioLevel * 1.5))
  }, [])

  // Cleanup
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

// Default export for convenience
export default AllyCharacter
