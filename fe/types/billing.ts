export type TransactionStatus = 'succeeded' | 'pending' | 'failed'

export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  currency: string
  status: TransactionStatus
  invoiceUrl: string | null
}

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown'

export interface PaymentMethod {
  id: string
  brand: CardBrand
  last4: string
  expiryMonth: number
  expiryYear: number
  isDefault: boolean
}

export interface BillingOverview {
  paymentMethod: PaymentMethod | null
  transactions: Transaction[]
}

export const MOCK_PAYMENT_METHOD: PaymentMethod = {
  id: 'pm_1234567890',
  brand: 'visa',
  last4: '4242',
  expiryMonth: 12,
  expiryYear: 2028,
  isDefault: true,
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn_001',
    date: '2025-12-12T10:30:00Z',
    description: 'Pro Plan - Monthly',
    amount: 29.0,
    currency: 'USD',
    status: 'succeeded',
    invoiceUrl: '#',
  },
  {
    id: 'txn_002',
    date: '2025-11-12T10:30:00Z',
    description: 'Pro Plan - Monthly',
    amount: 29.0,
    currency: 'USD',
    status: 'succeeded',
    invoiceUrl: '#',
  },
  {
    id: 'txn_003',
    date: '2025-10-12T10:30:00Z',
    description: 'Pro Plan - Monthly',
    amount: 29.0,
    currency: 'USD',
    status: 'pending',
    invoiceUrl: null,
  },
  {
    id: 'txn_004',
    date: '2025-09-12T10:30:00Z',
    description: 'Pro Plan - Monthly',
    amount: 29.0,
    currency: 'USD',
    status: 'failed',
    invoiceUrl: null,
  },
  {
    id: 'txn_005',
    date: '2025-08-12T10:30:00Z',
    description: 'Pro Plan - Monthly',
    amount: 29.0,
    currency: 'USD',
    status: 'succeeded',
    invoiceUrl: '#',
  },
  {
    id: 'txn_006',
    date: '2025-07-12T10:30:00Z',
    description: 'Pro Plan - Monthly',
    amount: 29.0,
    currency: 'USD',
    status: 'succeeded',
    invoiceUrl: '#',
  },
]
