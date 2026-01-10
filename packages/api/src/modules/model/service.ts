import { db } from '@memohome/db'
import { model } from '@memohome/db/schema'
import { Model } from '@memohome/shared'
import { eq } from 'drizzle-orm'
import { getSettings } from '@/modules/settings/service'

export const getModels = async () => {
  const models = await db.select().from(model)
  return models
}

export const getModelById = async (id: string) => {
  const [result] = await db.select().from(model).where(eq(model.id, id))
  return result
}

export const createModel = async (data: Model) => {
  const [newModel] = await db
    .insert(model)
    .values({ model: data })
    .returning()
  return newModel
}

export const updateModel = async (id: string, data: Model) => {
  const [updatedModel] = await db
    .update(model)
    .set({ model: data })
    .where(eq(model.id, id))
    .returning()
  return updatedModel
}

export const deleteModel = async (id: string) => {
  const [deletedModel] = await db
    .delete(model)
    .where(eq(model.id, id))
    .returning()
  return deletedModel
}

export const getChatModel = async (userId: string) => {
  const userSettings = await getSettings(userId)
  if (!userSettings?.defaultChatModel) {
    return null
  }
  return await getModelById(userSettings.defaultChatModel)
}

export const getSummaryModel = async (userId: string) => {
  const userSettings = await getSettings(userId)
  if (!userSettings?.defaultSummaryModel) {
    return null
  }
  return await getModelById(userSettings.defaultSummaryModel)
}

export const getEmbeddingModel = async (userId: string) => {
  const userSettings = await getSettings(userId)
  if (!userSettings?.defaultEmbeddingModel) {
    return null
  }
  return await getModelById(userSettings.defaultEmbeddingModel)
}