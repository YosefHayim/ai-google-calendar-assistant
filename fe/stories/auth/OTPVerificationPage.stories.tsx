import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import OTPVerificationPage from '@/components/auth/OTPVerificationPage'

const meta: Meta<typeof OTPVerificationPage> = {
  title: 'Auth/OTPVerificationPage',
  component: OTPVerificationPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/otp-verification',
        query: {},
      },
    },
  },
  decorators: [
    (Story) => {
      // Mock localStorage for phone number display
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('temp_reg_phone', '+1555000****')
      }
      return (
        <div className="min-h-screen">
          <Story />
        </div>
      )
    },
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  decorators: [
    (Story) => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('temp_reg_phone', '+15550001234')
      }
      return (
        <div className="min-h-screen">
          <Story />
        </div>
      )
    },
  ],
}

export const WithUSPhoneNumber: Story = {
  decorators: [
    (Story) => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('temp_reg_phone', '+15559876543')
      }
      return (
        <div className="min-h-screen">
          <Story />
        </div>
      )
    },
  ],
}

export const WithUKPhoneNumber: Story = {
  decorators: [
    (Story) => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('temp_reg_phone', '+447700900123')
      }
      return (
        <div className="min-h-screen">
          <Story />
        </div>
      )
    },
  ],
}

export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('temp_reg_phone', '+15550001234')
      }
      return (
        <div className="dark min-h-screen">
          <Story />
        </div>
      )
    },
  ],
}

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  decorators: [
    (Story) => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('temp_reg_phone', '+15550001234')
      }
      return (
        <div className="min-h-screen">
          <Story />
        </div>
      )
    },
  ],
}

export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
  decorators: [
    (Story) => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('temp_reg_phone', '+15550001234')
      }
      return (
        <div className="min-h-screen">
          <Story />
        </div>
      )
    },
  ],
}
