import { createClient } from "@supabase/supabase-js"
import { env } from "../config/env"

const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey)

async function testInsert() {
  const convId = "b7dee7d6-63c6-4a83-9fa3-c889be22a583"
  
  console.log("Testing message insert for conversation:", convId)
  
  const { data, error } = await supabase
    .from("conversation_messages")
    .insert({
      conversation_id: convId,
      role: "user",
      content: "Test message",
      sequence_number: 1,
    })
    .select()
    .single()
  
  console.log("Insert result:", JSON.stringify(data, null, 2))
  console.log("Insert error:", error ? JSON.stringify(error, null, 2) : "none")
  
  // Clean up test message
  if (data?.id) {
    await supabase.from("conversation_messages").delete().eq("id", data.id)
    console.log("Cleaned up test message")
  }
}

testInsert().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
