/* VERA service worker — the offline ritual, honestly.
   Shell assets: cache-first (they carry ?v= busters). The feed:
   network-first, and when the network fails the cached copy is served
   WITH an X-Vera-Cache header naming when it was stored, so the app can
   badge the staleness instead of pretending the sweep just ran. */
'use strict';

var SHELL = 'vera-shell-v2';
var FEED = 'vera-feed-v1';
var FEED_PATH = '/vera/data/public.json';

self.addEventListener('install', function (e) {
  self.skipWaiting();
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

  if (url.pathname === FEED_PATH) {
    e.respondWith(
      fetch(e.request).then(function (resp) {
        if (resp.ok) {
          var copy = resp.clone();
          caches.open(FEED).then(function (c) {
            var headers = new Headers(copy.headers);
            headers.set('X-Vera-Cached-At', new Date().toISOString());
            copy.blob().then(function (body) {
              c.put(FEED_PATH, new Response(body, { status: 200, headers: headers }));
            });
          });
        }
        return resp;
      }).catch(function () {
        return caches.open(FEED).then(function (c) { return c.match(FEED_PATH); }).then(function (hit) {
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
