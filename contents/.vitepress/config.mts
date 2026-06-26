// Main vitepress configuration

import { existsSync } from 'node:fs';

import { defineConfig } from 'vitepress';
import { withSidebar } from 'vitepress-sidebar';

// https://vitepress.dev/reference/site-config
const vitePressOptions = {
  vite: {
    ssr: {
      noExternal: ['@nolebase/*'],
    },
  },
  title: 'Prenup Docs',
  titleTemplate: ':title - Prenup Docs',
  description: 'Prenuptial agreement templates and guides for couples in Japan.',

  rewrites: { 'en/:rest*': ':rest*' },

  lastUpdated: true,
  cleanUrls: true,
  metaChunk: true,

  // The snippets README documents the literal `@include` directive syntax, which VitePress would
  // otherwise try to process as a real include. It is contributor docs, not a site page, so
  // exclude it from the build.
  srcExclude: ['snippets/README.md'],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    footer: {
      message: 'Prenuptial agreement templates and guides for couples in Japan.',
      copyright: 'Copyright © 2025-present',
    },
    outline: { level: [2, 3], label: 'Outline' },
    docFooter: {
      // Disable docFooter globally; using "related docs" footer instead
      prev: false,
      next: false,
    },
    search: {
      provider: 'local',
      options: {
        async _render(src, env, md) {
          // First pass populates env.frontmatter
          await md.renderAsync(src, env);

          const fm = env.frontmatter ?? {};

          // Honor per-page opt out
          if (fm.search === false) return '';

          let rewritten = src;

          // Replace headings like "# {{ $frontmatter.title }}" with a concrete title
          if (typeof fm.title === 'string' && fm.title.trim().length > 0) {
            // Replace H1 that is exactly an interpolation of frontmatter.title
            rewritten = rewritten.replace(
              /^#\s*\{\{\s*\$frontmatter\.title\s*\}\}\s*$/m,
              `# ${fm.title}`,
            );
            // Drop any other heading levels that interpolate frontmatter.title
            rewritten = rewritten.replace(
              /^#{2,6}\s*\{\{\s*\$frontmatter\.title\s*\}\}\s*$/gm,
              '',
            );
          }

          // Strip any remaining $frontmatter interpolations from the indexable text
          rewritten = rewritten.replace(/\{\{\s*\$frontmatter\.[^}]+\}\}/g, '');

          // Final render used for indexing
          return await md.renderAsync(rewritten, env);
        }, // end of search options
        // remove manual sidebar; withSidebar will generate it
      },
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ahandsel/prenup-docs' },
    ],
    editLink: {
      pattern:
        'https://github.com/ahandsel/prenup-docs/edit/main/contents/:path',
      text: 'Edit this page on GitHub',
    },
  },
  base: '/prenup-docs/',
  sitemap: {
    hostname: 'https://ahandsel.github.io',
  },

  // https://vitepress.dev/guide/internationalization
  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      dir: 'ltr',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/' },
          { text: 'Guides', link: '/guides/' },
          { text: 'Templates', link: '/templates/' },
        ],
      },
    },
    ja: {
      label: '日本語',
      lang: 'ja-JP',
      dir: 'ltr',
      themeConfig: {
        nav: [
          { text: 'ホーム', link: '/ja/' },
          { text: 'ガイド', link: '/ja/guides/' },
          { text: 'テンプレート', link: '/ja/templates/' },
        ],
      },
    },
  },
};

const rootLocale = 'en';
const supportedLocales = [rootLocale, 'ja'];
const sections = ['guides', 'templates'];

const commonSidebarConfigs = {
  // https://vitepress-sidebar.cdget.com/guide/options
  // ============ [ RESOLVING PATHS ] ============
  documentRootPath: 'docs',
  // scanStartPath: null,
  // resolvePath: null,
  // basePath: null,
  // followSymlinks: false,
  //
  // ============ [ GROUPING ] ============
  collapsed: false,
  // collapseDepth: 2,
  // rootGroupText: "Table of Contents",
  // rootGroupLink: '',
  // rootGroupCollapsed: false,
  //
  // ============ [ GETTING MENU TITLE ] ============
  // useTitleFromFileHeading: true,
  useTitleFromFrontmatter: true,
  // useFolderLinkFromIndexFile: true,
  useFolderTitleFromIndexFile: true,
  frontmatterTitleFieldName: 'title',
  //
  // ============ [ GETTING MENU LINK ] ============
  // useFolderLinkFromSameNameSubFile: false,
  // folderLinkNotIncludesFileName: false,
  //
  // ============ [ INCLUDE / EXCLUDE ] ============
  excludeByGlobPattern: ['README.md', 'temp', 'temp.*', 'temp-*.md'],
  excludeFilesByFrontmatterFieldName: 'excludeFromSidebar',
  // excludeByFolderDepth: null,
  // includeDotFiles: false,
  // includeEmptyFolder: false,
  // includeRootIndexFile: false,
  includeFolderIndexFile: true,
  //
  // ============ [ STYLING MENU TITLE ] ============
  // hyphenToSpace: false,
  // underscoreToSpace: false,
  // capitalizeFirst: false,
  // capitalizeEachWords: false,
  // keepMarkdownSyntaxFromTitle: false,
  // removePrefixAfterOrdering: false,
  // prefixSeparator: '.',
  //
  // ============ [ SORTING ] ============
  // manualSortFileNameByPriority: ['first.md', 'second', 'third.md'],
  sortFolderTo: 'top',
  // sortMenusByName: false,
  // sortMenusByFileDatePrefix: false,
  sortMenusByFrontmatterOrder: true,
  frontmatterOrderDefaultValue: 10,
  // sortMenusByFrontmatterDate: false,
  // sortMenusOrderByDescending: false,
  // sortMenusOrderNumericallyFromTitle: false,
  // sortMenusOrderNumericallyFromLink: false,
  //
  // ============ [ MISC ] ============
  // debugPrint: true,
};

const vitePressSidebarConfigs = [
  // VitePress Sidebar's options here...
  // Per-section sidebars for each locale
  // documentRootPath must include the locale to avoid doubled paths in links
  ...supportedLocales.flatMap((lang) => {
    const isRoot = lang === rootLocale;
    const prefix = isRoot ? '' : `/${lang}`;
    // Only scan sections that exist on disk; vitepress-sidebar throws ENOENT
    // when scanStartPath points to a missing directory.
    return sections
      .filter((section) => existsSync(`contents/${lang}/${section}`))
      .map((section) => ({
        ...commonSidebarConfigs,
        documentRootPath: `contents/${lang}`,
        scanStartPath: section,
        basePath: `${prefix}/${section}/`,
        resolvePath: `${prefix}/${section}/`,
      }));
  }),
  // Root-level sidebars for each locale (fallback for pages not in a section)
  ...supportedLocales.map((lang) => {
    const isRoot = lang === rootLocale;
    return {
      ...commonSidebarConfigs,
      ...(isRoot ? {} : { basePath: `/${lang}/` }),
      documentRootPath: `contents/${lang}`,
      resolvePath: isRoot ? '/' : `/${lang}/`,
    };
  }),
];

export default defineConfig(
  withSidebar(vitePressOptions, vitePressSidebarConfigs),
);
