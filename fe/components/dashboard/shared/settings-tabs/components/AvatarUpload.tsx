'use client'

import React, { useRef, useState } from 'react'
import Image from 'next/image'
import { Camera, X, Upload, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useUploadAvatar, useDeleteFile } from '@/hooks/queries'

async function updateUserProfile(avatarUrl?: string) {
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
import { getUserDisplayInfo, type UserData } from '@/lib/user-utils'
import { cn } from '@/lib/utils'

interface AvatarUploadProps {
  userData: UserData | null | undefined
  className?: string
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({ userData, className }) => {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const { mutate: uploadAvatar, isPending: isUploading } = useUploadAvatar()
  const { mutate: deleteAvatar, isPending: isDeleting } = useDeleteFile()

  const userInfo = getUserDisplayInfo(userData)
  const avatarUrl = userInfo?.avatarUrl
  const initials = userInfo?.initials ?? 'U'
  const fullName = userInfo?.fullName ?? 'User'

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('settings.avatar.invalidFileType', 'Please select a valid image file'))
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('settings.avatar.fileTooLarge', 'Image file must be less than 5MB'))
      return
    }

    uploadAvatar({ file })
  }

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
    // Reset input value to allow re-uploading the same file
    event.target.value = ''
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)

    const file = event.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  const handleRemoveAvatar = async () => {
    if (avatarUrl) {
      try {
        // Extract path from URL - this is a simplified approach
        // In a real implementation, you'd want to store the path separately
        const urlParts = avatarUrl.split('/')
        const avatarsIndex = urlParts.findIndex(part => part === 'avatars')
        if (avatarsIndex !== -1 && avatarsIndex < urlParts.length - 1) {
          const path = urlParts.slice(avatarsIndex).join('/')
          await deleteAvatar({ bucket: 'avatars', path })
        }

        // Clear avatar_url from user profile
        await updateUserProfile('')
      } catch (error) {
        toast.error('Failed to remove avatar')
      }
    }
  }

  const isLoading = isUploading || isDeleting

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Avatar Display */}
          <div className="relative group">
            <div
              className={cn(
                "relative h-24 w-24 rounded-full border-4 border-dashed transition-colors",
                isDragOver
                  ? "border-primary bg-primary/5"
                  : avatarUrl
                  ? "border-transparent"
                  : "border-muted-foreground/25 hover:border-primary/50",
                isLoading && "opacity-50"
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={fullName}
                  fill
                  className="rounded-full object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="h-full w-full rounded-full bg-accent flex items-center justify-center">
                  <span className="text-2xl font-medium text-muted-foreground">
                    {initials}
                  </span>
                </div>
              )}

              {/* Loading overlay */}
              {isLoading && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
            </div>

            {/* Action buttons */}
            {!isLoading && (
              <div className="absolute -bottom-2 -right-2 flex space-x-1">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 rounded-full p-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  <Camera className="h-4 w-4" />
                </Button>

                {avatarUrl && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8 w-8 rounded-full p-0"
                    onClick={handleRemoveAvatar}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">
              {avatarUrl
                ? t('settings.avatar.changeAvatar', 'Change your avatar')
                : t('settings.avatar.uploadAvatar', 'Upload an avatar')
              }
            </p>
            <p className="text-xs text-muted-foreground max-w-xs">
              {t('settings.avatar.uploadHint', 'Drag and drop an image or click to browse. Max size: 5MB. Supported formats: JPEG, PNG, WebP.')}
            </p>
          </div>

          {/* Upload button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="w-full max-w-xs"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('settings.avatar.uploading', 'Uploading...')}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {avatarUrl
                  ? t('settings.avatar.changeImage', 'Change Image')
                  : t('settings.avatar.uploadImage', 'Upload Image')
                }
              </>
            )}
          </Button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </CardContent>
    </Card>
  )
}