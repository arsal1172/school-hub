const CACHE_NAME = 'school-hub-v1';
const APP_SHELL = [
  './',
  './index.html',
  './school-command-centre.html',
  './pakistan-holidays-hub.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

const NETWORK_ONLY = [
  'rss2json.com',
  'corsproxy.io',
  'allorigins.win',
  'codetabs.com',
  'anthropic.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdnjs.cloudflare.com',
  'youtube.com',
  'youtu.be',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = event.request.url;
  if (NETWORK_ONLY.some(domain => url.includes(domain))) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response && response.status === 200 && event.request.method === 'GET') {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
      }
      return response;
    }))
  );
});
