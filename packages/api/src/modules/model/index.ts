import Elysia from 'elysia'
import {
  CreateModelModel,
  UpdateModelModel,
  GetModelByIdModel,
  DeleteModelModel,
  GetDefaultModelModel,
} from './model'
import {
  getModels,
  getModelById,
  createModel,
  updateModel,
  deleteModel,
  getChatModel,
  getSummaryModel,
  getEmbeddingModel,
} from './service'
import { Model } from '@memohome/shared'

export const modelModule = new Elysia({
  prefix: '/model',
})
  // Get all models
  .get('/', async () => {
    try {
      const models = await getModels()
      return {
        success: true,
        data: models,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch models',
      }
    }
  })
  // Get model by ID
  .get('/:id', async ({ params }) => {
    try {
      const { id } = params
      const model = await getModelById(id)
      if (!model) {
        return {
          success: false,
          error: 'Model not found',
        }
      }
      return {
        success: true,
        data: model,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch model',
      }
    }
  }, GetModelByIdModel)
  // Create new model
  .post('/', async ({ body }) => {
    try {
      const newModel = await createModel(body as Model)
      return {
        success: true,
        data: newModel,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create model',
      }
    }
  }, CreateModelModel)
  // Update model
  .put('/:id', async ({ params, body }) => {
    try {
      const { id } = params
      const updatedModel = await updateModel(id, body as Model)
      if (!updatedModel) {
        return {
          success: false,
          error: 'Model not found',
        }
      }
      return {
        success: true,
        data: updatedModel,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update model',
      }
    }
  }, UpdateModelModel)
  // Delete model
  .delete('/:id', async ({ params }) => {
    try {
      const { id } = params
      const deletedModel = await deleteModel(id)
      if (!deletedModel) {
        return {
          success: false,
          error: 'Model not found',
        }
      }
      return {
        success: true,
        data: deletedModel,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete model',
      }
    }
  }, DeleteModelModel)
  // Get default chat model
  .get('/chat/default', async ({ query }) => {
    try {
      const { userId } = query
      const chatModel = await getChatModel(userId)
      if (!chatModel) {
        return {
          success: false,
          error: 'Default chat model not found or not set',
        }
      }
      return {
        success: true,
        data: chatModel,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch default chat model',
      }
    }
  }, GetDefaultModelModel)
  // Get default summary model
  .get('/summary/default', async ({ query }) => {
    try {
      const { userId } = query
      const summaryModel = await getSummaryModel(userId)
      if (!summaryModel) {
        return {
          success: false,
          error: 'Default summary model not found or not set',
        }
      }
      return {
        success: true,
        data: summaryModel,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch default summary model',
      }
    }
  }, GetDefaultModelModel)
  // Get default embedding model
  .get('/embedding/default', async ({ query }) => {
    try {
      const { userId } = query
      const embeddingModel = await getEmbeddingModel(userId)
      if (!embeddingModel) {
        return {
          success: false,
          error: 'Default embedding model not found or not set',
        }
      }
      return {
        success: true,
        data: embeddingModel,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch default embedding model',
      }
    }
  }, GetDefaultModelModel)
