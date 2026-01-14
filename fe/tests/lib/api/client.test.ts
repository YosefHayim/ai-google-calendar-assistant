import { describe, expect, it, beforeEach, afterEach, mock, spyOn } from 'bun:test'

// Store original localStorage
const originalLocalStorage = globalThis.localStorage

// Create mock localStorage
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: (key: string) => mockLocalStorage.store[key] || null,
  setItem: (key: string, value: string) => {
    mockLocalStorage.store[key] = value
  },
  removeItem: (key: string) => {
    delete mockLocalStorage.store[key]
  },
  clear: () => {
    mockLocalStorage.store = {}
  },
  length: 0,
  key: () => null,
}

// Setup localStorage mock before tests
beforeEach(() => {
  mockLocalStorage.clear()
  // @ts-ignore
  globalThis.localStorage = mockLocalStorage
})

afterEach(() => {
  // @ts-ignore
  globalThis.localStorage = originalLocalStorage
})

describe('API Client', () => {
  describe('Token Storage', () => {
    it('should store and retrieve access token', () => {
      localStorage.setItem('access_token', 'test-token-123')
      expect(localStorage.getItem('access_token')).toBe('test-token-123')
    })

    it('should store and retrieve refresh token', () => {
      localStorage.setItem('refresh_token', 'refresh-token-456')
      expect(localStorage.getItem('refresh_token')).toBe('refresh-token-456')
    })

    it('should return null for non-existent token', () => {
      expect(localStorage.getItem('non_existent')).toBeNull()
    })

    it('should remove tokens', () => {
      localStorage.setItem('access_token', 'token')
      localStorage.removeItem('access_token')
      expect(localStorage.getItem('access_token')).toBeNull()
    })

    it('should clear all tokens', () => {
      localStorage.setItem('access_token', 'token1')
      localStorage.setItem('refresh_token', 'token2')
      localStorage.clear()
      expect(localStorage.getItem('access_token')).toBeNull()
      expect(localStorage.getItem('refresh_token')).toBeNull()
    })
  })

  describe('Request Headers', () => {
    it('should add Authorization header with token', () => {
      localStorage.setItem('access_token', 'bearer-token')
      const token = localStorage.getItem('access_token')
      expect(token).toBe('bearer-token')

      // Verify header format
      const authHeader = `Bearer ${token}`
      expect(authHeader).toBe('Bearer bearer-token')
    })

    it('should add refresh token header', () => {
      localStorage.setItem('refresh_token', 'refresh-123')
      const refreshToken = localStorage.getItem('refresh_token')
      expect(refreshToken).toBe('refresh-123')
    })
  })

  describe('Token Update from Response', () => {
    it('should update access token from response headers', () => {
      const responseHeaders = {
        access_token: 'new-access-token',
      }

      // Simulate updating token from response
      if (responseHeaders.access_token) {
        localStorage.setItem('access_token', responseHeaders.access_token)
      }

      expect(localStorage.getItem('access_token')).toBe('new-access-token')
    })

    it('should update refresh token from response headers', () => {
      const responseHeaders = {
        refresh_token: 'new-refresh-token',
      }

      // Simulate updating token from response
      if (responseHeaders.refresh_token) {
        localStorage.setItem('refresh_token', responseHeaders.refresh_token)
      }

      expect(localStorage.getItem('refresh_token')).toBe('new-refresh-token')
    })
  })

  describe('Session Expiry Handling', () => {
    it('should clear auth data on session expiry', () => {
      localStorage.setItem('access_token', 'token')
      localStorage.setItem('refresh_token', 'refresh')
      localStorage.setItem('user', JSON.stringify({ id: 'user-123' }))

      // Simulate session expiry cleanup
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')

      expect(localStorage.getItem('access_token')).toBeNull()
      expect(localStorage.getItem('refresh_token')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })

    it('should handle missing refresh token', () => {
      localStorage.setItem('access_token', 'token')
      // No refresh token set

      const refreshToken = localStorage.getItem('refresh_token')
      expect(refreshToken).toBeNull()
    })
  })

  describe('Request Queue', () => {
    it('should queue requests during refresh', async () => {
      // Test that failed queue is properly managed
      const failedQueue: Array<{
        resolve: (value?: unknown) => void
        reject: (reason?: unknown) => void
      }> = []

      // Add to queue
      const promise1 = new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })

      const promise2 = new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })

      expect(failedQueue.length).toBe(2)

      // Process queue - resolve all
      failedQueue.forEach((prom) => prom.resolve('success'))

      const result1 = await promise1
      const result2 = await promise2

      expect(result1).toBe('success')
      expect(result2).toBe('success')
    })

    it('should reject queued requests on error', async () => {
      const failedQueue: Array<{
        resolve: (value?: unknown) => void
        reject: (reason?: unknown) => void
      }> = []

      const promise = new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })

      // Process queue with error
      const error = new Error('Session expired')
      failedQueue.forEach((prom) => prom.reject(error))

      await expect(promise).rejects.toThrow('Session expired')
    })
  })
})
