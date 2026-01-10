import { db } from '@memohome/db'
import { history } from '@memohome/db/schema'
import { eq, desc, and, gte, lte, asc } from 'drizzle-orm'

export const getMemoryMessages = async (
  query: {
    limit: number
    page: number
    userId: string
  }
) => {
  const { limit, page, userId } = query
  const results = await db
    .select()
    .from(history)
    .where(eq(history.user, userId))
    .orderBy(desc(history.timestamp))
    .limit(limit)
    .offset((page - 1) * limit)

  return results
}

export const getMemoryMessagesFilter = async (
  query: {
    from: Date
    to: Date
    userId: string
  }
) => {
  const { from, to, userId } = query
  const results = await db
    .select()
    .from(history)
    .where(and(
      gte(history.timestamp, from),
      lte(history.timestamp, to),
      eq(history.user, userId),
    ))
    .orderBy(asc(history.timestamp))

  return results
}