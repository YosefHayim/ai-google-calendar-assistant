'use client'

import React, { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import CinematicGlowToggle from '@/components/ui/cinematic-glow-toggle'
import { SettingsRow, SettingsSection } from './components'

export const SecurityTab: React.FC = () => {
  const [authenticatorApp, setAuthenticatorApp] = useState(true)
  const toggleId = React.useId()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Security</CardTitle>
        <CardDescription>Manage your authentication and session settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <SettingsSection title="Authentication">
          <SettingsRow
            id="mfa"
            title="Authenticator App (MFA)"
            tooltip="Require a 2FA code when logging in from a new device for enhanced security"
                        control={<CinematicGlowToggle id={toggleId} checked={authenticatorApp} onChange={setAuthenticatorApp} />}
          />
        </SettingsSection>

        <SettingsSection showDivider className="mt-4">
          <SettingsRow
            id="active-sessions"
            title="Active Sessions"
            tooltip="View and manage your active login sessions across devices"
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
