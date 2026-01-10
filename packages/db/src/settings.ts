import { pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { model } from './model'

export const settings = pgTable('settings', {
  userId: text('user_id').primaryKey(),
  defaultChatModel: uuid('default_chat_model').references(() => model.id),
  defaultEmbeddingModel: uuid('default_embedding_model').references(() => model.id),
  defaultSummaryModel: uuid('default_summary_model').references(() => model.id),
})