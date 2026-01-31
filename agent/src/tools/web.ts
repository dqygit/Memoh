import { tool } from 'ai'
import { z } from 'zod'

interface WebToolParams {
  braveApiKey: string
  braveBaseUrl?: string
}

interface BraveSearchResult {
  type: string
  title: string
  url: string
  description?: string
  age?: string
}

interface BraveSearchResponse {
  web?: {
    results: BraveSearchResult[]
  }
}

export const getWebTools = ({ braveApiKey, braveBaseUrl = 'https://api.search.brave.com/res/v1/' }: WebToolParams) => {
  const webSearch = tool({
    description: 'Search the web for information using Brave Search API. Use this when you need current information, facts, news, or any web content.',
    inputSchema: z.object({
      query: z.string().describe('The search query to look up on the web'),
      count: z.number().optional().describe('Number of results to return (default: 10, max: 20)'),
    }),
    execute: async ({ query, count = 10 }) => {
      try {
        const url = new URL('web/search', braveBaseUrl)
        url.searchParams.append('q', query)
        url.searchParams.append('count', Math.min(count, 20).toString())
        
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip',
            'X-Subscription-Token': braveApiKey,
          },
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('[Web Search] error', {
            type: 'web_search',
            query,
            count,
            status: response.status,
            statusText: response.statusText,
            error: errorText,
          })
          throw new Error(`Brave Search API error: ${response.status} ${response.statusText}`)
        }

        const data: BraveSearchResponse = await response.json()
        
        const results = data.web?.results || []

        if (results.length === 0) {
          return {
            success: false,
            message: 'No results found for the query',
            query,
          }
        }

        return {
          success: true,
          query,
          results: results.map((result) => ({
            title: result.title,
            url: result.url,
            description: result.description,
            age: result.age,
          })),
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          query,
        }
      }
    },
  })

  return {
    'web_search': webSearch,
  }
}