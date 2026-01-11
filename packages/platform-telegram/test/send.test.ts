import { describe, expect, it } from "vitest"

describe('Telegram Platform', () => {
  it('should send a message to a user', async () => {
    const response = await fetch('http://localhost:7003/send', {
      method: 'POST',
      body: JSON.stringify({
        userId: '66392e42-333a-4ee9-9276-1b216d3400b1',
        message: 'Hello, world!',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    console.log(await response.json())
    expect(response.status).toBe(200)
  })
})