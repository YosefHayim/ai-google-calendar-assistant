import { parseISO, formatISO } from "date-fns"

export const isoToMs = (isoString: string | null | undefined): number | null => {
  if (!isoString) {
    return null
  }
  return parseISO(isoString).getTime()
}

export const msToIso = (ms: number): string => formatISO(new Date(ms))

export const nowIso = (): string => formatISO(new Date())

export const nowMs = (): number => Date.now()
