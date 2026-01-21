'use client'

import type { CardBrand, PaymentMethod } from '@/services/payment-service'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import React from 'react'
import { cn } from '@/lib/utils'

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod | null
  onUpdate?: () => void
  className?: string
}

function VisaIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-10 h-6', className)} viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="32" rx="4" fill="#1A1F71" />
      <path
        d="M19.5 21H17L18.9 11H21.4L19.5 21ZM15.3 11L12.9 17.9L12.6 16.5L11.7 12.2C11.7 12.2 11.6 11 10 11H6.1L6 11.2C6 11.2 7.8 11.6 9.9 13L12.1 21H14.7L18 11H15.3ZM38 21L35.7 11H33.6C32.3 11 32 12 32 12L28.2 21H30.8L31.3 19.5H34.5L34.8 21H37.1H38ZM32.1 17.5L33.5 13.5L34.3 17.5H32.1ZM28.8 13.7L29.2 11.3C29.2 11.3 27.6 10.7 25.9 10.7C24.1 10.7 19.9 11.5 19.9 15.1C19.9 18.5 24.5 18.5 24.5 20.2C24.5 21.9 20.4 21.5 18.9 20.3L18.5 22.8C18.5 22.8 20.1 23.5 22.4 23.5C24.7 23.5 28.8 22.3 28.8 19C28.8 15.6 24.1 15.3 24.1 13.8C24.1 12.3 27.3 12.5 28.8 13.7Z"
        fill="white"
      />
    </svg>
  )
}

function MastercardIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-10 h-6', className)} viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="32" rx="4" fill="#F5F5F5" />
      <circle cx="18" cy="16" r="10" fill="#EB001B" />
      <circle cx="30" cy="16" r="10" fill="#F79E1B" />
      <path
        d="M24 8.77C26.2 10.45 27.6 13.06 27.6 16C27.6 18.94 26.2 21.55 24 23.23C21.8 21.55 20.4 18.94 20.4 16C20.4 13.06 21.8 10.45 24 8.77Z"
        fill="#FF5F00"
      />
    </svg>
  )
}

function AmexIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-10 h-6', className)} viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="32" rx="4" fill="#006FCF" />
      <path
        d="M6 16L8.5 10H11L14 16L11 22H8.5L6 16ZM14 10H22L24 12L26 10H34L38 16L34 22H26L24 20L22 22H14L10 16L14 10ZM42 16L39.5 10H37L34 16L37 22H39.5L42 16Z"
        fill="white"
      />
    </svg>
  )
}

function DiscoverIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-10 h-6', className)} viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="32" rx="4" fill="#F5F5F5" />
      <ellipse cx="32" cy="16" rx="10" ry="8" fill="#F47216" />
      <path d="M6 14H10V18H6V14Z" fill="#1A1F71" />
      <path d="M12 13H16V19H12V13Z" fill="#1A1F71" />
      <path d="M18 13H22V19H18V13Z" fill="#1A1F71" />
    </svg>
  )
}

function GenericCardIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-10 h-6', className)} viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="32" rx="4" fill="#71717A" />
      <rect x="6" y="8" width="12" height="8" rx="1" fill="#A1A1AA" />
      <rect x="6" y="20" width="20" height="4" rx="1" fill="#A1A1AA" />
      <rect x="30" y="20" width="12" height="4" rx="1" fill="#A1A1AA" />
    </svg>
  )
}

const cardIcons: Record<CardBrand, React.FC<{ className?: string }>> = {
  visa: VisaIcon,
  mastercard: MastercardIcon,
  amex: AmexIcon,
  discover: DiscoverIcon,
  unknown: GenericCardIcon,
}

export function PaymentMethodCard({ paymentMethod, onUpdate, className }: PaymentMethodCardProps) {
  if (!paymentMethod) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground dark:text-white mb-1">Payment Method</h3>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">No payment method on file</p>
          </div>
          {onUpdate && (
            <Button variant="outline" size="sm" onClick={onUpdate}>
              Add Card
            </Button>
          )}
        </div>
      </Card>
    )
  }

  const CardIcon = cardIcons[paymentMethod.brand]
  const expiryMonth = paymentMethod.expiryMonth.toString().padStart(2, '0')
  const expiryYear = paymentMethod.expiryYear.toString().slice(-2)

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground dark:text-white">Payment Method</h3>
        {onUpdate && (
          <Button variant="ghost" size="sm" onClick={onUpdate}>
            Update
          </Button>
        )}
      </div>

      <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 dark:from-zinc-700 dark:to-zinc-800 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <CardIcon className="w-12 h-8" />
          {paymentMethod.isDefault && (
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Default</span>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-lg tracking-widest">••••</span>
            <span className="text-muted-foreground text-lg tracking-widest">••••</span>
            <span className="text-muted-foreground text-lg tracking-widest">••••</span>
            <span className="text-white text-lg tracking-widest font-mono">{paymentMethod.last4}</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground uppercase block">Expires</span>
              <span className="text-white font-mono">
                {expiryMonth}/{expiryYear}
              </span>
            </div>
            <span className="text-xs text-muted-foreground uppercase">
              {paymentMethod.brand.charAt(0).toUpperCase() + paymentMethod.brand.slice(1)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default PaymentMethodCard
