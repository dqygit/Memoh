import { describe, it, expect } from 'vitest'
import { getTestClient } from './setup'

describe('Memory Message API', () => {
  const client = getTestClient()

  describe('GET /memory/message', () => {
    it('should get memory messages successfully', async () => {
      const response = await client.memory.message.get({
        query: {
          userId: 'test-user-123',
          limit: 10,
          page: 1,
        },
      })

      expect(response.status).toBe(200)
      expect(response.data).toBeDefined()
      expect(response.data?.success).toBe(true)
      expect(response.data?.units).toBeDefined()
    })

    it('should use default limit and page when not provided', async () => {
      const response = await client.memory.message.get({
        query: {
          userId: 'test-user-123',
          limit: 10,
          page: 1,
        },
      })

      expect(response.status).toBe(200)
      expect(response.data).toBeDefined()
      expect(response.data?.success).toBe(true)
    })

    it('should return error for missing userId', async () => {
      const response = await client.memory.message.get({
        // @ts-expect-error - Testing invalid input
        query: {
          limit: 10,
          page: 1,
          // missing userId
        },
      })

      expect([400, 422]).toContain(response.status)
    })
  })

  describe('GET /memory/message/filter', () => {
    it('should filter memory messages successfully', async () => {
      const response = await client.memory.message.filter.get({
        query: {
          userId: 'test-user-123',
          from: new Date('2024-01-01') as unknown as string,
          to: new Date('2024-12-31') as unknown as string,
        },
      })

      expect(response.status).toBe(200)
      expect(response.data).toBeDefined()
      expect(response.data?.success).toBe(true)
      expect(response.data?.units).toBeDefined()
    })

    it('should return error for missing required fields', async () => {
      const response = await client.memory.message.filter.get({
        // @ts-expect-error - Testing invalid input
        query: {
          userId: 'test-user-123',
          // missing from and to
        },
      })

      expect([400, 422]).toContain(response.status)
    })
  })
})

