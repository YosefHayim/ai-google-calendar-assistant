'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Moon, Sun, Monitor, Palette, Globe, Clock, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SettingsRow, SettingsDropdown, SettingsSection, type DropdownOption } from './components'
import CinematicGlowToggle from '@/components/ui/cinematic-glow-toggle'
import { getUserDisplayInfo, type UserData } from '@/lib/user-utils'
import { useGeoLocation, useUpdateGeoLocation, useDisplayPreferences, useUpdateDisplayPreferences, useTimezonesList } from '@/hooks/queries'

const GEO_PERMISSION_KEY = 'ally_geo_permission_granted'

interface GeneralTabProps {
  isDarkMode: boolean
  toggleTheme: () => void
  userData: UserData | null | undefined
  isUserLoading: boolean
}

const APPEARANCE_OPTIONS: DropdownOption[] = [
  { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
  { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
  { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
]

const TIME_FORMAT_OPTIONS: DropdownOption[] = [
  { value: '12h', label: '12-hour (AM/PM)' },
  { value: '24h', label: '24-hour' },
]

export const GeneralTab: React.FC<GeneralTabProps> = ({ isDarkMode, toggleTheme, userData }) => {
  const geoLocationToggleId = React.useId()
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h')
  const [timezone, setTimezone] = useState('Asia/Jerusalem')
  const [appearance, setAppearance] = useState(isDarkMode ? 'dark' : 'light')
  const [geoLocationEnabled, setGeoLocationEnabled] = useState(false)

  const { data: geoLocationData, isLoading: isLoadingGeoLocation } = useGeoLocation()
  const { updateGeoLocation, isUpdating: isUpdatingGeoLocation } = useUpdateGeoLocation()
  const { data: displayPreferencesData, isLoading: isLoadingDisplayPreferences } = useDisplayPreferences()
  const { updateDisplayPreferences, isUpdating: isUpdatingDisplayPreferences } = useUpdateDisplayPreferences()
  const { data: timezonesList, isLoading: isLoadingTimezones } = useTimezonesList()

  const timezoneOptions: DropdownOption[] = React.useMemo(() => {
    if (!timezonesList || timezonesList.length === 0) {
      return [{ value: timezone, label: timezone }]
    }
    return timezonesList
  }, [timezonesList, timezone])

  useEffect(() => {
    if (geoLocationData?.value) {
      setGeoLocationEnabled(geoLocationData.value.enabled)
    }
  }, [geoLocationData])

  useEffect(() => {
    if (displayPreferencesData?.value) {
      setTimezone(displayPreferencesData.value.timezone)
      setTimeFormat(displayPreferencesData.value.timeFormat)
    }
  }, [displayPreferencesData])

  const handleAppearanceChange = (value: string) => {
    setAppearance(value)
    if (value === 'dark' && !isDarkMode) {
      toggleTheme()
    } else if (value === 'light' && isDarkMode) {
      toggleTheme()
    }
  }

  const handleTimezoneChange = (value: string) => {
    setTimezone(value)
    updateDisplayPreferences(
      { timezone: value, timeFormat },
      {
        onSuccess: () => {
          toast.success('Timezone updated')
        },
        onError: () => {
          if (displayPreferencesData?.value) {
            setTimezone(displayPreferencesData.value.timezone)
          }
          toast.error('Failed to update timezone')
        },
      },
    )
  }

  const handleTimeFormatChange = (value: string) => {
    const typedValue = value as '12h' | '24h'
    setTimeFormat(typedValue)
    updateDisplayPreferences(
      { timezone, timeFormat: typedValue },
      {
        onSuccess: () => {
          toast.success('Time format updated')
        },
        onError: () => {
          if (displayPreferencesData?.value) {
            setTimeFormat(displayPreferencesData.value.timeFormat)
          }
          toast.error('Failed to update time format')
        },
      },
    )
  }

  const handleGeoLocationToggle = async (checked: boolean) => {
    setGeoLocationEnabled(checked)

    if (checked && navigator.geolocation) {
      const hasPermission = localStorage.getItem(GEO_PERMISSION_KEY) === 'true'

      const saveLocation = (position: GeolocationPosition) => {
        localStorage.setItem(GEO_PERMISSION_KEY, 'true')
        updateGeoLocation(
          {
            enabled: true,
            lastKnownLocation: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              timestamp: new Date().toISOString(),
            },
          },
          {
            onSuccess: () => {
              toast.success('Real-time location enabled', {
                description: 'Ally will use your location to provide context for events.',
              })
            },
            onError: () => {
              setGeoLocationEnabled(false)
              toast.error('Failed to enable location')
            },
          },
        )
      }

      const handleError = () => {
        localStorage.removeItem(GEO_PERMISSION_KEY)
        setGeoLocationEnabled(false)
        toast.error('Location access denied', {
          description: 'Please enable location access in your browser settings.',
        })
      }

      if (hasPermission) {
        navigator.geolocation.getCurrentPosition(saveLocation, handleError, { timeout: 10000 })
      } else {
        navigator.geolocation.getCurrentPosition(saveLocation, handleError)
      }
    } else {
      localStorage.removeItem(GEO_PERMISSION_KEY)
      updateGeoLocation(
        { enabled: false },
        {
          onSuccess: () => {
            toast.success('Real-time location disabled')
          },
          onError: () => {
            setGeoLocationEnabled(true)
            toast.error('Failed to disable location')
          },
        },
      )
    }
  }

  const userInfo = getUserDisplayInfo(userData)
  const fullName = userInfo?.fullName ?? 'User'
  const initials = userInfo?.initials ?? 'U'
  const email = userInfo?.email ?? ''
  const avatarUrl = userInfo?.avatarUrl
  const createdAt = userInfo?.createdAt

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">General</CardTitle>
        <CardDescription>Manage your profile and preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex flex-wrap items-center gap-4 pb-4 border-b  dark:border sm:flex-nowrap">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={fullName}
              width={56}
              height={56}
              className="rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div className="h-14 w-14 rounded-xl bg-accent dark:bg-zinc-700 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-medium text-zinc-600 dark:text-zinc-300">{initials}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-foreground dark:text-primary-foreground truncate">{fullName}</h4>
            <p className="text-sm text-muted-foreground truncate">{email}</p>
            {createdAt && (
              <p className="text-xs text-muted-foreground mt-1">
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
            icon={<Palette size={18} className="text-foreground dark:text-primary" />}
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
            icon={<Globe size={18} className="text-foreground dark:text-primary" />}
            control={
              <SettingsDropdown
                id="timezone-dropdown"
                value={timezone}
                options={timezoneOptions}
                onChange={isUpdatingDisplayPreferences || isLoadingDisplayPreferences || isLoadingTimezones ? () => {} : handleTimezoneChange}
              />
            }
          />

          <SettingsRow
            id="time-format"
            title="Time Format"
            tooltip="Display format for event times throughout the app"
            icon={<Clock size={18} className="text-foreground dark:text-primary" />}
            control={
              <SettingsDropdown
                id="time-format-dropdown"
                value={timeFormat}
                options={TIME_FORMAT_OPTIONS}
                onChange={isUpdatingDisplayPreferences || isLoadingDisplayPreferences ? () => {} : handleTimeFormatChange}
              />
            }
          />

          <SettingsRow
            id="geo-location"
            title="Real-time Location"
            tooltip="When enabled, Ally uses your current location to provide context for event creation (e.g., suggesting nearby venues)"
            icon={<MapPin size={18} className="text-foreground dark:text-primary" />}
            control={
              <CinematicGlowToggle
                id={geoLocationToggleId}
                checked={geoLocationEnabled}
                onChange={isUpdatingGeoLocation || isLoadingGeoLocation ? () => {} : handleGeoLocationToggle}
              />
            }
          />
        </SettingsSection>
      </CardContent>
    </Card>
  )
}
