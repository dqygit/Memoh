import { createOpenAI } from '@ai-sdk/openai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { ClientType, ModelConfig } from './types'

export const createModel = (model: ModelConfig) => {
  const apiKey = model.apiKey.trim()
  const baseURL = model.baseUrl.trim()
  const modelId = model.modelId.trim()

  switch (model.clientType) {
    case ClientType.OpenAIResponses:
      return createOpenAI({ apiKey, baseURL })(modelId)
    case ClientType.OpenAICompletions:
      return createOpenAICompatible({ name: 'openai', apiKey, baseURL }).chatModel(modelId)
    case ClientType.AnthropicMessages:
      return createAnthropic({ apiKey, baseURL })(modelId)
    case ClientType.GoogleGenerativeAI:
      return createGoogleGenerativeAI({ apiKey, baseURL })(modelId)
    default:
      return createOpenAICompatible({ name: 'openai', apiKey, baseURL }).chatModel(modelId)
  }
}
