import type { calendar_v3 } from "googleapis";
import type { CreateEventDTO, UpdateEventDTO, EventDTO, CustomEventDTO } from "@/domain/dto";
import { transformEvent } from "@/utils/events/transformEvent";
import { requestConfigBase } from "@/config/root-config";
import { EventServiceError, ValidationError, NotFoundError } from "./errors/ServiceError";
import { Logger } from "./logging/Logger";

/**
 * Service class for handling event-related business logic
 */
export class EventService {
  private calendarEvents: calendar_v3.Resource$Events;
  private logger: Logger;

  constructor(calendarEvents: calendar_v3.Resource$Events) {
    this.calendarEvents = calendarEvents;
    this.logger = new Logger("EventService");
  }

  /**
   * Creates a new event
   */
  async createEvent(eventData: CreateEventDTO): Promise<EventDTO> {
    try {
      this.logger.info("Creating new event", { summary: eventData.summary });

      const calendarId = eventData.calendarId || "primary";
      const { calendarId: _cid, ...requestBody } = eventData;

      const response = await this.calendarEvents.insert({
        ...requestConfigBase,
        calendarId,
        requestBody,
      });

      this.logger.info("Event created successfully", { eventId: response.data.id });
      return response.data as EventDTO;
    } catch (error) {
      this.logger.error("Failed to create event", error);
      throw new EventServiceError(
        `Failed to create event: ${error instanceof Error ? error.message : "Unknown error"}`,
        error
      );
    }
  }

  /**
   * Updates an existing event
   */
  async updateEvent(eventData: UpdateEventDTO): Promise<EventDTO> {
    try {
      this.logger.info("Updating event", { eventId: eventData.id });

      const calendarId = eventData.calendarId || "primary";
      const { id, calendarId: _cid, ...requestBody } = eventData;

      if (!id) {
        throw new ValidationError("Event ID is required for update");
      }

      const response = await this.calendarEvents.update({
        ...requestConfigBase,
        calendarId,
        eventId: id,
        requestBody,
      });

      this.logger.info("Event updated successfully", { eventId: id });
      return response.data as EventDTO;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      this.logger.error("Failed to update event", error, { eventId: eventData.id });
      throw new EventServiceError(
        `Failed to update event: ${error instanceof Error ? error.message : "Unknown error"}`,
        error
      );
    }
  }

  /**
   * Deletes an event
   */
  async deleteEvent(eventId: string, calendarId: string = "primary"): Promise<void> {
    try {
      this.logger.info("Deleting event", { eventId, calendarId });

      if (!eventId) {
        throw new ValidationError("Event ID is required for delete");
      }

      await this.calendarEvents.delete({
        ...requestConfigBase,
        calendarId,
        eventId,
      });

      this.logger.info("Event deleted successfully", { eventId });
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      this.logger.error("Failed to delete event", error, { eventId });
      throw new EventServiceError(
        `Failed to delete event: ${error instanceof Error ? error.message : "Unknown error"}`,
        error
      );
    }
  }

  /**
   * Gets a single event by ID
   */
  async getEvent(eventId: string, calendarId: string = "primary"): Promise<EventDTO> {
    try {
      this.logger.debug("Fetching event", { eventId, calendarId });

      if (!eventId) {
        throw new ValidationError("Event ID is required");
      }

      const response = await this.calendarEvents.get({
        ...requestConfigBase,
        calendarId,
        eventId,
      });

      if (!response.data) {
        throw new NotFoundError("Event", eventId);
      }

      return response.data as EventDTO;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      this.logger.error("Failed to get event", error, { eventId });
      throw new EventServiceError(
        `Failed to get event: ${error instanceof Error ? error.message : "Unknown error"}`,
        error
      );
    }
  }

  /**
   * Lists events with optional filters
   */
  async listEvents(
    params: calendar_v3.Params$Resource$Events$List
  ): Promise<calendar_v3.Schema$Events> {
    try {
      this.logger.debug("Listing events", { calendarId: params.calendarId });

      const response = await this.calendarEvents.list({
        ...requestConfigBase,
        ...params,
      });

      this.logger.info("Events listed successfully", { count: response.data.items?.length || 0 });
      return response.data;
    } catch (error) {
      this.logger.error("Failed to list events", error);
      throw new EventServiceError(
        `Failed to list events: ${error instanceof Error ? error.message : "Unknown error"}`,
        error
      );
    }
  }

  /**
   * Transforms raw events to custom format
   */
  transformToCustomFormat(events: calendar_v3.Schema$Event[]): CustomEventDTO[] {
    return events.map(transformEvent);
  }
}
