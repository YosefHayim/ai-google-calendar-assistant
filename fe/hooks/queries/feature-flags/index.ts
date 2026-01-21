'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { featureFlagsService } from '@/services/feature-flags-service'
import type { FeatureFlag, CreateFeatureFlagInput, UpdateFeatureFlagInput } from '@/services/feature-flags-service'
import type { QueryHookOptions } from '../useQueryWrapper'

export const featureFlagKeys = {
  all: ['feature-flags'] as const,
  list: () => [...featureFlagKeys.all, 'list'] as const,
  enabled: () => [...featureFlagKeys.all, 'enabled'] as const,
  detail: (key: string) => [...featureFlagKeys.all, 'detail', key] as const,
  check: (key: string) => [...featureFlagKeys.all, 'check', key] as const,
}

export function useFeatureFlags(options?: QueryHookOptions) {
  return useQuery({
    queryKey: featureFlagKeys.list(),
    queryFn: () => featureFlagsService.getAll(),
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? true,
  })
}

export function useFeatureFlagByKey(key: string, options?: QueryHookOptions) {
  return useQuery({
    queryKey: featureFlagKeys.detail(key),
    queryFn: () => featureFlagsService.getByKey(key),
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
    enabled: (options?.enabled ?? true) && Boolean(key),
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? true,
  })
}

export function useCheckFeatureFlag(key: string, options?: QueryHookOptions) {
  return useQuery({
    queryKey: featureFlagKeys.check(key),
    queryFn: () => featureFlagsService.checkFlag(key),
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
    enabled: (options?.enabled ?? true) && Boolean(key),
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
  })
}

export function useEnabledFeatureFlags(options?: QueryHookOptions) {
  return useQuery({
    queryKey: featureFlagKeys.enabled(),
    queryFn: () => featureFlagsService.getEnabledFlags(),
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? true,
  })
}

export function useCreateFeatureFlag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateFeatureFlagInput) => featureFlagsService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featureFlagKeys.all })
    },
  })
}

export function useUpdateFeatureFlag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateFeatureFlagInput }) => featureFlagsService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featureFlagKeys.all })
    },
  })
}

export function useToggleFeatureFlag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => featureFlagsService.toggle(id, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featureFlagKeys.all })
    },
  })
}

export function useDeleteFeatureFlag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => featureFlagsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featureFlagKeys.all })
    },
  })
}

export function useFeatureFlag(key: string): boolean {
  const { data } = useCheckFeatureFlag(key)
  return data ?? false
}

export type { FeatureFlag, CreateFeatureFlagInput, UpdateFeatureFlagInput }
