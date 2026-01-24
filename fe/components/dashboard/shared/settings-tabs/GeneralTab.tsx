'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Globe, Clock, MapPin, Languages, Palette } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { SettingsRow, SettingsDropdown, SettingsSection, TabHeader, type DropdownOption } from './components'
import CinematicGlowToggle from '@/components/ui/cinematic-glow-toggle'
import { getUserDisplayInfo, type UserData } from '@/lib/user-utils'
import { SUPPORTED_LANGUAGES, LANGUAGE_STORAGE_KEY, type SupportedLanguageCode } from '@/lib/i18n/config'
import {
  useGeoLocation,
  useUpdateGeoLocation,
  useDisplayPreferences,
  useUpdateDisplayPreferences,
  useTimezonesList,
} from '@/hooks/queries'
import i18n from '@/lib/i18n/config'

const GEO_PERMISSION_KEY = 'ally_geo_permission_granted'

interface GeneralTabProps {
  isDarkMode: boolean
  toggleTheme: () => void
  userData: UserData | null | undefined
  isUserLoading: boolean
}

const LANGUAGE_OPTIONS: DropdownOption[] = SUPPORTED_LANGUAGES.map((lang) => ({
  value: lang.code,
  label: lang.nativeName,
}))

export const GeneralTab: React.FC<GeneralTabProps> = ({ isDarkMode, toggleTheme, userData }) => {
  const { t } = useTranslation()
  const geoLocationToggleId = React.useId()
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h')
  const [timezone, setTimezone] = useState('Asia/Jerusalem')
  const [appearance, setAppearance] = useState(isDarkMode ? 'dark' : 'light')
  const [geoLocationEnabled, setGeoLocationEnabled] = useState(false)
  const [language, setLanguage] = useState<SupportedLanguageCode>('en')

  const { data: geoLocationData, isLoading: isLoadingGeoLocation } = useGeoLocation()
  const { updateGeoLocation, isUpdating: isUpdatingGeoLocation } = useUpdateGeoLocation()
  const { data: displayPreferencesData, isLoading: isLoadingDisplayPreferences } = useDisplayPreferences()
  const { updateDisplayPreferences, isUpdating: isUpdatingDisplayPreferences } = useUpdateDisplayPreferences()
  const { data: timezonesList, isLoading: isLoadingTimezones } = useTimezonesList()

  useEffect(() => {
    setLanguage(i18n.language as SupportedLanguageCode)
  }, [])

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
          toast.success(t('toast.timezoneUpdated'))
        },
        onError: () => {
          if (displayPreferencesData?.value) {
            setTimezone(displayPreferencesData.value.timezone)
          }
          toast.error(t('toast.timezoneUpdateFailed'))
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
          toast.success(t('toast.timeFormatUpdated'))
        },
        onError: () => {
          if (displayPreferencesData?.value) {
            setTimeFormat(displayPreferencesData.value.timeFormat)
          }
          toast.error(t('toast.timeFormatUpdateFailed'))
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
              toast.success(t('toast.realTimeLocationEnabled'))
            },
            onError: () => {
              setGeoLocationEnabled(false)
              toast.error(t('toast.locationEnableFailed'))
            },
          },
        )
      }

      const handleError = () => {
        localStorage.removeItem(GEO_PERMISSION_KEY)
        setGeoLocationEnabled(false)
        toast.error(t('toast.locationAccessDenied'))
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
            toast.success(t('toast.realTimeLocationDisabled'))
          },
          onError: () => {
            setGeoLocationEnabled(true)
            toast.error(t('toast.locationDisableFailed'))
          },
        },
      )
    }
  }

  const handleLanguageChange = async (value: string) => {
    const newLang = value as SupportedLanguageCode
    setLanguage(newLang)
    await i18n.changeLanguage(newLang)
    localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang)

    const langConfig = SUPPORTED_LANGUAGES.find((l) => l.code === newLang)
    document.documentElement.dir = langConfig?.dir || 'ltr'
    document.documentElement.lang = newLang

    toast.success(t('common.save'))
  }

  const userInfo = getUserDisplayInfo(userData)
  const fullName = userInfo?.fullName ?? 'User'
  const initials = userInfo?.initials ?? 'U'
  const email = userInfo?.email ?? ''
  const avatarUrl = userInfo?.avatarUrl
  const createdAt = userInfo?.createdAt

  return (
    <div className="space-y-6">
      <TabHeader
        title={t('settings.general', 'General')}
        description={t('settings.generalDescription', 'Manage your profile and preferences.')}
      />

      <SettingsSection
        variant="card"
        title={t('settings.profile', 'Profile')}
        description={t('settings.profileDescription', 'Your personal information and preferences')}
      >
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={fullName}
              width={56}
              height={56}
              className="flex-shrink-0 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <span className="text-lg font-semibold">{initials}</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-base font-semibold text-foreground">{fullName}</h4>
            <p className="truncate text-sm text-muted-foreground">{email}</p>
            {createdAt && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t('settings.memberSince', 'Member since')}{' '}
                {new Date(createdAt).toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        variant="card"
        title={t('settings.preferences', 'Preferences')}
        description={t('settings.preferencesDescription', 'Customize your experience')}
      >
        <SettingsRow
          id="language"
          title={t('settings.language', 'Language')}
          description={t('settings.languageDescription', 'Choose your preferred interface language')}
          icon={<Languages size={18} />}
          control={
            <SettingsDropdown
              id="language-dropdown"
              value={language}
              options={LANGUAGE_OPTIONS}
              onChange={handleLanguageChange}
            />
          }
        />

        <SettingsRow
          id="appearance"
          title={t('settings.appearance', 'Appearance')}
          description={t('settings.appearanceDescription', 'Choose your preferred color theme')}
          icon={<Palette size={18} />}
          control={
            <SettingsDropdown
              id="appearance-dropdown"
              value={appearance}
              options={[
                { value: 'light', label: t('settings.themeLight', 'Light') },
                { value: 'dark', label: t('settings.themeDark', 'Dark') },
              ]}
              onChange={handleAppearanceChange}
            />
          }
        />

        <SettingsRow
          id="timezone"
          title={t('settings.defaultTimezone', 'Default Timezone')}
          description={t('settings.timezoneDescription', 'Events will be scheduled in this timezone')}
          icon={<Globe size={18} />}
          control={
            <SettingsDropdown
              id="timezone-dropdown"
              value={timezone}
              options={timezoneOptions}
              onChange={
                isUpdatingDisplayPreferences || isLoadingDisplayPreferences || isLoadingTimezones
                  ? () => {}
                  : handleTimezoneChange
              }
            />
          }
        />

        <SettingsRow
          id="time-format"
          title={t('settings.timeFormat', 'Time Format')}
          description={t('settings.timeFormatDescription', 'Display format for event times')}
          icon={<Clock size={18} />}
          control={
            <SettingsDropdown
              id="time-format-dropdown"
              value={timeFormat}
              options={[
                { value: '12h', label: t('settings.timeFormat12h', '12-hour (AM/PM)') },
                { value: '24h', label: t('settings.timeFormat24h', '24-hour') },
              ]}
              onChange={isUpdatingDisplayPreferences || isLoadingDisplayPreferences ? () => {} : handleTimeFormatChange}
            />
          }
        />

        <SettingsRow
          id="geo-location"
          title={t('settings.realTimeLocation', 'Real-time Location')}
          description={t('settings.realTimeLocationDescription', 'Use your location for context in event creation')}
          icon={<MapPin size={18} />}
          control={
            <CinematicGlowToggle
              id={geoLocationToggleId}
              checked={geoLocationEnabled}
              onChange={isUpdatingGeoLocation || isLoadingGeoLocation ? () => {} : handleGeoLocationToggle}
            />
          }
        />
      </SettingsSection>
    </div>
  )
}
