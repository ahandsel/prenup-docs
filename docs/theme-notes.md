# Theme notes

This document records how the site theme is built and which third-party theme it borrows from.


## Table of contents <!-- omit in toc -->

* [Overview](#overview)
* [Why we did not adopt ououe wholesale](#why-we-did-not-adopt-ououe-wholesale)
* [What we borrowed](#what-we-borrowed)
* [Per-page cover images](#per-page-cover-images)
* [Reading-progress bar](#reading-progress-bar)
* [Where the code lives](#where-the-code-lives)


## Overview

The site runs on the [VitePress][vitepress] default theme, extended in [contents/.vitepress/theme/][theme-dir]. It borrows a few visual touches from the [vitepress-theme-ououe][ououe] blog theme (MIT, by tolking) rather than adopting that theme directly.

> [!NOTE] Note: ououe is not installed as a dependency.
> Its components and styles were ported into our own theme folder and adapted to run on top of the default theme.


## Why we did not adopt ououe wholesale

* **It is a blog theme, not a docs theme.** ououe is built around posts, tags, categories, pagination, and covers. It has no support for our auto-generated sidebars ([vitepress-sidebar][vitepress-sidebar]), per-locale documentation nav, edit links, outline, or doc footer, and it fully replaces the default `Layout`.
* **Version mismatch.** ououe targets `vitepress@^1` and imports VitePress internal paths, while this repo runs `vitepress@2` (alpha). A full swap risks not building at all.
* **It would break the readability menu.** Our [@nolebase enhanced-readabilities][nolebase] menu is injected through default-theme layout slots that ououe's layout does not expose.

For these reasons we keep the default theme and port only the self-contained, docs-compatible pieces.


## What we borrowed

* A per-page **cover banner** driven by the `image` frontmatter key.
* A **reading-progress bar** shown at the top of the viewport.
* ououe's **transition feel**: timing variables, reduced-motion handling, smooth link color transitions, and neutral appearance-toggle view transitions.

Brand colors and fonts were not borrowed: ououe uses stock VitePress indigo and the default font stack, which the site already uses.


## Per-page cover images

Each doc page can declare an `image` in its frontmatter. The cover renders a blurred, saturated version of that image at the top of the page, with the page title and description overlaid. Pages without an image get a plain-background header with the same title and description.

The title and description come from frontmatter, so doc pages should not repeat them in the body. Cover images live in [contents/public/][public-dir] and are referenced by filename.

```yaml
---
title: Questions to discuss before marriage
description: Open-ended questions to help couples align before marriage.
image: priscilla-du-preez-ELnxUDFs6ec-unsplash.jpg
---
```

The `image` value accepts any of these shapes:

* A string filename, URL, or path: `image: priscilla-du-preez-ELnxUDFs6ec-unsplash.jpg`
* An object: `image: { src: /covers/discussion.jpg, alt: Two people talking }`
* A light and dark pair: `image: { light: /covers/light.jpg, dark: /covers/dark.jpg }`

Other frontmatter controls:

* `cover: false` opts a page out of the banner entirely.
* `text-on-image: false` shows the image only and hides the title and description overlay. The image is shown crisp rather than blurred, since there is no overlaid text to keep readable. An accessible, screen-reader-only heading is kept so the page still has an H1. The overlay default can also be set site-wide with `themeConfig.textOnImage: false`, and the per-page key overrides it.
* The cover renders only on doc pages, so the home page hero is unaffected.


## Reading-progress bar

A thin progress bar tracks scroll position. It is on by default and can be positioned or disabled per page with the `readingProgress` frontmatter key, which accepts `top`, `bottom`, `left`, `right`, or `false`.


## Where the code lives

* [contents/.vitepress/theme/VPCover.vue][vpcover] - the per-page cover banner.
* [contents/.vitepress/theme/VPReadingProgress.vue][vpreading] - the reading-progress bar.
* [contents/.vitepress/theme/index.ts][theme-index] - wires both components into default-theme layout slots.
* [contents/.vitepress/theme/style.css][theme-style] - the cover, reading-progress, and transition variables.


<!-- Links -->

[nolebase]: https://nolebase-integrations.ayaka.io/pages/en/integrations/vitepress-plugin-enhanced-readabilities/
[ououe]: https://github.com/tolking/vitepress-theme-ououe
[public-dir]: ../contents/public/
[theme-dir]: ../contents/.vitepress/theme/
[theme-index]: ../contents/.vitepress/theme/index.ts
[theme-style]: ../contents/.vitepress/theme/style.css
[vitepress]: https://vitepress.dev/
[vitepress-sidebar]: https://vitepress-sidebar.cdget.com/
[vpcover]: ../contents/.vitepress/theme/VPCover.vue
[vpreading]: ../contents/.vitepress/theme/VPReadingProgress.vue
