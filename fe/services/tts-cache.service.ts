import type { TTSVoice } from '@/lib/validations/preferences'
import { voiceService } from './voice.service'

interface CacheEntry {
  audioBuffer: ArrayBuffer
  timestamp: number
}

const CACHE_MAX_SIZE = 50
const CACHE_TTL_MS = 30 * 60 * 1000

class TTSCacheService {
  private cache = new Map<string, CacheEntry>()

  private getCacheKey(text: string, voice: TTSVoice): string {
    return `${voice}:${text.slice(0, 100)}`
  }

  private evictOldEntries(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > CACHE_TTL_MS) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach((key) => this.cache.delete(key))

    if (this.cache.size > CACHE_MAX_SIZE) {
      const sortedEntries = Array.from(this.cache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp)

      const toRemove = sortedEntries.slice(0, this.cache.size - CACHE_MAX_SIZE)
      toRemove.forEach(([key]) => this.cache.delete(key))
    }
  }

  async synthesize(text: string, voice: TTSVoice = 'alloy'): Promise<ArrayBuffer> {
    const key = this.getCacheKey(text, voice)

    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.audioBuffer.slice(0)
    }

    const audioBuffer = await voiceService.synthesize(text, voice)

    this.evictOldEntries()

    this.cache.set(key, {
      audioBuffer: audioBuffer.slice(0),
      timestamp: Date.now(),
    })

    return audioBuffer
  }

  clear(): void {
    this.cache.clear()
  }

  get size(): number {
    return this.cache.size
  }
}

export const ttsCache = new TTSCacheService()
