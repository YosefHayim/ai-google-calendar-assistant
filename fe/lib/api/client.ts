import { ENV, STORAGE_KEYS } from '../constants'
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

interface SessionErrorResponse {
  data?: {
    code?: string
  }
}

const GOOGLE_REAUTH_CODES = ['GOOGLE_REAUTH_REQUIRED', 'GOOGLE_TOKEN_REFRESH_FAILED']
const SUPABASE_SESSION_CODES = ['SESSION_EXPIRED', 'SESSION_REFRESH_FAILED']

export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },

  withCredentials: true,
})

// SameSite=Lax cookies don't work with cross-origin AJAX - must send tokens via headers
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
      if (accessToken && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${accessToken}`
      }
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
      if (refreshToken && !config.headers.refresh_token) {
        config.headers.refresh_token = refreshToken
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })

  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => {
    if (typeof window !== 'undefined') {
      const newAccessToken = response.headers['access_token']
      const newRefreshToken = response.headers['refresh_token']
      if (newAccessToken) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken)
      }
      if (newRefreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken)
      }
    }
    return response
  },
  async (error: AxiosError<SessionErrorResponse>) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined
    if (!originalRequest) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      const errorCode = error.response.data?.data?.code

      if (errorCode && GOOGLE_REAUTH_CODES.includes(errorCode)) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('google_reauth_required', 'true')
          window.location.href = '/dashboard?google_reauth=required'
        }
        return Promise.reject(error)
      }

      if (errorCode && SUPABASE_SESSION_CODES.includes(errorCode)) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then(() => apiClient(originalRequest))
            .catch((err) => Promise.reject(err))
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const response = await apiClient(originalRequest)
          isRefreshing = false
          processQueue(null)
          return response
        } catch (refreshError) {
          isRefreshing = false
          const axiosRefreshError = axios.isAxiosError(refreshError) ? refreshError : null
          processQueue(axiosRefreshError)

          if (typeof window !== 'undefined') {
            window.location.href = '/login?error=session_expired'
          }

          return Promise.reject(refreshError)
        }
      }
    }

    console.error('API Client Error:', error)
    return Promise.reject(error)
  },
)
