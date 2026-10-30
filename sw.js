/* Onething Worship: keeps the app on the phone so it opens without a network. */
var BUILT = 1793335577663, CACHE = 'otw-' + BUILT;
var FILES = ["./","./index.html","./manifest.webmanifest","./icon-180.png","./icon-192.png","./icon-512.png"];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(FILES.map(function (f) {
      return fetch(f + '?v=' + BUILT, { cache: 'reload' }).then(function (r) {
        if (!r.ok) throw new Error('missing ' + f);
        if (!/(\/|index\.html)$/.test(f)) return c.put(f, r);
        return r.clone().text().then(function (t) { if (t.indexOf('"built":' + BUILT) < 0) throw new Error('old copy ' + f); return c.put(f, r); });
      });
    }));
  }).then(function () { return self.skipWaiting(); }, function (err) { return caches.delete(CACHE).then(function () { throw err; }); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) { return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.match(req, { ignoreSearch: true, cacheName: CACHE }).then(function (hit) {
    return hit || fetch(req).catch(function () { return req.mode === 'navigate' ? caches.match('./index.html', { cacheName: CACHE }) : Response.error(); });
  }));
});
