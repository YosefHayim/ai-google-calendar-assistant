'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { RefreshCw } from 'lucide-react'
import { useDashboardStats } from '@/hooks/queries/admin/useDashboardStats'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isLoading, isError, error } = useDashboardStats()

  React.useEffect(() => {
    if (isError) {
      const axiosError = error as { response?: { status?: number } }
      if (axiosError?.response?.status === 403) {
        router.push('/dashboard')
      } else if (axiosError?.response?.status === 401) {
        router.push('/login')
      } else {
        router.push('/dashboard')
      }
    }
  }, [isError, error, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError) {
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
