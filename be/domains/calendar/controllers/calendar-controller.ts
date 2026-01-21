import type { Request, Response } from "express";
import { reqResAsyncHandler, sendR } from "@/lib/http";

import { STATUS_RESPONSE } from "@/config";
import type { calendar_v3 } from "googleapis";
import { updateUserSupabaseCalendarCategories } from "@/domains/calendar/utils/update-categories";

const getAllCalendars = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const calendar = req.calendar!;
    const r = await calendar.calendarList.list({ prettyPrint: true });

    if (req.query.customCalendars === "true") {
      const allCalendars = r.data.items?.map(
        (cal: calendar_v3.Schema$CalendarListEntry) => ({
          calendarId: cal.id,
          calendarName: cal.summary,
          calendarDescription: cal.description,
          calendarLocation: cal.location,
          calendarColorForEvents: cal.colorId,
          accessRole: cal.accessRole,
          timeZoneForCalendar: cal.timeZone,
          defaultReminders: cal.defaultReminders,
        })
      );

      await updateUserSupabaseCalendarCategories(
        calendar,
        req.user?.email!,
        req.user!.id!
      );

      return sendR(
        res,
        STATUS_RESPONSE.SUCCESS,
        "Successfully received all custom calendars",
        allCalendars
      );
    }

    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Successfully received all calendars",
      r
    );
  }
);

const getAllCalendarColors = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    if (!req.calendar) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Calendar not available");
    }
    const r = await req.calendar.colors.get({ alt: "json" });
    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Successfully received calendar colors",
      r.data
    );
  }
);

const getAllCalendarTimezones = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    if (!req.calendar) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Calendar not available");
    }
    const r = await req.calendar.settings.get({ setting: "timezone" });
    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Successfully received calendar timezone",
      r.data
    );
  }
);

const getCalendarInfoById = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    if (!req.calendar) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Calendar not available");
    }
    const r = await req.calendar.calendars.get({
      calendarId: (req.params.id as string) ?? "primary",
    });
    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Successfully received calendar overview",
      r.data
    );
  }
);

const getCalendarColorById = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    if (!req.calendar) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Calendar not available");
    }
    const r = await req.calendar.calendars.get({
      calendarId: req.params.id as string,
    });
    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Successfully received calendar color",
      r.data
    );
  }
);

const getCalendarTimezoneById = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    if (!req.calendar) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Calendar not available");
    }
    const r = await req.calendar.settings.get({ setting: "timezone" });
    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Successfully received calendar timezone",
      r.data
    );
  }
);

const getFreeBusy = reqResAsyncHandler(async (req: Request, res: Response) => {
  if (!req.calendar) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Calendar not available");
  }
  const r = await req.calendar.freebusy.query({
    prettyPrint: true,
    requestBody: {
      calendarExpansionMax: 50,
      groupExpansionMax: 100,
      timeMin: new Date().toISOString(),
      timeMax: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    },
  });
  return sendR(
    res,
    STATUS_RESPONSE.SUCCESS,
    "Successfully received free busy",
    r
  );
});

const getSettingsOfCalendar = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    if (!req.calendar) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Calendar not available");
    }
    const r = await req.calendar.settings.get({ setting: "timezone" });
    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Successfully received calendar settings",
      r.data
    );
  }
);

const getSettingsOfCalendarById = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    if (!req.calendar) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Calendar not available");
    }
    const r = await req.calendar.settings.get({ setting: "timezone" });
    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Successfully received calendar settings",
      r.data
    );
  }
);

const clearAllEventsOfCalendar = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    if (!req.calendar) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Calendar not available");
    }
    const r = await req.calendar.calendars.clear({
      calendarId: req.params.id as string,
    });
    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      `Successfully cleared all events of calendar ${req.params.calendarId}`,
      r.data
    );
  }
);

const createCalendar = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    if (!req.calendar) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Calendar not available");
    }
    const r = await req.calendar.calendars.insert({
      requestBody: {
        summary: req.body.summary,
        description: req.body.description,
        location: req.body.location,
        timeZone: req.body.timeZone,
      },
    });

    return sendR(
      res,
      STATUS_RESPONSE.CREATED,
      "Calendar created successfully",
      r.data
    );
  }
);

const deleteCalendar = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    if (!req.calendar) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Calendar not available");
    }
    await req.calendar.calendars.delete({
      calendarId: req.params.id as string,
    });
    return sendR(res, STATUS_RESPONSE.SUCCESS, "Calendar deleted successfully");
  }
);

const patchCalendar = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    if (!req.calendar) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Calendar not available");
    }
    const r = await req.calendar.calendars.patch({
      calendarId: req.params.id as string,
      requestBody: req.body,
    });

    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Calendar patched successfully",
      r.data
    );
  }
);

const updateCalendar = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    if (!req.calendar) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Calendar not available");
    }
    const r = await req.calendar.calendars.update({
      calendarId: req.params.id as string,
      requestBody: req.body,
    });

    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Calendar updated successfully",
      r.data
    );
  }
);

const listAllSettings = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    if (!req.calendar) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Calendar not available");
    }
    const r = await req.calendar.settings.list();
    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Successfully retrieved all settings",
      r.data
    );
  }
);

const getDryCalendarInfo = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const tokenData = req.tokenData!;
    const expiryMs = tokenData.expiry_date!;
    const expiryDate = new Date(expiryMs).toISOString();

    const now = Date.now();
    const diffMs = expiryMs - now;
    const minutesLeft = Math.floor(diffMs / 1000 / 60);

    sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Successfully retrieved dry calendar info",
      {
        expiryDate,
        isExpired: diffMs < 0,
        expiresIn: diffMs > 0 ? `${minutesLeft} minutes` : "Expired",
        debugExpiresInSeconds: Math.floor(diffMs / 1000),
      }
    );
  }
);

export default {
  clearAllEventsOfCalendar,
  getSettingsOfCalendarById,
  getSettingsOfCalendar,
  getFreeBusy,
  getCalendarColorById,
  getCalendarTimezoneById,
  getCalendarInfoById,
  getAllCalendars,
  getAllCalendarColors,
  getAllCalendarTimezones,
  createCalendar,
  deleteCalendar,
  patchCalendar,
  updateCalendar,
  listAllSettings,
  getDryCalendarInfo,
};
