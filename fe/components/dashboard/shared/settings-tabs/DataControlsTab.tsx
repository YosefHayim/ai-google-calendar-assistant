'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const DataControlsTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Data Controls</CardTitle>
        <CardDescription>Manage your data and account.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Export Calendar Data</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Download all your calendar data as CSV.</p>
          </div>
          <Button variant="outline" size="sm">
            Export CSV
          </Button>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Delete Account</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Permanently delete your account and all data.
            </p>
          </div>
          <Button variant="destructive" size="sm">
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
