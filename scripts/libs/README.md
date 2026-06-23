

```bash
bun update
# 将 js 库打包复制到 assets 目录
# 由于 UMD 在 Hugo 的 js.Build 下会出一点问题，所以重新导出 ems
bun run ./scripts/libs/vendor.js
```