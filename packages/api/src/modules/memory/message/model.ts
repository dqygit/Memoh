import { z } from 'zod'

export const GetMemoryMessageModel = {
  query: z.object({
    limit: z.coerce.number().default(10),
    page: z.coerce.number().default(1),
  }),
}

export const GetMemoryMessageFilterModel = {
  query: z.object({
    from: z.coerce.date(),
    to: z.coerce.date(),
  }),
}