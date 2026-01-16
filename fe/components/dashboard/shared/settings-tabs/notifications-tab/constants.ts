import type { DropdownOption } from '../components'
import { REMINDER_TIME_OPTIONS } from '@/lib/validations/preferences'

export const NOTIFICATION_CHANNEL_OPTIONS: DropdownOption[] = [
  { value: 'telegram', label: 'Telegram' },
  { value: 'email', label: 'Email' },
  { value: 'push', label: 'Push' },
  { value: 'push_email', label: 'Push & Email' },
  { value: 'off', label: 'Off' },
]

export const REMINDER_METHOD_OPTIONS: DropdownOption[] = [
  { value: 'popup', label: 'Popup' },
  { value: 'email', label: 'Email' },
]

export const REMINDER_TIME_DROPDOWN_OPTIONS: DropdownOption[] = REMINDER_TIME_OPTIONS.map((opt) => ({
  value: String(opt.value),
  label: opt.label,
}))

export const MAX_REMINDERS = 5
