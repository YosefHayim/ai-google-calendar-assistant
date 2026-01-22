'use client'

'use client'

import { Mesh, Program, Renderer, Triangle, Vec3 } from 'ogl'
import React, { FC, useEffect, useRef } from 'react'

import { cn } from '@/components/../lib/utils'

interface VoicePoweredOrbProps {
  className?: string
  hue?: number
  enableVoiceControl?: boolean
  voiceSensitivity?: number
  maxRotationSpeed?: number
  maxHoverIntensity?: number
  isLoading?: boolean
  isSpeaking?: boolean
  isTyping?: boolean
  onVoiceDetected?: (detected: boolean) => void
}

export const VoicePoweredOrb: FC<VoicePoweredOrbProps> = ({
  className,
  hue = 0,
  enableVoiceControl = true,
  voiceSensitivity = 2.5,
  maxRotationSpeed = 1.2,
  maxHoverIntensity = 0.8,
  isLoading = false,
  isSpeaking = false,
  isTyping = false,
  onVoiceDetected,
}) => {
  const ctnDom = useRef<HTMLDivElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  const smoothedAudioLevel = useRef<number>(0)
  const targetAudioLevel = useRef<number>(0)
  const isLoadingRef = useRef<boolean>(isLoading)
  const isSpeakingRef = useRef<boolean>(isSpeaking)
  const isTypingRef = useRef<boolean>(isTyping)
  const speakingPhase = useRef<number>(0)
  const typingPhase = useRef<number>(0)

  useEffect(() => {
    isLoadingRef.current = isLoading
  }, [isLoading])

  useEffect(() => {
    isSpeakingRef.current = isSpeaking
  }, [isSpeaking])

  useEffect(() => {
    isTypingRef.current = isTyping
  }, [isTyping])

  const vert = /* glsl */ `
    precision highp float;
    attribute vec2 position;
    attribute vec2 uv;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `

  const frag = /* glsl */ `
    precision highp float;

    uniform float iTime;
    uniform vec3 iResolution;
    uniform float hue;
    uniform float hover;
    uniform float rot;
    uniform float hoverIntensity;
    uniform float loadingPulse;
    varying vec2 vUv;

    vec3 rgb2yiq(vec3 c) {
      float y = dot(c, vec3(0.299, 0.587, 0.114));
      float i = dot(c, vec3(0.596, -0.274, -0.322));
      float q = dot(c, vec3(0.211, -0.523, 0.312));
      return vec3(y, i, q);
    }

    vec3 yiq2rgb(vec3 c) {
      float r = c.x + 0.956 * c.y + 0.621 * c.z;
      float g = c.x - 0.272 * c.y - 0.647 * c.z;
      float b = c.x - 1.106 * c.y + 1.703 * c.z;
      return vec3(r, g, b);
    }

    vec3 adjustHue(vec3 color, float hueDeg) {
      float hueRad = hueDeg * 3.14159265 / 180.0;
      vec3 yiq = rgb2yiq(color);
      float cosA = cos(hueRad);
      float sinA = sin(hueRad);
      float i = yiq.y * cosA - yiq.z * sinA;
      float q = yiq.y * sinA + yiq.z * cosA;
      yiq.y = i;
      yiq.z = q;
      return yiq2rgb(yiq);
    }

    vec3 hash33(vec3 p3) {
      p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));
      p3 += dot(p3, p3.yxz + 19.19);
      return -1.0 + 2.0 * fract(vec3(
        p3.x + p3.y,
        p3.x + p3.z,
        p3.y + p3.z
      ) * p3.zyx);
    }

    float snoise3(vec3 p) {
      const float K1 = 0.333333333;
      const float K2 = 0.166666667;
      vec3 i = floor(p + (p.x + p.y + p.z) * K1);
      vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
      vec3 e = step(vec3(0.0), d0 - d0.yzx);
      vec3 i1 = e * (1.0 - e.zxy);
      vec3 i2 = 1.0 - e.zxy * (1.0 - e);
      vec3 d1 = d0 - (i1 - K2);
      vec3 d2 = d0 - (i2 - K1);
      vec3 d3 = d0 - 0.5;
      vec4 h = max(0.6 - vec4(
        dot(d0, d0),
        dot(d1, d1),
        dot(d2, d2),
        dot(d3, d3)
      ), 0.0);
      vec4 n = h * h * h * h * vec4(
        dot(d0, hash33(i)),
        dot(d1, hash33(i + i1)),
        dot(d2, hash33(i + i2)),
        dot(d3, hash33(i + 1.0))
      );
      return dot(vec4(31.316), n);
    }

    vec4 extractAlpha(vec3 colorIn) {
      float a = max(max(colorIn.r, colorIn.g), colorIn.b);
      return vec4(colorIn.rgb / (a + 1e-5), a);
    }

    // Ally Brand Colors
    const vec3 baseColor1 = vec3(0.949, 0.388, 0.024); // #f26306 Primary
    const vec3 baseColor2 = vec3(1.0, 0.55, 0.2);     // Solar highlight orange
    const vec3 baseColor3 = vec3(0.12, 0.05, 0.0);    // Deep Burnt Shadows
    
    const float innerRadius = 0.6;
    const float noiseScale = 0.65;

    float light1(float intensity, float attenuation, float dist) {
      return intensity / (1.0 + dist * attenuation);
    }

    float light2(float intensity, float attenuation, float dist) {
      return intensity / (1.0 + dist * dist * attenuation);
    }

    vec4 draw(vec2 uv, float iTime, float hue) {
      vec3 color1 = adjustHue(baseColor1, hue);
      vec3 color2 = adjustHue(baseColor2, hue);
      vec3 color3 = adjustHue(baseColor3, hue);

      float ang = atan(uv.y, uv.x);
      float len = length(uv);
      float invLen = len > 0.0 ? 1.0 / len : 0.0;

      float n0 = snoise3(vec3(uv * noiseScale, iTime * 0.5)) * 0.5 + 0.5;
      float r0 = mix(mix(innerRadius, 1.0, 0.4), mix(innerRadius, 1.0, 0.6), n0);
      float d0 = distance(uv, (r0 * invLen) * uv);
      float v0 = light1(1.0, 10.0, d0);
      v0 *= smoothstep(r0 * 1.05, r0, len);
      float cl = cos(ang + iTime * 2.0) * 0.5 + 0.5;

      float a = iTime * -1.0;
      vec2 pos = vec2(cos(a), sin(a)) * r0;
      float d = distance(uv, pos);
      float v1 = light2(1.5, 5.0, d);
      v1 *= light1(1.0, 50.0, d0);

      float v2 = smoothstep(1.0, mix(innerRadius, 1.0, n0 * 0.5), len);
      float v3 = smoothstep(innerRadius, mix(innerRadius, 1.0, 0.5), len);

      vec3 col = mix(color1, color2, cl);
      col = mix(color3, col, v0);
      col = (col + v1) * v2 * v3;
      col = clamp(col, 0.0, 1.0);

      return extractAlpha(col);
    }

    void main() {
      vec2 fragCoord = vUv * iResolution.xy;
      vec2 center = iResolution.xy * 0.5;
      float size = min(iResolution.x, iResolution.y);
      vec2 uv = (fragCoord - center) / size * 2.0;

      float angle = rot;
      float s = sin(angle);
      float c = cos(angle);
      uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);

      // CORRESPONDENCE: High-quality distortion based on voice level
      float distortAmount = hover * hoverIntensity * 0.1;
      uv.x += distortAmount * sin(uv.y * 8.0 + iTime * 2.0);
      uv.y += distortAmount * sin(uv.x * 8.0 + iTime * 2.0);

      // Loading pulse effect - adds breathing glow when AI is thinking
      float loadingDistort = loadingPulse * 0.05;
      uv.x += loadingDistort * sin(uv.y * 4.0 + iTime * 3.0);
      uv.y += loadingDistort * cos(uv.x * 4.0 + iTime * 3.0);

      vec4 col = draw(uv, iTime, hue);

      // Add glow effect during loading
      float glowIntensity = loadingPulse * 0.3;
      col.rgb += vec3(glowIntensity * 0.8, glowIntensity * 0.4, glowIntensity * 0.1);

      gl_FragColor = vec4(col.rgb * col.a, col.a);
    }
  `

  const stopMicrophone = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop())
      mediaStreamRef.current = null
    }
    if (microphoneRef.current) {
      microphoneRef.current.disconnect()
      microphoneRef.current = null
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect()
      analyserRef.current = null
    }
    targetAudioLevel.current = 0
  }

  const isAudioContextUsable = (ctx: AudioContext | null): ctx is AudioContext => {
    return ctx !== null && ctx.state !== 'closed'
  }

  const initMicrophone = async (cleanedUp: { current: boolean }) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume()
      }

      if (cleanedUp.current || !isAudioContextUsable(audioContextRef.current)) {
        return false
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      })

      if (cleanedUp.current || !isAudioContextUsable(audioContextRef.current)) {
        stream.getTracks().forEach((t) => t.stop())
        return false
      }

      mediaStreamRef.current = stream
      analyserRef.current = audioContextRef.current.createAnalyser()
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current.fftSize = 256
      analyserRef.current.smoothingTimeConstant = 0.5
      microphoneRef.current.connect(analyserRef.current)
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount)
      return true
    } catch (error) {
      console.warn('Orb: Audio connection suppressed.', error)
      return false
    }
  }

  useEffect(() => {
    const cleanedUp = { current: false }

    if (enableVoiceControl) {
      initMicrophone(cleanedUp)
    } else {
      stopMicrophone()
    }

    return () => {
      cleanedUp.current = true
      stopMicrophone()
    }
  }, [enableVoiceControl])

  useEffect(() => {
    const container = ctnDom.current
    if (!container) return

    let rendererInstance: Renderer | null = null
    let glContext: WebGLRenderingContext | WebGL2RenderingContext | null = null
    let rafId: number
    let program: Program | null = null

    try {
      rendererInstance = new Renderer({ alpha: true, antialias: true, dpr: window.devicePixelRatio || 1 })
      glContext = rendererInstance.gl
      glContext.clearColor(0, 0, 0, 0)

      // Clear container safely for Trusted Types
      while (container.firstChild) {
        container.removeChild(container.firstChild)
      }
      container.appendChild(glContext.canvas as HTMLCanvasElement)

      const geometry = new Triangle(glContext as any)
      program = new Program(glContext as any, {
        vertex: vert,
        fragment: frag,
        uniforms: {
          iTime: { value: 0 },
          iResolution: { value: new Vec3(0, 0, 1) },
          hue: { value: hue },
          hover: { value: 0 },
          rot: { value: 0 },
          hoverIntensity: { value: 0 },
          loadingPulse: { value: 0 },
        },
      })

      const mesh = new Mesh(glContext as any, { geometry, program })

      const resize = () => {
        if (!container || !rendererInstance || !glContext) return
        const dpr = window.devicePixelRatio || 1
        const width = container.clientWidth
        const height = container.clientHeight
        if (width === 0 || height === 0) return

        rendererInstance.setSize(width * dpr, height * dpr)
        ;(glContext.canvas as HTMLCanvasElement).style.width = width + 'px'
        ;(glContext.canvas as HTMLCanvasElement).style.height = height + 'px'

        if (program) {
          program.uniforms.iResolution.value.set(
            glContext.canvas.width,
            glContext.canvas.height,
            glContext.canvas.width / glContext.canvas.height,
          )
        }
      }

      const resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(container)
      resize()

      let lastTime = 0
      let currentRot = 0
      const baseRotationSpeed = 0.2

      const update = (t: number) => {
        rafId = requestAnimationFrame(update)
        if (!program) return
        const dt = (t - lastTime) * 0.001
        lastTime = t
        program.uniforms.iTime.value = t * 0.001
        program.uniforms.hue.value = hue

        if (analyserRef.current && dataArrayRef.current) {
          analyserRef.current.getByteFrequencyData(dataArrayRef.current)
          let sum = 0
          for (let i = 0; i < dataArrayRef.current.length; i++) {
            const value = dataArrayRef.current[i] / 255
            sum += value * value
          }
          const rms = Math.sqrt(sum / dataArrayRef.current.length)
          // Correspondence: Map RMS to target level with sensitivity boost
          targetAudioLevel.current = Math.min(rms * voiceSensitivity, 1.2)

          if (onVoiceDetected) onVoiceDetected(targetAudioLevel.current > 0.05)
        }

        // Add speaking animation (pulsing effect when TTS is playing)
        if (isSpeakingRef.current) {
          speakingPhase.current += dt * 8 // Fast oscillation for speaking
          const speakingIntensity = (Math.sin(speakingPhase.current) + 1) * 0.3 + 0.4 // Range 0.4-1.0
          targetAudioLevel.current = Math.max(targetAudioLevel.current, speakingIntensity)
        } else {
          speakingPhase.current = 0
        }

        // Add typing animation (subtle pulse when user types)
        if (isTypingRef.current) {
          typingPhase.current += dt * 4 // Slower oscillation for typing
          const typingIntensity = (Math.sin(typingPhase.current) + 1) * 0.15 + 0.1 // Range 0.1-0.4
          targetAudioLevel.current = Math.max(targetAudioLevel.current, typingIntensity)
        } else {
          typingPhase.current = 0
        }

        // Correspondence: Smooth lerp but fast enough to feel real-time
        const lerpFactor = 0.15
        smoothedAudioLevel.current += (targetAudioLevel.current - smoothedAudioLevel.current) * lerpFactor

        const voiceLevel = smoothedAudioLevel.current
        const voiceRotationSpeed = baseRotationSpeed + voiceLevel * maxRotationSpeed
        currentRot += dt * (voiceLevel > 0.02 ? voiceRotationSpeed : baseRotationSpeed)

        program.uniforms.hover.value = voiceLevel
        program.uniforms.hoverIntensity.value = maxHoverIntensity
        program.uniforms.rot.value = currentRot

        // Loading pulse animation - smooth sine wave breathing effect
        if (isLoadingRef.current) {
          const pulseValue = (Math.sin(t * 0.004) + 1) * 0.5 // Oscillates 0-1
          program.uniforms.loadingPulse.value = pulseValue
        } else {
          // Smoothly fade out loading pulse when not loading
          program.uniforms.loadingPulse.value *= 0.9
        }

        if (rendererInstance && glContext) {
          glContext.clear(glContext.COLOR_BUFFER_BIT)
          rendererInstance.render({ scene: mesh })
        }
      }

      rafId = requestAnimationFrame(update)

      return () => {
        cancelAnimationFrame(rafId)
        resizeObserver.disconnect()
        stopMicrophone()
        if (glContext) glContext.getExtension('WEBGL_lose_context')?.loseContext()
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close()
        }
      }
    } catch (error) {
      console.error('Orb: Failed to start render engine.', error)
    }
  }, [hue, voiceSensitivity, maxRotationSpeed, maxHoverIntensity])

  return <div ref={ctnDom} className={cn('w-full h-full relative cursor-pointer', className)} />
}
