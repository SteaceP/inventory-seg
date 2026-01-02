import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'mui-vendor': ['@mui/material', '@mui/icons-material'],
          'scanner-vendor': ['html5-qrcode'],
          'framer-vendor': ['framer-motion'],
        },
      },
    },
  },
})
