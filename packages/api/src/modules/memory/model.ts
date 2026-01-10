import { z } from 'zod'

// MemoryUnit schema (without user field, will be added from auth)
const MemoryUnitBodySchema = z.object({
  messages: z.array(z.any()),
  timestamp: z.coerce.date(),
})

export const AddMemoryModel = {
  body: MemoryUnitBodySchema,
}

export const SearchMemoryModel = {
  query: z.object({
    query: z.string().min(1, 'Search query is required'),
  }),
}

