import legacy from '@vitejs/plugin-legacy';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [
      solidPlugin(),
      legacy({
          targets: ['Safari >= 12', 'not IE 11']
      })
  ],
  build: {
      target: 'es2015'
  }
});
