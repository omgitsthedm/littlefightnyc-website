/* VERA map — the real city, to the pixel. MapLibre GL (vendored, BSD)
   over OpenFreeMap's keyless vector tiles: every street, every building
   footprint, crisp at any zoom, recolored to VERA's warm black. The
   hand-drawn SVG atlas remains the honest fallback when WebGL or the
   tile host is unavailable. */
(function () {
  'use strict';

  var C = window.__VERAC;
  var STYLE_URL = 'https://tiles.openfreemap.org/styles/dark';
  var mapInstance = null;

  function available() {
    if (!window.maplibregl) return false;
    try { return maplibregl.supported ? maplibregl.supported() : true; } catch (e) { return true; }
  }

  /* Recolor the base style into VERA's palette after load: warm blacks
     for ground, muted pine for parks, brand water, quiet labels. */
  var TINTS = [
    [/water/i, 'fill-color', '#0c1512'],
    [/park|wood|grass|cemetery|golf|pitch|garden/i, 'fill-color', '#15231b'],
    [/background/i, 'background-color', '#0b0d0c'],
    [/building/i, 'fill-color', '#161a17'],
    [/residential|landuse/i, 'fill-color', '#101311'],
  ];

  function tint(map) {
    var layers = (map.getStyle() && map.getStyle().layers) || [];
    layers.forEach(function (ly) {
      TINTS.forEach(function (t) {
        if (t[0].test(ly.id)) {
          try { map.setPaintProperty(ly.id, t[1], t[2]); } catch (e) {}
        }
      });
      if (ly.type === 'symbol') {
        try { map.setPaintProperty(ly.id, 'text-color', '#8d877a'); } catch (e) {}
        try { map.setPaintProperty(ly.id, 'text-halo-color', '#0b0d0c'); } catch (e) {}
      }
    });
  }

  function listingsGeoJSON(listings) {
    return {
      type: 'FeatureCollection',
      features: listings.filter(function (l) { return l.latitude != null && l.longitude != null; })
        .map(function (l) {
          var state = C.isScam(l) ? 'bad' : C.needsVerify(l) ? 'warn' : 'good';
          return {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [+l.longitude, +l.latitude] },
            properties: {
              uid: l.listing_uid,
              rent: l.rent ? '$' + (Math.round(l.rent / 100) / 10) + 'k' : '?',
              state: state,
              title: l.title || l.address_normalized || 'Listing',
            },
          };
        }),
    };
  }

  function hoodBoundaries() {
    if (!window.__VERAG || !window.__VERAG.ready || !window.__VERAG.ready()) return null;
    /* rebuild light boundary lines from the vendored NTA polygons */
    var geo = null;
    try {
      geo = { type: 'FeatureCollection', features: [] };
      (window.__VERAG_RAW || []).forEach(function () {});
    } catch (e) {}
    return null; /* the base map's own boundaries suffice at v1 */
  }

  function mount(container, listings, onOpen) {
    if (!available()) return null;
    try {
      var map = new maplibregl.Map({
        container: container,
        style: STYLE_URL,
        center: [-73.9605, 40.755],
        zoom: 11.35,
        minZoom: 9.5,
        maxZoom: 17.5,
        attributionControl: { compact: true },
        cooperativeGestures: false,
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

      var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      var markers = [];
      function placeMarkers(ls) {
        markers.forEach(function (m) { m.remove(); });
        markers = [];
        var fs = listingsGeoJSON(ls).features;
        fs.forEach(function (f, i) {
          var el = document.createElement('div');
          el.className = 'vpin vpin--' + f.properties.state;
          el.style.setProperty('--pd', Math.min(i * 45, 1800) + 'ms');
          el.title = f.properties.title + ' · ' + f.properties.rent;
          el.textContent = f.properties.rent;
          var pulse = document.createElement('span');
          pulse.className = 'vpin__pulse';
          el.appendChild(pulse);
          el.addEventListener('click', function (ev) { ev.stopPropagation(); if (onOpen) onOpen(f.properties.uid); });
          markers.push(new maplibregl.Marker({ element: el }).setLngLat(f.geometry.coordinates).addTo(map));
        });
      }
      map.__placeMarkers = placeMarkers;

      var placed = false;
      function firstPlace() {
        if (placed) return;
        placed = true;
        tint(map);
        placeMarkers(listings);
      }
      /* 'load' can be missed on rapid re-mounts and 'idle' has proven shy
         in embedded panes — take every road in, idempotently */
      map.once('idle', firstPlace);
      map.once('render', function () { setTimeout(firstPlace, 400); });
      setTimeout(firstPlace, 2200);
      if (map.loaded && map.loaded()) firstPlace();
      map.on('load', function () {
        firstPlace();
        map.addSource('vera-listings', { type: 'geojson', data: listingsGeoJSON(listings) });

        /* frame the hunt zone on the actual pins */
        var pts = listingsGeoJSON(listings).features;
        if (pts.length) {
          var b = new maplibregl.LngLatBounds();
          pts.forEach(function (f) { b.extend(f.geometry.coordinates); });
          map.fitBounds(b, { padding: 60, duration: RM ? 0 : 1200, maxZoom: 13.5 });
        }
      });

      mapInstance = map;
      return map;
    } catch (e) {
      return null;
    }
  }

  function update(listings) {
    if (mapInstance && mapInstance.__placeMarkers) mapInstance.__placeMarkers(listings);
    if (mapInstance && mapInstance.getSource && mapInstance.getSource('vera-listings')) {
      mapInstance.getSource('vera-listings').setData(listingsGeoJSON(listings));
    }
  }

  function destroy() {
    if (mapInstance) {
      try { mapInstance.remove(); } catch (e) {}
      mapInstance = null;
    }
  }

  window.__VERAM = { available: available, mount: mount, update: update, destroy: destroy };
})();
