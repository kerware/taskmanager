import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    // Ouvre automatiquement le navigateur au démarrage
    open: true,
    proxy: {
      // Toutes les requêtes /api/* sont redirigées vers le backend Spring Boot
      // Sans ce proxy, le navigateur essaierait d'appeler localhost:3000/api
      // et obtiendrait une erreur CORS ou 404.
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // Pas de rewrite : /api/tasks reste /api/tasks côté backend
      },
      // Actuator health check (utile pour débugger)
      '/actuator': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },

  // Preview (npm run preview) — même config que le serveur de dev
  preview: {
    port: 3000,
  },

  // Configuration Vitest
  test: {
    globals:     true,
    environment: 'jsdom',
    setupFiles:  './src/test/setup.js',
    coverage: {
      provider:   'v8',
      reporter:   ['text', 'html'],
      thresholds: { lines: 70 },
    },
  },
})
