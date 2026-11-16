/* Network first, so a changed schedule shows up straight away; falls back to the saved copy offline. */
var C = "myweek-v1";
var ASSETS = ["./", "index.html", "schedule.json", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];

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
    fetch(e.request)
      .then(function (r) {
        var copy = r.clone();
        caches.open(C).then(function (c) { c.put(e.request, copy); });
        return r;
      })
      .catch(function () { return caches.match(e.request); })
  );
});
