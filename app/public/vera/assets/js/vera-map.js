/* VERA Atlas — MapLibre GL over OpenFreeMap's free, keyless Liberty style.
   The basemap carries real streets and building footprints; VERA listings stay
   in one canvas source so the street-scale hunt remains legible and responsive. */
(function () {
  'use strict';

  var C = window.__VERAC;
  var STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
  /* Version the worker-facing source identity as well as the script URL. */
  var SOURCE_ID = 'vera-listings-v3';
  var POINT_LAYERS = ['vera-listing-points'];
  var mapInstance = null;

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function coarsePointer() {
    return !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  }

  function viewportWidth() {
    return window.innerWidth || document.documentElement.clientWidth || 1024;
  }

  function shouldCompactAttribution(container) {
    return (container.clientWidth || viewportWidth()) < 680;
  }

  function isPhone() {
    /* Follow the actual compact application chrome, including iPad split view,
       rather than guessing from the device's full physical screen. */
    return coarsePointer() && viewportWidth() <= 760;
  }

  function available() {
    if (!window.maplibregl) return false;
    try { return window.maplibregl.supported ? window.maplibregl.supported() : true; } catch (e) { return true; }
  }

  function setPaint(target, layer, property, value) {
    if (target && typeof target.setPaintProperty === 'function') {
      try { target.setPaintProperty(layer.id, property, value); } catch (e) {}
      return;
    }
    layer.paint = layer.paint || {};
    layer.paint[property] = value;
  }

  /* Liberty's three road-shield filters compare `ref_length` with a number.
     OpenMapTiles legitimately omits that property on some road-name features,
     which otherwise makes every worker warn about a null numeric input. A
     missing length cannot produce a usable shield, so 99 preserves the filter's
     intent (`<= 6`) without removing or visually changing any valid shield. */
  function hardenNullableStyleNumbers(style) {
    var guards = 0;
    function visit(expression) {
      if (!Array.isArray(expression)) return;
      if (
        expression[0] === '<=' &&
        Array.isArray(expression[1]) &&
        expression[1][0] === 'get' &&
        expression[1][1] === 'ref_length'
      ) {
        expression[1] = ['to-number', expression[1], 99];
        guards += 1;
      }
      expression.forEach(visit);
    }
    ((style && style.layers) || []).forEach(function (layer) {
      if (/shield/.test(layer.id || '')) visit(layer.filter);
    });
    return guards;
  }

  /* Liberty supplies the cartographic hierarchy. This selective Surveyor
     palette keeps roads, labels, water, parks, and buildings distinct instead
     of washing every polygon in the same VERA green. Green remains evidence. */
  function themeBaseMap(target) {
    var style = target && typeof target.getStyle === 'function' ? target.getStyle() : target;
    var layers = (style && style.layers) || [];
    var roadLayers = 0;
    var hasFootprints = false;
    var hasExtrusions = false;

    layers.forEach(function (layer) {
      var id = layer.id || '';

      if (layer.type === 'background' && id === 'background') {
        setPaint(target, layer, 'background-color', '#121310');
        return;
      }

      if (layer.type === 'raster' && id === 'natural_earth') {
        setPaint(target, layer, 'raster-opacity', 0.3);
        setPaint(target, layer, 'raster-saturation', -0.8);
        setPaint(target, layer, 'raster-brightness-max', 0.42);
        return;
      }

      if (layer.type === 'fill') {
        if (id === 'water') {
          setPaint(target, layer, 'fill-color', '#102329');
        } else if (/^park$|park_outline|landcover_(wood|grass|wetland)|landuse_(pitch|track|cemetery)/.test(id)) {
          setPaint(target, layer, 'fill-color', '#263129');
          setPaint(target, layer, 'fill-outline-color', '#39453b');
        } else if (id === 'landuse_residential') {
          setPaint(target, layer, 'fill-color', '#1b1c19');
        } else if (/landuse_(hospital|school)/.test(id)) {
          setPaint(target, layer, 'fill-color', '#292621');
          setPaint(target, layer, 'fill-outline-color', '#484239');
        } else if (/landcover_(ice|sand)/.test(id)) {
          setPaint(target, layer, 'fill-color', '#383832');
        } else if (id === 'aeroway_fill') {
          setPaint(target, layer, 'fill-color', '#242521');
        } else if (id === 'road_area_pattern') {
          setPaint(target, layer, 'fill-color', '#3e3c36');
        } else if (id === 'building') {
          hasFootprints = true;
          setPaint(target, layer, 'fill-color', '#302e29');
          setPaint(target, layer, 'fill-outline-color', '#595348');
          setPaint(target, layer, 'fill-opacity', 0.94);
        }
        return;
      }

      if (layer.type === 'fill-extrusion' && id === 'building-3d') {
        hasExtrusions = true;
        setPaint(target, layer, 'fill-extrusion-color', '#3a3730');
        setPaint(target, layer, 'fill-extrusion-opacity', 0.84);
        setPaint(target, layer, 'fill-extrusion-vertical-gradient', true);
        return;
      }

      if (layer.type === 'line') {
        if (/^(road|bridge|tunnel)_/.test(id)) roadLayers += 1;
        if (/waterway/.test(id)) {
          setPaint(target, layer, 'line-color', '#31525a');
        } else if (/_(major_rail|transit_rail)$/.test(id)) {
          setPaint(target, layer, 'line-color', '#6a655c');
        } else if (/rail_hatching/.test(id)) {
          setPaint(target, layer, 'line-color', '#262722');
        } else if (/^(road|bridge|tunnel)_/.test(id) && /casing/.test(id)) {
          setPaint(target, layer, 'line-color', '#181915');
        } else if (/^(road|bridge|tunnel)_/.test(id) && /motorway/.test(id)) {
          setPaint(target, layer, 'line-color', '#807568');
        } else if (/^(road|bridge|tunnel)_/.test(id) && /trunk_primary/.test(id)) {
          setPaint(target, layer, 'line-color', '#71695e');
        } else if (/^(road|bridge|tunnel)_/.test(id) && /secondary_tertiary/.test(id)) {
          setPaint(target, layer, 'line-color', '#625d54');
        } else if (/^(road|bridge|tunnel)_/.test(id) && /(minor|street)/.test(id)) {
          setPaint(target, layer, 'line-color', '#504d46');
        } else if (/^(road|bridge|tunnel)_/.test(id) && /path_pedestrian/.test(id)) {
          setPaint(target, layer, 'line-color', '#4c453c');
        } else if (/^(road|bridge|tunnel)_/.test(id) && /(service_track|link)/.test(id)) {
          setPaint(target, layer, 'line-color', '#403f39');
        } else if (/^boundary_/.test(id)) {
          setPaint(target, layer, 'line-color', '#6a655c');
          setPaint(target, layer, 'line-opacity', 0.62);
        }
        return;
      }

      if (layer.type === 'symbol') {
        if (/^water_name|waterway_line_label/.test(id)) {
          setPaint(target, layer, 'text-color', '#89aab2');
          setPaint(target, layer, 'text-halo-color', '#102329');
          setPaint(target, layer, 'text-halo-width', 1.25);
        } else if (/^highway-name|^highway-shield|^road_shield/.test(id)) {
          setPaint(target, layer, 'text-color', '#d7cebf');
          setPaint(target, layer, 'text-halo-color', '#151612');
          setPaint(target, layer, 'text-halo-width', 1.35);
        } else if (/^label_/.test(id)) {
          setPaint(target, layer, 'text-color', '#eee4d3');
          setPaint(target, layer, 'text-halo-color', '#11120f');
          setPaint(target, layer, 'text-halo-width', 1.6);
        } else if (/^poi_|^airport$/.test(id)) {
          setPaint(target, layer, 'text-color', '#aaa08f');
          setPaint(target, layer, 'text-halo-color', '#151612');
          setPaint(target, layer, 'text-halo-width', 1.25);
          setPaint(target, layer, 'icon-opacity', 0.76);
        }
      }
    });

    return {
      streets: roadLayers >= 12 ? 'detailed' : 'vector',
      buildings: hasExtrusions ? '3d' : (hasFootprints ? 'footprints' : 'unavailable'),
    };
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

  function moveCamera(map, options) {
    if (prefersReducedMotion() && map.jumpTo) {
      var still = {};
      Object.keys(options).forEach(function (key) {
        if (key !== 'duration' && key !== 'essential') still[key] = options[key];
      });
      map.jumpTo(still);
      return;
    }
    options.duration = prefersReducedMotion() ? 0 : options.duration;
    options.essential = false;
    map.easeTo(options);
  }

  function detailCamera() {
    if (isPhone()) return { zoom: 15.8, pitch: 0 };
    if (coarsePointer() || viewportWidth() < 1100) return { zoom: 16.15, pitch: 30 };
    return { zoom: 16.45, pitch: 42 };
  }

  function cityCamera() {
    /* Open on VERA's practical hunt core instead of fitting the whole metro.
       Manhattan, North Brooklyn, and western Queens lead; the Bronx remains
       reachable without letting New Jersey or Long Island set the scale. */
    return { center: [-73.96, 40.714], zoom: 12.15 };
  }

  function focusListing(map, feature) {
    if (!feature || !feature.geometry) return;
    var uid = feature.properties && feature.properties.uid;
    var camera = detailCamera();
    var container = map.getContainer();
    if (uid != null) {
      try { map.setFilter('vera-listing-focus', ['==', ['get', 'uid'], String(uid)]); } catch (e) {}
      container.setAttribute('data-veramap-focus', String(uid));
    }
    container.setAttribute('data-veramap-camera', 'block');
    moveCamera(map, {
      center: feature.geometry.coordinates,
      zoom: camera.zoom,
      pitch: prefersReducedMotion() ? 0 : camera.pitch,
      bearing: 0,
      duration: 420,
    });
  }

  function markRenderedState(map, data) {
    if (mapInstance !== map) return;
    var container = map.getContainer();
    var rendered = [];
    try { rendered = map.queryRenderedFeatures({ layers: POINT_LAYERS }); } catch (e) {}
    container.setAttribute('data-veramap-listings', String((data.features || []).length));
    container.setAttribute('data-veramap-features', String(rendered.length));
    container.setAttribute('data-veramap-ready', 'true');
  }

  function trackRenderedState(map, data) {
    var generation = (map.__veraRenderGeneration || 0) + 1;
    map.__veraRenderGeneration = generation;
    var attempts = 0;
    var inspect = function () {
      if (mapInstance !== map || map.__veraRenderGeneration !== generation) return;
      attempts += 1;
      markRenderedState(map, data);
      var count = +(map.getContainer().getAttribute('data-veramap-features') || 0);
      if (!count && attempts < 40) window.setTimeout(inspect, 100);
    };
    window.setTimeout(inspect, 0);
  }

  function listingSource(data) {
    return {
      type: 'geojson',
      data: data,
      /* Stable numeric feature identities without exposing or mutating VERA's
         listing UID property. */
      generateId: true,
    };
  }

  function addListingLayers(map, data, onOpen) {
    map.addSource(SOURCE_ID, listingSource(data));

    map.addLayer({
      id: 'vera-listing-points',
      type: 'circle',
      source: SOURCE_ID,
      paint: {
        'circle-color': ['match', ['get', 'state'], 'bad', '#cf7352', 'warn', '#d4a24c', '#4cc38a'],
        'circle-opacity': 0.96,
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 9.5, 5, 12.5, 8, 16, 12],
        'circle-stroke-color': '#10110e',
        'circle-stroke-width': 1.75,
      },
    });

    /* The focus ring identifies the selected coordinate without claiming its
       point is an exact building match; footprints remain map context. */
    map.addLayer({
      id: 'vera-listing-focus',
      type: 'circle',
      source: SOURCE_ID,
      filter: ['==', ['get', 'uid'], ''],
      paint: {
        'circle-color': '#000000',
        'circle-opacity': 0.001,
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 13, 13, 16, 18],
        'circle-stroke-color': '#f0e5d2',
        'circle-stroke-width': 2.5,
      },
    });

    map.addLayer({
      id: 'vera-listing-labels',
      type: 'symbol',
      source: SOURCE_ID,
      minzoom: 14.25,
      layout: {
        'text-field': ['get', 'rent'],
        'text-size': 10,
        'text-allow-overlap': true,
        'text-ignore-placement': true,
      },
      paint: {
        'text-color': '#11120f',
        'text-halo-width': 0,
      },
    });

    /* Transparent targets preserve at least 44 CSS pixels of forgiving input
       without turning the visible listing coordinates into oversized pins. */
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
      if (!feature || !feature.properties) return;
      focusListing(map, feature);
      if (onOpen) onOpen(feature.properties.uid);
    });

    ['vera-listing-hit'].forEach(function (layerId) {
      map.on('mouseenter', layerId, function () { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', layerId, function () { map.getCanvas().style.cursor = ''; });
    });
  }

  function frameListings(map, data) {
    var features = data.features || [];
    if (!features.length) return;
    map.getContainer().setAttribute('data-veramap-camera', 'city');
    if (features.length === 1) {
      var camera = detailCamera();
      moveCamera(map, {
        center: features[0].geometry.coordinates,
        zoom: Math.min(camera.zoom, 16),
        pitch: prefersReducedMotion() ? 0 : Math.min(camera.pitch, 36),
        bearing: 0,
        duration: 360,
      });
      return;
    }
    var city = cityCamera();
    moveCamera(map, {
      center: city.center,
      zoom: city.zoom,
      pitch: 0,
      bearing: 0,
      duration: 420,
    });
  }

  function disableAccidentalCameraGestures(map) {
    try { if (map.dragRotate && map.dragRotate.disable) map.dragRotate.disable(); } catch (e) {}
    try { if (map.touchPitch && map.touchPitch.disable) map.touchPitch.disable(); } catch (e) {}
    try { if (map.touchZoomRotate && map.touchZoomRotate.disableRotation) map.touchZoomRotate.disableRotation(); } catch (e) {}
    try { if (map.keyboard && map.keyboard.disableRotation) map.keyboard.disableRotation(); } catch (e) {}
  }

  function mount(container, listings, onOpen, onFailure) {
    if (!available()) return null;
    /* Filter changes update this map in place. Release an older WebGL context
       only when Atlas genuinely rebuilds its map pane (for example List → Map). */
    if (mapInstance) destroy();
    try {
      if (!window.__VERA_MAP_STYLE__) return null;
      var pendingData = listingsGeoJSON(listings);
      var reduced = prefersReducedMotion();
      /* Clone and theme Liberty before MapLibre sees it. This avoids mutating
         a live vector style while its workers are registering VERA's source. */
      var preparedStyle = JSON.parse(JSON.stringify(window.__VERA_MAP_STYLE__));
      var numberGuards = hardenNullableStyleNumbers(preparedStyle);
      var cartography = themeBaseMap(preparedStyle);
      container.setAttribute('role', 'region');
      container.setAttribute('aria-label', 'Interactive street and building map of listings. Use List view for a text alternative.');
      container.setAttribute('data-veramap-style', 'vera-surveyor-liberty');
      container.setAttribute('data-veramap-clusters', 'disabled');
      container.setAttribute('data-veramap-points', 'unclustered');
      container.setAttribute('data-veramap-motion', reduced ? 'reduced' : 'standard');
      container.setAttribute('data-veramap-listings', String(pendingData.features.length));
      container.setAttribute('data-veramap-attribution', 'OpenFreeMap, OpenMapTiles, OpenStreetMap contributors');
      container.setAttribute('data-veramap-streets', cartography.streets);
      container.setAttribute('data-veramap-buildings', cartography.buildings);
      container.setAttribute('data-veramap-style-number-guards', String(numberGuards));

      var openingCamera = cityCamera();
      var map = new window.maplibregl.Map({
        container: container,
        style: preparedStyle,
        center: openingCamera.center,
        zoom: openingCamera.zoom,
        minZoom: 9.5,
        maxZoom: 18.5,
        maxPitch: 50,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        attributionControl: false,
        cooperativeGestures: true,
        fadeDuration: reduced ? 0 : 180,
      });
      var initialReady = false;
      var initialFailed = false;
      var initialResourceErrors = 0;
      var initialTimer = 0;
      var clearInitialTimer = function () {
        if (initialTimer) window.clearTimeout(initialTimer);
        initialTimer = 0;
      };
      var failInitialMap = function () {
        if (initialReady || initialFailed || mapInstance !== map) return;
        initialFailed = true;
        clearInitialTimer();
        try { map.remove(); } catch (e) {}
        if (mapInstance === map) mapInstance = null;
        if (onFailure) onFailure();
      };
      map.__clearInitialTimer = clearInitialTimer;
      initialTimer = window.setTimeout(failInitialMap, 12000);
      map.on('error', function (event) {
        if (initialReady || initialFailed) return;
        var message = String(event && event.error && (event.error.message || event.error) || '');
        /* Tile requests can fail independently after the style is usable. Only
           a failed initial style request should replace the canvas at once;
           the timeout covers silent CSP/network failures without reacting to
           an ordinary later tile miss. */
        if (message.indexOf(STYLE_URL) > -1 || /style(?:\s|\-|_)*(?:load|request|json)/i.test(message)) {
          failInitialMap();
        } else if (message.indexOf('tiles.openfreemap.org') > -1) {
          initialResourceErrors += 1;
          if (initialResourceErrors >= 4) failInitialMap();
        }
      });
      if (map.setPixelRatio) map.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.setAttribute('data-veramap-pixel-ratio', String(Math.min(window.devicePixelRatio || 1, 2)));
      disableAccidentalCameraGestures(map);
      /* On phones the fixed application tabs cover the bottom edge of the map.
         Keep the required provider credits in the unobstructed top-left rail. */
      map.addControl(new window.maplibregl.AttributionControl({
        compact: shouldCompactAttribution(container),
      }), isPhone() ? 'top-left' : 'bottom-right');
      map.addControl(new window.maplibregl.NavigationControl({ showCompass: false }), 'top-right');

      map.__setListings = function (nextListings) {
        pendingData = listingsGeoJSON(nextListings);
        container.setAttribute('data-veramap-listings', String(pendingData.features.length));
        var source = map.getSource && map.getSource(SOURCE_ID);
        if (source) {
          source.setData(pendingData);
          trackRenderedState(map, pendingData);
        }
      };

      map.on('load', function () {
        if (mapInstance !== map) return;
        try {
          addListingLayers(map, pendingData, onOpen);
          frameListings(map, pendingData);
          initialReady = true;
          clearInitialTimer();
          trackRenderedState(map, pendingData);
        } catch (e) {
          failInitialMap();
        }
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
      if (mapInstance.__clearInitialTimer) mapInstance.__clearInitialTimer();
      try { mapInstance.remove(); } catch (e) {}
      mapInstance = null;
    }
  }

  window.__VERAM = { available: available, mount: mount, update: update, destroy: destroy };
})();
