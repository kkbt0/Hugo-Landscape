
// for cdn or local libs url
const SOMNIA_LIBS = {
    pagefind: {
        js: '/pagefind/pagefind.js'
    },
    katex: {
        css: { href: 'https://cdn.jsdelivr.net/npm/katex@0.16.38/dist/katex.min.css', integrity: 'sha384-/L6i+LN3dyoaK2jYG5ZLh5u13cjdsPDcFOSNJeFBFa/KgVXR5kOfTdiN3ft1uMAq' },
        js: { href: 'https://cdn.jsdelivr.net/npm/katex@0.16.38/dist/katex.min.js', integrity: 'sha384-H6s1ZrH2CKpFpqR680poRdStIRJGXty7fSkxAcIfxwl9iu6A4BOPtTk7vQ58Ovio' },
        autoRenderJs: { href: 'https://cdn.jsdelivr.net/npm/katex@0.16.38/dist/contrib/auto-render.min.js', integrity: 'sha384-bjyGPfbij8/NDKJhSGZNP/khQVgtHUE5exjm4Ydllo42FwIgYsdLO2lXGmRBf5Mz' }
    },
    mermaid: {
        js: 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.esm.min.mjs'
    }
}

const PAGE_SIZE = 8;

// Banner height unit: vh
const BANNER_HEIGHT = 35;
const BANNER_HEIGHT_EXTEND = 30;
const BANNER_HEIGHT_HOME = BANNER_HEIGHT + BANNER_HEIGHT_EXTEND;    

// The height the main panel overlaps the banner, unit: rem
const MAIN_PANEL_OVERLAPS_BANNER_HEIGHT = 3.5;

// Page width: rem
const PAGE_WIDTH = 75;