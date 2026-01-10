import { z } from 'zod'

const BaseModelSchema = z.object({
  modelId: z.string().min(1, 'Model ID is required'),
  baseUrl: z.string(),
  apiKey: z.string().min(1, 'API key is required'),
  clientType: z.string(),
  name: z.string().optional(),
})

// Chat model schema (type is optional and defaults to 'chat')
const ChatModelSchema = BaseModelSchema.extend({
  type: z.enum(['chat']).optional().default('chat'),
})

// Embedding model schema (type must be 'embedding' and dimensions is required)
const EmbeddingModelSchema = BaseModelSchema.extend({
  type: z.literal('embedding'),
  dimensions: z.number().int().positive('Dimensions must be a positive integer'),
})

// Union of both model types
const ModelSchema = z.union([ChatModelSchema, EmbeddingModelSchema])

// Export the inferred type from the schema
export type ModelInput = z.infer<typeof ModelSchema>

export const CreateModelModel = {
  body: ModelSchema,
}

export const UpdateModelModel = {
  params: z.object({
    id: z.string(),
  }),
  body: ModelSchema,
}

export const GetModelByIdModel = {
  params: z.object({
    id: z.string(),
  }),
}

export const DeleteModelModel = {
  params: z.object({
    id: z.string(),
  }),
}

export const GetDefaultModelModel = {
  query: z.object({
    userId: z.string().min(1, 'User ID is required'),
  }),
}
