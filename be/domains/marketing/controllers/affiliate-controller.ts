import type { Request, Response } from "express";
import {
  getAffiliateById as getAffiliateByIdService,
  getAffiliateDashboardUrls,
  getAffiliateList,
  getAffiliateProgramSettings,
} from "@/domains/marketing/services/affiliate-service";
import { reqResAsyncHandler, sendR } from "@/lib/http";

import type { AffiliateStatus } from "@/domains/marketing/services/affiliate-service";
import { STATUS_RESPONSE } from "@/config";
import { parsePaginationParams } from "@/lib/http/pagination";

/**
 * Retrieves paginated list of affiliates with optional filtering.
 * Supports filtering by status and search terms, with pagination controls.
 *
 * @param req - Express request with query parameters for filtering and pagination
 * @param res - Express response object
 * @returns Promise resolving to paginated affiliate list or error response
 */
export const getAffiliates = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const { page, limit } = parsePaginationParams(req.query);

    const params = {
      page,
      limit,
      status: req.query.status as AffiliateStatus | undefined,
      search: req.query.search as string | undefined,
    };

    const result = await getAffiliateList(params);
    return sendR(res, STATUS_RESPONSE.SUCCESS, "Affiliates retrieved", result);
  }
);

/**
 * Retrieves affiliate program configuration and dashboard URLs.
 * Returns current program settings and links to external affiliate dashboards.
 *
 * @param _req - Express request object (unused)
 * @param res - Express response object
 * @returns Promise resolving to affiliate program settings and URLs
 */
export const getAffiliateSettings = reqResAsyncHandler(
  async (_req: Request, res: Response) => {
    const settings = getAffiliateProgramSettings();
    const dashboardUrls = getAffiliateDashboardUrls();

    return Promise.resolve(
      sendR(res, STATUS_RESPONSE.SUCCESS, "Affiliate settings retrieved", {
        settings,
        dashboardUrls,
      })
    );
  }
);

/**
 * Retrieves detailed information for a specific affiliate by ID.
 * Returns affiliate profile, statistics, and current status information.
 *
 * @param req - Express request with affiliate ID in route parameters
 * @param res - Express response object
 * @returns Promise resolving to affiliate details or not found error
 */
export const getAffiliateById = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const affiliate = await getAffiliateByIdService(req.params.id as string);

    if (!affiliate) {
      return sendR(res, STATUS_RESPONSE.NOT_FOUND, "Affiliate not found");
    }

    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Affiliate retrieved",
      affiliate
    );
  }
);
