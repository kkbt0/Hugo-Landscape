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
    async loadResource({
        element = document.head,
        rel = 'stylesheet',
        href,
        type,
        integrity,
        crossOrigin,
        defer = false,
        dataSomnia = 'somnia'
    } = {}) {
        return new Promise((resolve, reject) => {
            if (!href) {
                reject(new Error('href is required'));
                return;
            }
            let resource;
            if (href.endsWith('.css')) {
                resource = document.createElement('link');
                resource.rel = rel || 'stylesheet';
                resource.href = href;
            } else {
                resource = document.createElement('script');
                resource.src = href;
            }
            if (integrity) resource.integrity = integrity;
            if (crossOrigin) resource.crossOrigin = crossOrigin;
            if (defer) resource.defer = true;
            if (type) resource.type = type;
            if (dataSomnia) resource.setAttribute('data-somnia', dataSomnia);
            resource.onload = () => resolve(resource);
            resource.onerror = () => reject(new Error(`Failed to load resource: ${href}`));
            element.appendChild(resource);
        });
    }
}

Somnia.prototype.libs = {
    mediumZoom: {
        loaded: () => true,
        ok: () => typeof window.mediumZoom !== 'undefined',
        load() { },
        run(query = '.markdown-content img') {
            const images = Array.from(document.querySelectorAll(query)).filter(img => !img.classList.contains('medium-zoom-image'));
            images.forEach(img => {
                mediumZoom(img, { background: 'rgba(0, 0, 0, 0.8)' });
            });
        }
    },
    pagefind: {
        loaded: () => !!document.head.querySelector('script[data-somnia="pagefind.js"]'),
        ok: () => typeof window.pagefind?.search === 'function',
        async load() {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.type = 'module';
                script.defer = true;
                script.textContent = `import * as pagefind from '${SOMNIA_LIBS.pagefind.js}';pagefind.init();window.pagefind = pagefind;`;
                script.setAttribute('data-somnia', 'pagefind.js');
                const checkInterval = setInterval(() => {
                    if (window.pagefind && window.pagefind.search) {
                        clearInterval(checkInterval);
                        resolve(script);
                    }
                }, 50);
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
                const searchResults = await Promise.all(response.results.map((item) => item.data()));
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
            Somnia.prototype.loadResource({ rel: 'stylesheet', href: katex.css.href, crossOrigin: 'anonymous', dataSomnia: 'katex.css' });
            await Somnia.prototype.loadResource({ href: katex.js.href, integrity: katex.js.integrity, crossOrigin: 'anonymous', defer: true, dataSomnia: 'katex.js' });
            await Somnia.prototype.loadResource({ href: katex.autoRenderJs.href, integrity: katex.autoRenderJs.integrity, crossOrigin: 'anonymous', defer: true, dataSomnia: 'katex-auto-render.js' });
        },
        async run(element) {
            if (!this.loaded()) await this.load();
            if (this.ok()) {
                renderMathInElement(element, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false },
                        { left: '\\(', right: '\\)', display: false },
                        { left: '\\[', right: '\\]', display: true }
                    ],
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
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.type = 'module';
                script.defer = true;
                script.textContent = `import mermaid from '${SOMNIA_LIBS.mermaid.js}';mermaid.initialize({ startOnLoad: false });window.mermaid = mermaid;`;
                script.setAttribute('data-somnia', 'mermaid.js');
                const checkInterval = setInterval(() => {
                    if (window.mermaid && window.mermaid.initialize) {
                        clearInterval(checkInterval);
                        resolve(script);
                    }
                }, 50);
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
                const hideEl = document.querySelectorAll(isDarkMode ? '.mermaid' : '.mermaid-dark');
                showEl.forEach(e => e.style.display = 'block');
                hideEl.forEach(e => e.style.display = 'none');
                mermaid.initialize({ startOnLoad: false, theme: isDarkMode ? 'dark' : 'default' });
                mermaid.run({ querySelector: isDarkMode ? ".mermaid-dark" : ".mermaid" });
            } else {
                console.warn('[Somnia] Lib Mermaid Error');
                Somnia.prototype.showToast('流程图组件加载失败，请刷新页面重试');
            }
        }
    }
};

const somnia = new Somnia();

// ========== 自定义增强：主题色切换、复制按钮、导航栏绑定 ==========
(function() {
    // 亮暗主题切换（扩展原 switchTheme 逻辑，确保与其他库兼容）
    window.switchTheme = function() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        // 触发 Mermaid 重新渲染（如果已加载）
        if (window.somnia && window.somnia.libs.mermaid.ok()) {
            window.somnia.libs.mermaid.run();
        }
    };

    // 色相设置
    window.setHue = function(hue) {
        let num = Math.min(360, Math.max(0, parseInt(hue) || 250));
        localStorage.setItem('hue', String(num));
        document.documentElement.style.setProperty('--hue', num);
        const slider = document.getElementById('colorSlider');
        const valueSpan = document.getElementById('hueValue');
        if (slider) slider.value = num;
        if (valueSpan) valueSpan.innerText = num;
    };

    // 复制按钮（同时支持降级代码块和 EC 块）
    function initCopyButtons() {
        document.querySelectorAll('.copy-btn').forEach(btn => {
            if (btn.dataset.bound) return;
            btn.dataset.bound = 'true';
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                let wrapper = btn.closest('.code-block-wrapper') || btn.closest('.ec-code-block');
                let codeEl = wrapper?.querySelector('code');
                if (!codeEl) return;
                const text = codeEl.innerText;
                try {
                    await navigator.clipboard.writeText(text);
                    const copyIcon = btn.querySelector('.copy-icon');
                    const successIcon = btn.querySelector('.success-icon');
                    if (copyIcon && successIcon) {
                        copyIcon.style.display = 'none';
                        successIcon.style.display = 'block';
                        setTimeout(() => {
                            copyIcon.style.display = 'block';
                            successIcon.style.display = 'none';
                        }, 2000);
                    }
                } catch (err) {
                    console.error('复制失败', err);
                }
            });
        });
    }

    // 绑定导航栏按钮（主题面板、移动端菜单）
    function bindNavButtons() {
        const displayBtn = document.getElementById('display-settings-switch');
        const displayPanel = document.getElementById('display-setting');
        if (displayBtn && displayPanel) {
            displayBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                displayPanel.classList.toggle('closed');
            });
            document.addEventListener('click', (e) => {
                if (!displayPanel.contains(e.target) && e.target !== displayBtn) {
                    displayPanel.classList.add('closed');
                }
            });
        }
        const schemeBtn = document.getElementById('scheme-switch');
        if (schemeBtn) schemeBtn.addEventListener('click', window.switchTheme);
        const menuBtn = document.getElementById('nav-menu-switch');
        const menuPanel = document.getElementById('nav-menu-panel');
        if (menuBtn && menuPanel) {
            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                menuPanel.classList.toggle('closed');
            });
            document.addEventListener('click', (e) => {
                if (!menuPanel.contains(e.target) && e.target !== menuBtn) {
                    menuPanel.classList.add('closed');
                }
            });
        }
        const slider = document.getElementById('colorSlider');
        if (slider) {
            slider.addEventListener('input', (e) => window.setHue(e.target.value));
        }
        const resetBtn = document.getElementById('reset-hue-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => window.setHue(250));
        }
    }

    // 初始化
    function initCustom() {
        const savedHue = localStorage.getItem('hue');
        window.setHue(savedHue !== null ? parseInt(savedHue) : 250);
        if (localStorage.getItem('theme') === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.setAttribute('data-theme', 'light');
        }
        bindNavButtons();
        initCopyButtons();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCustom);
    } else {
        initCustom();
    }

    // 兼容 Swup 页面切换
    if (typeof swup !== 'undefined') {
        swup.hooks.on('page:view', () => {
            bindNavButtons();
            initCopyButtons();
        });
    }
})();