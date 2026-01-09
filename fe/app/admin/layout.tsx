'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { RefreshCw } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    // Check if user has admin role
    // This is a client-side check - the actual authorization happens on the backend
    const checkAdminAccess = async () => {
      try {
        // Try to fetch admin dashboard stats - if it fails, user is not admin
        const response = await fetch('/api/admin/dashboard/stats', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        })

        if (response.ok) {
          setIsAuthorized(true)
        } else if (response.status === 403) {
          // Not authorized - redirect to dashboard
          router.push('/dashboard')
        } else if (response.status === 401) {
          // Not logged in - redirect to login
          router.push('/login')
        }
      } catch (error) {
        console.error('Failed to check admin access:', error)
        router.push('/dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminAccess()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <p className="text-zinc-500 dark:text-zinc-400">Checking permissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
