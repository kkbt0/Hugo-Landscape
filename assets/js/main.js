import Alpine from './libs/alpinejs.esm.js';
import AsyncAlpine from './libs/async-alpine.esm.js';
import { Swup, SwupScrollPlugin } from './libs/swup.esm.js';
import mediumZoom from './libs/medium-zoom.esm.js';

import { SOMNIA_LIBS, PAGE_SIZE, BANNER_HEIGHT, BANNER_HEIGHT_EXTEND, BANNER_HEIGHT_HOME, MAIN_PANEL_OVERLAPS_BANNER_HEIGHT, PAGE_WIDTH } from './variable.js';
import Somnia from './Somnia.js';
import { somniaData, axd } from './components.js';


Somnia.axd = axd;

// 全局挂载
Object.assign(window, {
    Alpine,
    Swup,
    mediumZoom,
    Somnia,
    axd,
    PAGE_SIZE,
    BANNER_HEIGHT,
    BANNER_HEIGHT_EXTEND,
    BANNER_HEIGHT_HOME,
    MAIN_PANEL_OVERLAPS_BANNER_HEIGHT,
    PAGE_WIDTH,
    SOMNIA_LIBS,
    somniaData
});


// 全局状态
Alpine.plugin(AsyncAlpine);
Alpine.plugin(Somnia.plugin.JSLoad);
Alpine.store('somnia', {
    theme: localStorage.getItem('theme') || 'system',
    isDark: document.documentElement.classList.contains('dark'),
    menuOpen: false,
    init() {
        // console.log("[Somnia] [Init]",this.theme, this.isDark);
    },
    // 统一调用接口，方便未来改为全局事件总线 由 Somnia 负责
});


Somnia.start = function () {
    Somnia.PageInitCustom?.();
    Somnia.swupPageInitMediumZoom?.();
    Somnia.swupPageInitCustom?.();
    const swup = new Swup({
        containers: ["main", "#toc"],
        animationSelector: '[class*="transition-swup-"]',
        // native: true,
        plugins: [
            new SwupScrollPlugin(),
        ]
    });
    // Alpine.start(); // Alpinejs 已经启动
    swup.hooks.on('page:view', () => {
        Somnia.swupPageInitMediumZoom?.();
        Somnia.swupPageInitCustom?.();
    });
    Alpine.start();
}
