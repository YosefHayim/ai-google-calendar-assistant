import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const meta: Meta = {
  title: 'Forms/Form Elements',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj

export const BasicForm: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Contact Form</CardTitle>
        <CardDescription>Fill in your details below</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="John Doe" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="john@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <textarea
            id="message"
            placeholder="Your message..."
            className="flex min-h-[80px] w-full rounded-lg bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[0.01px] focus-visible:ring-primary/20"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Send Message</Button>
      </CardFooter>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const nameInput = canvas.getByLabelText('Name')
    await userEvent.type(nameInput, 'John Doe')
    await expect(nameInput).toHaveValue('John Doe')

    const emailInput = canvas.getByLabelText('Email')
    await userEvent.type(emailInput, 'john@example.com')
    await expect(emailInput).toHaveValue('john@example.com')

    const messageInput = canvas.getByLabelText('Message')
    await userEvent.type(messageInput, 'Hello, this is a test message.')
    await expect(messageInput).toHaveValue('Hello, this is a test message.')
  },
}

export const LoginForm: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login-email">Email</Label>
          <Input id="login-email" type="email" placeholder="m@example.com" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Password</Label>
            <Button variant="link" className="px-0 h-auto text-xs">
              Forgot password?
            </Button>
          </div>
          <Input id="login-password" type="password" />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button className="w-full">Sign in</Button>
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Button variant="link" className="px-0 h-auto">
            Sign up
          </Button>
        </p>
      </CardFooter>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const emailInput = canvas.getByLabelText('Email')
    await userEvent.type(emailInput, 'user@test.com')

    const passwordInput = canvas.getByLabelText('Password')
    await userEvent.type(passwordInput, 'password123')

    await expect(emailInput).toHaveValue('user@test.com')
    await expect(passwordInput).toHaveValue('password123')
  },
}

export const SignupForm: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Enter your details to get started</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first-name">First name</Label>
            <Input id="first-name" placeholder="John" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name">Last name</Label>
            <Input id="last-name" placeholder="Doe" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input id="signup-email" type="email" placeholder="john@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <Input id="signup-password" type="password" />
          <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input id="confirm-password" type="password" />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Create account</Button>
      </CardFooter>
    </Card>
  ),
}

export const SettingsForm: Story = {
  render: () => (
    <Card className="w-[500px]">
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input id="display-name" defaultValue="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" defaultValue="johndoe" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              placeholder="Tell us about yourself..."
              className="flex min-h-[100px] w-full rounded-lg bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:outline-none"
              defaultValue="Software developer passionate about building great products."
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Contact Information</h3>
          <div className="space-y-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input id="profile-email" type="email" defaultValue="john@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
  ),
}

export const InlineValidation: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Form Validation States</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="valid-input">Valid Input</Label>
          <Input
            id="valid-input"
            defaultValue="valid@email.com"
            className="border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500/20"
          />
          <p className="text-xs text-green-600">Email is available</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="error-input">Error Input</Label>
          <Input
            id="error-input"
            defaultValue="invalid-email"
            className="border-destructive focus-visible:border-destructive focus-visible:ring-red-500/20"
          />
          <p className="text-xs text-destructive">Please enter a valid email address</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="warning-input">Warning Input</Label>
          <Input
            id="warning-input"
            defaultValue="weak123"
            className="border-yellow-500 focus-visible:border-yellow-500 focus-visible:ring-yellow-500/20"
          />
          <p className="text-xs text-yellow-500">Password is weak, consider adding special characters</p>
        </div>
      </CardContent>
    </Card>
  ),
}
