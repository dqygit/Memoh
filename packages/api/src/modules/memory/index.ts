import Elysia from 'elysia'
import { messageModule } from './message'
import { AddMemoryModel, SearchMemoryModel } from './model'
import { addMemory, searchMemory } from './service'
import { MemoryUnit } from '@memohome/memory'

export const memoryModule = new Elysia({
  prefix: '/memory',
})
  .use(messageModule)
  // Add memory
  .post('/', async ({ body }) => {
    try {
      const result = await addMemory(body as unknown as MemoryUnit)
      return {
        success: true,
        data: result,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add memory',
      }
    }
  }, AddMemoryModel)
  // Search memory
  .get('/search', async ({ query }) => {
    try {
      const results = await searchMemory(query.query, query.userId)
      return {
        success: true,
        data: results,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search memory',
      }
    }
  }, SearchMemoryModel)