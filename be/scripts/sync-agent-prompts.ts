#!/usr/bin/env bun

import { runFullSync } from "@/ai-agents/registry/seed-agents"

const SCRIPT_LOG_PREFIX = "[SyncAgentPrompts]"

async function main() {
  console.log(`${SCRIPT_LOG_PREFIX} Starting agent prompt sync...`)

  try {
    await runFullSync()
    console.log(`${SCRIPT_LOG_PREFIX} ✅ Agent prompts synced successfully`)
    process.exit(0)
  } catch (error) {
    console.error(
      `${SCRIPT_LOG_PREFIX} ❌ Failed to sync agent prompts:`,
      error instanceof Error ? error.message : error
    )
    process.exit(1)
  }
}

main()
