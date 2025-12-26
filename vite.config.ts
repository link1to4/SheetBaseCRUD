import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { cwd } from 'node:process';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, cwd(), '');
  return {
    plugins: [react()],
    // Ensure process.env.API_KEY works in the client-side code
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});