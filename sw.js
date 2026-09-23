// 极简 Service Worker：缓存应用外壳，支持离线打开与"添加到主屏"。
const CACHE = 'quanquan-v15';
// index.html 不缓存：始终从网络获取，保证新版页面能及时下发。
const SHELL = [
  './',
  './manifest.webmanifest',
  './assets/icon.svg',
  './styles.css',
  './js/config.js',
  './js/food.js',
  './js/permissions.js',
  './js/store.js',
  './js/app.js',
  './js/lion.js',
  './js/quicklog.js',
  './js/vaccine.js',
  './js/achievements.js',
  './js/growth-eval.js',
  './js/policy.js',
  './js/policy-content.js',
  './vendor/cloudbase.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'GET_VERSION') {
    if (e.ports && e.ports[0]) e.ports[0].postMessage({ cache: CACHE });
  }
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isHtml = url.pathname.endsWith('/index.html') || url.pathname.endsWith('/');
  // 用 cache:'no-cache' 强制绕过浏览器 HTTP 缓存，防止旧部署被缓存导致新代码不生效。
  const networkReq = new Request(req, { cache: 'no-cache' });
  e.respondWith(
    fetch(networkReq)
      .then((res) => {
        if (!isHtml) {
          // 非 HTML 资源更新缓存，供离线使用。
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
  );
});
