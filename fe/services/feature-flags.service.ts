import { apiClient } from '@/lib/api/client'

export type FeatureFlag = {
  id: string
  key: string
  name: string
  description: string | null
  enabled: boolean
  rolloutPercentage: number
  allowedTiers: string[]
  allowedUserIds: string[]
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export type CreateFeatureFlagInput = {
  key: string
  name: string
  description?: string
  enabled?: boolean
  rolloutPercentage?: number
  allowedTiers?: string[]
  allowedUserIds?: string[]
  metadata?: Record<string, unknown>
}

export type UpdateFeatureFlagInput = Partial<CreateFeatureFlagInput>

export const featureFlagsService = {
  async getAll(): Promise<FeatureFlag[]> {
    const { data } = await apiClient.get('/api/feature-flags')
    return data.data
  },

  async getByKey(key: string): Promise<FeatureFlag | null> {
    const { data } = await apiClient.get(`/api/feature-flags/${key}`)
    return data.data
  },

  async checkFlag(key: string): Promise<boolean> {
    const { data } = await apiClient.get(`/api/feature-flags/check/${key}`)
    return data.data.enabled
  },

  async getEnabledFlags(): Promise<Record<string, boolean>> {
    const { data } = await apiClient.get('/api/feature-flags/enabled')
    return data.data
  },

  async create(input: CreateFeatureFlagInput): Promise<FeatureFlag> {
    const { data } = await apiClient.post('/api/feature-flags', input)
    return data.data
  },

  async update(id: string, input: UpdateFeatureFlagInput): Promise<FeatureFlag> {
    const { data } = await apiClient.patch(`/api/feature-flags/${id}`, input)
    return data.data
  },

  async toggle(id: string, enabled: boolean): Promise<FeatureFlag> {
    const { data } = await apiClient.patch(`/api/feature-flags/${id}/toggle`, { enabled })
    return data.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/feature-flags/${id}`)
  },
}
