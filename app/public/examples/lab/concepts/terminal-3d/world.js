/* world.js — builds the scene FROM city.js data. No positions live here.
   Contract: consumes CITY/ART/ACCENTS; returns a `world` handle bag for systems/rig/ui.
   All windows are ONE InstancedMesh; per-window state lives in world.windows registry. */

import { CITY, ART, ACCENTS } from './city.js';

export function buildWorld(THREE, scene, opts) {
  const { rng, rand, pick, isMobile, reduceMotion, mergeGeometries, Reflector } = opts;
  const world = {
    rotGroup: new THREE.Group(),
    edgeMats: [], signMats: [], pulseTargets: [], orbSprites: [], treeCanopies: [],
    ripples: [], steamPuffs: [], builders: [], textRedraws: [], beaconSprites: [],
    windows: [], bizWindows: {}, doors: {}, renoRefs: null, reflectors: [],
    crownMat: null, crownLight: null, billboardBorder: null, floorMat: null,
    laneMap: {}, signalPosts: [], shopDoorWorld: [],
  };
  const G = world.rotGroup;
  G.rotation.y = Math.PI - 0.32;
  scene.add(G);

  /* ---------- shared textures ---------- */
  const orbTexture = (color) => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d');
    const rg = g.createRadialGradient(32, 32, 2, 32, 32, 32);
    rg.addColorStop(0, '#ffffff'); rg.addColorStop(0.3, color); rg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = rg; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  };
  world.orbTexture = orbTexture;
  const softDot = orbTexture('rgba(255,240,220,1)');
  world.softDot = softDot;

  function signTexture(text, accent, o = {}) {
    const c = document.createElement('canvas'); c.width = 384; c.height = 144;
    const g = c.getContext('2d');
    g.fillStyle = o.bg || '#14082c'; g.fillRect(0, 0, 384, 144);
    g.strokeStyle = accent; g.lineWidth = 7;
    g.shadowColor = accent; g.shadowBlur = o.dim ? 4 : 16;
    g.globalAlpha = o.dim ? 0.4 : 1;
    g.strokeRect(12, 12, 360, 120);
    g.font = `800 ${o.size || Math.max(ART.glyphMin / 2, 66)}px "Barlow Condensed", Arial, sans-serif`;
    g.textBaseline = 'middle';
    g.shadowBlur = o.dim ? 6 : 22;
    if (o.perLetter != null) {
      g.textAlign = 'left';
      const totalW = g.measureText(text).width;
      let cx = 192 - totalW / 2;
      for (let i = 0; i < text.length; i++) {
        const w = g.measureText(text[i]).width;
        g.fillStyle = i < o.perLetter ? ART.signFill : 'rgba(255,255,255,0.12)';
        g.shadowBlur = i < o.perLetter ? 22 : 0;
        g.fillText(text[i], cx, 78);
        cx += w;
      }
    } else {
      g.textAlign = 'center';
      g.fillStyle = o.dim ? 'rgba(255,255,255,0.5)' : ART.signFill;
      g.fillText(text, 192, 78, 340);
    }
    g.globalAlpha = 1;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  world.signTexture = signTexture;

  function displayTexture(kind, accent) {
    const c = document.createElement('canvas'); c.width = 256; c.height = 108;
    const g = c.getContext('2d');
    g.fillStyle = '#0d0620'; g.fillRect(0, 0, 256, 108);
    g.strokeStyle = accent; g.fillStyle = accent;
    g.lineWidth = 4; g.shadowColor = accent; g.shadowBlur = 12;
    g.lineJoin = 'round'; g.lineCap = 'round';
    if (kind === 'PIZZA') {
      g.beginPath(); g.moveTo(70, 26); g.lineTo(120, 82); g.lineTo(20, 82); g.closePath(); g.stroke();
      for (const [ax, ay, r] of [[64, 62, 5], [84, 74, 5], [48, 76, 4]]) { g.beginPath(); g.arc(ax, ay, r, 0, 7); g.fill(); }
      for (let b = 0; b < 3; b++) g.strokeRect(158 + b * 30, 40, 16, 42);
    } else if (kind === 'BODEGA') {
      g.strokeRect(24, 30, 208, 6); g.strokeRect(24, 66, 208, 6);
      for (let f = 0; f < 6; f++) { g.beginPath(); g.arc(48 + f * 34, 52, 8, 0, 7); g.fill(); }
      for (let f = 0; f < 6; f++) { g.beginPath(); g.arc(48 + f * 34, 88, 8, 0, 7); g.stroke(); }
    } else if (kind === 'CUTS') {
      g.strokeRect(38, 22, 26, 66);
      for (let p = 0; p < 4; p++) { g.beginPath(); g.moveTo(38, 34 + p * 16); g.lineTo(64, 26 + p * 16); g.stroke(); }
      g.beginPath(); g.moveTo(120, 30); g.lineTo(180, 84); g.moveTo(180, 30); g.lineTo(120, 84); g.stroke();
      g.beginPath(); g.arc(116, 88, 8, 0, 7); g.stroke();
      g.beginPath(); g.arc(184, 88, 8, 0, 7); g.stroke();
    } else if (kind === 'NAILS') {
      for (let b = 0; b < 4; b++) { g.strokeRect(40 + b * 34, 52, 16, 34); g.fillRect(43 + b * 34, 40, 10, 12); }
      g.beginPath(); g.moveTo(200, 78); g.bezierCurveTo(188, 52, 206, 40, 214, 58); g.bezierCurveTo(222, 40, 240, 52, 228, 78); g.closePath(); g.stroke();
    } else if (kind === 'CAFÉ') {
      g.strokeRect(60, 46, 44, 34);
      g.beginPath(); g.arc(104, 60, 10, -1.4, 1.4); g.stroke();
      for (let s = 0; s < 2; s++) { g.beginPath(); g.moveTo(72 + s * 16, 40); g.quadraticCurveTo(78 + s * 16, 30, 72 + s * 16, 20); g.stroke(); }
      g.beginPath(); g.arc(180, 66, 26, 3.4, 6.1); g.stroke();
    } else {
      g.beginPath(); g.arc(128, 78, 42, Math.PI, 0); g.closePath(); g.stroke();
      g.beginPath(); g.moveTo(92, 74); g.lineTo(104, 60); g.lineTo(116, 74); g.lineTo(128, 60); g.lineTo(140, 74); g.lineTo(152, 60); g.lineTo(164, 74); g.stroke();
      for (let d = 0; d < 5; d++) { g.beginPath(); g.arc(58 + d * 36, 22, 4, 0, 7); g.fill(); }
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  /* ---------- sky + skyline (per phase, landmark positions from data) ---------- */
  world.skyTexture = (phase) => {
    const P = ART.sky[phase];
    const c = document.createElement('canvas'); c.width = 2048; c.height = 512;
    const g = c.getContext('2d');
    const sky = g.createLinearGradient(0, 0, 0, 512);
    sky.addColorStop(0, P.stops[0]); sky.addColorStop(0.45, P.stops[1]);
    sky.addColorStop(0.78, P.stops[2]); sky.addColorStop(1, P.stops[3]);
    g.fillStyle = sky; g.fillRect(0, 0, 2048, 512);
    if (P.stars > 0) {
      for (let i = 0; i < 220 * P.stars; i++) {
        const y = Math.pow(rng(), 1.5) * 300;
        const tint = ['214,236,255', '255,214,244', '255,238,204'][i % 3];
        g.fillStyle = `rgba(${tint},${(rand(0.2, 0.85) * P.stars).toFixed(2)})`;
        g.beginPath(); g.arc(rand(0, 2048), y, rand(0.5, 1.5), 0, 7); g.fill();
      }
    }
    if (P.sun) {
      const [sx, sy, sr, sa] = P.sun;
      const sg = g.createRadialGradient(sx, sy, 3, sx, sy, sr * 7);
      sg.addColorStop(0, `rgba(255,214,140,${0.6 * sa})`);
      sg.addColorStop(0.3, `rgba(255,160,110,${0.3 * sa})`);
      sg.addColorStop(1, 'rgba(255,160,110,0)');
      g.fillStyle = sg; g.fillRect(sx - sr * 8, sy - sr * 8, sr * 16, sr * 16);
      g.fillStyle = `rgba(255,236,196,${sa})`;
      g.beginPath(); g.arc(sx, sy, sr, 0, 7); g.fill();
      g.fillStyle = 'rgba(90,26,120,0.5)';
      for (let i = 0; i < 4; i++) g.fillRect(sx - 40 - i * 12, sy - 7 + i * 7, 80 + i * 24, 2 + i);
    }
    const grid = (bx, by, bw, bh, cols, rows) => {
      g.fillStyle = P.skyC;
      g.fillRect(bx, by - bh, bw, bh + 60);
      const cw = bw / cols, ch = bh / rows;
      for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
        if (((r * 31 + k * 17 + bx) % 97) / 97 < P.winR) {
          g.fillStyle = `rgba(${P.winC},0.5)`;
          g.fillRect(bx + k * cw + 2, by - bh + r * ch + 2, Math.max(2, cw - 4), Math.max(2, ch - 4));
        }
      }
    };
    const seq = [46, 72, 58, 88, 64, 96, 64, 88, 58, 72, 46];
    let bx = 20;
    for (let i = 0; i < 26; i++) {
      const h = seq[i % seq.length];
      const [b0, b1] = ART.skyline.bridge;
      if (!(bx > b0 - 10 && bx < b0 + b1 + 30) && !(bx > ART.skyline.empire - 8 && bx < ART.skyline.empire + 92) && !(bx > ART.skyline.chrysler - 8 && bx < ART.skyline.chrysler + 82)) {
        grid(bx, 452, 58, h, 5, Math.max(3, Math.round(h / 9)));
      }
      bx += 72;
    }
    // bridge
    {
      const [bx0, bw] = ART.skyline.bridge;
      const deckY = 430, towH = 96;
      g.fillStyle = P.skyC;
      g.fillRect(bx0, deckY, bw, 7);
      const t1 = bx0 + bw * 0.24, t2 = bx0 + bw * 0.76, topY = deckY - towH + 4;
      for (const tx of [t1, t2]) { g.fillRect(tx - 5, deckY - towH, 10, towH + 30); g.fillRect(tx - 9, deckY - towH + 18, 18, 8); }
      g.strokeStyle = P.skyC; g.lineWidth = 2.5;
      g.beginPath(); g.moveTo(bx0, deckY); g.quadraticCurveTo((bx0 + t1) / 2, deckY - 8, t1, topY); g.stroke();
      g.beginPath(); g.moveTo(t1, topY); g.quadraticCurveTo((t1 + t2) / 2, deckY + 14, t2, topY); g.stroke();
      g.beginPath(); g.moveTo(t2, topY); g.quadraticCurveTo((t2 + bx0 + bw) / 2, deckY - 8, bx0 + bw, deckY); g.stroke();
      g.fillStyle = `rgba(${P.winC},0.95)`;
      for (let i = 0; i <= 22; i++) {
        const k = i / 22;
        let lx, ly;
        if (k < 0.24) { const f = k / 0.24; lx = bx0 + (t1 - bx0) * f; ly = deckY + (topY - deckY) * f * f - 6 * f * (1 - f); }
        else if (k < 0.76) { const f = (k - 0.24) / 0.52; lx = t1 + (t2 - t1) * f; ly = topY + (deckY + 12 - topY) * (4 * f * (1 - f)); }
        else { const f = (k - 0.76) / 0.24; lx = t2 + (bx0 + bw - t2) * f; ly = topY + (deckY - topY) * f * f; }
        g.fillRect(lx - 1, ly - 1, 2.4, 2.4);
      }
    }
    // empire + chrysler
    {
      const bx1 = ART.skyline.empire;
      grid(bx1, 452, 84, 92, 7, 11); grid(bx1 + 14, 360, 56, 46, 5, 6); grid(bx1 + 28, 314, 28, 26, 3, 3);
      g.fillStyle = P.skyC; g.fillRect(bx1 + 39, 268, 6, 22);
      g.fillStyle = `rgba(${P.winC},0.9)`; g.fillRect(bx1 + 40, 262, 4, 6);
      const bx2 = ART.skyline.chrysler;
      grid(bx2, 452, 72, 96, 6, 12);
      g.fillStyle = P.skyC;
      for (let a = 0; a < 5; a++) g.fillRect(bx2 + 8 + a * 6, 356 - a * 14, 56 - a * 12, 16);
      g.fillRect(bx2 + 33, 282, 6, 18);
      g.fillStyle = `rgba(${P.winC},0.8)`;
      for (let a = 0; a < 4; a++) g.fillRect(bx2 + 14 + a * 6, 352 - a * 14, 3, 3);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };

  /* ---------- ground texture painted from road/sidewalk data ---------- */
  function groundTexture() {
    const c = document.createElement('canvas'); c.width = 2048; c.height = 1408;
    const g = c.getContext('2d');
    const X = (wx) => (wx + 13) / 26 * 2048;
    const Y = (wz) => (wz + 9) / 18 * 1408;
    const W = (wu) => wu / 26 * 2048;
    const H = (wu) => wu / 18 * 1408;
    g.fillStyle = '#1c0e38'; g.fillRect(0, 0, 2048, 1408);
    g.strokeStyle = 'rgba(122,84,214,0.22)'; g.lineWidth = 1;
    for (let u = -13; u <= 13; u++) { g.beginPath(); g.moveTo(X(u), 0); g.lineTo(X(u), 1408); g.stroke(); }
    for (let u = -9; u <= 9; u++) { g.beginPath(); g.moveTo(0, Y(u)); g.lineTo(2048, Y(u)); g.stroke(); }
    for (const b of CITY.sidewalkBands) {
      g.fillStyle = '#2a1854';
      g.fillRect(0, Y(b.z0), 2048, Y(b.z1) - Y(b.z0));
      g.strokeStyle = 'rgba(8,4,20,0.5)'; g.lineWidth = 2;
      for (let u = -13; u <= 13; u++) { g.beginPath(); g.moveTo(X(u), Y(b.z0)); g.lineTo(X(u), Y(b.z1)); g.stroke(); }
    }
    g.fillStyle = '#120822';
    for (const b of CITY.roads.avenueBands) g.fillRect(0, Y(b.z0), 2048, H(b.z1 - b.z0));
    for (const b of CITY.roads.crossBands) g.fillRect(X(b.x0), 0, W(b.x1 - b.x0), 1408);
    g.fillStyle = 'rgba(51,230,255,0.45)';
    for (const wz of CITY.roads.dashRows) {
      for (let px = 0; px < 2048; px += 46) {
        const wx = px / 2048 * 26 - 13;
        if (CITY.roads.crossBands.some((b) => wx > b.x0 - 0.4 && wx < b.x1 + 0.4)) continue;
        g.fillRect(px, Y(wz) - 2, 26, 4);
      }
    }
    for (const wx of CITY.roads.dashCols) {
      for (let py = 0; py < 1408; py += 46) {
        const wz = py / 1408 * 18 - 9;
        if (CITY.roads.avenueBands.some((b) => wz > b.z0 - 0.4 && wz < b.z1 + 0.4)) continue;
        g.fillRect(X(wx) - 2, py, 4, 26);
      }
    }
    g.fillStyle = 'rgba(240,240,255,0.4)';
    for (const b of CITY.roads.avenueBands) { g.fillRect(0, Y(b.z0) - 1.5, 2048, 3); g.fillRect(0, Y(b.z1) - 1.5, 2048, 3); }
    for (const b of CITY.roads.crossBands) { g.fillRect(X(b.x0) - 1.5, 0, 3, 1408); g.fillRect(X(b.x1) - 1.5, 0, 3, 1408); }
    const zebraV = (wx, wz0, wz1) => {
      g.fillStyle = 'rgba(240,240,255,0.75)';
      for (let i = 0; i < 6; i++) g.fillRect(X(wx) - 34 + i * 12.5, Y(wz0) + 5, 7, Y(wz1) - Y(wz0) - 10);
    };
    const zebraH = (wz, wx0, wx1) => {
      g.fillStyle = 'rgba(240,240,255,0.75)';
      for (let i = 0; i < 6; i++) g.fillRect(X(wx0) + 5, Y(wz) - 30 + i * 11, X(wx1) - X(wx0) - 10, 6);
    };
    for (const b of CITY.roads.crossBands) {
      const ix = (b.x0 + b.x1) / 2;
      for (const av of CITY.roads.avenueBands) zebraV(ix, av.z0, av.z1);
    }
    for (const av of CITY.roads.avenueBands) {
      const mid = (av.z0 + av.z1) / 2;
      for (const b of CITY.roads.crossBands) zebraH(mid, b.x0, b.x1);
    }
    g.fillStyle = 'rgba(240,240,255,0.85)';
    for (const b of CITY.roads.crossBands) {
      const ix = (b.x0 + b.x1) / 2;
      g.fillRect(X(ix - 1.6) - 2, Y(CITY.roads.avenueBands[0].z0), 4, H(2.1));
      g.fillRect(X(ix + 1.6) - 2, Y(CITY.roads.avenueBands[1].z0), 4, H(1.7));
    }
    const { x, z, r } = CITY.plaza;
    const px = X(x), py = Y(z), pr = W(r);
    g.fillStyle = '#241245';
    g.beginPath(); g.arc(px, py, pr, 0, 7); g.fill();
    g.strokeStyle = 'rgba(51,230,255,0.35)'; g.lineWidth = 3;
    for (const rr of [0.35, 0.65, 0.95]) { g.beginPath(); g.arc(px, py, pr * rr, 0, 7); g.stroke(); }
    g.strokeStyle = 'rgba(51,230,255,0.18)';
    for (let a = 0; a < 12; a++) { g.beginPath(); g.moveTo(px, py); g.lineTo(px + Math.cos(a / 12 * 6.28) * pr, py + Math.sin(a / 12 * 6.28) * pr); g.stroke(); }
    const pk = CITY.park;
    g.fillStyle = '#0f2e1c';
    g.fillRect(X(pk.x0), Y(pk.z0), W(pk.w), H(pk.d));
    g.strokeStyle = 'rgba(157,255,62,0.4)'; g.lineWidth = 3;
    g.strokeRect(X(pk.x0), Y(pk.z0), W(pk.w), H(pk.d));
    g.fillStyle = 'rgba(240,240,255,0.15)';
    g.fillRect(X(pk.x0), Y(pk.z0 + 0.95), W(pk.w), H(0.35));
    g.fillRect(X(pk.x0 + 1.7), Y(pk.z0), W(0.35), H(pk.d));
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }

  /* ---------- harbor: the world sits in water, horizon fades ---------- */
  {
    const water = new THREE.Mesh(
      new THREE.CircleGeometry(90, 48),
      new THREE.MeshStandardMaterial({ color: '#0a1230', roughness: 0.18, metalness: 0.55 })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.62;
    scene.add(water);
    world.waterMat = water.material;
    // mist ring blends the slab edge into the water
    const mistC = document.createElement('canvas');
    mistC.width = 256; mistC.height = 64;
    const mg = mistC.getContext('2d');
    const grad = mg.createLinearGradient(0, 0, 0, 64);
    grad.addColorStop(0, 'rgba(44,22,86,0)');
    grad.addColorStop(1, 'rgba(24,12,50,0.85)');
    mg.fillStyle = grad; mg.fillRect(0, 0, 256, 64);
    const mistT = new THREE.CanvasTexture(mistC);
    const mist = new THREE.Mesh(
      new THREE.CylinderGeometry(26, 30, 2.4, 48, 1, true),
      new THREE.MeshBasicMaterial({ map: mistT, transparent: true, side: THREE.DoubleSide, depthWrite: false })
    );
    mist.position.y = -0.9;
    scene.add(mist);
  }

  /* ---------- slab + floor + reflectors ---------- */
  {
    const tex = groundTexture();
    world.floorMat = new THREE.MeshStandardMaterial({
      color: '#2a1650', map: tex, emissive: '#ffffff', emissiveMap: tex,
      emissiveIntensity: 0.72, roughness: 0.65, metalness: 0.15,
    });
    const floor = new THREE.Mesh(new THREE.BoxGeometry(CITY.slab.w, 0.3, CITY.slab.d), world.floorMat);
    floor.position.y = -0.15;
    G.add(floor);
    world.pulseTargets.push({ mat: world.floorMat, base: 0.72, speed: 0.7, phase: 0, kind: 'grid' });
    const under = new THREE.Mesh(new THREE.BoxGeometry(CITY.slab.w, 1.1, CITY.slab.d), new THREE.MeshStandardMaterial({ color: '#170b30', roughness: 1 }));
    under.position.y = -0.86;
    G.add(under);
    const rimMat = new THREE.MeshBasicMaterial({ color: ACCENTS.cyan, transparent: true, opacity: 1 });
    world.edgeMats.push(rimMat);
    const mk = (w, d, x, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, d), rimMat); m.position.set(x, -0.02, z); G.add(m); };
    mk(CITY.slab.w + 0.08, 0.1, 0, CITY.slab.d / 2 + 0.02);
    mk(CITY.slab.w + 0.08, 0.1, 0, -CITY.slab.d / 2 - 0.02);
    mk(0.1, CITY.slab.d + 0.08, CITY.slab.w / 2 + 0.02, 0);
    mk(0.1, CITY.slab.d + 0.08, -CITY.slab.w / 2 - 0.02, 0);

    if (!isMobile && Reflector) {
      for (const b of CITY.roads.avenueBands) {
        const refl = new Reflector(new THREE.PlaneGeometry(CITY.slab.w, b.z1 - b.z0), {
          textureWidth: 512, textureHeight: 256, color: 0x889ac0, clipBias: 0.003,
        });
        refl.rotation.x = -Math.PI / 2;
        refl.position.set(0, 0.012, (b.z0 + b.z1) / 2);
        refl.visible = false;
        G.add(refl);
        world.reflectors.push(refl);
      }
    }
  }

  /* ---------- solid buildings with real detail (no inverted shells) ---------- */
  const winSlots = [];
  function facadeWindows(bx, bz, bry, w, h, d, y0, biz, dark, dense = 0.62) {
    const cols = Math.max(2, Math.round(w / dense));
    const rows = Math.max(2, Math.round(h / 0.6));
    const colsD = Math.max(2, Math.round(d / dense));
    const faces = [
      { n: [0, 0, 1], half: d / 2, across: w, cols, ry: 0 },
      { n: [0, 0, -1], half: d / 2, across: w, cols, ry: Math.PI },
      { n: [1, 0, 0], half: w / 2, across: d, cols: colsD, ry: Math.PI / 2 },
      { n: [-1, 0, 0], half: w / 2, across: d, cols: colsD, ry: -Math.PI / 2 },
    ];
    const cosr = Math.cos(bry), sinr = Math.sin(bry);
    for (const f of faces) {
      for (let r = 0; r < rows; r++) {
        for (let k = 0; k < f.cols; k++) {
          const a = -f.across / 2 + (k + 0.5) * (f.across / f.cols);
          const ly = y0 + 0.55 + (r + 0.35) * ((h - 1.0) / rows);
          let lx, lz;
          if (f.n[2] !== 0) { lx = a; lz = f.n[2] * (f.half + 0.045); }
          else { lx = f.n[0] * (f.half + 0.045); lz = a; }
          const wx = bx + lx * cosr + lz * sinr;
          const wz = bz - lx * sinr + lz * cosr;
          winSlots.push({ x: wx, y: ly, z: wz, ry: f.ry + bry, sx: 0.34, sy: 0.4, biz, dark });
        }
      }
    }
  }

  const bodyMat = new THREE.MeshStandardMaterial({ color: '#2b1a52', roughness: 0.6, metalness: 0.2 });
  const bodyMatDark = new THREE.MeshStandardMaterial({ color: '#221542', roughness: 0.65, metalness: 0.18 });
  const trimMat = new THREE.MeshStandardMaterial({ color: '#3a2a66', roughness: 0.55, metalness: 0.3 });

  function addDetail(g2, w, h, d, accent, { floors = true, pilasters = true, cornice = true } = {}) {
    const parts = [];
    if (cornice) {
      const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.24, 0.16, d + 0.24), trimMat);
      cap.position.y = h + 0.08;
      g2.add(cap);
      const capGlow = new THREE.Mesh(new THREE.BoxGeometry(w - 0.3, 0.03, d - 0.3), new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.22 }));
      capGlow.position.y = h + 0.18;
      g2.add(capGlow);
    }
    if (floors) {
      const nF = Math.max(2, Math.round(h / 1.3));
      for (let f = 1; f < nF; f++) {
        parts.push(((m) => { m.position.y = (h / nF) * f; return m; })(new THREE.Mesh(new THREE.BoxGeometry(w + 0.08, 0.055, d + 0.08), trimMat)));
      }
    }
    if (pilasters) {
      for (const [px, pz] of [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]]) {
        parts.push(((m) => { m.position.set(px, h / 2, pz); return m; })(new THREE.Mesh(new THREE.BoxGeometry(0.14, h, 0.14), trimMat)));
      }
    }
    if (parts.length) {
      const geos = parts.map((p) => { p.updateMatrix(); return p.geometry.clone().applyMatrix4(p.matrix); });
      const merged = new THREE.Mesh(mergeGeometries(geos, false), trimMat);
      g2.add(merged);
      geos.forEach((g3) => g3.dispose());
    }
  }

  function baseStorefront(g2, w, d, accent) {
    const band = new THREE.Mesh(new THREE.BoxGeometry(w + 0.06, 1.0, d + 0.06), bodyMatDark);
    band.position.y = 0.5;
    g2.add(band);
    const glow = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.05, d + 0.1), new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.8 }));
    glow.position.y = 1.02;
    g2.add(glow);
  }

  function roofClutter(g2, w, h, d, accent, waterTower) {
    const items = Math.max(2, Math.round(w * d / 9));
    for (let i = 0; i < items; i++) {
      const bh = rand(0.2, 0.45);
      const box = new THREE.Mesh(new THREE.BoxGeometry(rand(0.3, 0.7), bh, rand(0.3, 0.6)), new THREE.MeshStandardMaterial({ color: '#3a2766', roughness: 0.8 }));
      box.position.set(rand(-w / 2 + 0.6, w / 2 - 0.6), h + bh / 2, rand(-d / 2 + 0.6, d / 2 - 0.6));
      g2.add(box);
    }
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, rand(0.7, 1.2), 5), new THREE.MeshBasicMaterial({ color: '#8a8ab0' }));
    ant.position.set(rand(-w / 3, w / 3), h + 0.5, rand(-d / 3, d / 3));
    g2.add(ant);
    if (waterTower) {
      const wt = new THREE.Group();
      for (const [lx, lz] of [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.4, 0.05), new THREE.MeshStandardMaterial({ color: '#1c1240', roughness: 0.7 }));
        leg.position.set(lx, 0.2, lz);
        wt.add(leg);
      }
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.62, 16), new THREE.MeshStandardMaterial({ color: '#241a4a', roughness: 0.7, metalness: 0.2 }));
      tank.position.y = 0.71; wt.add(tank);
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.3, 16), new THREE.MeshStandardMaterial({ color: '#180f33', roughness: 0.8 }));
      cone.position.y = 1.17; wt.add(cone);
      const ringMat = new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.85 });
      const ring = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.345, 0.345, 0.02, 16)), ringMat);
      ring.position.y = 0.86; wt.add(ring);
      world.edgeMats.push(ringMat);
      wt.position.set(-w / 2 + 0.8, h, -d / 2 + 0.8);
      g2.add(wt);
    }
  }

  function edgesFor(g2, w, h, d, accent, y0 = 0) {
    const eMat = new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.95 });
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), eMat);
    e.position.y = y0 + h / 2;
    g2.add(e);
    world.edgeMats.push(eMat);
    return eMat;
  }

  function fireEscapeLines(g2, w, h, floors, accent, zOff) {
    const pts = [];
    const fh = h / floors;
    for (let f = 1; f < floors; f++) {
      const y = f * fh;
      const dir = f % 2 === 0 ? 1 : -1;
      pts.push(new THREE.Vector3(-w / 2 + 0.25, y, zOff), new THREE.Vector3(w / 2 - 0.25, y, zOff));
      pts.push(new THREE.Vector3(dir * (w / 2 - 0.3), y, zOff), new THREE.Vector3(-dir * (w / 2 - 0.3), y + fh, zOff));
    }
    const mat = new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.5 });
    g2.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), mat));
    world.edgeMats.push(mat);
  }

  const solid = (w, h, d, mat) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.y = h / 2;
    return m;
  };

  for (const b of CITY.buildings) {
    const g2 = new THREE.Group();
    const dark = b.arch !== 'tower' && rng() < 0.22;
    if (b.arch === 'tower') {
      const tiers = [
        { w: b.w, h: 7.5, d: b.d, y: 0 },
        { w: b.w - 1.2, h: 4.6, d: b.d - 1.1, y: 7.5 },
        { w: b.w - 2.4, h: 3.4, d: b.d - 2.3, y: 12.1 },
      ];
      for (const tr of tiers) {
        const body = solid(tr.w, tr.h, tr.d, bodyMat);
        body.position.y = tr.y + tr.h / 2;
        g2.add(body);
        const dg = new THREE.Group();
        dg.position.y = tr.y;
        addDetail(dg, tr.w, tr.h, tr.d, b.accent);
        g2.add(dg);
        edgesFor(g2, tr.w, tr.h, tr.d, b.accent, tr.y);
        facadeWindows(b.x, b.z, b.ry || 0, tr.w, tr.h, tr.d, tr.y, b.biz, false, 0.52);
      }
      baseStorefront(g2, tiers[0].w, tiers[0].d, b.accent);
      for (const sx of [-b.w / 2 + 0.6, b.w / 2 - 0.6]) {
        const strip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 7.0, 0.1), new THREE.MeshBasicMaterial({ color: ACCENTS.cyan, transparent: true, opacity: 0.9 }));
        strip.position.set(sx, 3.7, -tiers[0].d / 2 - 0.06);
        g2.add(strip);
      }
      world.crownMat = new THREE.MeshBasicMaterial({ color: b.accent, transparent: true, opacity: 0.95 });
      const crown = new THREE.Mesh(new THREE.BoxGeometry(tiers[2].w + 0.3, 0.3, tiers[2].d + 0.3), world.crownMat);
      crown.position.y = 15.65;
      g2.add(crown);
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 6), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
      mast.position.y = 16.6;
      g2.add(mast);
      world.crownLight = new THREE.PointLight(b.accent, 6, 26, 2);
      world.crownLight.position.y = 15.8;
      g2.add(world.crownLight);
      if (b.billboard) {
        const drawBillboard = () => {
          const c = document.createElement('canvas'); c.width = 640; c.height = 640;
          const g3 = c.getContext('2d');
          g3.fillStyle = '#12082a'; g3.fillRect(0, 0, 640, 640);
          g3.textAlign = 'center'; g3.textBaseline = 'middle';
          const line = (txt, weight, maxSize, maxW, y, glow, fill) => {
            let size = maxSize;
            g3.font = `${weight} ${size}px "Barlow Condensed", Arial, sans-serif`;
            while (g3.measureText(txt).width > maxW && size > 20) { size -= 2; g3.font = `${weight} ${size}px "Barlow Condensed", Arial, sans-serif`; }
            g3.shadowColor = glow; g3.shadowBlur = 14;
            g3.fillStyle = fill;
            g3.fillText(txt, 320, y, maxW);
          };
          line('LITTLE', 800, 224, 560, 152, '#ff3ec8', '#f0e6ff');
          line('FIGHT', 800, 224, 560, 344, '#33e6ff', '#f0e6ff');
          line('NEW YORK · NEW YORK', 700, 58, 560, 540, '#ffb02e', '#e8d9ff');
          const t = new THREE.CanvasTexture(c);
          t.colorSpace = THREE.SRGBColorSpace;
          return t;
        };
        const bbMat = new THREE.MeshBasicMaterial({ map: drawBillboard(), transparent: true });
        const bb = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), bbMat);
        bb.position.set(0, 9.7, -(tiers[1].d / 2) - 0.09);
        bb.rotation.y = Math.PI;
        g2.add(bb);
        world.textRedraws.push(() => { bbMat.map = drawBillboard(); bbMat.needsUpdate = true; });
        world.billboardBorder = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(2.74, 2.74)), new THREE.LineBasicMaterial({ color: ACCENTS.magenta, transparent: true, opacity: 0.95 }));
        world.billboardBorder.position.set(0, 9.7, -(tiers[1].d / 2) - 0.095);
        g2.add(world.billboardBorder);
        const bbRear = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), bbMat);
        bbRear.position.set(0, 9.7, (tiers[1].d / 2) + 0.09);
        g2.add(bbRear);
        const bbRearBorder = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(2.74, 2.74)), world.billboardBorder.material);
        bbRearBorder.position.set(0, 9.7, (tiers[1].d / 2) + 0.095);
        g2.add(bbRearBorder);
      }
      roofClutter(g2, tiers[2].w, 15.5, tiers[2].d, b.accent, false);
    } else if (b.arch === 'warehouse') {
      const body = solid(b.w, b.h, b.d, dark ? bodyMatDark : bodyMat);
      g2.add(body);
      addDetail(g2, b.w, b.h, b.d, b.accent, { floors: false, cornice: false });
      const lip = new THREE.Mesh(new THREE.BoxGeometry(b.w + 0.18, 0.12, b.d + 0.18), trimMat);
      lip.position.y = b.h + 0.06;
      g2.add(lip);
      edgesFor(g2, b.w, b.h, b.d, b.accent);
      const doorSlit = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.5), new THREE.MeshBasicMaterial({ color: b.accent, transparent: true, opacity: 0.35 }));
      doorSlit.position.set(0, 0.78, -b.d / 2 - 0.03);
      doorSlit.rotation.y = Math.PI;
      g2.add(doorSlit);
      roofClutter(g2, b.w, b.h, b.d, b.accent, !!b.waterTower);
      facadeWindows(b.x, b.z, 0, b.w, b.h - 0.8, b.d, 0.7, b.biz, dark, 0.8);
    } else {
      const body = solid(b.w, b.h, b.d, dark ? bodyMatDark : bodyMat);
      g2.add(body);
      addDetail(g2, b.w, b.h, b.d, b.accent);
      baseStorefront(g2, b.w, b.d, b.accent);
      edgesFor(g2, b.w, b.h, b.d, b.accent);
      facadeWindows(b.x, b.z, b.ry || 0, b.w, b.h, b.d, 0, b.biz, dark, 0.6);
      if (b.arch === 'deco') {
        for (let sc = 0; sc < 3; sc++) {
          const cap = new THREE.Mesh(new THREE.BoxGeometry(b.w - 0.5 - sc * 0.5, 0.28, b.d - 0.5 - sc * 0.5), trimMat);
          cap.position.y = b.h + 0.14 + sc * 0.28;
          g2.add(cap);
        }
        const capGlow = new THREE.Mesh(new THREE.BoxGeometry(b.w - 1.7, 0.1, b.d - 1.7), new THREE.MeshBasicMaterial({ color: b.accent, transparent: true, opacity: 0.9 }));
        capGlow.position.y = b.h + 0.95;
        g2.add(capGlow);
      }
      roofClutter(g2, b.w, b.h, b.d, b.accent, !!b.waterTower);
      if (b.fireEscape) fireEscapeLines(g2, b.w, b.h, Math.round(b.h / 1.3), b.accent, -b.d / 2 - 0.03);
    }
    g2.position.set(b.x, 0, b.z);
    g2.rotation.y = b.ry || 0;
    G.add(g2);
    world.builders.push({ group: g2, order: b.arch === 'tower' ? 4 : b.arch === 'warehouse' ? 1 : 2 });
  }

  /* ---------- storefront strips: faces flush to the sidewalk line, facing the avenue ---------- */
  const shopsSorted = CITY.shops.slice().sort((a, b2) => a.biz - b2.biz);
  world.shopDoorWorld = [];
  for (const s of shopsSorted) {
    const shop = CITY.businesses[s.biz];
    const g2 = new THREE.Group();
    const h = shop.renovation ? 2.6 : 2.3 + (s.biz % 3) * 0.25;
    const front = -s.d / 2; // south face = storefront, ON the lot line
    const body = solid(s.w, h, s.d, new THREE.MeshStandardMaterial({ color: shop.renovation ? '#221639' : '#2e1c56', roughness: 0.6, metalness: 0.2 }));
    g2.add(body);
    const eMat = edgesFor(g2, s.w, h, s.d, shop.accent);
    if (shop.renovation) eMat.opacity = 0.18;
    const cap = new THREE.Mesh(new THREE.BoxGeometry(s.w + 0.14, 0.12, s.d + 0.14), trimMat);
    cap.position.y = h + 0.06;
    g2.add(cap);
    const frontMat = new THREE.MeshBasicMaterial({ map: displayTexture(shop.name, shop.accent), transparent: true, opacity: shop.renovation ? 0 : 0.92 });
    const disp = new THREE.Mesh(new THREE.PlaneGeometry(s.w - 0.3, 0.8), frontMat);
    disp.position.set(0, 0.66, front - 0.02);
    disp.rotation.y = Math.PI;
    g2.add(disp);
    const doorMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: shop.renovation ? 0.06 : 0.55 });
    const door = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 1.15), doorMat);
    door.position.set(s.w / 2 - 0.35, 0.58, front - 0.021);
    door.rotation.y = Math.PI;
    g2.add(door);
    const awn = new THREE.Mesh(new THREE.BoxGeometry(s.w - 0.2, 0.05, 0.55), new THREE.MeshStandardMaterial({ color: '#241245', roughness: 0.8 }));
    awn.position.set(0, 1.32, front - 0.28);
    awn.rotation.x = -0.18;
    g2.add(awn);
    const awnEdgeMat = new THREE.MeshBasicMaterial({ color: shop.accent, transparent: true, opacity: shop.renovation ? 0.1 : 1 });
    const awnEdge = new THREE.Mesh(new THREE.BoxGeometry(s.w - 0.2, 0.04, 0.05), awnEdgeMat);
    awnEdge.position.set(0, 1.28, front - 0.55);
    g2.add(awnEdge);
    const startTex = shop.renovation ? signTexture('FOR LEASE', '#8a8aa0', { dim: true, size: 46 }) : signTexture(shop.name, shop.accent);
    const signMat = new THREE.MeshBasicMaterial({ map: startTex, transparent: true });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(1.6, s.w), 0.6), signMat);
    sign.position.set(0, h + 0.4, front + 0.16);
    sign.rotation.y = Math.PI;
    g2.add(sign);
    const signBack = new THREE.Mesh(new THREE.BoxGeometry(Math.min(1.68, s.w + 0.06), 0.68, 0.1), new THREE.MeshStandardMaterial({ color: '#180c30', roughness: 0.7 }));
    signBack.position.set(0, h + 0.4, front + 0.23);
    g2.add(signBack);
    const signRear = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(1.6, s.w), 0.6), signMat);
    signRear.position.set(0, h + 0.4, front + 0.3);
    g2.add(signRear);
    world.signMats.push({ mat: signMat, t: rand(3, 10), busy: 0, dead: !!shop.renovation, name: shop.name, accent: shop.accent });
    g2.position.set(s.x, 0, s.z);
    G.add(g2);
    world.builders.push({ group: g2, order: 0 });
    world.shopDoorWorld.push(new THREE.Vector3(s.x + s.w / 2 - 0.35, 0.16, s.z - s.d / 2 - 0.25));
    facadeWindows(s.x, s.z, 0, s.w - 0.1, h - 1.15, s.d, 1.2, s.biz, shop.renovation, 0.55);
    if (shop.renovation) {
      const scafMat = new THREE.LineBasicMaterial({ color: ACCENTS.cyan, transparent: true, opacity: 0 });
      const scaf = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(s.w + 0.3, h + 0.7, s.d + 0.4, 2, 3, 2)), scafMat);
      scaf.position.y = (h + 0.7) / 2;
      scaf.scale.y = 0.001;
      g2.add(scaf);
      world.renoRefs = { group: g2, bodyMat: body.material, edge: eMat, front: frontMat, doorMat, awnEdge: awnEdgeMat, sign: signMat, signRec: world.signMats[world.signMats.length - 1], scaf, scafMat, accent: shop.accent, h };
    }
  }

  /* windows instanced mesh (built after all slots collected) */
  {
    const geo = new THREE.BoxGeometry(1, 1, 0.07);
    const mat = new THREE.MeshBasicMaterial();
    const im = new THREE.InstancedMesh(geo, mat, winSlots.length);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), pos = new THREE.Vector3(), eu = new THREE.Euler();
    const cOff = new THREE.Color('#141031');
    winSlots.forEach((wsl, i) => {
      eu.set(0, wsl.ry, 0);
      q.setFromEuler(eu);
      pos.set(wsl.x, wsl.y, wsl.z);
      sc.set(wsl.sx, wsl.sy, 1);
      m4.compose(pos, q, sc);
      im.setMatrixAt(i, m4);
      im.setColorAt(i, cOff);
      world.windows.push({ i, biz: wsl.biz, dark: wsl.dark, lit: false, warm: rng() > 0.1 });
      (world.bizWindows[wsl.biz] = world.bizWindows[wsl.biz] || []).push(world.windows[world.windows.length - 1]);
    });
    im.instanceColor.needsUpdate = true;
    G.add(im);
    world.windowsIM = im;
  }

  /* ---------- props from data (ported builders) ---------- */
  const addBuilder = (g2, order = 2) => { G.add(g2); world.builders.push({ group: g2, order }); };

  for (const p of CITY.props) {
    if (p.type === 'subway') {
      const g2 = new THREE.Group();
      const railMat = new THREE.MeshBasicMaterial({ color: '#2fbf71', transparent: true, opacity: 0.9 });
      for (const rz of [-0.42, 0.42]) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.05, 0.05), railMat);
        rail.position.set(0, 0.62, rz);
        g2.add(rail);
        for (let k = 0; k < 4; k++) {
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.62, 0.04), railMat);
          post.position.set(-0.78 + k * 0.52, 0.31, rz);
          g2.add(post);
        }
      }
      const ramp = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.9), new THREE.MeshBasicMaterial({ color: '#07040f' }));
      ramp.rotation.x = -Math.PI / 2 + 0.5;
      ramp.position.set(0, 0.28, 0);
      g2.add(ramp);
      const globe = new THREE.Sprite(new THREE.SpriteMaterial({ map: orbTexture('#2fbf71'), transparent: true, opacity: 0.95, depthWrite: false }));
      globe.scale.setScalar(0.5);
      globe.position.set(-1.05, 1.15, 0);
      g2.add(globe);
      const gp = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 6), new THREE.MeshStandardMaterial({ color: '#143a28', roughness: 0.6 }));
      gp.position.set(-1.05, 0.5, 0);
      g2.add(gp);
      g2.position.set(p.x, 0, p.z);
      addBuilder(g2);
    } else if (p.type === 'newsstand') {
      const g2 = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.0, 0.85), new THREE.MeshStandardMaterial({ color: '#241a4a', roughness: 0.7 }));
      body.position.y = 0.5;
      g2.add(body);
      const frontLit = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.55), new THREE.MeshBasicMaterial({ color: '#ffd9a0', transparent: true, opacity: 0.85 }));
      frontLit.position.set(0, 0.55, 0.43);
      g2.add(frontLit);
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.15, 1.0, 0.85)), new THREE.LineBasicMaterial({ color: ACCENTS.cyan, transparent: true, opacity: 0.8 }));
      e.position.y = 0.5;
      g2.add(e);
      g2.position.set(p.x, 0, p.z);
      g2.rotation.y = p.ry || 0;
      addBuilder(g2);
    } else if (p.type === 'steam') {
      const grate = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.02, 0.5), new THREE.MeshStandardMaterial({ color: '#120a28', roughness: 0.9 }));
      grate.position.set(p.x, 0.02, p.z);
      G.add(grate);
      const tex = orbTexture('rgba(214,214,255,1)');
      for (let i = 0; i < 3; i++) {
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false }));
        sp.position.set(p.x, 0.1, p.z);
        G.add(sp);
        world.steamPuffs.push({ sp, t: i * 1.1, dur: rand(3.2, 4.2), ox: p.x, oy: 0.15, oz: p.z });
      }
    } else if (p.type === 'cart') {
      const g2 = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.5), new THREE.MeshStandardMaterial({ color: '#241245', roughness: 0.5, metalness: 0.3 }));
      body.position.y = 0.45;
      g2.add(body);
      const trim = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.05, 0.52), new THREE.MeshBasicMaterial({ color: ACCENTS.coral }));
      trim.position.y = 0.72;
      g2.add(trim);
      for (const wx of [-0.3, 0.3]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 12), new THREE.MeshStandardMaterial({ color: '#0d0620', roughness: 0.8 }));
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(wx, 0.12, 0.26);
        g2.add(wheel);
      }
      const uc = document.createElement('canvas'); uc.width = 128; uc.height = 32;
      const ug = uc.getContext('2d');
      for (let st = 0; st < 8; st++) { ug.fillStyle = st % 2 ? '#ff6a4d' : '#fef7ff'; ug.fillRect(st * 16, 0, 16, 32); }
      const ut = new THREE.CanvasTexture(uc);
      ut.colorSpace = THREE.SRGBColorSpace;
      const umb = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.28, 12), new THREE.MeshStandardMaterial({ map: ut, roughness: 0.7 }));
      umb.position.y = 1.38;
      g2.add(umb);
      const upole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 6), new THREE.MeshStandardMaterial({ color: '#1a0d34', roughness: 0.6 }));
      upole.position.y = 1.0;
      g2.add(upole);
      g2.position.set(p.x, 0, p.z);
      g2.rotation.y = p.ry || 0;
      addBuilder(g2, 1);
      const tex = orbTexture('rgba(230,230,255,1)');
      for (let i = 0; i < 2; i++) {
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false }));
        G.add(sp);
        world.steamPuffs.push({ sp, t: i * 1.6, dur: rand(2.8, 3.6), ox: p.x + 0.15, oy: 0.8, oz: p.z });
      }
    } else if (p.type === 'table') {
      const g2 = new THREE.Group();
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.4, 8), new THREE.MeshStandardMaterial({ color: '#1a0d34', roughness: 0.6 }));
      stem.position.y = 0.2;
      g2.add(stem);
      const top = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.03, 16), new THREE.MeshStandardMaterial({ color: '#241245', roughness: 0.5, metalness: 0.3 }));
      top.position.y = 0.42;
      g2.add(top);
      const rimMat = new THREE.LineBasicMaterial({ color: ACCENTS.amber, transparent: true, opacity: 0.7 });
      const rim = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.26, 0.26, 0.01, 16)), rimMat);
      rim.position.y = 0.44;
      g2.add(rim);
      world.edgeMats.push(rimMat);
      const candle = new THREE.Sprite(new THREE.SpriteMaterial({ map: orbTexture(ACCENTS.amber), transparent: true, opacity: 0.85, depthWrite: false }));
      candle.scale.setScalar(0.12);
      candle.position.y = 0.5;
      g2.add(candle);
      world.orbSprites.push(candle);
      for (const a of [0.8, 2.4, 4.2]) {
        const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.26, 10), new THREE.MeshStandardMaterial({ color: '#180c30', roughness: 0.7 }));
        stool.position.set(Math.cos(a) * 0.42, 0.13, Math.sin(a) * 0.42);
        g2.add(stool);
      }
      g2.position.set(p.x, 0, p.z);
      addBuilder(g2, 1);
    } else if (p.type === 'fountain') {
      const g2 = new THREE.Group();
      const basin = new THREE.Mesh(new THREE.CylinderGeometry(1.12, 1.2, 0.3, 24), new THREE.MeshStandardMaterial({ color: '#1c0f3a', roughness: 0.6 }));
      basin.position.y = 0.15;
      g2.add(basin);
      const waterMat = new THREE.MeshStandardMaterial({ color: '#0a2a3a', emissive: '#33e6ff', emissiveIntensity: 0.8, roughness: 0.2, metalness: 0.3 });
      const water = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 0.98, 0.06, 24), waterMat);
      water.position.y = 0.31;
      g2.add(water);
      world.pulseTargets.push({ mat: waterMat, base: 0.8, speed: 1.4, phase: 2, kind: 'grid' });
      const rimMat = new THREE.LineBasicMaterial({ color: ACCENTS.cyan, transparent: true, opacity: 0.8 });
      const rim = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.CylinderGeometry(1.12, 1.12, 0.02, 24)), rimMat);
      rim.position.y = 0.31;
      g2.add(rim);
      world.edgeMats.push(rimMat);
      for (let ri = 0; ri < 3; ri++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.014, 6, 32), new THREE.MeshBasicMaterial({ color: ACCENTS.cyan, transparent: true, opacity: 0 }));
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.35;
        g2.add(ring);
        world.ripples.push({ ring, t: ri * 0.66 });
      }
      const jet = new THREE.Sprite(new THREE.SpriteMaterial({ map: orbTexture('#8af2ff'), transparent: true, opacity: 0.85, depthWrite: false }));
      jet.scale.setScalar(0.35);
      jet.position.y = 0.6;
      g2.add(jet);
      world.ripples.jet = jet;
      g2.position.set(p.x, 0, p.z);
      addBuilder(g2);
    } else if (p.type === 'bench') {
      const g2 = new THREE.Group();
      const seatMat = new THREE.MeshStandardMaterial({ color: '#180c30', roughness: 0.7 });
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.06, 0.26), seatMat);
      seat.position.y = 0.3;
      g2.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.24, 0.05), seatMat);
      back.position.set(0, 0.5, -0.12);
      g2.add(back);
      for (const lx of [-0.32, 0.32]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.3, 0.2), seatMat);
        leg.position.set(lx, 0.15, 0);
        g2.add(leg);
      }
      const glow = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.015, 0.02), new THREE.MeshBasicMaterial({ color: ACCENTS.violet, transparent: true, opacity: 0.7 }));
      glow.position.set(0, 0.34, 0.13);
      g2.add(glow);
      g2.position.set(p.x, 0, p.z);
      g2.rotation.y = p.ry || 0;
      addBuilder(g2, 1);
    } else if (p.type === 'stringlights') {
      const cols = [ACCENTS.magenta, ACCENTS.amber, ACCENTS.cyan, ACCENTS.lime];
      const p0 = new THREE.Vector3(p.a[0], p.h, p.a[1]);
      const p1 = new THREE.Vector3(p.b[0], p.h, p.b[1]);
      for (const pp of [p0, p1]) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, p.h, 6), new THREE.MeshStandardMaterial({ color: '#1a0d34', roughness: 0.7 }));
        pole.position.set(pp.x, p.h / 2, pp.z);
        addBuilder(pole, 1);
      }
      for (let bi = 0; bi <= 13; bi++) {
        const k = bi / 13;
        const bp = p0.clone().lerp(p1, k);
        bp.y = p.h - Math.sin(Math.PI * k) * 0.4;
        const bulb = new THREE.Sprite(new THREE.SpriteMaterial({ map: orbTexture(cols[bi % 4]), transparent: true, opacity: 0.9, depthWrite: false }));
        bulb.scale.setScalar(0.14);
        bulb.position.copy(bp);
        G.add(bulb);
        world.orbSprites.push(bulb);
      }
    } else if (p.type === 'namesign') {
      const draw = () => {
        const c = document.createElement('canvas'); c.width = 192; c.height = 48;
        const g3 = c.getContext('2d');
        g3.fillStyle = '#0b6b3a'; g3.fillRect(0, 0, 192, 48);
        g3.strokeStyle = '#ffffff'; g3.lineWidth = 3; g3.strokeRect(3, 3, 186, 42);
        g3.font = '700 26px "Barlow Condensed", Arial, sans-serif';
        g3.textAlign = 'center'; g3.textBaseline = 'middle';
        g3.fillStyle = '#ffffff';
        g3.fillText(p.text, 96, 26, 176);
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        return t;
      };
      const mat = new THREE.MeshBasicMaterial({ map: draw(), transparent: true, side: THREE.DoubleSide });
      const blade = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.22), mat);
      blade.position.set(p.x, 2.35, p.z);
      blade.rotation.y = p.ry;
      G.add(blade);
      world.textRedraws.push(() => { mat.map = draw(); mat.needsUpdate = true; });
    }
  }

  /* planters, trees, lamps, parked cars */
  const flowerCols = [ACCENTS.magenta, ACCENTS.amber, ACCENTS.coral, ACCENTS.lime];
  CITY.shops.map((s) => s.x - s.w / 2 - 0.02).slice(0, 5).forEach((fx, pi) => {
    const g2 = new THREE.Group();
    const pot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.34), new THREE.MeshStandardMaterial({ color: '#241245', roughness: 0.8 }));
    pot.position.y = 0.15;
    g2.add(pot);
    for (let fi = 0; fi < 3; fi++) {
      const bud = new THREE.Sprite(new THREE.SpriteMaterial({ map: orbTexture(flowerCols[(pi + fi) % 4]), transparent: true, opacity: 0.9, depthWrite: false }));
      bud.scale.setScalar(0.16);
      bud.position.set(-0.14 + fi * 0.14, 0.4, 0);
      g2.add(bud);
    }
    g2.position.set(fx, 0, CITY.shopFrontZ - 0.35);
    addBuilder(g2, 1);
  });

  const canopyDark = new THREE.MeshStandardMaterial({ color: '#2f7a55', roughness: 0.85 });
  const canopyLight = new THREE.MeshStandardMaterial({ color: '#46a86e', roughness: 0.8 });
  const foliageClump = (r) => {
    const geo = new THREE.IcosahedronGeometry(r, 1);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    for (let vi = 0; vi < pos.count; vi++) {
      v.fromBufferAttribute(pos, vi);
      v.multiplyScalar(1 + (rng() - 0.5) * 0.4);
      pos.setXYZ(vi, v.x, v.y * (0.85 + rng() * 0.18), v.z);
    }
    geo.computeVertexNormals();
    return geo;
  };
  for (const [tx, tz, s] of CITY.trees) {
    const g2 = new THREE.Group();
    const pit = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.03, 0.95), new THREE.MeshStandardMaterial({ color: '#0d0620', roughness: 1 }));
    pit.position.y = 0.015;
    g2.add(pit);
    const rimMat = new THREE.LineBasicMaterial({ color: ACCENTS.lime, transparent: true, opacity: 0.45 });
    const rim = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.95, 0.03, 0.95)), rimMat);
    rim.position.y = 0.03;
    g2.add(rim);
    world.edgeMats.push(rimMat);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06 * s, 0.09 * s, 1.25 * s, 8), new THREE.MeshStandardMaterial({ color: '#33203f', roughness: 0.95 }));
    trunk.position.y = 0.62 * s;
    g2.add(trunk);
    const darkG = [], lightG = [];
    for (let ci = 0; ci < 6; ci++) {
      const geo = foliageClump(rand(0.34, 0.58) * s);
      geo.translate(rand(-0.5, 0.5) * s, 1.55 * s + rand(-0.15, 0.5) * s, rand(-0.5, 0.5) * s);
      (ci % 3 === 0 ? lightG : darkG).push(geo);
    }
    const canopy = new THREE.Group();
    canopy.add(new THREE.Mesh(mergeGeometries(darkG, false), canopyDark));
    canopy.add(new THREE.Mesh(mergeGeometries(lightG, false), canopyLight));
    g2.add(canopy);
    world.treeCanopies.push(canopy);
    g2.position.set(tx, 0, tz);
    addBuilder(g2);
  }

  const orbC = orbTexture(ACCENTS.cyan), orbM = orbTexture(ACCENTS.magenta);
  for (const [lx, lz, alt] of CITY.lamps) {
    const g2 = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 3.2, 8), new THREE.MeshStandardMaterial({ color: '#1a0d34', roughness: 0.6, metalness: 0.5 }));
    pole.position.y = 1.6;
    g2.add(pole);
    const orb = new THREE.Sprite(new THREE.SpriteMaterial({ map: alt ? orbM : orbC, transparent: true, opacity: 0.95, depthWrite: false }));
    orb.scale.setScalar(0.9);
    orb.position.y = 3.35;
    g2.add(orb);
    world.orbSprites.push(orb);
    g2.position.set(lx, 0, lz);
    addBuilder(g2, 3);
  }

  world.carMesh = (color, cab = false) => {
    const g2 = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.16, 0.34), new THREE.MeshStandardMaterial({ color: cab ? '#e8b422' : '#181030', roughness: 0.5, metalness: 0.4 }));
    body.position.y = 0.14;
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.28), new THREE.MeshStandardMaterial({ color: cab ? '#3a2f14' : '#241a4a', roughness: 0.4, metalness: 0.3 }));
    cabin.position.set(-0.04, 0.27, 0);
    const glow = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.02, 0.38), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 }));
    glow.position.y = 0.05;
    const head = new THREE.Sprite(new THREE.SpriteMaterial({ map: softDot, transparent: true, opacity: 0.9, depthWrite: false }));
    head.scale.setScalar(0.42);
    head.position.set(0.42, 0.15, 0);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.05, 0.3), new THREE.MeshBasicMaterial({ color: '#ff2b4a' }));
    tail.position.set(-0.37, 0.15, 0);
    g2.add(body, cabin, glow, head, tail);
    if (cab) {
      const topper = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.07, 0.1), new THREE.MeshBasicMaterial({ color: '#fff2c2' }));
      topper.position.set(-0.02, 0.36, 0);
      g2.add(topper);
    }
    g2.userData.head = head;
    return g2;
  };

  for (const p of CITY.parked) {
    const m = world.carMesh(p.cab ? '#ffb02e' : pick([ACCENTS.violet, ACCENTS.cyan, ACCENTS.magenta]), p.cab);
    m.position.set(p.x, 0.02, p.z);
    m.rotation.y = p.ry;
    m.userData.head.material.opacity = 0.08;
    G.add(m);
    world.builders.push({ group: m, order: 2 });
  }

  /* beacons */
  {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g3 = c.getContext('2d');
    g3.strokeStyle = 'rgba(255,255,255,0.95)'; g3.lineWidth = 6;
    g3.shadowColor = 'rgba(255,255,255,0.9)'; g3.shadowBlur = 12;
    g3.beginPath(); g3.arc(64, 64, 40, 0, 7); g3.stroke();
    g3.fillStyle = '#ffffff';
    g3.beginPath(); g3.arc(64, 64, 14, 0, 7); g3.fill();
    const tex = new THREE.CanvasTexture(c);
    CITY.beacons.forEach((b, i) => {
      const biz = CITY.businesses[b.biz];
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.98, depthWrite: false, depthTest: false, color: biz.accent });
      const s = new THREE.Sprite(mat);
      s.position.set(b.anchor[0], b.anchor[1], b.anchor[2]);
      s.scale.setScalar(0.001);
      s.renderOrder = 5;
      s.userData.beacon = i;
      G.add(s);
      world.beaconSprites.push(s);
    });
  }

  /* text redraw for signs after fonts load */
  world.textRedraws.push(() => {
    world.signMats.forEach((rec) => {
      if (rec.dead) rec.mat.map = signTexture('FOR LEASE', '#8a8aa0', { dim: true, size: 46 });
      else rec.mat.map = signTexture(rec.name, rec.accent);
      rec.mat.needsUpdate = true;
    });
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => setTimeout(() => world.textRedraws.forEach((f) => f()), 80));
  }

  return world;
}
