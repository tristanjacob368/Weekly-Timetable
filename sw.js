/* My Week shell: keeps the app working offline.
   Bump C when the app changes so phones pick up the new files. */
var C = "myweek-v5";
var ASSETS = [
  "./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png",
  "timetable/index.html", "todo/index.html", "gym/index.html", "schedule.json",
  "todo/fonts/syne-latin-700-normal.woff2", "todo/fonts/syne-latin-800-normal.woff2",
  "todo/fonts/dm-sans-latin-400-normal.woff2", "todo/fonts/dm-sans-latin-500-normal.woff2", "todo/fonts/dm-sans-latin-700-normal.woff2",
  "todo/fonts/dm-mono-latin-400-normal.woff2", "todo/fonts/dm-mono-latin-500-normal.woff2"
];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(C).then(function (c) {
    return Promise.all(ASSETS.map(function (a) { return c.add(a).catch(function () {}); }));
  }));
  self.skipWaiting();
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== C; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});
self.addEventListener("fetch", function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  var fresh = /schedule\.json$|calendar\.ics$|index\.html$|\/$/.test(u.pathname);
  if (fresh) {
    e.respondWith(fetch(e.request).then(function (r) {
      if (r && r.ok) { var copy = r.clone(); caches.open(C).then(function (c) { c.put(e.request, copy); }); }
      return r;
    }).catch(function () { return caches.match(e.request, { ignoreSearch: true }); }));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
    var net = fetch(e.request).then(function (r) {
      if (r && r.ok) { var copy = r.clone(); caches.open(C).then(function (c) { c.put(e.request, copy); }); }
      return r;
    }).catch(function () { return hit || (e.request.mode === "navigate" ? caches.match("index.html") : undefined); });
    return hit || net;
  }));
});
