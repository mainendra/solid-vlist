import { defineConfig, loadEnv } from 'vite';
import solidPlugin from 'vite-plugin-solid';

// @ts-ignore
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // @ts-ignore
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [solidPlugin()],
    server: {
        port: env.PORT || 3000,
        host: true,
    },
    build: {
        target: 'es2015',
    },
  }
})
