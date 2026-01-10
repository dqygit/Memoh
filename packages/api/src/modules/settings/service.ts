import { db } from '@memohome/db'
import { settings } from '@memohome/db/schema'
import { eq } from 'drizzle-orm'
import type { SettingsInput } from './model'

export const getSettings = async (userId: string) => {
  const [result] = await db
    .select()
    .from(settings)
    .where(eq(settings.userId, userId))
  return result
}

export const createSettings = async (data: SettingsInput) => {
  const [newSettings] = await db
    .insert(settings)
    .values({
      userId: data.userId,
      defaultChatModel: data.defaultChatModel || null,
      defaultEmbeddingModel: data.defaultEmbeddingModel || null,
      defaultSummaryModel: data.defaultSummaryModel || null,
    })
    .returning()
  return newSettings
}

export const updateSettings = async (
  userId: string,
  data: Partial<Omit<SettingsInput, 'userId'>>
) => {
  const [updatedSettings] = await db
    .update(settings)
    .set({
      defaultChatModel: data.defaultChatModel,
      defaultEmbeddingModel: data.defaultEmbeddingModel,
      defaultSummaryModel: data.defaultSummaryModel,
    })
    .where(eq(settings.userId, userId))
    .returning()
  return updatedSettings
}

export const upsertSettings = async (data: SettingsInput) => {
  const [result] = await db
    .insert(settings)
    .values({
      userId: data.userId,
      defaultChatModel: data.defaultChatModel || null,
      defaultEmbeddingModel: data.defaultEmbeddingModel || null,
      defaultSummaryModel: data.defaultSummaryModel || null,
    })
    .onConflictDoUpdate({
      target: settings.userId,
      set: {
        defaultChatModel: data.defaultChatModel,
        defaultEmbeddingModel: data.defaultEmbeddingModel,
        defaultSummaryModel: data.defaultSummaryModel,
      },
    })
    .returning()
  return result
}

