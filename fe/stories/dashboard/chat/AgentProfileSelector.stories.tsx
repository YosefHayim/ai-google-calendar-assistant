import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AgentProfileSelector } from '@/components/dashboard/chat/AgentProfileSelector'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse, delay } from 'msw'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
    },
  },
})

const meta: Meta<typeof AgentProfileSelector> = {
  title: 'Dashboard/Chat/AgentProfileSelector',
  component: AgentProfileSelector,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="p-8 bg-zinc-50 dark:bg-zinc-950 rounded-xl">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

const mockProfiles = [
  {
    id: 'ally-lite',
    displayName: 'Ally Lite',
    tagline: 'Quick responses for simple tasks',
    tier: 'free' as const,
    modelConfig: {
      provider: 'openai',
      model: 'gpt-4-1-nano',
      supportsRealtime: false,
    },
  },
  {
    id: 'ally-pro',
    displayName: 'Ally Pro',
    tagline: 'Advanced reasoning with voice support',
    tier: 'pro' as const,
    modelConfig: {
      provider: 'openai',
      model: 'gpt-5-mini',
      supportsRealtime: true,
    },
  },
  {
    id: 'ally-flash',
    displayName: 'Ally Flash',
    tagline: 'Lightning-fast responses',
    tier: 'pro' as const,
    modelConfig: {
      provider: 'openai',
      model: 'gpt-4-1-mini',
      supportsRealtime: true,
    },
  },
  {
    id: 'ally-executive',
    displayName: 'Ally Executive',
    tagline: 'Premium enterprise-grade assistant',
    tier: 'enterprise' as const,
    modelConfig: {
      provider: 'openai',
      model: 'gpt-5',
      supportsRealtime: true,
    },
  },
  {
    id: 'ally-gemini',
    displayName: 'Ally Gemini',
    tagline: 'Powered by Google AI',
    tier: 'pro' as const,
    modelConfig: {
      provider: 'google',
      model: 'gemini-2.0-flash',
      supportsRealtime: false,
    },
  },
  {
    id: 'ally-claude',
    displayName: 'Ally Claude',
    tagline: 'Thoughtful and nuanced responses',
    tier: 'pro' as const,
    modelConfig: {
      provider: 'anthropic',
      model: 'claude-sonnet-4',
      supportsRealtime: false,
    },
  },
]

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/agent-profiles', () => {
          return HttpResponse.json({
            status: 'success',
            data: mockProfiles,
          })
        }),
        http.get('*/api/users/preferences', () => {
          return HttpResponse.json({
            status: 'success',
            data: { selectedAgentProfileId: 'ally-pro' },
          })
        }),
      ],
    },
  },
}

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/agent-profiles', async () => {
          await delay('infinite')
          return HttpResponse.json({ status: 'success', data: [] })
        }),
        http.get('*/api/users/preferences', async () => {
          await delay('infinite')
          return HttpResponse.json({ status: 'success', data: {} })
        }),
      ],
    },
  },
}

export const FreeTierSelected: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/agent-profiles', () => {
          return HttpResponse.json({
            status: 'success',
            data: mockProfiles,
          })
        }),
        http.get('*/api/users/preferences', () => {
          return HttpResponse.json({
            status: 'success',
            data: { selectedAgentProfileId: 'ally-lite' },
          })
        }),
      ],
    },
  },
}

export const EnterpriseTierSelected: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/agent-profiles', () => {
          return HttpResponse.json({
            status: 'success',
            data: mockProfiles,
          })
        }),
        http.get('*/api/users/preferences', () => {
          return HttpResponse.json({
            status: 'success',
            data: { selectedAgentProfileId: 'ally-executive' },
          })
        }),
      ],
    },
  },
}

export const GoogleModelSelected: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/agent-profiles', () => {
          return HttpResponse.json({
            status: 'success',
            data: mockProfiles,
          })
        }),
        http.get('*/api/users/preferences', () => {
          return HttpResponse.json({
            status: 'success',
            data: { selectedAgentProfileId: 'ally-gemini' },
          })
        }),
      ],
    },
  },
}

export const AnthropicModelSelected: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/agent-profiles', () => {
          return HttpResponse.json({
            status: 'success',
            data: mockProfiles,
          })
        }),
        http.get('*/api/users/preferences', () => {
          return HttpResponse.json({
            status: 'success',
            data: { selectedAgentProfileId: 'ally-claude' },
          })
        }),
      ],
    },
  },
}

export const InHeader: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/agent-profiles', () => {
          return HttpResponse.json({
            status: 'success',
            data: mockProfiles,
          })
        }),
        http.get('*/api/users/preferences', () => {
          return HttpResponse.json({
            status: 'success',
            data: { selectedAgentProfileId: 'ally-pro' },
          })
        }),
      ],
    },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="flex items-center justify-between w-[600px] p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary text-sm font-bold">A</span>
            </div>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">Ask Ally</span>
          </div>
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
}
