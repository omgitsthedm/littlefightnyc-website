/* VERA geo — the real city. NYC DCP NTA2020 neighborhood polygons
   (official open data, simplified to 22m, vendored at assets/geo/hoods.json).
   Gives every listing an honest place: which polygon its coordinates truly
   sit in, and a per-listing minimap of that block of the city. */
(function () {
  'use strict';

  var C = window.__VERAC;
  var GEO = { loaded: false, hoods: [], byName: {} };

  fetch('./assets/geo/hoods-full.json', { cache: 'force-cache' })
    .catch(function () { return fetch('./assets/geo/hoods.json', { cache: 'force-cache' }); })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      GEO.hoods = d.hoods || [];
      GEO.hoods.forEach(function (h) {
        var bb = null;
        h.r.forEach(function (ring) {
          ring.forEach(function (p) {
            if (!bb) bb = { s: p[0], n: p[0], w: p[1], e: p[1] };
            else {
              if (p[0] < bb.s) bb.s = p[0];
              if (p[0] > bb.n) bb.n = p[0];
              if (p[1] < bb.w) bb.w = p[1];
              if (p[1] > bb.e) bb.e = p[1];
            }
          });
        });
        h.bb = bb;
        GEO.byName[h.n.toLowerCase()] = h;
      });
      GEO.loaded = true;
      document.dispatchEvent(new CustomEvent('vera:geo'));
    })
    .catch(function () { /* the app degrades to the abstract map */ });

  function inRing(lat, lng, ring) {
    var inside = false;
    for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      var yi = ring[i][0], xi = ring[i][1], yj = ring[j][0], xj = ring[j][1];
      if ((yi > lat) !== (yj > lat) && lng < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }

  function hoodAt(lat, lng) {
    if (!GEO.loaded || lat == null || lng == null) return null;
    for (var i = 0; i < GEO.hoods.length; i++) {
      var h = GEO.hoods[i];
      if (lat < h.bb.s || lat > h.bb.n || lng < h.bb.w || lng > h.bb.e) continue;
      for (var k = 0; k < h.r.length; k++) {
        if (inRing(lat, lng, h.r[k])) return h;
      }
    }
    return null;
  }

  /* Where the listing's coordinates ACTUALLY are vs what the post claims.
     Returns {name, agrees} — agrees=false is a quiet mis-hood tell. */
  function placeRead(l) {
    if (!hasValidLngLat(l)) return null;
    var h = hoodAt(+l.latitude, +l.longitude);
    if (!h) return null;
    var claimed = String(l.neighborhood || '').toLowerCase();
    var truth = h.n.toLowerCase();
    var agrees = !claimed || truth.indexOf(claimed.split(' (')[0]) > -1 || claimed.indexOf(truth.split(' (')[0]) > -1 ||
      truth.split(/[-(]/)[0].trim().indexOf(claimed.split(/[-(]/)[0].trim()) > -1 ||
      claimed.split(/[-(]/)[0].trim().indexOf(truth.split(/[-(]/)[0].trim()) > -1;
    return { name: h.n, boro: h.b === 'M' ? 'Manhattan' : 'Brooklyn', agrees: agrees, hood: h };
  }

  function ringsPath(rings, px, py) {
    return rings.map(function (ring) {
      return 'M' + ring.map(function (p) { return px(p[1]).toFixed(1) + ' ' + py(p[0]).toFixed(1); }).join('L') + 'Z';
    }).join(' ');
  }

  function stationPoint(station) {
    if (!station) return null;
    var best = null;
    var wantedLines = String(station.lines || '').split(/\s+/).filter(Boolean);
    for (var i = 0; i < C.STATIONS.length; i++) {
      var candidate = C.STATIONS[i];
      if (candidate[0] !== station.name) continue;
      /* A published station name can map to several entrances; choose the
         first table coordinate only when the feed did not publish one. */
      if (!best) best = candidate;
      var candidateLines = String(candidate[1] || '').split(/\s+/);
      if (!wantedLines.length || wantedLines.some(function (line) { return candidateLines.indexOf(line) > -1; })) return candidate;
    }
    return best;
  }

  function coordinateNumber(value) {
    if (value == null) return null;
    if (typeof value !== 'number' && typeof value !== 'string') return null;
    if (typeof value === 'string' && !value.trim()) return null;
    var number = +value;
    return isFinite(number) ? number : null;
  }

  function hasValidLngLat(l) {
    if (!l) return false;
    var lat = coordinateNumber(l.latitude), lng = coordinateNumber(l.longitude);
    return lat != null && lng != null && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  function labelText(text, x, y, cls, anchor) {
    return '<text class="' + cls + '" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '"' +
      (anchor ? ' text-anchor="' + anchor + '"' : '') +
      '>' + C.esc(text) + '</text>';
  }

  function shortMapLabel(text, limit) {
    var value = String(text || '');
    if (value.length <= limit) return value;
    return value.slice(0, Math.max(1, limit - 1)).replace(/\s+$/, '') + '…';
  }

  /* Per-listing minimap: the containing hood highlighted, neighbours dim,
     a true walking-scale ring, place cue, station, and the apartment pin.
     Every cue derives from the coordinate, published feed, or local station
     table — never from a geocoder or a private address lookup. viewBox w×h. */
  function minimap(l, w, h) {
    if (!GEO.loaded || !hasValidLngLat(l)) return '';
    var lat = +l.latitude, lng = +l.longitude;
    var home = hoodAt(lat, lng);
    var spanLat = 0.0135, cosL = Math.cos(lat * Math.PI / 180);
    var spanLng = spanLat * (w / h) / cosL;
    var vb = { s: lat - spanLat / 2, n: lat + spanLat / 2, w: lng - spanLng / 2, e: lng + spanLng / 2 };
    function px(x) { return (x - vb.w) / (vb.e - vb.w) * w; }
    function py(y) { return (vb.n - y) / (vb.n - vb.s) * h; }

    var polys = '';
    GEO.hoods.forEach(function (hd) {
      if (hd.bb.n < vb.s || hd.bb.s > vb.n || hd.bb.e < vb.w || hd.bb.w > vb.e) return;
      var cls = home && hd.n === home.n ? 'gm-hood gm-hood--home' : 'gm-hood';
      polys += '<path class="' + cls + '" d="' + ringsPath(hd.r, px, py) + '"/>';
    });

    /* Existing core distance math uses 80m/min. Five and ten minute rings
       make that assumption visible instead of implying a routed walking ETA. */
    var metersPerLat = 111320;
    var metersPerLng = metersPerLat * cosL;
    var walkRings = [5, 10].map(function (minutes) {
      var meters = minutes * 80;
      var rx = Math.abs(px(lng + meters / metersPerLng) - px(lng));
      var ry = Math.abs(py(lat + meters / metersPerLat) - py(lat));
      return '<ellipse class="gm-walkring" cx="' + px(lng).toFixed(1) + '" cy="' + py(lat).toFixed(1) + '" rx="' + rx.toFixed(1) + '" ry="' + ry.toFixed(1) + '" fill="none" stroke="rgba(76,195,138,' + (minutes === 5 ? '.34' : '.18') + ')" stroke-width="1" stroke-dasharray="' + (minutes === 5 ? '3 3' : '2 4') + '"/>';
    }).join('');

    var stn = C.nearestStation(l);
    var station = stationPoint(stn);
    var stnDot = '';
    if (station && station[2] > vb.s && station[2] < vb.n && station[3] > vb.w && station[3] < vb.e) {
      var first = String(stn.lines || station[1]).split(/\s+/)[0];
      var stationLabel = stn.name + (stn.lines ? ' · ' + stn.lines : '');
      stnDot = '<line class="gm-tether" x1="' + px(lng).toFixed(1) + '" y1="' + py(lat).toFixed(1) + '" x2="' + px(station[3]).toFixed(1) + '" y2="' + py(station[2]).toFixed(1) + '"/>' +
        '<circle class="gm-stn" cx="' + px(station[3]).toFixed(1) + '" cy="' + py(station[2]).toFixed(1) + '" r="4.5" fill="' + (C.LINE_COLORS[first] || '#888') + '"/>' +
        labelText(stationLabel, px(station[3]), Math.min(h - 26, py(station[2]) + 14), 'gm-stnname', 'middle');
    }

    var place = placeRead(l);
    var placeCue = place && !place.agrees && l.neighborhood
      ? 'Map place: ' + place.name + ' · post says ' + l.neighborhood
      : (home ? home.n : (l.neighborhood || 'Location'));
    var labels =
      labelText(shortMapLabel(placeCue, 42).toUpperCase(), 10, h - 10, 'gm-label') +
      labelText('≈5 MIN RADIUS', 10, 18, 'gm-walklabel') +
      labelText('≈10 MIN RADIUS', 10, 33, 'gm-walklabel') +
      (stn ? labelText('≈' + stn.mins + ' MIN TO ' + stn.name, w - 10, 18, 'gm-walklabel', 'end') : '');

    return '<svg class="gm" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Neighborhood map: ' + C.esc(placeCue) + (stn ? '; nearest station ' + C.esc(stn.name) + ', about ' + stn.mins + ' minutes walk' : '') + '">' +
      '<rect class="gm-water" width="' + w + '" height="' + h + '"/>' +
      polys + walkRings + stnDot +
      '<g class="gm-pin" transform="translate(' + px(lng).toFixed(1) + ' ' + py(lat).toFixed(1) + ')">' +
        '<circle class="gm-halo" r="16"/><circle class="gm-dot" r="7"/>' +
      '</g>' + labels + '</svg>';
  }

  /* Atlas land: every zone polygon, labelled at bbox centre. */
  function atlasLand(px, py, bounds) {
    if (!GEO.loaded) return null;
    var polys = '', labels = '';
    GEO.hoods.forEach(function (hd) {
      if (hd.bb.n < bounds.s || hd.bb.s > bounds.n || hd.bb.e < bounds.w || hd.bb.w > bounds.e) return;
      polys += '<path class="mp-nta" data-hood="' + C.esc(hd.n) + '" d="' + ringsPath(hd.r, function (x) { return px(x); }, function (y) { return py(y); }) + '"/>';
      var cx = (hd.bb.w + hd.bb.e) / 2, cy = (hd.bb.s + hd.bb.n) / 2;
      if (cx > bounds.w && cx < bounds.e && cy > bounds.s && cy < bounds.n) {
        var short = hd.n.replace(/\s*\(.*\)$/, '').split('-')[0];
        labels += '<text class="mp-ntaname" x="' + px(cx).toFixed(1) + '" y="' + py(cy).toFixed(1) + '">' + C.esc(short.toUpperCase()) + '</text>';
      }
    });
    return { polys: polys, labels: labels };
  }

  window.__VERAG = { ready: function () { return GEO.loaded; }, hoodAt: hoodAt, placeRead: placeRead, minimap: minimap, atlasLand: atlasLand };
})();
