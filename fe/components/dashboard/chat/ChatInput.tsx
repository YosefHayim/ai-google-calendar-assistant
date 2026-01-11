'use client'

import { ArrowUp, ImagePlus, Mic, Square, X, ChevronLeft, ChevronRight } from 'lucide-react'
import React, { forwardRef, useCallback, useMemo, useRef, useState } from 'react'

import { AIVoiceInput } from '@/components/ui/ai-voice-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getTextDirection } from '@/lib/utils'

export interface ImageFile {
  id: string
  file: File
  preview: string
  base64?: string
}

interface ImageLightboxProps {
  images: ImageFile[]
  currentIndex: number
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  currentIndex,
  onClose,
  onPrevious,
  onNext,
}) => {
  const currentImage = images[currentIndex]
  if (!currentImage) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPrevious()
            }}
            className="absolute left-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            className="absolute right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
            disabled={currentIndex === images.length - 1}
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      <div
        className="relative max-w-[90vw] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImage.preview}
          alt={`Image ${currentIndex + 1}`}
          className="max-w-full max-h-[90vh] object-contain rounded-lg"
        />
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  )
}

interface ChatInputProps {
  input: string
  isLoading: boolean
  isRecording: boolean
  speechRecognitionSupported: boolean
  speechRecognitionError: string | null
  interimTranscription: string
  images?: ImageFile[]
  onInputChange: (value: string) => void
  onSubmit: (e?: React.FormEvent) => void
  onToggleRecording: () => void
  onStartRecording: () => void
  onStopRecording: (finalTranscription: string | null) => void
  onCancelRecording: () => void
  onInterimResult?: (text: string) => void
  onCancel?: () => void
  onImagesChange?: (images: ImageFile[]) => void
}

const MAX_IMAGES = 10
const MAX_IMAGE_SIZE_MB = 10
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(
  (
    {
      input,
      isLoading,
      isRecording,
      speechRecognitionSupported,
      speechRecognitionError,
      interimTranscription: _interimTranscription,
      images = [],
      onInputChange,
      onSubmit,
      onToggleRecording,
      onStartRecording,
      onStopRecording,
      onCancelRecording,
      onInterimResult,
      onCancel,
      onImagesChange,
    },
    textInputRef,
  ) => {
    const isDisabled = isLoading && !onCancel
    const inputDirection = useMemo(() => getTextDirection(input), [input])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

    const openLightbox = useCallback((index: number) => {
      setLightboxIndex(index)
    }, [])

    const closeLightbox = useCallback(() => {
      setLightboxIndex(null)
    }, [])

    const goToPrevious = useCallback(() => {
      setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))
    }, [])

    const goToNext = useCallback(() => {
      setLightboxIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : prev))
    }, [])

    const handleImageSelect = useCallback(
      async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (!files || !onImagesChange) return

        const remainingSlots = MAX_IMAGES - images.length
        const filesToAdd = Array.from(files).slice(0, remainingSlots)

        const newImages: ImageFile[] = await Promise.all(
          filesToAdd
            .filter((file) => {
              if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return false
              if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) return false
              return true
            })
            .map(async (file) => {
              const preview = URL.createObjectURL(file)
              const base64 = await fileToBase64(file)
              return {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                file,
                preview,
                base64,
              }
            }),
        )

        onImagesChange([...images, ...newImages])
        // Reset input so same file can be selected again
        event.target.value = ''
      },
      [images, onImagesChange],
    )

    const removeImage = useCallback(
      (id: string) => {
        if (!onImagesChange) return
        const image = images.find((img) => img.id === id)
        if (image) {
          URL.revokeObjectURL(image.preview)
        }
        onImagesChange(images.filter((img) => img.id !== id))
      },
      [images, onImagesChange],
    )

    const handlePaste = useCallback(
      async (event: React.ClipboardEvent) => {
        if (!onImagesChange) return

        const items = event.clipboardData.items
        const imageItems = Array.from(items).filter((item) => item.type.startsWith('image/'))

        if (imageItems.length === 0) return

        event.preventDefault()

        const remainingSlots = MAX_IMAGES - images.length
        const itemsToProcess = imageItems.slice(0, remainingSlots)

        const newImages: ImageFile[] = await Promise.all(
          itemsToProcess.map(async (item) => {
            const file = item.getAsFile()
            if (!file) throw new Error('No file')
            const preview = URL.createObjectURL(file)
            const base64 = await fileToBase64(file)
            return {
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              file,
              preview,
              base64,
            }
          }),
        )

        onImagesChange([...images, ...newImages.filter(Boolean)])
      },
      [images, onImagesChange],
    )

    const canAddMoreImages = images.length < MAX_IMAGES

    return (
      <div
        id="tour-chat-input"
        className="sticky bottom-0 left-0 right-0 p-4 z-20 bg-gradient-to-t from-white dark:from-zinc-950 via-white/80 to-transparent"
      >
        {/* Image previews */}
        {images.length > 0 && (
          <div className="flex gap-2 mb-2 flex-wrap max-w-full overflow-x-auto pb-2">
            {images.map((image, index) => (
              <div key={image.id} className="relative group flex-shrink-0">
                <button
                  type="button"
                  onClick={() => openLightbox(index)}
                  className="block focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
                >
                  <img
                    src={image.preview}
                    alt="Upload preview"
                    className="w-16 h-16 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:opacity-80 transition-opacity"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {images.length > 0 && images.length < MAX_IMAGES && (
              <span className="text-xs text-zinc-400 self-center ml-2">
                {MAX_IMAGES - images.length} more
              </span>
            )}
          </div>
        )}

        {/* Image Lightbox */}
        {lightboxIndex !== null && images.length > 0 && (
          <ImageLightbox
            images={images}
            currentIndex={lightboxIndex}
            onClose={closeLightbox}
            onPrevious={goToPrevious}
            onNext={goToNext}
          />
        )}

        {isRecording ? (
          <div className="relative flex flex-col items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 transition-all">
            <AIVoiceInput
              onStart={onStartRecording}
              onStop={(duration, text) => onStopRecording(text)}
              onInterimResult={onInterimResult || (() => {})}
              isRecordingProp={isRecording}
              onToggleRecording={onToggleRecording}
              speechRecognitionSupported={speechRecognitionSupported}
              speechRecognitionError={speechRecognitionError}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancelRecording}
              className="absolute top-4 right-4 text-zinc-400"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="relative flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-2 gap-2"
          >
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Image upload button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="h-12 w-12 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              disabled={isDisabled || !canAddMoreImages}
              title={canAddMoreImages ? 'Add images' : `Max ${MAX_IMAGES} images`}
            >
              <ImagePlus className="w-6 h-6" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onToggleRecording}
              className={`h-12 w-12 rounded-xl ${
                isRecording ? 'text-red-500 bg-red-50' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
              disabled={isDisabled || !speechRecognitionSupported}
            >
              <Mic className="w-6 h-6" />
            </Button>
            <Input
              ref={textInputRef}
              type="text"
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onPaste={handlePaste}
              placeholder={images.length > 0 ? 'Add a message about your images...' : 'What do you have for me today? I\'m ready to help you.'}
              className={`flex-1 h-14 bg-transparent border-0 shadow-none focus-visible:ring-0 text-lg font-medium placeholder:italic placeholder:font-normal ${inputDirection === 'rtl' ? 'text-right' : ''}`}
              disabled={isDisabled}
              dir={inputDirection}
            />
            {isLoading && onCancel ? (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={onCancel}
                className="h-12 w-12 rounded-xl"
              >
                <Square className="w-6 h-6" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                disabled={(!input.trim() && images.length === 0) || isLoading}
                className={`h-12 w-12 rounded-xl ${
                  (input.trim() || images.length > 0) && !isLoading
                    ? 'bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                }`}
              >
                <ArrowUp className="w-6 h-6" />
              </Button>
            )}
          </form>
        )}
      </div>
    )
  },
)

ChatInput.displayName = 'ChatInput'

// Utility function to convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
