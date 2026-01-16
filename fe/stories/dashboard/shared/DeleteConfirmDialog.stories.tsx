import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { DeleteConfirmDialog } from '@/components/dashboard/shared/sidebar-components/DeleteConfirmDialog'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

const meta: Meta<typeof DeleteConfirmDialog> = {
  title: 'Dashboard/Shared/DeleteConfirmDialog',
  component: DeleteConfirmDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    onConfirm: () => {},
    isLoading: false,
  },
}

export const Loading: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    onConfirm: () => {},
    isLoading: true,
  },
}

export const Interactive: Story = {
  render: function InteractiveDeleteDialog() {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleConfirm = () => {
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
        setIsOpen(false)
      }, 1500)
    }

    return (
      <div className="space-y-4">
        <Button variant="destructive" onClick={() => setIsOpen(true)}>
          Delete Conversation
        </Button>
        <DeleteConfirmDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onConfirm={handleConfirm}
          isLoading={isLoading}
        />
      </div>
    )
  },
}
