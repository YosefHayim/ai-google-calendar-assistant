import { useQuery } from '@tanstack/react-query'
import { getRevenueTrends, getSubscriptionTrends, getAdminMe } from '@/services/admin-service'

export const useRevenueTrends = (months: number = 6) => {
  return useQuery({
    queryKey: ['admin', 'revenue-trends', months],
    queryFn: () => getRevenueTrends(months),
    staleTime: 60000, // 1 minute
  })
}

export const useSubscriptionTrends = (days: number = 7) => {
  return useQuery({
    queryKey: ['admin', 'subscription-trends', days],
    queryFn: () => getSubscriptionTrends(days),
    staleTime: 60000, // 1 minute
  })
}

export const useAdminMe = () => {
  return useQuery({
    queryKey: ['admin', 'me'],
    queryFn: () => getAdminMe(),
    staleTime: 300000, // 5 minutes
  })
}
