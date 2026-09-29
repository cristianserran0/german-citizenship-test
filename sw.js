// Offline support. Precaches the app and every official image so the whole
// test works underground. The Supabase client is loaded from a CDN and is
// deliberately not cached: sync simply no-ops when it cannot be reached.
var CACHE = 'ebt-521d73c82de8';
var ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "icon-192.png",
  "icon-512.png",
  "apple-touch-icon.png",
  "img/130.png",
  "img/176.png",
  "img/181.jpg",
  "img/187.png",
  "img/209.png",
  "img/21.png",
  "img/216.png",
  "img/226.png",
  "img/235.jpg",
  "img/301.png",
  "img/308.png",
  "img/311.png",
  "img/318.png",
  "img/321.png",
  "img/328.png",
  "img/331.png",
  "img/338.png",
  "img/341.png",
  "img/348.png",
  "img/351.png",
  "img/358.png",
  "img/361.png",
  "img/368.png",
  "img/371.png",
  "img/378.png",
  "img/381.png",
  "img/388.png",
  "img/391.png",
  "img/398.png",
  "img/401.png",
  "img/408.png",
  "img/411.png",
  "img/418.png",
  "img/421.png",
  "img/428.png",
  "img/431.png",
  "img/438.png",
  "img/441.png",
  "img/448.png",
  "img/451.png",
  "img/458.png"
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return c.addAll(ASSETS);
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) {
      return k === CACHE ? null : caches.delete(k);
    }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;   // CDN + Supabase go to the network

  // The page itself: network first, so a deploy is picked up promptly.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put('index.html', copy); });
        return res;
      }).catch(function () {
        return caches.match('index.html').then(function (r) { return r || caches.match('./'); });
      })
    );
    return;
  }

  // Everything else (images, icons): cache first.
  e.respondWith(caches.match(req).then(function (hit) {
    return hit || fetch(req).then(function (res) {
      if (res && res.status === 200) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    });
  }));
});
