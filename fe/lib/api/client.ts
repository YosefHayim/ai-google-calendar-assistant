import { ENV } from '../constants'
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

const ACCESS_TOKEN_HEADER = 'allyAccessToken'
const REFRESH_TOKEN_HEADER = 'allyRefreshToken'
const USER_KEY = 'allyUser'

export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Track if we're currently refreshing to avoid multiple refresh attempts
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(ACCESS_TOKEN_HEADER)
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_HEADER)

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (refreshToken) {
      config.headers['refresh_token'] = refreshToken
    }
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => {
    // Check for new tokens in response headers
    if (typeof window !== 'undefined') {
      const newAccessToken = response.headers[ACCESS_TOKEN_HEADER]
      const newRefreshToken = response.headers[REFRESH_TOKEN_HEADER]

      if (newAccessToken) {
        localStorage.setItem(ACCESS_TOKEN_HEADER, newAccessToken)
      }

      if (newRefreshToken) {
        localStorage.setItem(REFRESH_TOKEN_HEADER, newRefreshToken)
      }
    }

    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Check if this is a 401 error with SESSION_EXPIRED code
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const responseData = error.response.data as { data?: { code?: string } }
      const errorCode = responseData?.data?.code

      if (errorCode === 'SESSION_EXPIRED' || errorCode === 'SESSION_REFRESH_FAILED') {
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then(() => {
              return apiClient(originalRequest)
            })
            .catch((err) => {
              return Promise.reject(err)
            })
        }

        originalRequest._retry = true
        isRefreshing = true

        const refreshToken = localStorage.getItem(REFRESH_TOKEN_HEADER)

        if (!refreshToken) {
          // No refresh token available, redirect to login
          isRefreshing = false
          processQueue(error, null)
          if (typeof window !== 'undefined') {
            localStorage.removeItem(USER_KEY)
            localStorage.removeItem(ACCESS_TOKEN_HEADER)
            localStorage.removeItem(REFRESH_TOKEN_HEADER)
            window.location.href = '/login?error=session_expired'
          }
          return Promise.reject(error)
        }

        try {
          // Retry the original request with the refresh token
          // The backend middleware will handle the refresh automatically
          const response = await apiClient(originalRequest)

          // Update tokens from response headers if present
          const newAccessToken = response.headers[ACCESS_TOKEN_HEADER]
          const newRefreshToken = response.headers[REFRESH_TOKEN_HEADER]

          if (newAccessToken) {
            localStorage.setItem(ACCESS_TOKEN_HEADER, newAccessToken)
          }

          if (newRefreshToken) {
            localStorage.setItem(REFRESH_TOKEN_HEADER, newRefreshToken)
          }

          isRefreshing = false
          processQueue(null, null)
          return response
        } catch (refreshError) {
          isRefreshing = false
          processQueue(refreshError as AxiosError, null)

          // Refresh failed, clear auth and redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem(USER_KEY)
            localStorage.removeItem(ACCESS_TOKEN_HEADER)
            localStorage.removeItem(REFRESH_TOKEN_HEADER)
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
