import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import ImageCarousel from '@/components/auth/ImageCarousel'

const meta: Meta<typeof ImageCarousel> = {
  title: 'Auth/ImageCarousel',
  component: ImageCarousel,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    interval: {
      control: { type: 'number', min: 1000, max: 10000, step: 500 },
      description: 'Time in milliseconds between image transitions',
    },
    images: {
      control: 'object',
      description: 'Array of image URLs to display in the carousel',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[600px] h-[400px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

const sampleImages = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop',
]

const calendarImages = [
  'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1435527173128-983b87201f4d?w=800&h=600&fit=crop',
]

const productivityImages = [
  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
]

export const Default: Story = {
  args: {
    images: sampleImages,
    interval: 5000,
  },
}

export const FastTransition: Story = {
  args: {
    images: sampleImages,
    interval: 2000,
  },
}

export const SlowTransition: Story = {
  args: {
    images: sampleImages,
    interval: 8000,
  },
}

export const CalendarTheme: Story = {
  args: {
    images: calendarImages,
    interval: 4000,
  },
}

export const ProductivityTheme: Story = {
  args: {
    images: productivityImages,
    interval: 4000,
  },
}

export const TwoImages: Story = {
  args: {
    images: sampleImages.slice(0, 2),
    interval: 3000,
  },
}

export const SingleImage: Story = {
  args: {
    images: [sampleImages[0]],
    interval: 5000,
  },
}

export const ManyImages: Story = {
  args: {
    images: [...sampleImages, ...calendarImages],
    interval: 3000,
  },
}

export const SmallContainer: Story = {
  args: {
    images: sampleImages,
    interval: 4000,
  },
  decorators: [
    (Story) => (
      <div className="w-[300px] h-[200px]">
        <Story />
      </div>
    ),
  ],
}

export const LargeContainer: Story = {
  args: {
    images: sampleImages,
    interval: 5000,
  },
  decorators: [
    (Story) => (
      <div className="w-[900px] h-[600px]">
        <Story />
      </div>
    ),
  ],
}

export const SquareAspectRatio: Story = {
  args: {
    images: sampleImages,
    interval: 4000,
  },
  decorators: [
    (Story) => (
      <div className="w-[400px] h-[400px]">
        <Story />
      </div>
    ),
  ],
}

export const PortraitAspectRatio: Story = {
  args: {
    images: sampleImages,
    interval: 4000,
  },
  decorators: [
    (Story) => (
      <div className="w-[300px] h-[500px]">
        <Story />
      </div>
    ),
  ],
}

export const InDarkContainer: Story = {
  args: {
    images: sampleImages,
    interval: 4000,
  },
  decorators: [
    (Story) => (
      <div className="dark w-[600px] h-[400px] bg-secondary p-4 rounded-2xl">
        <Story />
      </div>
    ),
  ],
}

export const WithRoundedCorners: Story = {
  args: {
    images: sampleImages,
    interval: 4000,
  },
  decorators: [
    (Story) => (
      <div className="w-[600px] h-[400px] rounded-3xl overflow-hidden shadow-2xl">
        <Story />
      </div>
    ),
  ],
}

export const FullScreen: Story = {
  args: {
    images: sampleImages,
    interval: 5000,
  },
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="w-screen h-screen">
        <Story />
      </div>
    ),
  ],
}

export const Mobile: Story = {
  args: {
    images: sampleImages,
    interval: 4000,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="w-full h-[300px]">
        <Story />
      </div>
    ),
  ],
}
