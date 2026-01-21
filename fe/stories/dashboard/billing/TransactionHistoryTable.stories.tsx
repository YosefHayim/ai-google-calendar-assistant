import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { TransactionHistoryTable } from '@/components/dashboard/billing/TransactionHistoryTable'
import type { Transaction } from '@/services/payment-service'

const meta: Meta<typeof TransactionHistoryTable> = {
  title: 'Dashboard/Billing/TransactionHistoryTable',
  component: TransactionHistoryTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A responsive transaction history table displaying payment records with status badges, download invoices, and mobile-friendly expandable cards.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-4xl mx-auto p-6 bg-background">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    transactions: {
      description: 'Array of transaction records to display',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const mockTransactions: Transaction[] = [
  {
    id: 'txn_1NxQR2ABC123def456',
    date: '2026-01-15T10:30:00Z',
    description: 'Pro Plan - Monthly Subscription',
    amount: 2900,
    currency: 'USD',
    status: 'succeeded',
    invoiceUrl: 'https://pay.lemonsqueezy.com/invoice/123',
  },
  {
    id: 'txn_1NwPQ1ABC123def789',
    date: '2025-12-15T10:30:00Z',
    description: 'Pro Plan - Monthly Subscription',
    amount: 2900,
    currency: 'USD',
    status: 'succeeded',
    invoiceUrl: 'https://pay.lemonsqueezy.com/invoice/122',
  },
  {
    id: 'txn_1NvOP0ABC123ghi012',
    date: '2025-11-15T10:30:00Z',
    description: 'Pro Plan - Monthly Subscription',
    amount: 2900,
    currency: 'USD',
    status: 'succeeded',
    invoiceUrl: 'https://pay.lemonsqueezy.com/invoice/121',
  },
  {
    id: 'txn_1NuNO9ABC123jkl345',
    date: '2025-10-15T10:30:00Z',
    description: 'Credit Pack - 500 Credits',
    amount: 4900,
    currency: 'USD',
    status: 'succeeded',
    invoiceUrl: 'https://pay.lemonsqueezy.com/invoice/120',
  },
  {
    id: 'txn_1NtMN8ABC123mno678',
    date: '2025-09-20T14:45:00Z',
    description: 'Pro Plan - Annual Subscription',
    amount: 29900,
    currency: 'USD',
    status: 'succeeded',
    invoiceUrl: 'https://pay.lemonsqueezy.com/invoice/119',
  },
]

export const Default: Story = {
  args: {
    transactions: mockTransactions,
  },
}

export const WithPendingTransaction: Story = {
  args: {
    transactions: [
      {
        id: 'txn_pending_001',
        date: '2026-01-16T09:00:00Z',
        description: 'Executive Plan - Monthly Subscription',
        amount: 9900,
        currency: 'USD',
        status: 'pending',
        invoiceUrl: null,
      },
      ...mockTransactions.slice(0, 3),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows a transaction in pending state, indicating payment is being processed.',
      },
    },
  },
}

export const WithFailedTransaction: Story = {
  args: {
    transactions: [
      {
        id: 'txn_failed_001',
        date: '2026-01-14T16:20:00Z',
        description: 'Pro Plan - Monthly Subscription',
        amount: 2900,
        currency: 'USD',
        status: 'failed',
        invoiceUrl: null,
      },
      ...mockTransactions.slice(0, 3),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays a failed transaction with appropriate status styling.',
      },
    },
  },
}

export const MixedStatuses: Story = {
  args: {
    transactions: [
      {
        id: 'txn_success_001',
        date: '2026-01-16T10:00:00Z',
        description: 'Pro Plan - Monthly Subscription',
        amount: 2900,
        currency: 'USD',
        status: 'succeeded',
        invoiceUrl: 'https://pay.lemonsqueezy.com/invoice/125',
      },
      {
        id: 'txn_pending_002',
        date: '2026-01-15T14:30:00Z',
        description: 'Credit Pack - 100 Credits',
        amount: 990,
        currency: 'USD',
        status: 'pending',
        invoiceUrl: null,
      },
      {
        id: 'txn_failed_002',
        date: '2026-01-14T08:15:00Z',
        description: 'Executive Plan Upgrade',
        amount: 7000,
        currency: 'USD',
        status: 'failed',
        invoiceUrl: null,
      },
      {
        id: 'txn_success_002',
        date: '2026-01-10T11:45:00Z',
        description: 'Pro Plan - Monthly Subscription',
        amount: 2900,
        currency: 'USD',
        status: 'succeeded',
        invoiceUrl: 'https://pay.lemonsqueezy.com/invoice/124',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Real-world scenario with a mix of succeeded, pending, and failed transactions.',
      },
    },
  },
}

export const WithoutInvoices: Story = {
  args: {
    transactions: [
      {
        id: 'txn_no_invoice_001',
        date: '2026-01-15T10:30:00Z',
        description: 'Starter Plan - Free',
        amount: 0,
        currency: 'USD',
        status: 'succeeded',
        invoiceUrl: null,
      },
      {
        id: 'txn_no_invoice_002',
        date: '2026-01-01T00:00:00Z',
        description: 'Promotional Credit Grant',
        amount: 0,
        currency: 'USD',
        status: 'succeeded',
        invoiceUrl: null,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Transactions without downloadable invoices show a dash instead of download button.',
      },
    },
  },
}

export const SingleTransaction: Story = {
  args: {
    transactions: [mockTransactions[0]],
  },
  parameters: {
    docs: {
      description: {
        story: 'Table with just one transaction record.',
      },
    },
  },
}

export const EmptyState: Story = {
  args: {
    transactions: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state shown when user has no transaction history.',
      },
    },
  },
}

export const LargeAmounts: Story = {
  args: {
    transactions: [
      {
        id: 'txn_enterprise_001',
        date: '2026-01-15T10:30:00Z',
        description: 'Enterprise Plan - Annual Subscription',
        amount: 119900,
        currency: 'USD',
        status: 'succeeded',
        invoiceUrl: 'https://pay.lemonsqueezy.com/invoice/130',
      },
      {
        id: 'txn_enterprise_002',
        date: '2025-12-01T10:30:00Z',
        description: 'Enterprise Credit Pack - 10,000 Credits',
        amount: 49900,
        currency: 'USD',
        status: 'succeeded',
        invoiceUrl: 'https://pay.lemonsqueezy.com/invoice/129',
      },
      {
        id: 'txn_enterprise_003',
        date: '2025-11-15T10:30:00Z',
        description: 'Enterprise Onboarding Fee',
        amount: 99900,
        currency: 'USD',
        status: 'succeeded',
        invoiceUrl: 'https://pay.lemonsqueezy.com/invoice/128',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays large enterprise-level transaction amounts with proper currency formatting.',
      },
    },
  },
}

export const EuroCurrency: Story = {
  args: {
    transactions: [
      {
        id: 'txn_eur_001',
        date: '2026-01-15T10:30:00Z',
        description: 'Pro Plan - Monthly Subscription',
        amount: 2700,
        currency: 'EUR',
        status: 'succeeded',
        invoiceUrl: 'https://pay.lemonsqueezy.com/invoice/140',
      },
      {
        id: 'txn_eur_002',
        date: '2025-12-15T10:30:00Z',
        description: 'Pro Plan - Monthly Subscription',
        amount: 2700,
        currency: 'EUR',
        status: 'succeeded',
        invoiceUrl: 'https://pay.lemonsqueezy.com/invoice/139',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Transactions in Euro currency to demonstrate multi-currency support.',
      },
    },
  },
}
