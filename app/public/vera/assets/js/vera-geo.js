/* VERA geo — the real city. NYC DCP NTA2020 neighborhood polygons
   (official open data, simplified to 22m, vendored at assets/geo/hoods.json).
   Gives every listing an honest place: which polygon its coordinates truly
   sit in, and a per-listing minimap of that block of the city. */
(function () {
  'use strict';

  var C = window.__VERAC;
  var GEO = { loaded: false, hoods: [], byName: {} };

  fetch('./assets/geo/hoods.json', { cache: 'force-cache' })
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

  /* Per-listing minimap: the containing hood highlighted, neighbours dim,
     the apartment pinned, the nearest station named. viewBox w×h. */
  function minimap(l, w, h) {
    if (!GEO.loaded || l.latitude == null) return '';
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

    var stn = C.nearestStation(l);
    var stnDot = '';
    if (stn) {
      for (var i = 0; i < C.STATIONS.length; i++) {
        var s = C.STATIONS[i];
        if (s[0] === stn.name && s[2] > vb.s && s[2] < vb.n && s[3] > vb.w && s[3] < vb.e) {
          var first = String(s[1]).split(/\s+/)[0];
          stnDot = '<line class="gm-tether" x1="' + px(lng).toFixed(1) + '" y1="' + py(lat).toFixed(1) + '" x2="' + px(s[3]).toFixed(1) + '" y2="' + py(s[2]).toFixed(1) + '"/>' +
            '<circle class="gm-stn" cx="' + px(s[3]).toFixed(1) + '" cy="' + py(s[2]).toFixed(1) + '" r="4.5" fill="' + (C.LINE_COLORS[first] || '#888') + '"/>' +
            '<text class="gm-stnname" x="' + px(s[3]).toFixed(1) + '" y="' + (py(s[2]) + 14).toFixed(1) + '">' + C.esc(stn.name) + '</text>';
          break;
        }
      }
    }

    var label = home ? '<text class="gm-label" x="10" y="' + (h - 10) + '">' + C.esc(home.n.toUpperCase()) + '</text>' : '';

    return '<svg class="gm" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Neighborhood map: ' + C.esc(home ? home.n : 'location') + '">' +
      '<rect class="gm-water" width="' + w + '" height="' + h + '"/>' +
      polys + stnDot +
      '<g class="gm-pin" transform="translate(' + px(lng).toFixed(1) + ' ' + py(lat).toFixed(1) + ')">' +
        '<circle class="gm-halo" r="16"/><circle class="gm-dot" r="7"/>' +
      '</g>' + label + '</svg>';
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
