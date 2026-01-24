import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { MessageImage, Role } from '@/types'
import React, { useCallback, useMemo, useState } from 'react'
import { cn, getTextDirection } from '@/lib/utils'

import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

interface MessageBubbleProps {
  role: Role
  content: string
  timestamp: Date
  images?: MessageImage[]
  hideTimestamp?: boolean // Added to allow handling timestamp externally for custom layouts
}

interface MessageImageLightboxProps {
  images: MessageImage[]
  currentIndex: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onPrevious: () => void
  onNext: () => void
}

const MessageImageLightbox: React.FC<MessageImageLightboxProps> = ({
  images,
  currentIndex,
  open,
  onOpenChange,
  onPrevious,
  onNext,
}) => {
  const currentImage = images[currentIndex]
  if (!currentImage) return null

  const imageSrc = `data:${currentImage.mimeType};base64,${currentImage.data}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[90vw] border-none bg-transparent p-0 shadow-none">
        <VisuallyHidden>
          <DialogTitle>Image Preview</DialogTitle>
        </VisuallyHidden>

        {images.length > 1 && (
          <>
            <button
              onClick={onPrevious}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/10 p-2 text-foreground transition-colors hover:bg-background/20 disabled:opacity-50"
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            <button
              onClick={onNext}
              className="absolute right-12 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/10 p-2 text-foreground transition-colors hover:bg-background/20 disabled:opacity-50"
              disabled={currentIndex === images.length - 1}
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          </>
        )}

        <div className="relative flex items-center justify-center">
          <img
            src={imageSrc}
            alt={`Image ${currentIndex + 1}`}
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
          />
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-foreground/50 px-3 py-1 text-sm text-foreground">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ role, content, timestamp, images, hideTimestamp }) => {
  const isUser = role === 'user'
  const textDirection = useMemo(() => getTextDirection(content), [content])
  const isRTL = textDirection === 'rtl'
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
    if (!images) return
    setLightboxIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : prev))
  }, [images])

  const hasImages = images && images.length > 0

  return (
    <>
      <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
        <div className={cn('flex max-w-[85%] flex-col sm:max-w-[80%]', isUser ? 'items-end' : 'items-start')}>
          <div
            className={cn(
              'overflow-hidden rounded-2xl px-4 py-3 text-sm leading-relaxed',
              isUser
                ? 'rounded-br-md bg-primary text-primary-foreground'
                : 'rounded-bl-md bg-secondary text-foreground',
            )}
            dir={textDirection}
          >
            {hasImages && (
              <div className={cn('flex flex-wrap gap-2', content && 'mb-3')}>
                {images.map((image, index) => {
                  const imageSrc = `data:${image.mimeType};base64,${image.data}`
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => openLightbox(index)}
                      className="block rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                      <img
                        src={imageSrc}
                        alt={`Attached image ${index + 1}`}
                        className="max-h-[150px] max-w-[200px] cursor-pointer rounded-lg object-cover transition-opacity hover:opacity-80"
                      />
                    </button>
                  )
                })}
              </div>
            )}
            {content && (
              <div
                className={cn(
                  'prose prose-sm max-w-none break-words',
                  '[&_pre]:overflow-x-auto [&_pre]:whitespace-pre-wrap [&_pre]:break-all',
                  '[&_a]:break-all [&_code]:break-all',
                  isUser
                    ? 'prose-invert [&_a]:text-primary-foreground [&_a]:underline'
                    : 'prose-zinc dark:prose-invert',
                  isRTL && 'text-right',
                )}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {content}
                </ReactMarkdown>
              </div>
            )}
          </div>
          {!hideTimestamp && (
            <span className={cn('mt-1 px-1 text-[11px] text-muted-foreground', isRTL && 'w-full text-right')}>
              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {hasImages && (
        <MessageImageLightbox
          images={images}
          currentIndex={lightboxIndex ?? 0}
          open={lightboxIndex !== null}
          onOpenChange={(open) => !open && closeLightbox()}
          onPrevious={goToPrevious}
          onNext={goToNext}
        />
      )}
    </>
  )
}

export default MessageBubble
