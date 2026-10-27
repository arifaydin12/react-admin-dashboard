import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Relative base so the built site works from any sub-path (e.g. GitHub Pages
// project sites). Routing uses HashRouter, so no server rewrites are needed.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    // `vendor` (Ant Design) is the largest chunk; the charts engine is loaded
    // lazily and the entry chunk stays far below 500 kB.
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // Coarse vendor chunks. Keep this list short: splitting a dependency
        // graph too finely creates circular chunk imports that break at runtime.
        manualChunks(id: string) {
          // Virtual helper modules (CommonJS interop, dynamic-import preload) must
          // not end up in a lazy chunk, or every page would download the charts bundle up front.
          if (id.includes('commonjsHelpers') || id.includes('vite/preload-helper')) return 'react-vendor'
          if (!id.includes('node_modules')) return undefined
          if (id.includes('@faker-js')) return 'faker'
          if (/node_modules\/(@antv|@ant-design\/(charts|plots|graphs))\//.test(id)) return 'charts'
          if (/node_modules\/(react|react-dom|scheduler|react-router|react-router-dom|cookie|set-cookie-parser)\//.test(id)) {
            return 'react-vendor'
          }
          return 'vendor'
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
  },
})
