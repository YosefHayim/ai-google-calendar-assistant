import type { Request } from "express";
import type { calendar_v3 } from "googleapis";
import { ACTION, STATUS_RESPONSE } from "@/config";
import type { AuthedRequest } from "@/types";
import { fetchCredentialsByEmail } from "@/domains/auth/utils/get-user-calendar-tokens";
import { asyncHandler } from "@/lib/http/async-handlers";
import { throwHttpError } from "@/lib/http/error-template";
import { deleteEvent } from "./delete-event";
import { getEvents } from "./get-events";
import { initUserSupabaseCalendarWithTokensAndUpdateTokens } from "./init";
import { insertEvent } from "./insert-event";
import { patchEvent } from "./patch-event";
import { updateEvent } from "./update-event";

/**
 * Events handler
 *
 * @param {Request | null} req - The request object.
 * @param {ACTION} action - The action to perform.
 * @param {calendar_v3.Schema$Event | Record<string, string>} eventData - The event data.
 * @param {Record<string, unknown>} extra - The extra data.
 * @param {Record<string, string>} query - The query data.
 * @returns {Promise<any>} The result of the action.
 */
export const eventsHandler = asyncHandler(
  async (
    req?: Request | null,
    action?: ACTION,
    eventData?: calendar_v3.Schema$Event | Record<string, string>,
    extra?: Record<string, unknown>
  ) => {
    const email =
      (req as AuthedRequest | undefined)?.user?.email ??
      (typeof extra?.email === "string" ? (extra.email as string) : undefined);

    if (!email) {
      throw new Error("Email is required to resolve calendar credentials");
    }

    const credentials = await fetchCredentialsByEmail(email);
    const calendar =
      await initUserSupabaseCalendarWithTokensAndUpdateTokens(credentials);
    const calendarEvents = calendar.events;

    if (
      (action === ACTION.UPDATE ||
        action === ACTION.DELETE ||
        action === ACTION.PATCH) &&
      !eventData?.id &&
      !extra?.eventId
    ) {
      throw new Error(
        "Event ID is required for update, patch, or delete action"
      );
    }

    switch (action) {
      case ACTION.GET:
        return getEvents({ calendarEvents, req, extra });

      case ACTION.INSERT:
        return insertEvent({ calendarEvents, eventData, extra });

      case ACTION.PATCH:
        return patchEvent({ calendarEvents, eventData, extra });

      case ACTION.UPDATE:
        return updateEvent({ calendarEvents, eventData, extra, req });

      case ACTION.DELETE:
        return deleteEvent({ calendarEvents, eventData, extra, req });

      default:
        throwHttpError(
          "Unsupported calendar action",
          STATUS_RESPONSE.BAD_REQUEST
        );
    }
  }
);
