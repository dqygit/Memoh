# API 变更说明

## 🔒 Settings 和 Memory 模块现已使用认证

### 概述

Settings 和 Memory 模块现在使用 JWT 认证中间件，自动从 token 中获取当前用户信息，**不再需要手动传入 userId**。

---

## Settings 模块变更

### ❌ 旧 API（已废弃）

```bash
# 获取用户设置
GET /settings/:userId

# 创建用户设置
POST /settings
{
  "userId": "user123",
  "defaultChatModel": "uuid-here"
}

# 更新用户设置
PUT /settings/:userId
{
  "defaultChatModel": "uuid-here"
}
```

### ✅ 新 API（需要认证）

```bash
# 获取当前用户的设置
GET /settings
Authorization: Bearer <token>

# 更新或创建当前用户的设置
PUT /settings
Authorization: Bearer <token>
{
  "defaultChatModel": "uuid-here",
  "defaultEmbeddingModel": "uuid-here",
  "defaultSummaryModel": "uuid-here",
  "maxContextLoadTime": 60,
  "language": "Chinese"
}
```

### 使用示例

```bash
# 1. 登录获取 token
TOKEN=$(curl -X POST http://localhost:7002/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass"}' \
  | jq -r '.data.token')

# 2. 获取我的设置
curl http://localhost:7002/settings \
  -H "Authorization: Bearer $TOKEN"

# 3. 更新我的设置
curl -X PUT http://localhost:7002/settings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "defaultChatModel": "123e4567-e89b-12d3-a456-426614174000",
    "maxContextLoadTime": 60,
    "language": "Chinese"
  }'
```

---

## Memory 模块变更

### ❌ 旧 API（已废弃）

```bash
# 添加记忆
POST /memory
{
  "messages": [...],
  "timestamp": "2024-01-10T10:00:00Z",
  "user": "user123"
}

# 搜索记忆
GET /memory/search?query=hello&userId=user123

# 获取消息历史
GET /memory/message?page=1&limit=10&userId=user123

# 按日期过滤消息
GET /memory/message/filter?from=2024-01-01&to=2024-01-31&userId=user123
```

### ✅ 新 API（需要认证）

```bash
# 添加记忆（自动使用当前用户）
POST /memory
Authorization: Bearer <token>
{
  "messages": [...],
  "timestamp": "2024-01-10T10:00:00Z"
}

# 搜索当前用户的记忆
GET /memory/search?query=hello
Authorization: Bearer <token>

# 获取当前用户的消息历史
GET /memory/message?page=1&limit=10
Authorization: Bearer <token>

# 按日期过滤当前用户的消息
GET /memory/message/filter?from=2024-01-01&to=2024-01-31
Authorization: Bearer <token>
```

### 使用示例

```bash
# 1. 登录获取 token
TOKEN=$(curl -X POST http://localhost:7002/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass"}' \
  | jq -r '.data.token')

# 2. 添加记忆
curl -X POST http://localhost:7002/memory \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello"},
      {"role": "assistant", "content": "Hi there!"}
    ],
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
  }'

# 3. 搜索记忆
curl "http://localhost:7002/memory/search?query=hello" \
  -H "Authorization: Bearer $TOKEN"

# 4. 获取消息历史（分页）
curl "http://localhost:7002/memory/message?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# 5. 按日期范围过滤
curl "http://localhost:7002/memory/message/filter?from=2024-01-01&to=2024-01-31" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 安全优势

### ✅ 更安全

- 用户只能访问自己的数据
- 无法通过修改 userId 参数访问其他用户的数据
- 所有操作都需要有效的认证 token

### ✅ 更简洁

- API 调用更简单，无需手动传递 userId
- 减少了参数验证和错误处理
- 代码更清晰易维护

### ✅ 一致性

- 与其他需要认证的模块保持一致
- 统一的认证流程和错误处理
- 符合 RESTful 最佳实践

---

## 迁移指南

### 1. 更新客户端代码

#### 之前：
```javascript
// 需要手动传入 userId
const settings = await fetch(`/settings/${userId}`)
const memories = await fetch(`/memory/search?query=hello&userId=${userId}`)
```

#### 现在：
```javascript
// 自动使用 token 中的用户信息
const settings = await fetch('/settings', {
  headers: { 'Authorization': `Bearer ${token}` }
})

const memories = await fetch('/memory/search?query=hello', {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

### 2. 错误处理

新增错误响应：

```json
// 401 Unauthorized - 未提供 token 或 token 无效
{
  "success": false,
  "error": "No bearer token provided"
}

// 401 Unauthorized - Token 过期
{
  "success": false,
  "error": "Invalid or expired token"
}
```

---

## API 端点总结

### Settings 模块 `/settings` 🔒

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/` | 获取当前用户设置 | ✅ 必需 |
| PUT | `/` | 更新当前用户设置 | ✅ 必需 |

### Memory 模块 `/memory` 🔒

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/` | 添加记忆 | ✅ 必需 |
| GET | `/search` | 搜索记忆 | ✅ 必需 |
| GET | `/message` | 获取消息列表（分页） | ✅ 必需 |
| GET | `/message/filter` | 按日期范围过滤消息 | ✅ 必需 |

---

## 相关文档

- [认证系统文档](./AUTH_README.md)
- [用户管理文档](./USER_MANAGEMENT.md)
- [项目设置指南](../../SETUP.md)

