import { describe, it, expect } from 'vitest'
import { getTestClient } from './setup'

describe('Memory API', () => {
  const client = getTestClient()

  describe('POST /memory', () => {
    it('should add memory successfully', async () => {
      const memoryData = {
        messages: [
          { role: 'user', content: 'Hello, this is a test message' },
          { role: 'assistant', content: 'Hello! How can I help you?' },
        ],
        timestamp: new Date(),
        user: 'test-user-123',
      }

      const response = await client.memory.post(memoryData)

      expect(response.status).toBe(200)
      expect(response.data).toBeDefined()
      console.log(response.data?.error)
      expect(response.data?.success).toBe(true)
      expect(response.data?.data).toBeDefined()
    })

    it('should return error for invalid memory data', async () => {
      const invalidData = {
        messages: [],
        // missing timestamp and user
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await client.memory.post(invalidData as any)

      // Elysia 会返回 400 或 422 对于验证错误
      expect([400, 422]).toContain(response.status)
    })
  })

  describe('GET /memory/search', () => {
    it('should search memory successfully', async () => {
      const response = await client.memory.search.get({
        query: {
          query: 'test search',
          userId: 'test-user-123',
        },
      })

      expect(response.status).toBe(200)
      expect(response.data).toBeDefined()
      expect(response.data?.success).toBe(true)
      expect(Array.isArray(response.data?.data)).toBe(true)
    })

    it('should return error for missing query', async () => {
      const response = await client.memory.search.get({
        // @ts-expect-error - Testing invalid input
        query: {
          userId: 'test-user-123',
          // missing query
        },
      })

      expect([400, 422]).toContain(response.status)
    })

    it('should return error for missing userId', async () => {
      const response = await client.memory.search.get({
        // @ts-expect-error - Testing invalid input
        query: {
          query: 'test search',
          // missing userId
        },
      })

      expect([400, 422]).toContain(response.status)
    })
  })
})

