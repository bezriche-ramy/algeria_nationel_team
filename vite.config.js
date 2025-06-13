import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Optimize for external HDD performance
    watch: {
      usePolling: true,
      interval: 1000,
      binaryInterval: 1000,
      ignored: ['**/node_modules/**', '**/.git/**']
    },
    // Reduce file system stress
    fs: {
      strict: false
    }
  },
  // Optimize build for external drive
  build: {
    // Reduce concurrent operations
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  // Optimize dependencies pre-bundling
  optimizeDeps: {
    // Reduce file system operations
    force: false,
    include: ['react', 'react-dom', '@react-three/fiber', '@react-three/drei', 'three']
  }
})
