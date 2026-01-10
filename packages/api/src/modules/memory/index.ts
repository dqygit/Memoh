import Elysia from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { jwt } from '@elysiajs/jwt'
import { messageModule } from './message'
import { AddMemoryModel, SearchMemoryModel } from './model'
import { addMemory, searchMemory } from './service'
import { MemoryUnit } from '@memohome/memory'

export const memoryModule = new Elysia({
  prefix: '/memory',
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
  .use(messageModule)
  // Add memory for current user
  .post('/', async ({ user, body, set }) => {
    try {
      const memoryUnit: MemoryUnit = {
        ...body,
        user: user.userId,
      }
      const result = await addMemory(memoryUnit)
      return {
        success: true,
        data: result,
      }
    } catch (error) {
      set.status = 500
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add memory',
      }
    }
  }, AddMemoryModel)
  // Search memory for current user
  .get('/search', async ({ user, query, set }) => {
    try {
      const results = await searchMemory(query.query, user.userId)
      return {
        success: true,
        data: results,
      }
    } catch (error) {
      set.status = 500
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search memory',
      }
    }
  }, SearchMemoryModel)