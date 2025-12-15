const CACHE_NAME = "bordmester-cache-v2";
const urlsToCache = [
  "/bordmester/",
  "/bordmester/index.html",
  "/bordmester/script.js",
  "/bordmester/manifest.json",
  "/bordmester/icon-192.png",
  "/bordmester/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
