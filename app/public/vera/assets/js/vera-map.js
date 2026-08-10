/* VERA map — MapLibre GL over OpenFreeMap's keyless vector tiles. Listings
   live in one canvas-rendered GeoJSON source, so Atlas stays responsive with
   hundreds of results and never needs a pulsing DOM marker per listing. */
(function () {
  'use strict';

  var C = window.__VERAC;
  var STYLE_URL = 'https://tiles.openfreemap.org/styles/dark';
  /* Version the worker-facing source identity as well as the script URL. */
  var SOURCE_ID = 'vera-listings-v2';
  var mapInstance = null;

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function available() {
    if (!window.maplibregl) return false;
    try { return window.maplibregl.supported ? window.maplibregl.supported() : true; } catch (e) { return true; }
  }

  /* Recolor the base style into VERA's palette after load: warm blacks for
     ground, muted pine for parks, brand water, and quiet labels. */
  var TINTS = [
    [/water/i, 'fill-color', '#0c1512'],
    [/park|wood|grass|cemetery|golf|pitch|garden/i, 'fill-color', '#15231b'],
    [/background/i, 'background-color', '#0b0d0c'],
    [/building/i, 'fill-color', '#161a17'],
    [/residential|landuse/i, 'fill-color', '#101311'],
  ];

  function tint(map) {
    var layers = (map.getStyle() && map.getStyle().layers) || [];
    layers.forEach(function (layer) {
      TINTS.forEach(function (t) {
        if (t[0].test(layer.id)) {
          try { map.setPaintProperty(layer.id, t[1], t[2]); } catch (e) {}
        }
      });
      if (layer.type === 'symbol') {
        try { map.setPaintProperty(layer.id, 'text-color', '#8d877a'); } catch (e) {}
        try { map.setPaintProperty(layer.id, 'text-halo-color', '#0b0d0c'); } catch (e) {}
      }
    });
  }

  function listingsGeoJSON(listings) {
    return {
      type: 'FeatureCollection',
      features: listings.filter(function (listing) { return listing.latitude != null && listing.longitude != null; })
        .map(function (listing) {
          var state = C.isScam(listing) ? 'bad' : C.needsVerify(listing) ? 'warn' : 'good';
          return {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [+listing.longitude, +listing.latitude] },
            properties: {
              uid: listing.listing_uid,
              rent: listing.rent ? '$' + (Math.round(listing.rent / 100) / 10) + 'k' : '?',
              state: state,
            },
          };
        }),
    };
  }

  function addListingLayers(map, data, onOpen) {
    map.addSource(SOURCE_ID, {
      type: 'geojson',
      data: data,
    });

    map.addLayer({
      id: 'vera-listing-points',
      type: 'circle',
      source: SOURCE_ID,
      paint: {
        'circle-color': ['match', ['get', 'state'], 'bad', '#cf7352', 'warn', '#d4a24c', '#4cc38a'],
        'circle-opacity': 0.94,
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 9.5, 5, 12.5, 9, 16, 14],
        'circle-stroke-color': '#0b0d0c',
        'circle-stroke-width': 1.5,
      },
    });

    map.addLayer({
      id: 'vera-listing-labels',
      type: 'symbol',
      source: SOURCE_ID,
      minzoom: 12.5,
      layout: {
        'text-field': ['get', 'rent'],
        'text-size': 9,
        'text-allow-overlap': true,
        'text-ignore-placement': true,
      },
      paint: {
        'text-color': '#0b0d0c',
        'text-halo-width': 0,
      },
    });

    /* A transparent 44-ish-pixel target keeps touch selection forgiving
       without making the visible point shout. */
    map.addLayer({
      id: 'vera-listing-hit',
      type: 'circle',
      source: SOURCE_ID,
      paint: {
        'circle-radius': 22,
        'circle-color': '#000000',
        'circle-opacity': 0.001,
      },
    });

    map.on('click', 'vera-listing-hit', function (event) {
      var feature = event.features && event.features[0];
      if (feature && feature.properties && onOpen) onOpen(feature.properties.uid);
    });

    ['vera-listing-hit'].forEach(function (layerId) {
      map.on('mouseenter', layerId, function () { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', layerId, function () { map.getCanvas().style.cursor = ''; });
    });
  }

  function frameListings(map, data) {
    var features = data.features || [];
    if (!features.length) return;
    if (features.length === 1) {
      map.easeTo({
        center: features[0].geometry.coordinates,
        zoom: 13.5,
        duration: prefersReducedMotion() ? 0 : 320,
        essential: false,
      });
      return;
    }
    var bounds = new window.maplibregl.LngLatBounds();
    features.forEach(function (feature) { bounds.extend(feature.geometry.coordinates); });
    map.fitBounds(bounds, {
      padding: 60,
      duration: prefersReducedMotion() ? 0 : 480,
      maxZoom: 13.5,
      essential: false,
    });
  }

  function mount(container, listings, onOpen) {
    if (!available()) return null;
    /* Atlas rerenders when its filters change. Release the previous WebGL
       context before attaching the replacement map to the new container. */
    if (mapInstance) destroy();
    try {
      var pendingData = listingsGeoJSON(listings);
      var map = new window.maplibregl.Map({
        container: container,
        style: STYLE_URL,
        center: [-73.9605, 40.755],
        zoom: 11.35,
        minZoom: 9.5,
        maxZoom: 17.5,
        attributionControl: { compact: true },
        cooperativeGestures: false,
      });
      map.addControl(new window.maplibregl.NavigationControl({ showCompass: false }), 'top-right');

      map.__setListings = function (nextListings) {
        pendingData = listingsGeoJSON(nextListings);
        var source = map.getSource && map.getSource(SOURCE_ID);
        if (source) source.setData(pendingData);
      };

      map.on('load', function () {
        if (mapInstance !== map) return;
        tint(map);
        map.once('idle', function () {
          if (mapInstance !== map) return;
          /* Let the base vector style settle before adding VERA's data layer. */
          addListingLayers(map, pendingData, onOpen);
          frameListings(map, pendingData);
          /* Keep the worker payload to the rendering primitives above. The
             bundled MapLibre build drops worker payloads given arbitrary
             source-title text or string top-level IDs. Listing UIDs
             stay in properties for selection; this idle marker proves the
             corrected source actually reached the rendered map. */
          map.once('idle', function () {
            if (mapInstance !== map) return;
            var rendered = map.queryRenderedFeatures({ layers: ['vera-listing-points'] });
            map.getContainer().setAttribute('data-veramap-features', String(rendered.length));
          });
        });
      });

      mapInstance = map;
      return map;
    } catch (e) {
      return null;
    }
  }

  function update(listings) {
    if (mapInstance && mapInstance.__setListings) mapInstance.__setListings(listings);
  }

  function destroy() {
    if (mapInstance) {
      try { mapInstance.remove(); } catch (e) {}
      mapInstance = null;
    }
  }

  window.__VERAM = { available: available, mount: mount, update: update, destroy: destroy };
})();
