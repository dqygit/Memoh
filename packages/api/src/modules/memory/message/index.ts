import Elysia from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { jwt } from '@elysiajs/jwt'
import { GetMemoryMessageFilterModel, GetMemoryMessageModel } from './model'
import { getMemoryMessages, getMemoryMessagesFilter } from './service'

export const messageModule = new Elysia({
  prefix: '/message',
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
  // Get messages for current user (paginated)
  .get('/', async ({ user, query, set }) => {
    try {
      const units = await getMemoryMessages(user.userId, query)
      return {
        success: true,
        data: units,
      }
    } catch (error) {
      set.status = 500
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch messages',
      }
    }
  }, GetMemoryMessageModel)
  // Get messages by date range for current user
  .get('/filter', async ({ user, query, set }) => {
    try {
      const units = await getMemoryMessagesFilter(user.userId, query)
      return {
        success: true,
        data: units,
      }
    } catch (error) {
      set.status = 500
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to filter messages',
      }
    }
  }, GetMemoryMessageFilterModel)