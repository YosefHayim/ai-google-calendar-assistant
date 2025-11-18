import type { Request } from "express";
import type { calendar_v3 } from "googleapis";
import { ACTION, STATUS_RESPONSE } from "@/types";
import { asyncHandler } from "./asyncHandlers";
import errorTemplate from "./errorTemplate";
import { fetchCredentialsByEmail } from "./getUserCalendarTokens";
import { initCalendarWithUserTokensAndUpdateTokens } from "./initCalendarWithUserTokens";
import { extractEmail } from "./events/extractEmail";
import { handleDeleteEvent } from "./events/handlers/deleteEvent";
import { handleGetEvents } from "./events/handlers/getEvents";
import { handleInsertEvent } from "./events/handlers/insertEvent";
import { handleUpdateEvent } from "./events/handlers/updateEvent";
import { validateEventId } from "./events/validateEventId";


export const eventsHandler = asyncHandler(
  async (
    req?: Request | null,
    action?: ACTION,
    eventData?: calendar_v3.Schema$Event | Record<string, string>,
    extra?: Record<string, unknown>
  ) => {
    const email = extractEmail(req, extra);
    const credentials = await fetchCredentialsByEmail(email);
    const calendar = await initCalendarWithUserTokensAndUpdateTokens(credentials);
    const calendarEvents = calendar.events;

    validateEventId(action, eventData);

    switch (action) {
      case ACTION.GET:
        return await handleGetEvents(calendarEvents, req, extra);

      case ACTION.INSERT:
        return await handleInsertEvent(calendarEvents, eventData, req, extra);

      case ACTION.UPDATE:
        return await handleUpdateEvent(calendarEvents, eventData, req, extra);

      case ACTION.DELETE:
        return await handleDeleteEvent(calendarEvents, eventData, req, extra);

      default:
        throw errorTemplate("Unsupported calendar action", STATUS_RESPONSE.BAD_REQUEST);
    }
  }
);
