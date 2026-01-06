'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Moon, Sun, Monitor } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SettingsRow, SettingsDropdown, SettingsSection, type DropdownOption } from './components'
import type { CustomUser } from '@/types/api'
import type { User } from '@supabase/supabase-js'

interface GeneralTabProps {
  isDarkMode: boolean
  toggleTheme: () => void
  userData: CustomUser | User | null | undefined
  isUserLoading: boolean
}

const APPEARANCE_OPTIONS: DropdownOption[] = [
  { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
  { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
  { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
]

const TIMEZONE_OPTIONS: DropdownOption[] = [
  { value: 'Asia/Jerusalem', label: 'Jerusalem (IST)' },
  { value: 'America/New_York', label: 'New York (EST)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST)' },
  { value: 'America/Chicago', label: 'Chicago (CST)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST)' },
]

const TIME_FORMAT_OPTIONS: DropdownOption[] = [
  { value: '12h', label: '12-hour (AM/PM)' },
  { value: '24h', label: '24-hour' },
]

export const GeneralTab: React.FC<GeneralTabProps> = ({ isDarkMode, toggleTheme, userData }) => {
  const [timeFormat, setTimeFormat] = useState('12h')
  const [timezone, setTimezone] = useState('Asia/Jerusalem')
  const [appearance, setAppearance] = useState(isDarkMode ? 'dark' : 'light')

  const handleAppearanceChange = (value: string) => {
    setAppearance(value)
    if (value === 'dark' && !isDarkMode) {
      toggleTheme()
    } else if (value === 'light' && isDarkMode) {
      toggleTheme()
    }
  }

  const isCustomUser = userData && ('avatar_url' in userData || 'first_name' in userData)
  const customUser = isCustomUser ? (userData as CustomUser) : null
  const standardUser = !isCustomUser && userData && 'user_metadata' in userData ? (userData as User) : null

  const firstName = customUser?.first_name || (standardUser?.user_metadata as Record<string, unknown>)?.first_name || ''
  const lastName = customUser?.last_name || (standardUser?.user_metadata as Record<string, unknown>)?.last_name || ''
  const email = customUser?.email || standardUser?.email || ''
  const avatarUrl = customUser?.avatar_url || (standardUser?.user_metadata as Record<string, unknown>)?.avatar_url
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'User'
  const initials =
    `${(firstName as string)?.[0] || ''}${(lastName as string)?.[0] || ''}`.toUpperCase() ||
    (email as string)?.[0]?.toUpperCase() ||
    'U'
  const createdAt = customUser?.created_at || standardUser?.created_at

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">General</CardTitle>
        <CardDescription>Manage your profile and preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          {avatarUrl ? (
            <Image
              src={avatarUrl as string}
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
            <p className="text-sm text-zinc-500 truncate">{email as string}</p>
            {createdAt && (
              <p className="text-xs text-zinc-400 mt-1">
                Member since {new Date(createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>

        <SettingsSection>
          <SettingsRow
            id="appearance"
            title="Appearance"
            tooltip="Choose your preferred color theme for the interface"
            control={
              <SettingsDropdown
                id="appearance-dropdown"
                value={appearance}
                options={APPEARANCE_OPTIONS}
                onChange={handleAppearanceChange}
              />
            }
          />

          <SettingsRow
            id="timezone"
            title="Default Timezone"
            tooltip="Events will be scheduled in this timezone unless specified otherwise"
            control={
              <SettingsDropdown
                id="timezone-dropdown"
                value={timezone}
                options={TIMEZONE_OPTIONS}
                onChange={setTimezone}
                className="min-w-[180px]"
              />
            }
          />

          <SettingsRow
            id="time-format"
            title="Time Format"
            tooltip="Display format for event times throughout the app"
            control={
              <SettingsDropdown
                id="time-format-dropdown"
                value={timeFormat}
                options={TIME_FORMAT_OPTIONS}
                onChange={setTimeFormat}
                className="min-w-[160px]"
              />
            }
          />
        </SettingsSection>
      </CardContent>
    </Card>
  )
}
