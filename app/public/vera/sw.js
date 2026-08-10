/* VERA service worker — the offline ritual, honestly.
   Shell assets: cache-first (they carry ?v= busters). The feed:
   network-first, and when the network fails the cached copy is served
   WITH an X-Vera-Cache header naming when it was stored, so the app can
   badge the staleness instead of pretending the sweep just ran. */
'use strict';

var SHELL = 'vera-shell-v6';
var FEED = 'vera-feed-v2';
/* Installation stores only the versioned UI shell. Publication data stays out
   of this list so its network-first, visibly timestamped fallback below remains
   the only path that can put a feed response in storage. */
var SHELL_ASSETS = [
  '/vera/',
  '/vera/index.html',
  '/vera/manifest.webmanifest',
  '/vera/assets/css/vera.css?v=54',
  '/vera/assets/fonts/ibm-plex-sans-var.woff2',
  '/vera/assets/fonts/ibm-plex-serif-latin-600-normal.woff2',
  '/vera/assets/fonts/ibm-plex-mono-500.woff2',
  '/vera/assets/brand/vera-mark-96.png',
  '/vera/assets/icons/vera-icon-32.png',
  '/vera/assets/icons/vera-icon-180.png',
  '/vera/assets/icons/vera-icon-192.png',
  '/vera/assets/icons/vera-icon-512.png',
  '/vera/assets/icons/vera-icon-maskable-512.png',
  '/vera/assets/js/vera-core.js?v=50',
  '/vera/assets/js/vera-geo.js?v=47',
  '/vera/assets/js/vera-map.js?v=54',
  '/vera/assets/js/vera-sweep.js?v=53',
  '/vera/assets/js/vera-ledger.js?v=54',
  '/vera/assets/js/vera-app.js?v=54'
];
/* The receipts were left out of this list, so an offline visitor got the
   drop but not the record of every previous drop — on a page whose whole
   claim is that nothing is edited after the fact. The drop, receipts, and
   publication metadata are all cached network-first, with the stored copy
   stamped so the app can badge its age rather than imply the sweep just ran. */
var DATA_PATHS = ['/vera/data/public.json', '/vera/data/archive.json', '/vera/data/meta.json'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(SHELL).then(function (cache) {
      return cache.addAll(SHELL_ASSETS);
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) {
        return k.indexOf('vera-') === 0 && k !== SHELL && k !== FEED;
      }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (url.origin !== location.origin || url.pathname.indexOf('/vera/') !== 0) return;
  if (e.request.method !== 'GET') return;

  if (DATA_PATHS.indexOf(url.pathname) !== -1) {
    var dataPath = url.pathname;
    e.respondWith(
      fetch(e.request).then(function (resp) {
        if (resp.ok) {
          var copy = resp.clone();
          caches.open(FEED).then(function (c) {
            var headers = new Headers(copy.headers);
            headers.set('X-Vera-Cached-At', new Date().toISOString());
            copy.blob().then(function (body) {
              c.put(dataPath, new Response(body, { status: 200, headers: headers }));
            });
          });
        }
        return resp;
      }).catch(function () {
        return caches.open(FEED).then(function (c) { return c.match(dataPath); }).then(function (hit) {
          if (!hit) throw new Error('offline, no cached sweep');
          var headers = new Headers(hit.headers);
          headers.set('X-Vera-Cache', headers.get('X-Vera-Cached-At') || 'unknown');
          return hit.blob().then(function (body) {
            return new Response(body, { status: 200, headers: headers });
          });
        });
      })
    );
    return;
  }

  /* The DOCUMENT goes network-first so a fresh deploy is never shadowed by
     yesterday's shell; versioned assets stay cache-first (the ?v= busts). */
  var isDoc = e.request.mode === 'navigate' || url.pathname === '/vera/' || url.pathname.endsWith('/index.html');
  e.respondWith(
    caches.open(SHELL).then(function (c) {
      if (isDoc) {
        return fetch(e.request).then(function (resp) {
          if (resp.ok) c.put(e.request, resp.clone());
          return resp;
        }).catch(function () {
          return c.match(e.request).then(function (hit) {
            if (!hit) throw new Error('offline, no cached shell');
            return hit;
          });
        });
      }
      return c.match(e.request).then(function (hit) {
        var refetch = fetch(e.request).then(function (resp) {
          if (resp.ok) c.put(e.request, resp.clone());
          return resp;
        });
        return hit || refetch;
      });
    })
  );
});
