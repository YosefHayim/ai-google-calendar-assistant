import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import dynamic from 'next/dynamic'

const RotatingEarth = dynamic(() => import('@/components/3d/wireframe-dotted-globe'), {
  ssr: false,
})

const meta: Meta<typeof RotatingEarth> = {
  title: '3D/RotatingEarth',
  component: RotatingEarth,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'D3-based rotating wireframe globe visualization. Used in marketing pages to showcase global reach.',
      },
    },
  },
  argTypes: {
    width: {
      control: { type: 'range', min: 200, max: 1000, step: 50 },
      description: 'Width of the canvas',
    },
    height: {
      control: { type: 'range', min: 200, max: 800, step: 50 },
      description: 'Height of the canvas',
    },
    hideControls: {
      control: 'boolean',
      description: 'Hide rotation controls',
    },
  },
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center p-8 bg-secondary">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    width: 400,
    height: 400,
    hideControls: false,
  },
}

export const Large: Story = {
  args: {
    width: 600,
    height: 600,
    hideControls: false,
  },
}

export const Small: Story = {
  args: {
    width: 250,
    height: 250,
    hideControls: true,
  },
}

export const WithoutControls: Story = {
  args: {
    width: 400,
    height: 400,
    hideControls: true,
  },
}

export const Wide: Story = {
  args: {
    width: 600,
    height: 300,
    hideControls: false,
  },
}

export const InHeroSection: Story = {
  decorators: [
    (Story) => (
      <div className="relative w-full max-w-4xl h-[500px] bg-gradient-to-b from-zinc-950 to-purple-950/20 rounded-xl overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <Story />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-8">
          <h1 className="text-4xl font-bold text-white mb-4">Your AI Calendar Assistant</h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Manage your schedule naturally, from anywhere in the world.
          </p>
        </div>
      </div>
    ),
  ],
  args: {
    width: 800,
    height: 600,
    hideControls: true,
  },
}
