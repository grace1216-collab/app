/* Onething Worship: keeps the app on the phone so it opens without a network. */
var CACHE = 'otw-1791770889602';
var FILES = ["./","./index.html","./manifest.webmanifest","./icon-180.png","./icon-192.png","./icon-512.png"];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES.map(function (f) { return new Request(f, { cache: 'reload' }); })); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) { return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  var net = fetch(req).then(function (res) {
    if (!res || !res.ok) return res;
    var copy = res.clone();
    return caches.open(CACHE).then(function (c) { return c.put(req, copy); }).then(function () { return res; }, function () { return res; });
  });
  e.waitUntil(net.then(function () {}, function () {}));
  e.respondWith(caches.match(req, { ignoreSearch: true, cacheName: CACHE }).then(function (hit) {
    return hit || net.catch(function () { return req.mode === 'navigate' ? caches.match('./index.html', { cacheName: CACHE }) : Response.error(); });
  }));
});
