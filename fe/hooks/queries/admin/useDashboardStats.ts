import { useQuery } from '@tanstack/react-query'
import { getDashboardStats, getSubscriptionDistribution } from '@/services/admin.service'

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: getDashboardStats,
    staleTime: 30000, // 30 seconds
  })
}

export const useSubscriptionDistribution = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'distribution'],
    queryFn: getSubscriptionDistribution,
    staleTime: 60000, // 1 minute
  })
}
