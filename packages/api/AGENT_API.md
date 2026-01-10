# Agent API 文档

## 概述

Agent API 提供了一个智能对话代理接口，支持流式响应、记忆管理和工具调用。

## 端点

### POST `/agent/stream` 🔒 需要认证

与 AI Agent 进行流式对话。

#### 权限要求

- 需要有效的 Bearer token
- 自动使用当前登录用户的身份

#### 请求

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "message": "你好，请介绍一下你自己",
  "maxContextLoadTime": 60,
  "language": "Chinese"
}
```

**参数说明:**

| 字段 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| message | string | 是 | - | 用户消息内容 |
| maxContextLoadTime | number | 否 | 从设置读取或60 | 加载上下文的时间范围（分钟，1-1440） |
| language | string | 否 | 从设置读取或"Same as user input" | Agent 回复的首选语言 |

**注意**: `maxContextLoadTime` 和 `language` 如果在请求中未指定，将从用户设置（Settings）中读取。如果设置中也没有，则使用默认值。

#### 响应

返回 Server-Sent Events (SSE) 流式响应。

**Content-Type:** `text/event-stream`

**事件格式:**

每个事件以 `data: ` 开头，后跟 JSON 格式的数据：

```
data: {"type":"text-delta","text":"你"}

data: {"type":"text-delta","text":"好"}

data: {"type":"tool-call","toolName":"search_memory","args":{...}}

data: [DONE]
```

**事件类型:**

1. **text-delta** - 文本增量
```json
{
  "type": "text-delta",
  "text": "文本片段"
}
```

2. **tool-call** - 工具调用
```json
{
  "type": "tool-call",
  "toolName": "search_memory",
  "args": {
    "query": "搜索内容"
  }
}
```

3. **[DONE]** - 流结束标记

4. **error** - 错误事件
```json
{
  "type": "error",
  "error": "错误消息"
}
```

#### 错误响应

**400 Bad Request** - 模型配置未找到
```json
{
  "success": false,
  "error": "Model configuration not found. Please configure your models in settings."
}
```

**401 Unauthorized** - 未认证
```json
{
  "success": false,
  "error": "No bearer token provided"
}
```

**500 Internal Server Error** - 服务器错误
```json
{
  "success": false,
  "error": "Failed to process request"
}
```

---

## 使用示例

### JavaScript/TypeScript (EventSource)

```typescript
async function streamAgentChat(message: string, token: string) {
  const response = await fetch('http://localhost:7002/agent/stream', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      maxContextLoadTime: 60,
      language: 'Chinese',
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error)
  }

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()

  if (!reader) throw new Error('No reader available')

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split('\n')

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        
        if (data === '[DONE]') {
          console.log('\n✅ Stream completed')
          return
        }

        try {
          const event = JSON.parse(data)
          
          if (event.type === 'text-delta' && event.text) {
            process.stdout.write(event.text)
          } else if (event.type === 'tool-call') {
            console.log(`\n[Tool: ${event.toolName}]`)
          } else if (event.type === 'error') {
            console.error('\n❌ Error:', event.error)
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }
}

// 使用示例
const token = 'your_jwt_token_here'
await streamAgentChat('你好，请介绍一下你自己', token)
```

### curl 示例

```bash
# 1. 登录获取 token
TOKEN=$(curl -X POST http://localhost:7002/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}' \
  | jq -r '.data.token')

# 2. 流式对话
curl -N -X POST http://localhost:7002/agent/stream \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "你好，请介绍一下你自己",
    "maxContextLoadTime": 60,
    "language": "Chinese"
  }'
```

### Python 示例

```python
import requests
import json

def stream_agent_chat(message: str, token: str):
    url = 'http://localhost:7002/agent/stream'
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
    }
    data = {
        'message': message,
        'maxContextLoadTime': 60,
        'language': 'Chinese',
    }

    with requests.post(url, headers=headers, json=data, stream=True) as response:
        response.raise_for_status()
        
        for line in response.iter_lines():
            if line:
                line_str = line.decode('utf-8')
                if line_str.startswith('data: '):
                    data = line_str[6:]
                    
                    if data == '[DONE]':
                        print('\n✅ Stream completed')
                        break
                    
                    try:
                        event = json.loads(data)
                        
                        if event.get('type') == 'text-delta' and event.get('text'):
                            print(event['text'], end='', flush=True)
                        elif event.get('type') == 'tool-call':
                            print(f"\n[Tool: {event['toolName']}]")
                        elif event.get('type') == 'error':
                            print(f"\n❌ Error: {event['error']}")
                    except json.JSONDecodeError:
                        pass

# 使用示例
token = 'your_jwt_token_here'
stream_agent_chat('你好，请介绍一下你自己', token)
```

---

## 工作原理

### 1. 认证验证

- 验证 JWT token
- 提取用户信息

### 2. 模型配置获取

从用户设置中获取：
- Chat Model（对话模型）
- Embedding Model（嵌入模型）
- Summary Model（摘要模型）

### 3. Agent 创建

- 创建 Memory 实例（用于记忆管理）
- 创建 Agent 实例，配置回调函数：
  - `onReadMemory`: 从数据库加载历史对话
  - `onSearchMemory`: 搜索相关记忆
  - `onFinish`: 保存对话到记忆

### 4. 流式响应

- Agent 处理用户消息
- 实时流式返回生成的文本
- 报告工具调用事件
- 完成后自动保存到记忆

### 5. 记忆管理

- 自动加载近期对话历史作为上下文
- 使用向量搜索查找相关记忆
- 对话结束后自动保存

---

## 特性

### ✅ 流式响应

- 实时返回生成的文本
- 无需等待完整响应
- 更好的用户体验

### ✅ 记忆管理

- 自动保存对话历史
- 智能加载相关上下文
- 向量搜索相关记忆

### ✅ 工具调用

- 支持搜索记忆工具
- 可扩展其他工具
- 实时报告工具使用

### ✅ 个性化配置

- 每个用户使用自己的模型配置
- 可自定义语言偏好
- 可配置上下文加载时间

---

## 前置条件

### 1. 配置模型和 Agent 设置

使用 Settings API 配置默认模型和 Agent 参数：

```bash
curl -X PUT http://localhost:7002/settings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "defaultChatModel": "chat-model-uuid",
    "defaultEmbeddingModel": "embedding-model-uuid",
    "defaultSummaryModel": "summary-model-uuid",
    "maxContextLoadTime": 60,
    "language": "Chinese"
  }'
```

详见 [Settings API 文档](./SETTINGS_API.md)

### 2. 创建模型配置

使用 Model API 创建模型：

```bash
curl -X POST http://localhost:7002/model \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "modelId": "gpt-4",
    "baseUrl": "https://api.openai.com/v1",
    "apiKey": "your-api-key",
    "clientType": "openai",
    "name": "GPT-4"
  }'
```

---

## 限制和注意事项

1. **模型配置必需**: 用户必须先配置好模型才能使用 Agent
2. **流式连接**: 需要支持 Server-Sent Events 的客户端
3. **超时处理**: 长时间无响应可能导致连接超时
4. **并发限制**: 建议每个用户同时只维护一个对话流

---

## 相关文档

- [认证系统](./AUTH_README.md)
- [用户管理](./USER_MANAGEMENT.md)
- [Settings API](./API_CHANGES.md)
- [Model API](./README.md)
- [Agent 包文档](../agent/README.md)

