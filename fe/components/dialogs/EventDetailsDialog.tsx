"use client";

import React from "react";
import { X, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import type { EventDetailsDialogProps } from "@/types/analytics";
import type { CalendarEvent } from "@/types/api";

const EventDetailsDialog: React.FC<EventDetailsDialogProps> = ({ isOpen, event, calendarColor, calendarName, onClose }) => {
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-zinc-50 dark:bg-zinc-900 rounded-lg shadow-xl max-w-2xl w-full relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ borderTop: `4px solid ${calendarColor}` }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: calendarColor, opacity: 0.2 }}>
                <CalendarDays className="w-5 h-5" style={{ color: calendarColor }} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{event.summary || "No Title"}</h3>
                {calendarName && (
                  <span
                    className="text-xs font-bold px-2 py-1 rounded border inline-block mt-1"
                    style={{
                      color: calendarColor,
                      borderColor: calendarColor,
                      backgroundColor: `${calendarColor}15`,
                    }}
                  >
                    {calendarName}
                  </span>
                )}
              </div>
            </div>
            {event.status && (
              <div className="mb-4">
                <span
                  className="text-xs font-bold px-2 py-1 rounded"
                  style={{
                    color: event.status === "confirmed" ? "#10b981" : event.status === "tentative" ? "#f59e0b" : "#ef4444",
                    backgroundColor: event.status === "confirmed" ? "#10b98120" : event.status === "tentative" ? "#f59e0b20" : "#ef444420",
                  }}
                >
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {event.description && (
              <div>
                <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Description</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            {event.location && (
              <div>
                <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Location</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{event.location}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Start</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {event.start.dateTime ? format(new Date(event.start.dateTime), "PPpp") : event.start.date ? format(new Date(event.start.date), "PPP") : "N/A"}
                </p>
                {event.start.timeZone && <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Timezone: {event.start.timeZone}</p>}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">End</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {event.end.dateTime ? format(new Date(event.end.dateTime), "PPpp") : event.end.date ? format(new Date(event.end.date), "PPP") : "N/A"}
                </p>
                {event.end.timeZone && <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Timezone: {event.end.timeZone}</p>}
              </div>
            </div>

            {event.organizer && (
              <div>
                <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Organizer</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{event.organizer.email || "N/A"}</p>
              </div>
            )}

            {event.creator && (
              <div>
                <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Creator</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{event.creator.email || "N/A"}</p>
              </div>
            )}

            {event.attendees && event.attendees.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Attendees ({event.attendees.length})</h4>
                <ul className="space-y-1">
                  {event.attendees.map((attendee, idx) => (
                    <li key={idx} className="text-sm text-zinc-600 dark:text-zinc-400">
                      {attendee.email}
                      {attendee.responseStatus && <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-500">({attendee.responseStatus})</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {event.htmlLink && (
              <div>
                <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Event Link</h4>
                <a
                  href={event.htmlLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline"
                  style={{ color: calendarColor }}
                >
                  Open in Google Calendar
                </a>
              </div>
            )}

            {event.created && (
              <div>
                <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Created</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{format(new Date(event.created), "PPpp")}</p>
              </div>
            )}

            {event.updated && (
              <div>
                <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Last Updated</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{format(new Date(event.updated), "PPpp")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsDialog;
