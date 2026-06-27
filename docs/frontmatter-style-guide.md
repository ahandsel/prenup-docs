# Frontmatter style guide

This document describes the YAML frontmatter used in the Markdown content files under [`contents/`](../contents/). Frontmatter is the block delimited by `---` at the very top of a file. It supplies the page title, the search and social metadata, the cover banner, the sidebar behavior, the reading-progress bar, and the bilingual localization state.

VitePress reads these keys when it builds the static site, the `vitepress-sidebar` plugin reads some of them when it generates the navigation, and the custom theme components read the cover and reading-progress keys. The keys and behaviors below are configured in [`contents/.vitepress/config.mts`](../contents/.vitepress/config.mts) and the theme components in [`contents/.vitepress/theme/`](../contents/.vitepress/theme/). For how the cover and reading-progress bar are built, see [theme notes](./theme-notes.md).


## Table of contents <!-- omit in toc -->

* [Minimal example](#minimal-example)
* [Key reference](#key-reference)
* [Content keys](#content-keys)
  * [title](#title)
  * [description](#description)
  * [head](#head)
  * [tags](#tags)
* [Cover keys](#cover-keys)
  * [image](#image)
  * [text-on-image](#text-on-image)
  * [cover](#cover)
* [Sidebar keys](#sidebar-keys)
  * [order](#order)
  * [excludeFromSidebar](#excludefromsidebar)
* [Reading-progress key](#reading-progress-key)
* [Localization key](#localization-key)
* [Home page keys](#home-page-keys)
* [Files without frontmatter](#files-without-frontmatter)


## Minimal example

A standard content page declares a `title`, a `description`, a cover `image`, a `head` block with search keywords, and a `localization` state:

```yaml
---
title: Prenuptial agreement template
description: A customizable prenuptial agreement template for couples in Japan, covering separate and shared property, living expenses, child-rearing, mutual pledges, and divorce provisions.
text-on-image: false
image: sandy-millar-8vaQKYnawHw-unsplash.jpg
head:
  - - meta
    - name: keywords
      content: prenuptial agreement, template, marriage contract, property, living expenses, divorce, child support, japan
localization: sync
---
```


## Key reference

| Key                  | Required           | Type           | Purpose                                                                |
| -------------------- | ------------------ | -------------- | ---------------------------------------------------------------------- |
| `title`              | Yes                | string         | Page title, browser tab title, and sidebar label.                      |
| `description`        | Yes                | string         | Search and social meta description for the page.                       |
| `localization`       | Yes (paired pages) | enum           | Bilingual parity state: `sync`, `TODO: drifted`, or `independent`.     |
| `head`               | Recommended        | array          | Extra `<head>` tags, most often the `keywords` meta tag.               |
| `image`              | Recommended        | string\|object | Cover banner image for the page.                                       |
| `text-on-image`      | No                 | boolean        | When `false`, hides the title and description overlay on the cover.    |
| `cover`              | No                 | boolean        | When `false`, hides the cover banner entirely.                         |
| `readingProgress`    | No                 | enum\|boolean  | Position of the reading-progress bar, or `false` to hide it.           |
| `order`              | No                 | number         | Sidebar sort position within a folder. Defaults to `10`.               |
| `excludeFromSidebar` | No                 | boolean        | When `true`, hides the page from the sidebar.                          |
| `tags`               | No                 | array          | Topic tags for the page.                                               |
| `layout`             | No                 | enum           | Page layout. Set to `home` only on the locale landing pages.           |
| `titleTemplate`      | No                 | string         | Overrides the global title template. Used on the home pages.           |
| `hero`, `features`   | No                 | object         | Home page hero and feature-card content. Used only with `layout: home`.|


## Content keys

These keys describe the page itself and feed the rendered HTML and search metadata.


### title

Required on every content page. The `title`:

* Sets the browser tab title, rendered through the global template `:title - Prenup Docs`.
* Is used as the page heading and the sidebar label, because the sidebar is configured with `useTitleFromFrontmatter: true` and `frontmatterTitleFieldName: 'title'`.
* Is overlaid on the cover banner along with the `description` (see [cover keys](#cover-keys)). Because the title and description come from frontmatter, doc pages should not repeat them in the body.

Wrap the value in single quotes only when it contains a character that YAML would otherwise misread, such as a leading quote or a colon followed by a space:

```yaml
title: 'Prenuptial agreement: a practical guide'
```

Follow the language style guides for capitalization. Emoji are allowed, for example in home-page feature titles such as `📝 Agreement template`.


### description

Required on every content page. The `description` is a one-sentence to two-sentence summary used as the page meta description for search engines and link previews, and overlaid on the cover banner under the title. Keep it concise and specific to the page content.


### head

Optional but recommended. The `head` key injects extra tags into the page `<head>`. The established pattern in this repository is a single `keywords` meta tag:

```yaml
head:
  - - meta
    - name: keywords
      content: prenuptial agreement, marriage, questions, couples, finances, family, communication, japan
```

The nested-array syntax is VitePress's per-page head format: the outer array holds tags, and each tag is `[tagName, attributesObject]`. Write keywords as a comma-separated, lowercase list of terms relevant to the page.


### tags

Optional and rarely used. The `tags` key holds a list of topic tags:

```yaml
tags:
  - prenuptial-agreement
  - marriage
  - japan
  - property
  - finances
```

Only add tags when they serve a clear purpose for the page. Most pages do not set this key.


## Cover keys

Each doc page renders a cover banner at the top, built by [`VPCover.vue`](../contents/.vitepress/theme/VPCover.vue). It shows a blurred, saturated version of the page image with the title and description overlaid. Pages without an image get a plain-background header with the same title and description. These keys control the banner. See [theme notes](./theme-notes.md#per-page-cover-images) for the full behavior.


### image

Recommended. The `image` key sets the cover banner image. Cover images live in [`contents/public/`](../contents/public/) and are referenced by filename:

```yaml
image: sandy-millar-8vaQKYnawHw-unsplash.jpg
```

The `image` value also accepts these shapes:

* A string URL or path: `image: /covers/discussion.jpg`
* An object with alt text: `image: { src: /covers/discussion.jpg, alt: Two people talking }`
* A light and dark pair: `image: { light: /covers/light.jpg, dark: /covers/dark.jpg }`

When `image` is omitted, the banner falls back to the site-wide `themeConfig.cover` if one is set; otherwise the page shows the plain-background header.


### text-on-image

Optional boolean. When set to `false`, the cover shows the image only and hides the title and description overlay. The image is rendered crisp rather than blurred, since there is no overlaid text to keep readable, and an accessible, screen-reader-only heading is kept so the page still has an H1:

```yaml
text-on-image: false
image: sandy-millar-8vaQKYnawHw-unsplash.jpg
```

The overlay default can also be set site-wide with `themeConfig.textOnImage: false`; the per-page key overrides it. Omitting the key is equivalent to `text-on-image: true`.


### cover

Optional boolean. Set `cover: false` to opt a page out of the banner entirely:

```yaml
cover: false
```

The cover renders only on doc pages, so the home page hero is unaffected regardless of this key.


## Sidebar keys

These keys control how the `vitepress-sidebar` plugin places and orders a page in the navigation.


### order

Optional. The `order` key sets the sort position of a page or folder within its sidebar group. Lower numbers sort first. Pages without `order` default to `10`.

In practice, `order` is set mainly on folder `index.md` files to control the order of top-level sections, for example `order: 0` on a section landing page so it sorts above its siblings.


### excludeFromSidebar

Optional boolean. When set to `true`, the page is removed from the generated sidebar. This is configured through `excludeFilesByFrontmatterFieldName: 'excludeFromSidebar'`.

Use it for pages that should exist and be reachable by link but should not clutter the navigation, such as the content map:

```yaml
title: Content map
description: Overview of all pages
excludeFromSidebar: true
localization: sync
```

Setting `excludeFromSidebar: false` is equivalent to omitting the key; it is sometimes written explicitly to document intent.


## Reading-progress key

Optional. A thin reading-progress bar, built by [`VPReadingProgress.vue`](../contents/.vitepress/theme/VPReadingProgress.vue), tracks scroll position. It is on by default and can be positioned or disabled per page with the `readingProgress` key, which accepts `top`, `bottom`, `left`, `right`, or `false`:

```yaml
readingProgress: bottom
```

Set `readingProgress: false` to hide the bar on a page. See [theme notes](./theme-notes.md#reading-progress-bar) for details.


## Localization key

Required on every paired content page. Every file under `contents/en/` has a 1-to-1 counterpart at the same path under `contents/ja/`. The `localization` key tracks whether the two language versions are in parity.

| Value           | Meaning                                                                          |
| --------------- | -------------------------------------------------------------------------------- |
| `sync`          | Default. The two versions are kept in 1-to-1 parity and should match in content. |
| `TODO: drifted` | The two versions have diverged and require updating.                             |
| `independent`   | The two versions are intentionally different; do not sync them.                  |

Rules when editing content:

* Default new and existing paired files to `localization: sync`.
* When you edit a `sync` file, set its counterpart's `localization` to `TODO: drifted` so the drift is tracked until it is reconciled.
* Once a `TODO: drifted` file has been brought back in line with its counterpart, set both back to `sync`.
* When the two language versions should be intentionally different, set both to `localization: independent` and do not flag drift between them.

The `blog-translator` skill reads and reconciles this key when it syncs a paired file.


## Home page keys

The locale landing pages, [`contents/index.md`](../contents/index.md) (English) and [`contents/ja/index.md`](../contents/ja/index.md) (Japanese), use VitePress's home layout instead of a normal document. They set:

* `layout: home` to switch to the home-page layout.
* `titleTemplate` to override the global `:title - Prenup Docs` template with a standalone tagline.
* `hero` for the headline, tagline, and actions.
* `features` for the feature cards that link into the main sections.

These keys follow the [VitePress home page reference](https://vitepress.dev/reference/default-theme-home-page). Do not add them to ordinary content pages.


## Files without frontmatter

Not every Markdown file under `contents/` is a page, and these do not need the content or localization keys:

<!-- * Files under [`contents/snippets/`](../contents/snippets/) are reusable partials included into pages with the `@include` directive. They are not routes and are excluded from the build, so they have no `title` or `localization`. -->
* `README.md` files are contributor documentation. They are excluded from both the build and the sidebar.
