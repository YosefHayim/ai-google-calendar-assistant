'use client'

import React, { useState } from 'react'
import { ChevronRight, ShieldCheck, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import CinematicGlowToggle from '@/components/ui/cinematic-glow-toggle'
import { SettingsRow, SettingsSection, TabHeader } from './components'
import { useTranslation } from 'react-i18next'

export const SecurityTab: React.FC = () => {
  const { t } = useTranslation()
  const [authenticatorApp, setAuthenticatorApp] = useState(false)
  const toggleId = React.useId()

  return (
    <div className="space-y-6">
      <TabHeader
        title={t('settings.security', 'Security')}
        description={t('settings.securityDescription', 'Manage your authentication and session settings.')}
      />

      <SettingsSection
        variant="card"
        title={t('settings.authentication', 'Authentication')}
        description={t('settings.authenticationDescription', 'Configure how you sign in to your account')}
      >
        <SettingsRow
          id="mfa"
          title={t('settings.authenticatorApp', 'Authenticator App (MFA)')}
          description={t('settings.mfaDescription', 'Require a 2FA code when logging in from a new device')}
          icon={<ShieldCheck size={18} />}
          control={<CinematicGlowToggle id={toggleId} checked={authenticatorApp} onChange={setAuthenticatorApp} />}
        />

        <SettingsRow
          id="active-sessions"
          title={t('settings.activeSessions', 'Active Sessions')}
          description={t('settings.activeSessionsDescription', 'View and manage your active login sessions')}
          icon={<Monitor size={18} />}
          control={
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
              1 (Current) <ChevronRight className="h-4 w-4" />
            </Button>
          }
        />
      </SettingsSection>
    </div>
  )
}
