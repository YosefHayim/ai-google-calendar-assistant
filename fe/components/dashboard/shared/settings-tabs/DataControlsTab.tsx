'use client'

import React from 'react'
import { Download, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SettingsRow, SettingsSection } from './components'

export const DataControlsTab: React.FC = () => {
  const handleExport = () => {
    console.log('Exporting calendar data...')
  }

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Deleting account...')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Data Controls</CardTitle>
        <CardDescription>Manage your data and account.</CardDescription>
      </CardHeader>
      <CardContent>
        <SettingsSection>
          <SettingsRow
            id="export-data"
            title="Export Calendar Data"
            tooltip="Download all your calendar data as a CSV file for backup or migration"
            control={
              <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            }
          />
        </SettingsSection>

        <SettingsSection showDivider className="mt-4">
          <SettingsRow
            id="delete-account"
            title="Delete Account"
            tooltip="Permanently delete your account and all associated data. This cannot be undone."
            control={
              <Button variant="destructive" size="sm" onClick={handleDeleteAccount} className="gap-2">
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            }
          />
        </SettingsSection>
      </CardContent>
    </Card>
  )
}
