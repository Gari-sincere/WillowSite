// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  // Replace `example` with your GitHub username or organization.
  site: 'https://example.github.io',
  base: '/WillowSite/',
  output: 'static',
  integrations: [react()],
});
