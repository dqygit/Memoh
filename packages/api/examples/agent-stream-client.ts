/**
 * Agent Stream Client Example
 * 
 * This example demonstrates how to use the /agent/stream API endpoint
 * to have a streaming conversation with the AI agent.
 * 
 * Usage:
 *   bun run agent-stream-client.ts
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:7002'

interface LoginResponse {
  success: boolean
  data?: {
    token: string
    user: {
      id: string
      username: string
      role: string
    }
  }
  error?: string
}

async function login(username: string, password: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })

  const data: LoginResponse = await response.json()

  if (!data.success || !data.data?.token) {
    throw new Error(data.error || 'Login failed')
  }

  return data.data.token
}

async function streamAgentChat(message: string, token: string) {
  console.log(`\n📤 User: ${message}`)
  console.log('🤖 Agent: ', { end: '' })

  const response = await fetch(`${API_BASE_URL}/agent/stream`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      maxContextLoadTime: 60,
      language: 'Same as user input',
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Stream request failed')
  }

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()

  if (!reader) {
    throw new Error('No reader available')
  }

  let hasOutput = false

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()

          if (data === '[DONE]') {
            console.log('\n\n✅ Stream completed')
            return
          }

          if (!data) continue

          try {
            const event = JSON.parse(data)

            if (event.type === 'text-delta' && event.text) {
              process.stdout.write(event.text)
              hasOutput = true
            } else if (event.type === 'tool-call') {
              console.log(`\n[🔧 Tool: ${event.toolName}]`)
              hasOutput = true
            } else if (event.type === 'error') {
              console.error('\n❌ Error:', event.error)
              throw new Error(event.error)
            }
          } catch (e) {
            if (e instanceof SyntaxError) {
              // Skip invalid JSON
              continue
            }
            throw e
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  if (!hasOutput) {
    console.log('(No response)')
  }
}

async function main() {
  try {
    // Get credentials from environment or use defaults
    const username = process.env.USERNAME || 'admin'
    const password = process.env.PASSWORD || 'admin'

    console.log('🔐 Logging in...')
    const token = await login(username, password)
    console.log('✅ Login successful')

    // Example conversations
    const messages = [
      '你好，请介绍一下你自己',
      '你能帮我做什么？',
      '记住：我的名字是张三',
      '我的名字是什么？',
    ]

    for (const message of messages) {
      await streamAgentChat(message, token)
      // Wait a bit between messages
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log('\n🎉 All conversations completed!')
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n👋 Goodbye!')
  process.exit(0)
})

main()

