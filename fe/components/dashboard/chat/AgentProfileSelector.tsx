'use client'

import { Check, ChevronDown, Sparkles, Zap, Crown, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  useAgentProfiles,
  useSelectedAgentProfile,
  useUpdateSelectedAgentProfile,
  type AgentProfile,
  type AgentTier,
} from '@/hooks/queries/agent-profiles'

const tierConfig: Record<AgentTier, { label: string; color: string; icon: typeof Sparkles }> = {
  free: { label: 'Free', color: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400', icon: Bot },
  pro: { label: 'Pro', color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400', icon: Sparkles },
  enterprise: { label: 'Enterprise', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', icon: Crown },
}

const providerIcons: Record<string, string> = {
  openai: '○',
  google: '◇',
  anthropic: '△',
}

function TierBadge({ tier }: { tier: AgentTier }) {
  const config = tierConfig[tier]
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium', config.color)}>
      {config.label}
    </span>
  )
}

function ProfileItem({
  profile,
  isSelected,
  onSelect,
}: {
  profile: AgentProfile
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <DropdownMenuItem
      className={cn('flex items-center gap-3 cursor-pointer py-2.5', isSelected && 'bg-accent')}
      onSelect={onSelect}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm font-medium">
        {providerIcons[profile.modelConfig.provider] || '●'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{profile.displayName}</span>
          <TierBadge tier={profile.tier} />
          {profile.modelConfig.supportsRealtime && (
            <Zap className="h-3 w-3 text-amber-500" />
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{profile.tagline}</p>
      </div>
      {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
    </DropdownMenuItem>
  )
}

export function AgentProfileSelector() {
  const { profiles, isLoading: isLoadingProfiles } = useAgentProfiles()
  const { profile: selectedProfile, profileId, isLoading: isLoadingSelected } = useSelectedAgentProfile()
  const { updateProfile, isUpdating } = useUpdateSelectedAgentProfile()

  const isLoading = isLoadingProfiles || isLoadingSelected

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5">
        <div className="h-6 w-6 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-4 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>
    )
  }

  const currentProfile = selectedProfile || profiles[0]
  if (!currentProfile) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isUpdating}>
        <Button variant="ghost" size="sm" className="gap-2 h-8 px-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs">
            {providerIcons[currentProfile.modelConfig.provider] || '●'}
          </div>
          <span className="text-sm font-medium">{currentProfile.displayName}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Select AI Assistant
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {profiles.map((profile) => (
          <ProfileItem
            key={profile.id}
            profile={profile}
            isSelected={profile.id === profileId}
            onSelect={() => updateProfile(profile.id)}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
