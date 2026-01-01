export enum STATUS_RESPONSE {
  SUCCESS = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  NO_CONTENT = 204,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

export enum ROUTES {
  USERS = "/api/users",
  CALENDAR = "/api/calendars",
  CALENDAR_LIST = "/api/calendars/list",
  EVENTS = "/api/events",
  ACL = "/api/acl",
  CHANNELS = "/api/channels",
  TELEGRAM_USERS = "/api/telegram-users",
  WHATSAPP = "/api/whatsapp",
}

export enum PROVIDERS {
  GOOGLE = "google",
  GITHUB = "github",
  LINKEDIN = "linkedin",
}

export enum ACTION {
  GET = "get",
  INSERT = "insert",
  PATCH = "patch",
  UPDATE = "update",
  DELETE = "delete",
}
