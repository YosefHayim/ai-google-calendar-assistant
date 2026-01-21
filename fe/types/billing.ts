// Billing types are now defined in @/services/payment-service
// This file is kept for backward compatibility
export type {
  TransactionStatus,
  CardBrand,
  PaymentMethod,
  Transaction,
  BillingOverview,
} from '@/services/payment-service'
