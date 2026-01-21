import { describe, expect, it } from 'bun:test'
import { AxiosError, AxiosHeaders } from 'axios'
import { extractApiError } from '@/lib/query/types'

describe('extractApiError', () => {
  describe('AxiosError handling', () => {
    it('should extract error from AxiosError with response', () => {
      const axiosError = new AxiosError(
        'Request failed',
        'ERR_BAD_REQUEST',
        undefined,
        undefined,
        {
          status: 400,
          statusText: 'Bad Request',
          headers: new AxiosHeaders(),
          config: { headers: new AxiosHeaders() },
          data: {
            message: 'Invalid email format',
            code: 'VALIDATION_ERROR',
            details: { field: 'email', reason: 'invalid format' },
          },
        }
      )

      const result = extractApiError(axiosError)

      expect(result.status).toBe(400)
      expect(result.message).toBe('Invalid email format')
      expect(result.code).toBe('VALIDATION_ERROR')
      expect(result.details).toEqual({ field: 'email', reason: 'invalid format' })
    })

    it('should handle AxiosError with 401 unauthorized', () => {
      const axiosError = new AxiosError(
        'Unauthorized',
        'ERR_BAD_REQUEST',
        undefined,
        undefined,
        {
          status: 401,
          statusText: 'Unauthorized',
          headers: new AxiosHeaders(),
          config: { headers: new AxiosHeaders() },
          data: { message: 'Invalid token' },
        }
      )

      const result = extractApiError(axiosError)

      expect(result.status).toBe(401)
      expect(result.message).toBe('Invalid token')
    })

    it('should handle AxiosError with 404 not found', () => {
      const axiosError = new AxiosError(
        'Not Found',
        'ERR_BAD_REQUEST',
        undefined,
        undefined,
        {
          status: 404,
          statusText: 'Not Found',
          headers: new AxiosHeaders(),
          config: { headers: new AxiosHeaders() },
          data: { message: 'Resource not found' },
        }
      )

      const result = extractApiError(axiosError)

      expect(result.status).toBe(404)
      expect(result.message).toBe('Resource not found')
    })

    it('should handle AxiosError with 500 server error', () => {
      const axiosError = new AxiosError(
        'Internal Server Error',
        'ERR_BAD_RESPONSE',
        undefined,
        undefined,
        {
          status: 500,
          statusText: 'Internal Server Error',
          headers: new AxiosHeaders(),
          config: { headers: new AxiosHeaders() },
          data: { message: 'Something went wrong' },
        }
      )

      const result = extractApiError(axiosError)

      expect(result.status).toBe(500)
      expect(result.message).toBe('Something went wrong')
    })

    it('should use error.message when response.data.message is missing', () => {
      const axiosError = new AxiosError(
        'Network Error',
        'ERR_NETWORK',
        undefined,
        undefined,
        {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new AxiosHeaders(),
          config: { headers: new AxiosHeaders() },
          data: {},
        }
      )

      const result = extractApiError(axiosError)

      expect(result.status).toBe(503)
      expect(result.message).toBe('Network Error')
    })

    it('should default to 500 when response is missing', () => {
      const axiosError = new AxiosError('Network Error', 'ERR_NETWORK')

      const result = extractApiError(axiosError)

      expect(result.status).toBe(500)
      expect(result.message).toBe('Network Error')
    })

    it('should fallback to generic message when all messages are undefined', () => {
      const axiosError = new AxiosError(
        undefined as unknown as string,
        'ERR_NETWORK',
        undefined,
        undefined,
        {
          status: 502,
          statusText: 'Bad Gateway',
          headers: new AxiosHeaders(),
          config: { headers: new AxiosHeaders() },
          data: null,
        }
      )

      const result = extractApiError(axiosError)

      expect(result.status).toBe(502)
      expect(result.message).toBe('An error occurred')
    })
  })

  describe('standard Error handling', () => {
    it('should extract message from standard Error', () => {
      const error = new Error('Something went wrong')

      const result = extractApiError(error)

      expect(result.status).toBe(500)
      expect(result.message).toBe('Something went wrong')
      expect(result.code).toBeUndefined()
      expect(result.details).toBeUndefined()
    })

    it('should handle TypeError', () => {
      const error = new TypeError('Cannot read property of undefined')

      const result = extractApiError(error)

      expect(result.status).toBe(500)
      expect(result.message).toBe('Cannot read property of undefined')
    })

    it('should handle RangeError', () => {
      const error = new RangeError('Invalid array length')

      const result = extractApiError(error)

      expect(result.status).toBe(500)
      expect(result.message).toBe('Invalid array length')
    })
  })

  describe('unknown error handling', () => {
    it('should handle string error', () => {
      const error = 'Something went wrong'

      const result = extractApiError(error)

      expect(result.status).toBe(500)
      expect(result.message).toBe('An unknown error occurred')
    })

    it('should handle null', () => {
      const result = extractApiError(null)

      expect(result.status).toBe(500)
      expect(result.message).toBe('An unknown error occurred')
    })

    it('should handle undefined', () => {
      const result = extractApiError(undefined)

      expect(result.status).toBe(500)
      expect(result.message).toBe('An unknown error occurred')
    })

    it('should handle number', () => {
      const result = extractApiError(404)

      expect(result.status).toBe(500)
      expect(result.message).toBe('An unknown error occurred')
    })

    it('should handle plain object', () => {
      const result = extractApiError({ code: 'ERROR', msg: 'Something' })

      expect(result.status).toBe(500)
      expect(result.message).toBe('An unknown error occurred')
    })
  })

  describe('edge cases', () => {
    it('should handle AxiosError with null response data', () => {
      const axiosError = new AxiosError(
        'Request failed',
        'ERR_BAD_REQUEST',
        undefined,
        undefined,
        {
          status: 400,
          statusText: 'Bad Request',
          headers: new AxiosHeaders(),
          config: { headers: new AxiosHeaders() },
          data: null,
        }
      )

      const result = extractApiError(axiosError)

      expect(result.status).toBe(400)
      expect(result.message).toBe('Request failed')
    })

    it('should handle AxiosError with empty string message', () => {
      const axiosError = new AxiosError(
        '',
        'ERR_BAD_REQUEST',
        undefined,
        undefined,
        {
          status: 422,
          statusText: 'Unprocessable Entity',
          headers: new AxiosHeaders(),
          config: { headers: new AxiosHeaders() },
          data: { message: '' },
        }
      )

      const result = extractApiError(axiosError)

      expect(result.status).toBe(422)
      expect(result.message).toBe('')
    })
  })
})
