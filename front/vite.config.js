import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  build: {
    outDir: '/var/www/growthapp',
    emptyOutDir: true         
  }
})
