import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta = {
  title: 'Dashboard/Chat/AgentProfileSelector',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Dropdown selector for choosing AI agent profiles. Shows different tiers (Free, Pro, Enterprise) and providers (OpenAI, Google, Anthropic).',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const mockProfiles = [
  {
    id: 'ally-lite',
    displayName: 'Ally Lite',
    tagline: 'Quick responses for simple tasks',
    tier: 'free' as const,
    provider: 'openai',
  },
  {
    id: 'ally-pro',
    displayName: 'Ally Pro',
    tagline: 'Advanced reasoning with voice support',
    tier: 'pro' as const,
    provider: 'openai',
  },
  {
    id: 'ally-executive',
    displayName: 'Ally Executive',
    tagline: 'Premium enterprise-grade assistant',
    tier: 'enterprise' as const,
    provider: 'openai',
  },
  {
    id: 'ally-gemini',
    displayName: 'Ally Gemini',
    tagline: 'Powered by Google AI',
    tier: 'pro' as const,
    provider: 'google',
  },
  {
    id: 'ally-claude',
    displayName: 'Ally Claude',
    tagline: 'Thoughtful and nuanced responses',
    tier: 'pro' as const,
    provider: 'anthropic',
  },
]

const getTierColor = (tier: string) => {
  switch (tier) {
    case 'free':
      return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
    case 'pro':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
    case 'enterprise':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
    default:
      return 'bg-zinc-100 text-zinc-700'
  }
}

const getProviderIcon = (provider: string) => {
  switch (provider) {
    case 'openai':
      return '◯'
    case 'google':
      return 'G'
    case 'anthropic':
      return 'A'
    default:
      return '?'
  }
}

const ProfileItem = ({ profile, isSelected }: { profile: typeof mockProfiles[0]; isSelected?: boolean }) => (
  <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-primary/10 border border-primary' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
    <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-sm font-bold">
      {getProviderIcon(profile.provider)}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{profile.displayName}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded ${getTierColor(profile.tier)}`}>
          {profile.tier}
        </span>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{profile.tagline}</p>
    </div>
  </div>
)

export const Default: Story = {
  render: () => (
    <div className="w-[300px] p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg">
      <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 px-3 py-2">Select AI Assistant</div>
      <div className="space-y-1">
        {mockProfiles.map((profile) => (
          <ProfileItem key={profile.id} profile={profile} isSelected={profile.id === 'ally-pro'} />
        ))}
      </div>
    </div>
  ),
}

export const FreeTierSelected: Story = {
  render: () => (
    <div className="w-[300px] p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg">
      <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 px-3 py-2">Select AI Assistant</div>
      <div className="space-y-1">
        {mockProfiles.map((profile) => (
          <ProfileItem key={profile.id} profile={profile} isSelected={profile.id === 'ally-lite'} />
        ))}
      </div>
    </div>
  ),
}

export const EnterpriseTierSelected: Story = {
  render: () => (
    <div className="w-[300px] p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg">
      <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 px-3 py-2">Select AI Assistant</div>
      <div className="space-y-1">
        {mockProfiles.map((profile) => (
          <ProfileItem key={profile.id} profile={profile} isSelected={profile.id === 'ally-executive'} />
        ))}
      </div>
    </div>
  ),
}

export const CollapsedTrigger: Story = {
  render: () => (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
      <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-600 dark:text-purple-400">
        ◯
      </div>
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Ally Pro</span>
      <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  ),
}

export const InHeader: Story = {
  render: () => (
    <div className="flex items-center justify-between w-[600px] p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-primary text-sm font-bold">A</span>
        </div>
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">Ask Ally</span>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg cursor-pointer">
        <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-600 dark:text-purple-400">
          ◯
        </div>
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Ally Pro</span>
        <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  ),
}

export const DarkMode: Story = {
  render: () => (
    <div className="w-[300px] p-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg">
      <div className="text-xs font-medium text-zinc-400 px-3 py-2">Select AI Assistant</div>
      <div className="space-y-1">
        {mockProfiles.map((profile) => (
          <ProfileItem key={profile.id} profile={profile} isSelected={profile.id === 'ally-pro'} />
        ))}
      </div>
    </div>
  ),
  parameters: {
    backgrounds: { default: 'dark' },
  },
}
