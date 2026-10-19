import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'static',
  adapter: vercel(),
  trailingSlash: 'ignore',
  integrations: [tailwind()],
  i18n: {
    defaultLocale: 'tr',
    locales: ['tr', 'en'],
    routing: {
      prefixDefaultLocale: false
    }
  },
  // The calendar moved from the site root to /takvim (TR) and /en/calendar (EN)
  // on 2026-10-19. Redirects for the old URLs live in vercel.json, because
  // static builds cannot enumerate dynamic redirect routes.
});
