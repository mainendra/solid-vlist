import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    // @ts-ignore
    port: process.env.PORT || 3000,
  },
  build: {
    target: 'es2015',
  },
});
