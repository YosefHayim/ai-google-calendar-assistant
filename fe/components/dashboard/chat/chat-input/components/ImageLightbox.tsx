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
      <DialogContent className="max-h-[90vh] max-w-[90vw] border-none bg-transparent p-0 shadow-none">
        <VisuallyHidden>
          <DialogTitle>Image Preview</DialogTitle>
        </VisuallyHidden>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={onPrevious}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/10 p-2 text-foreground transition-colors hover:bg-background/20 disabled:opacity-50"
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            <button
              type="button"
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
            src={currentImage.preview}
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
