import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  grantCredits,
  sendPasswordReset,
} from '@/services/admin.service'
import type { AdminUserListParams, UserStatus, UserRole } from '@/types/admin'

export const useAdminUsers = (params: AdminUserListParams) => {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => getUsers(params),
    staleTime: 10000, // 10 seconds
  })
}

export const useAdminUser = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => getUserById(id),
    enabled: !!id,
  })
}

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: UserStatus; reason?: string }) =>
      updateUserStatus(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
    },
  })
}

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, role, reason }: { id: string; role: UserRole; reason?: string }) =>
      updateUserRole(id, role, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export const useGrantCredits = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, credits, reason }: { id: string; credits: number; reason: string }) =>
      grantCredits(id, credits, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export const useSendPasswordReset = () => {
  return useMutation({
    mutationFn: (id: string) => sendPasswordReset(id),
  })
}
