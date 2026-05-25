// Alpinejs components script
// 全局状态
document.addEventListener('alpine:init', () => {
    Alpine.store('somnia', {
        theme: localStorage.getItem('theme') || 'system',
        isDark: document.documentElement.classList.contains('dark'),
        menuOpen: false,
        init() {
            // console.log("[Somnia] [Init]",this.theme, this.isDark);
        },
        // 统一调用接口，方便未来改为全局事件总线 由 Somnia 负责
    });

})

// 处理页面数据 负责动态加载 js 等
function somniaData() {
    return {
        init() {
            const data = this.$el.dataset.somnia;
            if (data.trim() !== "[]") {
                console.log("[Somnia] [Data]", data.trim());
            }
            if (data.includes("katex")) {
                somnia.libs.katex.run(document.getElementById("content-wrapper"));
            }
            // 由 render-codeblock-mermaid.html 运行
            // if (data.includes("mermaid")) {
            //     somnia.libs.mermaid.run();
            // }
            if (data.includes("home")) {
                document.body.classList.add("lg:is-home");
            } else {
                document.body.classList.remove("lg:is-home");
            }
        }
    }
}

Somnia.prototype.axd = {};
const axd = Somnia.prototype.axd;

// App 组件 Apline.js x-data
Somnia.prototype.axd.hi = function () {
    return {
        init() { console.log("[Somnia] [Hi]"); }
    }
}


Somnia.prototype.axd.theme = function () {
    return {
        isHovered: false,
        init() {
            // 已经内联防闪烁
            this.setTheme(Alpine.store('somnia').theme);
        },
        toggle() {
            // 循环切换
            const themes = ['system', 'light', 'dark'];
            const currentIndex = themes.indexOf(Alpine.store('somnia').theme);
            const newTheme = themes[(currentIndex + 1) % themes.length];

            this.setTheme(newTheme);
        },
        setTheme(newTheme) {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            // 保存
            localStorage.setItem('theme', newTheme);
            // 设置 HTML
            if (newTheme === 'dark' || (newTheme === 'system' && systemTheme === 'dark')) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            document.documentElement.setAttribute('data-theme', newTheme);

            // this.theme = newTheme;
            // 改为 Alinejs 写法 :data-theme="theme" 让 theme 变量有点参与感
            // toggleDarkModeElement.dataset.theme = newTheme;
            Alpine.store('somnia').theme = newTheme;
            Alpine.store('somnia').isDark = document.documentElement.classList.contains('dark');
        }
    }
}


Somnia.prototype.axd.search = function () {
    return {
        init() {
            this.$watch('keyword', (value) => {
                this.doSearch();
            });
        },
        planelOpen: false,
        keyword: "",
        results: [],
        searchInit() {
            somnia.libs.pagefind.load();
        },
        async doSearch() {
            this.results = await somnia.libs.pagefind.run(this.keyword);
        },
        seachBtnClick() {
            this.planelOpen = !this.planelOpen;
            this.searchInit();
            this.$nextTick(() => {
                this.$refs['search-mobile']?.focus();
            });
        }
    }
}

Somnia.prototype.axd.backToTop = function () {
    return {
        hide: true,
        onScroll() {
            const bannerHeight = window.innerHeight * (BANNER_HEIGHT / 100);
            if (document.body.scrollTop > bannerHeight || document.documentElement.scrollTop > bannerHeight) {
                this.hide = false;
            } else {
                this.hide = true;
            }
        }
    }
}

// for Hugo-Landscape/layouts/_partials/toc/toc.html
class TableOfContents extends HTMLElement {
    constructor() {
        super();
        this.tocEl = null;
        this.visibleClass = "visible";
        this.observer = new IntersectionObserver(
            this.markVisibleSection, { threshold: 0 }
        );
        this.anchorNavTarget = null;
        this.headingIdxMap = new Map();
        this.headings = [];
        this.sections = [];
        this.tocEntries = [];
        this.active = [];
        this.activeIndicator = null;
    }

    markVisibleSection = (entries) => {
        entries.forEach((entry) => {
            const id = entry.target.children[0]?.getAttribute("id");
            const idx = id ? this.headingIdxMap.get(id) : undefined;
            if (idx != undefined)
                this.active[idx] = entry.isIntersecting;

            if (entry.isIntersecting && this.anchorNavTarget == entry.target.firstChild)
                this.anchorNavTarget = null;
        });

        if (!this.active.includes(true))
            this.fallback();
        this.update();
    };

    toggleActiveHeading = () => {
        let i = this.active.length - 1;
        let min = this.active.length - 1, max = -1;
        while (i >= 0 && !this.active[i]) {
            this.tocEntries[i].classList.remove(this.visibleClass);
            i--;
        }
        while (i >= 0 && this.active[i]) {
            this.tocEntries[i].classList.add(this.visibleClass);
            min = Math.min(min, i);
            max = Math.max(max, i);
            i--;
        }
        while (i >= 0) {
            this.tocEntries[i].classList.remove(this.visibleClass);
            i--;
        }
        if (min > max) {
            this.activeIndicator?.setAttribute("style", `opacity: 0`);
        } else {
            let parentOffset = this.tocEl?.getBoundingClientRect().top || 0;
            let scrollOffset = this.tocEl?.scrollTop || 0;
            let top = this.tocEntries[min].getBoundingClientRect().top - parentOffset + scrollOffset;
            let bottom = this.tocEntries[max].getBoundingClientRect().bottom - parentOffset + scrollOffset;
            this.activeIndicator?.setAttribute("style", `top: ${top}px; height: ${bottom - top}px`);
        }
    };

    scrollToActiveHeading = () => {
        if (this.anchorNavTarget || !this.tocEl) return;
        const activeHeading =
            document.querySelectorAll(`#toc .${this.visibleClass}`);
        if (!activeHeading.length) return;

        const topmost = activeHeading[0];
        const bottommost = activeHeading[activeHeading.length - 1];
        const tocHeight = this.tocEl.clientHeight;

        let top;
        if (bottommost.getBoundingClientRect().bottom -
            topmost.getBoundingClientRect().top < 0.9 * tocHeight)
            top = topmost.offsetTop - 32;
        else
            top = bottommost.offsetTop - tocHeight * 0.8;

        this.tocEl.scrollTo({
            top,
            left: 0,
            behavior: "smooth",
        });
    };

    update = () => {
        requestAnimationFrame(() => {
            this.toggleActiveHeading();
            this.scrollToActiveHeading();
        });
    };

    fallback = () => {
        if (!this.sections.length) return;

        for (let i = 0; i < this.sections.length; i++) {
            let offsetTop = this.sections[i].getBoundingClientRect().top;
            let offsetBottom = this.sections[i].getBoundingClientRect().bottom;

            if (this.isInRange(offsetTop, 0, window.innerHeight)
                || this.isInRange(offsetBottom, 0, window.innerHeight)
                || (offsetTop < 0 && offsetBottom > window.innerHeight)) {                    
                this.markActiveHeading(i);
            }
            else if (offsetTop > window.innerHeight) break;
        }
    };

    markActiveHeading = (idx) => {
        this.active[idx] = true;
    };

    handleAnchorClick = (event) => {
        const anchor = event
            .composedPath()
            .find((element) => element instanceof HTMLAnchorElement);

        if (anchor) {
            const id = decodeURIComponent(anchor.hash?.substring(1));
            const idx = this.headingIdxMap.get(id);
            if (idx !== undefined) {
                this.anchorNavTarget = this.headings[idx];
            } else {
                this.anchorNavTarget = null;
            }
        }
    };

    isInRange(value, min, max) {
        return min < value && value < max;
    }

    connectedCallback() {
        const element = document.querySelector('.prose');
        if (element) {
            element.addEventListener('animationend', () => {
                this.init();
            }, { once: true });
        } else {
            console.debug('Animation element not found');
        }
    }

    init() {
        this.tocEl = document.getElementById("toc-inner-wrapper");

        if (!this.tocEl) return;

        this.tocEl.addEventListener("click", this.handleAnchorClick, {
            capture: true,
        });

        this.activeIndicator = document.getElementById("active-indicator");

        this.tocEntries = Array.from(
            document.querySelectorAll("#toc a[href^='#']")
        );

        if (this.tocEntries.length === 0) return;

        this.sections = new Array(this.tocEntries.length);
        this.headings = new Array(this.tocEntries.length);
        for (let i = 0; i < this.tocEntries.length; i++) {
            const id = decodeURIComponent(this.tocEntries[i].hash?.substring(1));
            const heading = document.getElementById(id);
            const section = heading?.parentElement;
            if (heading instanceof HTMLElement && section instanceof HTMLElement) {
                this.headings[i] = heading;
                this.sections[i] = section;
                this.headingIdxMap.set(id, i);
            }
        }
        this.active = new Array(this.tocEntries.length).fill(false);

        this.sections.forEach((section) =>
            this.observer.observe(section)
        );

        this.fallback();
        this.update();
    }

    disconnectedCallback() {
        this.sections.forEach((section) =>
            this.observer.unobserve(section)
        );
        this.observer.disconnect();
        this.tocEl?.removeEventListener("click", this.handleAnchorClick);
    }
}

if (!customElements.get("table-of-contents")) {
    customElements.define("table-of-contents", TableOfContents);
}