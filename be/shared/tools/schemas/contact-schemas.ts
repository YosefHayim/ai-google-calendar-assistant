import { z } from "zod"

const SEARCH_QUERY_MAX_LENGTH = 100
const SEARCH_DEFAULT_LIMIT = 10
const SEARCH_MAX_LIMIT = 20

export const searchContactsToolSchema = z.object({
  query: z
    .string()
    .min(1)
    .max(SEARCH_QUERY_MAX_LENGTH)
    .describe(
      "Search query to find contacts by name or email. Examples: 'john', 'john@', 'doe', 'smith@company.com'"
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(SEARCH_MAX_LIMIT)
    .default(SEARCH_DEFAULT_LIMIT)
    .describe("Maximum number of contacts to return. Default is 10."),
})

export type SearchContactsToolParams = z.infer<typeof searchContactsToolSchema>
