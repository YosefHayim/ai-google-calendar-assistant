import type { Request, Response } from "express"
import { STATUS_RESPONSE } from "@/config"
import { reqResAsyncHandler, sendR } from "@/lib/http"
import {
  deleteContact,
  getContactById,
  getContactMiningStatus,
  getContacts,
  getContactStats,
  searchContacts,
  toggleContactMining,
  updateContact,
} from "../services/contact-query-service"
import {
  mineContactsFromCalendar,
  mineContactsInBackground,
} from "../services/contact-mining-service"
import {
  getContactsSchema,
  searchContactsSchema,
  updateContactSchema,
} from "../types"

const list = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id
  if (!userId) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated")
  }

  const parseResult = getContactsSchema.safeParse({
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    sortBy: req.query.sortBy,
    sortOrder: req.query.sortOrder,
    includeHidden: req.query.includeHidden === "true",
  })

  if (!parseResult.success) {
    return sendR(
      res,
      STATUS_RESPONSE.BAD_REQUEST,
      "Invalid query parameters",
      parseResult.error.errors
    )
  }

  const result = await getContacts(userId, parseResult.data)
  return sendR(res, STATUS_RESPONSE.SUCCESS, "Contacts fetched", result)
})

const search = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id
  if (!userId) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated")
  }

  const parseResult = searchContactsSchema.safeParse({
    query: req.query.q,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    includeHidden: req.query.includeHidden === "true",
  })

  if (!parseResult.success) {
    return sendR(
      res,
      STATUS_RESPONSE.BAD_REQUEST,
      "Invalid search parameters",
      parseResult.error.errors
    )
  }

  const results = await searchContacts(userId, parseResult.data)
  return sendR(res, STATUS_RESPONSE.SUCCESS, "Search completed", results)
})

const stats = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id
  if (!userId) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated")
  }

  const contactStats = await getContactStats(userId)
  return sendR(res, STATUS_RESPONSE.SUCCESS, "Stats fetched", contactStats)
})

const getOne = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id
  const contactId = req.params.id

  if (!userId) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated")
  }

  if (!contactId) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Contact ID is required")
  }

  const contact = await getContactById(userId, contactId)
  if (!contact) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "Contact not found")
  }

  return sendR(res, STATUS_RESPONSE.SUCCESS, "Contact fetched", contact)
})

const update = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id
  const contactId = req.params.id

  if (!userId) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated")
  }

  if (!contactId) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Contact ID is required")
  }

  const parseResult = updateContactSchema.safeParse(req.body)
  if (!parseResult.success) {
    return sendR(
      res,
      STATUS_RESPONSE.BAD_REQUEST,
      "Invalid update data",
      parseResult.error.errors
    )
  }

  const updated = await updateContact(userId, contactId, parseResult.data)
  return sendR(res, STATUS_RESPONSE.SUCCESS, "Contact updated", updated)
})

const remove = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id
  const contactId = req.params.id

  if (!userId) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated")
  }

  if (!contactId) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Contact ID is required")
  }

  await deleteContact(userId, contactId)
  return sendR(res, STATUS_RESPONSE.SUCCESS, "Contact deleted")
})

const syncContacts = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id
  const email = req.user?.email

  if (!userId) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated")
  }
  if (!email) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User email not found")
  }

  const accessToken = req.googleTokens?.accessToken
  const refreshToken = req.googleTokens?.refreshToken

  if (!accessToken) {
    return sendR(
      res,
      STATUS_RESPONSE.BAD_REQUEST,
      "Google Calendar not connected"
    )
  }

  const result = await mineContactsFromCalendar(
    userId,
    email,
    accessToken,
    refreshToken
  )

  return sendR(res, STATUS_RESPONSE.SUCCESS, "Contact sync completed", result)
})

const syncContactsAsync = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id
    const email = req.user?.email

    if (!userId) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated")
    }
    if (!email) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User email not found")
    }

    const accessToken = req.googleTokens?.accessToken
    const refreshToken = req.googleTokens?.refreshToken

    if (!accessToken) {
      return sendR(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        "Google Calendar not connected"
      )
    }

    mineContactsInBackground(userId, email, accessToken, refreshToken)

    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Contact sync started in background"
    )
  }
)

const getMiningStatus = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id
    if (!userId) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated")
    }

    const enabled = await getContactMiningStatus(userId)
    return sendR(res, STATUS_RESPONSE.SUCCESS, "Mining status fetched", {
      enabled,
    })
  }
)

const setMiningStatus = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id
    if (!userId) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated")
    }

    const { enabled } = req.body
    if (typeof enabled !== "boolean") {
      return sendR(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        "enabled must be a boolean"
      )
    }

    await toggleContactMining(userId, enabled)
    return sendR(res, STATUS_RESPONSE.SUCCESS, "Mining status updated", {
      enabled,
    })
  }
)

export const contactsController = {
  list,
  search,
  stats,
  getOne,
  update,
  remove,
  syncContacts,
  syncContactsAsync,
  getMiningStatus,
  setMiningStatus,
}
