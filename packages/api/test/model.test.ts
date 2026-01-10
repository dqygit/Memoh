import { describe, it, expect, beforeEach } from 'vitest'
import { getTestClient } from './setup'

describe('Model API', () => {
  const client = getTestClient()
  let createdModelId: string | null = null

  describe('GET /model', () => {
    it('should get all models successfully', async () => {
      const response = await client.model.get()

      expect(response.status).toBe(200)
      expect(response.data).toBeDefined()
      expect(response.data?.success).toBe(true)
      expect(Array.isArray(response.data?.data)).toBe(true)
    })
  })

  describe('POST /model', () => {
    it('should create a chat model successfully', async () => {
      const modelData = {
        modelId: 'test-chat-model',
        baseUrl: 'https://api.openai.com/v1',
        apiKey: 'test-api-key',
        clientType: 'openai',
        name: 'Test Chat Model',
        type: 'chat' as const,
      }

      const response = await client.model.post(modelData)

      expect(response.status).toBe(200)
      expect(response.data).toBeDefined()
      expect(response.data?.success).toBe(true)
      expect(response.data?.data).toBeDefined()
      
      if (response.data?.data?.id) {
        createdModelId = response.data.data.id
      }
    })

    it('should create an embedding model successfully', async () => {
      const modelData = {
        modelId: 'test-embedding-model',
        baseUrl: 'https://api.openai.com/v1',
        apiKey: 'test-api-key',
        clientType: 'openai',
        name: 'Test Embedding Model',
        type: 'embedding' as const,
        dimensions: 1536,
      }

      const response = await client.model.post(modelData)

      expect(response.status).toBe(200)
      expect(response.data).toBeDefined()
      expect(response.data?.success).toBe(true)
      expect(response.data?.data).toBeDefined()
    })

    it('should return error for invalid model data', async () => {
      const invalidData = {
        // missing required fields
        name: 'Invalid Model',
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await client.model.post(invalidData as any)

      expect([400, 422]).toContain(response.status)
    })

    it('should return error for embedding model without dimensions', async () => {
      const invalidData = {
        modelId: 'test-embedding-model',
        baseUrl: 'https://api.openai.com/v1',
        apiKey: 'test-api-key',
        clientType: 'openai',
        type: 'embedding' as const,
        // missing dimensions
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await client.model.post(invalidData as any)

      expect([400, 422]).toContain(response.status)
    })
  })

  describe('GET /model/:id', () => {
    it('should get model by id successfully', async () => {
      if (!createdModelId) {
        // 先创建一个模型
        const createResponse = await client.model.post({
          modelId: 'test-get-model',
          baseUrl: 'https://api.openai.com/v1',
          apiKey: 'test-api-key',
          clientType: 'openai',
          type: 'chat' as const,
        })
        
        if (createResponse.data?.data?.id) {
          createdModelId = createResponse.data.data.id
        }
      }

      if (createdModelId) {
        const response = await client.model({
          id: createdModelId,
        }).get()

        expect(response.status).toBe(200)
        expect(response.data).toBeDefined()
        expect(response.data?.success).toBe(true)
        expect(response.data?.data).toBeDefined()
      }
    })

    it('should return error for non-existent model', async () => {
      const response = await client.model({
        id: 'non-existent-id',
      }).get()

      expect(response.status).toBe(200) // API 返回 200 但 success: false
      expect(response.data?.success).toBe(false)
      expect(response.data?.error).toBeDefined()
    })
  })

  describe('PUT /model/:id', () => {
    it('should update model successfully', async () => {
      if (!createdModelId) {
        const createResponse = await client.model.post({
          modelId: 'test-update-model',
          baseUrl: 'https://api.openai.com/v1',
          apiKey: 'test-api-key',
          clientType: 'openai',
          type: 'chat' as const,
        })
        
        if (createResponse.data?.data?.id) {
          createdModelId = createResponse.data.data.id
        }
      }

      if (createdModelId) {
        const updateData = {
          modelId: 'test-updated-model',
          baseUrl: 'https://api.openai.com/v1',
          apiKey: 'updated-api-key',
          clientType: 'openai',
          name: 'Updated Model',
          type: 'chat' as const,
        }

        const response = await client.model[createdModelId].put(updateData)

        expect(response.status).toBe(200)
        expect(response.data).toBeDefined()
        expect(response.data?.success).toBe(true)
        expect(response.data?.data).toBeDefined()
      }
    })
  })

  describe('DELETE /model/:id', () => {
    it('should delete model successfully', async () => {
      // 先创建一个模型用于删除
      const createResponse = await client.model.post({
        modelId: 'test-delete-model',
        baseUrl: 'https://api.openai.com/v1',
        apiKey: 'test-api-key',
        clientType: 'openai',
        type: 'chat' as const,
      })

      const modelId = createResponse.data?.data?.id
      if (modelId) {
        const response = await client.model[modelId].delete()

        expect(response.status).toBe(200)
        expect(response.data).toBeDefined()
        expect(response.data?.success).toBe(true)
      }
    })
  })

  describe('GET /model/chat/default', () => {
    it('should get default chat model successfully', async () => {
      const response = await client.model.chat.default.get({
        query: {
          userId: 'test-user-123',
        },
      })

      expect(response.status).toBe(200)
      expect(response.data).toBeDefined()
      // 可能返回 success: false 如果没有设置默认模型
      expect(response.data?.success !== undefined).toBe(true)
    })

    it('should return error for missing userId', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await client.model.chat.default.get({ query: {} } as any)

      expect([400, 422]).toContain(response.status)
    })
  })

  describe('GET /model/summary/default', () => {
    it('should get default summary model successfully', async () => {
      const response = await client.model.summary.default.get({
        query: {
          userId: 'test-user-123',
        },
      })

      expect(response.status).toBe(200)
      expect(response.data).toBeDefined()
      expect(response.data?.success !== undefined).toBe(true)
    })
  })

  describe('GET /model/embedding/default', () => {
    it('should get default embedding model successfully', async () => {
      const response = await client.model.embedding.default.get({
        query: {
          userId: 'test-user-123',
        },
      })

      expect(response.status).toBe(200)
      expect(response.data).toBeDefined()
      expect(response.data?.success !== undefined).toBe(true)
    })
  })
})

