import { useQuery } from '@tanstack/react-query'
import { getPayments } from '@/services/admin.service'

export const useAdminPayments = (params: {
  page?: number
  limit?: number
  userId?: string
  status?: string
  search?: string
}) => {
  return useQuery({
    queryKey: ['admin', 'payments', params],
    queryFn: () => getPayments(params),
    staleTime: 30000, // 30 seconds
  })
}
