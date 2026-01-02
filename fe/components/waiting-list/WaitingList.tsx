import { AllyLogo } from '@/components/shared/logo'
import { ArrowLeft } from 'lucide-react'
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'
import Link from 'next/link'
import React from 'react'
import { SparklesCore } from '@/components/ui/sparkles'

const WaitingList: React.FC = () => {
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

      {/* Brand & Escape Link (since Navbar is hidden) */}
      <div className="absolute top-10 left-10 z-30">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-zinc-900 dark:bg-white rounded-md flex items-center justify-center text-white dark:text-zinc-900 shadow-xl group-hover:scale-110 transition-transform">
            <AllyLogo className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-none">Ally</span>
            <span className="text-xs font-medium text-zinc-500 flex items-center gap-1 group-hover:text-primary transition-colors">
              <ArrowLeft size={16} /> Back Home
            </span>
          </div>
        </Link>
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

        <div className="mt-12 flex flex-col sm:flex-row w-full max-w-lg mx-auto gap-3 items-center">
          <input
            className="flex-1 w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 px-6 py-4 rounded-full text-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 h-16"
            placeholder="Email"
            type="email"
          />
          <InteractiveHoverButton
            text="Reserve Spot"
            className="w-full sm:w-56 h-16 text-lg shadow-xl shadow-primary/20 shrink-0"
          />
        </div>

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
