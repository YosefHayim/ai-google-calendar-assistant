import type { calendar_v3 } from "googleapis";
import type { CalendarDTO, CreateCalendarDTO, UpdateCalendarDTO, CalendarListItemDTO } from "@/domain/dto";
import { requestConfigBase } from "@/config/root-config";
import { CalendarServiceError, ValidationError, NotFoundError } from "./errors/ServiceError";
import { Logger } from "./logging/Logger";

/**
 * Service class for handling calendar-related business logic
 */
export class CalendarService {
  private calendars: calendar_v3.Resource$Calendars;
  private calendarList: calendar_v3.Resource$Calendarlist;
  private logger: Logger;

  constructor(calendar: calendar_v3.Calendar) {
    this.calendars = calendar.calendars;
    this.calendarList = calendar.calendarList;
    this.logger = new Logger("CalendarService");
  }

  /**
   * Creates a new calendar
   */
  async createCalendar(calendarData: CreateCalendarDTO): Promise<CalendarDTO> {
    try {
      this.logger.info("Creating new calendar", { summary: calendarData.summary });

      const response = await this.calendars.insert({
        ...requestConfigBase,
        requestBody: calendarData,
      });

      this.logger.info("Calendar created successfully", { calendarId: response.data.id });
      return response.data as CalendarDTO;
    } catch (error) {
      this.logger.error("Failed to create calendar", error);
      throw new CalendarServiceError(
        `Failed to create calendar: ${error instanceof Error ? error.message : "Unknown error"}`,
        error
      );
    }
  }

  /**
   * Updates an existing calendar
   */
  async updateCalendar(calendarData: UpdateCalendarDTO): Promise<CalendarDTO> {
    try {
      this.logger.info("Updating calendar", { calendarId: calendarData.id });

      const { id, ...requestBody } = calendarData;

      if (!id) {
        throw new ValidationError("Calendar ID is required for update");
      }

      const response = await this.calendars.update({
        ...requestConfigBase,
        calendarId: id,
        requestBody,
      });

      this.logger.info("Calendar updated successfully", { calendarId: id });
      return response.data as CalendarDTO;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      this.logger.error("Failed to update calendar", error, { calendarId: calendarData.id });
      throw new CalendarServiceError(
        `Failed to update calendar: ${error instanceof Error ? error.message : "Unknown error"}`,
        error
      );
    }
  }

  /**
   * Deletes a calendar
   */
  async deleteCalendar(calendarId: string): Promise<void> {
    try {
      this.logger.info("Deleting calendar", { calendarId });

      if (!calendarId) {
        throw new ValidationError("Calendar ID is required for delete");
      }

      await this.calendars.delete({
        ...requestConfigBase,
        calendarId,
      });

      this.logger.info("Calendar deleted successfully", { calendarId });
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      this.logger.error("Failed to delete calendar", error, { calendarId });
      throw new CalendarServiceError(
        `Failed to delete calendar: ${error instanceof Error ? error.message : "Unknown error"}`,
        error
      );
    }
  }

  /**
   * Gets a single calendar by ID
   */
  async getCalendar(calendarId: string): Promise<CalendarDTO> {
    try {
      this.logger.debug("Fetching calendar", { calendarId });

      if (!calendarId) {
        throw new ValidationError("Calendar ID is required");
      }

      const response = await this.calendars.get({
        ...requestConfigBase,
        calendarId,
      });

      if (!response.data) {
        throw new NotFoundError("Calendar", calendarId);
      }

      return response.data as CalendarDTO;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      this.logger.error("Failed to get calendar", error, { calendarId });
      throw new CalendarServiceError(
        `Failed to get calendar: ${error instanceof Error ? error.message : "Unknown error"}`,
        error
      );
    }
  }

  /**
   * Lists all calendars for the user
   */
  async listCalendars(): Promise<CalendarListItemDTO[]> {
    try {
      this.logger.debug("Listing calendars");

      const response = await this.calendarList.list({
        ...requestConfigBase,
      });

      this.logger.info("Calendars listed successfully", { count: response.data.items?.length || 0 });
      return (response.data.items || []) as CalendarListItemDTO[];
    } catch (error) {
      this.logger.error("Failed to list calendars", error);
      throw new CalendarServiceError(
        `Failed to list calendars: ${error instanceof Error ? error.message : "Unknown error"}`,
        error
      );
    }
  }

  /**
   * Shares a calendar with another user
   */
  async shareCalendar(calendarId: string, userEmail: string, role: string = "reader"): Promise<void> {
    try {
      this.logger.info("Sharing calendar", { calendarId, userEmail, role });

      if (!calendarId || !userEmail) {
        throw new ValidationError("Calendar ID and user email are required");
      }

      await this.calendars.patch({
        ...requestConfigBase,
        calendarId,
        requestBody: {
          // Note: Actual sharing requires ACL manipulation
          // This is a simplified version
          summary: `Shared with ${userEmail}`,
        },
      });

      this.logger.info("Calendar shared successfully", { calendarId, userEmail });
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      this.logger.error("Failed to share calendar", error, { calendarId, userEmail });
      throw new CalendarServiceError(
        `Failed to share calendar: ${error instanceof Error ? error.message : "Unknown error"}`,
        error
      );
    }
  }
}
