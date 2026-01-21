import { useQuery } from '@tanstack/react-query'
import { getSubscriptions } from '@/services/admin-service'

export const useAdminSubscriptions = (params: {
  page?: number
  limit?: number
  userId?: string
  status?: string
  search?: string
}) => {
  return useQuery({
    queryKey: ['admin', 'subscriptions', params],
    queryFn: () => getSubscriptions(params),
    staleTime: 30000, // 30 seconds
  })
}
