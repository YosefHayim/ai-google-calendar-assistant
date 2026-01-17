import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { PaymentMethodCard } from '@/components/dashboard/billing/PaymentMethodCard'
import { fn } from 'storybook/test'
import type { PaymentMethod } from '@/services/payment.service'

const meta: Meta<typeof PaymentMethodCard> = {
  title: 'Dashboard/Billing/PaymentMethodCard',
  component: PaymentMethodCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          "A visual credit card display showing the user's saved payment method with brand icon, masked card number, expiry date, and update action.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[400px] p-4">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    paymentMethod: {
      description: 'Payment method data or null if none saved',
    },
    onUpdate: {
      action: 'update-clicked',
      description: 'Callback when update/add button is clicked',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const visaCard: PaymentMethod = {
  id: 'pm_visa_001',
  brand: 'visa',
  last4: '4242',
  expiryMonth: 12,
  expiryYear: 2027,
  isDefault: true,
}

const mastercardCard: PaymentMethod = {
  id: 'pm_mc_001',
  brand: 'mastercard',
  last4: '8888',
  expiryMonth: 6,
  expiryYear: 2028,
  isDefault: true,
}

const amexCard: PaymentMethod = {
  id: 'pm_amex_001',
  brand: 'amex',
  last4: '0005',
  expiryMonth: 3,
  expiryYear: 2026,
  isDefault: true,
}

const discoverCard: PaymentMethod = {
  id: 'pm_discover_001',
  brand: 'discover',
  last4: '9424',
  expiryMonth: 9,
  expiryYear: 2029,
  isDefault: true,
}

const unknownCard: PaymentMethod = {
  id: 'pm_unknown_001',
  brand: 'unknown',
  last4: '1234',
  expiryMonth: 1,
  expiryYear: 2030,
  isDefault: true,
}

export const Visa: Story = {
  args: {
    paymentMethod: visaCard,
    onUpdate: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Visa card with distinctive blue branding and card visualization.',
      },
    },
  },
}

export const Mastercard: Story = {
  args: {
    paymentMethod: mastercardCard,
    onUpdate: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Mastercard with overlapping red/orange circles branding.',
      },
    },
  },
}

export const Amex: Story = {
  args: {
    paymentMethod: amexCard,
    onUpdate: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'American Express card with blue branding.',
      },
    },
  },
}

export const Discover: Story = {
  args: {
    paymentMethod: discoverCard,
    onUpdate: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Discover card with orange accent.',
      },
    },
  },
}

export const UnknownBrand: Story = {
  args: {
    paymentMethod: unknownCard,
    onUpdate: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Fallback for unrecognized card brands shows generic card icon.',
      },
    },
  },
}

export const NoPaymentMethod: Story = {
  args: {
    paymentMethod: null,
    onUpdate: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state when user has no payment method on file, with "Add Card" action.',
      },
    },
  },
}

export const NoUpdateCallback: Story = {
  args: {
    paymentMethod: visaCard,
    onUpdate: undefined,
  },
  parameters: {
    docs: {
      description: {
        story: 'Card display without update button when callback is not provided (read-only mode).',
      },
    },
  },
}

export const ExpiringSoon: Story = {
  args: {
    paymentMethod: {
      id: 'pm_expiring_001',
      brand: 'visa',
      last4: '4242',
      expiryMonth: 2,
      expiryYear: 2026,
      isDefault: true,
    },
    onUpdate: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Card expiring in the near future - users should update their payment method.',
      },
    },
  },
}

export const NonDefaultCard: Story = {
  args: {
    paymentMethod: {
      id: 'pm_nondefault_001',
      brand: 'mastercard',
      last4: '5555',
      expiryMonth: 11,
      expiryYear: 2028,
      isDefault: false,
    },
    onUpdate: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Card that is not set as the default payment method (no "Default" badge).',
      },
    },
  },
}

export const AllCardBrands: Story = {
  render: () => (
    <div className="space-y-4">
      <PaymentMethodCard paymentMethod={visaCard} onUpdate={fn()} />
      <PaymentMethodCard paymentMethod={mastercardCard} onUpdate={fn()} />
      <PaymentMethodCard paymentMethod={amexCard} onUpdate={fn()} />
      <PaymentMethodCard paymentMethod={discoverCard} onUpdate={fn()} />
      <PaymentMethodCard paymentMethod={unknownCard} onUpdate={fn()} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Showcase of all supported card brand icons.',
      },
    },
  },
}
