import { SUPABASE } from "@/infrastructure/supabase/supabase"
import { StorageService } from "@/domains/storage/services/storage-service"
import { render } from "@react-email/components"
import { Resend } from "resend"
import { env } from "@/config/env"
import { logger } from "@/lib/logger"
import { SupportTicketEmail } from "@/emails/SupportTicketEmail"

const resend = new Resend(env.resend.apiKey)

export type TicketCategory = "bug" | "feature_request" | "question" | "feedback" | "other"
export type TicketPriority = "low" | "medium" | "high" | "urgent"
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed"

export type CreateTicketInput = {
  userId?: string
  userEmail: string
  userName?: string
  subject: string
  description: string
  category?: TicketCategory
  priority?: TicketPriority
  attachments?: Array<{
    buffer: Buffer
    filename: string
    mimeType: string
  }>
}

export type SupportTicket = {
  id: string
  ticketNumber: string
  userId: string | null
  userEmail: string
  userName: string | null
  subject: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  attachments: Array<{ url: string; filename: string }>
  createdAt: string
  updatedAt: string
}

export type CreateTicketResult = {
  success: boolean
  ticket?: SupportTicket
  error?: string
}

const SUPPORT_BUCKET = "support-attachments"

async function uploadAttachments(
  ticketId: string,
  attachments: CreateTicketInput["attachments"]
): Promise<Array<{ url: string; filename: string }>> {
  if (!attachments || attachments.length === 0) {
    return []
  }

  const uploadedFiles: Array<{ url: string; filename: string }> = []

  for (const attachment of attachments) {
    const timestamp = Date.now()
    const safeName = attachment.filename.replace(/[^a-zA-Z0-9.-]/g, "_")
    const path = `${ticketId}/${timestamp}_${safeName}`

    const result = await StorageService.uploadFile(SUPPORT_BUCKET, path, attachment.buffer, {
      contentType: attachment.mimeType,
    })

    if (result.success && result.url) {
      uploadedFiles.push({
        url: result.url,
        filename: attachment.filename,
      })
    } else {
      logger.warn(`Failed to upload attachment ${attachment.filename}: ${result.error}`)
    }
  }

  return uploadedFiles
}

async function sendTicketNotification(ticket: SupportTicket, attachmentUrls: string[]): Promise<void> {
  if (!env.resend.isEnabled) {
    logger.debug("[SupportService] Email service not configured, skipping notification")
    return
  }

  try {
    const html = await render(
      SupportTicketEmail({
        ticketNumber: ticket.ticketNumber,
        userName: ticket.userName || "Anonymous User",
        userEmail: ticket.userEmail,
        subject: ticket.subject,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority,
        attachmentCount: ticket.attachments.length,
        attachmentUrls,
      })
    )

    const { error } = await resend.emails.send({
      from: env.resend.fromEmail,
      to: env.resend.supportEmail,
      replyTo: ticket.userEmail,
      subject: `[${ticket.ticketNumber}] ${ticket.subject}`,
      html,
    })

    if (error) {
      logger.error(`[SupportService] Failed to send ticket notification: ${error.message}`)
    } else {
      logger.info(`[SupportService] Ticket notification sent for ${ticket.ticketNumber}`)
    }
  } catch (error) {
    logger.error(`[SupportService] Error sending ticket notification: ${error}`)
  }
}

export async function createSupportTicket(input: CreateTicketInput): Promise<CreateTicketResult> {
  try {
    const { data: ticketData, error: insertError } = await SUPABASE.from("support_tickets")
      .insert({
        ticket_number: "PLACEHOLDER",
        user_id: input.userId || null,
        user_email: input.userEmail,
        user_name: input.userName || null,
        subject: input.subject,
        description: input.description,
        category: input.category || "other",
        priority: input.priority || "medium",
        attachments: [] as unknown as null,
      })
      .select("*")
      .single()

    if (insertError || !ticketData) {
      logger.error(`[SupportService] Failed to create ticket: ${insertError?.message}`)
      return { success: false, error: insertError?.message || "Failed to create ticket" }
    }

    const uploadedAttachments = await uploadAttachments(ticketData.id, input.attachments)

    if (uploadedAttachments.length > 0) {
      const { error: updateError } = await SUPABASE.from("support_tickets")
        .update({ attachments: uploadedAttachments })
        .eq("id", ticketData.id)

      if (updateError) {
        logger.warn(`[SupportService] Failed to update attachments: ${updateError.message}`)
      }
    }

    const ticket: SupportTicket = {
      id: ticketData.id,
      ticketNumber: ticketData.ticket_number,
      userId: ticketData.user_id,
      userEmail: ticketData.user_email,
      userName: ticketData.user_name,
      subject: ticketData.subject,
      description: ticketData.description,
      category: ticketData.category,
      priority: ticketData.priority,
      status: ticketData.status,
      attachments: uploadedAttachments,
      createdAt: ticketData.created_at,
      updatedAt: ticketData.updated_at,
    }

    await sendTicketNotification(ticket, uploadedAttachments.map((a) => a.url))

    logger.info(`[SupportService] Created ticket ${ticket.ticketNumber} for ${input.userEmail}`)

    return { success: true, ticket }
  } catch (error) {
    logger.error(`[SupportService] Unexpected error creating ticket: ${error}`)
    return { success: false, error: "Unexpected error creating ticket" }
  }
}

export async function getTicketsByUser(userId: string): Promise<SupportTicket[]> {
  const { data, error } = await SUPABASE.from("support_tickets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error || !data) {
    logger.error(`[SupportService] Failed to fetch tickets for user ${userId}: ${error?.message}`)
    return []
  }

  return data.map((row) => ({
    id: row.id,
    ticketNumber: row.ticket_number,
    userId: row.user_id,
    userEmail: row.user_email,
    userName: row.user_name,
    subject: row.subject,
    description: row.description,
    category: row.category,
    priority: row.priority,
    status: row.status,
    attachments: (row.attachments || []) as Array<{ url: string; filename: string }>,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

export async function getTicketById(ticketId: string, userId?: string): Promise<SupportTicket | null> {
  let query = SUPABASE.from("support_tickets").select("*").eq("id", ticketId)

  if (userId) {
    query = query.eq("user_id", userId)
  }

  const { data, error } = await query.single()

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    ticketNumber: data.ticket_number,
    userId: data.user_id,
    userEmail: data.user_email,
    userName: data.user_name,
    subject: data.subject,
    description: data.description,
    category: data.category,
    priority: data.priority,
    status: data.status,
    attachments: (data.attachments || []) as Array<{ url: string; filename: string }>,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}
