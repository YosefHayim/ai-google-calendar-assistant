import { REQUEST_CONFIG_BASE } from "@/config";
import type { calendar_v3 } from "googleapis";
import { v4 as uuidv4 } from "uuid";

type InsertEventParams = {
  calendarEvents: calendar_v3.Resource$Events;
  eventData?: calendar_v3.Schema$Event | Record<string, string>;
  extra?: Record<string, unknown>;
};

/**
 * Generate conference data for Google Meet
 */
function generateMeetConferenceData(): calendar_v3.Schema$ConferenceData {
  return {
    createRequest: {
      requestId: uuidv4(),
      conferenceSolutionKey: {
        type: "hangoutsMeet",
      },
    },
  };
}

/**
 * Insert an event into the calendar
 *
 * @param {InsertEventParams} params - The parameters for inserting an event.
 * @returns {Promise<calendar_v3.Schema$Event>} The inserted event.
 * @description Inserts an event into the calendar and sends the response.
 * @example
 * const data = await insertEvent(params);
 *
 */
export async function insertEvent({ calendarEvents, eventData, extra }: InsertEventParams) {
  const body = (eventData as calendar_v3.Schema$Event & { calendarId?: string; email?: string }) || {};
  const calendarId = (extra?.calendarId as string) || body.calendarId || "primary";
  const addMeetLink = extra?.addMeetLink === true;

  const { calendarId: _cid, email: _email, ...requestBody } = body;

  // Add Google Meet conference data if requested
  if (addMeetLink) {
    requestBody.conferenceData = generateMeetConferenceData();
  }

  const createdEvent = await calendarEvents.insert({
    ...REQUEST_CONFIG_BASE,
    calendarId,
    requestBody,
    // conferenceDataVersion is required when adding conference data
    conferenceDataVersion: addMeetLink ? 1 : undefined,
  });
  return createdEvent.data;
}
