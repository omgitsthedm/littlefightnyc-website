/* VERA Atlas — MapLibre GL over OpenFreeMap's free, keyless Liberty style.
   The basemap carries real streets and building footprints; VERA listings stay
   in one canvas source so the street-scale hunt remains legible and responsive. */
(function () {
  'use strict';

  var C = window.__VERAC;
  /* Version the worker-facing source identity as well as the script URL. */
  var SOURCE_ID = 'vera-listings-v4';
  var POINT_LAYERS = ['vera-listing-points', 'vera-listing-clusters'];
  var INTERACTIVE_LAYERS = ['vera-listing-hit', 'vera-listing-clusters'];
  var mapInstance = null;
  var lastMount = null;

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

  function messageHasTrustedMapURL(message, styleOnly) {
    var matches = String(message || '').match(/https?:\/\/[^\s"'<>]+/g) || [];
    for (var i = 0; i < matches.length; i++) {
      try {
        var parsed = new URL(matches[i].replace(/[\]),.;:!?]+$/, ''));
        if (parsed.protocol !== 'https:' || parsed.hostname !== 'tiles.openfreemap.org' || parsed.port) continue;
        if (!styleOnly || parsed.pathname === '/styles/liberty') return true;
      } catch (e) {}
    }
    return false;
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

  function coordinateNumber(value) {
    if (value == null) return null;
    if (typeof value !== 'number' && typeof value !== 'string') return null;
    if (typeof value === 'string' && !value.trim()) return null;
    var number = +value;
    return isFinite(number) ? number : null;
  }

  function hasValidLngLat(listing) {
    if (!listing) return false;
    var lat = coordinateNumber(listing.latitude), lng = coordinateNumber(listing.longitude);
    return lat != null && lng != null && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
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
     OpenMapTiles legitimately omits that property or supplies an empty string
     on some road-name features. Coerce it once and require a positive length:
     this prevents both null-number warnings and the invalid `road_` sprite while
     preserving every usable shield between one and six characters. */
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
        var refLength = ['to-number', expression[1], -1];
        var maximum = expression[2];
        expression.splice(
          0,
          expression.length,
          'all',
          ['>=', refLength, 1],
          ['<=', refLength, maximum]
        );
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
      features: listings.filter(hasValidLngLat)
        .map(function (listing) {
          var state = C.isScam(listing) ? 'bad' : C.needsVerify(listing) ? 'warn' : 'good';
          return {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [+listing.longitude, +listing.latitude] },
            properties: {
              uid: listing.listing_uid,
              rent: listing.rent ? '$' + (Math.round(listing.rent / 100) / 10) + 'k' : '?',
              price_score: (listing.rent ? '$' + (Math.round(listing.rent / 100) / 10) + 'k' : 'price ?') +
                (isFinite(+listing.overall_score) ? ' · ' + Math.round(+listing.overall_score) : ''),
              title: String(listing.title || listing.address_normalized || 'Listing'),
              neighborhood: String(listing.neighborhood || listing.borough || ''),
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
      /* Clustering is presentation-only: the source remains one public feed
         feature per listing and a cluster never becomes a new VERA record. */
      cluster: true,
      clusterMaxZoom: 13,
      clusterRadius: 52,
      /* Stable numeric feature identities without exposing or mutating VERA's
         listing UID property. */
      generateId: true,
    };
  }

  function pointFilter() { return ['!', ['has', 'point_count']]; }

  function listingFromFeature(listings, feature) {
    var uid = feature && feature.properties && feature.properties.uid;
    if (!uid) return null;
    for (var i = 0; i < listings.length; i++) {
      if (String(listings[i].listing_uid) === String(uid)) return listings[i];
    }
    return null;
  }

  function nearestListingTo(listings, center) {
    if (!center) return null;
    var best = null;
    var bestDistance = Infinity;
    for (var i = 0; i < listings.length; i++) {
      var listing = listings[i];
      if (!hasValidLngLat(listing)) continue;
      var dy = +listing.latitude - +center.lat;
      var dx = (+listing.longitude - +center.lng) * Math.cos((+center.lat) * Math.PI / 180);
      var distance = dx * dx + dy * dy;
      if (distance < bestDistance) { best = listing; bestDistance = distance; }
    }
    return best;
  }

  function popupStatus(listing) {
    if (C.isScam(listing)) return 'Scam wall';
    if (C.needsVerify(listing)) return 'Needs verification';
    return 'Clears the bar';
  }

  function popupNode(listing, onOpen) {
    var wrap = document.createElement('article');
    wrap.className = 'vera-map-popup__card';
    wrap.setAttribute('aria-label', 'Listing preview');
    var image = C.trustedURL && C.trustedURL((listing.image_urls || [])[0], 'image');
    if (image) {
      var photo = document.createElement('img');
      photo.className = 'vera-map-popup__photo';
      photo.src = image;
      photo.alt = 'Listing photo for ' + (listing.title || listing.address_normalized || 'listing');
      photo.width = 286;
      photo.height = 112;
      photo.loading = 'lazy';
      photo.decoding = 'async';
      photo.referrerPolicy = 'no-referrer';
      wrap.appendChild(photo);
    }
    var body = document.createElement('div');
    body.className = 'vera-map-popup__body';
    var heading = document.createElement('strong');
    heading.className = 'vera-map-popup__title';
    heading.textContent = listing.title || listing.address_normalized || 'Listing';
    body.appendChild(heading);
    var facts = document.createElement('p');
    facts.className = 'vera-map-popup__facts';
    var score = isFinite(+listing.overall_score) ? ' · score ' + Math.round(+listing.overall_score) : '';
    facts.textContent = (listing.rent ? C.money(listing.rent) : 'Price not published') + score +
      (listing.neighborhood ? ' · ' + listing.neighborhood : '');
    body.appendChild(facts);
    var station = C.nearestStation(listing);
    if (station) {
      var transit = document.createElement('p');
      transit.className = 'vera-map-popup__transit';
      transit.textContent = '≈' + station.mins + ' min walk · ' + station.name + (station.lines ? ' · ' + station.lines : '');
      body.appendChild(transit);
    }
    var status = document.createElement('p');
    status.className = 'vera-map-popup__status';
    status.textContent = popupStatus(listing) + '. Feed coordinate; building footprint is context, not a verified unit match.';
    body.appendChild(status);
    var open = document.createElement('button');
    open.className = 'vera-map-popup__open';
    open.type = 'button';
    open.textContent = 'Inspect listing';
    open.addEventListener('click', function () { if (onOpen) onOpen(listing.listing_uid); });
    body.appendChild(open);
    wrap.appendChild(body);
    return wrap;
  }

  function openListingPopup(map, listings, feature, onOpen) {
    var listing = listingFromFeature(listings, feature);
    if (!listing || !window.maplibregl || !window.maplibregl.Popup) return false;
    if (map.__veraPopup) map.__veraPopup.remove();
    var anchor;
    try {
      var point = map.project(feature.geometry.coordinates);
      var height = map.getContainer().clientHeight;
      anchor = point.y > height * 0.45 ? 'bottom' : 'top';
    } catch (e) {}
    var popupOptions = {
      closeButton: true,
      closeOnClick: false,
      focusAfterOpen: true,
      maxWidth: '300px',
      className: 'vera-map-popup',
      offset: 18,
    };
    if (anchor) popupOptions.anchor = anchor;
    map.__veraPopup = new window.maplibregl.Popup(popupOptions)
      .setLngLat(feature.geometry.coordinates).setDOMContent(popupNode(listing, onOpen)).addTo(map);
    return true;
  }

  function expandCluster(map, feature) {
    var source = map.getSource && map.getSource(SOURCE_ID);
    var clusterId = feature && feature.properties && feature.properties.cluster_id;
    if (!source || clusterId == null || !source.getClusterExpansionZoom) return;
    var onZoom = function (zoom) {
      moveCamera(map, { center: feature.geometry.coordinates, zoom: zoom, pitch: 0, bearing: 0, duration: 320 });
    };
    try {
      var result = source.getClusterExpansionZoom(clusterId, function (error, zoom) {
        if (!error && zoom != null) onZoom(zoom);
      });
      if (result && typeof result.then === 'function') result.then(onZoom).catch(function () {});
    } catch (e) {}
  }

  function addListingLayers(map, data, onOpen) {
    map.addSource(SOURCE_ID, listingSource(data));

    map.addLayer({
      id: 'vera-listing-clusters',
      type: 'circle',
      source: SOURCE_ID,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#173f2e',
        'circle-opacity': 0.98,
        'circle-radius': ['step', ['get', 'point_count'], 18, 10, 22, 30, 27],
        'circle-stroke-color': '#e8e1d4',
        'circle-stroke-width': 1.8,
      },
    });

    map.addLayer({
      id: 'vera-listing-cluster-count',
      type: 'symbol',
      source: SOURCE_ID,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['concat', ['to-string', ['get', 'point_count_abbreviated']], ' listings'],
        'text-size': 12,
        'text-font': ['Noto Sans Bold'],
        'text-allow-overlap': true,
      },
      paint: { 'text-color': '#fff8ea' },
    });

    map.addLayer({
      id: 'vera-listing-points',
      type: 'circle',
      source: SOURCE_ID,
      filter: pointFilter(),
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
      filter: ['all', pointFilter(), ['==', ['get', 'uid'], '']],
      paint: {
        'circle-color': '#000000',
        'circle-opacity': 0.001,
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 13, 13, 16, 18],
        'circle-stroke-color': '#f0e5d2',
        'circle-stroke-width': 2.5,
      },
    });

    map.addLayer({
      id: 'vera-listing-price-score',
      type: 'symbol',
      source: SOURCE_ID,
      filter: pointFilter(),
      minzoom: 10.75,
      layout: {
        /* Price and score remain readable before street scale; collision
           keeps the city view useful when points separate from clusters. */
        'text-field': ['get', 'price_score'],
        'text-font': ['Noto Sans Bold'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 10.75, 12, 14, 12.5],
        'text-offset': [0, 1.45],
        'text-anchor': 'top',
        'text-allow-overlap': true,
        'text-ignore-placement': false,
      },
      paint: {
        'text-color': '#f7efe2',
        'text-halo-color': '#11120f',
        'text-halo-width': 1.25,
      },
    });

    /* Transparent targets preserve at least 44 CSS pixels of forgiving input
       without turning the visible listing coordinates into oversized pins. */
    map.addLayer({
      id: 'vera-listing-hit',
      type: 'circle',
      source: SOURCE_ID,
      filter: pointFilter(),
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
      openListingPopup(map, map.__veraListings || data.__veraListings || [], feature, onOpen);
    });

    map.on('click', 'vera-listing-clusters', function (event) {
      var feature = event.features && event.features[0];
      if (feature) expandCluster(map, feature);
    });

    INTERACTIVE_LAYERS.forEach(function (layerId) {
      map.on('mouseenter', layerId, function () { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', layerId, function () { map.getCanvas().style.cursor = ''; });
    });
    map.getContainer().setAttribute('data-veramap-layer-contract', 'clusters points price-score focus hit');
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

  /* OpenMapTiles POI `class`/`subclass` values are an open vocabulary, while
     Liberty's sprite is deliberately finite. Install a transparent fallback
     synchronously during `styleimagemissing` so an unfamiliar optional POI
     does not become a broken icon or a MapLibre console warning. VERA's own
     listing layers use circles and text, so this affects base-map garnish only. */
  function installMissingStyleImageFallback(map, container) {
    var fallbackCount = 0;
    var installed = Object.create(null);
    container.setAttribute('data-veramap-image-fallbacks', '0');
    map.on('styleimagemissing', function (event) {
      var id = event && event.id;
      if (typeof id !== 'string' || !id || id.length > 96 || !/^[a-zA-Z0-9_.:-]+$/.test(id)) return;
      if (installed[id] || fallbackCount >= 128) return;
      try {
        if (map.hasImage && map.hasImage(id)) return;
        map.addImage(id, { width: 1, height: 1, data: new Uint8Array([0, 0, 0, 0]) });
        installed[id] = true;
        fallbackCount += 1;
        container.setAttribute('data-veramap-image-fallbacks', String(fallbackCount));
      } catch (e) {}
    });
  }

  function mount(container, listings, onOpen, onFailure) {
    if (!available()) return null;
    /* Filter changes update this map in place. Release an older WebGL context
       only when Atlas genuinely rebuilds its map pane (for example List → Map). */
    if (mapInstance) destroy();
    try {
      if (!window.__VERA_MAP_STYLE__) return null;
      var pendingData = listingsGeoJSON(listings);
      pendingData.__veraListings = listings.slice();
      var reduced = prefersReducedMotion();
      /* Clone and theme Liberty before MapLibre sees it. This avoids mutating
         a live vector style while its workers are registering VERA's source. */
      var preparedStyle = JSON.parse(JSON.stringify(window.__VERA_MAP_STYLE__));
      var numberGuards = hardenNullableStyleNumbers(preparedStyle);
      var cartography = themeBaseMap(preparedStyle);
      container.setAttribute('role', 'region');
      container.setAttribute('aria-label', 'Interactive street and building map of listings. Use List view for a text alternative.');
      container.setAttribute('data-veramap-style', 'vera-surveyor-liberty');
      container.setAttribute('data-veramap-clusters', 'enabled');
      container.setAttribute('data-veramap-points', 'price-score');
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
      installMissingStyleImageFallback(map, container);
      var initialReady = false;
      var initialFailed = false;
      var initialResourceErrors = 0;
      var initialErrorMessages = [];
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
        container.setAttribute('data-veramap-ready', 'false');
        container.setAttribute('data-veramap-failure', 'initial-load');
        if (onFailure) onFailure({
          code: 'initial-load',
          errors: initialErrorMessages.slice(-6),
          retry: function () { return retry(container, listings, onOpen, onFailure); },
        });
      };
      map.__clearInitialTimer = clearInitialTimer;
      initialTimer = window.setTimeout(failInitialMap, 12000);
      map.on('error', function (event) {
        if (initialReady || initialFailed) return;
        var message = String(event && event.error && (event.error.message || event.error) || '');
        if (message) initialErrorMessages.push(message);
        /* Tile requests can fail independently after the style is usable. Only
           a failed initial style request should replace the canvas at once;
           the timeout covers silent CSP/network failures without reacting to
           an ordinary later tile miss. */
        if (messageHasTrustedMapURL(message, true) || /style(?:\s|\-|_)*(?:load|request|json)/i.test(message)) {
          failInitialMap();
        } else if (messageHasTrustedMapURL(message, false)) {
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
        pendingData.__veraListings = nextListings.slice();
        map.__veraListings = pendingData.__veraListings;
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
      map.__veraListings = pendingData.__veraListings;
      lastMount = { container: container, listings: listings.slice(), onOpen: onOpen, onFailure: onFailure };
      var canvas = map.getCanvas && map.getCanvas();
      if (canvas) {
        canvas.setAttribute('tabindex', '0');
        canvas.setAttribute('aria-label', 'Atlas listing map. Use arrow keys to move the map; press Enter to inspect the listing nearest the center.');
        canvas.setAttribute('title', 'Arrow keys move the map. Enter inspects the listing nearest the center.');
        canvas.addEventListener('keydown', function (event) {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          var center = map.getCenter && map.getCenter();
          var listing = nearestListingTo(pendingData.__veraListings || [], center);
          if (!listing) return;
          event.preventDefault();
          var feature = {
            geometry: { type: 'Point', coordinates: [+listing.longitude, +listing.latitude] },
            properties: { uid: listing.listing_uid },
          };
          focusListing(map, feature);
          openListingPopup(map, pendingData.__veraListings || [], feature, onOpen);
        });
      }
      return map;
    } catch (e) {
      return null;
    }
  }

  function update(listings) {
    if (mapInstance && mapInstance.__setListings) {
      mapInstance.__setListings(listings);
      if (lastMount) lastMount.listings = listings.slice();
    }
  }

  /* Public integration hook for the app shell: callers may focus an existing
     public listing UID without knowing MapLibre's generated feature IDs. */
  function flyTo(uid, options) {
    if (!mapInstance || !mapInstance.__veraListings) return false;
    var listings = mapInstance.__veraListings;
    for (var i = 0; i < listings.length; i++) {
      if (String(listings[i].listing_uid) !== String(uid)) continue;
      if (!hasValidLngLat(listings[i])) return false;
      var feature = {
        geometry: { type: 'Point', coordinates: [+listings[i].longitude, +listings[i].latitude] },
        properties: { uid: listings[i].listing_uid },
      };
      focusListing(mapInstance, feature);
      if (!options || options.popup !== false) openListingPopup(mapInstance, listings, feature, lastMount && lastMount.onOpen);
      return true;
    }
    return false;
  }

  /* The failure callback receives a retry function, but this public form also
     supports a retry control mounted by a future Atlas shell integration. */
  function retry(container, listings, onOpen, onFailure) {
    var request = { container: container, listings: listings, onOpen: onOpen, onFailure: onFailure };
    if (!request.container && lastMount) request = lastMount;
    if (!request.container || !request.container.isConnected) return null;
    destroy();
    return mount(request.container, request.listings || [], request.onOpen, request.onFailure);
  }

  function destroy() {
    if (mapInstance) {
      if (mapInstance.__clearInitialTimer) mapInstance.__clearInitialTimer();
      try { mapInstance.remove(); } catch (e) {}
      mapInstance = null;
    }
  }

  window.__VERAM = { available: available, mount: mount, update: update, flyTo: flyTo, retry: retry, destroy: destroy };
})();
