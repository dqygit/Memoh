import Elysia from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { jwt } from '@elysiajs/jwt'
import { UpdateSettingsModel } from './model'
import { getSettings, upsertSettings } from './service'

export const settingsModule = new Elysia({
  prefix: '/settings',
})
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      exp: process.env.JWT_EXPIRES_IN || '7d',
    })
  )
  .use(bearer())
  .derive(async ({ bearer, jwt, set }) => {
    if (!bearer) {
      set.status = 401
      throw new Error('No bearer token provided')
    }

    const payload = await jwt.verify(bearer)

    if (!payload) {
      set.status = 401
      throw new Error('Invalid or expired token')
    }

    return {
      user: {
        userId: payload.userId as string,
        username: payload.username as string,
        role: payload.role as string,
      },
    }
  })
  // Get current user's settings
  .get('/', async ({ user, set }) => {
    try {
      const userSettings = await getSettings(user.userId)
      if (!userSettings) {
        set.status = 404
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
      set.status = 500
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch settings',
      }
    }
  })
  // Update or create current user's settings
  .put('/', async ({ user, body, set }) => {
    try {
      const result = await upsertSettings(user.userId, body)
      return {
        success: true,
        data: result,
      }
    } catch (error) {
      set.status = 500
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update settings',
      }
    }
  }, UpdateSettingsModel)

