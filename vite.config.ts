import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite';

export default defineConfig({
  plugins: [
    devtools(),
    solidPlugin(),
    tailwindcss(),
  ],
  // Temporarily before moving on to a custom domain
  base: "/",
  server: {
    port: 3000,
    watch: {
      usePolling: true,
      ignored: ['backend/**', '**/logs/*.log']
    }
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 3,
      },
      format: {
        comments: false,
      },
    },
    cssMinify: true,
  },
  publicDir: "static",

});
