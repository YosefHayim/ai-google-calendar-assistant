// import { SUPABASE } from "@/config/clients";
// import { Tables } from "@/database.types";
// import { asyncHandler } from "../http/async-handlers";
// import { calendar_v3 } from "googleapis";

// type Calendar = Tables<"user_calendars">["calendars"];

// export const updateUserSupabaseCalendarCategories = asyncHandler(
//   async (calendar: calendar_v3.Calendar, email: string, userId: string): Promise<void> => {

//     const calendars = calendar.calendarList.list({ prettyPrint: true }).data.items?.map((calendar: calendar_v3.Schema$CalendarListEntry) => {
//       return {
//         calendar_id: calendar.id,
//         calendar_name: calendar.summary,
//         access_role: calendar.accessRole,
//         time_zone_of_calendar: calendar.timeZone,
//         email: email,
//         user_id: userId,
//       };
//     });
//     const { error } = await SUPABASE.from("calendar_categories").upsert(calendars, {
//       onConflict: "calendar_id",
//     });
//     if (error) {
//       throw error;
//     }
//   }
// );
