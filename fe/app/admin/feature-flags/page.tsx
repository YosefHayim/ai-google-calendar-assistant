'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Search, RefreshCw, Plus, Trash2, Flag, Pencil } from 'lucide-react'
import {
  useFeatureFlags,
  useCreateFeatureFlag,
  useToggleFeatureFlag,
  useDeleteFeatureFlag,
  useUpdateFeatureFlag,
} from '@/hooks/queries/feature-flags'
import type { FeatureFlag, CreateFeatureFlagInput } from '@/services/feature-flags.service'
import { toast } from 'sonner'

const TIER_OPTIONS = ['free', 'pro', 'enterprise']

export default function AdminFeatureFlagsPage() {
  const [search, setSearch] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null)

  const { data: flags, isLoading, refetch } = useFeatureFlags()
  const createMutation = useCreateFeatureFlag()
  const toggleMutation = useToggleFeatureFlag()
  const deleteMutation = useDeleteFeatureFlag()
  const updateMutation = useUpdateFeatureFlag()

  const filteredFlags = flags?.filter(
    (flag) =>
      flag.key.toLowerCase().includes(search.toLowerCase()) ||
      flag.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleToggle = async (flag: FeatureFlag) => {
    try {
      await toggleMutation.mutateAsync({ id: flag.id, enabled: !flag.enabled })
      toast.success(`Feature flag "${flag.name}" ${flag.enabled ? 'disabled' : 'enabled'}`)
    } catch {
      toast.error('Failed to toggle feature flag')
    }
  }

  const handleDelete = async () => {
    if (!selectedFlag) return
    try {
      await deleteMutation.mutateAsync(selectedFlag.id)
      toast.success(`Feature flag "${selectedFlag.name}" deleted`)
      setDeleteDialogOpen(false)
      setSelectedFlag(null)
    } catch {
      toast.error('Failed to delete feature flag')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Feature Flags</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage feature flags and rollout settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Flag
              </Button>
            </DialogTrigger>
            <CreateFeatureFlagDialog
              onSuccess={() => setCreateDialogOpen(false)}
              createMutation={createMutation}
            />
          </Dialog>
        </div>
      </div>

<Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="Search by key or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

<Card>
        {isLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-zinc-200 dark:border-zinc-700">
                <tr>
                  <th className="text-left p-4 font-medium text-zinc-500 dark:text-zinc-400">Flag</th>
                  <th className="text-left p-4 font-medium text-zinc-500 dark:text-zinc-400">Status</th>
                  <th className="text-left p-4 font-medium text-zinc-500 dark:text-zinc-400">Rollout</th>
                  <th className="text-left p-4 font-medium text-zinc-500 dark:text-zinc-400">Tiers</th>
                  <th className="text-right p-4 font-medium text-zinc-500 dark:text-zinc-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFlags?.map((flag) => (
                  <tr
                    key={flag.id}
                    className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                  >
                    <td className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                          <Flag className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-white">{flag.name}</p>
                          <p className="text-xs text-zinc-500 font-mono">{flag.key}</p>
                          {flag.description && (
                            <p className="text-xs text-zinc-400 mt-1 max-w-xs truncate">{flag.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={flag.enabled}
                          onCheckedChange={() => handleToggle(flag)}
                          disabled={toggleMutation.isPending}
                        />
                        <Badge
                          variant={flag.enabled ? 'default' : 'secondary'}
                          className={
                            flag.enabled
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                          }
                        >
                          {flag.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${flag.rolloutPercentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-zinc-600 dark:text-zinc-300">
                          {flag.rolloutPercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {flag.allowedTiers.length === 0 ? (
                          <Badge variant="outline" className="text-xs">
                            All tiers
                          </Badge>
                        ) : (
                          flag.allowedTiers.map((tier) => (
                            <Badge key={tier} variant="outline" className="text-xs capitalize">
                              {tier}
                            </Badge>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedFlag(flag)
                            setEditDialogOpen(true)
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => {
                            setSelectedFlag(flag)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!filteredFlags || filteredFlags.length === 0) && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-500">
                      {search ? 'No feature flags match your search' : 'No feature flags found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        {selectedFlag && (
          <EditFeatureFlagDialog
            flag={selectedFlag}
            onSuccess={() => {
              setEditDialogOpen(false)
              setSelectedFlag(null)
            }}
            updateMutation={updateMutation}
          />
        )}
      </Dialog>

<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Feature Flag</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedFlag?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function CreateFeatureFlagDialog({
  onSuccess,
  createMutation,
}: {
  onSuccess: () => void
  createMutation: ReturnType<typeof useCreateFeatureFlag>
}) {
  const [formData, setFormData] = useState<CreateFeatureFlagInput>({
    key: '',
    name: '',
    description: '',
    enabled: false,
    rolloutPercentage: 100,
    allowedTiers: [],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createMutation.mutateAsync(formData)
      toast.success('Feature flag created successfully')
      onSuccess()
      setFormData({
        key: '',
        name: '',
        description: '',
        enabled: false,
        rolloutPercentage: 100,
        allowedTiers: [],
      })
    } catch {
      toast.error('Failed to create feature flag')
    }
  }

  const handleTierToggle = (tier: string) => {
    setFormData((prev) => ({
      ...prev,
      allowedTiers: prev.allowedTiers?.includes(tier)
        ? prev.allowedTiers.filter((t) => t !== tier)
        : [...(prev.allowedTiers || []), tier],
    }))
  }

  return (
    <DialogContent className="sm:max-w-md">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Create Feature Flag</DialogTitle>
          <DialogDescription>Add a new feature flag to control feature access.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="key">Key</Label>
            <Input
              id="key"
              placeholder="feature_key"
              value={formData.key}
              onChange={(e) => setFormData((prev) => ({ ...prev, key: e.target.value }))}
              required
            />
            <p className="text-xs text-zinc-500">Unique identifier used in code (snake_case)</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Feature Name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Optional description"
              value={formData.description || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="enabled">Enabled by default</Label>
            <Switch
              id="enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, enabled: checked }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rollout">Rollout Percentage: {formData.rolloutPercentage}%</Label>
            <input
              id="rollout"
              type="range"
              min="0"
              max="100"
              value={formData.rolloutPercentage}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, rolloutPercentage: parseInt(e.target.value) }))
              }
              className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700"
            />
          </div>
          <div className="space-y-2">
            <Label>Allowed Tiers (empty = all tiers)</Label>
            <div className="flex flex-wrap gap-2">
              {TIER_OPTIONS.map((tier) => (
                <Badge
                  key={tier}
                  variant={formData.allowedTiers?.includes(tier) ? 'default' : 'outline'}
                  className="cursor-pointer capitalize"
                  onClick={() => handleTierToggle(tier)}
                >
                  {tier}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create Flag'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

function EditFeatureFlagDialog({
  flag,
  onSuccess,
  updateMutation,
}: {
  flag: FeatureFlag
  onSuccess: () => void
  updateMutation: ReturnType<typeof useUpdateFeatureFlag>
}) {
  const [formData, setFormData] = useState({
    name: flag.name,
    description: flag.description || '',
    rolloutPercentage: flag.rolloutPercentage,
    allowedTiers: flag.allowedTiers,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateMutation.mutateAsync({ id: flag.id, input: formData })
      toast.success('Feature flag updated successfully')
      onSuccess()
    } catch {
      toast.error('Failed to update feature flag')
    }
  }

  const handleTierToggle = (tier: string) => {
    setFormData((prev) => ({
      ...prev,
      allowedTiers: prev.allowedTiers.includes(tier)
        ? prev.allowedTiers.filter((t) => t !== tier)
        : [...prev.allowedTiers, tier],
    }))
  }

  return (
    <DialogContent className="sm:max-w-md">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Edit Feature Flag</DialogTitle>
          <DialogDescription>
            Update settings for <span className="font-mono text-primary">{flag.key}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Input
              id="edit-description"
              placeholder="Optional description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-rollout">Rollout Percentage: {formData.rolloutPercentage}%</Label>
            <input
              id="edit-rollout"
              type="range"
              min="0"
              max="100"
              value={formData.rolloutPercentage}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, rolloutPercentage: parseInt(e.target.value) }))
              }
              className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700"
            />
          </div>
          <div className="space-y-2">
            <Label>Allowed Tiers (empty = all tiers)</Label>
            <div className="flex flex-wrap gap-2">
              {TIER_OPTIONS.map((tier) => (
                <Badge
                  key={tier}
                  variant={formData.allowedTiers.includes(tier) ? 'default' : 'outline'}
                  className="cursor-pointer capitalize"
                  onClick={() => handleTierToggle(tier)}
                >
                  {tier}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
