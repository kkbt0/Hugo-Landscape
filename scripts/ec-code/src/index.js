// scripts/build-codeblocks.js
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeExpressiveCode from 'rehype-expressive-code';
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';
import { pluginFrames } from '@expressive-code/plugin-frames';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';
import { pluginLanguageLogo } from 'ec-lang-logo';
import { toHtml } from 'hast-util-to-html';
import { visit } from 'unist-util-visit';
import fs from 'fs';
import { globSync } from 'glob';
import path from 'path';
import { fileURLToPath } from 'url';

// 定位项目根
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Expressive Code 配置
const ecOptions = {
  themes: ['github-light', 'github-dark'],
  themeCssSelector: (theme) => theme.name === 'github-dark' ? '[data-theme="dark"]' : '[data-theme="light"]',
  plugins: [
    pluginCollapsibleSections(),
    pluginFrames(),
    pluginLineNumbers(),
    pluginLanguageLogo({
      color: 'mono',           // 'mono' | 'original' | 'theme' | '#hexcolor'
      excludedLangs: [],       // Array of language identifiers to exclude
    })
  ],
};

// unified 管道：remark -> rehype -> expressive-code
const processor = unified()
  .use(remarkParse)                       // 解析 Markdown → mdast
  .use(remarkRehype, { allowDangerousHtml: true }) // mdast → hast
  .use(rehypeExpressiveCode, ecOptions);   // 转换代码块

const contentDir = path.join(projectRoot, 'exampleSite', 'content');
const outputDir = path.join(projectRoot, 'exampleSite', 'data');
const blocksMap = {};

async function processFile(filePath) {
  const mdContent = fs.readFileSync(filePath, 'utf-8');

  // 使用 parse + run 替代 process，避免缺少编译器错误
  const mdast = processor.parse(mdContent);
  const hast = await processor.run(mdast);

  const blocks = [];

  // 遍历 hast 树收集代码块
  visit(hast, 'element', (node) => {
    if (
      node.tagName === 'div' &&
      Array.isArray(node.properties?.className) &&
      node.properties.className.includes('expressive-code')
    ) {
      blocks.push(toHtml(node));
    }
  });

  // 如果遍历未找到，用正则兜底（以防结构变化）
  if (blocks.length === 0) {
    const fullHtml = toHtml(hast);
    const regex = /<div class="expressive-code">[\s\S]*?<\/div>/g;
    let match;
    while ((match = regex.exec(fullHtml)) !== null) {
      blocks.push(match[0]);
    }
  }

  if (blocks.length === 0) return;

  const relativePath = path.relative(contentDir, filePath).replace(/\\/g, '/');

  for (let idx = 0; idx < blocks.length; idx++) {
    const blockKey = `${relativePath}_${idx}`;
    blocksMap[blockKey] = `<div class="ec-code-block">${blocks[idx]}</div>`;
  }
}

async function main() {
  const posixContentDir = contentDir.replace(/\\/g, '/');
  const pattern = `${posixContentDir}/**/*.md`;

  console.log(`项目根目录: ${projectRoot}`);
  console.log(`内容目录: ${contentDir}`);
  console.log(`扫描模式: ${pattern}`);

  const mdFiles = globSync(pattern, { ignore: '**/node_modules/**' });
  console.log(`找到 ${mdFiles.length} 个 Markdown 文件`);

  for (const file of mdFiles) {
    await processFile(file);
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(path.join(outputDir, 'ec-blocks.json'), JSON.stringify(blocksMap, null, 2));
  console.log(`✅ 已渲染 ${Object.keys(blocksMap).length} 个代码块`);
}

main().catch(console.error);