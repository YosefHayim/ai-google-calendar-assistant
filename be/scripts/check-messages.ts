import { createClient } from "@supabase/supabase-js"
import { env } from "../config/env"

const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey)

async function check() {
  const convId = "b7dee7d6-63c6-4a83-9fa3-c889be22a583"
  
  console.log("Checking conversation:", convId)
  
  const { data: conv, error: convErr } = await supabase
    .from("conversations")
    .select("id, message_count, title, created_at")
    .eq("id", convId)
    .single()
  
  console.log("\nConversation:", JSON.stringify(conv, null, 2))
  if (convErr) console.log("Conv Error:", convErr)
  
  const { data: msgs, error: msgsErr } = await supabase
    .from("conversation_messages")
    .select("id, role, sequence_number, content, created_at")
    .eq("conversation_id", convId)
  
  console.log("\nMessages count:", msgs?.length || 0)
  console.log("Messages:", JSON.stringify(msgs, null, 2))
  if (msgsErr) console.log("Msgs Error:", msgsErr)
  
  // Check a few recent conversations with their message counts
  const { data: recentConvs } = await supabase
    .from("conversations")
    .select("id, message_count, title")
    .order("created_at", { ascending: false })
    .limit(5)
  
  console.log("\nRecent conversations:")
  for (const c of recentConvs || []) {
    const { count } = await supabase
      .from("conversation_messages")
      .select("*", { count: "exact", head: true })
      .eq("conversation_id", c.id)
    console.log(`  ${c.id}: DB message_count=${c.message_count}, actual count=${count}, title="${c.title?.slice(0,30)}"`)
  }
}

check().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
