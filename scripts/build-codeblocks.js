import path from 'path';
import { ExpressiveCode } from 'expressive-code';
import { pluginShiki } from '@expressive-code/plugin-shiki';
import { pluginFrames } from '@expressive-code/plugin-frames';
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';
import { toHtml } from 'hast-util-to-html';
import fs from 'fs';
import { glob } from 'glob';

const ec = new ExpressiveCode({
  themeCssSelector: (theme) =>
    theme.name === 'github-dark' ? 'html.dark' : 'html:not(.dark)',
  plugins: [
    pluginShiki({
      themes: ['github-light', 'github-dark'],
    }),
    pluginFrames(),
    pluginCollapsibleSections(),
  ],
});

// 内容目录（相对于项目根）
const contentDir = path.resolve('./exampleSite/content');
const mdFiles = glob.sync(`${contentDir}/**/*.md`, { ignore: '**/node_modules/**' });
const blocksMap = {};

async function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const codeBlockRegex = /```(\w*)(?:\s+(.*?))?\n([\s\S]*?)```/g;
  let match;
  const blocks = [];

  while ((match = codeBlockRegex.exec(content)) !== null) {
    blocks.push({
      language: match[1] || 'text',
      meta: match[2] || '',
      code: match[3],
    });
  }

  if (blocks.length === 0) return;

  // 计算相对于 contentDir 的路径，并统一为正斜杠
  const relativePath = path.relative(contentDir, path.resolve(filePath)).replace(/\\/g, '/');
  // 现在 relativePath 例如："about.md" 或 "posts/图.md"

  for (let idx = 0; idx < blocks.length; idx++) {
    const block = blocks[idx];
    const blockKey = `${relativePath}_${idx}`;

    try {
      const rendered = await ec.render({
        code: block.code,
        language: block.language,
        meta: block.meta,
      });
      const html = toHtml(rendered.renderedGroupAst);
      const wrapped = `<div class="ec-code-block" data-language="${block.language}">${html}</div>`;
      blocksMap[blockKey] = wrapped;
    } catch (err) {
      console.error(`渲染失败: ${filePath} 块 ${idx}`, err);
      blocksMap[blockKey] = `<pre><code>${escapeHtml(block.code)}</code></pre>`;
    }
  }
}

async function main() {
  for (const file of mdFiles) {
    await processFile(file);
  }

  // 输出到 exampleSite/data/（Hugo 站点根下的 data 目录）
  const outDir = './exampleSite/data';
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  fs.writeFileSync(`${outDir}/ec-blocks.json`, JSON.stringify(blocksMap, null, 2));
  console.log(`✅ 已渲染 ${Object.keys(blocksMap).length} 个代码块`);
}

main().catch(console.error);