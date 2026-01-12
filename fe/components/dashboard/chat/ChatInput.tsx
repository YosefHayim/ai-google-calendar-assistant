'use client'

import { ArrowUp, ImagePlus, Mic, Square, X, ChevronLeft, ChevronRight } from 'lucide-react'
import React, { forwardRef, useCallback, useMemo, useRef, useState } from 'react'

import { AIVoiceInput } from '@/components/ui/ai-voice-input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { getTextDirection } from '@/lib/utils'
import { INPUT_LIMITS, validateInputLength } from '@/lib/security/sanitize'
import { toast } from 'sonner'

export interface ImageFile {
  id: string
  file: File
  preview: string
  base64?: string
}

interface ImageLightboxProps {
  images: ImageFile[]
  currentIndex: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onPrevious: () => void
  onNext: () => void
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  currentIndex,
  open,
  onOpenChange,
  onPrevious,
  onNext,
}) => {
  const currentImage = images[currentIndex]
  if (!currentImage) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 border-none bg-transparent shadow-none">
        <VisuallyHidden>
          <DialogTitle>Image Preview</DialogTitle>
        </VisuallyHidden>

        {images.length > 1 && (
          <>
            <button
              onClick={onPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={onNext}
              className="absolute right-12 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
              disabled={currentIndex === images.length - 1}
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </>
        )}

        <div className="relative flex items-center justify-center">
          <img
            src={currentImage.preview}
            alt={`Image ${currentIndex + 1}`}
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
          />
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
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
const MAX_INPUT_LENGTH = INPUT_LIMITS.CHAT_MESSAGE

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

    const inputValidation = useMemo(() => validateInputLength(input, MAX_INPUT_LENGTH), [input])
    const isInputTooLong = !inputValidation.isValid

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
        if (remainingSlots === 0) {
          toast.error(`Maximum ${MAX_IMAGES} images allowed`)
          event.target.value = ''
          return
        }

        const allFiles = Array.from(files)
        if (allFiles.length > remainingSlots) {
          toast.error(`Maximum ${MAX_IMAGES} images allowed`)
        }

        const filesToAdd = allFiles.slice(0, remainingSlots)

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
        if (remainingSlots === 0) {
          toast.error(`Maximum ${MAX_IMAGES} images allowed`)
          return
        }

        if (imageItems.length > remainingSlots) {
          toast.error(`Maximum ${MAX_IMAGES} images allowed`)
        }

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

          </div>
        )}

        {/* Image Lightbox */}
        {images.length > 0 && (
          <ImageLightbox
            images={images}
            currentIndex={lightboxIndex ?? 0}
            open={lightboxIndex !== null}
            onOpenChange={(open) => !open && closeLightbox()}
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
            <div className="flex-1 relative">
              <Input
                ref={textInputRef}
                type="text"
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                onPaste={handlePaste}
                maxLength={MAX_INPUT_LENGTH}
                placeholder={images.length > 0 ? 'Add a message about your images...' : 'What do you have for me today? I\'m ready to help you.'}
                className={`w-full h-14 bg-transparent border-0 shadow-none focus-visible:ring-0 text-lg font-medium placeholder:italic placeholder:font-normal ${inputDirection === 'rtl' ? 'text-right' : ''} ${isInputTooLong ? 'text-red-500' : ''}`}
                disabled={isDisabled}
                dir={inputDirection}
              />
              {input.length > MAX_INPUT_LENGTH * 0.8 && (
                <span className={`absolute right-2 bottom-0 text-xs ${isInputTooLong ? 'text-red-500' : 'text-zinc-400'}`}>
                  {input.length}/{MAX_INPUT_LENGTH}
                </span>
              )}
            </div>
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
                disabled={(!input.trim() && images.length === 0) || isLoading || isInputTooLong}
                className={`h-12 w-12 rounded-xl ${
                  (input.trim() || images.length > 0) && !isLoading && !isInputTooLong
                    ? 'bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                }`}
                title={isInputTooLong ? 'Message too long' : undefined}
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
