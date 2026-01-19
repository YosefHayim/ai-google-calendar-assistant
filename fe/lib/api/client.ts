import { ENV, STORAGE_KEYS } from '../constants'
import axios, { type AxiosError } from 'axios'

interface SessionErrorResponse {
  data?: {
    code?: string
  }
}

const GOOGLE_REAUTH_CODES = ['GOOGLE_REAUTH_REQUIRED', 'GOOGLE_TOKEN_REFRESH_FAILED']
const SUPABASE_SESSION_CODES = ['SESSION_EXPIRED', 'SESSION_REFRESH_FAILED']
const FORCE_LOGOUT_CODES = ['USER_NOT_FOUND', 'ACCOUNT_DEACTIVATED']

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
    if (!error.config) {
      return Promise.reject(error)
    }

    const errorCode = error.response?.data?.data?.code
    const isUnauthorized = error.response?.status === 401
    const isForbidden = error.response?.status === 403

    if ((isUnauthorized || isForbidden) && errorCode && FORCE_LOGOUT_CODES.includes(errorCode)) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
        const errorParam = errorCode === 'USER_NOT_FOUND' ? 'account_deleted' : 'account_deactivated'
        window.location.href = `/login?error=${errorParam}`
      }
      return Promise.reject(error)
    }

    if (isUnauthorized) {
      if (errorCode && GOOGLE_REAUTH_CODES.includes(errorCode)) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('google_reauth_required', 'true')
          window.location.href = '/dashboard?google_reauth=required'
        }
        return Promise.reject(error)
      }

      if (errorCode && SUPABASE_SESSION_CODES.includes(errorCode)) {
        // Session expired - clear tokens and redirect to login
        // Don't retry - the backend already tried to refresh and it failed
        if (typeof window !== 'undefined') {
          // CRITICAL: Clear tokens BEFORE redirecting to prevent infinite loop
          // Without this, LoginPage sees stale token → fires useUser → gets 401 → redirects again
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
          window.location.href = '/login?error=session_expired'
        }
        return Promise.reject(error)
      }
    }

    console.error('API Client Error:', error)
    return Promise.reject(error)
  },
)
