export type { HandlerContext } from "@/shared/types"

export {
  getEventHandler,
  insertEventHandler,
  updateEventHandler,
  deleteEventHandler,
} from "./event-handlers"

export {
  validateUserHandler,
  getTimezoneHandler,
  selectCalendarHandler,
  checkConflictsHandler,
  preCreateValidationHandler,
  getCalendarCategoriesByEmail,
} from "./direct-handlers"
export type {
  ValidateUserResult,
  TimezoneResult,
  SelectCalendarResult,
  ConflictCheckResult,
  PreCreateValidationResult,
  UserCalendar,
} from "./direct-handlers"

export {
  analyzeGapsHandler,
  fillGapHandler,
  formatGapsHandler,
} from "./gap-handlers"
export type {
  GapCandidateDTO,
  AnalyzeGapsResult,
  FillGapResult,
  FormatGapsResult,
} from "./gap-handlers"
