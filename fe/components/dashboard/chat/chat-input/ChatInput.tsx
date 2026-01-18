'use client'

import { ArrowUp, ImagePlus, Mic, Pause, Trash2, X } from 'lucide-react'
import { validateInputLength } from '@/lib/security/sanitize'
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { AIVoiceInput } from '@/components/ui/ai-voice-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { getTextDirection } from '@/lib/utils'
import { toast } from 'sonner'

import type { ChatInputProps, ImageFile } from './types'
import { ImageLightbox } from './components/ImageLightbox'
import { useAutoResizeTextarea } from './hooks/useAutoResizeTextarea'
import { MAX_IMAGES, MAX_IMAGE_SIZE_MB, ACCEPTED_IMAGE_TYPES, MAX_INPUT_LENGTH } from './utils/constants'
import { fileToBase64 } from './utils/file-utils'

export const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
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
    externalRef,
  ) => {
    const isDisabled = isLoading && !onCancel
    const inputDirection = useMemo(() => getTextDirection(input), [input])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

    const inputValidation = useMemo(() => validateInputLength(input, MAX_INPUT_LENGTH), [input])
    const isInputTooLong = !inputValidation.isValid

    const hasContent = input.trim().length > 0 || images.length > 0

    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
      minHeight: 100,
      maxHeight: 200,
    })

    const combinedRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        ;(textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node

        if (typeof externalRef === 'function') {
          externalRef(node)
        } else if (externalRef) {
          externalRef.current = node
        }
      },
      [externalRef, textareaRef],
    )

    useEffect(() => {
      adjustHeight()
    }, [input, adjustHeight])

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
    }, [images.length])

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

        try {
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
                  id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
                  file,
                  preview,
                  base64,
                }
              }),
          )

          onImagesChange([...images, ...newImages])
        } catch (error) {
          console.error('Failed to process images:', error)
          toast.error('Failed to process images')
        }
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

        try {
          const newImages: ImageFile[] = await Promise.all(
            itemsToProcess
              .map((item) => item.getAsFile())
              .filter((file): file is File => {
                if (!file) return false
                if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
                  toast.error(`Unsupported image type: ${file.type}`)
                  return false
                }
                if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
                  toast.error(`Image too large (max ${MAX_IMAGE_SIZE_MB}MB)`)
                  return false
                }
                return true
              })
              .map(async (file) => {
                const preview = URL.createObjectURL(file)
                const base64 = await fileToBase64(file)
                return {
                  id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
                  file,
                  preview,
                  base64,
                }
              }),
          )

          onImagesChange([...images, ...newImages.filter(Boolean)])
        } catch (error) {
          console.error('Failed to process pasted images:', error)
          toast.error('Failed to process pasted images')
        }
      },
      [images, onImagesChange],
    )

    const handleSubmit = useCallback(
      (e?: React.FormEvent) => {
        e?.preventDefault()
        if (hasContent && !isLoading && !isInputTooLong) {
          onSubmit(e)
          adjustHeight(true)
        }
      },
      [hasContent, isLoading, isInputTooLong, onSubmit, adjustHeight],
    )

    const canAddMoreImages = images.length < MAX_IMAGES

    return (
      <div
        id="tour-chat-input"
        className="sticky bottom-0 left-0 right-0 p-3 sm:p-4 z-20 bg-gradient-to-t from-white dark:from-zinc-950 via-white/80 dark:via-zinc-950/80 to-transparent"
      >
        <AnimatePresence mode="popLayout">
          {images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex gap-2 sm:gap-3 mb-2 flex-wrap max-w-full overflow-x-auto pb-2 overflow-visible"
            >
              {images.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="relative group flex-shrink-0"
                >
                  <button
                    type="button"
                    onClick={() => openLightbox(index)}
                    className="block focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 rounded-lg"
                  >
                    <img
                      src={image.preview}
                      alt="Upload preview"
                      className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg border border dark:border-zinc-700 cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive hover:bg-destructive text-white rounded-full flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-sm"
                    title="Remove image"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

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

        <AnimatePresence mode="wait">
          {isRecording ? (
            <motion.div
              key="recording"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative flex flex-col items-center justify-center backdrop-blur-xl bg-background/80 dark:bg-secondary/80 border border dark:border rounded-2xl shadow-2xl p-4 transition-all"
            >
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
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-muted-foreground hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <X className="w-5 h-5" />
              </Button>
            </motion.div>
          ) : (
            <motion.form
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="relative backdrop-blur-xl bg-background/90 dark:bg-secondary/90 border border/80 dark:border/80 rounded-2xl shadow-2xl overflow-hidden"
            >
              <Input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />

              <div className="flex items-end p-1.5 sm:p-2 gap-1 sm:gap-2">
                <div className="flex flex-col gap-1 pb-0.5">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      'h-8 w-8 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center transition-colors',
                      'text-muted-foreground hover:text-zinc-700 dark:hover:text-zinc-200',
                      'hover:bg-secondary dark:hover:bg-secondary',
                      (isDisabled || !canAddMoreImages) && 'opacity-40 cursor-not-allowed',
                    )}
                    disabled={isDisabled || !canAddMoreImages}
                    title={canAddMoreImages ? 'Add images' : `Max ${MAX_IMAGES} images`}
                  >
                    <ImagePlus className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onToggleRecording}
                    className={cn(
                      'h-8 w-8 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center transition-colors',
                      isRecording
                        ? 'text-destructive bg-destructive/5 dark:bg-red-950/30'
                        : 'text-muted-foreground hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-secondary dark:hover:bg-secondary',
                      (isDisabled || !speechRecognitionSupported) && 'opacity-40 cursor-not-allowed',
                    )}
                    disabled={isDisabled || !speechRecognitionSupported}
                  >
                    <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>
                </div>

                <div className="flex-1 relative min-w-0">
                  <textarea
                    ref={combinedRef}
                    value={input}
                    onChange={(e) => onInputChange(e.target.value)}
                    onPaste={handlePaste}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmit()
                      }
                    }}
                    maxLength={MAX_INPUT_LENGTH}
                    placeholder={
                      images.length > 0
                        ? 'Add a message about your images...'
                        : "What do you have for me today? I'm ready to help you."
                    }
                    className={cn(
                      'w-full min-h-[100px] max-h-[200px] overflow-y-auto resize-none',
                      'bg-transparent border-0 shadow-none outline-none',
                      'py-3 px-2 sm:px-3 text-sm sm:text-base font-medium',
                      'placeholder:text-muted-foreground dark:placeholder:text-muted-foreground placeholder:italic placeholder:font-normal',
                      'text-foreground dark:text-primary-foreground',
                      inputDirection === 'rtl' && 'text-right',
                      isInputTooLong && 'text-destructive',
                    )}
                    disabled={isDisabled}
                    dir={inputDirection}
                  />
                  <AnimatePresence>
                    {input.length > MAX_INPUT_LENGTH * 0.8 && (
                      <motion.span
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className={cn(
                          'absolute right-2 bottom-1 text-xs font-mono',
                          isInputTooLong ? 'text-destructive' : 'text-muted-foreground',
                        )}
                      >
                        {input.length}/{MAX_INPUT_LENGTH}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <div className="pb-0.5">
                  {isLoading && onCancel ? (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onCancel}
                      className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center bg-destructive hover:bg-destructive text-white shadow-lg transition-colors"
                      title="Cancel AI response"
                    >
                      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                        <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                      </motion.div>
                    </motion.button>
                  ) : (
                    <motion.button
                      type="submit"
                      whileHover={hasContent && !isLoading && !isInputTooLong ? { scale: 1.02 } : {}}
                      whileTap={hasContent && !isLoading && !isInputTooLong ? { scale: 0.98 } : {}}
                      disabled={!hasContent || isLoading || isInputTooLong}
                      className={cn(
                        'h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center transition-all duration-200',
                        hasContent && !isLoading && !isInputTooLong
                          ? 'bg-secondary dark:bg-secondary text-white dark:text-foreground shadow-lg hover:shadow-xl'
                          : 'bg-secondary dark:bg-secondary text-muted-foreground dark:text-muted-foreground',
                      )}
                      title={isInputTooLong ? 'Message too long' : undefined}
                    >
                      <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    )
  },
)

ChatInput.displayName = 'ChatInput'
