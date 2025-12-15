self.addEventListener("install", e => {
  e.waitUntil(caches.open("bordmester-v1").then(c => c.addAll([
    "index.html", "script.js", "manifest.json", "icon.png", "icon-192.png", "icon-512.png"
  ])));
});
self.addEventListener("fetch", e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
