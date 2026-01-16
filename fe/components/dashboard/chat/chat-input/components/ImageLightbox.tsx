'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import type { ImageLightboxProps } from '../types'

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
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
