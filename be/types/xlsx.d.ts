declare module "xlsx" {
  export interface WorkBook {
    SheetNames: string[]
    Sheets: { [name: string]: WorkSheet }
  }

  export interface WorkSheet {
    [cell: string]: CellObject | unknown
  }

  export interface CellObject {
    t: string
    v: unknown
    w?: string
    f?: string
    r?: string
    h?: string
    c?: Comment[]
    z?: string
    l?: Hyperlink
    s?: CellStyle
  }

  export interface Comment {
    a?: string
    t?: string
  }

  export interface Hyperlink {
    Target: string
  }

  export interface CellStyle {
    font?: FontStyle
    fill?: FillStyle
    border?: BorderStyle
    alignment?: AlignmentStyle
  }

  export interface FontStyle {
    bold?: boolean
    italic?: boolean
    underline?: boolean
    color?: { rgb?: string }
  }

  export interface FillStyle {
    fgColor?: { rgb?: string }
  }

  export interface BorderStyle {
    top?: { style?: string }
    bottom?: { style?: string }
    left?: { style?: string }
    right?: { style?: string }
  }

  export interface AlignmentStyle {
    horizontal?: string
    vertical?: string
    wrapText?: boolean
  }

  export interface ParsingOptions {
    type?: "base64" | "binary" | "buffer" | "file" | "array" | "string"
    raw?: boolean
    codepage?: number
    cellFormula?: boolean
    cellHTML?: boolean
    cellNF?: boolean
    cellStyles?: boolean
    cellText?: boolean
    cellDates?: boolean
    dateNF?: string
    sheetStubs?: boolean
    sheetRows?: number
    bookDeps?: boolean
    bookFiles?: boolean
    bookProps?: boolean
    bookSheets?: boolean
    bookVBA?: boolean
    password?: string
    WTF?: boolean
  }

  export interface WritingOptions {
    type?: "base64" | "binary" | "buffer" | "file" | "array" | "string"
    bookSST?: boolean
    bookType?: string
    sheet?: string
    compression?: boolean
    Props?: WorkbookProperties
  }

  export interface WorkbookProperties {
    Title?: string
    Subject?: string
    Author?: string
    Manager?: string
    Company?: string
    Category?: string
    Keywords?: string
    Comments?: string
  }

  export interface Sheet2JSONOpts {
    header?: number | string[] | "A"
    range?: unknown
    blankrows?: boolean
    defval?: unknown
    raw?: boolean
    dateNF?: string
  }

  export function read(data: unknown, opts?: ParsingOptions): WorkBook
  export function readFile(filename: string, opts?: ParsingOptions): WorkBook
  export function write(wb: WorkBook, opts?: WritingOptions): unknown
  export function writeFile(wb: WorkBook, filename: string, opts?: WritingOptions): void

  export namespace utils {
    export function sheet_to_json<T = unknown>(
      worksheet: WorkSheet,
      opts?: Sheet2JSONOpts
    ): T[]
    export function json_to_sheet(data: unknown[], opts?: unknown): WorkSheet
    export function aoa_to_sheet(data: unknown[][], opts?: unknown): WorkSheet
    export function book_new(): WorkBook
    export function book_append_sheet(wb: WorkBook, ws: WorkSheet, name?: string): void
    export function decode_cell(address: string): { c: number; r: number }
    export function encode_cell(cell: { c: number; r: number }): string
    export function decode_range(range: string): { s: { c: number; r: number }; e: { c: number; r: number } }
    export function encode_range(range: { s: { c: number; r: number }; e: { c: number; r: number } }): string
  }
}
