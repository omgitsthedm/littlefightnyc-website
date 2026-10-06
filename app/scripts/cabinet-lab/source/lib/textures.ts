// Finish textures. Most remain deterministic in-browser procedural surfaces. Two
// cabinet-only, seamless derivatives from the commissioned project-photo review
// calibrate the most characteristic light and dark wood looks; full room photos,
// identities, personal contents, and metadata never enter the public bundle.

import * as THREE from 'three';

export type WoodParams = {
  base: string;
  grain: string;
  grainAlpha: number;
  density: number; // vertical grain lines per 100px
  wave: number; // waviness amplitude px
  cathedral?: boolean; // plain-sawn arcs
  knots?: number; // count per tile
  rays?: boolean; // quarter-sawn flecks
  contrast: number; // 0..1 grain contrast scale
};

// A finished cabinet face, not the side of a tree: grain is an undertone beneath
// sprayed film finish — low alpha, tight variation, polished rather than raw.
export const SPECIES_PARAMS: Record<string, WoodParams> = {
  'Paint Grade':      { base: '#e9e2d2', grain: '#ddd4c0', grainAlpha: 0.05, density: 3, wave: 2, contrast: 0.15 },
  'Maple':            { base: '#e8d2ab', grain: '#d9bd91', grainAlpha: 0.08, density: 4, wave: 3, contrast: 0.2 },
  'Clear Alder':      { base: '#dcae79', grain: '#c9955e', grainAlpha: 0.12, density: 4, wave: 3, contrast: 0.25 },
  'Knotty Alder':     { base: '#d09d63', grain: '#b3814c', grainAlpha: 0.14, density: 4, wave: 4, knots: 2, contrast: 0.3 },
  'Rift White Oak':   { base: '#dcc49b', grain: '#c3a273', grainAlpha: 0.16, density: 9, wave: 1.2, contrast: 0.28 },
  'Plain Sawn Oak':   { base: '#d5ae7b', grain: '#b78c58', grainAlpha: 0.16, density: 4, wave: 2.5, cathedral: true, contrast: 0.3 },
  'Quarter Sawn Oak': { base: '#cfa873', grain: '#b18653', grainAlpha: 0.14, density: 7, wave: 1.2, rays: true, contrast: 0.26 },
  'Walnut':           { base: '#6e4c33', grain: '#573a26', grainAlpha: 0.2, density: 5, wave: 3, contrast: 0.35 },
};

export const PAINT_CHIPS: Record<string, string> = {
  'Shop White': '#f2efe6',
  'Bone': '#e5dfd0',
  'Putty': '#cfc6b2',
  'Sage': '#9aa48c',
  'Eucalyptus': '#7d8b7a',
  'Slate Blue': '#5f7484',
  'Harbor': '#46586b',
  'Ink Green': '#3e4a40',
  'Oxblood': '#5e3230',
  'Clay': '#b0715a',
  'Graphite': '#43413c',
  'Soot': '#282624',
};

export const STAIN_MULT: Record<string, number> = {
  'Natural': 1,
  'Light': 0.9,
  'Medium': 0.74,
  'Medium Dark': 0.58,
  'Dark': 0.42,
  'Solid Color': 0.3,
};

export const HARDWARE_FINISHES: Record<string, string> = {
  'Matte Black': '#2a2a2a',
  'Brushed Brass': '#b08d4a',
  'Polished Nickel': '#c9c9c9',
};

export type SurfaceSpec = {
  kind: 'wood' | 'paint' | 'solid';
  species: string;
  paintChip: string;
  stainMult: number; // 1 for natural
  bleach: boolean;
  toner: boolean;
  glaze: boolean;
  special: 'None' | 'Cerused' | 'Glaze' | 'Distressed';
};

// seeded PRNG so every texture is stable frame-to-frame
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shade(hex: string, mult: number, toward = '#000000'): string {
  const c = new THREE.Color(hex);
  const t = new THREE.Color(toward);
  c.lerp(t, 1 - mult);
  return `#${c.getHexString()}`;
}

function lighten(hex: string, amt: number): string {
  const c = new THREE.Color(hex);
  c.lerp(new THREE.Color('#f5efe0'), amt);
  return `#${c.getHexString()}`;
}

export function drawSurface(ctx: CanvasRenderingContext2D, w: number, h: number, spec: SurfaceSpec): void {
  const rnd = mulberry32(1979);

  if (spec.kind === 'paint' || spec.kind === 'solid') {
    ctx.fillStyle = PAINT_CHIPS[spec.paintChip] ?? spec.paintChip ?? '#e5dfd0';
    ctx.fillRect(0, 0, w, h);
    // whisper of surface variation so paint doesn't read as plastic
    for (let i = 0; i < 220; i++) {
      ctx.fillStyle = `rgba(${rnd() > 0.5 ? '255,255,255' : '0,0,0'},${0.012 + rnd() * 0.012})`;
      ctx.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd() * 2);
    }
    if (spec.glaze) applyGlaze(ctx, w, h);
    return;
  }

  const p = SPECIES_PARAMS[spec.species] ?? SPECIES_PARAMS['Plain Sawn Oak']!;
  let base = p.base;
  let grain = p.grain;
  if (spec.stainMult < 1) {
    base = shade(base, spec.stainMult, '#241509');
    grain = shade(grain, Math.max(0.2, spec.stainMult - 0.08), '#180d05');
  }
  if (spec.bleach) {
    base = lighten(base, 0.55);
    grain = lighten(grain, 0.45);
  }
  if (spec.toner) {
    base = shade(base, 0.94, '#8a5a20');
  }

  // base with low-frequency tonal bands
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 6; i++) {
    const bx = rnd() * w;
    const bw = w * (0.12 + rnd() * 0.2);
    const g = ctx.createLinearGradient(bx, 0, bx + bw, 0);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.5, `rgba(60,35,12,${0.02 * p.contrast})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(bx, 0, bw, h);
  }

  const cerused = spec.special === 'Cerused';
  const lineColor = cerused ? 'rgba(240,234,218,' : hexToRgbaPrefix(grain);

  // vertical grain lines
  const count = Math.round((p.density * w) / 100);
  for (let i = 0; i < count; i++) {
    const x0 = (i / count) * w + rnd() * (w / count);
    const alpha = (p.grainAlpha * (0.5 + rnd() * 0.8)) * (cerused ? 1.6 : 1);
    const width = 0.6 + rnd() * (cerused ? 2.2 : 1.6);
    ctx.strokeStyle = `${lineColor}${alpha.toFixed(3)})`;
    ctx.lineWidth = width;
    ctx.beginPath();
    let x = x0;
    ctx.moveTo(x, -4);
    for (let y = 0; y <= h + 8; y += 14) {
      x = x0 + Math.sin(y * 0.015 + i * 1.7) * p.wave + (rnd() - 0.5) * p.wave * 0.7;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // cathedral arcs (plain sawn)
  if (p.cathedral) {
    for (let i = 0; i < 3; i++) {
      const cx = w * (0.2 + rnd() * 0.6);
      const baseY = h * (0.55 + rnd() * 0.5);
      for (let k = 0; k < 7; k++) {
        ctx.strokeStyle = `${lineColor}${(p.grainAlpha * 0.7).toFixed(3)})`;
        ctx.lineWidth = 1 + rnd();
        ctx.beginPath();
        const spread = 14 + k * 13;
        ctx.moveTo(cx - spread * 2.2, h + 10);
        ctx.quadraticCurveTo(cx, baseY - spread * 2.4, cx + spread * 2.2, h + 10);
        ctx.stroke();
      }
    }
  }

  // quarter-sawn ray flecks
  if (p.rays) {
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = `rgba(238,224,196,${0.05 + rnd() * 0.08})`;
      const rx = rnd() * w;
      const ry = rnd() * h;
      ctx.save();
      ctx.translate(rx, ry);
      ctx.rotate((rnd() - 0.5) * 0.5);
      ctx.fillRect(0, 0, 5 + rnd() * 16, 1 + rnd() * 2.2);
      ctx.restore();
    }
  }

  // knots
  if (p.knots) {
    for (let i = 0; i < p.knots; i++) {
      const kx = w * (0.15 + rnd() * 0.7);
      const ky = h * (0.15 + rnd() * 0.7);
      const kr = 6 + rnd() * 11;
      for (let ring = 5; ring >= 0; ring--) {
        ctx.beginPath();
        ctx.ellipse(kx, ky, kr * (0.4 + ring * 0.22), kr * (0.3 + ring * 0.16), rnd() * 0.6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(40,22,8,${0.08 + (5 - ring) * 0.03})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.ellipse(kx, ky, kr * 0.32, kr * 0.24, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(30,16,6,0.5)';
      ctx.fill();
    }
  }

  if (spec.special === 'Distressed') {
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = `rgba(25,14,6,${0.12 + rnd() * 0.2})`;
      ctx.beginPath();
      ctx.ellipse(rnd() * w, rnd() * h, 0.8 + rnd() * 2.4, 0.6 + rnd() * 1.4, rnd() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 12; i++) {
      ctx.strokeStyle = `rgba(30,18,8,${0.1 + rnd() * 0.12})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      const sx = rnd() * w;
      const sy = rnd() * h;
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + (rnd() - 0.5) * 60, sy + (rnd() - 0.5) * 18);
      ctx.stroke();
    }
  }

  if (spec.glaze || spec.special === 'Glaze') applyGlaze(ctx, w, h);
}

function applyGlaze(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  // hang-up in the corners and profiles — approximated as a warm edge vignette
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.72);
  g.addColorStop(0, 'rgba(58,34,14,0)');
  g.addColorStop(1, 'rgba(58,34,14,0.32)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function hexToRgbaPrefix(hex: string): string {
  const c = new THREE.Color(hex);
  return `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},`;
}

const textureCache = new Map<string, THREE.Texture>();
const heightCache = new Map<string, THREE.Texture>();
const variantCache = new Map<string, THREE.Texture>();
const swatchCache = new Map<string, string>();

function commissionedWoodPath(spec: SurfaceSpec, map: 'basecolor' | 'height'): string | null {
  // Cabinet Lab ships only procedural cabinet surfaces. The original project-photo
  // derivatives are intentionally not part of this public Lab snapshot.
  void spec;
  void map;
  return null;
}

function loadRepeatTexture(path: string, color: boolean): THREE.Texture {
  const tex = new THREE.TextureLoader().load(path);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  // Cabinet fronts sample a broad portion of the source crop; floor clones override this.
  tex.repeat.set(0.5, 0.8);
  tex.anisotropy = 8;
  if (color) tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function surfaceKey(spec: SurfaceSpec): string {
  return [spec.kind, spec.species, spec.paintChip, spec.stainMult, spec.bleach, spec.toner, spec.glaze, spec.special].join('|');
}

export function getSurfaceTexture(spec: SurfaceSpec): THREE.Texture {
  const key = surfaceKey(spec);
  const cached = textureCache.get(key);
  if (cached) return cached;
  const commissioned = commissionedWoodPath(spec, 'basecolor');
  if (commissioned) {
    const tex = loadRepeatTexture(commissioned, true);
    textureCache.set(key, tex);
    return tex;
  }
  // 1024, not 512. A door is about 600 mm across, so 512 gives roughly 0.85 pixels per
  // millimetre — coarser than the pore structure of an open-grain oak, which is the detail the
  // eye actually uses to tell wood from a picture of wood.
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;
  drawSurface(ctx, 1024, 1024, spec);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, tex);
  return tex;
}

export function getSurfaceHeightTexture(spec: SurfaceSpec): THREE.Texture | null {
  const path = commissionedWoodPath(spec, 'height');
  if (!path) return null;
  const cached = heightCache.get(path);
  if (cached) return cached;
  const tex = loadRepeatTexture(path, false);
  heightCache.set(path, tex);
  return tex;
}

/**
 * Returns an independently transformed surface map without cloning an image that may still be
 * loading. Commissioned WEBP variants get their own loader-backed texture; procedural canvases
 * are already complete and can be cloned synchronously.
 */
export function getSurfaceTextureVariant(
  spec: SurfaceSpec,
  variant: string,
  repeat: readonly [number, number],
  rotation = 0,
): THREE.Texture {
  const key = `${surfaceKey(spec)}|${variant}|${repeat[0]}|${repeat[1]}|${rotation}`;
  const cached = variantCache.get(key);
  if (cached) return cached;
  const commissioned = commissionedWoodPath(spec, 'basecolor');
  const tex = commissioned ? loadRepeatTexture(commissioned, true) : getSurfaceTexture(spec).clone();
  tex.repeat.set(repeat[0], repeat[1]);
  tex.center.set(0.5, 0.5);
  tex.rotation = rotation;
  variantCache.set(key, tex);
  return tex;
}

export function getSurfaceHeightTextureVariant(
  spec: SurfaceSpec,
  variant: string,
  repeat: readonly [number, number],
  rotation = 0,
): THREE.Texture | null {
  const commissioned = commissionedWoodPath(spec, 'height');
  if (!commissioned) return null;
  const key = `height|${surfaceKey(spec)}|${variant}|${repeat[0]}|${repeat[1]}|${rotation}`;
  const cached = variantCache.get(key);
  if (cached) return cached;
  const tex = loadRepeatTexture(commissioned, false);
  tex.repeat.set(repeat[0], repeat[1]);
  tex.center.set(0.5, 0.5);
  tex.rotation = rotation;
  variantCache.set(key, tex);
  return tex;
}

export function getSwatchDataUrl(spec: SurfaceSpec): string {
  const key = surfaceKey(spec);
  const cached = swatchCache.get(key);
  if (cached) return cached;
  const commissioned = commissionedWoodPath(spec, 'basecolor');
  if (commissioned) {
    // The chip, not the texture: the full 1024px basecolor is a 3D asset, and serving it as a
    // 26px <img> src cost 528KB on the reduced-motion still view. These are 224px crops of the
    // same files (materials/swatch/, ~5KB each).
    const chip = commissioned.replace('/materials/', '/materials/swatch/').replace('-basecolor.webp', '.jpg');
    swatchCache.set(key, chip);
    return chip;
  }
  const canvas = document.createElement('canvas');
  canvas.width = 112;
  canvas.height = 112;
  const ctx = canvas.getContext('2d')!;
  drawSurface(ctx, 112, 112, spec);
  const url = canvas.toDataURL('image/png');
  swatchCache.set(key, url);
  return url;
}

/* ————— counters + stone (procedural) ————— */

function drawQuartz(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const rnd = mulberry32(4242);
  ctx.fillStyle = '#eae6dc';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = `rgba(${rnd() > 0.6 ? '255,255,255' : '160,152,138'},${0.04 + rnd() * 0.08})`;
    ctx.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd() * 2);
  }
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `rgba(150,142,128,${0.10 + rnd() * 0.1})`;
    ctx.lineWidth = 0.8 + rnd() * 1.4;
    ctx.beginPath();
    let x = rnd() * w, y = 0;
    ctx.moveTo(x, y);
    while (y < h) { x += (rnd() - 0.5) * 28; y += 12 + rnd() * 22; ctx.lineTo(x, y); }
    ctx.stroke();
  }
}

function drawMarble(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const rnd = mulberry32(7788);
  ctx.fillStyle = '#e9e7e2';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 9; i++) {
    ctx.strokeStyle = `rgba(120,118,116,${0.12 + rnd() * 0.16})`;
    ctx.lineWidth = 1 + rnd() * 2.6;
    ctx.beginPath();
    let x = rnd() * w, y = 0;
    ctx.moveTo(x, y);
    while (y < h) { x += (rnd() - 0.42) * 46; y += 10 + rnd() * 18; ctx.lineTo(x, y); }
    ctx.stroke();
  }
  for (let i = 0; i < 1200; i++) {
    ctx.fillStyle = `rgba(200,198,194,${0.05 + rnd() * 0.06})`;
    ctx.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 3, 1);
  }
}

function drawButcher(ctx: CanvasRenderingContext2D, w: number, h: number, species: string): void {
  const rnd = mulberry32(1717);
  const p = SPECIES_PARAMS[species] ?? SPECIES_PARAMS['Maple']!;
  const stripW = w / 9;
  for (let i = 0; i < 9; i++) {
    const tone = 0.9 + rnd() * 0.18;
    ctx.fillStyle = shade(p.base, Math.min(1, tone), '#241509');
    ctx.fillRect(i * stripW, 0, stripW + 1, h);
    ctx.strokeStyle = 'rgba(60,38,16,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(i * stripW, 0); ctx.lineTo(i * stripW, h); ctx.stroke();
    for (let g = 0; g < 5; g++) {
      ctx.strokeStyle = `rgba(90,60,28,${0.12 + rnd() * 0.14})`;
      ctx.lineWidth = 0.7 + rnd();
      ctx.beginPath();
      let x = i * stripW + rnd() * stripW;
      ctx.moveTo(x, 0);
      for (let y = 0; y <= h; y += 16) { x += (rnd() - 0.5) * 3; ctx.lineTo(x, y); }
      ctx.stroke();
    }
  }
}

const miscCache = new Map<string, THREE.CanvasTexture>();
export function getMiscTexture(kind: 'quartz' | 'marble' | 'butcher', species = 'Maple'): THREE.CanvasTexture {
  const key = `${kind}|${species}`;
  const hit = miscCache.get(key);
  if (hit) return hit;
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  if (kind === 'quartz') drawQuartz(ctx, 512, 512);
  else if (kind === 'marble') drawMarble(ctx, 512, 512);
  else drawButcher(ctx, 512, 512, species);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8; tex.colorSpace = THREE.SRGBColorSpace;
  miscCache.set(key, tex);
  return tex;
}

/**
 * Wide-plank pale-oak floor, referenced from the studio project photography:
 * ~0.19 m boards with staggered butt joints, per-plank tone shifts, fine grain,
 * carved seams in the bump, and per-plank sheen variation in the roughness map.
 * One tile represents 3.8 m so the scene can repeat it with world scale.
 */
export const FLOOR_TILE_METERS = 3.8;
let floorSet: { map: THREE.CanvasTexture; bump: THREE.CanvasTexture; rough: THREE.CanvasTexture } | null = null;
export function getFloorPlanksTextures(): { map: THREE.CanvasTexture; bump: THREE.CanvasTexture; rough: THREE.CanvasTexture } {
  if (floorSet) return floorSet;
  const S = 1024;
  const px = (m: number) => (m / FLOOR_TILE_METERS) * S;
  const plankW = px(0.19);
  const rows = Math.round(S / plankW);

  const color = document.createElement('canvas');
  color.width = S; color.height = S;
  const c = color.getContext('2d')!;
  const bump = document.createElement('canvas');
  bump.width = S; bump.height = S;
  const b = bump.getContext('2d')!;
  const rough = document.createElement('canvas');
  rough.width = S; rough.height = S;
  const r = rough.getContext('2d')!;
  b.fillStyle = '#808080';
  b.fillRect(0, 0, S, S);

  // deterministic per-load pattern — the floor must not shimmer between visits
  let seed = 977301;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const palette: [number, number, number][] = [
    [219, 201, 171], [227, 213, 186], [207, 189, 158],
    [232, 221, 201], [211, 195, 164], [199, 182, 152],
  ];

  for (let row = 0; row < rows; row += 1) {
    const y0 = row * plankW;
    let x0 = -rnd() * px(1.4);
    while (x0 < S) {
      const len = px(1.1 + rnd() * 1.3);
      const [pr, pg, pb] = palette[Math.floor(rnd() * palette.length)]!;
      const tone = 0.94 + rnd() * 0.1;
      c.fillStyle = `rgb(${Math.round(pr * tone)}, ${Math.round(pg * tone)}, ${Math.round(pb * tone)})`;
      c.fillRect(x0, y0, len, plankW);
      // long grain: faint streaks running the board
      for (let g = 0; g < 26; g += 1) {
        const gy = y0 + rnd() * plankW;
        const dark = rnd() > 0.45;
        c.strokeStyle = dark
          ? `rgba(122, 98, 70, ${0.05 + rnd() * 0.09})`
          : `rgba(248, 240, 224, ${0.05 + rnd() * 0.08})`;
        c.lineWidth = 0.7 + rnd() * 1.1;
        c.beginPath();
        const gx0 = x0 + rnd() * len * 0.4;
        c.moveTo(gx0, gy);
        c.bezierCurveTo(
          gx0 + len * 0.25, gy + (rnd() - 0.5) * 4,
          gx0 + len * 0.5, gy + (rnd() - 0.5) * 4,
          gx0 + Math.min(len, gx0 - x0 + len * 0.7), gy + (rnd() - 0.5) * 2.5,
        );
        c.stroke();
      }
      // occasional cathedral figure
      if (rnd() > 0.62) {
        const cx = x0 + len * (0.25 + rnd() * 0.5);
        c.strokeStyle = `rgba(130, 104, 74, ${0.1 + rnd() * 0.08})`;
        c.lineWidth = 1.1;
        for (let k = 0; k < 4; k += 1) {
          const spread = 5 + k * (5 + rnd() * 3);
          c.beginPath();
          c.moveTo(cx - spread * 4, y0 + plankW * 0.5 - spread);
          c.quadraticCurveTo(cx, y0 + plankW * (0.3 + rnd() * 0.2), cx + spread * 4, y0 + plankW * 0.5 + spread);
          c.stroke();
        }
      }
      // butt joint: carved dark seam in color + bump
      c.fillStyle = 'rgba(96, 76, 55, 0.55)';
      c.fillRect(x0 + len - 1.4, y0, 1.8, plankW);
      b.fillStyle = '#2c2c2c';
      b.fillRect(x0 + len - 1.6, y0, 2.2, plankW);
      // per-plank sheen: photos read satin with board-to-board variation
      const sheen = 150 + Math.round(rnd() * 42);
      r.fillStyle = `rgb(${sheen}, ${sheen}, ${sheen})`;
      r.fillRect(x0, y0, len, plankW);
      x0 += len;
    }
    // board edge seam along the row
    c.fillStyle = 'rgba(96, 76, 55, 0.5)';
    c.fillRect(0, y0 + plankW - 1.1, S, 1.6);
    b.fillStyle = '#303030';
    b.fillRect(0, y0 + plankW - 1.3, S, 2.0);
    // micro-bevel highlight on the near edge of the next board
    c.fillStyle = 'rgba(250, 244, 230, 0.16)';
    c.fillRect(0, y0 + plankW + 0.6, S, 1.0);
  }

  const mk = (canvas: HTMLCanvasElement, srgb: boolean) => {
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 16;
    if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };
  floorSet = { map: mk(color, true), bump: mk(bump, false), rough: mk(rough, false) };
  return floorSet;
}

/** Vintage-washed diamond runner — the corpus's 'one aged wildcard'. */
let runnerTex: THREE.CanvasTexture | null = null;
export function getRunnerTexture(): THREE.CanvasTexture {
  if (runnerTex) return runnerTex;
  const W = 768, H = 256;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  let seed = 52121;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  ctx.fillStyle = '#8d3f36';
  ctx.fillRect(0, 0, W, H);
  // faded field blotches
  for (let i = 0; i < 260; i += 1) {
    const v = rnd();
    ctx.fillStyle = v > 0.6 ? 'rgba(214, 196, 168, 0.16)' : v > 0.3 ? 'rgba(58, 74, 94, 0.14)' : 'rgba(140, 60, 48, 0.18)';
    const r = 8 + rnd() * 46;
    ctx.beginPath();
    ctx.ellipse(rnd() * W, rnd() * H, r, r * (0.4 + rnd() * 0.5), rnd() * 3.14, 0, 6.29);
    ctx.fill();
  }
  // diamond lattice
  ctx.strokeStyle = 'rgba(226, 210, 182, 0.5)';
  ctx.lineWidth = 3;
  const step = 64;
  for (let x = -H; x < W + H; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + H, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, H); ctx.lineTo(x + H, 0); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(38, 52, 74, 0.42)';
  ctx.lineWidth = 1.4;
  for (let x = -H + step / 2; x < W + H; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + H, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, H); ctx.lineTo(x + H, 0); ctx.stroke();
  }
  // border bands
  ctx.fillStyle = 'rgba(226, 210, 182, 0.55)';
  ctx.fillRect(0, 6, W, 5); ctx.fillRect(0, H - 11, W, 5);
  ctx.fillRect(6, 0, 5, H); ctx.fillRect(W - 11, 0, 5, H);
  // wear streaks
  for (let i = 0; i < 90; i += 1) {
    ctx.fillStyle = `rgba(232, 222, 204, ${0.05 + rnd() * 0.1})`;
    ctx.fillRect(rnd() * W, rnd() * H, 20 + rnd() * 60, 1 + rnd() * 2);
  }
  runnerTex = new THREE.CanvasTexture(canvas);
  runnerTex.anisotropy = 8;
  runnerTex.colorSpace = THREE.SRGBColorSpace;
  return runnerTex;
}

/** Fine plaster noise for wall surfaces — kills flat-plane banding under raking light. */
let plasterTex: THREE.CanvasTexture | null = null;
export function getPlasterBump(): THREE.CanvasTexture {
  if (plasterTex) return plasterTex;
  const S = 256;
  const canvas = document.createElement('canvas');
  canvas.width = S; canvas.height = S;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, S, S);
  let seed = 40087;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < 5200; i += 1) {
    const v = 116 + Math.round(rnd() * 24);
    ctx.fillStyle = `rgba(${v}, ${v}, ${v}, ${0.3 + rnd() * 0.4})`;
    const s = 0.6 + rnd() * 1.8;
    ctx.fillRect(rnd() * S, rnd() * S, s, s);
  }
  plasterTex = new THREE.CanvasTexture(canvas);
  plasterTex.wrapS = THREE.RepeatWrapping;
  plasterTex.wrapT = THREE.RepeatWrapping;
  return plasterTex;
}

/**
 * File-backed texture with a procedural placeholder: the canvas paints the
 * first frame, the photogrammetry map swaps in when it arrives. CC0 sources
 * only — see public/materials/SOURCES.md.
 */
const fileTexCache = new Map<string, THREE.Texture>();
export function getFileTexture(
  url: string,
  opts: { srgb?: boolean; placeholder?: HTMLCanvasElement | null; key?: string } = {},
): THREE.Texture {
  const cacheKey = `${url}|${opts.key ?? ''}`;
  const hit = fileTexCache.get(cacheKey);
  if (hit) return hit;
  const tex = new THREE.Texture();
  tex.image = opts.placeholder ?? neutralCanvas('#9a9a9a');
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 16;
  if (opts.srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  new THREE.ImageLoader().load(url, (img) => {
    // Dispose BEFORE swapping the image in, and the reason is a real bug rather than caution.
    //
    // The placeholder above is a 4x4 canvas, and `needsUpdate` on it makes three allocate
    // immutable storage for this texture at 4x4 via texStorage2D. Assigning a 1024 or 2048 pixel
    // image to `tex.image` afterwards does not resize that allocation: three uploads the new
    // image into the old 4x4 storage with texSubImage2D, the driver rejects it outright, and the
    // texture keeps whatever it had. Every commissioned map in this room was arriving this way.
    //
    // Caught by instrumenting texStorage2D and texSubImage2D in the browser and comparing the
    // allocation against the source of each upload: "src 1024x1024 into level 4x4 (alloc 4x4)"
    // and "src 2048x2048 into level 512x512". The console had been repeating GL_INVALID_VALUE:
    // glTexSubImage2DRobustANGLE: Offset overflows texture dimensions for a long time, which is
    // the same fault said less usefully. The visible symptom was the Natural Oak look rendering
    // as a blown white frame on the software renderer, because its wood basecolour is the
    // commissioned WEBP and it never landed.
    //
    // `dispose()` releases the GPU allocation, so the next render allocates at the real size.
    tex.dispose();
    tex.image = img;
    tex.needsUpdate = true;
  });
  fileTexCache.set(cacheKey, tex);
  return tex;
}

/**
 * Vertical falloff for a lit cabinet cavity.
 *
 * A glazed transom with a strip light in it is not a light box: the light is at the top, the back
 * panel is brightest just under it, and the bottom of the cavity is markedly dimmer. Lighting the
 * panel uniformly is what makes a glazed upper read as a backlit acrylic sign rather than as a
 * cabinet you can see into — it was the flattest, most synthetic thing left in the room.
 *
 * Bright but not white at the top, down to about a third at the sill.
 */
let cavityGlow: THREE.CanvasTexture | null = null;
export function getCavityGlowTexture(): THREE.CanvasTexture {
  if (cavityGlow) return cavityGlow;
  const c = document.createElement('canvas');
  c.width = 4;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.22, '#f2f2f2');
  g.addColorStop(0.62, '#a8a8a8');
  g.addColorStop(1, '#585858');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 4, 256);
  cavityGlow = new THREE.CanvasTexture(c);
  cavityGlow.colorSpace = THREE.SRGBColorSpace;
  return cavityGlow;
}

const neutralCache = new Map<string, HTMLCanvasElement>();
export function neutralCanvas(color: string): HTMLCanvasElement {
  const hit = neutralCache.get(color);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = 4; c.height = 4;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 4, 4);
  neutralCache.set(color, c);
  return c;
}

/** Soft vertical shade gradient (under-cabinet occlusion strip). */
let shadeTex: THREE.CanvasTexture | null = null;
export function getShadeTexture(): THREE.CanvasTexture {
  if (shadeTex) return shadeTex;
  const c = document.createElement('canvas');
  c.width = 4; c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, 128);
  g.addColorStop(0, 'rgba(0,0,0,0.55)');
  g.addColorStop(0.5, 'rgba(0,0,0,0.18)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 4, 128);
  shadeTex = new THREE.CanvasTexture(c);
  return shadeTex;
}

/**
 * Sansevieria trifasciata blade, drawn rather than photographed like everything else here.
 *
 * The plant is only recognisable from its markings: a deep green blade crossed by irregular
 * pale chevrons that lie flatter and wider toward the base, and — on the laurentii most people
 * picture — a narrow butter-yellow margin down both edges. UV runs u across the blade width
 * (0 and 1 are the two edges, so the margin lands where it belongs) and v along its length,
 * v=0 at the soil.
 */
let snakePlantTex: THREE.CanvasTexture | null = null;
export function getSnakePlantTexture(): THREE.CanvasTexture {
  if (snakePlantTex) return snakePlantTex;
  const W = 128;
  const H = 512;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // deep green body, a shade darker at the base where the blades crowd each other
  const body = ctx.createLinearGradient(0, H, 0, 0);
  body.addColorStop(0, '#22381f');
  body.addColorStop(0.22, '#2f4a2c');
  body.addColorStop(0.72, '#3a5734');
  body.addColorStop(1, '#31492c');
  ctx.fillStyle = body;
  ctx.fillRect(0, 0, W, H);

  // Chevrons. Deterministic — no Math.random anywhere in this project's asset generation, so the
  // same blade comes out of every build and the scene certification stays comparable.
  const wobble = (n: number) => Math.sin(n * 12.9898) * 43758.5453 % 1;
  for (let index = 0; index < 46; index += 1) {
    const t = index / 46;                       // 0 at the tip end of the canvas, 1 at the base
    const y = t * H;
    const band = 5 + wobble(index) * 9 + t * 7; // bands fatten toward the base
    const dip = 26 + wobble(index + 7) * 22;    // how far the chevron sags in the middle
    ctx.globalAlpha = 0.26 + Math.abs(wobble(index + 3)) * 0.3;
    ctx.fillStyle = index % 3 === 0 ? '#93ab77' : '#7d9765';
    ctx.beginPath();
    ctx.moveTo(-4, y);
    ctx.quadraticCurveTo(W / 2, y + dip, W + 4, y);
    ctx.lineTo(W + 4, y + band);
    ctx.quadraticCurveTo(W / 2, y + dip + band, -4, y + band);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // the laurentii margin, and a hairline of shadow just inside it so the edge reads as an edge
  const margin = ctx.createLinearGradient(0, 0, W, 0);
  margin.addColorStop(0, '#cbbf6a');
  margin.addColorStop(0.055, '#cbbf6a');
  margin.addColorStop(0.085, 'rgba(40,58,36,0)');
  margin.addColorStop(0.915, 'rgba(40,58,36,0)');
  margin.addColorStop(0.945, '#cbbf6a');
  margin.addColorStop(1, '#cbbf6a');
  ctx.fillStyle = margin;
  ctx.fillRect(0, 0, W, H);

  snakePlantTex = new THREE.CanvasTexture(canvas);
  snakePlantTex.colorSpace = THREE.SRGBColorSpace;
  snakePlantTex.anisotropy = 4;
  return snakePlantTex;
}

/**
 * Orange peel — the reason sprayed millwork does not look like moulded plastic.
 *
 * A painted door is very nearly one colour, so nothing about its realism lives in the albedo.
 * It lives in the highlight: atomised lacquer lands as millions of droplets that flow together
 * but never quite level, leaving a cellular dimpling around half a millimetre across. Light
 * skating over that breaks into a soft mottle instead of a clean mirror, and that broken
 * highlight is the entire visual difference between a finished cabinet and a toy.
 *
 * Before this, `drawSurface` gave paint a flat fill plus 220 random one-pixel specks at ~1%
 * opacity, and every painted surface carried a single scalar roughness — so every highlight in
 * the room was perfectly smooth.
 *
 * Two maps, because the effect is both optical and physical: a roughness map that makes the
 * sheen wander, and a matching height map so the dimples catch a little geometry at grazing
 * angles. Deterministic, tiled seamlessly by wrapping every cell that crosses an edge.
 */
let peelMaps: { rough: THREE.CanvasTexture; height: THREE.CanvasTexture } | null = null;

export function getOrangePeelMaps(): { rough: THREE.CanvasTexture; height: THREE.CanvasTexture } {
  if (peelMaps) return peelMaps;
  const S = 256;
  const rough = document.createElement('canvas');
  const height = document.createElement('canvas');
  rough.width = rough.height = S;
  height.width = height.height = S;
  const r = rough.getContext('2d')!;
  const h = height.getContext('2d')!;
  // near-white: three.js multiplies `roughness` by this channel, so a mid-grey base would
  // silently halve every painted finish — the same trap the brushed-steel map fell into.
  r.fillStyle = '#ededed';
  r.fillRect(0, 0, S, S);
  h.fillStyle = '#808080';
  h.fillRect(0, 0, S, S);

  // seeded so the finish is identical in every build and the scene certification stays comparable
  let seed = 0x9e3779b9;
  const rand = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // three passes of cells at different sizes: the flow-out is never one scale
  for (const [count, min, span, strength] of [[520, 9, 13, 0.10], [900, 5, 7, 0.075], [1500, 2.5, 3.5, 0.05]] as const) {
    for (let i = 0; i < count; i += 1) {
      const cx = rand() * S;
      const cy = rand() * S;
      const radius = min + rand() * span;
      const up = rand() > 0.5;
      // wrap every cell that crosses an edge so the tile is seamless in both axes
      for (const dx of [-S, 0, S]) {
        for (const dy of [-S, 0, S]) {
          if (Math.abs(cx + dx - S / 2) > S / 2 + radius || Math.abs(cy + dy - S / 2) > S / 2 + radius) continue;
          for (const [ctx2, amount] of [[r, strength], [h, strength * 0.85]] as const) {
            const g = ctx2.createRadialGradient(cx + dx, cy + dy, 0, cx + dx, cy + dy, radius);
            const a = amount.toFixed(3);
            g.addColorStop(0, up ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`);
            g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx2.fillStyle = g;
            ctx2.beginPath();
            ctx2.arc(cx + dx, cy + dy, radius, 0, Math.PI * 2);
            ctx2.fill();
          }
        }
      }
    }
  }

  const finish = (canvas: HTMLCanvasElement) => {
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 8;
    // a door is about 0.6 m across and the cells are sub-millimetre, so the tile repeats hard
    tex.repeat.set(7, 7);
    return tex;
  };
  peelMaps = { rough: finish(rough), height: finish(height) };
  return peelMaps;
}


/**
 * Grain as roughness.
 *
 * Finished oak is not uniformly glossy. Its pores are open, they hold finish differently from the
 * dense latewood beside them, and they scatter light where the flat of the board reflects it — so
 * a highlight travelling across a board breaks along the grain. That behaviour is what separates
 * timber from a photograph of timber printed on a panel, and the wood here had no roughness map
 * at all: one scalar across the whole door.
 *
 * The same lesson as the orange peel on the painted fronts, and the same near-white base for the
 * same reason — three.js MULTIPLIES `roughness` by this channel, so a mid-grey map would quietly
 * halve the finish. Grain lines sit above the base, because a pore is rougher than the flat.
 */
const grainRoughCache = new Map<string, THREE.CanvasTexture>();

export function getGrainRoughnessTexture(spec: SurfaceSpec): THREE.CanvasTexture {
  const key = `${spec.species}|${spec.special}`;
  const hit = grainRoughCache.get(key);
  if (hit) return hit;
  const S = 512;
  const canvas = document.createElement('canvas');
  canvas.width = S; canvas.height = S;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#dedede';
  ctx.fillRect(0, 0, S, S);

  const params = SPECIES_PARAMS[spec.species] ?? SPECIES_PARAMS['Plain Sawn Oak']!;
  let seed = 0x2f6b1c9d;
  const rand = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // the pores, following the same wandering lines the colour map draws
  const count = Math.round((params.density * S) / 100);
  for (let i = 0; i < count; i += 1) {
    const x0 = (i / count) * S + rand() * (S / count);
    ctx.strokeStyle = `rgba(255,255,255,${(0.10 + rand() * 0.16).toFixed(3)})`;
    ctx.lineWidth = 0.8 + rand() * 2.1;
    ctx.beginPath();
    ctx.moveTo(x0, -4);
    for (let y = 0; y <= S + 8; y += 12) {
      ctx.lineTo(x0 + Math.sin(y * 0.015 + i * 1.7) * params.wave + (rand() - 0.5) * params.wave * 0.7, y);
    }
    ctx.stroke();
  }

  // a cerused finish is grain filled with pale wax — the pores go SMOOTHER, not rougher, and
  // that inversion is most of why cerused oak reads as a different material
  if (spec.special === 'Cerused') {
    ctx.globalCompositeOperation = 'difference';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, S, S);
    ctx.globalCompositeOperation = 'source-over';
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  grainRoughCache.set(key, tex);
  return tex;
}

/* ————— the countertop, which is a SLAB ————— */

/** One sheet represents 3.2 m of stone, so a 2.6 m island shows a single piece. */
export const SLAB_TILE_METERS = 3.2;

let slabSet: { map: THREE.CanvasTexture; normal: THREE.CanvasTexture; rough: THREE.CanvasTexture } | null = null;

/**
 * A continuous stone slab, which is what a countertop is.
 *
 * The counter had been running marble_diff.webp, and that file is a running-bond
 * limestone FLOOR: 2048px of rectangular tiles with grout joints painted into
 * it. The Door camera showed the island as a grid of squares, across the top and
 * down the edge fascia both, because that is what the map draws. No repeat
 * setting fixes a joint that is in the texture.
 *
 * So this draws the material rather than borrowing one. A warm ground with
 * low-frequency mottling — a slab is not one flat tone across two metres — then
 * a few primary veins that wander, branch and feather out, a scatter of
 * hairlines, and crystal speckle. Every stroke is laid down nine times on a 3x3
 * offset lattice so the sheet wraps in both axes and the repeat has no seam.
 *
 * Deliberately kept in the cream family: an earlier wave measured this surface
 * as worth about five points of shadow warmth, and found that cooling it to a
 * blue-grey pushed Evening/Upper back out of the reference band. The defect here
 * is the joints and the missing veining, not the colour, so the mean is matched
 * to the map it replaces — (177, 157, 121).
 */
export function getSlabTextures(): { map: THREE.CanvasTexture; normal: THREE.CanvasTexture; rough: THREE.CanvasTexture } {
  if (slabSet) return slabSet;
  const S = 1024;
  const rnd = mulberry32(20260830);

  const color = document.createElement('canvas'); color.width = S; color.height = S;
  const c = color.getContext('2d')!;
  const height = document.createElement('canvas'); height.width = S; height.height = S;
  const hgt = height.getContext('2d')!;
  const rough = document.createElement('canvas'); rough.width = S; rough.height = S;
  const r = rough.getContext('2d')!;

  c.fillStyle = '#dcc69b'; c.fillRect(0, 0, S, S);
  hgt.fillStyle = '#808080'; hgt.fillRect(0, 0, S, S);
  // near-white, because three.js MULTIPLIES roughness by this channel and a mid-grey
  // map silently halves the finish — the same trap the grain roughness hit in wave 57
  r.fillStyle = '#f4f4f4'; r.fillRect(0, 0, S, S);

  const wrap = (draw: (dx: number, dy: number) => void) => {
    for (let ix = -1; ix <= 1; ix++) for (let iy = -1; iy <= 1; iy++) draw(ix * S, iy * S);
  };

  for (let i = 0; i < 26; i++) {
    const x = rnd() * S, y = rnd() * S, rad = S * (0.16 + rnd() * 0.30);
    const warm = rnd() > 0.5;
    wrap((dx, dy) => {
      const g = c.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, rad);
      g.addColorStop(0, warm ? 'rgba(226,211,178,0.20)' : 'rgba(176,160,128,0.13)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g;
      c.beginPath(); c.arc(x + dx, y + dy, rad, 0, Math.PI * 2); c.fill();
    });
  }

  const vein = (x0: number, y0: number, ang: number, len: number, width: number, alpha: number): [number, number][] => {
    const pts: [number, number][] = [];
    let x = x0, y = y0, a = ang;
    const step = S / 110;
    for (let i = 0; i * step < len; i++) {
      pts.push([x, y]);
      a += (rnd() - 0.5) * 0.30;
      x += Math.cos(a) * step; y += Math.sin(a) * step;
    }
    if (pts.length < 3) return pts;
    // A vein is not a pen stroke. It is thickest somewhere in the middle and dies out at both
    // ends, and it wanders in width as it goes — the first pass drew one constant-width line and
    // the slab read as a spiderweb of hairs. Segment-wise drawing is what buys the taper.
    const wobble = pts.map(() => 0.7 + rnd() * 0.6);
    const widthAt = (t: number, i: number) => width * Math.pow(Math.sin(Math.PI * t), 0.55) * wobble[i]!;
    const seg = (ctx: CanvasRenderingContext2D, dx: number, dy: number, wMul: number, style: (t: number) => string) => {
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (let i = 1; i < pts.length; i++) {
        const t = i / (pts.length - 1);
        const w = widthAt(t, i) * wMul;
        if (w < 0.06) continue;
        ctx.strokeStyle = style(t); ctx.lineWidth = w;
        ctx.beginPath();
        ctx.moveTo(pts[i - 1]![0] + dx, pts[i - 1]![1] + dy);
        ctx.lineTo(pts[i]![0] + dx, pts[i]![1] + dy);
        ctx.stroke();
      }
    };
    // a pale border, which is what a calcite vein actually leaves in the stone beside it
    wrap((dx, dy) => seg(c, dx, dy, 7.0, () => `rgba(238,228,205,${alpha * 0.13})`));
    // then feathered body: wide and faint underneath, tight and dark on top — no hard edge
    for (const [wMul, aMul] of [[4.6, 0.13], [2.2, 0.26], [1.0, 0.85]] as const) {
      wrap((dx, dy) => seg(c, dx, dy, wMul, (t) => `rgba(104,90,68,${alpha * aMul * (0.55 + 0.45 * Math.sin(Math.PI * t))})`));
    }
    // calcite takes polish differently from the ground around it
    wrap((dx, dy) => seg(r, dx, dy, 2.0, () => `rgba(255,255,255,${0.26 * alpha})`));
    wrap((dx, dy) => seg(hgt, dx, dy, 1.4, () => 'rgba(118,118,118,0.42)'));
    return pts;
  };

  // movement in a slab runs one way — it is a slice off a block, not a random field
  const dominant = -0.62;
  for (let i = 0; i < 4; i++) {
    const pts = vein(rnd() * S, rnd() * S, dominant + (rnd() - 0.5) * 0.5, S * (1.4 + rnd()), 3.2 + rnd() * 3.4, 0.62 + rnd() * 0.22);
    for (let b = 0, n = 2 + Math.floor(rnd() * 3); b < n; b++) {
      const p = pts[Math.floor(rnd() * pts.length)];
      if (p) vein(p[0], p[1], dominant + (rnd() - 0.5) * 1.5, S * (0.25 + rnd() * 0.45), 1.3 + rnd() * 1.6, 0.40 + rnd() * 0.20);
    }
  }
  for (let i = 0; i < 22; i++) {
    vein(rnd() * S, rnd() * S, dominant + (rnd() - 0.5) * 1.9, S * (0.10 + rnd() * 0.30), 0.6 + rnd() * 0.8, 0.20 + rnd() * 0.14);
  }
  for (let i = 0; i < 5200; i++) {
    c.fillStyle = rnd() > 0.5 ? `rgba(216,203,174,${0.05 + rnd() * 0.10})` : `rgba(148,134,108,${0.04 + rnd() * 0.08})`;
    c.fillRect(rnd() * S, rnd() * S, 1 + rnd() * 2, 1 + rnd() * 1.6);
  }

  // normal from the height field by central difference, wrapped like everything else
  const hd = hgt.getImageData(0, 0, S, S).data;
  const at = (x: number, y: number) => hd[((((y % S) + S) % S) * S + (((x % S) + S) % S)) * 4]! / 255;
  const normal = document.createElement('canvas'); normal.width = S; normal.height = S;
  const nctx = normal.getContext('2d')!;
  const nd = nctx.createImageData(S, S);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * 3.0;
      const dy = (at(x, y + 1) - at(x, y - 1)) * 3.0;
      const len = Math.hypot(dx, dy, 1);
      const i = (y * S + x) * 4;
      nd.data[i] = Math.round((-dx / len * 0.5 + 0.5) * 255);
      nd.data[i + 1] = Math.round((-dy / len * 0.5 + 0.5) * 255);
      nd.data[i + 2] = Math.round((1 / len * 0.5 + 0.5) * 255);
      nd.data[i + 3] = 255;
    }
  }
  nctx.putImageData(nd, 0, 0);

  const mk = (canvas: HTMLCanvasElement, srgb: boolean) => {
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 16;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  slabSet = { map: mk(color, true), normal: mk(normal, false), rough: mk(rough, false) };
  return slabSet;
}
