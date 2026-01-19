import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'

interface UploadAttachmentParams {
  file: File
}

interface UploadAttachmentResponse {
  url: string
  path: string
}

export function useUploadAttachment() {
  return useMutation({
    mutationFn: async ({ file }: UploadAttachmentParams): Promise<UploadAttachmentResponse> => {
      const formData = new FormData()
      formData.append('attachment', file)

      const response = await fetch('/api/storage/attachment', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to upload attachment')
      }

      return response.json()
    },
    onSuccess: (data) => {
      toast.success('Attachment uploaded successfully')
      return data
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to upload attachment')
      throw error
    },
  })
}