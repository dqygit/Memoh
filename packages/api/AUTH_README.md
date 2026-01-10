# 认证系统使用文档

## 概述

本项目使用 JWT (JSON Web Token) 进行用户认证，集成了 Elysia 官方插件：
- [@elysiajs/jwt](https://elysiajs.com/plugins/jwt.html) - JWT token 生成和验证
- [@elysiajs/bearer](https://elysiajs.com/plugins/bearer.html) - Bearer token 提取

## 环境变量配置

在项目根目录的 `.env` 文件中配置以下变量：

```bash
# Root 超级用户配置
ROOT_USER=admin
ROOT_USER_PASSWORD=your_secure_password

# JWT 配置
JWT_SECRET=your-jwt-secret-key-change-in-production
JWT_EXPIRES_IN=7d  # Token 有效期，可选

# API 服务器端口
API_SERVER_PORT=7002
```

## API 端点

### 1. 登录 POST `/auth/login`

用户登录并获取 JWT token。

**请求体：**
```json
{
  "username": "admin",
  "password": "your_password"
}
```

**成功响应：**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "root",
      "username": "admin",
      "role": "admin",
      "displayName": "Root User",
      "email": null
    }
  }
}
```

**失败响应：**
```json
{
  "success": false,
  "error": "Invalid username or password"
}
```

### 2. 验证 Token GET `/auth/verify`

验证 JWT token 是否有效。

**请求头：**
```
Authorization: Bearer <your_jwt_token>
```

**成功响应：**
```json
{
  "success": true,
  "data": {
    "userId": "root",
    "username": "admin",
    "role": "admin"
  }
}
```

**失败响应：**
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

### 3. 获取当前用户信息 GET `/auth/me`

获取当前登录用户的信息。

**请求头：**
```
Authorization: Bearer <your_jwt_token>
```

**成功响应：**
```json
{
  "success": true,
  "data": {
    "userId": "root",
    "username": "admin",
    "role": "admin"
  }
}
```

## 使用示例

### JavaScript/TypeScript 客户端

```typescript
// 1. 登录
const loginResponse = await fetch('http://localhost:7002/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'your_password',
  }),
})

const loginData = await loginResponse.json()
const token = loginData.data.token

// 2. 使用 token 访问受保护的资源
const meResponse = await fetch('http://localhost:7002/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
})

const userData = await meResponse.json()
console.log(userData.data) // 用户信息
```

### curl 示例

```bash
# 1. 登录
curl -X POST http://localhost:7002/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}'

# 2. 使用返回的 token 访问受保护资源
TOKEN="<your_jwt_token>"
curl http://localhost:7002/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## 在其他模块中使用认证

### 使用认证中间件

项目提供了三个认证中间件：

#### 1. `authMiddleware` - 强制认证

要求请求必须包含有效的 Bearer token，否则返回 401。

```typescript
import Elysia from 'elysia'
import { authMiddleware } from './middlewares'

export const protectedModule = new Elysia({ prefix: '/protected' })
  .use(authMiddleware)
  .get('/data', ({ user }) => {
    // user 包含: { userId, username, role }
    return {
      success: true,
      message: `Hello ${user.username}!`,
    }
  })
```

#### 2. `optionalAuthMiddleware` - 可选认证

如果有 token 则验证，没有 token 也允许访问（user 为 null）。

```typescript
import Elysia from 'elysia'
import { optionalAuthMiddleware } from './middlewares'

export const publicModule = new Elysia({ prefix: '/public' })
  .use(optionalAuthMiddleware)
  .get('/data', ({ user }) => {
    if (user) {
      return { message: `Welcome back, ${user.username}!` }
    }
    return { message: 'Welcome, guest!' }
  })
```

#### 3. `adminMiddleware` - 管理员权限

要求用户必须是 admin 角色，否则返回 403。

```typescript
import Elysia from 'elysia'
import { adminMiddleware } from './middlewares'

export const adminModule = new Elysia({ prefix: '/admin' })
  .use(adminMiddleware)
  .get('/users', ({ user }) => {
    // 只有 admin 才能访问
    return { success: true, data: [] }
  })
```

## Root 用户说明

Root 用户是通过环境变量配置的超级管理员：

- **优先级最高**：登录时优先检查是否为 Root 用户
- **不存储在数据库**：直接通过环境变量验证
- **始终是 admin 角色**：拥有最高权限
- **用于系统初始化**：可用于创建其他管理员用户

## 数据库用户

除了 Root 用户外，系统支持在数据库中创建普通用户：

```typescript
import { createUser } from '@memohome/db/src/user-helpers'

// 创建新用户
const newUser = await createUser({
  username: 'john_doe',
  email: 'john@example.com',
  passwordHash: await Bun.password.hash('password123'),
  role: 'member',
  displayName: 'John Doe',
})
```

用户密码使用 `Bun.password.hash` 加密存储，登录时使用 `Bun.password.verify` 验证。

## 安全建议

1. **生产环境配置**：
   - 使用强密码作为 `ROOT_USER_PASSWORD`
   - 设置随机的 `JWT_SECRET`（至少 32 字符）
   - 不要将 `.env` 文件提交到代码仓库

2. **Token 管理**：
   - Token 默认有效期为 7 天
   - 前端应安全存储 token（如 httpOnly cookie 或安全的 localStorage）
   - Token 过期后需要重新登录

3. **密码策略**：
   - 要求用户使用强密码
   - 考虑实现密码复杂度验证
   - 考虑添加密码重置功能

## 技术栈

- **Elysia**：Web 框架
- **@elysiajs/jwt**：JWT token 生成和验证插件
- **@elysiajs/bearer**：Bearer token 提取插件
- **Bun.password**：密码加密和验证（基于 bcrypt）
- **Drizzle ORM**：数据库操作

## 相关文档

- [Elysia JWT Plugin](https://elysiajs.com/plugins/jwt.html)
- [Elysia Bearer Plugin](https://elysiajs.com/plugins/bearer.html)
- [用户表设计文档](../db/USERS_SCHEMA.md)

