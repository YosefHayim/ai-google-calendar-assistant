'use client'

import { motion } from 'framer-motion'
import { CalendarX, Home, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const PRIMARY_ORB_HORIZONTAL_OFFSET = 40
const PRIMARY_ORB_VERTICAL_OFFSET = 20

export function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background text-foreground">
      <div aria-hidden={true} className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{
            x: [0, PRIMARY_ORB_HORIZONTAL_OFFSET, -PRIMARY_ORB_HORIZONTAL_OFFSET, 0],
            y: [0, PRIMARY_ORB_VERTICAL_OFFSET, -PRIMARY_ORB_VERTICAL_OFFSET, 0],
            rotate: [0, 10, -10, 0],
          }}
          className="absolute left-1/3 top-1/2 h-64 w-64 rounded-full bg-gradient-to-tr from-orange-500/20 to-amber-500/20 blur-3xl"
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 5,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          animate={{
            x: [0, -PRIMARY_ORB_HORIZONTAL_OFFSET, PRIMARY_ORB_HORIZONTAL_OFFSET, 0],
            y: [0, -PRIMARY_ORB_VERTICAL_OFFSET, PRIMARY_ORB_VERTICAL_OFFSET, 0],
          }}
          className="absolute bottom-1/3 right-1/4 h-72 w-72 rounded-full bg-gradient-to-br from-orange-400/10 to-yellow-400/10 blur-3xl"
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 5,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="flex flex-col items-center justify-center gap-8 px-4">
        <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full bg-muted">
          <CalendarX className="h-12 w-12 text-muted-foreground" />
        </div>

        <div className="flex flex-col items-center gap-4">
          <h1 className="text-7xl font-bold tracking-tight text-foreground">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
          <p className="max-w-md text-center text-base text-muted-foreground">
            Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button asChild size="lg" className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>

          <Button asChild variant="secondary" size="lg" className="gap-2 border border-border">
            <Link href="/dashboard">
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Need help?</span>
          <Link href="/contact" className="text-sm font-medium text-primary hover:underline">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  )
}
