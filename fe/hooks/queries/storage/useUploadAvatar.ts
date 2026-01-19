import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

async function updateUserProfile(avatarUrl: string) {
  const response = await fetch('/api/users/profile', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ avatar_url: avatarUrl }),
  })

  if (!response.ok) {
    throw new Error('Failed to update user profile')
  }
}

interface UploadAvatarParams {
  file: File
}

interface UploadAvatarResponse {
  url: string
  path: string
}

export function useUploadAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ file }: UploadAvatarParams): Promise<UploadAvatarResponse> => {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch('/api/storage/avatar', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to upload avatar')
      }

      return response.json()
    },
    onSuccess: async (data) => {
      try {
        // Update user profile with new avatar URL
        await updateUserProfile(data.url)

        // Invalidate user queries to refresh avatar
        queryClient.invalidateQueries({ queryKey: ['user'] })
        queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })

        toast.success('Avatar uploaded successfully')
        return data
      } catch (error) {
        // Avatar was uploaded but profile update failed
        toast.error('Avatar uploaded but failed to update profile. Please refresh the page.')
        return data
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to upload avatar')
      throw error
    },
  })
}