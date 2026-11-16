/* Offline-first: serve the saved copy straight away, refresh it in the background.
   Bump C when the app changes so phones pick up the new files. */
var C = "gym-v2";
var ASSETS = [
  "./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png",
  "fonts/syne-latin-700-normal.woff2", "fonts/syne-latin-800-normal.woff2",
  "fonts/dm-sans-latin-400-normal.woff2", "fonts/dm-sans-latin-500-normal.woff2", "fonts/dm-sans-latin-700-normal.woff2",
  "fonts/dm-mono-latin-400-normal.woff2", "fonts/dm-mono-latin-500-normal.woff2"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(C).then(function (c) { return c.addAll(ASSETS); }));
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== C; }).map(function (k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(e.request).then(function (r) {
        if (r && r.ok) { var copy = r.clone(); caches.open(C).then(function (c) { c.put(e.request, copy); }); }
        return r;
      }).catch(function () { return hit || (e.request.mode === "navigate" ? caches.match("index.html") : undefined); });
      return hit || net;
    })
  );
});

self.addEventListener("notificationclick", function (e) {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) { if ("focus" in list[i]) return list[i].focus(); }
      return self.clients.openWindow("./");
    })
  );
});
