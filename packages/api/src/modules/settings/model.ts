import { z } from 'zod'

const SettingsBodySchema = z.object({
  defaultChatModel: z.string().uuid().nullable().optional(),
  defaultEmbeddingModel: z.string().uuid().nullable().optional(),
  defaultSummaryModel: z.string().uuid().nullable().optional(),
  maxContextLoadTime: z.number().int().min(1).max(1440).optional(), // 1 minute to 24 hours
  language: z.string().optional(),
})

export type SettingsInput = z.infer<typeof SettingsBodySchema>

export const UpdateSettingsModel = {
  body: SettingsBodySchema,
}

