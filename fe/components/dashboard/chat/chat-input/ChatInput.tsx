'use client'

import { ACCEPTED_IMAGE_TYPES, MAX_IMAGES, MAX_IMAGE_SIZE_MB, MAX_INPUT_LENGTH } from './utils/constants'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, Mic, Paperclip, Pause, Trash2, Users, X } from 'lucide-react'
import type { ChatInputProps, ImageFile } from './types'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { AIVoiceInput } from '@/components/ui/ai-voice-input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ContactPickerContent } from '@/components/ui/contact-picker'
import Image from 'next/image'
import { ImageLightbox } from './components/ImageLightbox'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { fileToBase64 } from './utils/file-utils'
import { getTextDirection } from '@/lib/utils'
import { toast } from 'sonner'
import { useAutoResizeTextarea } from './hooks/useAutoResizeTextarea'
import { useFeatureFlags } from '@/hooks/useFeatureFlags'
import { useTranslation } from 'react-i18next'
import { validateInputLength } from '@/lib/security/sanitize'

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
      selectedAttendees = [],
      onInputChange,
      onSubmit,
      onToggleRecording,
      onStartRecording,
      onStopRecording,
      onCancelRecording,
      onInterimResult,
      onCancel,
      onImagesChange,
      onAttendeesChange,
      shouldUseOCR,
      onOCRFilesSelected,
      isOCRUploading,
    },
    externalRef,
  ) => {
    const { t } = useTranslation()
    const { voiceInput, imageUpload } = useFeatureFlags()
    const isDisabled = (isLoading || isOCRUploading) && !onCancel
    const inputDirection = useMemo(() => getTextDirection(input), [input])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
    const [contactsPopoverOpen, setContactsPopoverOpen] = useState(false)

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
        if (!files) return

        const allFiles = Array.from(files)

        if (shouldUseOCR && onOCRFilesSelected && shouldUseOCR(allFiles)) {
          try {
            const ocrFiles: ImageFile[] = await Promise.all(
              allFiles
                .filter((file) => {
                  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return false
                  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
                    toast.error(t('toast.imageTooLarge', { size: MAX_IMAGE_SIZE_MB }))
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

            if (ocrFiles.length > 0) {
              onOCRFilesSelected(ocrFiles)
              ocrFiles.forEach((f) => URL.revokeObjectURL(f.preview))
            }
          } catch (error) {
            console.error('Failed to process OCR files:', error)
            toast.error(t('toast.imageProcessingFailed'))
          }
          event.target.value = ''
          return
        }

        if (!onImagesChange) {
          event.target.value = ''
          return
        }

        const remainingSlots = MAX_IMAGES - images.length
        if (remainingSlots === 0) {
          toast.error(t('toast.maxImagesAllowed', { count: MAX_IMAGES }))
          event.target.value = ''
          return
        }

        if (allFiles.length > remainingSlots) {
          toast.error(t('toast.maxImagesAllowed', { count: MAX_IMAGES }))
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
          toast.error(t('toast.imageProcessingFailed'))
        }
        event.target.value = ''
      },
      [t, images, onImagesChange, shouldUseOCR, onOCRFilesSelected],
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
          toast.error(t('toast.maxImagesAllowed', { count: MAX_IMAGES }))
          return
        }

        if (imageItems.length > remainingSlots) {
          toast.error(t('toast.maxImagesAllowed', { count: MAX_IMAGES }))
        }

        const itemsToProcess = imageItems.slice(0, remainingSlots)

        try {
          const newImages: ImageFile[] = await Promise.all(
            itemsToProcess
              .map((item) => item.getAsFile())
              .filter((file): file is File => {
                if (!file) return false
                if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
                  toast.error(t('toast.unsupportedImageType', { type: file.type }))
                  return false
                }
                if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
                  toast.error(t('toast.imageTooLarge', { size: MAX_IMAGE_SIZE_MB }))
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
          toast.error(t('toast.pastedImagesProcessingFailed'))
        }
      },
      [t, images, onImagesChange],
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
        className="sticky bottom-0 left-0 right-0 z-20 shrink-0 bg-gradient-to-t from-background via-background/95 to-transparent px-2 pb-2 pt-3 sm:p-4"
      >
        <AnimatePresence mode="popLayout">
          {images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-2 flex max-w-full flex-wrap gap-2 overflow-visible overflow-x-auto pb-2 sm:gap-3"
            >
              {images.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="group relative flex-shrink-0"
                >
                  <button
                    type="button"
                    onClick={() => openLightbox(index)}
                    className="block rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <Image
                      src={image.preview}
                      alt="Upload preview"
                      className="h-14 w-14 cursor-pointer rounded-lg border-border object-cover transition-opacity hover:opacity-80 sm:h-16 sm:w-16"
                      width={64}
                      height={64}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-foreground opacity-100 shadow-sm transition-opacity hover:bg-destructive md:opacity-0 md:group-hover:opacity-100"
                    title="Remove image"
                  >
                    <Trash2 className="h-3 w-3" />
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

        <AnimatePresence>
          {selectedAttendees.length > 0 && onAttendeesChange && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap items-center gap-1.5 p-2"
            >
              <span className="text-xs text-muted-foreground">Inviting:</span>
              {selectedAttendees.map((email) => (
                <Badge key={email} variant="secondary" className="gap-1 py-0.5 pr-1 text-xs">
                  <span className="max-w-[120px] truncate">{email}</span>
                  <button
                    type="button"
                    onClick={() => onAttendeesChange(selectedAttendees.filter((e) => e !== email))}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isRecording ? (
            <motion.div
              key="recording"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative flex flex-col items-center justify-center rounded-2xl bg-background/80 bg-secondary/80 p-4 shadow-2xl backdrop-blur-xl transition-all"
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
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground sm:right-4 sm:top-4"
                aria-label="Cancel recording"
              >
                <X className="h-5 w-5" />
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
              className="relative overflow-hidden rounded-xl border border-border bg-card"
            >
              <Input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />

              <div className="flex items-center gap-3 p-3 sm:p-4">
                <div className="relative min-w-0 flex-1">
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
                        : 'Ask Ally anything about your calendar...'
                    }
                    className={cn(
                      'max-h-[120px] min-h-[24px] w-full resize-none overflow-y-auto',
                      'border-0 bg-transparent shadow-none outline-none',
                      'text-sm text-foreground',
                      'placeholder:text-muted-foreground',
                      inputDirection === 'rtl' && 'text-right',
                      isInputTooLong && 'text-destructive',
                    )}
                    disabled={isDisabled}
                    dir={inputDirection}
                    rows={1}
                  />
                  <AnimatePresence>
                    {input.length > MAX_INPUT_LENGTH * 0.8 && (
                      <motion.span
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className={cn(
                          'absolute bottom-1 right-2 font-mono text-xs',
                          isInputTooLong ? 'text-destructive' : 'text-muted-foreground',
                        )}
                      >
                        {input.length}/{MAX_INPUT_LENGTH}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-2">
                  {imageUpload && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => fileInputRef.current?.click()}
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                            'text-muted-foreground hover:text-foreground',
                            (isDisabled || !canAddMoreImages) && 'cursor-not-allowed opacity-40',
                          )}
                          disabled={isDisabled || !canAddMoreImages}
                        >
                          <Paperclip className="h-[18px] w-[18px]" />
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        {canAddMoreImages ? 'Attach files' : `Max ${MAX_IMAGES} files`}
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {voiceInput && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={onToggleRecording}
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                            isRecording
                              ? 'bg-destructive/5 text-destructive'
                              : 'text-muted-foreground hover:text-foreground',
                            (isDisabled || !speechRecognitionSupported) && 'cursor-not-allowed opacity-40',
                          )}
                          disabled={isDisabled || !speechRecognitionSupported}
                        >
                          <Mic className="h-[18px] w-[18px]" />
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent side="top">{isRecording ? 'Stop recording' : 'Voice input'}</TooltipContent>
                    </Tooltip>
                  )}

                  {onAttendeesChange && (
                    <Popover open={contactsPopoverOpen} onOpenChange={setContactsPopoverOpen}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <PopoverTrigger asChild>
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={cn(
                                'relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                                selectedAttendees.length > 0
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-muted-foreground hover:text-foreground',
                                isDisabled && 'cursor-not-allowed opacity-40',
                              )}
                              disabled={isDisabled}
                            >
                              <Users className="h-[18px] w-[18px]" />
                              {selectedAttendees.length > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                                  {selectedAttendees.length}
                                </span>
                              )}
                            </motion.button>
                          </PopoverTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="top">Add attendees</TooltipContent>
                      </Tooltip>
                      <PopoverContent className="w-80 p-3" align="start" side="top">
                        <ContactPickerContent
                          selectedEmails={selectedAttendees}
                          onSelectionChange={onAttendeesChange}
                          placeholder="Search contacts to invite..."
                          disabled={isDisabled}
                          autoFocus
                          enabled={contactsPopoverOpen}
                        />
                      </PopoverContent>
                    </Popover>
                  )}

                  {isLoading && onCancel ? (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onCancel}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive text-destructive-foreground transition-colors"
                      title="Cancel AI response"
                    >
                      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                        <Pause className="h-[18px] w-[18px]" />
                      </motion.div>
                    </motion.button>
                  ) : (
                    <motion.button
                      type="submit"
                      whileHover={hasContent && !isLoading && !isInputTooLong ? { scale: 1.02 } : {}}
                      whileTap={hasContent && !isLoading && !isInputTooLong ? { scale: 0.98 } : {}}
                      disabled={!hasContent || isLoading || isInputTooLong}
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200',
                        hasContent && !isLoading && !isInputTooLong
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-primary/50 text-primary-foreground/50',
                      )}
                      title={isInputTooLong ? 'Message too long' : undefined}
                    >
                      <ArrowUp className="h-[18px] w-[18px]" />
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
