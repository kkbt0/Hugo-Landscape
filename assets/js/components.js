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
