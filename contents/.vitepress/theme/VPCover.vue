<script setup lang="ts">
// Per-page cover banner ported from vitepress-theme-ououe (MIT, tolking),
// adapted to run on top of VitePress's default theme.
//
// Reads the page's `image` frontmatter (falling back to the site-wide
// `themeConfig.cover`) and renders a blurred cover with the page title and
// description overlaid, the way ououe does for each article.
//
// Per-page frontmatter:
//   image: '/cover.png'                 # string
//   image: { src: '/cover.png', alt }   # object
//   image: { light: '...', dark: '...' }# light/dark pair
//   cover: false                        # opt out of the banner entirely
//   text-on-image: false                # show the image only, hide the
//                                        # title/description overlay
//
// The overlay default can also be set site-wide with
// `themeConfig.textOnImage: false`; the per-page key overrides it.
import { computed } from 'vue';
import { useData, withBase } from 'vitepress';

const { frontmatter, theme, site, isDark } = useData();

// Whether to overlay the title/description on top of the cover.
// Per-page `text-on-image` overrides the site-wide `themeConfig.textOnImage`.
const showText = computed(() => {
  const fm = frontmatter.value['text-on-image'];
  if (fm !== undefined) return fm !== false;
  return (theme.value as any).textOnImage !== false;
});

// Render the banner on doc pages that have a title, unless explicitly opted out.
const show = computed(() => {
  if (frontmatter.value.cover === false) return false;
  if (frontmatter.value.layout && frontmatter.value.layout !== 'doc') {
    return false;
  }
  if (!title.value) return false;
  // With the overlay hidden and no image, there is nothing left to show.
  if (!showText.value && !coverStyle.value) return false;
  return true;
});

const title = computed(() => {
  return frontmatter.value.title ?? site.value.title;
});
const description = computed(() => {
  return frontmatter.value.description ?? site.value.description;
});

const coverStyle = computed(() => {
  const image = frontmatter.value.image ?? (theme.value as any).cover;
  let src: string | undefined;

  if (!image) {
    src = '';
  } else if (typeof image === 'string') {
    src = image;
  } else if ('src' in image) {
    src = (image as { src: string }).src;
  } else if ('dark' in image || 'light' in image) {
    const pair = image as { light?: string; dark?: string };
    src = isDark.value ? pair.dark || '' : pair.light || '';
  }

  return src ? { backgroundImage: `url(${withBase(src)})` } : undefined;
});
</script>

<template>
  <section
    v-if="show"
    :class="{ 'with-cover': coverStyle, 'no-text': !showText }"
    class="vp-cover"
  >
    <div v-if="coverStyle" :style="coverStyle" class="cover-bg" />
    <hgroup v-if="showText" class="cover-title">
      <h1 class="title">{{ title }}</h1>
      <p v-if="description" class="description">{{ description }}</p>
    </hgroup>
    <!-- Keep an accessible page heading even when the overlay is hidden. -->
    <h1 v-else class="sr-only">{{ title }}</h1>
  </section>
</template>

<style scoped>
.vp-cover {
  position: relative;
  width: 100%;
  height: var(--vp-size-cover-height);
  margin-bottom: calc(var(--vp-size-space) * 2);
  border-radius: 12px;
  overflow: hidden;
}
.vp-cover .cover-bg {
  position: absolute;
  top: calc(var(--vp-size-cover-blur) * -2);
  bottom: calc(var(--vp-size-cover-blur) * -2);
  left: calc(var(--vp-size-cover-blur) * -2);
  right: calc(var(--vp-size-cover-blur) * -2);
  background-color: var(--vp-c-bg);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  filter: blur(var(--vp-size-cover-blur)) saturate(80%);
  will-change: background-image;
  transition: var(--vp-transition-all);
}
.vp-cover .sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: 0;
  padding: 0;
  border: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
.vp-cover .cover-title {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 100%;
  padding: 0 1.5rem;
  text-align: center;
}
.vp-cover .cover-title .title {
  max-width: 90%;
  margin: 0;
  border: 0;
  padding: 0;
  font-size: clamp(1.6rem, 1.3rem + 1.5vw, 2.6rem);
  line-height: 1.4;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.vp-cover .cover-title .description {
  max-width: 90%;
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.5;
  color: var(--vp-c-text-2);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;
}

/* When a real image backs the cover, give it more height and blend the
   overlaid text against the blurred photo, the ououe way. */
.vp-cover.with-cover {
  height: var(--vp-size-cover-img-height);
}

/* Without the text overlay there is nothing to keep readable, so show the
   image crisp instead of blurred. */
.vp-cover.no-text .cover-bg {
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  filter: none;
}
.vp-cover.with-cover .cover-title .title,
.vp-cover.with-cover .cover-title .description {
  color: var(--vp-c-text-1);
  mix-blend-mode: difference;
}
</style>
