# 用户管理 API 文档

## 概述

用户管理模块提供了完整的用户 CRUD 操作接口，**仅限管理员访问**。所有端点都需要携带有效的管理员 JWT token。

## 权限要求

所有用户管理接口都受 `adminMiddleware` 保护：
- 必须提供有效的 Bearer token
- 用户角色必须是 `admin`
- 否则返回 `403 Forbidden` 错误

## API 端点

### 基础 URL

```
http://localhost:7002/user
```

### 请求头

所有请求都需要包含认证 token：

```
Authorization: Bearer <your_admin_jwt_token>
```

---

## 1. 获取所有用户 GET `/user`

获取系统中所有用户的列表。

### 请求示例

```bash
curl http://localhost:7002/user \
  -H "Authorization: Bearer <admin_token>"
```

### 成功响应 (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "member",
      "displayName": "John Doe",
      "avatarUrl": "https://example.com/avatar.jpg",
      "isActive": "true",
      "createdAt": "2024-01-10T10:00:00Z",
      "updatedAt": "2024-01-10T10:00:00Z",
      "lastLoginAt": "2024-01-10T12:00:00Z"
    }
  ]
}
```

---

## 2. 获取单个用户 GET `/user/:id`

根据用户 ID 获取用户详细信息。

### 路径参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| id | UUID | 是 | 用户的唯一标识符 |

### 请求示例

```bash
curl http://localhost:7002/user/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <admin_token>"
```

### 成功响应 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "member",
    "displayName": "John Doe",
    "avatarUrl": "https://example.com/avatar.jpg",
    "isActive": "true",
    "createdAt": "2024-01-10T10:00:00Z",
    "updatedAt": "2024-01-10T10:00:00Z",
    "lastLoginAt": "2024-01-10T12:00:00Z"
  }
}
```

### 错误响应 (404 Not Found)

```json
{
  "success": false,
  "error": "User not found"
}
```

---

## 3. 创建用户 POST `/user`

创建新用户账户。

### 请求体

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名（3-50字符，唯一） |
| email | string | 否 | 邮箱地址（必须是有效格式，唯一） |
| password | string | 是 | 密码（至少6个字符） |
| role | string | 否 | 用户角色：`admin` 或 `member`（默认 `member`） |
| displayName | string | 否 | 显示名称 |
| avatarUrl | string | 否 | 头像 URL（必须是有效的 URL） |

### 请求示例

```bash
curl -X POST http://localhost:7002/user \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jane_smith",
    "email": "jane@example.com",
    "password": "secure_password123",
    "role": "member",
    "displayName": "Jane Smith"
  }'
```

### 成功响应 (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "223e4567-e89b-12d3-a456-426614174001",
    "username": "jane_smith",
    "email": "jane@example.com",
    "role": "member",
    "displayName": "Jane Smith",
    "avatarUrl": null,
    "isActive": "true",
    "createdAt": "2024-01-10T15:00:00Z"
  }
}
```

**注意**: 创建用户时会自动创建一个默认的 settings 条目，包含：
- `maxContextLoadTime`: 60（分钟）
- `language`: "Same as user input"
- 所有模型配置为 `null`（需要用户后续配置）

### 错误响应 (409 Conflict)

```json
{
  "success": false,
  "error": "Username already exists"
}
```

或

```json
{
  "success": false,
  "error": "Email already exists"
}
```

---

## 4. 更新用户 PUT `/user/:id`

更新用户信息（不包括密码）。

### 路径参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| id | UUID | 是 | 用户的唯一标识符 |

### 请求体（所有字段都是可选的）

| 字段 | 类型 | 说明 |
|------|------|------|
| email | string | 邮箱地址 |
| role | string | 用户角色：`admin` 或 `member` |
| displayName | string | 显示名称 |
| avatarUrl | string | 头像 URL |
| isActive | string | 账户状态：`true` 或 `false` |

### 请求示例

```bash
curl -X PUT http://localhost:7002/user/223e4567-e89b-12d3-a456-426614174001 \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "Jane Smith (Updated)",
    "role": "admin",
    "isActive": "true"
  }'
```

### 成功响应 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "223e4567-e89b-12d3-a456-426614174001",
    "username": "jane_smith",
    "email": "jane@example.com",
    "role": "admin",
    "displayName": "Jane Smith (Updated)",
    "avatarUrl": null,
    "isActive": "true",
    "createdAt": "2024-01-10T15:00:00Z",
    "updatedAt": "2024-01-10T16:00:00Z",
    "lastLoginAt": null
  }
}
```

### 错误响应 (404 Not Found)

```json
{
  "success": false,
  "error": "User not found"
}
```

---

## 5. 删除用户 DELETE `/user/:id`

删除用户账户。

### 路径参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| id | UUID | 是 | 用户的唯一标识符 |

### 请求示例

```bash
curl -X DELETE http://localhost:7002/user/223e4567-e89b-12d3-a456-426614174001 \
  -H "Authorization: Bearer <admin_token>"
```

### 成功响应 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "223e4567-e89b-12d3-a456-426614174001",
    "username": "jane_smith"
  }
}
```

### 错误响应 (404 Not Found)

```json
{
  "success": false,
  "error": "User not found"
}
```

---

## 6. 更新用户密码 PATCH `/user/:id/password`

重置或更新用户密码。

### 路径参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| id | UUID | 是 | 用户的唯一标识符 |

### 请求体

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| password | string | 是 | 新密码（至少6个字符） |

### 请求示例

```bash
curl -X PATCH http://localhost:7002/user/223e4567-e89b-12d3-a456-426614174001/password \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "new_secure_password456"
  }'
```

### 成功响应 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "223e4567-e89b-12d3-a456-426614174001",
    "username": "jane_smith"
  },
  "message": "Password updated successfully"
}
```

### 错误响应 (404 Not Found)

```json
{
  "success": false,
  "error": "User not found"
}
```

---

## 错误响应

### 401 Unauthorized

未提供 token 或 token 无效：

```json
{
  "success": false,
  "error": "No bearer token provided"
}
```

### 403 Forbidden

非管理员用户尝试访问：

```json
{
  "success": false,
  "error": "Forbidden: Admin access required"
}
```

### 400 Bad Request

请求数据验证失败：

```json
{
  "success": false,
  "error": "Username must be at least 3 characters"
}
```

---

## 使用示例

### 完整工作流

```bash
# 1. 管理员登录获取 token
TOKEN=$(curl -X POST http://localhost:7002/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_admin_password"}' \
  | jq -r '.data.token')

# 2. 创建新用户
curl -X POST http://localhost:7002/user \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "new_user",
    "email": "newuser@example.com",
    "password": "password123",
    "role": "member",
    "displayName": "New User"
  }'

# 3. 获取所有用户
curl http://localhost:7002/user \
  -H "Authorization: Bearer $TOKEN"

# 4. 获取特定用户
USER_ID="123e4567-e89b-12d3-a456-426614174000"
curl http://localhost:7002/user/$USER_ID \
  -H "Authorization: Bearer $TOKEN"

# 5. 更新用户信息
curl -X PUT http://localhost:7002/user/$USER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "Updated Name",
    "role": "admin"
  }'

# 6. 重置用户密码
curl -X PATCH http://localhost:7002/user/$USER_ID/password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "new_password123"
  }'

# 7. 删除用户
curl -X DELETE http://localhost:7002/user/$USER_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## 自动化行为

### 创建用户时的自动操作

当创建新用户时，系统会自动执行以下操作：

1. **密码加密**: 使用 bcrypt 算法加密密码
2. **创建 Settings**: 自动为用户创建默认设置条目
   - `maxContextLoadTime`: 60 分钟
   - `language`: "Same as user input"
   - 模型配置: 全部为 null（需要用户后续配置）

这确保每个用户都有完整的配置，可以立即使用系统功能。

---

## 安全注意事项

1. **管理员权限**：
   - 所有接口仅限管理员访问
   - 确保 Root 用户的密码强度足够
   - 定期审计管理员账户

2. **密码安全**：
   - 密码使用 bcrypt 加密存储
   - 最少 6 个字符（建议更高要求）
   - 重置密码后建议通知用户

3. **数据验证**：
   - 所有输入都经过严格验证
   - 邮箱和用户名必须唯一
   - URL 格式必须有效

4. **用户状态**：
   - 使用 `isActive` 字段禁用用户而非直接删除
   - 保留用户数据用于审计

---

## 相关文档

- [认证系统文档](./AUTH_README.md)
- [用户表设计](../db/USERS_SCHEMA.md)
- [项目设置指南](../../SETUP.md)

