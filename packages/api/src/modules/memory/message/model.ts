import { z } from 'zod'

export const GetMemoryMessageModel = {
  query: z.object({
    limit: z.string().transform(Number).default(10),
    page: z.string().transform(Number).default(1),
    userId: z.string(),
  }),
}

export const GetMemoryMessageFilterModel = {
  query: z.object({
    from: z.date(),
    to: z.date(),
    userId: z.string(),
  }),
}