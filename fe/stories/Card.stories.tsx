import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content with some example text.</p>
      </CardContent>
    </Card>
  ),
}

export const WithFooter: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create Project</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Name of your project" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  ),
}

export const LoginForm: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>Enter your email and password to sign in</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Sign in</Button>
      </CardFooter>
    </Card>
  ),
}

export const PricingCard: Story = {
  render: () => (
    <Card className="w-[300px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Pro Plan</CardTitle>
          <Badge>Popular</Badge>
        </div>
        <CardDescription>Perfect for growing teams</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          $4<span className="text-sm font-normal text-muted-foreground">/month</span>
        </div>
        <ul className="mt-4 space-y-2 text-sm">
          <li className="flex items-center">
            <span className="mr-2 text-green-600">✓</span>
            500 AI interactions/month
          </li>
          <li className="flex items-center">
            <span className="mr-2 text-green-600">✓</span>
            Voice & Telegram integration
          </li>
          <li className="flex items-center">
            <span className="mr-2 text-green-600">✓</span>
            Priority support
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Get Started</Button>
      </CardFooter>
    </Card>
  ),
}

export const StatCard: Story = {
  render: () => (
    <Card className="w-[200px]">
      <CardHeader className="pb-2">
        <CardDescription>Total Revenue</CardDescription>
        <CardTitle className="text-3xl">$45,231</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-green-600">+20.1% from last month</p>
      </CardContent>
    </Card>
  ),
}

export const CardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Users</CardDescription>
          <CardTitle className="text-2xl">2,350</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-green-600">+180 this week</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Active Sessions</CardDescription>
          <CardTitle className="text-2xl">573</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-green-600">+201 since last hour</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Bounce Rate</CardDescription>
          <CardTitle className="text-2xl">12.3%</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-destructive">+4.1% from last week</p>
        </CardContent>
      </Card>
    </div>
  ),
}

export const EmptyState: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardContent className="flex flex-col items-center justify-center py-10">
        <div className="rounded-full bg-secondary dark:bg-secondary p-4 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <CardTitle className="text-lg mb-2">No events found</CardTitle>
        <CardDescription className="text-center mb-4">
          Get started by creating your first calendar event.
        </CardDescription>
        <Button>Create Event</Button>
      </CardContent>
    </Card>
  ),
}
