import { z } from 'zod'

const SettingsSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  defaultChatModel: z.string().uuid().nullable().optional(),
  defaultEmbeddingModel: z.string().uuid().nullable().optional(),
  defaultSummaryModel: z.string().uuid().nullable().optional(),
})

export type SettingsInput = z.infer<typeof SettingsSchema>

export const GetSettingsModel = {
  params: z.object({
    userId: z.string(),
  }),
}

export const CreateSettingsModel = {
  body: SettingsSchema,
}

export const UpdateSettingsModel = {
  params: z.object({
    userId: z.string(),
  }),
  body: z.object({
    defaultChatModel: z.string().uuid().nullable().optional(),
    defaultEmbeddingModel: z.string().uuid().nullable().optional(),
    defaultSummaryModel: z.string().uuid().nullable().optional(),
  }),
}

