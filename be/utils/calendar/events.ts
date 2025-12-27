import { ACTION, STATUS_RESPONSE } from "@/config";

import type { AuthedRequest } from "@/types";
import type { Request } from "express";
import { asyncHandler } from "../http/async-handlers";
import type { calendar_v3 } from "googleapis";
import { deleteEvent } from "./delete-event";
import errorTemplate from "../http/error-template";
import { fetchCredentialsByEmail } from "../auth/get-user-calendar-tokens";
import { getEvents } from "./get-events";
import { initCalendarWithUserTokensAndUpdateTokens } from "./init";
import { insertEvent } from "./insert-event";
import { updateEvent } from "./update-event";

export const eventsHandler = asyncHandler(
  async (req?: Request | null, action?: ACTION, eventData?: calendar_v3.Schema$Event | Record<string, string>, extra?: Record<string, unknown>) => {
    const email = (req as AuthedRequest | undefined)?.user?.email ?? (typeof extra?.email === "string" ? (extra.email as string) : undefined);

    if (!email) {
      throw new Error("Email is required to resolve calendar credentials");
    }

    const credentials = await fetchCredentialsByEmail(email);
    const calendar = await initCalendarWithUserTokensAndUpdateTokens(credentials);
    const calendarEvents = calendar.events;

    if ((action === ACTION.UPDATE || action === ACTION.DELETE) && !eventData?.id) {
      throw new Error("Event ID is required for update or delete action");
    }

    switch (action) {
      case ACTION.GET:
        return getEvents({ calendarEvents, req, extra });

      case ACTION.INSERT:
        return insertEvent({ calendarEvents, eventData, extra });

      case ACTION.UPDATE:
        return updateEvent({ calendarEvents, eventData, extra, req });

      case ACTION.DELETE:
        return deleteEvent({ calendarEvents, eventData, extra, req });

      default:
        throw errorTemplate("Unsupported calendar action", STATUS_RESPONSE.BAD_REQUEST);
    }
  }
);
