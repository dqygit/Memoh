# Settings API 文档

## 概述

Settings API 用于管理用户的个性化设置，包括默认模型配置和 Agent 行为设置。

## 端点

### GET `/settings` 🔒 需要认证

获取当前用户的设置。

#### 请求

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

#### 成功响应 (200 OK)

```json
{
  "success": true,
  "data": {
    "userId": "user-id",
    "defaultChatModel": "123e4567-e89b-12d3-a456-426614174000",
    "defaultEmbeddingModel": "223e4567-e89b-12d3-a456-426614174001",
    "defaultSummaryModel": "323e4567-e89b-12d3-a456-426614174002",
    "maxContextLoadTime": 60,
    "language": "Chinese"
  }
}
```

#### 错误响应 (404 Not Found)

```json
{
  "success": false,
  "error": "Settings not found"
}
```

---

### PUT `/settings` 🔒 需要认证

更新或创建当前用户的设置（Upsert 操作）。

#### 请求

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "defaultChatModel": "123e4567-e89b-12d3-a456-426614174000",
  "defaultEmbeddingModel": "223e4567-e89b-12d3-a456-426614174001",
  "defaultSummaryModel": "323e4567-e89b-12d3-a456-426614174002",
  "maxContextLoadTime": 60,
  "language": "Chinese"
}
```

**参数说明:**

| 字段 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| defaultChatModel | string (uuid) | 否 | null | 默认聊天模型 ID |
| defaultEmbeddingModel | string (uuid) | 否 | null | 默认嵌入模型 ID |
| defaultSummaryModel | string (uuid) | 否 | null | 默认摘要模型 ID |
| maxContextLoadTime | number | 否 | 60 | Agent 加载上下文的时间范围（分钟，1-1440） |
| language | string | 否 | "Same as user input" | Agent 回复的首选语言 |

#### 成功响应 (200 OK)

```json
{
  "success": true,
  "data": {
    "userId": "user-id",
    "defaultChatModel": "123e4567-e89b-12d3-a456-426614174000",
    "defaultEmbeddingModel": "223e4567-e89b-12d3-a456-426614174001",
    "defaultSummaryModel": "323e4567-e89b-12d3-a456-426614174002",
    "maxContextLoadTime": 60,
    "language": "Chinese"
  }
}
```

---

## 使用示例

### 完整工作流

```bash
# 1. 登录获取 token
TOKEN=$(curl -X POST http://localhost:7002/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}' \
  | jq -r '.data.token')

# 2. 获取当前设置
curl http://localhost:7002/settings \
  -H "Authorization: Bearer $TOKEN"

# 3. 更新设置
curl -X PUT http://localhost:7002/settings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "defaultChatModel": "123e4567-e89b-12d3-a456-426614174000",
    "defaultEmbeddingModel": "223e4567-e89b-12d3-a456-426614174001",
    "defaultSummaryModel": "323e4567-e89b-12d3-a456-426614174002",
    "maxContextLoadTime": 120,
    "language": "English"
  }'

# 4. 只更新部分字段
curl -X PUT http://localhost:7002/settings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "maxContextLoadTime": 30,
    "language": "Chinese"
  }'
```

### JavaScript/TypeScript 示例

```typescript
// 获取设置
async function getSettings(token: string) {
  const response = await fetch('http://localhost:7002/settings', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  
  const data = await response.json()
  return data
}

// 更新设置
async function updateSettings(token: string, settings: {
  defaultChatModel?: string
  defaultEmbeddingModel?: string
  defaultSummaryModel?: string
  maxContextLoadTime?: number
  language?: string
}) {
  const response = await fetch('http://localhost:7002/settings', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  })
  
  const data = await response.json()
  return data
}

// 使用示例
const token = 'your_jwt_token'

// 获取当前设置
const currentSettings = await getSettings(token)
console.log(currentSettings)

// 更新 Agent 设置
await updateSettings(token, {
  maxContextLoadTime: 90,
  language: 'Chinese',
})
```

---

## Agent 设置说明

### maxContextLoadTime

控制 Agent 加载历史对话上下文的时间范围。

- **类型**: 整数（分钟）
- **范围**: 1-1440（1分钟到24小时）
- **默认值**: 60（1小时）
- **说明**: 
  - 值越大，Agent 能访问更久远的对话历史
  - 但也会增加 token 使用量和响应时间
  - 建议根据实际需求调整

**示例:**
- `30` - 加载最近30分钟的对话
- `60` - 加载最近1小时的对话（默认）
- `1440` - 加载最近24小时的对话

### language

设置 Agent 回复的首选语言。

- **类型**: 字符串
- **默认值**: "Same as user input"（与用户输入相同）
- **说明**: 
  - 可以设置为任何语言名称
  - Agent 会尽量使用指定语言回复
  - 特殊值 "Same as user input" 表示跟随用户输入语言

**常用值:**
- `"Same as user input"` - 自动匹配用户语言（默认）
- `"Chinese"` - 中文
- `"English"` - 英文
- `"Japanese"` - 日文
- `"Spanish"` - 西班牙语

---

## Agent 使用优先级

当使用 Agent API 时，配置的优先级为：

1. **请求参数** - `/agent/stream` 请求中直接指定的参数
2. **用户设置** - Settings 中保存的默认值
3. **系统默认** - 内置的默认值

**示例:**

```bash
# 情况1: 使用请求参数（最高优先级）
curl -X POST http://localhost:7002/agent/stream \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "Hello",
    "maxContextLoadTime": 30,
    "language": "English"
  }'
# 使用: maxContextLoadTime=30, language="English"

# 情况2: 使用用户设置（如果请求中未指定）
# 假设用户设置: maxContextLoadTime=60, language="Chinese"
curl -X POST http://localhost:7002/agent/stream \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message": "Hello"}'
# 使用: maxContextLoadTime=60, language="Chinese"

# 情况3: 使用系统默认（如果都未设置）
# 使用: maxContextLoadTime=60, language="Same as user input"
```

---

## 数据库 Schema

```sql
CREATE TABLE settings (
  user_id TEXT PRIMARY KEY,
  default_chat_model UUID REFERENCES model(id),
  default_embedding_model UUID REFERENCES model(id),
  default_summary_model UUID REFERENCES model(id),
  max_context_load_time INTEGER DEFAULT 60,
  language TEXT DEFAULT 'Same as user input'
);
```

---

## 相关文档

- [Agent API](./AGENT_API.md)
- [Model API](./README.md)
- [认证系统](./AUTH_README.md)
- [API 变更说明](./API_CHANGES.md)

