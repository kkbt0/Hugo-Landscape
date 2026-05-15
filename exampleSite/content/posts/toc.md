---
title: TOC 说明
---

TOC 说明

<!--more-->


layouts/_partials/toc/toc.html 增加

```js
<script>
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
</script>
```


此外还需要生成 section。也就是remarkSectionize 的功能

```js
		remarkPlugins: [
			remarkMath,
			remarkReadingTime,
			remarkExcerpt,
			remarkGithubAdmonitionsToDirectives,
			remarkDirective,
			remarkSectionize,
			parseDirectiveNode,
		],
```

layouts/_markup/render-heading.html 增加

```html
{{- /* 使用 Scratch 存储上一个标题级别 */ -}}
{{- $prevHeading := .Page.Scratch.Get "prevHeading" -}}
{{- $currentHeading := .Level -}}

{{- /* 章节逻辑：
      1. 当不是第一个标题时，关闭上一个章节
      2. 打开新章节
      3. 渲染当前标题
      4. 将当前标题存入 Scratch，供下一次调用
*/ -}}

{{- /* 1. 如果不是第一个标题，就关闭上一个章节 */ -}}
{{- if $prevHeading }}
</section>
{{- end }}

{{- /* 2. 打开新章节，关键 id 必须与标题自身的锚点相同，确保滚动监听 */ -}}
{{/*  <section id="heading-{{ .Anchor }}" data-level="{{ .Level }}" class="content-section">  */}}
<section>

{{- /* 3. 渲染标题本身 */ -}}
<h{{ .Level }} id="{{ .Anchor }}">
    {{ .Text }}
</h{{ .Level }}>

{{- /* 4. 更新 Scratch，记录当前标题级别 */ -}}
{{- .Page.Scratch.Set "prevHeading" $currentHeading -}}
```

然后 layouts/posts/single.html layouts/page.html 增加

```html
      {{ .Content }}
      {{ if .Scratch.Get "prevHeading" }}
      </section>
      {{ end }}
```