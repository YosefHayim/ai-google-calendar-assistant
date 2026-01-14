'use client'

import React, { useState } from 'react'

import { Input } from '@/components/ui/input'
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'
import { SparklesCore } from '@/components/ui/sparkles'
import { toast } from 'sonner'
import { waitingListService } from '@/services/waiting-list.service'

const WaitingList: React.FC = () => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [position, setPosition] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)
    try {
      const result = await waitingListService.join({
        email,
        name: name || undefined,
        source: 'landing',
      })

      setPosition(result.data?.position || null)
      toast.success('Welcome to the waiting list!', {
        description: `You're #${result.data?.position} in line. We'll notify you when it's your turn!`,
      })
      setEmail('')
      setName('')
    } catch (error: any) {
      toast.error('Error', {
        description: error.response?.data?.message || 'Failed to join waiting list. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-[#030303] flex flex-col items-center justify-center py-20 px-4 overflow-hidden animate-in fade-in duration-500">
      {/* Background Sparkles */}
      <div className="absolute inset-0 w-full h-full">
        <SparklesCore
          id="waitinglist-sparkles"
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={1200}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
        {/* Radial Gradient for clean edges and focus */}
        <div className="absolute inset-0 w-full h-full bg-white dark:bg-[#030303] [mask-image:radial-gradient(450px_300px_at_center,transparent_20%,white)] dark:[mask-image:radial-gradient(450px_300px_at_center,transparent_20%,black)]"></div>
      </div>

      <div className="w-full max-w-2xl text-center relative z-20">
        <h1 className="text-center text-5xl font-medium tracking-tight md:text-7xl lg:text-8xl text-zinc-900 dark:text-zinc-100 leading-none">
          Priority Access <br />
          <span className="text-primary italic">Awaits.</span>
        </h1>
        <p className="mt-8 text-zinc-500 dark:text-zinc-400 text-xl font-medium max-w-lg mx-auto leading-relaxed">
          Be among the first leaders to experience executive-grade AI scheduling. Join the waitlist for exclusive early
          access.
        </p>

        <form onSubmit={handleSubmit} className="mt-12 w-full max-w-lg mx-auto space-y-2">
          <div className="flex flex-row w-full gap-2 items-center justify-center">
            <Input
              className="w-auto h-16 px-6 rounded-lg text-lg"
              placeholder="Your name (optional)"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
            <Input
              className="w-auto h-16 px-6 rounded-lg text-lg"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <InteractiveHoverButton
            text={isSubmitting ? 'Joining...' : 'Reserve Spot'}
            className="w-full h-16 text-lg shadow-xl shadow-primary/20 max-w-full"
            type="submit"
            disabled={isSubmitting}
          />

          {position && (
            <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-center text-primary font-medium">
                You're <strong>#{position}</strong> on the waiting list!
              </p>
            </div>
          )}
        </form>

        <p className="mt-6 text-xs text-zinc-400 font-medium">Secure. Private. Instant notification upon entry.</p>
      </div>

      {/* Subtle bottom detail */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-xs uppercase tracking-widest text-zinc-300 dark:text-zinc-800 font-bold select-none">
        Executive Ops x Ally Node
      </div>
    </div>
  )
}

export default WaitingList
