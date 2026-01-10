import { Model } from '@memohome/shared'
import { jsonb, pgTable, uuid } from 'drizzle-orm/pg-core'

export const model = pgTable('model', {
  id: uuid('id').primaryKey().defaultRandom(),
  model: jsonb('model').notNull().$type<Model>(),
})