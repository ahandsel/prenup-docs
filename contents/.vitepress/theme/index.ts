// https://vitepress.dev/guide/custom-theme
import { h } from 'vue';
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import './style.css';

// Ported from vitepress-theme-ououe (MIT, tolking).
import VPReadingProgress from './VPReadingProgress.vue';
import VPCover from './VPCover.vue';

// https://nolebase-integrations.ayaka.io/pages/en/integrations/vitepress-plugin-enhanced-readabilities/#add-plugin-specific-options-into-configurations-of-vite
import {
  NolebaseEnhancedReadabilitiesMenu,
  NolebaseEnhancedReadabilitiesScreenMenu,
} from '@nolebase/vitepress-plugin-enhanced-readabilities/client';
import '@nolebase/vitepress-plugin-enhanced-readabilities/client/style.css';

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      'layout-top': () => [
        h(VPReadingProgress), // ououe-style reading-progress bar
      ],
      'doc-before': () => [
        h(VPCover), // ououe-style per-page cover banner (uses `image` frontmatter)
      ],
      'nav-bar-content-after': () => [
        // h(OtherComponent), // Your other nav components
        h(NolebaseEnhancedReadabilitiesMenu), // Enhanced Readabilities menu
      ],
      'nav-screen-content-after': () => [
        // h(OtherComponent), // Your other nav components
        h(NolebaseEnhancedReadabilitiesScreenMenu), // Enhanced Readabilities menu for small screens
      ],
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    });
  },
  enhanceApp({ app, router, siteData }) {},
} satisfies Theme;
