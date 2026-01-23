import express from "express"
import multer from "multer"
import { reqResAsyncHandler, sendR } from "@/lib/http"
import { supabaseAuth } from "@/domains/auth/middleware/supabase-auth"
import {
  createSupportTicket,
  getTicketsByUser,
  getTicketById,
  type TicketCategory,
  type TicketPriority,
} from "@/domains/support/services/support-ticket-service"
import { logger } from "@/lib/logger"

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5,
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
    ]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Invalid file type. Only images and PDFs are allowed."))
    }
  },
})

router.post(
  "/tickets",
  supabaseAuth(),
  upload.array("attachments", 5),
  reqResAsyncHandler(async (req, res) => {
    const userId = req.user?.id
    const userEmail = req.user?.email

    if (!userEmail) {
      return sendR(res, 401, "Authentication required")
    }

    const { subject, description, category, priority } = req.body

    if (!subject || !description) {
      return sendR(res, 400, "Subject and description are required")
    }

    const attachments = (req.files as Express.Multer.File[])?.map((file) => ({
      buffer: file.buffer,
      filename: file.originalname,
      mimeType: file.mimetype,
    }))

    const result = await createSupportTicket({
      userId,
      userEmail,
      userName: req.user?.user_metadata?.full_name || req.user?.user_metadata?.name,
      subject,
      description,
      category: category as TicketCategory,
      priority: priority as TicketPriority,
      attachments,
    })

    if (!result.success) {
      return sendR(res, 500, result.error || "Failed to create support ticket")
    }

    logger.info(`Support ticket created: ${result.ticket?.ticketNumber}`)

    sendR(res, 201, "Support ticket created successfully", {
      ticket: {
        id: result.ticket?.id,
        ticketNumber: result.ticket?.ticketNumber,
        status: result.ticket?.status,
        createdAt: result.ticket?.createdAt,
      },
    })
  })
)

router.get(
  "/tickets",
  supabaseAuth(),
  reqResAsyncHandler(async (req, res) => {
    const userId = req.user?.id

    if (!userId) {
      return sendR(res, 401, "Authentication required")
    }

    const tickets = await getTicketsByUser(userId)

    sendR(res, 200, "Tickets retrieved successfully", { tickets })
  })
)

router.get(
  "/tickets/:id",
  supabaseAuth(),
  reqResAsyncHandler(async (req, res) => {
    const userId = req.user?.id
    const ticketId = req.params.id

    if (!userId) {
      return sendR(res, 401, "Authentication required")
    }

    const ticket = await getTicketById(ticketId, userId)

    if (!ticket) {
      return sendR(res, 404, "Ticket not found")
    }

    sendR(res, 200, "Ticket retrieved successfully", { ticket })
  })
)

export default router
