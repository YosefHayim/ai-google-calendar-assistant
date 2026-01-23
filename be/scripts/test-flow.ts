import { WebConversationAdapter } from "../domains/chat/utils/conversation/WebConversationAdapter"
import { summarizeMessages } from "../telegram-bot/utils/summarize"
import { createClient } from "@supabase/supabase-js"
import { env } from "../config/env"

async function testFlow() {
  const userId = "a5d16ef7-ec36-4dcd-808d-9bde037a90e9"
  const webConversation = new WebConversationAdapter()
  
  console.log("Testing createConversationWithMessages...")
  
  const result = await webConversation.createConversationWithMessages(
    userId,
    { role: "user", content: "Test user message from script" },
    { role: "assistant", content: "Test assistant response from script" },
    summarizeMessages
  )
  
  console.log("Result:", result ? `conversationId=${result.conversationId}, messages in context=${result.context.messages.length}` : "null")
  
  if (result) {
    const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey)
    
    const { data: msgs } = await supabase
      .from("conversation_messages")
      .select("id, role, content, sequence_number")
      .eq("conversation_id", result.conversationId)
    
    console.log("Messages in DB:", msgs?.length || 0)
    if (msgs) {
      for (const m of msgs) {
        console.log(`  - seq=${m.sequence_number}, role=${m.role}, content="${m.content.slice(0,30)}..."`)
      }
    }
    
    // Clean up
    await supabase.from("conversation_messages").delete().eq("conversation_id", result.conversationId)
    await supabase.from("conversations").delete().eq("id", result.conversationId)
    console.log("Cleaned up test conversation")
  }
}

testFlow().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
