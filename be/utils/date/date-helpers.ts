import { startOfDay, isToday as dateFnsIsToday, parseISO } from "date-fns"

export const getStartOfDay = (date: Date = new Date()): Date => startOfDay(date)

export const isToday = (dateString: string): boolean => dateFnsIsToday(parseISO(dateString))
