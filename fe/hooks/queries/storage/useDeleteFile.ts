import { useMutation, useQueryClient } from '@tanstack/react-query'

import { toast } from 'sonner'

interface DeleteFileParams {
  bucket: string
  path: string
}

export function useDeleteFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ bucket, path }: DeleteFileParams): Promise<void> => {
      const encodedPath = encodeURIComponent(path)
      const response = await fetch(`/api/storage/file/${bucket}/${encodedPath}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete file')
      }
    },
    onSuccess: (_, { bucket }) => {
      // Invalidate file lists for the bucket
      queryClient.invalidateQueries({ queryKey: ['storage', 'files', bucket] })

      // If it's an avatar, also invalidate user queries
      if (bucket === 'avatars') {
        queryClient.invalidateQueries({ queryKey: ['user'] })
        queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })
      }

      toast.success('File deleted successfully')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete file')
      throw error
    },
  })
}
