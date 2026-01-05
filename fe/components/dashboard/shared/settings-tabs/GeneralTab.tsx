'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { CustomUser } from '@/types/api'
import type { User } from '@supabase/supabase-js'

interface GeneralTabProps {
  isDarkMode: boolean
  toggleTheme: () => void
  userData: CustomUser | User | null | undefined
  isUserLoading: boolean
}

export const GeneralTab: React.FC<GeneralTabProps> = ({ isDarkMode, toggleTheme, userData }) => {
  const [timeFormat, setTimeFormat] = useState('12h')
  const [timezone] = useState('Asia/Jerusalem (IST)')

  const isCustomUser = userData && ('avatar_url' in userData || 'first_name' in userData)
  const customUser = isCustomUser ? (userData as CustomUser) : null
  const standardUser = !isCustomUser && userData && 'user_metadata' in userData ? (userData as User) : null

  const firstName = customUser?.first_name || (standardUser?.user_metadata as Record<string, any>)?.first_name || ''
  const lastName = customUser?.last_name || (standardUser?.user_metadata as Record<string, any>)?.last_name || ''
  const email = customUser?.email || standardUser?.email || ''
  const avatarUrl = customUser?.avatar_url || (standardUser?.user_metadata as Record<string, any>)?.avatar_url
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'User'
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || email?.[0]?.toUpperCase() || 'U'
  const createdAt = customUser?.created_at || standardUser?.created_at

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">General</CardTitle>
        <CardDescription>Manage your profile and preferences.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {/* User Profile Section */}
        <div className="flex items-center gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={fullName}
              width={56}
              height={56}
              className="rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div className="h-14 w-14 rounded-xl bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-medium text-zinc-600 dark:text-zinc-300">{initials}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate">{fullName}</h4>
            <p className="text-sm text-zinc-500 truncate">{email}</p>
            {createdAt && (
              <p className="text-xs text-zinc-400 mt-1">
                Member since {new Date(createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>

        {/* Appearance */}
        <div className="grid gap-3">
          <Label>Appearance</Label>
          <Button variant="outline" onClick={toggleTheme} className="w-fit justify-between gap-2">
            {isDarkMode ? 'Dark' : 'Light'}
            <ChevronDown size={14} className="opacity-50" />
          </Button>
        </div>

        {/* Timezone */}
        <div className="grid gap-3">
          <Label>Default Timezone</Label>
          <Button variant="outline" className="w-fit justify-between gap-2">
            {timezone}
            <ChevronDown size={14} className="opacity-50" />
          </Button>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Events will be scheduled in this timezone unless specified otherwise.
          </p>
        </div>

        {/* Time Format */}
        <div className="grid gap-3">
          <Label>Time Format</Label>
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg w-fit">
            <Button
              variant={timeFormat === '12h' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setTimeFormat('12h')}
              className={timeFormat === '12h' ? 'shadow-sm' : ''}
            >
              12H
            </Button>
            <Button
              variant={timeFormat === '24h' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setTimeFormat('24h')}
              className={timeFormat === '24h' ? 'shadow-sm' : ''}
            >
              24H
            </Button>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Display format for event details.</p>
        </div>
      </CardContent>
    </Card>
  )
}
