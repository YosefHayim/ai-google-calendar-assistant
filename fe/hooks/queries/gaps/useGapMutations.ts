'use client'

import type { DismissAllGapsResponse, FillGapRequest, FillGapResponse, SkipGapResponse } from '@/types/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { gapsService } from '@/services/gaps-service'
import { queryKeys } from '@/lib/query/keys'
import { toast } from 'sonner'

/**
 * Hook to fill a gap with a new event
 */
export function useFillGap() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ gapId, data }: { gapId: string; data: FillGapRequest }) => {
      const response = await gapsService.fillGap(gapId, data)
      if (response.status === 'error' || !response.data) {
        throw new Error(response.message || 'Failed to fill gap')
      }
      return response.data
    },
    onSuccess: (data: FillGapResponse) => {
      toast.success('Event created', {
        description: data.message,
      })
      // Invalidate gaps and events
      queryClient.invalidateQueries({ queryKey: queryKeys.gaps.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all })
    },
    onError: (error: Error) => {
      toast.error('Failed to create event', {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to skip a gap
 */
export function useSkipGap() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ gapId, reason }: { gapId: string; reason?: string }) => {
      const response = await gapsService.skipGap(gapId, reason ? { reason } : undefined)
      if (response.status === 'error' || !response.data) {
        throw new Error(response.message || 'Failed to skip gap')
      }
      return response.data
    },
    onSuccess: (_data: SkipGapResponse) => {
      toast.success('Gap skipped')
      queryClient.invalidateQueries({ queryKey: queryKeys.gaps.all })
    },
    onError: (error: Error) => {
      toast.error('Failed to skip gap', {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to dismiss all gaps
 */
export function useDismissAllGaps() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await gapsService.dismissAllGaps()
      if (response.status === 'error' || !response.data) {
        throw new Error(response.message || 'Failed to dismiss gaps')
      }
      return response.data
    },
    onSuccess: (data: DismissAllGapsResponse) => {
      toast.success('Gaps dismissed', {
        description: data.message,
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.gaps.all })
    },
    onError: (error: Error) => {
      toast.error('Failed to dismiss gaps', {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to disable gap analysis
 */
export function useDisableGapAnalysis() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await gapsService.disableGapAnalysis()
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to disable gap analysis')
      }
      return response.data
    },
    onSuccess: () => {
      toast.success('Gap analysis disabled')
      queryClient.invalidateQueries({ queryKey: queryKeys.gaps.all })
    },
    onError: (error: Error) => {
      toast.error('Failed to disable gap analysis', {
        description: error.message,
      })
    },
  })
}

/**
 * Combined hook that provides all gap mutation operations
 * Returns an object with all the gap mutation hooks
 */
export function useGapMutations() {
  const fillGap = useFillGap()
  const skipGap = useSkipGap()
  const dismissAllGaps = useDismissAllGaps()
  const disableGapAnalysis = useDisableGapAnalysis()

  return {
    fillGap,
    skipGap,
    dismissAllGaps,
    disableGapAnalysis,
  }
}
