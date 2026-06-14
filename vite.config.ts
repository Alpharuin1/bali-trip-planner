import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // The workspace path contains a space ("Bali Trip Planning"), which
    // periodically breaks macOS fsevents-backed file watching. Polling is
    // a tad more CPU but always reliable.
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
})
