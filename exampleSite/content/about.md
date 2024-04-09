---
title: 关于
---

# About

移植自 [Hexo-Theme-vivia](https://github.com/saicaca/hexo-theme-vivia) 以及 [Astro-Theme-Fuwari](https://github.com/saicaca/fuwari)
部分代码参考 [Hugo-Theme-DoIt](https://github.com/HEIGE-PCloud/DoIt)
而 vivia 是 Hexo Landscape 修改来的。

本主题缘起 Astro 主题 Fuwari 。虽然 Astro 使用 js 生态方便，但是构建速度有点慢，而且换主题很麻烦。加上想尝试 Unocss 。因此使用 Unocss 兼容 Tailwind 并使用 Swup 运行时移植到 Hugo 。

- CSS 55kb
- js 34kb

之后使用 Unocss shortcuts 测试

```
style.css 36.5 -> 37.1 
```

但是好消息是页面减小了一点，Swup 预加载 HTML 稍微节省一点流量。

```
DoIt 15kb - 30kb posts
Unocss 30kb - 50kb
```
还可以 2024.04.09