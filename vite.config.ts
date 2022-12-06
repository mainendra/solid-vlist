import legacy from '@vitejs/plugin-legacy';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [
      solidPlugin(),
      legacy({
          targets: ['Chrome > 40', 'not IE 11']
      })
  ],
  build: {
      target: 'es2015'
  }
});
