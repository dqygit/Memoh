import Elysia from 'elysia'
import { GetMemoryMessageFilterModel, GetMemoryMessageModel } from './model'
import { getMemoryMessages, getMemoryMessagesFilter } from './service'

export const messageModule = new Elysia({
  prefix: '/message',
})
  .get('/', async ({ query }) => {
    const units = await getMemoryMessages(query)
    return {
      success: true,
      units,
    }
  }, GetMemoryMessageModel)
  .get('/filter', async ({ query }) => {
    const units = await getMemoryMessagesFilter(query)

    return {
      units,
      success: true,
    }
  }, GetMemoryMessageFilterModel)