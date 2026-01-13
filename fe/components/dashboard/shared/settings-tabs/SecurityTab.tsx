'use client'

import React, { useState } from 'react'
import { ChevronRight, ShieldCheck, Monitor } from 'lucide-react'
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
      <CardContent className="max-h-[400px] overflow-y-auto">
        <SettingsSection title="Authentication">
          <SettingsRow
            id="mfa"
            title="Authenticator App (MFA)"
            tooltip="Require a 2FA code when logging in from a new device for enhanced security"
            icon={<ShieldCheck size={18} className="text-green-500 dark:text-green-400" />}
            control={<CinematicGlowToggle id={toggleId} checked={authenticatorApp} onChange={setAuthenticatorApp} />}
          />
        </SettingsSection>

        <SettingsSection showDivider className="mt-4">
          <SettingsRow
            id="active-sessions"
            title="Active Sessions"
            tooltip="View and manage your active login sessions across devices"
            icon={<Monitor size={18} className="text-blue-500 dark:text-blue-400" />}
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
