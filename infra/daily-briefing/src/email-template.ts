import type { calendar_v3 } from 'googleapis';

interface FormattedEvent {
  summary: string;
  startTime: string;
  endTime: string;
  duration: string;
  location?: string;
  meetingLink?: string;
  isAllDay: boolean;
}

const APP_URL = process.env.APP_URL || 'https://ally.sh';

/**
 * Format time in user's timezone
 */
function formatTime(dateTimeStr: string | undefined, timezone: string): string {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  });
}

/**
 * Calculate duration between two times
 */
function calculateDuration(start: string | undefined, end: string | undefined): string {
  if (!start || !end) return '';
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffMins = Math.round(diffMs / (1000 * 60));

  if (diffMins < 60) {
    return `${diffMins}min`;
  }

  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Extract meeting link from event
 */
function extractMeetingLink(event: calendar_v3.Schema$Event): string | undefined {
  // Check hangoutLink first
  if (event.hangoutLink) {
    return event.hangoutLink;
  }

  // Check conference data
  if (event.conferenceData?.entryPoints) {
    const videoEntry = event.conferenceData.entryPoints.find(
      (e) => e.entryPointType === 'video',
    );
    if (videoEntry?.uri) {
      return videoEntry.uri;
    }
  }

  // Check description for Zoom/Teams links
  const description = event.description || '';
  const zoomMatch = description.match(/https:\/\/[^\s]*zoom\.us\/j\/[^\s]*/i);
  if (zoomMatch) return zoomMatch[0];

  const teamsMatch = description.match(/https:\/\/teams\.microsoft\.com\/[^\s]*/i);
  if (teamsMatch) return teamsMatch[0];

  return undefined;
}

/**
 * Format events for display
 */
function formatEvents(events: calendar_v3.Schema$Event[], timezone: string): FormattedEvent[] {
  return events
    .filter((e) => e.status !== 'cancelled')
    .map((event) => {
      const isAllDay = !event.start?.dateTime;

      return {
        summary: event.summary || 'Untitled Event',
        startTime: isAllDay ? 'All day' : formatTime(event.start?.dateTime, timezone),
        endTime: isAllDay ? '' : formatTime(event.end?.dateTime, timezone),
        duration: isAllDay ? '' : calculateDuration(event.start?.dateTime, event.end?.dateTime),
        location: event.location,
        meetingLink: extractMeetingLink(event),
        isAllDay,
      };
    });
}

/**
 * Calculate summary statistics
 */
function calculateSummary(events: calendar_v3.Schema$Event[]): { eventCount: number; totalMinutes: number } {
  let totalMinutes = 0;

  for (const event of events) {
    if (event.start?.dateTime && event.end?.dateTime) {
      const start = new Date(event.start.dateTime);
      const end = new Date(event.end.dateTime);
      totalMinutes += (end.getTime() - start.getTime()) / (1000 * 60);
    }
  }

  return {
    eventCount: events.filter((e) => e.status !== 'cancelled').length,
    totalMinutes,
  };
}

/**
 * Format total time for display
 */
function formatTotalTime(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} minutes`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (mins === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }

  return `${hours}h ${mins}m`;
}

/**
 * Build HTML email
 */
export function buildBriefingEmailHtml(
  events: calendar_v3.Schema$Event[],
  timezone: string,
  date: string,
  firstName?: string,
): string {
  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: timezone,
  });

  const formattedEvents = formatEvents(events, timezone);
  const { eventCount, totalMinutes } = calculateSummary(events);
  const greeting = firstName ? `Good morning, ${firstName}!` : 'Good morning!';

  const eventsHtml = formattedEvents.length > 0
    ? formattedEvents.map((event) => `
        <div style="border-left: 4px solid #6366f1; padding: 12px 16px; margin: 12px 0; background: #f8fafc; border-radius: 0 8px 8px 0;">
          <div style="font-weight: 600; color: #1e293b; font-size: 14px;">
            ${event.isAllDay ? 'All day' : `${event.startTime} - ${event.endTime}`}
            ${event.duration ? `<span style="color: #64748b; font-weight: normal; font-size: 13px;"> (${event.duration})</span>` : ''}
          </div>
          <div style="font-size: 16px; color: #1e293b; margin: 4px 0;">${escapeHtml(event.summary)}</div>
          ${event.location ? `<div style="color: #64748b; font-size: 13px; margin-top: 4px;">📍 ${escapeHtml(event.location)}</div>` : ''}
          ${event.meetingLink ? `<a href="${event.meetingLink}" style="display: inline-block; margin-top: 8px; padding: 6px 12px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-size: 13px;">Join Meeting</a>` : ''}
        </div>
      `).join('')
    : `
        <div style="text-align: center; padding: 40px 20px; background: #f0fdf4; border-radius: 12px; margin: 20px 0;">
          <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
          <div style="font-size: 18px; color: #166534; font-weight: 600;">No events scheduled for today!</div>
          <div style="font-size: 14px; color: #15803d; margin-top: 8px;">Enjoy your free day.</div>
        </div>
      `;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Daily Schedule</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f1f5f9;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px 24px; border-radius: 16px 16px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0 0 8px 0; font-size: 24px; font-weight: 600;">${greeting}</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">Here's your schedule for ${formattedDate}</p>
    </div>

    <!-- Content -->
    <div style="background: white; padding: 24px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      ${eventCount > 0 ? `
        <!-- Summary -->
        <div style="background: #f0f4ff; padding: 16px; border-radius: 12px; margin-bottom: 20px;">
          <p style="margin: 0; color: #3730a3; font-size: 15px;">
            <strong>${eventCount} event${eventCount > 1 ? 's' : ''}</strong> · ${formatTotalTime(totalMinutes)} of scheduled time
          </p>
        </div>
      ` : ''}

      <!-- Events -->
      ${eventsHtml}

      <!-- Footer -->
      <div style="text-align: center; padding-top: 24px; margin-top: 24px; border-top: 1px solid #e2e8f0;">
        <p style="color: #64748b; font-size: 13px; margin: 0 0 12px 0;">
          Sent by <a href="${APP_URL}" style="color: #6366f1; text-decoration: none;">Ally</a>, your AI Calendar Assistant
        </p>
        <a href="${APP_URL}/settings" style="color: #64748b; font-size: 12px;">Manage email preferences</a>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Build plain text email
 */
export function buildBriefingEmailText(
  events: calendar_v3.Schema$Event[],
  timezone: string,
  date: string,
  firstName?: string,
): string {
  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: timezone,
  });

  const formattedEvents = formatEvents(events, timezone);
  const { eventCount, totalMinutes } = calculateSummary(events);
  const greeting = firstName ? `Good morning, ${firstName}!` : 'Good morning!';

  let text = `${greeting}\n\nHere's your schedule for ${formattedDate}\n\n`;

  if (eventCount > 0) {
    text += `${eventCount} event${eventCount > 1 ? 's' : ''} · ${formatTotalTime(totalMinutes)} of scheduled time\n\n`;
    text += '─'.repeat(40) + '\n\n';

    for (const event of formattedEvents) {
      text += `${event.isAllDay ? 'All day' : `${event.startTime} - ${event.endTime}`}`;
      if (event.duration) text += ` (${event.duration})`;
      text += '\n';
      text += `${event.summary}\n`;
      if (event.location) text += `📍 ${event.location}\n`;
      if (event.meetingLink) text += `🔗 ${event.meetingLink}\n`;
      text += '\n';
    }
  } else {
    text += '🎉 No events scheduled for today!\n\nEnjoy your free day.\n\n';
  }

  text += '─'.repeat(40) + '\n\n';
  text += `Sent by Ally, your AI Calendar Assistant\n`;
  text += `Manage preferences: ${APP_URL}/settings\n`;

  return text;
}

/**
 * Escape HTML characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
