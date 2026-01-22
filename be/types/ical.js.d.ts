declare module "ical.js" {
  export function parse(input: string): JCalData
  export type JCalData = [string, JCalProperty[], JCalComponent[]]
  export type JCalProperty = [string, Record<string, string>, string, string]
  export type JCalComponent = [string, JCalProperty[], JCalComponent[]]

  export class Component {
    constructor(jCal: JCalData | string[], parent?: Component)
    getAllSubcomponents(name?: string): Component[]
    getFirstPropertyValue<T = unknown>(name: string): T | null
    name: string
    jCal: JCalData
  }

  export class Event {
    constructor(component: Component, options?: { strictExceptions?: boolean })
    component: Component
    summary: string
    description: string
    location: string
    startDate: Time
    endDate: Time | null
    attendees: Property[]
    organizer: string
    uid: string
  }

  export class Property {
    constructor(jCal: JCalProperty | string, parent?: Component)
    getFirstValue<T = unknown>(): T | null
    name: string
    jCal: JCalProperty
  }

  export class Time {
    constructor(data?: {
      year?: number
      month?: number
      day?: number
      hour?: number
      minute?: number
      second?: number
      isDate?: boolean
    })
    toJSDate(): Date
    isDate: boolean
    year: number
    month: number
    day: number
    hour: number
    minute: number
    second: number
    zone: Timezone | null
    toString(): string
  }

  export class Timezone {
    constructor(data: Component | { tzid: string })
    tzid: string
    toString(): string
  }

  export class Recur {
    constructor(data?: Record<string, unknown>)
    toString(): string
    freq: string
    interval: number
    count?: number
    until?: Time
  }
}
