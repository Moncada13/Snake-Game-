import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
  },
  define: {
    'process.env': {
      REACT_APP_API_URL: 'http://localhost:3010',
    },
  },
});

