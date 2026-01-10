import Elysia from 'elysia'
import {
  GetSettingsModel,
  CreateSettingsModel,
  UpdateSettingsModel,
} from './model'
import {
  getSettings,
  createSettings,
  updateSettings,
  upsertSettings,
} from './service'

export const settingsModule = new Elysia({
  prefix: '/settings',
})
  // Get user settings
  .get('/:userId', async ({ params }) => {
    try {
      const { userId } = params
      const userSettings = await getSettings(userId)
      if (!userSettings) {
        return {
          success: false,
          error: 'Settings not found',
        }
      }
      return {
        success: true,
        data: userSettings,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch settings',
      }
    }
  }, GetSettingsModel)
  // Create new settings
  .post('/', async ({ body }) => {
    try {
      const newSettings = await createSettings(body)
      return {
        success: true,
        data: newSettings,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create settings',
      }
    }
  }, CreateSettingsModel)
  // Update settings
  .put('/:userId', async ({ params, body }) => {
    try {
      const { userId } = params
      const updatedSettings = await updateSettings(userId, body)
      if (!updatedSettings) {
        return {
          success: false,
          error: 'Settings not found',
        }
      }
      return {
        success: true,
        data: updatedSettings,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update settings',
      }
    }
  }, UpdateSettingsModel)
  // Upsert settings (create or update)
  .patch('/', async ({ body }) => {
    try {
      const result = await upsertSettings(body)
      return {
        success: true,
        data: result,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upsert settings',
      }
    }
  }, CreateSettingsModel)

