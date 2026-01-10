import { app } from './index'
import { treaty } from '@elysiajs/eden'

export type ApiClient = typeof app

export const createClient = (
  baseUrl: string = process.env.API_BASE_URL ?? 'http://localhost:7002'
) => {
  return treaty<ApiClient>(baseUrl)
}