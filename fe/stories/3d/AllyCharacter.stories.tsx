import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import dynamic from 'next/dynamic'

const AllyCharacter = dynamic(() => import('@/components/3d/ally-character').then((mod) => mod.AllyCharacter), {
  ssr: false,
})

const meta: Meta<typeof AllyCharacter> = {
  title: '3D/AllyCharacter',
  component: AllyCharacter,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '3D animated AI assistant character using Three.js. Supports various animation states for voice/chat interactions.',
      },
    },
  },
  argTypes: {
    animationState: {
      control: 'select',
      options: ['idle', 'talking', 'listening', 'thinking', 'happy', 'sad'],
      description: 'Current animation state of the character',
    },
    autoRotate: {
      control: 'boolean',
      description: 'Enable automatic rotation',
    },
    autoRotateSpeed: {
      control: { type: 'range', min: 0, max: 10, step: 0.5 },
      description: 'Speed of auto-rotation',
    },
    enableControls: {
      control: 'boolean',
      description: 'Enable orbit controls for user interaction',
    },
    scale: {
      control: { type: 'range', min: 0.5, max: 2, step: 0.1 },
      description: 'Scale of the character',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px', height: '400px', background: '#09090b' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Idle: Story = {
  args: {
    animationState: 'idle',
    autoRotate: true,
    autoRotateSpeed: 2,
    enableControls: true,
    scale: 1,
  },
}

export const Talking: Story = {
  args: {
    animationState: 'talking',
    autoRotate: false,
    enableControls: true,
    scale: 1,
    mouthOpenness: 0.5,
  },
}

export const Listening: Story = {
  args: {
    animationState: 'listening',
    autoRotate: false,
    enableControls: true,
    scale: 1,
  },
}

export const Thinking: Story = {
  args: {
    animationState: 'thinking',
    autoRotate: true,
    autoRotateSpeed: 1,
    enableControls: true,
    scale: 1,
  },
}

export const Happy: Story = {
  args: {
    animationState: 'happy',
    autoRotate: true,
    autoRotateSpeed: 3,
    enableControls: true,
    scale: 1,
  },
}

export const Sad: Story = {
  args: {
    animationState: 'sad',
    autoRotate: false,
    enableControls: true,
    scale: 1,
  },
}

export const LargeScale: Story = {
  args: {
    animationState: 'idle',
    autoRotate: true,
    scale: 1.5,
    enableControls: true,
  },
}

export const SmallScale: Story = {
  args: {
    animationState: 'idle',
    autoRotate: true,
    scale: 0.7,
    enableControls: true,
  },
}

export const AllStates: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      {(['idle', 'talking', 'listening', 'thinking', 'happy', 'sad'] as const).map((state) => (
        <div key={state} className="flex flex-col items-center">
          <div style={{ width: '150px', height: '150px', background: '#09090b', borderRadius: '8px' }}>
            <AllyCharacter animationState={state} autoRotate scale={0.8} />
          </div>
          <span className="mt-2 text-sm text-zinc-400 capitalize">{state}</span>
        </div>
      ))}
    </div>
  ),
  decorators: [
    (Story) => (
      <div style={{ padding: '20px', background: '#18181b' }}>
        <Story />
      </div>
    ),
  ],
}
