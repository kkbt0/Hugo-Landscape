// 项目需要 alpinejs async-alpine medium-zoom swup scroll-plugin medium-zoom.min

await Bun.write("./assets/js/libs/alpinejs.esm.js", Bun.file("node_modules/alpinejs/dist/module.esm.js"));
await Bun.write("./assets/js/libs/async-alpine.esm.js", Bun.file("node_modules/async-alpine/dist/async-alpine.esm.js"));
await Bun.write("./assets/js/libs/medium-zoom.esm.js", (await Bun.file("node_modules/medium-zoom/dist/medium-zoom.esm.js").text()).split('\n').slice(1).join('\n'));

// 由于 UMD 在 Hugo 的 js.Build 下会出一点问题 所以
await Bun.build({
  entrypoints: ['./scripts/libs/swup.esm.js'],
  outdir: './assets/js/libs',
})
console.log('✅ Build complete!')
