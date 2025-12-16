// Versionér cache-navnet ved hver release
const CACHE_NAME = "bordmester-v6";

// Juster stierne så de passer til din hosting (root- eller subpath)
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./script.js?v=6",
  "./manifest.json",
  "./icon.png"
];

// Precache ved install og overtag med det samme
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Ryd gamle caches og claim straks
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  event.waitUntil(self.clients.claim());
});

// Hjælpemetode: er det en navigation (HTML)?
function isNavigateRequest(request) {
  return request.mode === "navigate";
}

// Fetch-strategi:
// - HTML: network-first med cache fallback (så opdateringer slår igennem)
// - Andre assets: cache-first med netværks-fallback og runtime-caching
self.addEventListener("fetch", event => {
  const { request } = event;

  if (isNavigateRequest(request)) {
    event.respondWith(
      fetch(request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        return response;
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        // Cache kun successful responses
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        return response;
      }).catch(() => cached || Promise.reject("offline and not cached"))
    })
  );
});
