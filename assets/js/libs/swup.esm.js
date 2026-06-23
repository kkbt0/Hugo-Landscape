// node_modules/delegate-it/delegate.js
var ledger = new WeakMap;
function editLedger(wanted, baseElement, callback, setup) {
  if (!wanted && !ledger.has(baseElement)) {
    return false;
  }
  const elementMap = ledger.get(baseElement) ?? new WeakMap;
  ledger.set(baseElement, elementMap);
  const setups = elementMap.get(callback) ?? new Set;
  elementMap.set(callback, setups);
  const existed = setups.has(setup);
  if (wanted) {
    setups.add(setup);
  } else {
    setups.delete(setup);
  }
  return existed && wanted;
}
function safeClosest(event, selector) {
  let target = event.target;
  if (target instanceof Text) {
    target = target.parentElement;
  }
  if (target instanceof Element && event.currentTarget instanceof Node) {
    const closest = target.closest(selector);
    if (closest && event.currentTarget.contains(closest)) {
      return closest;
    }
  }
}
function delegate(selector, type, callback, options = {}) {
  if (Array.isArray(type)) {
    for (const t of type) {
      delegate(selector, t, callback, options);
    }
    return;
  }
  const singleType = type;
  const { signal, base = document } = options;
  if (signal?.aborted) {
    return;
  }
  const { once, ...nativeListenerOptions } = options;
  const baseElement = base instanceof Document ? base.documentElement : base;
  const capture = Boolean(typeof options === "object" ? options.capture : options);
  const listenerFunction = (event) => {
    const delegateTarget = safeClosest(event, String(selector));
    if (delegateTarget) {
      const delegateEvent = Object.assign(event, { delegateTarget });
      callback.call(baseElement, delegateEvent);
      if (once) {
        baseElement.removeEventListener(singleType, listenerFunction, nativeListenerOptions);
        editLedger(false, baseElement, callback, setup);
      }
    }
  };
  const setup = JSON.stringify({ selector, type: singleType, capture });
  const isAlreadyListening = editLedger(true, baseElement, callback, setup);
  if (!isAlreadyListening) {
    baseElement.addEventListener(singleType, listenerFunction, nativeListenerOptions);
  }
  signal?.addEventListener("abort", () => {
    editLedger(false, baseElement, callback, setup);
  });
}
var delegate_default = delegate;
// node_modules/swup/dist/Swup.modern.js
function i() {
  return i = Object.assign ? Object.assign.bind() : function(t) {
    for (var e = 1;e < arguments.length; e++) {
      var i2 = arguments[e];
      for (var s in i2)
        ({}).hasOwnProperty.call(i2, s) && (t[s] = i2[s]);
    }
    return t;
  }, i.apply(null, arguments);
}
var s = (t, e) => String(t).toLowerCase().replace(/[\s/_.]+/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-").replace(/^-+|-+$/g, "") || e || "";
var n = ({ hash: t } = {}) => window.location.pathname + window.location.search + (t ? window.location.hash : "");
var o = (t, e = {}) => {
  const s2 = i({ url: t = t || n({ hash: true }), random: Math.random(), source: "swup" }, e);
  window.history.pushState(s2, "", t);
};
var r = (t = null, e = {}) => {
  t = t || n({ hash: true });
  const s2 = i({}, window.history.state || {}, { url: t, random: Math.random(), source: "swup" }, e);
  window.history.replaceState(s2, "", t);
};
var a = (e, s2, n2, o2) => {
  const r2 = new AbortController;
  return o2 = i({}, o2, { signal: r2.signal }), delegate_default(e, s2, n2, o2), { destroy: () => r2.abort() };
};

class l extends URL {
  constructor(t, e = document.baseURI) {
    super(t.toString(), e), Object.setPrototypeOf(this, l.prototype);
  }
  get url() {
    return this.pathname + this.search;
  }
  static fromElement(t) {
    const e = t.getAttribute("href") || t.getAttribute("xlink:href") || "";
    return new l(e);
  }
  static fromUrl(t) {
    return new l(t);
  }
}
class c extends Error {
  constructor(t, e) {
    super(t), this.url = undefined, this.status = undefined, this.aborted = undefined, this.timedOut = undefined, this.name = "FetchError", this.url = e.url, this.status = e.status, this.aborted = e.aborted || false, this.timedOut = e.timedOut || false;
  }
}
async function u(t, e = {}) {
  var s2;
  t = l.fromUrl(t).url;
  const { visit: n2 = this.visit } = e, o2 = i({}, this.options.requestHeaders, e.headers), r2 = (s2 = e.timeout) != null ? s2 : this.options.timeout, a2 = new AbortController, { signal: h } = a2;
  e = i({}, e, { headers: o2, signal: h });
  let u2, d = false, p = null;
  r2 && r2 > 0 && (p = setTimeout(() => {
    d = true, a2.abort("timeout");
  }, r2));
  try {
    u2 = await this.hooks.call("fetch:request", n2, { url: t, options: e }, (t2, { url: e2, options: i2 }) => fetch(e2, i2)), p && clearTimeout(p);
  } catch (e2) {
    if (d)
      throw this.hooks.call("fetch:timeout", n2, { url: t }), new c(`Request timed out: ${t}`, { url: t, timedOut: d });
    if ((e2 == null ? undefined : e2.name) === "AbortError" || h.aborted)
      throw new c(`Request aborted: ${t}`, { url: t, aborted: true });
    throw e2;
  }
  const { status: m, url: g } = u2, w = await u2.text();
  if (m === 500)
    throw this.hooks.call("fetch:error", n2, { status: m, response: u2, url: g }), new c(`Server error: ${g}`, { status: m, url: g });
  if (!w)
    throw new c(`Empty response: ${g}`, { status: m, url: g });
  const { url: f } = l.fromUrl(g), v = { url: f, html: w };
  return !n2.cache.write || e.method && e.method !== "GET" || t !== f || this.cache.set(v.url, v), v;
}

class d {
  constructor(t) {
    this.swup = undefined, this.pages = new Map, this.swup = t;
  }
  get size() {
    return this.pages.size;
  }
  get all() {
    const t = new Map;
    return this.pages.forEach((e, s2) => {
      t.set(s2, i({}, e));
    }), t;
  }
  has(t) {
    return this.pages.has(this.resolve(t));
  }
  get(t) {
    const e = this.pages.get(this.resolve(t));
    return e ? i({}, e) : e;
  }
  set(t, e) {
    e = i({}, e, { url: t = this.resolve(t) }), this.pages.set(t, e), this.swup.hooks.callSync("cache:set", undefined, { page: e });
  }
  update(t, e) {
    t = this.resolve(t);
    const s2 = i({}, this.get(t), e, { url: t });
    this.pages.set(t, s2);
  }
  delete(t) {
    this.pages.delete(this.resolve(t));
  }
  clear() {
    this.pages.clear(), this.swup.hooks.callSync("cache:clear", undefined, undefined);
  }
  prune(t) {
    this.pages.forEach((e, i2) => {
      t(i2, e) && this.delete(i2);
    });
  }
  resolve(t) {
    const { url: e } = l.fromUrl(t);
    return this.swup.resolveUrl(e);
  }
}
var p = (t, e = document) => e.querySelector(t);
var m = (t, e = document) => Array.from(e.querySelectorAll(t));
var g = () => new Promise((t) => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      t();
    });
  });
});
function w(t) {
  return !!t && (typeof t == "object" || typeof t == "function") && typeof t.then == "function";
}
function f(t, e = []) {
  return new Promise((i2, s2) => {
    const n2 = t(...e);
    w(n2) ? n2.then(i2, s2) : i2(n2);
  });
}
function y(t, e) {
  const i2 = t == null ? undefined : t.closest(`[${e}]`);
  return i2 != null && i2.hasAttribute(e) ? (i2 == null ? undefined : i2.getAttribute(e)) || true : undefined;
}

class k {
  constructor(t) {
    this.swup = undefined, this.swupClasses = ["to-", "is-changing", "is-rendering", "is-popstate", "is-animating", "is-leaving"], this.swup = t;
  }
  get selectors() {
    const { scope: t } = this.swup.visit.animation;
    return t === "containers" ? this.swup.visit.containers : t === "html" ? ["html"] : Array.isArray(t) ? t : [];
  }
  get selector() {
    return this.selectors.join(",");
  }
  get targets() {
    return this.selector.trim() ? m(this.selector) : [];
  }
  add(...t) {
    this.targets.forEach((e) => e.classList.add(...t));
  }
  remove(...t) {
    this.targets.forEach((e) => e.classList.remove(...t));
  }
  clear() {
    this.targets.forEach((t) => {
      const e = t.className.split(" ").filter((t2) => this.isSwupClass(t2));
      t.classList.remove(...e);
    });
  }
  isSwupClass(t) {
    return this.swupClasses.some((e) => t.startsWith(e));
  }
}

class b {
  constructor(t, e) {
    this.id = undefined, this.state = undefined, this.from = undefined, this.to = undefined, this.containers = undefined, this.animation = undefined, this.trigger = undefined, this.cache = undefined, this.history = undefined, this.scroll = undefined, this.meta = undefined;
    const { to: i2, from: s2, hash: n2, el: o2, event: r2 } = e;
    this.id = Math.random(), this.state = 1, this.from = { url: s2 != null ? s2 : t.location.url, hash: t.location.hash }, this.to = { url: i2, hash: n2 }, this.containers = t.options.containers, this.animation = { animate: true, wait: false, name: undefined, native: t.options.native, scope: t.options.animationScope, selector: t.options.animationSelector }, this.trigger = { el: o2, event: r2 }, this.cache = { read: t.options.cache, write: t.options.cache }, this.history = { action: "push", popstate: false, direction: undefined }, this.scroll = { reset: true, target: undefined }, this.meta = {};
  }
  advance(t) {
    this.state < t && (this.state = t);
  }
  abort() {
    this.state = 8;
  }
  ignore() {
    this.state = 10;
  }
  get done() {
    return this.state >= 7;
  }
  get ignored() {
    return this.state === 10;
  }
}
function S(t) {
  return new b(this, t);
}

class E {
  constructor(t) {
    this.swup = undefined, this.registry = new Map, this.hooks = ["animation:out:start", "animation:out:await", "animation:out:end", "animation:in:start", "animation:in:await", "animation:in:end", "animation:skip", "cache:clear", "cache:set", "content:replace", "content:scroll", "enable", "disable", "fetch:request", "fetch:error", "fetch:timeout", "history:popstate", "link:click", "link:self", "link:anchor", "link:newtab", "page:load", "page:view", "scroll:top", "scroll:anchor", "visit:start", "visit:transition", "visit:abort", "visit:end"], this.nextHookId = 0, this.swup = t, this.init();
  }
  init() {
    this.hooks.forEach((t) => this.create(t));
  }
  create(t) {
    this.registry.has(t) || this.registry.set(t, new Map);
  }
  exists(t) {
    return this.registry.has(t);
  }
  get(t) {
    const e = this.registry.get(t);
    if (e)
      return e;
    console.error(`Unknown hook '${t}'`);
  }
  clear() {
    this.registry.forEach((t) => t.clear());
  }
  on(t, e, s2 = {}) {
    const n2 = this.get(t);
    if (!n2)
      return console.warn(`Hook '${t}' not found.`), () => {};
    const o2 = i({}, s2, { id: ++this.nextHookId, hook: t, handler: e });
    return n2.set(e, o2), () => this.off(t, e);
  }
  before(t, e, s2 = {}) {
    return this.on(t, e, i({}, s2, { before: true }));
  }
  replace(t, e, s2 = {}) {
    return this.on(t, e, i({}, s2, { replace: true }));
  }
  once(t, e, s2 = {}) {
    return this.on(t, e, i({}, s2, { once: true }));
  }
  off(t, e) {
    const i2 = this.get(t);
    i2 && e ? i2.delete(e) || console.warn(`Handler for hook '${t}' not found.`) : i2 && i2.clear();
  }
  async call(t, e, i2, s2) {
    const [n2, o2, r2] = this.parseCallArgs(t, e, i2, s2), { before: a2, handler: l2, after: h } = this.getHandlers(t, r2);
    await this.run(a2, n2, o2);
    const [c2] = await this.run(l2, n2, o2, true);
    return await this.run(h, n2, o2), this.dispatchDomEvent(t, n2, o2), c2;
  }
  callSync(t, e, i2, s2) {
    const [n2, o2, r2] = this.parseCallArgs(t, e, i2, s2), { before: a2, handler: l2, after: h } = this.getHandlers(t, r2);
    this.runSync(a2, n2, o2);
    const [c2] = this.runSync(l2, n2, o2, true);
    return this.runSync(h, n2, o2), this.dispatchDomEvent(t, n2, o2), c2;
  }
  parseCallArgs(t, e, i2, s2) {
    return e instanceof b || typeof e != "object" && typeof i2 != "function" ? [e, i2, s2] : [undefined, e, i2];
  }
  async run(t, e = this.swup.visit, i2, s2 = false) {
    const n2 = [];
    for (const { hook: o2, handler: r2, defaultHandler: a2, once: l2 } of t)
      if (e == null || !e.done) {
        l2 && this.off(o2, r2);
        try {
          const t2 = await f(r2, [e, i2, a2]);
          n2.push(t2);
        } catch (t2) {
          if (s2)
            throw t2;
          console.error(`Error in hook '${o2}':`, t2);
        }
      }
    return n2;
  }
  runSync(t, e = this.swup.visit, i2, s2 = false) {
    const n2 = [];
    for (const { hook: o2, handler: r2, defaultHandler: a2, once: l2 } of t)
      if (e == null || !e.done) {
        l2 && this.off(o2, r2);
        try {
          const t2 = r2(e, i2, a2);
          n2.push(t2), w(t2) && console.warn(`Swup will not await Promises in handler for synchronous hook '${o2}'.`);
        } catch (t2) {
          if (s2)
            throw t2;
          console.error(`Error in hook '${o2}':`, t2);
        }
      }
    return n2;
  }
  getHandlers(t, e) {
    const i2 = this.get(t);
    if (!i2)
      return { found: false, before: [], handler: [], after: [], replaced: false };
    const s2 = Array.from(i2.values()), n2 = this.sortRegistrations, o2 = s2.filter(({ before: t2, replace: e2 }) => t2 && !e2).sort(n2), r2 = s2.filter(({ replace: t2 }) => t2).filter((t2) => true).sort(n2), a2 = s2.filter(({ before: t2, replace: e2 }) => !t2 && !e2).sort(n2), l2 = r2.length > 0;
    let h = [];
    if (e && (h = [{ id: 0, hook: t, handler: e }], l2)) {
      const i3 = r2.length - 1, { handler: s3, once: n3 } = r2[i3], o3 = (t2) => {
        const i4 = r2[t2 - 1];
        return i4 ? (e2, s4) => i4.handler(e2, s4, o3(t2 - 1)) : e;
      };
      h = [{ id: 0, hook: t, once: n3, handler: s3, defaultHandler: o3(i3) }];
    }
    return { found: true, before: o2, handler: h, after: a2, replaced: l2 };
  }
  sortRegistrations(t, e) {
    var i2, s2;
    return ((i2 = t.priority) != null ? i2 : 0) - ((s2 = e.priority) != null ? s2 : 0) || t.id - e.id || 0;
  }
  dispatchDomEvent(t, e, i2) {
    if (e != null && e.done)
      return;
    const s2 = { hook: t, args: i2, visit: e || this.swup.visit };
    document.dispatchEvent(new CustomEvent("swup:any", { detail: s2, bubbles: true })), document.dispatchEvent(new CustomEvent(`swup:${t}`, { detail: s2, bubbles: true }));
  }
  parseName(t) {
    const [e, ...s2] = t.split(".");
    return [e, s2.reduce((t2, e2) => i({}, t2, { [e2]: true }), {})];
  }
}
var C = (t) => {
  if (t && t.charAt(0) === "#" && (t = t.substring(1)), !t)
    return null;
  const e = decodeURIComponent(t);
  let i2 = document.getElementById(t) || document.getElementById(e) || p(`a[name='${CSS.escape(t)}']`) || p(`a[name='${CSS.escape(e)}']`);
  return i2 || t !== "top" || (i2 = document.body), i2;
};
var U = "transition";
var $ = "animation";
async function P({ selector: t, elements: e }) {
  if (t === false && !e)
    return;
  let i2 = [];
  if (e)
    i2 = Array.from(e);
  else if (t && (i2 = m(t, document.body), !i2.length))
    return void console.warn(`[swup] No elements found matching animationSelector \`${t}\``);
  const s2 = i2.map((t2) => function(t3) {
    const { type: e2, timeout: i3, propCount: s3 } = function(t4) {
      const e3 = window.getComputedStyle(t4), i4 = x(e3, `${U}Delay`), s4 = x(e3, `${U}Duration`), n2 = A(i4, s4), o2 = x(e3, `${$}Delay`), r2 = x(e3, `${$}Duration`), a2 = A(o2, r2), l2 = Math.max(n2, a2), h = l2 > 0 ? n2 > a2 ? U : $ : null;
      return { type: h, timeout: l2, propCount: h ? h === U ? s4.length : r2.length : 0 };
    }(t3);
    return !(!e2 || !i3) && new Promise((n2) => {
      const o2 = `${e2}end`, r2 = performance.now();
      let a2 = 0;
      const l2 = () => {
        t3.removeEventListener(o2, h), n2();
      }, h = (e3) => {
        e3.target === t3 && ((performance.now() - r2) / 1000 < e3.elapsedTime || ++a2 >= s3 && l2());
      };
      setTimeout(() => {
        a2 < s3 && l2();
      }, i3 + 1), t3.addEventListener(o2, h);
    });
  }(t2)).filter((t2) => t2 !== false);
  s2.length ? await Promise.all(s2) : t && console.warn(`[swup] No CSS animation duration defined on elements matching \`${t}\``);
}
function x(t, e) {
  return (t[e] || "").split(", ");
}
function A(t, e) {
  for (;t.length < e.length; )
    t = t.concat(t);
  return Math.max(...e.map((e2, i2) => H(e2) + H(t[i2])));
}
function H(t) {
  return 1000 * parseFloat(t);
}
function I(t, e = {}, s2 = {}) {
  if (typeof t != "string")
    throw new Error("swup.navigate() requires a URL parameter");
  if (this.shouldIgnoreVisit(t, { el: s2.el, event: s2.event }))
    return void window.location.assign(t);
  const { url: n2, hash: o2 } = l.fromUrl(t), r2 = this.createVisit(i({}, s2, { to: n2, hash: o2 }));
  this.performNavigation(r2, e);
}
async function V(t, e = {}) {
  if (this.navigating) {
    if (this.visit.state >= 6)
      return t.state = 2, void (this.onVisitEnd = () => this.performNavigation(t, e));
    await this.hooks.call("visit:abort", this.visit, undefined), delete this.visit.to.document, this.visit.state = 8;
  }
  this.navigating = true, this.visit = t;
  const { el: i2 } = t.trigger;
  e.referrer = e.referrer || this.location.url, e.animate === false && (t.animation.animate = false), t.animation.animate || this.classes.clear();
  const n2 = e.history || y(i2, "data-swup-history");
  typeof n2 == "string" && ["push", "replace"].includes(n2) && (t.history.action = n2);
  const a2 = e.animation || y(i2, "data-swup-animation");
  var h, c2;
  typeof a2 == "string" && (t.animation.name = a2), t.meta = e.meta || {}, typeof e.cache == "object" ? (t.cache.read = (h = e.cache.read) != null ? h : t.cache.read, t.cache.write = (c2 = e.cache.write) != null ? c2 : t.cache.write) : e.cache !== undefined && (t.cache = { read: !!e.cache, write: !!e.cache }), delete e.cache;
  try {
    await this.hooks.call("visit:start", t, undefined), t.state = 3;
    const i3 = this.hooks.call("page:load", t, { options: e }, async (t2, e2) => {
      let i4;
      return t2.cache.read && (i4 = this.cache.get(t2.to.url)), e2.page = i4 || await this.fetchPage(t2.to.url, e2.options), e2.cache = !!i4, e2.page;
    });
    i3.then(({ html: e2 }) => {
      t.advance(5), t.to.html = e2, t.to.document = new DOMParser().parseFromString(e2, "text/html");
    });
    const n3 = t.to.url + t.to.hash;
    if (t.history.popstate || (t.history.action === "replace" || t.to.url === this.location.url ? r(n3) : (this.currentHistoryIndex++, o(n3, { index: this.currentHistoryIndex }))), this.location = l.fromUrl(n3), t.history.popstate && this.classes.add("is-popstate"), t.animation.name && this.classes.add(`to-${s(t.animation.name)}`), t.animation.wait && await i3, t.ignored)
      throw new Error(`Visit to ${t.to.url} manually ignored`);
    if (t.done)
      return;
    if (await this.hooks.call("visit:transition", t, undefined, async () => {
      if (!t.animation.animate)
        return await this.hooks.call("animation:skip", undefined), void await this.renderPage(t, await i3);
      t.advance(4), await this.animatePageOut(t), t.animation.native && document.startViewTransition ? await document.startViewTransition(async () => await this.renderPage(t, await i3)).finished : await this.renderPage(t, await i3), await this.animatePageIn(t);
    }), t.done)
      return;
    await this.hooks.call("visit:end", t, undefined, () => this.classes.clear()), t.state = 7, this.navigating = false, this.onVisitEnd && (this.onVisitEnd(), this.onVisitEnd = undefined);
  } catch (e2) {
    if (!e2 || e2 != null && e2.aborted)
      return void t.advance(8);
    t.advance(9), console.error(e2), this.options.skipPopStateHandling = () => (window.location.assign(t.to.url + t.to.hash), true), window.history.back();
  } finally {
    delete t.to.document;
  }
}
var L = async function(t) {
  await this.hooks.call("animation:out:start", t, undefined, () => {
    this.classes.add("is-changing", "is-animating", "is-leaving");
  }), await this.hooks.call("animation:out:await", t, { skip: false }, (t2, { skip: e }) => {
    if (!e)
      return this.awaitAnimations({ selector: t2.animation.selector });
  }), await this.hooks.call("animation:out:end", t, undefined);
};
var q = function(t) {
  var e;
  const i2 = t.to.document;
  if (!i2)
    return false;
  const s2 = ((e = i2.querySelector("title")) == null ? undefined : e.innerText) || "";
  document.title = s2;
  const n2 = m('[data-swup-persist]:not([data-swup-persist=""])'), o2 = t.containers.map((t2) => {
    const e2 = document.querySelector(t2), s3 = i2.querySelector(t2);
    return e2 && s3 ? (e2.replaceWith(s3.cloneNode(true)), true) : (e2 || console.warn(`[swup] Container missing in current document: ${t2}`), s3 || console.warn(`[swup] Container missing in incoming document: ${t2}`), false);
  }).filter(Boolean);
  return n2.forEach((t2) => {
    const e2 = t2.getAttribute("data-swup-persist"), i3 = p(`[data-swup-persist="${e2}"]`);
    i3 && i3 !== t2 && i3.replaceWith(t2);
  }), o2.length === t.containers.length;
};
var R = function(t) {
  const e = { behavior: "auto" }, { target: s2, reset: n2 } = t.scroll, o2 = s2 != null ? s2 : t.to.hash;
  let r2 = false;
  return o2 && (r2 = this.hooks.callSync("scroll:anchor", t, { hash: o2, options: e }, (t2, { hash: e2, options: i2 }) => {
    const s3 = this.getAnchorElement(e2);
    return s3 && s3.scrollIntoView(i2), !!s3;
  })), n2 && !r2 && (r2 = this.hooks.callSync("scroll:top", t, { options: e }, (t2, { options: e2 }) => (window.scrollTo(i({ top: 0, left: 0 }, e2)), true))), r2;
};
var T = async function(t) {
  if (t.done)
    return;
  const e = this.hooks.call("animation:in:await", t, { skip: false }, (t2, { skip: e2 }) => {
    if (!e2)
      return this.awaitAnimations({ selector: t2.animation.selector });
  });
  await g(), await this.hooks.call("animation:in:start", t, undefined, () => {
    this.classes.remove("is-animating");
  }), await e, await this.hooks.call("animation:in:end", t, undefined);
};
var N = async function(t, e) {
  if (t.done)
    return;
  t.advance(6);
  const { url: i2 } = e;
  this.isSameResolvedUrl(n(), i2) || (r(i2), this.location = l.fromUrl(i2), t.to.url = this.location.url, t.to.hash = this.location.hash), await this.hooks.call("content:replace", t, { page: e }, (t2, {}) => {
    if (this.classes.remove("is-leaving"), t2.animation.animate && this.classes.add("is-rendering"), !this.replaceContent(t2))
      throw new Error("[swup] Container mismatch, aborting");
    t2.animation.animate && (this.classes.add("is-changing", "is-animating", "is-rendering"), t2.animation.name && this.classes.add(`to-${s(t2.animation.name)}`));
  }), await this.hooks.call("content:scroll", t, undefined, () => this.scrollToContent(t)), await this.hooks.call("page:view", t, { url: this.location.url, title: document.title });
};
var O = function(t) {
  var e;
  if (e = t, Boolean(e == null ? undefined : e.isSwupPlugin)) {
    if (t.swup = this, !t._checkRequirements || t._checkRequirements())
      return t._beforeMount && t._beforeMount(), t.mount(), this.plugins.push(t), this.plugins;
  } else
    console.error("Not a swup plugin instance", t);
};
function D(t) {
  const e = this.findPlugin(t);
  if (e)
    return e.unmount(), e._afterUnmount && e._afterUnmount(), this.plugins = this.plugins.filter((t2) => t2 !== e), this.plugins;
  console.error("No such plugin", e);
}
function M(t) {
  return this.plugins.find((e) => typeof t == "string" ? [`Swup${t}`, t].includes(e.name) : e === t);
}
function W(t) {
  if (typeof this.options.resolveUrl != "function")
    return console.warn("[swup] options.resolveUrl expects a callback function."), t;
  const e = this.options.resolveUrl(t);
  return e && typeof e == "string" ? e.startsWith("//") || e.startsWith("http") ? (console.warn("[swup] options.resolveUrl needs to return a relative url"), t) : e : (console.warn("[swup] options.resolveUrl needs to return a url"), t);
}
function j(t, e) {
  return this.resolveUrl(t) === this.resolveUrl(e);
}
var B = { animateHistoryBrowsing: false, animationSelector: '[class*="transition-"]', animationScope: "html", cache: true, containers: ["#swup"], hooks: {}, ignoreVisit: (t, { el: e } = {}) => !(e == null || !e.closest("[data-no-swup]")), linkSelector: "a[href]", linkToSelf: "scroll", native: false, plugins: [], resolveUrl: (t) => t, requestHeaders: { "X-Requested-With": "swup", Accept: "text/html, application/xhtml+xml" }, skipPopStateHandling: (t) => {
  var e;
  return ((e = t.state) == null ? undefined : e.source) !== "swup";
}, timeout: 0 };

class _ {
  get currentPageUrl() {
    return this.location.url;
  }
  constructor(t = {}) {
    var e, s2;
    this.version = "4.9.2", this.options = undefined, this.defaults = B, this.plugins = [], this.visit = undefined, this.cache = undefined, this.hooks = undefined, this.classes = undefined, this.location = l.fromUrl(window.location.href), this.currentHistoryIndex = undefined, this.clickDelegate = undefined, this.navigating = false, this.onVisitEnd = undefined, this.use = O, this.unuse = D, this.findPlugin = M, this.log = () => {}, this.navigate = I, this.performNavigation = V, this.createVisit = S, this.delegateEvent = a, this.fetchPage = u, this.awaitAnimations = P, this.renderPage = N, this.replaceContent = q, this.animatePageIn = T, this.animatePageOut = L, this.scrollToContent = R, this.getAnchorElement = C, this.getCurrentUrl = n, this.resolveUrl = W, this.isSameResolvedUrl = j, this.options = i({}, this.defaults, t), this.handleLinkClick = this.handleLinkClick.bind(this), this.handlePopState = this.handlePopState.bind(this), this.cache = new d(this), this.classes = new k(this), this.hooks = new E(this), this.visit = this.createVisit({ to: "" }), this.currentHistoryIndex = (e = (s2 = window.history.state) == null ? undefined : s2.index) != null ? e : 1, this.enable();
  }
  async enable() {
    var t;
    const { linkSelector: e } = this.options;
    this.clickDelegate = this.delegateEvent(e, "click", this.handleLinkClick), window.addEventListener("popstate", this.handlePopState), this.options.animateHistoryBrowsing && (window.history.scrollRestoration = "manual"), this.options.native = this.options.native && !!document.startViewTransition, this.options.plugins.forEach((t2) => this.use(t2));
    for (const [t2, e2] of Object.entries(this.options.hooks)) {
      const [i2, s2] = this.hooks.parseName(t2);
      this.hooks.on(i2, e2, s2);
    }
    ((t = window.history.state) == null ? undefined : t.source) !== "swup" && r(null, { index: this.currentHistoryIndex }), await g(), await this.hooks.call("enable", undefined, undefined, () => {
      const t2 = document.documentElement;
      t2.classList.add("swup-enabled"), t2.classList.toggle("swup-native", this.options.native);
    });
  }
  async destroy() {
    this.clickDelegate.destroy(), window.removeEventListener("popstate", this.handlePopState), this.cache.clear(), this.plugins.forEach((t) => this.unuse(t)), await this.hooks.call("disable", undefined, undefined, () => {
      const t = document.documentElement;
      t.classList.remove("swup-enabled"), t.classList.remove("swup-native");
    }), this.hooks.clear();
  }
  shouldIgnoreVisit(t, { el: e, event: i2 } = {}) {
    const { origin: s2, url: n2, hash: o2 } = l.fromUrl(t);
    return s2 !== window.location.origin || !(!e || !this.triggerWillOpenNewWindow(e)) || !!this.options.ignoreVisit(n2 + o2, { el: e, event: i2 });
  }
  handleLinkClick(t) {
    const e = t.delegateTarget, { href: i2, url: s2, hash: n2 } = l.fromElement(e);
    if (this.shouldIgnoreVisit(i2, { el: e, event: t }))
      return;
    if (this.navigating && s2 === this.visit.to.url)
      return void t.preventDefault();
    const o2 = this.createVisit({ to: s2, hash: n2, el: e, event: t });
    t.metaKey || t.ctrlKey || t.shiftKey || t.altKey ? this.hooks.callSync("link:newtab", o2, { href: i2 }) : t.button === 0 && this.hooks.callSync("link:click", o2, { el: e, event: t }, () => {
      var e2;
      const i3 = (e2 = o2.from.url) != null ? e2 : "";
      t.preventDefault(), s2 && s2 !== i3 ? this.isSameResolvedUrl(s2, i3) || this.performNavigation(o2) : n2 ? this.hooks.callSync("link:anchor", o2, { hash: n2 }, () => {
        r(s2 + n2), this.scrollToContent(o2);
      }) : this.hooks.callSync("link:self", o2, undefined, () => {
        this.options.linkToSelf === "navigate" ? this.performNavigation(o2) : (r(s2), this.scrollToContent(o2));
      });
    });
  }
  handlePopState(t) {
    var e, i2, s2, o2;
    const r2 = (e = (i2 = t.state) == null ? undefined : i2.url) != null ? e : window.location.href;
    if (this.options.skipPopStateHandling(t))
      return;
    if (this.isSameResolvedUrl(n(), this.location.url))
      return;
    const { url: a2, hash: h } = l.fromUrl(r2), c2 = this.createVisit({ to: a2, hash: h, event: t });
    c2.history.popstate = true;
    const u2 = (s2 = (o2 = t.state) == null ? undefined : o2.index) != null ? s2 : 0;
    u2 && u2 !== this.currentHistoryIndex && (c2.history.direction = u2 - this.currentHistoryIndex > 0 ? "forwards" : "backwards", this.currentHistoryIndex = u2), c2.animation.animate = false, c2.scroll.reset = false, c2.scroll.target = false, this.options.animateHistoryBrowsing && (c2.animation.animate = true, c2.scroll.reset = true), this.hooks.callSync("history:popstate", c2, { event: t }, () => {
      this.performNavigation(c2);
    });
  }
  triggerWillOpenNewWindow(t) {
    return !!t.matches('[download], [target="_blank"]');
  }
}

// node_modules/@swup/plugin/dist/index.modern.js
function r2() {
  return r2 = Object.assign ? Object.assign.bind() : function(r3) {
    for (var n2 = 1;n2 < arguments.length; n2++) {
      var e = arguments[n2];
      for (var t in e)
        Object.prototype.hasOwnProperty.call(e, t) && (r3[t] = e[t]);
    }
    return r3;
  }, r2.apply(this, arguments);
}
var n2 = (r3) => String(r3).split(".").map((r4) => String(parseInt(r4 || "0", 10))).concat(["0", "0"]).slice(0, 3).join(".");

class e {
  constructor() {
    this.isSwupPlugin = true, this.swup = undefined, this.version = undefined, this.requires = {}, this.handlersToUnregister = [];
  }
  mount() {}
  unmount() {
    this.handlersToUnregister.forEach((r3) => r3()), this.handlersToUnregister = [];
  }
  _beforeMount() {
    if (!this.name)
      throw new Error("You must define a name of plugin when creating a class.");
  }
  _afterUnmount() {}
  _checkRequirements() {
    return typeof this.requires != "object" || Object.entries(this.requires).forEach(([r3, e2]) => {
      if (!function(r4, e3, t) {
        const s2 = function(r5, n3) {
          var e4;
          if (r5 === "swup")
            return (e4 = n3.version) != null ? e4 : "";
          {
            var t2;
            const e5 = n3.findPlugin(r5);
            return (t2 = e5 == null ? undefined : e5.version) != null ? t2 : "";
          }
        }(r4, t);
        return !!s2 && ((r5, e4) => e4.every((e5) => {
          const [, t2, s3] = e5.match(/^([\D]+)?(.*)$/) || [];
          var o2, i2;
          return ((r6, n3) => {
            const e6 = { "": (r7) => r7 === 0, ">": (r7) => r7 > 0, ">=": (r7) => r7 >= 0, "<": (r7) => r7 < 0, "<=": (r7) => r7 <= 0 };
            return (e6[n3] || e6[""])(r6);
          })((i2 = s3, o2 = n2(o2 = r5), i2 = n2(i2), o2.localeCompare(i2, undefined, { numeric: true })), t2 || ">=");
        }))(s2, e3);
      }(r3, e2 = Array.isArray(e2) ? e2 : [e2], this.swup)) {
        const n3 = `${r3} ${e2.join(", ")}`;
        throw new Error(`Plugin version mismatch: ${this.name} requires ${n3}`);
      }
    }), true;
  }
  on(r3, n3, e2 = {}) {
    var t;
    n3 = !(t = n3).name.startsWith("bound ") || t.hasOwnProperty("prototype") ? n3.bind(this) : n3;
    const s2 = this.swup.hooks.on(r3, n3, e2);
    return this.handlersToUnregister.push(s2), s2;
  }
  once(n3, e2, t = {}) {
    return this.on(n3, e2, r2({}, t, { once: true }));
  }
  before(n3, e2, t = {}) {
    return this.on(n3, e2, r2({}, t, { before: true }));
  }
  replace(n3, e2, t = {}) {
    return this.on(n3, e2, r2({}, t, { replace: true }));
  }
  off(r3, n3) {
    return this.swup.hooks.off(r3, n3);
  }
}

// node_modules/compute-scroll-into-view/dist/index.js
var t = (t2) => typeof t2 == "object" && t2 != null && t2.nodeType === 1;
var e2 = (t2, e3) => (!e3 || t2 !== "hidden") && (t2 !== "visible" && t2 !== "clip");
var n3 = (t2, n4) => {
  if (t2.clientHeight < t2.scrollHeight || t2.clientWidth < t2.scrollWidth) {
    const o2 = getComputedStyle(t2, null);
    return e2(o2.overflowY, n4) || e2(o2.overflowX, n4) || ((t3) => {
      const e3 = ((t4) => {
        if (!t4.ownerDocument || !t4.ownerDocument.defaultView)
          return null;
        try {
          return t4.ownerDocument.defaultView.frameElement;
        } catch (t5) {
          return null;
        }
      })(t3);
      return !!e3 && (e3.clientHeight < t3.scrollHeight || e3.clientWidth < t3.scrollWidth);
    })(t2);
  }
  return false;
};
var o2 = (t2, e3, n4, o3, l2, r3, i2, s2) => r3 < t2 && i2 > e3 || r3 > t2 && i2 < e3 ? 0 : r3 <= t2 && s2 <= n4 || i2 >= e3 && s2 >= n4 ? r3 - t2 - o3 : i2 > e3 && s2 < n4 || r3 < t2 && s2 > n4 ? i2 - e3 + l2 : 0;
var l2 = (t2) => {
  const e3 = t2.parentElement;
  return e3 == null ? t2.getRootNode().host || null : e3;
};
var r3 = (e3, r4) => {
  var i2, s2, d2, h;
  if (typeof document == "undefined")
    return [];
  const { scrollMode: c2, block: f2, inline: u2, boundary: a2, skipOverflowHiddenElements: g2 } = r4, p2 = typeof a2 == "function" ? a2 : (t2) => t2 !== a2;
  if (!t(e3))
    throw new TypeError("Invalid target");
  const m2 = document.scrollingElement || document.documentElement, w2 = [];
  let W2 = e3;
  for (;t(W2) && p2(W2); ) {
    if (W2 = l2(W2), W2 === m2) {
      w2.push(W2);
      break;
    }
    W2 != null && W2 === document.body && n3(W2) && !n3(document.documentElement) || W2 != null && n3(W2, g2) && w2.push(W2);
  }
  const b2 = (s2 = (i2 = window.visualViewport) == null ? undefined : i2.width) != null ? s2 : innerWidth, H2 = (h = (d2 = window.visualViewport) == null ? undefined : d2.height) != null ? h : innerHeight, { scrollX: y2, scrollY: M2 } = window, { height: v, width: E2, top: x2, right: C2, bottom: I2, left: R2 } = e3.getBoundingClientRect(), { top: T2, right: B2, bottom: F, left: V2 } = ((t2) => {
    const e4 = window.getComputedStyle(t2);
    return { top: parseFloat(e4.scrollMarginTop) || 0, right: parseFloat(e4.scrollMarginRight) || 0, bottom: parseFloat(e4.scrollMarginBottom) || 0, left: parseFloat(e4.scrollMarginLeft) || 0 };
  })(e3);
  let k2 = f2 === "start" || f2 === "nearest" ? x2 - T2 : f2 === "end" ? I2 + F : x2 + v / 2 - T2 + F, D2 = u2 === "center" ? R2 + E2 / 2 - V2 + B2 : u2 === "end" ? C2 + B2 : R2 - V2;
  const L2 = [];
  for (let t2 = 0;t2 < w2.length; t2++) {
    const e4 = w2[t2], { height: l3, width: r5, top: i3, right: s3, bottom: d3, left: h2 } = e4.getBoundingClientRect();
    if (c2 === "if-needed" && x2 >= 0 && R2 >= 0 && I2 <= H2 && C2 <= b2 && (e4 === m2 && !n3(e4) || x2 >= i3 && I2 <= d3 && R2 >= h2 && C2 <= s3))
      return L2;
    const a3 = getComputedStyle(e4), g3 = parseInt(a3.borderLeftWidth, 10), p3 = parseInt(a3.borderTopWidth, 10), W3 = parseInt(a3.borderRightWidth, 10), T3 = parseInt(a3.borderBottomWidth, 10);
    let B3 = 0, F2 = 0;
    const V3 = "offsetWidth" in e4 ? e4.offsetWidth - e4.clientWidth - g3 - W3 : 0, S2 = "offsetHeight" in e4 ? e4.offsetHeight - e4.clientHeight - p3 - T3 : 0, X = "offsetWidth" in e4 ? e4.offsetWidth === 0 ? 0 : r5 / e4.offsetWidth : 0, Y = "offsetHeight" in e4 ? e4.offsetHeight === 0 ? 0 : l3 / e4.offsetHeight : 0;
    if (m2 === e4)
      B3 = f2 === "start" ? k2 : f2 === "end" ? k2 - H2 : f2 === "nearest" ? o2(M2, M2 + H2, H2, p3, T3, M2 + k2, M2 + k2 + v, v) : k2 - H2 / 2, F2 = u2 === "start" ? D2 : u2 === "center" ? D2 - b2 / 2 : u2 === "end" ? D2 - b2 : o2(y2, y2 + b2, b2, g3, W3, y2 + D2, y2 + D2 + E2, E2), B3 = Math.max(0, B3 + M2), F2 = Math.max(0, F2 + y2);
    else {
      B3 = f2 === "start" ? k2 - i3 - p3 : f2 === "end" ? k2 - d3 + T3 + S2 : f2 === "nearest" ? o2(i3, d3, l3, p3, T3 + S2, k2, k2 + v, v) : k2 - (i3 + l3 / 2) + S2 / 2, F2 = u2 === "start" ? D2 - h2 - g3 : u2 === "center" ? D2 - (h2 + r5 / 2) + V3 / 2 : u2 === "end" ? D2 - s3 + W3 + V3 : o2(h2, s3, r5, g3, W3 + V3, D2, D2 + E2, E2);
      const { scrollLeft: t3, scrollTop: n4 } = e4;
      B3 = Y === 0 ? 0 : Math.max(0, Math.min(n4 + B3 / Y, e4.scrollHeight - l3 / Y + S2)), F2 = X === 0 ? 0 : Math.max(0, Math.min(t3 + F2 / X, e4.scrollWidth - r5 / X + V3)), k2 += n4 - B3, D2 += t3 - F2;
    }
    L2.push({ el: e4, top: B3, left: F2 });
  }
  return L2;
};

// node_modules/@swup/scroll-plugin/dist/index.modern.js
function e3() {
  return e3 = Object.assign ? Object.assign.bind() : function(t2) {
    for (var o3 = 1;o3 < arguments.length; o3++) {
      var e4 = arguments[o3];
      for (var s2 in e4)
        ({}).hasOwnProperty.call(e4, s2) && (t2[s2] = e4[s2]);
    }
    return t2;
  }, e3.apply(null, arguments);
}
var s2 = (t2, o3 = document) => Array.from(o3.querySelectorAll(t2));

class l3 extends e {
  constructor(t2 = {}) {
    super(), this.name = "SwupScrollPlugin", this.requires = { swup: ">=4.2.0" }, this.defaults = { doScrollingRightAway: false, animateScroll: { betweenPages: true, samePageWithHash: true, samePage: true }, getAnchorElement: undefined, offset: 0, scrollContainers: "[data-swup-scroll-container]", shouldResetScrollPosition: () => true, markScrollTarget: false, scrollFunction: undefined }, this.options = undefined, this.cachedScrollPositions = {}, this.previousScrollRestoration = undefined, this.currentCacheKey = undefined, this.getAnchorElement = (t3 = "") => typeof this.options.getAnchorElement == "function" ? this.options.getAnchorElement(t3) : this.swup.getAnchorElement(t3), this.getOffset = (t3, o3, e4) => {
      let s3;
      return s3 = typeof this.options.offset == "function" ? this.options.offset(t3, o3, e4) : this.options.offset, typeof s3 == "object" && typeof s3.top == "number" && typeof s3.left == "number" ? s3 : { top: parseInt(String(s3 != null ? s3 : ""), 10) || 0, left: 0 };
    }, this.onBeforeLinkToSelf = (t3) => {
      t3.scroll.animate = this.shouldAnimate("samePage");
    }, this.handleScrollToTop = (t3) => (this.scrollTo({ top: 0, left: 0 }, t3.scroll.animate), true), this.onBeforeLinkToAnchor = (t3) => {
      t3.scroll.animate = this.shouldAnimate("samePageWithHash");
    }, this.handleScrollToAnchor = (t3, { hash: o3 }) => this.maybeScrollToAnchor(o3, t3.scroll.animate), this.onBeforeVisitStart = (t3) => {
      t3.scroll.scrolledToContent = false, t3.scroll.animate = this.shouldAnimate("betweenPages");
    }, this.onVisitStart = (t3) => {
      var o3;
      this.cacheScrollPositions(t3.from.url), this.maybeResetScrollPositions(t3);
      const e4 = (o3 = t3.scroll.target) != null ? o3 : t3.to.hash;
      t3.scroll.animate && this.options.doScrollingRightAway && !e4 && this.doScrollingBetweenPages(t3);
    }, this.handleScrollToContent = (t3) => {
      t3.scroll.scrolledToContent || this.doScrollingBetweenPages(t3), this.restoreScrollContainers(t3.to.url);
    }, this.doScrollingBetweenPages = (t3) => {
      var o3;
      if (t3.history.popstate && !t3.animation.animate)
        return;
      const e4 = (o3 = t3.scroll.target) != null ? o3 : t3.to.hash;
      if (e4 && this.maybeScrollToAnchor(e4, t3.scroll.animate))
        return;
      if (!t3.scroll.reset)
        return;
      const s3 = this.getCachedScrollPositions(t3.to.url), { top: l4 = 0, left: r4 = 0 } = (s3 == null ? undefined : s3.window) || { top: 0, left: 0 };
      requestAnimationFrame(() => this.scrollTo({ top: l4, left: r4 }, t3.scroll.animate)), t3.scroll.scrolledToContent = true;
    }, this.maybeResetScrollPositions = (t3) => {
      const { popstate: o3 } = t3.history, { url: e4 } = t3.to, { el: s3 } = t3.trigger;
      o3 || s3 && !this.options.shouldResetScrollPosition(s3) || this.resetScrollPositions(e4);
    }, this.options = e3({}, this.defaults, t2);
  }
  mount() {
    const t2 = this.swup;
    t2.hooks.create("scroll:start"), t2.hooks.create("scroll:end"), t2.scrollTo = this.scrollTo.bind(this), this.previousScrollRestoration = window.history.scrollRestoration, t2.options.animateHistoryBrowsing && (window.history.scrollRestoration = "manual"), this.updateScrollTarget = this.updateScrollTarget.bind(this), this.options.markScrollTarget && (window.addEventListener("popstate", this.updateScrollTarget), window.addEventListener("hashchange", this.updateScrollTarget), this.on("page:view", this.updateScrollTarget), this.on("link:anchor", this.updateScrollTarget), this.on("link:self", this.updateScrollTarget), this.updateScrollTarget()), this.before("visit:start", this.onBeforeVisitStart, { priority: -1 }), this.on("visit:start", this.onVisitStart, { priority: 1 }), this.replace("content:scroll", this.handleScrollToContent), this.before("link:self", this.onBeforeLinkToSelf, { priority: -1 }), this.replace("scroll:top", this.handleScrollToTop), this.before("link:anchor", this.onBeforeLinkToAnchor, { priority: -1 }), this.replace("scroll:anchor", this.handleScrollToAnchor);
  }
  unmount() {
    super.unmount(), this.previousScrollRestoration && (window.history.scrollRestoration = this.previousScrollRestoration), window.removeEventListener("popstate", this.updateScrollTarget), window.removeEventListener("hashchange", this.updateScrollTarget), this.cachedScrollPositions = {}, delete this.swup.scrollTo;
  }
  shouldAnimate(t2) {
    return typeof this.options.animateScroll == "boolean" ? this.options.animateScroll : this.options.animateScroll[t2];
  }
  maybeScrollToAnchor(t2, o3 = false) {
    if (!t2)
      return false;
    const e4 = this.getAnchorElement(t2);
    return e4 ? e4 instanceof Element ? (this.scrollElementIntoView(e4, o3), true) : (console.warn(`Anchor target ${t2} is not a DOM node`), false) : (console.warn(`Anchor target ${t2} not found`), false);
  }
  cacheScrollPositions(t2) {
    const o3 = this.swup.resolveUrl(t2), e4 = s2(this.options.scrollContainers).map((t3) => ({ top: t3.scrollTop, left: t3.scrollLeft })), l4 = { window: { top: window.scrollY, left: window.scrollX }, containers: e4 };
    this.cachedScrollPositions[o3] = l4;
  }
  resetScrollPositions(t2) {
    const o3 = this.swup.resolveUrl(t2);
    delete this.cachedScrollPositions[o3];
  }
  getCachedScrollPositions(t2) {
    const o3 = this.swup.resolveUrl(t2);
    return this.cachedScrollPositions[o3];
  }
  restoreScrollContainers(t2) {
    const o3 = this.getCachedScrollPositions(t2);
    o3 && o3.containers.length !== 0 && s2(this.options.scrollContainers).forEach((t3, e4) => {
      const s3 = o3.containers[e4];
      s3 != null && (t3.scrollTop = s3.top, t3.scrollLeft = s3.left);
    });
  }
  updateScrollTarget() {
    var t2;
    const { hash: o3 } = window.location, e4 = document.querySelector("[data-swup-scroll-target]");
    let s3 = this.getAnchorElement(o3);
    s3 instanceof HTMLBodyElement && (s3 = null), e4 !== s3 && (e4 == null || e4.removeAttribute("data-swup-scroll-target"), (t2 = s3) == null || t2.setAttribute("data-swup-scroll-target", ""));
  }
  getRootScrollContainer() {
    return document.scrollingElement instanceof HTMLElement ? document.scrollingElement : document.documentElement;
  }
  scrollTo(t2, o3 = true, e4) {
    var s3;
    const l4 = this.swup.createVisit({ to: this.swup.location.url }), { top: r4 = 0, left: n4 = 0 } = typeof t2 == "number" ? { top: t2 } : t2;
    e4 != null || (e4 = this.getRootScrollContainer()), ((s3 = this.options.scrollFunction) != null ? s3 : this.applyScroll)(e4, r4, n4, o3, () => this.swup.hooks.callSync("scroll:start", l4, undefined), () => this.swup.hooks.callSync("scroll:end", l4, undefined));
  }
  applyScroll(t2, o3, e4, s3, l4, r4) {
    const n4 = t2 instanceof HTMLHtmlElement || t2 instanceof HTMLBodyElement ? window : t2;
    l4(), n4.addEventListener("scrollend", r4, { once: true }), n4.addEventListener("wheel", () => {
      t2.scrollTo({ top: t2.scrollTop, left: t2.scrollLeft, behavior: "instant" });
    }, { once: true }), t2.scrollTo({ top: o3, left: e4, behavior: s3 ? "smooth" : "instant" });
  }
  scrollElementIntoView(t2, e4 = false) {
    r3(t2, { scrollMode: "always", block: "start", inline: "start" }).forEach(({ top: o3, left: s3, el: l4 }) => {
      const { top: r4 = 0, left: n4 = 0 } = this.getOffset(t2, l4, { top: o3, left: s3 });
      this.scrollTo({ top: o3 - r4, left: s3 - n4 }, e4, l4);
    });
  }
}
export {
  l3 as SwupScrollPlugin,
  _ as Swup
};
