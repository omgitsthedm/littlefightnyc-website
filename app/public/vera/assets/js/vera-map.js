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

      map.on('load', function () {
        tint(map);
        map.addSource('vera-listings', { type: 'geojson', data: listingsGeoJSON(listings) });
        map.addLayer({
          id: 'vera-halo',
          type: 'circle',
          source: 'vera-listings',
          paint: {
            'circle-radius': 14,
            'circle-color': ['match', ['get', 'state'], 'good', '#4cc38a', 'warn', '#e3b567', '#e06a70'],
            'circle-opacity': 0.12,
          },
        });
        map.addLayer({
          id: 'vera-dots',
          type: 'circle',
          source: 'vera-listings',
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 5, 14, 9, 16, 12],
            'circle-color': '#0e1411',
            'circle-stroke-width': 2.4,
            'circle-stroke-color': ['match', ['get', 'state'], 'good', '#4cc38a', 'warn', '#e3b567', '#e06a70'],
          },
        });
        map.addLayer({
          id: 'vera-rents',
          type: 'symbol',
          source: 'vera-listings',
          minzoom: 12,
          layout: {
            'text-field': ['get', 'rent'],
            'text-size': 11,
            'text-offset': [0, -1.5],
            'text-font': ['Noto Sans Regular'],
          },
          paint: { 'text-color': '#ece4d3', 'text-halo-color': '#0b0d0c', 'text-halo-width': 1.4 },
        });

        map.on('click', 'vera-dots', function (e) {
          var f = e.features && e.features[0];
          if (f && f.properties && f.properties.uid && onOpen) onOpen(f.properties.uid);
        });
        map.on('mouseenter', 'vera-dots', function () { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'vera-dots', function () { map.getCanvas().style.cursor = ''; });

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
