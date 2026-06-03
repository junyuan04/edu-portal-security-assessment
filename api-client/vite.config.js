import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/api-client/',
  server: {
    port: 5174,   // different port from main frontend (5173)
    proxy: {
      '/rest': {
        target:       'http://localhost:4000',
        changeOrigin: true,
        rewrite:      (path) => path.replace(/^\/rest/, ''),
      },
    },
  },
});


