import { defineConfig } from 'vite'

export default defineConfig({
  base: '/', // important pour tes routes SPA
  build: {
    outDir: '/var/www/growthapp', // chemin absolu vers ton dossier servi par Nginx
    emptyOutDir: true             // vide le dossier avant chaque build
  }
})