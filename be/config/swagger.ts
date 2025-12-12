import * as swaggerJsdoc from "swagger-jsdoc";
import { CONFIG } from "./root-config";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AI Google Calendar Assistant API",
      version: "1.1.0",
      description: "API documentation for AI Google Calendar Assistant backend",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: CONFIG.baseUrl,
        description: "Development server",
      },
      {
        url: "https://api.production.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "sb-access-token",
          description: "Supabase authentication cookie",
        },
      },
      schemas: {
        ApiResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              enum: ["success", "error"],
              description: "Response status",
            },
            message: {
              type: "string",
              description: "Response message",
            },
            data: {
              description: "Response data",
            },
          },
          required: ["status", "message"],
        },
        ErrorResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              enum: ["error"],
            },
            message: {
              type: "string",
            },
            data: {
              type: "object",
              properties: {
                error: {
                  description: "Error details",
                },
              },
            },
          },
        },
        CalendarInfo: {
          type: "object",
          properties: {
            calendarName: {
              type: "string",
              nullable: true,
            },
            calendarId: {
              type: "string",
              nullable: true,
            },
            calendarColorForEvents: {
              type: "string",
              nullable: true,
            },
            accessRole: {
              type: "string",
              nullable: true,
            },
            timeZoneForCalendar: {
              type: "string",
              nullable: true,
            },
            defaultReminders: {
              type: "array",
              items: {
                $ref: "#/components/schemas/EventReminder",
              },
            },
          },
        },
        EventDateTime: {
          type: "object",
          properties: {
            date: {
              type: "string",
              format: "date",
              description: "ISO date string (YYYY-MM-DD)",
            },
            dateTime: {
              type: "string",
              format: "date-time",
              description: "ISO datetime string",
            },
            timeZone: {
              type: "string",
            },
          },
        },
        EventReminder: {
          type: "object",
          properties: {
            method: {
              type: "string",
              enum: ["email", "popup"],
            },
            minutes: {
              type: "number",
            },
          },
        },
        EventParameters: {
          type: "object",
          properties: {
            summary: {
              type: "string",
              nullable: true,
            },
            description: {
              type: "string",
              nullable: true,
            },
            start: {
              $ref: "#/components/schemas/EventDateTime",
            },
            end: {
              $ref: "#/components/schemas/EventDateTime",
            },
            location: {
              type: "string",
              nullable: true,
            },
            calendarId: {
              type: "string",
              nullable: true,
            },
            email: {
              type: "string",
              nullable: true,
            },
          },
        },
        CalendarEvent: {
          type: "object",
          properties: {
            id: {
              type: "string",
            },
            summary: {
              type: "string",
              nullable: true,
            },
            description: {
              type: "string",
              nullable: true,
            },
            start: {
              $ref: "#/components/schemas/EventDateTime",
            },
            end: {
              $ref: "#/components/schemas/EventDateTime",
            },
            location: {
              type: "string",
              nullable: true,
            },
            status: {
              type: "string",
              enum: ["confirmed", "tentative", "cancelled"],
            },
            htmlLink: {
              type: "string",
              nullable: true,
            },
            created: {
              type: "string",
              format: "date-time",
            },
            updated: {
              type: "string",
              format: "date-time",
            },
          },
        },
        CalendarColors: {
          type: "object",
          properties: {
            calendar: {
              type: "object",
              additionalProperties: {
                type: "object",
                properties: {
                  background: {
                    type: "string",
                  },
                  foreground: {
                    type: "string",
                  },
                },
              },
            },
            event: {
              type: "object",
              additionalProperties: {
                type: "object",
                properties: {
                  background: {
                    type: "string",
                  },
                  foreground: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
        CalendarTimezone: {
          type: "object",
          properties: {
            value: {
              type: "string",
            },
            kind: {
              type: "string",
            },
            etag: {
              type: "string",
            },
          },
        },
        CalendarOverview: {
          type: "object",
          properties: {
            id: {
              type: "string",
            },
            summary: {
              type: "string",
            },
            description: {
              type: "string",
            },
            timeZone: {
              type: "string",
            },
            location: {
              type: "string",
            },
          },
        },
        UserInfo: {
          type: "object",
          properties: {
            id: {
              type: "string",
            },
            email: {
              type: "string",
            },
            user_metadata: {
              type: "object",
              additionalProperties: true,
            },
            app_metadata: {
              type: "object",
              additionalProperties: true,
            },
          },
        },
        SignUpRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
            },
            password: {
              type: "string",
              minLength: 6,
            },
          },
        },
        SignInRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
            },
            password: {
              type: "string",
            },
          },
        },
        VerifyEmailOtpRequest: {
          type: "object",
          required: ["email", "token"],
          properties: {
            email: {
              type: "string",
              format: "email",
            },
            token: {
              type: "string",
            },
          },
        },
        DeactivateUserRequest: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              format: "email",
            },
          },
        },
        QueryAgentRequest: {
          type: "object",
          required: ["query"],
          properties: {
            query: {
              type: "string",
              description: "The query text to send to the agent",
            },
          },
        },
        QueryAgentResponse: {
          type: "object",
          properties: {
            response: {
              type: "string",
              description: "The agent's response",
            },
          },
        },
        QueryAgentWithAudioResponse: {
          type: "object",
          properties: {
            response: {
              type: "string",
              description: "The agent's response",
            },
            transcribedText: {
              type: "string",
              description: "The transcribed text from the audio",
            },
          },
        },
        EventQueryParams: {
          type: "object",
          properties: {
            calendarId: {
              type: "string",
            },
            timeMin: {
              type: "string",
              format: "date-time",
            },
            timeMax: {
              type: "string",
              format: "date-time",
            },
            maxResults: {
              type: "number",
            },
            singleEvents: {
              type: "boolean",
            },
            orderBy: {
              type: "string",
              enum: ["startTime", "updated"],
            },
            q: {
              type: "string",
              description: "Search query",
            },
            showDeleted: {
              type: "boolean",
            },
          },
        },
      },
    },
    security: [
      {
        cookieAuth: [],
      },
    ],
  },
  apis: ["./routes/*.ts", "./controllers/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
