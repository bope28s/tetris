// 서비스 워커 - PWA 지원
const CACHE_NAME = 'tetris-game-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/js/main.js',
    '/js/game.js',
    '/js/blocks.js',
    '/js/network.js',
    '/js/audio.js'
];

// 서비스 워커 설치
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('캐시 열기 완료');
                return cache.addAll(urlsToCache);
            })
    );
});

// 서비스 워커 활성화
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('이전 캐시 삭제:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 캐시에서 찾으면 반환
                if (response) {
                    return response;
                }
                
                // 캐시에 없으면 네트워크에서 가져오기
                return fetch(event.request);
            })
    );
});
