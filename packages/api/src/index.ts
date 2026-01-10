import { Elysia } from 'elysia'
import { corsMiddleware } from './middlewares'
import { agentModule, authModule, modelModule, settingsModule, userModule } from './modules'
import { memoryModule } from './modules/memory'

const port = process.env.API_SERVER_PORT || 7002

export const app = new Elysia()
  .use(corsMiddleware)
  .use(authModule)
  .use(agentModule)
  .use(memoryModule)
  .use(modelModule)
  .use(settingsModule)
  .use(userModule)
  .listen(port)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
