<script setup lang="ts">
// Reading-progress bar ported from vitepress-theme-ououe (MIT, tolking).
// Standalone widget that works on top of VitePress's default theme.
// Position is controlled by the `readingProgress` frontmatter key
// ('top' | 'bottom' | 'left' | 'right' | false); defaults to 'top'.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useData } from 'vitepress';

type ReadingProgress = boolean | 'top' | 'bottom' | 'left' | 'right';

const { frontmatter } = useData();

const readingTop = ref(0);
const readingHeight = ref(1);
const running = ref(false);
const progressStyle = ref<{ transform: string }>();

const show = computed<ReadingProgress>(() => {
  return (frontmatter.value.readingProgress as ReadingProgress) ?? 'top';
});
const type = computed<Exclude<ReadingProgress, boolean> | undefined>(() => {
  if (!show.value) return;
  return show.value === true ? 'top' : show.value;
});

onMounted(() => {
  progressStyle.value = getProgressStyle();
  if (show.value) window.addEventListener('scroll', init, { passive: true });
});

onBeforeUnmount(() => {
  if (show.value) window.removeEventListener('scroll', init);
});

function init() {
  if (!running.value) {
    running.value = true;
    requestAnimationFrame(getReadingBase);
  }
}

function getReadingBase() {
  readingHeight.value = getReadingHeight() - getScreenHeight();
  readingTop.value = getReadingTop();
  progressStyle.value = getProgressStyle();
  running.value = false;
}

function getReadingHeight() {
  return Math.max(document.body.scrollHeight, document.body.offsetHeight, 0);
}

function getScreenHeight() {
  return Math.max(window.innerHeight, document.documentElement.clientHeight, 0);
}

function getReadingTop() {
  return Math.max(window.scrollY, document.documentElement.scrollTop, 0);
}

function getProgressStyle() {
  if (!type.value) return;
  const progress = readingHeight.value
    ? readingTop.value / readingHeight.value
    : 0;
  const direction = ['top', 'bottom'].includes(type.value) ? 'X' : 'Y';

  return {
    transform: `scale${direction}(${progress})`,
  };
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" :class="type" class="reading-progress">
      <div :style="progressStyle" class="progress" />
    </div>
  </Teleport>
</template>

<style scoped>
.reading-progress {
  position: fixed;
  z-index: var(--vp-reading-z-index);
  overflow: hidden;
}
.reading-progress .progress {
  width: 100%;
  height: 100%;
  background: var(--vp-c-brand-1, var(--vp-c-brand));
  background-image: var(--vp-reading-gradient);
  transform-origin: 0% 0%;
  transition: transform 0.2s ease-out;
}
.top {
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: var(--vp-reading-size);
}
.bottom {
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: var(--vp-reading-size);
}
.left {
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--vp-reading-size);
  height: 100%;
}
.right {
  right: 0;
  top: 0;
  bottom: 0;
  width: var(--vp-reading-size);
  height: 100%;
}
</style>
