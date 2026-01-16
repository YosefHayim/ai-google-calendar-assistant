import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import PhoneRegistrationPage from '@/components/auth/PhoneRegistrationPage'

const meta: Meta<typeof PhoneRegistrationPage> = {
  title: 'Auth/PhoneRegistrationPage',
  component: PhoneRegistrationPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/phone-registration',
        query: {},
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="dark min-h-screen">
        <Story />
      </div>
    ),
  ],
}

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}

export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
}

export const MobileDarkMode: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="dark min-h-screen">
        <Story />
      </div>
    ),
  ],
}
