// uno.config.ts
import { defineConfig } from "unocss";
import { presetUno } from "unocss"; //  预定义配置
import { presetIcons } from "unocss"; // CSS 图标
import { presetAttributify, presetTypography } from "unocss"; // 版式预设
import presetLegacyCompat from '@unocss/preset-legacy-compat' // 旧版兼容预设
// import transformerDirectives from "@unocss/transformer-directives";

export default defineConfig({
  presets: [
    presetAttributify(),
    presetUno(),
    presetTypography(),
    presetIcons({
      collections: {
        mdi: () =>
          import("@iconify-json/mdi/icons.json").then((i) => i.default),
      },
    }),
    presetLegacyCompat({
      commaStyleColorFunction: true,
    })
  ],
  shortcuts: {
    // shortcuts to multiple utilities
    "un-postcard": "flex flex-col-reverse md:flex-col w-full rounded-[var(--radius-large)] overflow-hidden relative",
    "un-postcard-in": "pl-6 md:pl-9 pr-6 md:pr-2 pt-6 md:pt-7 pb-6 relative w-[99%]",
    "un-postcard-title": `
      transition w-full block font-bold mb-3 text-3xl 
      hover:text-[var(--primary)] dark:hover:text-[var(--primary)]
      active:text-[var(--title-active)] dark:active:text-[var(--title-active)]
      before:content-['']
      before:w-1 before:h-5 before:rounded-md before:bg-[var(--primary)]
      before:absolute before:top-[35px] before:left-[18px] before:hidden md:before:block`,
    "un-list-line": `transition-all mx-auto w-1 h-1 rounded group-hover:h-5
      bg-[oklch(0.5_0.05_var(--hue))] group-hover:bg-[var(--primary)]
      outline outline-4 z-50
      outline-[var(--card-bg)]
      group-hover:outline-[var(--btn-plain-bg-hover)]
      group-active:outline-[var(--btn-plain-bg-active)]`
  },
  rules: [
    [
      /^text-(\d+)$/,
      ([, d]) => {
        return `
        .text-${d} { color: rgb(0 0 0 / ${parseInt(d) / 100}); }
        :is(.dark .text-${d}) { color: rgb(255 255 255 / ${
          parseInt(d) / 100
        }); }
        `;
      },
    ],
  ],
  // shortcuts: [[/^text-(\d+)$/, ([, d]) => `text-${d} dark:text-${d}`]],
});
