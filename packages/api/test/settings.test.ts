import { describe, it, expect, beforeEach } from 'vitest'
import { getTestClient } from './setup'

describe('Settings API', () => {
  const client = getTestClient()
  const testUserId = 'test-user-settings-123'

  describe('GET /settings/:userId', () => {
    it('should get settings successfully', async () => {
      const response = await client.settings({
        userId: testUserId,
      }).get()

      expect(response.status).toBe(200)
      expect(response.data).toBeDefined()
      // 可能返回 success: false 如果设置不存在
      expect(response.data?.success !== undefined).toBe(true)
    })
  })

  describe('POST /settings', () => {
    it('should create settings successfully', async () => {
      const settingsData = {
        userId: testUserId,
        defaultChatModel: null,
        defaultEmbeddingModel: null,
        defaultSummaryModel: null,
      }

      const response = await client.settings.post(settingsData)

      expect(response.status).toBe(200)
      expect(response.data).toBeDefined()
      expect(response.data?.success).toBe(true)
      expect(response.data?.data).toBeDefined()
    })

    it('should create settings with model IDs', async () => {
      const settingsData = {
        userId: `${testUserId}-with-models`,
        defaultChatModel: '00000000-0000-0000-0000-000000000001',
        defaultEmbeddingModel: '00000000-0000-0000-0000-000000000002',
        defaultSummaryModel: '00000000-0000-0000-0000-000000000003',
      }

      const response = await client.settings.post(settingsData)

      expect(response.status).toBe(200)
      expect(response.data).toBeDefined()
      expect(response.data?.success).toBe(true)
    })

    it('should return error for invalid UUID format', async () => {
      const invalidData = {
        userId: testUserId,
        defaultChatModel: 'invalid-uuid',
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await client.settings.post(invalidData as any)

      expect([400, 422]).toContain(response.status)
    })

    it('should return error for missing userId', async () => {
      const invalidData = {
        defaultChatModel: null,
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await client.settings.post(invalidData as any)

      expect([400, 422]).toContain(response.status)
    })
  })

  describe('PUT /settings/:userId', () => {
    it('should update settings successfully', async () => {
      // 先创建设置
      await client.settings.post({
        userId: `${testUserId}-update`,
        defaultChatModel: null,
      })

      const updateData = {
        defaultChatModel: '00000000-0000-0000-0000-000000000001',
        defaultEmbeddingModel: '00000000-0000-0000-0000-000000000002',
        defaultSummaryModel: null,
      }

      const response = await client.settings({
        userId: `${testUserId}-update`,
      }).put(updateData)

      expect(response.status).toBe(200)
      expect(response.data).toBeDefined()
      expect(response.data?.success).toBe(true)
      expect(response.data?.data).toBeDefined()
    })

    it('should return error for non-existent settings', async () => {
      const updateData = {
        defaultChatModel: '00000000-0000-0000-0000-000000000001',
      }

      const response = await client.settings({
        userId: 'non-existent-user',
      }).put(updateData)

      expect(response.status).toBe(200) // API 返回 200 但 success: false
      expect(response.data?.success).toBe(false)
      expect(response.data?.error).toBeDefined()
    })
  })

  describe('PATCH /settings', () => {
    it('should upsert settings successfully', async () => {
      const settingsData = {
        userId: `${testUserId}-upsert`,
        defaultChatModel: '00000000-0000-0000-0000-000000000001',
        defaultEmbeddingModel: null,
        defaultSummaryModel: null,
      }

      const response = await client.settings.patch(settingsData)

      expect(response.status).toBe(200)
      expect(response.data).toBeDefined()
      expect(response.data?.success).toBe(true)
      expect(response.data?.data).toBeDefined()
    })

    it('should update existing settings on upsert', async () => {
      const userId = `${testUserId}-upsert-update`
      
      // 先创建
      await client.settings.post({
        userId,
        defaultChatModel: null,
      })

      // 然后 upsert
      const upsertData = {
        userId,
        defaultChatModel: '00000000-0000-0000-0000-000000000001',
      }

      const response = await client.settings.patch(upsertData)

      expect(response.status).toBe(200)
      expect(response.data?.success).toBe(true)
    })
  })
})

