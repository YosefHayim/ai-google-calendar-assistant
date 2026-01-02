'use client'

import { AnimatePresence, motion } from 'framer-motion'
import React, { useState } from 'react'

import { Star } from 'lucide-react'

interface AvatarProps {
  src: string
  name: string
  fallback: string
}

const AVATARS: AvatarProps[] = [
  { src: 'https://github.com/haydenbleasel.png', name: 'Hayden Bleasel', fallback: 'HB' },
  { src: 'https://github.com/shadcn.png', name: 'shadcn', fallback: 'CN' },
  { src: 'https://github.com/leerob.png', name: 'Lee Robinson', fallback: 'LR' },
  { src: 'https://github.com/serafimcloud.png', name: 'Serafim Cloud', fallback: 'SC' },
]

const TooltipAvatar: React.FC<AvatarProps & { index: number }> = ({ src, name, fallback, index }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold rounded shadow-xl whitespace-nowrap z-50 pointer-events-none"
          >
            {name}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-white" />
          </motion.div>
        )}
      </AnimatePresence>
      <div
        className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-white dark:border-zinc-950 bg-zinc-100 dark:bg-zinc-800 transition-transform hover:scale-110 hover:z-10 cursor-pointer"
        style={{ marginLeft: index === 0 ? 0 : '-12px' }}
      >
        {src ? (
          <img className="aspect-square h-full w-full object-cover" src={src} alt={name} />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-bold text-zinc-500">
            {fallback}
          </div>
        )}
      </div>
    </div>
  )
}

const AvatarTooltipGroup = () => {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center">
        <div className="flex">
          {AVATARS.map((avatar, index) => (
            <TooltipAvatar
              key={avatar.name}
              src={avatar.src}
              name={avatar.name}
              fallback={avatar.fallback}
              index={index}
            />
          ))}
        </div>
        <div className="ml-4 flex flex-col items-start">
          <div className="flex items-center gap-0.5 mb-0.5">
            {[...Array(5)].map((_, index) => (
              <Star key={index} className="size-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-xs text-left font-medium text-zinc-500 dark:text-zinc-400 leading-none">
            Trusted by <strong className="text-zinc-900 dark:text-zinc-100">5,000+</strong> Business Owners
          </p>
        </div>
      </div>
    </div>
  )
}

export default AvatarTooltipGroup
