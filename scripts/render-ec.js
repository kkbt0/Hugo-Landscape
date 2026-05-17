import { ExpressiveCodeEngine } from '@expressive-code/core';
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';
import { toHtml } from 'hast-util-to-html';
import fs from 'fs';
import { glob } from 'glob';

const ec = new ExpressiveCodeEngine({
    themes: ['github-light', 'github-dark'],
    themeCssSelector: (theme) => theme.name === 'github-dark' ? 'html.dark' : 'html:not(.dark)',
    plugins: [
        collapsibleSections({
            collapsedLabel: '…',
            expandedLabel: '▼',
        }),
    ],
});

const contentDir = './content';
const mdFiles = glob.sync(`${contentDir}/**/*.md`, { ignore: '**/node_modules/**' });
const blocksMap = {};

function escapeHtml(str) {
    return str.replace(/[&<>]/g, (m) => {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

async function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const regex = /```(\w*)(?:\s+(.*?))?\n([\s\S]*?)```/g;
    let match;
    let blocks = [];
    while ((match = regex.exec(content)) !== null) {
        blocks.push({
            language: match[1] || 'text',
            meta: match[2] || '',
            code: match[3],
            start: match.index,
            end: match.index + match[0].length,
        });
    }
    if (blocks.length === 0) return;

    for (let idx = 0; idx < blocks.length; idx++) {
        const block = blocks[idx];
        const blockKey = `${filePath}_${idx}`;
        try {
            const { renderedGroupAst } = await ec.render({
                code: block.code,
                language: block.language,
                meta: block.meta,
            });
            const html = toHtml(renderedGroupAst);
            const wrapped = `<div class="ec-code-block" data-language="${block.language}">${html}</div>`;
            blocksMap[blockKey] = wrapped;
        } catch (err) {
            console.error(`渲染失败: ${filePath} 块 ${idx}`, err);
            const fallback = `<pre><code class="language-${block.language}">${escapeHtml(block.code)}</code></pre>`;
            blocksMap[blockKey] = fallback;
        }
    }
}

async function main() {
    for (const file of mdFiles) {
        await processFile(file);
    }
    const dataDir = './data';
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
    fs.writeFileSync('./data/ec-blocks.json', JSON.stringify(blocksMap, null, 2));
    console.log(`✅ 已渲染 ${Object.keys(blocksMap).length} 个代码块`);
}

main().catch(console.error);