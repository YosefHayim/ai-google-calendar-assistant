import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { InlineLoader, ButtonLoader, FullPageLoader } from '@/components/ui/inline-loader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const meta: Meta<typeof InlineLoader> = {
  title: 'UI/Loaders',
  component: InlineLoader,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
    },
    label: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof InlineLoader>

export const Default: Story = {
  args: {
    size: 'md',
  },
}

export const WithLabel: Story = {
  args: {
    size: 'md',
    label: 'Loading...',
  },
}

export const ExtraSmall: Story = {
  args: {
    size: 'xs',
    label: 'Syncing',
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
    label: 'Processing',
  },
}

export const Medium: Story = {
  args: {
    size: 'md',
    label: 'Loading data',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    label: 'Please wait',
  },
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <InlineLoader size="xs" label="Extra Small" />
      <InlineLoader size="sm" label="Small" />
      <InlineLoader size="md" label="Medium" />
      <InlineLoader size="lg" label="Large" />
    </div>
  ),
}

export const ButtonLoaderExample: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button disabled>
        <ButtonLoader className="mr-2" />
        Loading
      </Button>
      <Button variant="outline" disabled>
        <ButtonLoader className="mr-2" />
        Processing
      </Button>
      <Button variant="secondary" disabled>
        <ButtonLoader className="mr-2" />
        Saving
      </Button>
    </div>
  ),
}

export const FullPageLoaderExample: Story = {
  render: () => (
    <div className="w-[400px] h-[300px] border rounded-lg">
      <FullPageLoader label="Loading your calendar..." />
    </div>
  ),
}

export const InCardContext: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Events</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center py-8">
        <InlineLoader size="md" label="Fetching events..." />
      </CardContent>
    </Card>
  ),
}

export const LoadingStates: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Inline Loading</h3>
        <div className="flex items-center gap-2 text-sm">
          <InlineLoader size="sm" />
          <span>Syncing calendar...</span>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Button Loading</h3>
        <div className="flex gap-2">
          <Button disabled>
            <ButtonLoader className="mr-2" />
            Submit
          </Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Section Loading</h3>
        <div className="border rounded-lg p-4">
          <FullPageLoader label="Loading content..." />
        </div>
      </div>
    </div>
  ),
}
