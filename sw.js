// Service Worker 版本
const CACHE_VERSION = 'v1';
const CACHE_NAME = `nfc-music-player-${CACHE_VERSION}`;

// 需要快取的資源
const CACHE_ASSETS = [
    '/',
    '/index.html',
    '/test.html',
    '/sw.js'
];

// 安裝 Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(CACHE_ASSETS);
            })
    );
});

// 啟用 Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 攔截請求
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 如果有快取，返回快取
                if (response) {
                    return response;
                }
                // 否則從網路獲取
                return fetch(event.request)
                    .then(response => {
                        // 檢查是否為有效的回應
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // 複製回應
                        const responseToCache = response.clone();

                        // 快取新的回應
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    });
            })
    );
});

// 處理背景同步
self.addEventListener('sync', event => {
    if (event.tag === 'audio-sync') {
        event.waitUntil(
            // 在這裡處理背景同步邏輯
            Promise.resolve()
        );
    }
}); 