'use client'

import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

import { AdminAppSidebar } from '@/components/admin/AdminAppSidebar'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import React from 'react'
import { useDashboardStats } from '@/hooks/queries/admin/useDashboardStats'
import { useRouter } from 'next/navigation'

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
      <div className="flex h-screen items-center justify-center bg-muted dark:bg-secondary">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted dark:bg-secondary">
        <div className="text-center">
          <p className="text-muted-foreground dark:text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-muted dark:bg-secondary">
        <AdminAppSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          <header className="flex h-14 items-center gap-2 border-b px-4 md:hidden">
            <SidebarTrigger className="-ml-1" />
          </header>
          <main className="flex-1 overflow-auto">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
