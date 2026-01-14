'use client'

import React, { useState } from 'react'
import { ChevronRight, ShieldCheck, Monitor } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import CinematicGlowToggle from '@/components/ui/cinematic-glow-toggle'
import { SettingsRow, SettingsSection, TabHeader } from './components'

export const SecurityTab: React.FC = () => {
  const [authenticatorApp, setAuthenticatorApp] = useState(true)
  const toggleId = React.useId()

  return (
    <Card>
      <TabHeader
        title="Security"
        tooltip="Manage your authentication and session settings"
      />
      <CardContent>
        <SettingsSection title="Authentication">
          <SettingsRow
            id="mfa"
            title="Authenticator App (MFA)"
            tooltip="Require a 2FA code when logging in from a new device for enhanced security"
            icon={<ShieldCheck size={18} className="text-zinc-900 dark:text-primary" />}
            control={<CinematicGlowToggle id={toggleId} checked={authenticatorApp} onChange={setAuthenticatorApp} />}
          />
        </SettingsSection>

        <SettingsSection showDivider className="mt-4">
          <SettingsRow
            id="active-sessions"
            title="Active Sessions"
            tooltip="View and manage your active login sessions across devices"
            icon={<Monitor size={18} className="text-zinc-900 dark:text-primary" />}
            control={
              <Button variant="ghost" size="sm" className="gap-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700">
                1 (Current) <ChevronRight className="w-4 h-4" />
              </Button>
            }
          />
        </SettingsSection>
      </CardContent>
    </Card>
  )
}
