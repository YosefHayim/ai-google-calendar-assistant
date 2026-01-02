'use client'

import React, { useState, useEffect } from 'react'

interface ImageCarouselProps {
  images: string[]
  interval?: number // Time in ms for image change, default 5000ms
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, interval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, interval)

    return () => clearInterval(timer)
  }, [images.length, interval])

  return (
    <div className="relative h-full w-full overflow-hidden rounded-md">
      {images.map((src, index) => (
        <img
          key={index}
          src={src}
          alt={`Carousel image ${index + 1}`}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {images.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-primary scale-125' : 'bg-white/50 dark:bg-zinc-700/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default ImageCarousel
