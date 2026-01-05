'use client'

import React, { useState } from 'react'
import { AlertTriangle, Brain, Loader2, MessageSquareX, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import CinematicGlowToggle from '@/components/ui/cinematic-glow-toggle'

interface AssistantTabProps {
  onDeleteAllConversations: () => void
  isDeletingConversations: boolean
}

export const AssistantTab: React.FC<AssistantTabProps> = ({ onDeleteAllConversations, isDeletingConversations }) => {
  const [contextualMemory, setContextualMemory] = useState(true)
  const [memoryUsage] = useState('~1.2MB of scheduling patterns')
  const toggleId = React.useId()

  const handleClearChatHistory = () => {
    if (
      window.confirm(
        "Are you sure you want to clear Ally's memory? It will forget your scheduling preferences and common meeting times.",
      )
    ) {
      toast.success('Memory cleared', {
        description: 'Ally will relearn your habits over time.',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Assistant Intelligence</CardTitle>
        <CardDescription>Manage how Ally learns and remembers your preferences.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {/* Contextual Memory Toggle */}
        <div className="flex items-center justify-between">
          <div className="grid gap-1">
            <Label htmlFor={toggleId}>Contextual Scheduling</Label>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Allow Ally to remember your preferred meeting durations, buffer times, and recurring locations.
            </p>
          </div>
          <CinematicGlowToggle id={toggleId} checked={contextualMemory} onChange={setContextualMemory} />
        </div>

        {/* Memory Usage & Actions */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 grid gap-4">
          <div className="flex items-center gap-3">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Learned Patterns: <span className="text-zinc-500 dark:text-zinc-400 font-normal ml-1">{memoryUsage}</span>
            </span>
          </div>

          <Button variant="outline" onClick={onDeleteAllConversations} disabled={isDeletingConversations}>
            {isDeletingConversations ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : (
              <MessageSquareX size={16} className="mr-2" />
            )}
            Delete Chat Logs
          </Button>

          <Button variant="destructive" onClick={handleClearChatHistory}>
            <Trash2 size={16} className="mr-2" /> Reset Assistant Memory
          </Button>

          <p className="text-xs text-red-500 flex items-center gap-1 font-medium">
            <AlertTriangle size={14} /> Warning: Ally will forget your scheduling habits.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
