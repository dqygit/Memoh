import { z } from 'zod'

// MemoryUnit schema
const MemoryUnitSchema = z.object({
  messages: z.array(z.object()),
  timestamp: z.coerce.date(),
  user: z.string(),
})

export const AddMemoryModel = {
  body: MemoryUnitSchema,
}

export const SearchMemoryModel = {
  query: z.object({
    query: z.string().min(1, 'Search query is required'),
    userId: z.string().min(1, 'User ID is required'),
  }),
}

