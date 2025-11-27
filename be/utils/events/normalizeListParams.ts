import type { Request } from "express";
import type { calendar_v3 } from "googleapis";
import { requestConfigBase } from "@/config/root-config";

export type ListExtra = Partial<calendar_v3.Params$Resource$Events$List> & {
  email?: string;
  customEvents?: boolean;
};

/**
 * Normalizes and cleans parameters for events.list API call
 */
export function normalizeListParams(
  req?: Request | null,
  extra?: Record<string, unknown>
): {
  listParams: calendar_v3.Params$Resource$Events$List;
  customFlag: boolean;
} {
  const rawExtra: ListExtra = {
    ...(extra as ListExtra),
    ...(req?.body ?? {}),
    ...(req?.query ?? {}),
  };

  const customFlag = Boolean(rawExtra.customEvents);
  const { email: _omitEmail, customEvents: _omitCustom, calendarId, ...listExtraRaw } = rawExtra;

  const listParams: calendar_v3.Params$Resource$Events$List = {
    ...requestConfigBase,
    prettyPrint: true,
    maxResults: 2499,
    calendarId: calendarId ?? "primary",
    ...listExtraRaw,
  };

  // Drop falsy q instead of sending null
  if (!listParams.q) {
    (listParams as Record<string, unknown>).q = undefined;
  }

  return { listParams, customFlag };
}
