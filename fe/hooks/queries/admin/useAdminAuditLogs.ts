import { useQuery } from '@tanstack/react-query'
import { getAuditLogs } from '@/services/admin.service'

export const useAdminAuditLogs = (params: {
  page?: number
  limit?: number
  adminUserId?: string
  action?: string
  search?: string
}) => {
  return useQuery({
    queryKey: ['admin', 'audit-logs', params],
    queryFn: () => getAuditLogs(params),
    staleTime: 30000, // 30 seconds
  })
}
