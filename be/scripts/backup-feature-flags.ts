#!/usr/bin/env bun

import { SUPABASE } from "@/config/clients"
import { existsSync, mkdirSync, writeFileSync, unlinkSync, statSync } from "node:fs"
import { resolve, join } from "node:path"
import { gzipSync } from "node:zlib"

const BYTES_PER_KB = 1024
const ISO_TIMESTAMP_LENGTH = 19
const BACKUP_DIR = resolve(__dirname, "../backups")

const TABLES = [
  "feature_flags",
  "feature_flag_audit_logs",
  "feature_flag_webhooks",
  "feature_flag_webhook_deliveries",
] as const

type TableName = (typeof TABLES)[number]

type BackupMetadata = {
  version: string
  timestamp: string
  tables: string[]
  rowCounts: Record<string, number>
}

function ensureBackupDir(): void {
  if (!existsSync(BACKUP_DIR)) {
    mkdirSync(BACKUP_DIR, { recursive: true })
    console.log(`Created backup directory: ${BACKUP_DIR}`)
  }
}

function generateFilename(): string {
  const now = new Date()
  const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, ISO_TIMESTAMP_LENGTH)
  return `feature_flags_backup_${timestamp}`
}

async function fetchTableData(tableName: TableName): Promise<unknown[]> {
  const { data, error } = await SUPABASE.from(tableName).select("*")

  if (error) {
    console.error(`Error fetching ${tableName}:`, error.message)
    return []
  }

  return data || []
}

function escapeValue(val: unknown): string {
  if (val === null) {
    return "NULL"
  }
  if (typeof val === "boolean") {
    return val ? "TRUE" : "FALSE"
  }
  if (typeof val === "number") {
    return String(val)
  }
  if (Array.isArray(val)) {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`
  }
  if (typeof val === "object") {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`
  }
  return `'${String(val).replace(/'/g, "''")}'`
}

function generateInsertStatements(tableName: string, rows: unknown[]): string {
  if (rows.length === 0) {
    return ""
  }

  const statements: string[] = []

  for (const row of rows) {
    const record = row as Record<string, unknown>
    const columns = Object.keys(record)
    const values = columns.map((col) => escapeValue(record[col]))

    statements.push(
      `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${values.join(", ")}) ON CONFLICT (id) DO NOTHING;`
    )
  }

  return statements.join("\n")
}

async function createBackup(): Promise<void> {
  console.log("\n=== Feature Flags Backup Script ===\n")

  ensureBackupDir()

  const filename = generateFilename()
  const sqlPath = join(BACKUP_DIR, `${filename}.sql`)
  const gzPath = join(BACKUP_DIR, `${filename}.sql.gz`)
  const metaPath = join(BACKUP_DIR, `${filename}.meta.json`)

  const metadata: BackupMetadata = {
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    tables: [...TABLES],
    rowCounts: {},
  }

  const sqlParts: string[] = [
    "-- Feature Flags Backup",
    `-- Generated: ${metadata.timestamp}`,
    `-- Tables: ${TABLES.join(", ")}`,
    "",
    "BEGIN;",
    "",
  ]

  for (const table of TABLES) {
    console.log(`Fetching data from ${table}...`)
    const rows = await fetchTableData(table)
    metadata.rowCounts[table] = rows.length
    console.log(`  Found ${rows.length} rows`)

    if (rows.length > 0) {
      sqlParts.push(`-- Table: ${table} (${rows.length} rows)`)
      sqlParts.push(generateInsertStatements(table, rows))
      sqlParts.push("")
    }
  }

  sqlParts.push("COMMIT;")
  sqlParts.push("")

  const sqlContent = sqlParts.join("\n")

  writeFileSync(sqlPath, sqlContent, "utf-8")
  console.log(`\nWritten SQL backup: ${sqlPath}`)

  const compressed = gzipSync(Buffer.from(sqlContent))
  writeFileSync(gzPath, compressed)
  console.log(`Written compressed backup: ${gzPath}`)

  writeFileSync(metaPath, JSON.stringify(metadata, null, 2), "utf-8")
  console.log(`Written metadata: ${metaPath}`)

  unlinkSync(sqlPath)

  console.log("\n=== Backup Summary ===")
  console.log(`Timestamp: ${metadata.timestamp}`)
  console.log(`Tables backed up: ${TABLES.length}`)
  for (const [table, count] of Object.entries(metadata.rowCounts)) {
    console.log(`  - ${table}: ${count} rows`)
  }
  console.log(`\nBackup file: ${gzPath}`)
  console.log(`Metadata file: ${metaPath}`)

  const stats = statSync(gzPath)
  console.log(`Compressed size: ${(stats.size / BYTES_PER_KB).toFixed(2)} KB`)

  console.log("\n=== Restore Instructions ===")
  console.log("To restore this backup:")
  console.log(`  1. Decompress: gunzip -k ${filename}.sql.gz`)
  console.log("  2. Connect to Supabase SQL editor or psql")
  console.log("  3. Run the SQL file contents")
  console.log("")
}

createBackup().catch((error) => {
  console.error("Backup failed:", error)
  process.exit(1)
})
