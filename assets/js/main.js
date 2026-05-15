/*! Somnia | (c) 2026 kkbt */
class Somnia {
    showToast(msg) {
        console.log(msg);
    }
    swupPageInitMediumZoom() {
        this.libs.mediumZoom.run();
    }
    res() {
        const res = document.querySelectorAll("[data-somnia]");
        let result = {};
        res.forEach(el => {
            const key = el.getAttribute("data-somnia");
            result[key] = el;
        });
        return result;
    }
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
    }
}


//  libs 定义了 Somnia 可能使用的第三方库的加载和运行逻辑，每个库都有 loaded、ok、load 和 run 四个方法，分别用于检查是否已经加载、检查是否可用、加载资源和运行库功能。
// 动态加载由 xxxComponent() 负责
// Katex - somnia-data has "math" 时加载
// Pagefind - 由 searchComponent() 负责加载
// 幂等化，避免重复绑定
// 监测可用性，加载资源，初始化等逻辑
Somnia.prototype.libs = {
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
            // await Somnia.prototype.loadResource({ type: 'module', href: SOMNIA_LIBS.pagefind.js, dataSomnia: 'pagefind.js' });
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.type = 'module';
                // script.src = '/js/mermaid.js';
                script.defer = true;
                script.textContent = `import * as pagefind from '${SOMNIA_LIBS.pagefind.js}';pagefind.init();window.pagefind = pagefind;`;
                script.setAttribute('data-somnia', 'pagefind.js');
                // script.onload = () => resolve(script);
                // 轮询检查是否加载完成
                const checkInterval = setInterval(() => {
                    if (window.pagefind && window.pagefind.search) {
                        clearInterval(checkInterval);
                        resolve(script);
                    }
                }, 50);

                // 超时处理
                setTimeout(() => {
                    clearInterval(checkInterval);
                    reject(new Error('Pagefind 加载超时'));
                }, 5000);
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
                Somnia.prototype.showToast('搜索组件加载失败，请刷新页面重试');
            }
        }
    },
    katex: {
        loaded: () => !!document.head.querySelector('link[data-somnia="katex.css"]') && !!document.head.querySelector('script[data-somnia="katex.js"]') && !!document.head.querySelector('script[data-somnia="katex-auto-render.js"]'),
        ok: () => typeof window.renderMathInElement !== 'undefined',
        async load() {
            const katex = SOMNIA_LIBS.katex;
            // 插入 KaTeX CSS
            Somnia.prototype.loadResource({ rel: 'stylesheet', href: katex.css.href, crossOrigin: 'anonymous', dataSomnia: 'katex.css' });

            // 插入 KaTeX 主库 JS
            await Somnia.prototype.loadResource({ href: katex.js.href, integrity: katex.js.integrity, crossOrigin: 'anonymous', defer: true, dataSomnia: 'katex.js' });

            // 插入 KaTeX 自动渲染扩展
            await Somnia.prototype.loadResource({ href: katex.autoRenderJs.href, integrity: katex.autoRenderJs.integrity, crossOrigin: 'anonymous', defer: true, dataSomnia: 'katex-auto-render.js' });

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
                Somnia.prototype.showToast('数学公式组件加载失败，请刷新页面重试');
            }
        }
    },
    mermaid: {
        loaded: () => !!document.head.querySelector('script[data-somnia="mermaid.js"]'),
        ok: () => typeof window.mermaid !== 'undefined',
        async load() {
            // await somnia.loadResource({ href: '/js/mermaid.js', type: 'module', defer: true, dataSomnia: 'mermaid.js' });
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
            } else {
                console.warn('[Somnia] Lib Mermaid Error');
                Somnia.prototype.showToast('流程图组件加载失败，请刷新页面重试');
            }
        }
    }
}

const somnia = new Somnia();


