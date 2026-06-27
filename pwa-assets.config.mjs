// PWA / favicon asset generation config.
//
// General notes
//   Generates the favicon and app-icon set from a single source logo using
//   `@vite-pwa/assets-generator`. The transparent icons are letterboxed
//   (`fit: contain`) so the full landscape logo stays visible inside the
//   square favicon. Output lands next to the source image, in
//   `contents/public/`, where VitePress serves it from the site root.
//
// Usage
//   pnpm exec pwa-assets-generator --config pwa-assets.config.mjs
//
// Output (in contents/public/)
//   favicon.ico, pwa-64x64.png, pwa-192x192.png, pwa-512x512.png,
//   maskable-icon-512x512.png, apple-touch-icon-180x180.png

import {
  defineConfig,
  minimal2023Preset,
} from '@vite-pwa/assets-generator/config';

export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: minimal2023Preset,
  images: ['contents/public/love-cats.png'],
});
