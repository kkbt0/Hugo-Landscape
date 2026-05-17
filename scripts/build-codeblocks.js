import { ExpressiveCode } from 'expressive-code';
import { pluginShiki } from '@expressive-code/plugin-shiki'; // 新增
import { pluginFrames } from '@expressive-code/plugin-frames';
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';
import { toHtml } from 'hast-util-to-html';
import fs from 'fs';
import { glob } from 'glob';

const ec = new ExpressiveCode({
  // ⚠️ 把 themes 从顶层移除，改为交给 pluginShiki 管理
  themeCssSelector: (theme) =>
    theme.name === 'github-dark' ? 'html.dark' : 'html:not(.dark)',
  plugins: [
    // ✅ 将 pluginShiki 放在第一个，传入 themes
    pluginShiki({
      themes: ['github-light', 'github-dark'],
    }),
    pluginFrames(),
    pluginCollapsibleSections(),
  ],
});

// 指向你的文章目录，请根据你的实际情况修改
const contentDir = './exampleSite/content';
const mdFiles = glob.sync(`${contentDir}/**/*.md`, { ignore: '**/node_modules/**' });
const blocksMap = {};

async function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const codeBlockRegex = /```(\w*)(?:\s+(.*?))?\n([\s\S]*?)```/g;
    let match;
    let blocks = [];
    while ((match = codeBlockRegex.exec(content)) !== null) {
        blocks.push({
            language: match[1] || 'text',
            meta: match[2] || '',
            code: match[3],
        });
    }
    if (blocks.length === 0) return;

    for (let idx = 0; idx < blocks.length; idx++) {
        const block = blocks[idx];
        const blockKey = `${filePath}_${idx}`;
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
  if (!fs.existsSync('./data')) fs.mkdirSync('./data');
  fs.writeFileSync('./data/ec-blocks.json', JSON.stringify(blocksMap, null, 2));
  console.log(`✅ 已渲染 ${Object.keys(blocksMap).length} 个代码块`);
}

main().catch(console.error);