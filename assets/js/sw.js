/**
 * Hugo 网站 Service Worker
 * ========================
 * 功能：
 *  - 静态资源离线缓存（HTML、CSS、JS、图片、字体）
 *  - 带 Hash 的 CSS/JS 文件自动更新（Hugo Pipes 生成的指纹文件）
 *  - 网络优先策略用于 HTML 页面，缓存优先策略用于静态资源
 *  - 后台静默更新缓存，下次访问生效
 */

// ─────────────────────────────────────────────
// 配置区：按需修改
// ─────────────────────────────────────────────

/**
 * 缓存版本号。
 * 每次手动部署重大更新时，修改此值可强制清除旧缓存。
 * 注意：Hugo 带 Hash 的资源文件本身已经自带版本信息，
 *       因此日常更新无需手动修改此处。
 */
const CACHE_VERSION = 'v0114';

/**
 * 缓存桶名称
 * - STATIC_CACHE：长期缓存带 Hash 的 CSS/JS/字体/图片（内容不变）
 * - PAGE_CACHE：  缓存 HTML 页面（网络优先，支持离线回退）
 */
const STATIC_CACHE = `somnia-static-${CACHE_VERSION}`;
const PAGE_CACHE   = `somnia-pages-${CACHE_VERSION}`;

/**
 * 安装阶段预缓存的资源列表。
 * 填写站点根路径下需要离线可用的核心页面/资源。
 * 带 Hash 的 CSS/JS 无需写在这里，运行时会自动缓存。
 */
const PRE_CACHE_URLS = [
  '/',          // 首页
  '/offline/',  // 离线降级页（需自行创建 content/offline.md）
  '/images/default_avatar.webp', // 默认头像
  '/images/default.webp', // 默认图片
  '/icons/main.svg' // 默认图标
];

/**
 * 匹配"带 Hash 的静态资源"的正则表达式。
 * Hugo Pipes 生成的指纹文件形如：
 *   /css/main.abc12345.css
 *   /js/app.def67890.min.js
 * 只要文件名中包含一段 8 位以上十六进制字符，即视为带 Hash 的文件。
 */
const HASHED_ASSET_RE = /\/[^/?#]+\.[0-9a-f]{8,}\.(css|js|woff2?|ttf|otf|eot)(\?.*)?$/i;

/**
 * 匹配需要"缓存优先"的静态资源扩展名（图片、字体、媒体等）。
 * 这类文件内容稳定，优先从缓存读取，减少网络请求。
 */
const STATIC_EXT_RE = /\.(png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf|otf|eot|mp4|webm)(\?.*)?$/i;

// ─────────────────────────────────────────────
// 安装事件：预缓存核心资源
// ─────────────────────────────────────────────

self.addEventListener('install', (event) => {
  console.log('[Somnia] [SW] 安装中，预缓存核心资源...');

  event.waitUntil(
    caches.open(PAGE_CACHE).then(async (cache) => {
      // 逐个请求，避免单个资源失败导致整体安装失败
      for (const url of PRE_CACHE_URLS) {
        try {
          await cache.add(url);
          console.log(`[Somnia] [SW] 预缓存成功：${url}`);
        } catch (err) {
          // 离线页等资源不存在时不阻断安装
          console.warn(`[Somnia] [SW] 预缓存跳过（资源不存在）：${url}`, err.message);
        }
      }
    }).then(() => {
      /**
       * skipWaiting()：新 SW 安装完毕后立即激活，
       * 不等待旧页面关闭。适合静态博客场景。
       */
      return self.skipWaiting();
    })
  );
});

// ─────────────────────────────────────────────
// 激活事件：清理过期缓存桶
// ─────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  console.log('[Somnia] [SW] 激活，清理旧缓存...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            // 删除不属于当前版本的缓存桶
            return (
              name.startsWith('somnia-') &&
              name !== STATIC_CACHE &&
              name !== PAGE_CACHE
            );
          })
          .map((name) => {
            console.log(`[Somnia] [SW] 删除过期缓存：${name}`);
            return caches.delete(name);
          })
      );
    }).then(() => {
      /**
       * clients.claim()：激活后立即接管所有已打开的页面，
       * 无需用户刷新即可使用新 SW。
       */
      return self.clients.claim();
    })
  );
});

// ─────────────────────────────────────────────
// 请求拦截：核心路由策略
// ─────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 只处理同源请求，跨域（CDN、API 等）直接放行
  if (url.origin !== self.location.origin) return;

  // 非 GET 请求直接放行（POST、PUT 等不缓存）
  if (request.method !== 'GET') return;

  // ── 策略 1：带 Hash 的 CSS/JS/字体 → 缓存优先（Cache First）──
  if (HASHED_ASSET_RE.test(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // ── 策略 2：图片、字体、媒体 → 缓存优先（Cache First）──
  if (STATIC_EXT_RE.test(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // ── 策略 3：HTML 页面 → 网络优先（Network First），离线时回退缓存 ──
  if (request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }

  // ── 策略 4：其他请求（JSON、XML 等）→ 网络优先 ──
  event.respondWith(networkFirst(request, PAGE_CACHE));
});

// ─────────────────────────────────────────────
// 策略实现
// ─────────────────────────────────────────────

/**
 * 缓存优先策略（Cache First）
 * 适用于带 Hash 的不可变资源：命中缓存直接返回；
 * 未命中则请求网络并存入缓存，供下次使用。
 *
 * @param {Request} request
 * @param {string}  cacheName  目标缓存桶名称
 */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) {
    return cached; // 缓存命中，直接返回
  }

  // 缓存未命中，请求网络
  try {
    const response = await fetch(request);
    if (response.ok) {
      // 将新资源存入缓存（注意要 clone，因为 Response 只能消费一次）
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    console.warn(`[Somnia] [SW] 缓存优先策略网络请求失败：${request.url}`, err.message);
    // 静态资源无法回退，抛出错误让浏览器处理
    throw err;
  }
}

/**
 * 网络优先策略（Network First）
 * 适用于会更新的资源：优先请求网络并更新缓存；
 * 网络失败时回退到缓存副本。
 *
 * @param {Request} request
 * @param {string}  cacheName  目标缓存桶名称
 */
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone()); // 后台更新缓存
    }
    return response;
  } catch {
    // 网络失败，尝试从缓存读取
    const cached = await caches.match(request);
    if (cached) return cached;
    throw new Error(`[Somnia] [SW] 网络和缓存均不可用：${request.url}`);
  }
}

/**
 * 网络优先 + 离线降级策略（Network First with Offline Fallback）
 * 专门用于 HTML 页面：
 *  1. 优先网络（并后台更新缓存）
 *  2. 网络失败 → 尝试返回该页面的缓存版本
 *  3. 无缓存  → 返回 /offline/ 离线提示页
 *
 * @param {Request} request
 */
async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      // 后台将最新 HTML 存入页面缓存
      const cache = await caches.open(PAGE_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // 网络失败，尝试当前页面的缓存版本
    const cached = await caches.match(request);
    if (cached) {
      console.log(`[Somnia] [SW] 离线：返回缓存页面 ${request.url}`);
      return cached;
    }

    // 没有缓存，返回通用离线页
    const offline = await caches.match('/offline/');
    if (offline) {
      console.log('[Somnia] [SW] 离线：返回离线提示页');
      return offline;
    }

    // 兜底：返回简单的 HTML 提示
    return new Response(
      `<!doctype html>
<html lang="zh">
<head><meta charset="utf-8"><title>离线</title></head>
<body style="font-family:sans-serif;text-align:center;padding:4rem">
  <h1>📶 当前处于离线状态</h1>
  <p>请检查网络连接后刷新页面。</p>
</body>
</html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}

// ─────────────────────────────────────────────
// 消息通信：支持外部触发缓存清理
// ─────────────────────────────────────────────

/**
 * 监听来自页面的 postMessage 消息。
 * 用法（在页面 JS 中）：
 *   navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' });
 *   navigator.serviceWorker.controller?.postMessage({ type: 'CLEAR_CACHE' });
 */
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    // 立即激活等待中的新 SW 版本
    console.log('[Somnia] [SW] 收到 SKIP_WAITING 指令，立即激活新版本');
    self.skipWaiting();
  }

  if (event.data?.type === 'CLEAR_CACHE') {
    // 手动清除所有 somnia- 缓存桶（调试或强制刷新时使用）
    console.log('[Somnia] [SW] 收到 CLEAR_CACHE 指令，清除所有缓存');
    event.waitUntil(
      caches.keys().then((keys) =>
        Promise.all(
          keys.filter((k) => k.startsWith('somnia-')).map((k) => caches.delete(k))
        )
      )
    );
  }
});