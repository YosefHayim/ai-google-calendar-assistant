import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url', 'file'],
    },
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')
    await userEvent.type(input, 'Hello World')
    await expect(input).toHaveValue('Hello World')
  },
}

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter email...',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')
    await userEvent.type(input, 'user@example.com')
    await expect(input).toHaveValue('user@example.com')
  },
}

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password...',
  },
}

export const SearchInput: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...',
  },
}

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')
    await expect(input).toBeDisabled()
  },
}

export const WithValue: Story = {
  args: {
    defaultValue: 'Pre-filled value',
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="Enter your email" />
    </div>
  ),
}

export const WithLabelAndHelper: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email-helper">Email</Label>
      <Input type="email" id="email-helper" placeholder="Enter your email" />
      <p className="text-sm text-zinc-500">We&apos;ll never share your email.</p>
    </div>
  ),
}

export const FileInput: Story = {
  args: {
    type: 'file',
  },
}

export const NumberInput: Story = {
  args: {
    type: 'number',
    placeholder: 'Enter a number',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('spinbutton')
    await userEvent.type(input, '42')
    await expect(input).toHaveValue(42)
  },
}

export const WithIconPrefix: Story = {
  render: () => (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <Input type="search" placeholder="Search..." className="pl-10" />
    </div>
  ),
}

export const InputStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-full max-w-sm">
      <Input placeholder="Default state" />
      <Input placeholder="With value" defaultValue="Some text" />
      <Input placeholder="Disabled" disabled />
      <Input placeholder="Read only" readOnly defaultValue="Read only value" />
    </div>
  ),
}
