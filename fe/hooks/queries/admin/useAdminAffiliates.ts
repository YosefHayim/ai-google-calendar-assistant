import { useQuery } from '@tanstack/react-query'
import { getAffiliateById, getAffiliateSettings, getAffiliates } from '@/services/admin.service'
import type { AdminAffiliateListParams } from '@/types/admin'

export const useAdminAffiliates = (params: AdminAffiliateListParams) =>
  useQuery({
    queryKey: ['admin', 'affiliates', params],
    queryFn: () => getAffiliates(params),
    staleTime: 30_000,
  })

export const useAdminAffiliate = (id: string) =>
  useQuery({
    queryKey: ['admin', 'affiliates', id],
    queryFn: () => getAffiliateById(id),
    enabled: !!id,
  })

export const useAffiliateSettings = () =>
  useQuery({
    queryKey: ['admin', 'affiliates', 'settings'],
    queryFn: () => getAffiliateSettings(),
    staleTime: 60_000,
  })
