'use client'

import * as React from 'react'
import { useCallback, useMemo, useState } from 'react'
import { Check, Loader2, Search, Users, X } from 'lucide-react'
import { useSearchContacts } from '@/hooks/queries'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ContactSearchResult } from '@/types/contacts'

export interface ContactPickerProps {
  selectedEmails: string[]
  onSelectionChange: (emails: string[]) => void
  placeholder?: string
  disabled?: boolean
  maxSelections?: number
  className?: string
}

export function ContactPicker({
  selectedEmails,
  onSelectionChange,
  placeholder = 'Add attendees',
  disabled = false,
  maxSelections,
  className,
}: ContactPickerProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data: contacts, isLoading } = useSearchContacts({
    params: { query: debouncedQuery, limit: 10 },
    enabled: debouncedQuery.length >= 2,
  })

  const contactsList = useMemo((): ContactSearchResult[] => {
    return contacts ?? []
  }, [contacts])

  const handleToggleContact = useCallback(
    (email: string) => {
      const isSelected = selectedEmails.includes(email)
      if (isSelected) {
        onSelectionChange(selectedEmails.filter((e) => e !== email))
      } else {
        if (maxSelections && selectedEmails.length >= maxSelections) {
          return
        }
        onSelectionChange([...selectedEmails, email])
      }
    },
    [selectedEmails, onSelectionChange, maxSelections],
  )

  const handleRemoveEmail = useCallback(
    (email: string) => {
      onSelectionChange(selectedEmails.filter((e) => e !== email))
    },
    [selectedEmails, onSelectionChange],
  )

  const handleAddManualEmail = useCallback(
    (email: string) => {
      const trimmedEmail = email.trim().toLowerCase()
      if (!trimmedEmail || !trimmedEmail.includes('@')) return
      if (selectedEmails.includes(trimmedEmail)) return
      if (maxSelections && selectedEmails.length >= maxSelections) return

      onSelectionChange([...selectedEmails, trimmedEmail])
      setSearchQuery('')
    },
    [selectedEmails, onSelectionChange, maxSelections],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && searchQuery.includes('@')) {
        e.preventDefault()
        handleAddManualEmail(searchQuery)
      }
    },
    [searchQuery, handleAddManualEmail],
  )

  const getDisplayName = (contact: ContactSearchResult) => {
    return contact.displayName || contact.email.split('@')[0]
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              'w-full justify-between gap-2 bg-transparent font-normal',
              !selectedEmails.length && 'text-muted-foreground',
            )}
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {selectedEmails.length > 0 ? `${selectedEmails.length} attendee(s) selected` : placeholder}
              </span>
            </div>
            {selectedEmails.length > 0 && (
              <Badge variant="secondary" className="ml-auto h-5 px-1.5">
                {selectedEmails.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-3 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search contacts or enter email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9 pr-9"
                autoFocus
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {searchQuery.includes('@') && !contactsList.some((c) => c.email === searchQuery.toLowerCase()) && (
              <p className="mt-2 text-xs text-muted-foreground">Press Enter to add "{searchQuery}" as attendee</p>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto border-t">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : contactsList.length > 0 ? (
              <div className="p-1">
                {contactsList.map((contact) => {
                  const isSelected = selectedEmails.includes(contact.email)
                  return (
                    <button
                      key={contact.email}
                      type="button"
                      className={cn(
                        'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors',
                        'hover:bg-accent focus:bg-accent focus:outline-none',
                        isSelected && 'bg-accent/50',
                      )}
                      onClick={() => handleToggleContact(contact.email)}
                    >
                      <div
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded border',
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted-foreground/30',
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{getDisplayName(contact)}</p>
                        <p className="truncate text-xs text-muted-foreground">{contact.email}</p>
                      </div>
                      {contact.meetingCount > 0 && (
                        <span className="shrink-0 text-xs text-muted-foreground">{contact.meetingCount} meetings</span>
                      )}
                    </button>
                  )
                })}
              </div>
            ) : debouncedQuery.length >= 2 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No contacts found.
                {searchQuery.includes('@') && <p className="mt-1">Press Enter to add this email.</p>}
              </div>
            ) : (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Type at least 2 characters to search...
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {selectedEmails.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedEmails.map((email) => (
            <Badge key={email} variant="secondary" className="gap-1 pr-1">
              <span className="max-w-[150px] truncate">{email}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleRemoveEmail(email)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
