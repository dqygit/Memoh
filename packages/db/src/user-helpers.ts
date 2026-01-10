import { eq } from 'drizzle-orm'
import { db } from './index'
import { users } from './users'

/**
 * 用户操作辅助函数
 * 这些函数提供了常用的用户、用户组操作
 */

// ============= 用户操作 =============

/**
 * 根据用户名查找用户
 */
export async function findUserByUsername(username: string) {
  const result = await db.select().from(users).where(eq(users.username, username))
  return result[0] || null
}

/**
 * 根据邮箱查找用户
 */
export async function findUserByEmail(email: string) {
  const result = await db.select().from(users).where(eq(users.email, email))
  return result[0] || null
}

/**
 * 根据ID查找用户
 */
export async function findUserById(id: string) {
  const result = await db.select().from(users).where(eq(users.id, id))
  return result[0] || null
}

/**
 * 创建新用户
 */
export async function createUser(data: {
  username: string
  email?: string
  passwordHash: string
  role?: 'admin' | 'member'
  displayName?: string
  avatarUrl?: string
}) {
  const result = await db.insert(users).values({
    username: data.username,
    email: data.email,
    passwordHash: data.passwordHash,
    role: data.role || 'member',
    displayName: data.displayName,
    avatarUrl: data.avatarUrl,
  }).returning()
  
  return result[0]
}

/**
 * 更新用户信息
 */
export async function updateUser(id: string, data: {
  displayName?: string
  avatarUrl?: string
  email?: string
  role?: 'admin' | 'member'
  isActive?: string
}) {
  const result = await db
    .update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning()
  
  return result[0]
}

/**
 * 更新用户密码
 */
export async function updateUserPassword(id: string, passwordHash: string) {
  await db
    .update(users)
    .set({
      passwordHash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
}

/**
 * 更新最后登录时间
 */
export async function updateLastLogin(id: string) {
  await db
    .update(users)
    .set({
      lastLoginAt: new Date(),
    })
    .where(eq(users.id, id))
}

/**
 * 删除用户
 */
export async function deleteUser(id: string) {
  await db.delete(users).where(eq(users.id, id))
}

