import { SUPABASE } from "@/config"
import { searchContacts } from "@/domains/contacts/services/contact-query-service"
import type { ContactSearchResult } from "@/domains/contacts/types"
import type { HandlerContext } from "@/shared/types"
import type { SearchContactsToolParams } from "../schemas/contact-schemas"

async function getUserIdByEmail(email: string): Promise<string> {
  const { data, error } = await SUPABASE.from("users")
    .select("id")
    .eq("email", email)
    .single()

  if (error || !data) {
    throw new Error(`User not found for email: ${email}`)
  }

  return data.id
}

export type SearchContactsResult = {
  contacts: ContactSearchResult[]
  totalFound: number
  searchQuery: string
}

export async function searchContactsHandler(
  params: SearchContactsToolParams,
  ctx: HandlerContext
): Promise<SearchContactsResult> {
  const { email } = ctx

  const userId = await getUserIdByEmail(email)

  const contacts = await searchContacts(userId, {
    query: params.query,
    limit: params.limit ?? 10,
    includeHidden: false,
  })

  return {
    contacts,
    totalFound: contacts.length,
    searchQuery: params.query,
  }
}
