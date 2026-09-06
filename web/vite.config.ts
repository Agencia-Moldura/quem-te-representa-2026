import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // pasta de scripts/saídas de screenshot — não deve derrubar o dev server
    watch: { ignored: ['**/.shots/**'] },
  },
})
