'use client'

import * as React from 'react'
import { useCallback, useMemo, useState } from 'react'
import { Check, Loader2, Plus, Search, Users, X } from 'lucide-react'
import { useContacts, useCreateContact } from '@/hooks/queries'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Contact } from '@/types/contacts'

export interface ContactPickerContentProps {
  selectedEmails: string[]
  onSelectionChange: (emails: string[]) => void
  placeholder?: string
  disabled?: boolean
  maxSelections?: number
  className?: string
  autoFocus?: boolean
  enabled?: boolean
}

export function ContactPickerContent({
  selectedEmails,
  onSelectionChange,
  placeholder = 'Search contacts or enter email...',
  disabled = false,
  maxSelections,
  className,
  autoFocus = false,
  enabled = true,
}: ContactPickerContentProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newDisplayName, setNewDisplayName] = useState('')

  const { data: paginatedContacts, isLoading } = useContacts({
    params: { limit: 100, sortBy: 'meeting_count', sortOrder: 'desc' },
    enabled,
  })

  const { mutate: createContact, isPending: isCreating } = useCreateContact({
    onSuccess: () => {
      toast.success('Contact added successfully')
      setShowAddDialog(false)
      setNewEmail('')
      setNewDisplayName('')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to add contact')
    },
  })

  const contactsList = useMemo((): Contact[] => {
    const contacts = paginatedContacts?.contacts ?? []
    if (!searchQuery.trim()) {
      return contacts.slice(0, 10)
    }
    const query = searchQuery.toLowerCase()
    return contacts
      .filter(
        (contact) =>
          contact.email.toLowerCase().includes(query) ||
          (contact.display_name && contact.display_name.toLowerCase().includes(query)),
      )
      .slice(0, 10)
  }, [paginatedContacts, searchQuery])

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

  const getDisplayName = (contact: Contact) => {
    return contact.display_name || contact.email.split('@')[0]
  }

  const handleCreateContact = () => {
    if (!newEmail.trim() || !newEmail.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }
    createContact({
      email: newEmail.trim(),
      display_name: newDisplayName.trim() || undefined,
    })
  }

  return (
    <div className={cn('space-y-0', className)}>
      <div className="pb-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9 pr-9"
              autoFocus={autoFocus}
              disabled={disabled}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                onClick={() => setSearchQuery('')}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => setShowAddDialog(true)}
            disabled={disabled}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {searchQuery.includes('@') && !contactsList.some((c) => c.email === searchQuery.toLowerCase()) && (
          <p className="mt-2 text-xs text-muted-foreground">Press Enter to add "{searchQuery}" as attendee</p>
        )}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateContact()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name (optional)</Label>
              <Input
                id="displayName"
                placeholder="John Doe"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateContact()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleCreateContact} disabled={isCreating || !newEmail.trim()}>
              {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Add Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  disabled={disabled}
                >
                  <div
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded border',
                      isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30',
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{getDisplayName(contact)}</p>
                    <p className="truncate text-xs text-muted-foreground">{contact.email}</p>
                  </div>
                  {contact.meeting_count > 0 && (
                    <span className="shrink-0 text-xs text-muted-foreground">{contact.meeting_count} meetings</span>
                  )}
                </button>
              )
            })}
          </div>
        ) : searchQuery.length > 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No contacts found.
            {searchQuery.includes('@') && <p className="mt-1">Press Enter to add this email.</p>}
          </div>
        ) : (
          <div className="py-6 text-center text-sm text-muted-foreground">Start typing to filter contacts...</div>
        )}
      </div>
    </div>
  )
}

export interface ContactPickerProps {
  selectedEmails: string[]
  onSelectionChange: (emails: string[]) => void
  placeholder?: string
  disabled?: boolean
  maxSelections?: number
  className?: string
  /** Whether to show selected emails as badges below the picker */
  showSelectedBadges?: boolean
}

/**
 * ContactPicker - Full contact picker with Popover trigger button.
 * Use this as a standalone component with built-in trigger.
 */
export function ContactPicker({
  selectedEmails,
  onSelectionChange,
  placeholder = 'Add attendees',
  disabled = false,
  maxSelections,
  className,
  showSelectedBadges = true,
}: ContactPickerProps) {
  const [open, setOpen] = useState(false)

  const handleRemoveEmail = useCallback(
    (email: string) => {
      onSelectionChange(selectedEmails.filter((e) => e !== email))
    },
    [selectedEmails, onSelectionChange],
  )

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
        <PopoverContent className="w-80 p-3" align="start">
          <ContactPickerContent
            selectedEmails={selectedEmails}
            onSelectionChange={onSelectionChange}
            disabled={disabled}
            maxSelections={maxSelections}
            autoFocus
          />
        </PopoverContent>
      </Popover>

      {showSelectedBadges && selectedEmails.length > 0 && (
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
