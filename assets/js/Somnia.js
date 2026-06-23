/*! Somnia | (c) 2026 kkbt */
import mediumZoom from './libs/medium-zoom.esm.js';

import { SOMNIA_LIBS } from './variable.js';

const Somnia = {
    libs: {},
    plugin: {},
    axd: {},
    showToast(msg) {
        console.log(msg);
    },
    swupPageInitMediumZoom() {
        this.libs.mediumZoom.run();
    },
    res() {
        const res = document.querySelectorAll("[data-somnia]");
        let result = {};
        res.forEach(el => {
            const key = el.getAttribute("data-somnia");
            result[key] = el;
        });
        return result;
    },
    // 使用示例：
    // example loadResource(el,rel,href,type,integrity,crossOrigin,defer)
    async loadResource({
        element = document.head,        // 要追加到的DOM元素，默认为document.head。
        // 由于加载到哪里 Swup.js 切换页面都不会彻底拆卸。所以默认加载到 head，避免保证调试元素可见
        rel = 'stylesheet',            // 主要用于CSS的rel属性，默认'stylesheet'
        href,                          // 资源URL（必需）
        type,                           //  type module，可选
        integrity,                     // 完整性哈希，可选
        crossOrigin,                    // 跨域设置，可选
        defer = false,                     // 是否延迟加载，默认false
        dataSomnia = 'somnia'                 // 自定义属性，默认为空字符串
    } = {}) {
        return new Promise((resolve, reject) => {
            if (!href) {
                reject(new Error('href is required'));
                return;
            }

            // 判断是否为CSS资源
            let resource;
            if (href.endsWith('.css')) {
                // 创建CSS link元素
                resource = document.createElement('link');
                resource.rel = rel || 'stylesheet';
                resource.href = href;
            } else {
                // 创建JS script元素
                resource = document.createElement('script');
                resource.src = href;
            }

            // 设置可选属性
            if (integrity) resource.integrity = integrity;
            if (crossOrigin) resource.crossOrigin = crossOrigin;
            if (defer) resource.defer = true;
            if (type) resource.type = type;
            if (dataSomnia) resource.setAttribute('data-somnia', dataSomnia);

            // 事件处理
            resource.onload = () => resolve(resource);
            resource.onerror = () => reject(new Error(`Failed to load resource: ${href}`));

            // 追加到DOM
            element.appendChild(resource);
        });
    },
    // 简单 hash
    simpleHash(str) {
        let hash = 0;
        if (str.length === 0) return hash;
        for (let i = 0; i < str.length; i++) {
            let char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }
}

//  libs 定义了 Somnia 可能使用的第三方库的加载和运行逻辑。推荐 Promise list 写法，举例下面 qrcode
// 动态加载由 xxxComponent() 负责
// Katex - somnia-data has "math" 时加载
// 幂等化，避免重复绑定
// 监测可用性，加载资源，初始化等逻辑
Somnia.libs = {
    mediumZoom: {
        loaded: () => true, // 已经打包全局加载 返回 true 即可
        ok: () => typeof window.mediumZoom !== 'undefined',
        load() { }, // 已经全局加载
        run(query = '.markdown-content img') {
            const images = Array.from(document.querySelectorAll(query)).filter(img => !img.classList.contains('medium-zoom-image'));
            images.forEach(img => {
                mediumZoom(img, { background: 'rgba(0, 0, 0, 0.8)' });
            });
        }
    },
    pagefind: {
        // 通过检测资源是否存在来判断是否已经加载，避免重复加载
        loaded: () => !!document.head.querySelector('script[data-somnia="pagefind.js"]'),
        ok: () => typeof window.pagefind.search() !== 'undefined',
        async load() {
            // await Somnia.loadResource({ type: 'module', href: SOMNIA_LIBS.pagefind.js, dataSomnia: 'pagefind.js' });
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.type = 'module';
                // script.src = '/js/mermaid.js';
                script.defer = true;
                script.textContent = `import * as pagefind from '${SOMNIA_LIBS.pagefind.js}';pagefind.init();window.pagefind = pagefind;window.dispatchEvent(new CustomEvent('somnia:pagefind-loaded'));`;
                script.setAttribute('data-somnia', 'pagefind.js');
                window.addEventListener('somnia:pagefind-loaded', () => resolve(script), { once: true });
                // script.onload = () => resolve(script);
                script.onerror = () => reject();
                document.head.appendChild(script);
            });
        },
        async run(keyword = '') {
            if (!this.loaded()) await this.load();
            if (this.ok()) {
                const response = await window.pagefind.search(keyword);
                searchResults = await Promise.all(
                    response.results.map((item) => item.data()),
                );
                return searchResults;
            } else {
                console.warn('[Somnia] Lib Pagefind Error');
                Somnia.showToast('搜索组件加载失败，请刷新页面重试');
            }
        }
    },
    katex: {
        loaded: () => !!document.head.querySelector('link[data-somnia="katex.css"]') && !!document.head.querySelector('script[data-somnia="katex.js"]') && !!document.head.querySelector('script[data-somnia="katex-auto-render.js"]'),
        ok: () => typeof window.renderMathInElement !== 'undefined',
        async load() {
            const katex = SOMNIA_LIBS.katex;
            // 插入 KaTeX CSS
            Somnia.loadResource({ rel: 'stylesheet', href: katex.css.href, crossOrigin: 'anonymous', dataSomnia: 'katex.css' });

            // 插入 KaTeX 主库 JS
            await Somnia.loadResource({ href: katex.js.href, integrity: katex.js.integrity, crossOrigin: 'anonymous', defer: true, dataSomnia: 'katex.js' });

            // 插入 KaTeX 自动渲染扩展
            await Somnia.loadResource({ href: katex.autoRenderJs.href, integrity: katex.autoRenderJs.integrity, crossOrigin: 'anonymous', defer: true, dataSomnia: 'katex-auto-render.js' });

        },
        async run(element) {
            if (!this.loaded()) await this.load();
            if (this.ok()) {
                renderMathInElement(element, {
                    // customised options
                    // • auto-render specific keys, e.g.:
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false },
                        { left: '\\(', right: '\\)', display: false },
                        { left: '\\[', right: '\\]', display: true }
                    ],
                    // • rendering keys, e.g.:
                    throwOnError: false
                });
            } else {
                console.warn('[Somnia] Lib KaTeX Error');
                Somnia.showToast('数学公式组件加载失败，请刷新页面重试');
            }
        }
    },
    mermaid: {
        loaded: () => !!document.head.querySelector('script[data-somnia="mermaid.js"]'),
        ok: () => typeof window.mermaid !== 'undefined',
        async load() {
            // await Somnia.loadResource({ href: '/js/mermaid.js', type: 'module', defer: true, dataSomnia: 'mermaid.js' });
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.type = 'module';
                // script.src = '/js/mermaid.js';
                script.defer = true;
                script.textContent = `import mermaid from '${SOMNIA_LIBS.mermaid.js}';mermaid.initialize({ startOnLoad: false });window.mermaid = mermaid;`;
                script.setAttribute('data-somnia', 'mermaid.js');
                // script.onload = () => resolve(script);
                // 轮询检查是否加载完成
                const checkInterval = setInterval(() => {
                    if (window.mermaid && window.mermaid.initialize) {
                        clearInterval(checkInterval);
                        resolve(script);
                    }
                }, 50);

                // 超时处理
                setTimeout(() => {
                    clearInterval(checkInterval);
                    reject(new Error('Mermaid 加载超时'));
                }, 5000);
                script.onerror = () => reject();
                document.head.appendChild(script);
            });
        },
        async run() {
            if (!this.loaded()) await this.load();
            if (this.ok()) {
                const isDarkMode = document.documentElement.classList.contains('dark');
                const showEl = document.querySelectorAll(isDarkMode ? '.mermaid-dark' : '.mermaid');
                showEl.forEach(e => { e.style.display = 'block'; });
                const hideEl = document.querySelectorAll(isDarkMode ? '.mermaid' : '.mermaid-dark');
                hideEl.forEach(e => { e.style.display = 'none'; });
                mermaid.initialize({ startOnLoad: false, theme: isDarkMode ? 'dark' : 'default' });
                mermaid.run({ querySelector: isDarkMode ? ".mermaid-dark" : ".mermaid" }); // 幂等
            } else if (!this.loaded()) {
                console.warn('[Somnia] Lib Mermaid Error');
                Somnia.showToast('流程图组件加载失败，请刷新页面重试');
            } else {
                // do nothing 同时多次请求时只执行一次
            }
        }
    },
    // qrcode: {
    //     res: [],
    //     async load() {
    //         this.res.push(Somnia.loadResource({ href: SOMNIA_LIBS.qrcode.js, dataSomnia: 'qrcode.js' }));
    //     },
    //     async run({ el, opt } = {}) {
    //         if (!this.res.length) this.load();
    //         Promise.all(this.res)
    //             .then(r => {
    //                 new QRCode(el, opt);
    //             })
    //             .catch(e => {
    //                 console.warn('[Somnia] Lib QRCode Error');
    //             })
    //     },
    // },
}


// for Alpinejs https://alpinejs.dev/advanced/extending
Somnia.plugin.JSLoad = function (Alpine) {
    // directive magic plugin https://alpinejs.dev/advanced/extending
    // https://github.com/alpinejs/alpine/blob/main/packages/alpinejs/src/directives/x-ignore.js
    // console.log('[Somnia] Alpine Plugin Loaded');
    const jsReload = () => { }
    jsReload.inline = (el) => {
        const moveScript = (targetEl) => {
            if (!targetEl || targetEl.tagName?.toLowerCase() !== 'script') return;
            const id = Somnia.simpleHash(targetEl.innerHTML);
            if (document.getElementById(id)) return; // 避免切换页面的 head js 重复，初次加载 vm 仍有重复
            const newScript = document.createElement('script');
            newScript.id = `somnia-x-js-load-${targetEl.innerHTML.length}-${id}`;
            newScript.innerHTML = targetEl.innerHTML;
            document.head.appendChild(newScript);
            targetEl.remove();
            el.removeAttribute('x-js-load');
        }
        moveScript(el); // 选择 el
        moveScript(el.nextElementSibling) // 选择 el 的下一个兄弟节点
        moveScript(el.lastElementChild) // 选择 el 最后一个子节点
    }
    Alpine.directive('js-load', jsReload)
}

export default Somnia;
