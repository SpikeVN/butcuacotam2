import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite';
// import UnpluginInjectPreload from 'unplugin-inject-preload/vite';

// import preloadAssets from 'vite-plugin-preload-assets';

export default defineConfig({
  plugins: [
    devtools(),
    solidPlugin(),
    tailwindcss(),
    // preloadAssets({
    //   fontsToPreload: [
    //     { href: "/assets/fonts/bricolage-grotesque-v9-latin_vietnamese-regular.woff2" },
    //     { href: "/assets/fonts/bricolage-grotesque-v9-latin_vietnamese-600.woff2" },
    //     { href: "/assets/fonts/cormorant-garamond-v21-latin_vietnamese-regular.woff2" }
    //   ],
    // })
    // UnpluginInjectPreload({
    //   files: [
    //     {
    //       entryMatch: /\/assets\/fonts\/cormorant-garamond-v21-latin_vietnamese-(regular|600)\.woff2/
    //     },
    //     {
    //       entryMatch: /\/assets\/fonts\/cormorant-garamond-v21-latin_vietnamese-regular\.woff2/
    //     }
    //   ]
    // })
  ],
  // Temporarily before moving on to a custom domain
  base: "/butcuacotam2/",
  server: {
    port: 3000,
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
