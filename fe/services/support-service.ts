import { apiClient } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/endpoints'
import type { ApiResponse } from '@/types/api'

export type TicketCategory = 'bug' | 'feature_request' | 'question' | 'feedback' | 'other'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TicketStatus = 'open' | 'in_progress' | 'waiting_on_customer' | 'resolved' | 'closed'

export interface SupportTicket {
  id: string
  ticketNumber: string
  subject: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  attachments?: Array<{
    url: string
    filename: string
    mimeType: string
    size: number
  }>
  createdAt: string
  updatedAt: string
}

export interface CreateTicketInput {
  subject: string
  description: string
  category?: TicketCategory
  priority?: TicketPriority
}

export interface CreateTicketResponse {
  ticket: {
    id: string
    ticketNumber: string
    status: TicketStatus
    createdAt: string
  }
}

export const supportService = {
  async createTicket(input: CreateTicketInput, files?: File[]): Promise<ApiResponse<CreateTicketResponse>> {
    const formData = new FormData()
    formData.append('subject', input.subject)
    formData.append('description', input.description)
    if (input.category) formData.append('category', input.category)
    if (input.priority) formData.append('priority', input.priority)

    if (files?.length) {
      for (const file of files) {
        formData.append('attachments', file)
      }
    }

    const { data } = await apiClient.post<ApiResponse<CreateTicketResponse>>(ENDPOINTS.SUPPORT_TICKETS, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  },

  async getTickets(): Promise<ApiResponse<{ tickets: SupportTicket[] }>> {
    const { data } = await apiClient.get<ApiResponse<{ tickets: SupportTicket[] }>>(ENDPOINTS.SUPPORT_TICKETS_LIST)
    return data
  },

  async getTicketById(id: string): Promise<ApiResponse<{ ticket: SupportTicket }>> {
    const { data } = await apiClient.get<ApiResponse<{ ticket: SupportTicket }>>(ENDPOINTS.SUPPORT_TICKET_BY_ID(id))
    return data
  },
}
