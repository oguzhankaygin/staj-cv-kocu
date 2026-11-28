"use strict";

// Ağ öncelikli önbellek: çevrimiçiyken her zaman güncel dosya, bağlantı yokken son kopya.
const CACHE = "staj-cv-kocu-v3";
const DOSYALAR = ["./", "./app.js","./takip.js","./index.html","./lib/beceriler.js","./lib/claude.js","./lib/eslestir.js","./lib/gizlilik.js","./lib/ornek.js","./lib/ilan.js","./lib/iller.js","./style.css","./manifest.webmanifest","./ikon.svg","./ikon-192.png","./ikon-512.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(DOSYALAR)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith("staj-cv-kocu-") && key !== CACHE).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const yanit = await fetch(event.request);
      if (yanit.ok) cache.put(event.request, yanit.clone()).catch(() => {});
      return yanit;
    } catch {
      return (await cache.match(event.request, { ignoreSearch: true })) || Response.error();
    }
  })());
});
