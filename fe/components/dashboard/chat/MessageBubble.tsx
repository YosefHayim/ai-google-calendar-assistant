import React, { useMemo, useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import { Role, MessageImage } from '@/types'
import remarkGfm from 'remark-gfm'
import { getTextDirection } from '@/lib/utils'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

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
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
}

const MessageImageLightbox: React.FC<MessageImageLightboxProps> = ({
  images,
  currentIndex,
  onClose,
  onPrevious,
  onNext,
}) => {
  const currentImage = images[currentIndex]
  if (!currentImage) return null

  const imageSrc = `data:${currentImage.mimeType};base64,${currentImage.data}`

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
          src={imageSrc}
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
      <div className={`flex w-full mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[85%] md:max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div
            className={`px-4 py-3 rounded-md text-sm leading-relaxed transition-all duration-200
              ${
                isUser
                  ? 'bg-primary text-white rounded-tr-none shadow-md'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-tl-none shadow-sm'
              }`}
            dir={textDirection}
          >
            {/* Render images if present */}
            {hasImages && (
              <div className={`flex flex-wrap gap-2 ${content ? 'mb-3' : ''}`}>
                {images.map((image, index) => {
                  const imageSrc = `data:${image.mimeType};base64,${image.data}`
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => openLightbox(index)}
                      className="block focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg"
                    >
                      <img
                        src={imageSrc}
                        alt={`Attached image ${index + 1}`}
                        className="max-w-[200px] max-h-[150px] object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    </button>
                  )
                })}
              </div>
            )}
            {content && (
              <div
                className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : 'prose-zinc dark:prose-invert'} ${isRTL ? 'text-right' : ''}`}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              </div>
            )}
          </div>
          {!hideTimestamp && (
            <span className={`text-xs text-zinc-400 mt-1 px-1 ${isRTL ? 'text-right w-full' : ''}`}>
              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {/* Image Lightbox */}
      {lightboxIndex !== null && hasImages && (
        <MessageImageLightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrevious={goToPrevious}
          onNext={goToNext}
        />
      )}
    </>
  )
}

export default MessageBubble
