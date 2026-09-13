// Service worker — Bendito Burger PWA Cache Shell
const CACHE = "bendito-burger-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/css/style.css",
  "./assets/css/components.css",
  "./assets/css/responsive.css",
  "./assets/js/security.js",
  "./assets/js/main.js",
  "./assets/img/icons/icon-192.png",
  "./assets/img/icons/icon-512.png",
  "./assets/img/icons/favicon-32.png",
  "./assets/img/icons/apple-touch-icon.png",
  "./assets/img/hero-chapa.webp",
  "./assets/img/burger-classico.webp",
  "./assets/img/burger-cheddar-bacon.webp",
  "./assets/img/burger-duplo-smash.webp",
  "./assets/img/burger-frango.webp",
  "./assets/img/burger-veggie.webp",
  "./assets/img/burger-costela.webp",
  "./assets/img/batata-frita.webp",
  "./assets/img/batata-cheddar-bacon.webp",
  "./assets/img/onion-rings.webp",
  "./assets/img/milkshake.webp"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) {
        return c.addAll(ASSETS);
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (k) { return k !== CACHE; })
            .map(function (k) { return caches.delete(k); })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener("fetch", function (e) {
  const req = e.request;
  if (req.method !== "GET") return;

  e.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;

      return fetch(req)
        .then(function (res) {
          if (!res || res.status !== 200 || res.type !== "basic") {
            return res;
          }
          const copy = res.clone();
          caches.open(CACHE).then(function (c) {
            c.put(req, copy).catch(function () {});
          });
          return res;
        })
        .catch(function () {
          return caches.match("./index.html");
        });
    })
  );
});
