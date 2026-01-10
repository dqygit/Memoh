import { pgTable, text, uuid, integer } from 'drizzle-orm/pg-core'
import { model } from './model'

export const settings = pgTable('settings', {
  userId: text('user_id').primaryKey(),
  defaultChatModel: uuid('default_chat_model').references(() => model.id),
  defaultEmbeddingModel: uuid('default_embedding_model').references(() => model.id),
  defaultSummaryModel: uuid('default_summary_model').references(() => model.id),
  // Agent settings
  maxContextLoadTime: integer('max_context_load_time').default(60), // minutes
  language: text('language').default('Same as user input'),
})