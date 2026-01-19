import type { Request, Response } from "express";
import { STATUS_RESPONSE } from "@/config";
import type { AffiliateStatus } from "@/services/affiliate-service";
import {
  getAffiliateById as getAffiliateByIdService,
  getAffiliateDashboardUrls,
  getAffiliateList,
  getAffiliateProgramSettings,
} from "@/services/affiliate-service";
import { reqResAsyncHandler, sendR } from "@/utils/http";
import { parsePaginationParams } from "@/utils/http/pagination";

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
