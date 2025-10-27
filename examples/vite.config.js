import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  server: {
    port: 3000,
    open: true
  },
  resolve: {
    alias: {
      'pulse-framework': resolve(__dirname, '../src/index.ts'),
      '../src': resolve(__dirname, '../src'),
      '../dist': resolve(__dirname, '../dist')
    }
  },
  define: {
    __DEV__: JSON.stringify(true)
  }
})