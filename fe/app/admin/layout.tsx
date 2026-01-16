'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { AdminAppSidebar } from '@/components/admin/AdminAppSidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
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
        <LoadingSpinner size="lg" />
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
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-zinc-50 dark:bg-zinc-950">
        <AdminAppSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          <header className="flex h-14 items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 px-4 md:hidden">
            <SidebarTrigger className="-ml-1" />
          </header>
          <main className="flex-1 overflow-auto">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
