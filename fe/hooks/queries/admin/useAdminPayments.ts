import { useQuery } from '@tanstack/react-query'
import { getPayments } from '@/services/admin-service'

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

// Convenience hook for fetching recent payments (used on dashboard)
export const useRecentPayments = (params: { limit?: number } = {}) => {
  const { limit = 5 } = params
  const query = useAdminPayments({ page: 1, limit })

  return {
    ...query,
    data: query.data?.payments?.map((payment) => ({
      id: payment.id,
      status: payment.status,
      email: payment.userEmail,
      amount: payment.amountCents / 100,
    })),
  }
}
