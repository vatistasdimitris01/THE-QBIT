import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // When running `vercel dev`, Vercel handles the proxying automatically.
    // This proxy is useful if you were to run the frontend and backend separately.
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
});
