// Service worker — BRASA BURGER PWA Cache Shell
const CACHE = "brasa-burger-v4";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./css/components.css",
  "./css/responsive.css",
  "./js/security.js",
  "./js/main.js",
  "./img/nabrasa_logo.jpeg",
  "./img/hero-brasa.webp",
  "./img/icons/icon-192.png",
  "./img/icons/icon-512.png",
  "./img/icons/favicon-32.png",
  "./img/icons/favicon-64.png",
  "./img/icons/apple-touch-icon.png",
  "./img/burger-classico.webp",
  "./img/burger-cheddar-bacon.webp",
  "./img/burger-duplo-smash.webp",
  "./img/burger-frango.webp",
  "./img/burger-veggie.webp",
  "./img/burger-costela.webp",
  "./img/batata-frita.webp",
  "./img/batata-cheddar-bacon.webp",
  "./img/onion-rings.webp",
  "./img/milkshake.webp"
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
