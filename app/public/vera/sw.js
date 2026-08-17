/* VERA service worker — the offline ritual, honestly.
   Shell assets: cache-first (they carry ?v= busters). The feed:
   network-first, and when the network fails the cached copy is served
   WITH an X-Vera-Cache header naming when it was stored, so the app can
   badge the staleness instead of pretending the sweep just ran. */
'use strict';

var SHELL = 'vera-shell-v14';
var FEED = 'vera-feed-v2';
/* Installation stores only the versioned UI shell. Publication data stays out
   of this list so its network-first, visibly timestamped fallback below remains
   the only path that can put a feed response in storage. */
var SHELL_ASSETS = [
  '/vera/',
  '/vera/index.html',
  '/vera/manifest.webmanifest',
  '/vera/assets/css/vera.css?v=61',
  '/vera/assets/fonts/ibm-plex-sans-var.woff2',
  '/vera/assets/fonts/ibm-plex-serif-latin-600-normal.woff2',
  '/vera/assets/fonts/ibm-plex-mono-500.woff2',
  '/vera/assets/brand/vera-mark-96.png',
  '/vera/assets/icons/vera-icon-32.png',
  '/vera/assets/icons/vera-icon-180.png',
  '/vera/assets/icons/vera-icon-192.png',
  '/vera/assets/icons/vera-icon-512.png',
  '/vera/assets/icons/vera-icon-maskable-512.png',
  '/vera/assets/js/vera-core.js?v=51',
  '/vera/assets/js/vera-geo.js?v=60',
  '/vera/assets/js/vera-map.js?v=60',
  '/vera/assets/js/vera-ledger.js?v=58',
  '/vera/assets/js/vera-app.js?v=61'
];
/* The receipts were left out of this list, so an offline visitor got the
   drop but not the record of every previous drop — on a page whose whole
   claim is that nothing is edited after the fact. The drop, receipts, and
   publication metadata are all cached network-first, with the stored copy
   stamped so the app can badge its age rather than imply the sweep just ran. */
var DATA_PATHS = ['/vera/data/public.json', '/vera/data/archive.json', '/vera/data/meta.json'];
var publicationWrites = {};

/* A 200 alone is not enough to overwrite the last known-good publication.
   GitHub's edge may return an HTML error page with a 200, and an interrupted
   body may still look successful until the browser reads it. Inspect the
   endpoint-specific contract before either the app or the fallback sees it. */
function publicationStamp(dataPath, publication) {
  if (dataPath.endsWith('/archive.json')) {
    return publication.reduce(function (latest, entry) {
      var value = entry && (entry.generated_at || entry.date);
      var parsed = Date.parse(value || '') || 0;
      return Math.max(latest, parsed);
    }, 0);
  }
  return Date.parse((publication && publication.generated_at) || '') || 0;
}

function matchesPublicationContract(dataPath, publication) {
  if (dataPath.endsWith('/archive.json')) {
    return Array.isArray(publication) && publication.every(function (entry) {
      return entry && typeof entry === 'object' && Date.parse(entry.date || '') > 0 && Array.isArray(entry.listings);
    });
  }
  if (!publication || typeof publication !== 'object' || publicationStamp(dataPath, publication) <= 0) return false;
  if (dataPath.endsWith('/public.json')) {
    return Array.isArray(publication.pool) && Array.isArray(publication.shortlist);
  }
  return dataPath.endsWith('/meta.json') && Number.isFinite(publication.pool) && Number.isFinite(publication.shortlist);
}

function inspectPublication(dataPath, response) {
  if (!response || !response.ok || response.status !== 200 || response.type === 'opaque') {
    return Promise.resolve({ response: response, valid: false });
  }

  return response.clone().text().then(function (text) {
    if (!text.trim()) throw new Error('empty VERA publication');
    var publication = JSON.parse(text);
    if (!matchesPublicationContract(dataPath, publication)) throw new Error('invalid VERA publication contract');
    return {
      response: response,
      valid: true,
      text: text,
      stamp: publicationStamp(dataPath, publication),
    };
  }).catch(function () {
    return { response: response, valid: false };
  });
}

function persistPublication(dataPath, inspected) {
  if (!inspected || !inspected.valid) return Promise.resolve();
  var previous = publicationWrites[dataPath] || Promise.resolve();
  var write = previous.catch(function () {}).then(function () {
    return caches.open(FEED).then(function (cache) {
      return cache.match(dataPath).then(function (existing) {
        if (!existing) return 0;
        return existing.clone().json().then(function (publication) {
          return publicationStamp(dataPath, publication);
        }).catch(function () { return 0; });
      }).then(function (existingStamp) {
        /* A slower older request must not win after a newer tab or retry has
           already stored a later generated publication. */
        if (existingStamp > 0 && inspected.stamp > 0 && inspected.stamp < existingStamp) return;
        var headers = new Headers(inspected.response.headers);
        headers.set('X-Vera-Cached-At', new Date().toISOString());
        return cache.put(dataPath, new Response(inspected.text, { status: 200, headers: headers }));
      });
    });
  });
  publicationWrites[dataPath] = write.catch(function () {});
  return write.catch(function () {
    /* Cache persistence is an availability enhancement. A storage error must
       not turn a valid network publication into an application failure. */
    return undefined;
  });
}

function cachedPublication(dataPath, networkResponse) {
  return caches.open(FEED).then(function (cache) {
    return cache.match(dataPath).then(function (hit) {
      return { cache: cache, hit: hit };
    });
  }).then(function (cached) {
    var hit = cached.hit;
    if (!hit) {
      if (networkResponse) return networkResponse;
      throw new Error('offline, no cached sweep');
    }
    return inspectPublication(dataPath, hit).then(function (inspected) {
      if (!inspected.valid) {
        return cached.cache.delete(dataPath).then(function () {
          if (networkResponse) return networkResponse;
          throw new Error('offline, invalid cached sweep');
        });
      }
      var headers = new Headers(hit.headers);
      headers.set('X-Vera-Cache', headers.get('X-Vera-Cached-At') || 'unknown');
      return hit.blob().then(function (body) {
        return new Response(body, { status: 200, headers: headers });
      });
    });
  });
}

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
    var networkPublication = fetch(e.request);
    var inspectedPublication = networkPublication.then(function (response) {
      return inspectPublication(dataPath, response);
    });
    /* waitUntil has to be registered while the FetchEvent is being handled.
       Chaining it inside the resolved fetch promise is too late on WebKit. */
    e.waitUntil(inspectedPublication.then(function (inspected) {
      return persistPublication(dataPath, inspected);
    }, function () {
      return undefined;
    }));
    e.respondWith(
      inspectedPublication.then(function (inspected) {
        if (!inspected.valid) {
          return cachedPublication(dataPath, inspected.response);
        }
        return inspected.response;
      }, function () {
        return cachedPublication(dataPath);
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
