import { useQuery } from '@tanstack/react-query'

interface GetFileUrlParams {
  bucket: string
  path: string
}

interface GetFileUrlResponse {
  url: string
}

export function useGetFileUrl(params: GetFileUrlParams, enabled = true) {
  return useQuery({
    queryKey: ['storage', 'file-url', params.bucket, params.path],
    queryFn: async (): Promise<GetFileUrlResponse> => {
      const encodedPath = encodeURIComponent(params.path)
      const response = await fetch(`/api/storage/file/${params.bucket}/${encodedPath}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to get file URL')
      }

      return response.json()
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}
