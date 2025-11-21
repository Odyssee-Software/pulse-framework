import { defineConfig } from 'vite'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      insertTypesEntry: true,
      rollupTypes: false // Désactivé pour permettre plusieurs entrées
    })
  ],
  build: {
    lib: {
      entry: {
        index: resolve(fileURLToPath(new URL('.', import.meta.url)), 'src/index.ts'),
        'jsx-runtime': resolve(fileURLToPath(new URL('.', import.meta.url)), 'src/jsx-runtime.ts')
      },
      name: 'PulseFramework',
      fileName: (format: string, entryName: string) => 
        `${entryName}.${format === 'es' ? 'js' : 'umd.js'}`,
      formats: ['es']
    },
    rollupOptions: {
      output: {
        exports: 'named'
      }
    },
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2022'
  },
  resolve: {
    alias: {
      '@': resolve(fileURLToPath(new URL('.', import.meta.url)), 'src')
    }
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production')
  }
})