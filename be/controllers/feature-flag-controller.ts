import type { Request, Response } from "express"
import { reqResAsyncHandler, sendR } from "@/utils/http"
import { STATUS_RESPONSE } from "@/config/constants/http"
import {
  getAllFeatureFlags,
  getFeatureFlagByKey,
  isFeatureEnabled,
  getEnabledFlagsForUser,
  createFeatureFlag,
  updateFeatureFlag,
  toggleFeatureFlag,
  deleteFeatureFlag,
} from "@/services/feature-flag-service"
import type { FeatureFlagCheckContext } from "@/services/feature-flag-service"

const getAllFlags = reqResAsyncHandler(async (_req: Request, res: Response) => {
  const flags = await getAllFeatureFlags()
  return sendR(res, STATUS_RESPONSE.SUCCESS, "Feature flags retrieved", flags)
})

const getFlagByKey = reqResAsyncHandler(async (req: Request, res: Response) => {
  const { key } = req.params
  const flag = await getFeatureFlagByKey(key)

  if (!flag) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "Feature flag not found")
  }

  return sendR(res, STATUS_RESPONSE.SUCCESS, "Feature flag retrieved", flag)
})

const checkFlag = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const { key } = req.params
    const context: FeatureFlagCheckContext = {
      userId: req.user?.id,
      userTier: (req.user?.app_metadata as Record<string, string> | undefined)?.tier,
    }

    const enabled = await isFeatureEnabled(key, context)
    return sendR(res, STATUS_RESPONSE.SUCCESS, "Feature flag checked", { enabled })
  }
)

const getEnabledFlags = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const context: FeatureFlagCheckContext = {
      userId: req.user?.id,
      userTier: (req.user?.app_metadata as Record<string, string> | undefined)?.tier,
    }

    const flags = await getEnabledFlagsForUser(context)
    return sendR(res, STATUS_RESPONSE.SUCCESS, "Enabled flags retrieved", flags)
  }
)

const createFlagHandler = reqResAsyncHandler(async (req: Request, res: Response) => {
  const { key, name, description, enabled, rolloutPercentage, allowedTiers, allowedUserIds, metadata } = req.body

  if (!key) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Key is required")
  }

  if (!name) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Name is required")
  }

  const flag = await createFeatureFlag({
    key,
    name,
    description,
    enabled,
    rolloutPercentage,
    allowedTiers,
    allowedUserIds,
    metadata,
  })

  if (!flag) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Failed to create feature flag")
  }

  return sendR(res, STATUS_RESPONSE.CREATED, "Feature flag created", flag)
})

const updateFlagHandler = reqResAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { key, name, description, enabled, rolloutPercentage, allowedTiers, allowedUserIds, metadata } = req.body

  const flag = await updateFeatureFlag(id, {
    key,
    name,
    description,
    enabled,
    rolloutPercentage,
    allowedTiers,
    allowedUserIds,
    metadata,
  })

  if (!flag) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "Feature flag not found")
  }

  return sendR(res, STATUS_RESPONSE.SUCCESS, "Feature flag updated", flag)
})

const toggleFlagHandler = reqResAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { enabled } = req.body

  if (typeof enabled !== "boolean") {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Enabled must be a boolean")
  }

  const flag = await toggleFeatureFlag(id, enabled)

  if (!flag) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "Feature flag not found")
  }

  return sendR(res, STATUS_RESPONSE.SUCCESS, "Feature flag toggled", flag)
})

const deleteFlagHandler = reqResAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const success = await deleteFeatureFlag(id)

  if (!success) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "Feature flag not found")
  }

  return sendR(res, STATUS_RESPONSE.SUCCESS, "Feature flag deleted")
})

export const featureFlagController = {
  getAllFlags,
  getFlagByKey,
  checkFlag,
  getEnabledFlags,
  createFlag: createFlagHandler,
  updateFlag: updateFlagHandler,
  toggleFlag: toggleFlagHandler,
  deleteFlag: deleteFlagHandler,
}
