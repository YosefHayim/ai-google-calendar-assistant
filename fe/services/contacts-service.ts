import { apiClient } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/endpoints'
import type { ApiResponse } from '@/types/api'
import type {
  Contact,
  ContactSearchResult,
  ContactStats,
  GetContactsParams,
  PaginatedContacts,
  SearchContactsParams,
  UpdateContactBody,
} from '@/types/contacts'

export interface MiningStatus {
  enabled: boolean
  lastMinedAt: string | null
  totalContacts: number
}

export interface SyncResult {
  success: boolean
  contactsCreated: number
  contactsUpdated: number
  totalProcessed: number
}

export const contactsService = {
  async getContacts(params?: GetContactsParams): Promise<ApiResponse<PaginatedContacts>> {
    const { data } = await apiClient.get<ApiResponse<PaginatedContacts>>(ENDPOINTS.CONTACTS, { params })
    return data
  },

  async searchContacts(params: SearchContactsParams): Promise<ApiResponse<ContactSearchResult[]>> {
    const { data } = await apiClient.get<ApiResponse<ContactSearchResult[]>>(ENDPOINTS.CONTACTS_SEARCH, {
      params: { q: params.query, limit: params.limit },
    })
    return data
  },

  async getContactStats(): Promise<ApiResponse<ContactStats>> {
    const { data } = await apiClient.get<ApiResponse<ContactStats>>(ENDPOINTS.CONTACTS_STATS)
    return data
  },

  async getContactById(id: string): Promise<ApiResponse<Contact>> {
    const { data } = await apiClient.get<ApiResponse<Contact>>(ENDPOINTS.CONTACTS_BY_ID(id))
    return data
  },

  async updateContact(id: string, body: UpdateContactBody): Promise<ApiResponse<Contact>> {
    const { data } = await apiClient.patch<ApiResponse<Contact>>(ENDPOINTS.CONTACTS_UPDATE(id), body)
    return data
  },

  async deleteContact(id: string): Promise<ApiResponse<null>> {
    const { data } = await apiClient.delete<ApiResponse<null>>(ENDPOINTS.CONTACTS_DELETE(id))
    return data
  },

  async getMiningStatus(): Promise<ApiResponse<MiningStatus>> {
    const { data } = await apiClient.get<ApiResponse<MiningStatus>>(ENDPOINTS.CONTACTS_MINING_STATUS)
    return data
  },

  async setMiningStatus(enabled: boolean): Promise<ApiResponse<MiningStatus>> {
    const { data } = await apiClient.put<ApiResponse<MiningStatus>>(ENDPOINTS.CONTACTS_MINING_STATUS_UPDATE, {
      enabled,
    })
    return data
  },

  async syncContacts(): Promise<ApiResponse<SyncResult>> {
    const { data } = await apiClient.post<ApiResponse<SyncResult>>(ENDPOINTS.CONTACTS_SYNC)
    return data
  },

  async syncContactsAsync(): Promise<ApiResponse<{ jobId: string }>> {
    const { data } = await apiClient.post<ApiResponse<{ jobId: string }>>(ENDPOINTS.CONTACTS_SYNC_ASYNC)
    return data
  },
}
