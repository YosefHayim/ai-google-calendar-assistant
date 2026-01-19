import { useQuery } from '@tanstack/react-query'
import type { FileObject } from '@supabase/storage-js'

interface ListUserFilesParams {
  bucket: string
  limit?: number
  offset?: number
}

interface ListUserFilesResponse {
  files: FileObject[]
}

export function useListUserFiles(params: ListUserFilesParams, enabled = true) {
  return useQuery({
    queryKey: ['storage', 'files', params.bucket, params.limit, params.offset],
    queryFn: async (): Promise<ListUserFilesResponse> => {
      const queryParams = new URLSearchParams()
      if (params.limit) queryParams.set('limit', params.limit.toString())
      if (params.offset) queryParams.set('offset', params.offset.toString())

      const url = `/api/storage/files/${params.bucket}?${queryParams.toString()}`
      const response = await fetch(url)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to list files')
      }

      return response.json()
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}