import legacy from '@vitejs/plugin-legacy';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
      solidPlugin(),
      legacy({
          targets: ['Chrome > 40', 'not IE 11']
      }),
    tailwindcss(),
  ],
  build: {
      target: 'es2015',
      // terser is required for a legacy-safe minified bundle; esbuild (the
      // default) is not applied to legacy chunks by @vitejs/plugin-legacy.
      minify: 'terser'
  }
});
