import { read, utils, type WorkBook, type WorkSheet } from "xlsx"
import { logger } from "@/lib/logger"
import type { FileContent, FileProcessorResult } from "../types"

const LOG_PREFIX = "[SpreadsheetProcessor]"
const MAX_PREVIEW_ROWS = 50
const MAX_PREVIEW_COLS = 20
const XLSX_CODEPAGE = 65_001

type SheetData = {
  name: string
  headers: string[]
  rows: Record<string, string>[]
}

const extractHeaders = (jsonData: unknown[][]): string[] => {
  if (jsonData.length === 0) {
    return []
  }
  const headerRow = jsonData[0] as string[]
  return headerRow
    .slice(0, MAX_PREVIEW_COLS)
    .map((h) => String(h || "").trim())
    .filter(Boolean)
}

const parseRow = (
  rowData: unknown[],
  headers: string[]
): Record<string, string> | null => {
  const row: Record<string, string> = {}
  let hasContent = false

  for (let j = 0; j < headers.length; j++) {
    const header = headers[j]
    const value = String(rowData[j] || "").trim()
    if (value) {
      row[header] = value
      hasContent = true
    }
  }

  return hasContent ? row : null
}

const parseSheetData = (
  worksheet: WorkSheet,
  sheetName: string
): SheetData | null => {
  const jsonData = utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    defval: "",
  })

  const headers = extractHeaders(jsonData as unknown[][])
  if (headers.length === 0) {
    return null
  }

  const rows: Record<string, string>[] = []
  const maxRows = Math.min(jsonData.length, MAX_PREVIEW_ROWS + 1)

  for (let i = 1; i < maxRows; i++) {
    const rowData = jsonData[i] as unknown[]
    if (!rowData) {
      continue
    }
    const row = parseRow(rowData, headers)
    if (row) {
      rows.push(row)
    }
  }

  if (rows.length === 0) {
    return null
  }

  return { name: sheetName, headers, rows }
}

const parseWorkbook = (workbook: WorkBook): SheetData[] => {
  const sheets: SheetData[] = []

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName]
    if (!worksheet) {
      continue
    }

    const sheetData = parseSheetData(worksheet, sheetName)
    if (sheetData) {
      sheets.push(sheetData)
    }
  }

  return sheets
}

const formatSheetForLLM = (sheet: SheetData): string => {
  const lines: string[] = []
  lines.push(`Sheet: ${sheet.name}`)
  lines.push(`Columns: ${sheet.headers.join(", ")}`)
  lines.push("")

  for (const row of sheet.rows) {
    const rowStr = sheet.headers
      .map((h) => `${h}: ${row[h] || ""}`)
      .filter((s) => !s.endsWith(": "))
      .join(" | ")
    lines.push(rowStr)
  }

  return lines.join("\n")
}

export const processSpreadsheetBuffer = (
  buffer: Buffer,
  mimeType: string
): FileProcessorResult => {
  try {
    const isCSV = mimeType === "text/csv"
    const workbook = read(buffer, {
      type: "buffer",
      codepage: XLSX_CODEPAGE,
      raw: isCSV,
    })

    const sheets = parseWorkbook(workbook)

    if (sheets.length === 0) {
      return {
        success: true,
        content: {
          type: "spreadsheet",
          data: "Empty spreadsheet or no data found",
          mimeType: mimeType as FileContent["mimeType"],
        },
      }
    }

    const textContent = sheets.map(formatSheetForLLM).join("\n\n---\n\n")

    logger.info(
      `${LOG_PREFIX} Processed spreadsheet with ${sheets.length} sheet(s)`
    )

    return {
      success: true,
      content: {
        type: "spreadsheet",
        data: textContent,
        mimeType: mimeType as FileContent["mimeType"],
      },
    }
  } catch (error) {
    logger.error(`${LOG_PREFIX} Failed to parse spreadsheet:`, error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to parse spreadsheet",
    }
  }
}

export const processCSVContent = (csvContent: string): FileProcessorResult => {
  const buffer = Buffer.from(csvContent, "utf-8")
  return processSpreadsheetBuffer(buffer, "text/csv")
}
