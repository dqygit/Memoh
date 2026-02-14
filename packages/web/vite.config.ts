import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url'
import { loadConfig, getBaseUrl } from '@memoh/config'

const config = loadConfig('../../config.toml')
const { web: { port = 8082, host = '127.0.0.1' } } = config
const baseUrl = getBaseUrl(config)

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    port,
    host,
    proxy: {
      '/api': {
        target: baseUrl,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: baseUrl,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    allowedHosts: true,
  },
  resolve: {
    alias: {
      '#': fileURLToPath(new URL('../ui/src', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
