'use client'

import React, { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import CinematicGlowToggle from '@/components/ui/cinematic-glow-toggle'

export const SecurityTab: React.FC = () => {
  const [authenticatorApp, setAuthenticatorApp] = useState(true)
  const toggleId = React.useId()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Security</CardTitle>
        <CardDescription>Manage your authentication and session settings.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {/* MFA Section */}
        <div className="grid gap-4">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Authentication</div>

          <div className="flex items-center justify-between">
            <div className="grid gap-1">
              <Label htmlFor={toggleId}>Authenticator App (MFA)</Label>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Require a 2FA code when logging in from a new device.
              </p>
            </div>
            <CinematicGlowToggle id={toggleId} checked={authenticatorApp} onChange={setAuthenticatorApp} />
          </div>
        </div>

        {/* Active Sessions */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <Button variant="ghost" className="w-full justify-between px-0 hover:bg-transparent">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Active Sessions</span>
            <span className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
              1 (Current) <ChevronRight size={16} />
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
