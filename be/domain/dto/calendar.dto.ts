/**
 * Data Transfer Object for Calendar
 */
export interface CalendarDTO {
  id?: string;
  summary: string;
  description?: string;
  timeZone?: string;
  location?: string;
}

/**
 * DTO for creating a new calendar
 */
export interface CreateCalendarDTO {
  summary: string;
  description?: string;
  timeZone?: string;
  location?: string;
}

/**
 * DTO for updating a calendar
 */
export interface UpdateCalendarDTO extends Partial<CreateCalendarDTO> {
  id: string;
}

/**
 * DTO for calendar list item
 */
export interface CalendarListItemDTO {
  id: string;
  summary: string;
  description?: string;
  timeZone?: string;
  accessRole?: string;
  primary?: boolean;
  backgroundColor?: string;
  foregroundColor?: string;
}
