// 更新js依赖
// 运行此脚本需要 llrt
// https://github.com/alpinejs/alpine/releases

import { readFileSync, writeFileSync } from 'fs';

async function getFinalUrl(url) {
    try {
        const response = await fetch(url, {
            method: 'HEAD',
            redirect: 'manual',
        });

        // 注意：由于 CORS 限制，你可能无法直接读取响应头
        console.log('URL:', response.url);
        return response.url;
    } catch (error) {
        console.error('获取URL时出错:', error);
    }
}

// 使用示例
// getFinalUrl('https://unpkg.com/swup@4');
// getFinalUrl('https://unpkg.com/@swup/preload-plugin@3');
// getFinalUrl('https://unpkg.com/@swup/scroll-plugin@4');
// getFinalUrl('https://unpkg.com/unpkg.com/alpinejs');



function SomniaPath(path) {
    if (path.startsWith('Somnia')) {
        return path.replace('Somnia', '.');
    }
    return path;
}


function unpkgURL(url) {
    if (url.startsWith('http')) {
        return url;
    }
    return `https://unpkg.com${url}`;
}

async function download(url, path) {
    console.log("下载", unpkgURL(url), "到", SomniaPath(path));
    const response = await fetch(unpkgURL(url));
    const text = await response.text();
    const info = `// ${unpkgURL(url)}\n\n`;
    writeFileSync(SomniaPath(path), info + text);
    return url;
}



async function updateVersion() {
    try {
        const ver = JSON.parse(readFileSync('./scripts/version.json', 'utf8'));
        // 定义需要处理的依赖项名称
        const depNames = ['swup', 'swup/preload-plugin', 'swup/scroll-plugin', 'alpinejs'];

        for (const depName of depNames) {
            const dep = ver.dependencies[depName];
            // 获取远程最新地址
            dep.remote = await getFinalUrl(dep.url);

            // 比较并更新
            if (dep.local !== dep.remote) {
                await download(dep.remote, dep.path);
                dep.local = dep.remote;
                ver.updateDate = new Date();
            }
        }
        writeFileSync('./scripts/version.json', JSON.stringify(ver, null, 2));

    } catch (error) {
        console.error('出错:', error);
    }
}

updateVersion();