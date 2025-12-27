import { reqResAsyncHandler, sendR } from "@/utils/http";

import type { Request } from "express";
import { STATUS_RESPONSE } from "@/config";
import type { User } from "@supabase/supabase-js";
import type { calendar_v3 } from "googleapis";
import { fetchCredentialsByEmail } from "@/utils/auth";
import { initCalendarWithUserTokensAndUpdateTokens } from "@/utils/calendar";

const getAllCalendars = reqResAsyncHandler(async (req, res) => {
  const user = (req as Request & { user: User }).user;
  const tokenData = await fetchCredentialsByEmail(user.email!);
  if (!tokenData) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User credentials not found in order to retrieve all calendars.");
  }
  const calendar = await initCalendarWithUserTokensAndUpdateTokens(tokenData);
  const r = await calendar.calendarList.list({ prettyPrint: true });

  if (req.query.customCalendars === "true") {
    const allCalendars = r.data.items?.map((item: calendar_v3.Schema$CalendarListEntry) => {
      return {
        calendarId: item.id,
        calendarName: item.summary,
        calendarDescription: item.description,
        calendarLocation: item.location,
        calendarColorForEvents: item.colorId,
        accessRole: item.accessRole,
        timeZoneForCalendar: item.timeZone,
        defaultReminders: item.defaultReminders,
      };
    });
    return sendR(res, STATUS_RESPONSE.SUCCESS, "Successfully received all custom calendars", allCalendars);
  } else {
    sendR(res, STATUS_RESPONSE.SUCCESS, "Successfully received all calendars", r);
  }
});

const getAllCalendarColors = reqResAsyncHandler(async (req, res) => {
  const user = (req as Request & { user: User }).user;
  const tokenData = await fetchCredentialsByEmail(user.email!);
  const calendar = await initCalendarWithUserTokensAndUpdateTokens(tokenData);
  const r = await calendar.colors.get();
  sendR(res, STATUS_RESPONSE.SUCCESS, "Successfully received calendar colors", r.data);
});

const getAllCalendarTimezones = reqResAsyncHandler(async (req, res) => {
  const user = (req as Request & { user: User }).user;
  const tokenData = await fetchCredentialsByEmail(user.email!);
  const calendar = await initCalendarWithUserTokensAndUpdateTokens(tokenData);
  const r = await calendar.settings.get({ setting: "timezone" });
  sendR(res, STATUS_RESPONSE.SUCCESS, "Successfully received calendar timezone", r.data);
});

const getCalendarInfoById = reqResAsyncHandler(async (req, res) => {
  const user = (req as Request & { user: User }).user;
  const tokenData = await fetchCredentialsByEmail(user.email!);
  const calendar = await initCalendarWithUserTokensAndUpdateTokens(tokenData);
  const r = await calendar.calendars.get({ calendarId: req.params.calendarId });
  sendR(res, STATUS_RESPONSE.SUCCESS, "Successfully received calendar overview", r.data);
});

const getCalendarColorById = reqResAsyncHandler(async (req, res) => {
  const user = (req as Request & { user: User }).user;
  const tokenData = await fetchCredentialsByEmail(user.email!);
  const calendar = await initCalendarWithUserTokensAndUpdateTokens(tokenData);
  const r = await calendar.calendars.get({ calendarId: req.params.calendarId });
  sendR(res, STATUS_RESPONSE.SUCCESS, "Successfully received calendar color", r.data);
});

const getCalendarTimezoneById = reqResAsyncHandler(async (req, res) => {
  const user = (req as Request & { user: User }).user;
  const tokenData = await fetchCredentialsByEmail(user.email!);
  const calendar = await initCalendarWithUserTokensAndUpdateTokens(tokenData);
  const r = await calendar.settings.get({ setting: "timezone" });
  sendR(res, STATUS_RESPONSE.SUCCESS, "Successfully received calendar timezone", r.data);
});

const getFreeBusy = reqResAsyncHandler(async (req, res) => {
  const user = (req as Request & { user: User }).user;
  const tokenData = await fetchCredentialsByEmail(user.email!);
  const calendar = await initCalendarWithUserTokensAndUpdateTokens(tokenData);
  const r = await calendar.freebusy.query({
    prettyPrint: true,
    requestBody: {
      calendarExpansionMax: 50,
      groupExpansionMax: 100,
      timeMin: new Date().toISOString(),
      timeMax: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    },
  });
  sendR(res, STATUS_RESPONSE.SUCCESS, "Successfully received free busy", r);
});

const getSettingsOfCalendar = reqResAsyncHandler(async (req, res) => {
  const user = (req as Request & { user: User }).user;
  const tokenData = await fetchCredentialsByEmail(user.email!);
  const calendar = await initCalendarWithUserTokensAndUpdateTokens(tokenData);
  const r = await calendar.settings.list({ prettyPrint: true });
  sendR(res, STATUS_RESPONSE.SUCCESS, "Successfully received calendar settings", r);
});

export default {
  getSettingsOfCalendar,
  getFreeBusy,
  getCalendarColorById,
  getCalendarTimezoneById,
  getCalendarInfoById,
  getAllCalendars,
  getAllCalendarColors,
  getAllCalendarTimezones,
};
