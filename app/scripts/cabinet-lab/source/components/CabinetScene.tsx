'use client';

// Procedural cabinet scene v3 — clean-room geometry and generated textures only.
// Real openings (swing / lift-up / drawers / pullouts), interiors (shelves, drawer
// boxes, glides, hinges, rollouts, cutlery, trash), and the MasterFile extras
// (wood tops, apron sink, appliance panels, stone panels). Click anything to open it.

import React, { useCallback, useEffect, useLayoutEffect, Suspense, createContext, useContext, useMemo, useRef, useState, memo } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, Lightformer, PerformanceMonitor, RoundedBox } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, N8AO, HueSaturation, BrightnessContrast } from '@react-three/postprocessing';
import * as THREE from 'three';
import {
  getSurfaceTexture, getSurfaceHeightTexture, getSurfaceTextureVariant, getCavityGlowTexture,
  getMiscTexture,
  getSlabTextures, getShadeTexture, HARDWARE_FINISHES,
  getFloorPlanksTextures, getPlasterBump, FLOOR_TILE_METERS, getRunnerTexture,
  getFileTexture, neutralCanvas, getSnakePlantTexture, getOrangePeelMaps, getGrainRoughnessTexture,
} from '../lib/textures';
import { surfaceOf, isPrefinished, supportsUpperInsert, type Sel } from '../lib/options';
import { isSoftwareRenderer, useSceneQuality, type SceneQuality, type SceneQualityTier } from '../lib/scene-quality';
import { KitCtx, useKit, useKitLoader, useExtraModel, railPartFor, CROWN_PARTS, PULL_PARTS } from './kit';

type ControlsLike = { target: THREE.Vector3; update: () => void; autoRotate: boolean };

/* ————— shared geometry and instancing —————
 * Every `<boxGeometry>` / `<circleGeometry>` written inline in JSX allocates a fresh
 * BufferGeometry per mesh, and every inline `<meshStandardMaterial>` a fresh material with its
 * own shader program. Measured before this block: 676 geometry objects for 209 distinct shapes,
 * 254 material objects for 69 distinct signatures, and 1,883 draw calls a frame — 168 of them
 * 3.5 mm screw heads. Nothing below changes what the room looks like; it changes how many times
 * the GPU is asked to draw it.
 */

/* ————— chamfered boxes —————
 * Every case part, rail, stile and panel in this room was a hard 90-degree box. Nothing in a real
 * shop leaves the bench like that: an arris gets eased, and that eased edge is the single biggest
 * reason millwork reads as wood rather than as geometry. A sharp edge returns one lighting value;
 * a chamfered one returns three — face, chamfer, face — so every edge picks up a bright line where
 * it turns toward a light and a dark one where it turns away. It is what draws the box.
 *
 * A 1.2 mm chamfer, clamped so it can never eat more than a quarter of the thinnest dimension —
 * a 7 mm dovetail pin keeps its shape. 44 triangles a box instead of 12, which this scene can
 * afford several times over: it is bound on draw calls, not on geometry.
 */
// 0.6 mm. The first pass used 1.2 mm, which is a plausible ease on a solid edge but too much
// here: cabinet reveals are about 3 mm, and a chamfer eats into one from both sides, so a 1.2 mm
// ease turned a crisp shadow line between drawer fronts into a 5 mm bright band. Half that keeps
// the light-catch on every arris and gives the reveals back.
const CHAMFER = 0.0006;

const chamferCache = new Map<string, THREE.BufferGeometry>();

function chamferedBox(w: number, h: number, d: number, chamfer = CHAMFER): THREE.BufferGeometry {
  const c = Math.min(chamfer, Math.min(w, h, d) * 0.25);
  const key = `${w.toFixed(5)}|${h.toFixed(5)}|${d.toFixed(5)}|${c.toFixed(5)}`;
  const hit = chamferCache.get(key);
  if (hit) return hit;

  const x = w / 2;
  const y = h / 2;
  const z = d / 2;
  const position: number[] = [];
  const normal: number[] = [];
  const uv: number[] = [];

  const quad = (
    a: [number, number, number], b: [number, number, number],
    cc: [number, number, number], dd: [number, number, number],
    n: [number, number, number],
    uvs: [number, number][],
  ) => {
    for (const [p1, p2, p3, i1, i2, i3] of [[a, b, cc, 0, 1, 2], [a, cc, dd, 0, 2, 3]] as const) {
      for (const [pt, ui] of [[p1, i1], [p2, i2], [p3, i3]] as [readonly number[], number][]) {
        position.push(pt[0]!, pt[1]!, pt[2]!);
        normal.push(n[0], n[1], n[2]);
        uv.push(uvs[ui]![0], uvs[ui]![1]);
      }
    }
  };

  const FACE_UV: [number, number][] = [[0, 0], [1, 0], [1, 1], [0, 1]];
  // the six inset faces
  quad([-x + c, -y + c, z], [x - c, -y + c, z], [x - c, y - c, z], [-x + c, y - c, z], [0, 0, 1], FACE_UV);
  quad([x - c, -y + c, -z], [-x + c, -y + c, -z], [-x + c, y - c, -z], [x - c, y - c, -z], [0, 0, -1], FACE_UV);
  quad([x, -y + c, z - c], [x, -y + c, -z + c], [x, y - c, -z + c], [x, y - c, z - c], [1, 0, 0], FACE_UV);
  quad([-x, -y + c, -z + c], [-x, -y + c, z - c], [-x, y - c, z - c], [-x, y - c, -z + c], [-1, 0, 0], FACE_UV);
  quad([-x + c, y, z - c], [x - c, y, z - c], [x - c, y, -z + c], [-x + c, y, -z + c], [0, 1, 0], FACE_UV);
  quad([-x + c, -y, -z + c], [x - c, -y, -z + c], [x - c, -y, z - c], [-x + c, -y, z - c], [0, -1, 0], FACE_UV);

  const r2 = Math.SQRT1_2;
  const EDGE_UV: [number, number][] = [[0, 0], [1, 0], [1, 1], [0, 1]];
  // twelve edge chamfers, each carrying the 45-degree normal that catches the light
  quad([-x + c, -y + c, z], [-x + c, y - c, z], [-x, y - c, z - c], [-x, -y + c, z - c], [-r2, 0, r2], EDGE_UV);
  quad([x - c, y - c, z], [x - c, -y + c, z], [x, -y + c, z - c], [x, y - c, z - c], [r2, 0, r2], EDGE_UV);
  quad([-x + c, y - c, -z], [-x + c, -y + c, -z], [-x, -y + c, -z + c], [-x, y - c, -z + c], [-r2, 0, -r2], EDGE_UV);
  quad([x - c, -y + c, -z], [x - c, y - c, -z], [x, y - c, -z + c], [x, -y + c, -z + c], [r2, 0, -r2], EDGE_UV);
  quad([-x + c, y - c, z], [x - c, y - c, z], [x - c, y, z - c], [-x + c, y, z - c], [0, r2, r2], EDGE_UV);
  quad([x - c, -y + c, z], [-x + c, -y + c, z], [-x + c, -y, z - c], [x - c, -y, z - c], [0, -r2, r2], EDGE_UV);
  quad([x - c, y - c, -z], [-x + c, y - c, -z], [-x + c, y, -z + c], [x - c, y, -z + c], [0, r2, -r2], EDGE_UV);
  quad([-x + c, -y + c, -z], [x - c, -y + c, -z], [x - c, -y, -z + c], [-x + c, -y, -z + c], [0, -r2, -r2], EDGE_UV);
  quad([-x, y - c, z - c], [-x + c, y, z - c], [-x + c, y, -z + c], [-x, y - c, -z + c], [-r2, r2, 0], EDGE_UV);
  quad([x - c, y, z - c], [x, y - c, z - c], [x, y - c, -z + c], [x - c, y, -z + c], [r2, r2, 0], EDGE_UV);
  quad([-x + c, -y, z - c], [-x, -y + c, z - c], [-x, -y + c, -z + c], [-x + c, -y, -z + c], [-r2, -r2, 0], EDGE_UV);
  quad([x, -y + c, z - c], [x - c, -y, z - c], [x - c, -y, -z + c], [x, -y + c, -z + c], [r2, -r2, 0], EDGE_UV);

  // eight corner triangles close the shell
  const r3 = 1 / Math.sqrt(3);
  const tri = (
    a: [number, number, number], b: [number, number, number], cc: [number, number, number],
    n: [number, number, number],
  ) => {
    for (const pt of [a, b, cc]) { position.push(pt[0], pt[1], pt[2]); normal.push(n[0], n[1], n[2]); uv.push(0, 0); }
  };
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
    const a: [number, number, number] = [sx * (x - c), sy * y, sz * (z - c)];
    const b: [number, number, number] = [sx * x, sy * (y - c), sz * (z - c)];
    const e: [number, number, number] = [sx * (x - c), sy * (y - c), sz * z];
    const winding = sx * sy * sz > 0 ? [a, b, e] : [a, e, b];
    tri(winding[0]!, winding[1]!, winding[2]!, [sx * r3, sy * r3, sz * r3]);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normal, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.computeBoundingSphere();
  chamferCache.set(key, geometry);
  return geometry;
}

/** Drop-in for `<boxGeometry args={[w, h, d]} />`. Every case part in the room goes through it,
 *  so the eased arris is not a thing anyone has to remember to ask for. */
function ChamferedBox({ args }: { args: [number, number, number] }) {
  return <primitive object={sharedBox(args[0], args[1], args[2])} attach="geometry" />;
}

/** One BoxGeometry per distinct size, shared by every mesh that wants it. */
const boxCache = new Map<string, THREE.BufferGeometry>();
function sharedBox(w: number, h: number, d: number): THREE.BufferGeometry {
  const key = `${w.toFixed(5)}|${h.toFixed(5)}|${d.toFixed(5)}`;
  let geometry = boxCache.get(key);
  if (!geometry) {
    geometry = chamferedBox(w, h, d);
    boxCache.set(key, geometry);
  }
  return geometry;
}

/** A cast-iron grate: perimeter frame, three ribs front to back, two crossing them. One of
 *  these sits over each pair of burners, the way a pro range is actually built. The burners
 *  before this were flat discs with a brass dot on top — printed circles, not something you
 *  could stand a pan on. */
const GRATE_GEOMETRY = mergeBoxesLazy(() => [
  { w: 0.30, h: 0.016, d: 0.012, z: -0.205 },
  { w: 0.30, h: 0.016, d: 0.012, z: 0.205 },
  { w: 0.012, h: 0.016, d: 0.42, x: -0.144 },
  { w: 0.012, h: 0.016, d: 0.42, x: 0.144 },
  { w: 0.010, h: 0.016, d: 0.42, x: -0.072 },
  { w: 0.010, h: 0.016, d: 0.42, x: 0 },
  { w: 0.010, h: 0.016, d: 0.42, x: 0.072 },
  { w: 0.30, h: 0.014, d: 0.010, z: -0.075 },
  { w: 0.30, h: 0.014, d: 0.010, z: 0.075 },
]);

const REUSE_MATRIX = new THREE.Matrix4();
const REUSE_QUATERNION = new THREE.Quaternion();
const REUSE_EULER = new THREE.Euler();
const REUSE_POSITION = new THREE.Vector3();
const REUSE_SCALE = new THREE.Vector3(1, 1, 1);

type Placement = { position: [number, number, number]; rotation?: [number, number, number] };

/** Draws N copies of one geometry in one call. The placements are static per size, so the matrix
 *  buffer is written once in a layout effect rather than every frame. */
function InstancedParts({
  geometry, material, placements, castShadow = false, receiveShadow = false,
}: {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  placements: readonly Placement[];
  castShadow?: boolean;
  receiveShadow?: boolean;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    placements.forEach((placement, index) => {
      REUSE_POSITION.set(placement.position[0], placement.position[1], placement.position[2]);
      REUSE_EULER.set(placement.rotation?.[0] ?? 0, placement.rotation?.[1] ?? 0, placement.rotation?.[2] ?? 0);
      REUSE_QUATERNION.setFromEuler(REUSE_EULER);
      REUSE_MATRIX.compose(REUSE_POSITION, REUSE_QUATERNION, REUSE_SCALE);
      mesh.setMatrixAt(index, REUSE_MATRIX);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [placements]);
  if (placements.length === 0) return null;
  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, placements.length]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      frustumCulled={false}
    />
  );
}

/** One geometry from many boxes that share a material and never move relative to each other.
 *  A carcass is six draw calls as six meshes and one as a merged shell; the vertices are
 *  identical either way. Cached by shape, so a run of identical bays builds it once. */
type BoxPart = {
  w: number; h: number; d: number;
  x?: number; y?: number; z?: number;
  rx?: number; ry?: number; rz?: number;
};

const mergedCache = new Map<string, THREE.BufferGeometry>();

let grateGeo: THREE.BufferGeometry | null = null;
function mergeBoxesLazy(make: () => BoxPart[]): () => THREE.BufferGeometry {
  return () => {
    if (!grateGeo) grateGeo = mergeBoxes(make());
    return grateGeo;
  };
}

function mergeBoxes(parts: readonly BoxPart[]): THREE.BufferGeometry {
  const key = parts
    .map((p) => [p.w, p.h, p.d, p.x ?? 0, p.y ?? 0, p.z ?? 0, p.rx ?? 0, p.ry ?? 0, p.rz ?? 0]
      .map((n) => n.toFixed(5)).join(','))
    .join(';');
  const cached = mergedCache.get(key);
  if (cached) return cached;

  type Piece = { position: THREE.BufferAttribute; normal: THREE.BufferAttribute; uv: THREE.BufferAttribute; dispose: () => void };
  const pieces: Piece[] = parts.map((part) => {
    const geometry = chamferedBox(part.w, part.h, part.d).clone();
    REUSE_POSITION.set(part.x ?? 0, part.y ?? 0, part.z ?? 0);
    REUSE_EULER.set(part.rx ?? 0, part.ry ?? 0, part.rz ?? 0);
    REUSE_QUATERNION.setFromEuler(REUSE_EULER);
    REUSE_MATRIX.compose(REUSE_POSITION, REUSE_QUATERNION, REUSE_SCALE);
    geometry.applyMatrix4(REUSE_MATRIX);
    return {
      position: geometry.attributes.position as THREE.BufferAttribute,
      normal: geometry.attributes.normal as THREE.BufferAttribute,
      uv: geometry.attributes.uv as THREE.BufferAttribute,
      dispose: () => geometry.dispose(),
    };
  });

  const total = pieces.reduce((sum, piece) => sum + piece.position.count, 0);
  const position = new Float32Array(total * 3);
  const normal = new Float32Array(total * 3);
  const uv = new Float32Array(total * 2);
  let vertex = 0;
  for (const piece of pieces) {
    position.set(piece.position.array as Float32Array, vertex * 3);
    normal.set(piece.normal.array as Float32Array, vertex * 3);
    uv.set(piece.uv.array as Float32Array, vertex * 2);
    vertex += piece.position.count;
    piece.dispose();
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(position, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(normal, 3));
  merged.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  merged.computeBoundingSphere();
  mergedCache.set(key, merged);
  return merged;
}

/* ————— the snake plant —————
 * Drawn, not scanned: the room's rule is clean-room geometry and generated textures, and a
 * Sansevieria is the one houseplant that actually suits being built rather than photographed —
 * stiff sword blades with no branching and no leaf litter. The scanned fig on the island is
 * 8,929 triangles; all nine blades here come to about 1,000, in one draw call.
 */

/** One blade: a flattened lens cross-section lofted up a curve that leans out and twists.
 *  `azimuth` points it away from the centre of the pot; the rest is per-blade character. */
function snakeBladeGeometry(
  azimuth: number, height: number, maxWidth: number, lean: number, twist: number, bow: number,
  base = 0.02,
): THREE.BufferGeometry {
  const SECTIONS = 13;
  const THICKNESS = 0.0075;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let section = 0; section <= SECTIONS; section += 1) {
    const t = section / SECTIONS;
    // A blade is narrow where it leaves the soil, widest around a third of the way up, and
    // tapers to a point. sin gives the belly; the last term keeps the tip from blunting.
    const width = maxWidth * Math.sin(Math.PI * Math.min(1, t * 0.85 + 0.06)) * (1 - t * t * 0.35);
    const y = height * t;
    // leans out as it rises, then bows back slightly at the tip the way a tall blade gives
    // starts out at `base` — real blades leave the soil spread across the pot, not from a
    // single point, and a clump that all radiates from one spot reads as flat from any angle
    const out = base + lean * t * t + bow * Math.sin(Math.PI * t) * 0.5;
    const roll = twist * t;
    const cx = Math.cos(azimuth) * out;
    const cz = Math.sin(azimuth) * out;
    // the blade's own frame: `across` spans its width, `face` its thickness
    const acrossX = Math.cos(azimuth + Math.PI / 2) * Math.cos(roll);
    const acrossZ = Math.sin(azimuth + Math.PI / 2) * Math.cos(roll);
    const acrossY = Math.sin(roll) * 0.35;
    const faceX = Math.cos(azimuth);
    const faceZ = Math.sin(azimuth);

    const half = width / 2;
    const bulge = THICKNESS / 2;
    // four points: left edge, front belly, right edge, back belly
    positions.push(
      cx - acrossX * half, y - acrossY * half, cz - acrossZ * half,
      cx + faceX * bulge, y, cz + faceZ * bulge,
      cx + acrossX * half, y + acrossY * half, cz + acrossZ * half,
      cx - faceX * bulge, y, cz - faceZ * bulge,
    );
    uvs.push(0, t, 0.5, t, 1, t, 0.5, t);
  }

  for (let section = 0; section < SECTIONS; section += 1) {
    const a = section * 4;
    const b = a + 4;
    for (let corner = 0; corner < 4; corner += 1) {
      const next = (corner + 1) % 4;
      indices.push(a + corner, b + corner, b + next, a + corner, b + next, a + next);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** Nine blades of deliberately unequal height, welded into one geometry. Fixed numbers, not
 *  random ones: the scene certification compares frames between runs. */
const SNAKE_BLADES: readonly [number, number, number, number, number][] = [
  // [azimuth turns, height, maxWidth, lean, twist]. Fifteen blades in two loose ranks — nine
  // read as a clump of grass from across the room, which is what the first pass looked like.
  // The tall ones stand near-vertical in the middle; the short ones splay at the edge, which is
  // how a Sansevieria actually fills a pot.
  [0.03, 0.94, 0.082, 0.05, 0.20],
  [0.11, 0.78, 0.074, 0.09, -0.28],
  [0.19, 1.02, 0.079, 0.04, 0.14],
  [0.28, 0.66, 0.068, 0.15, 0.32],
  [0.36, 0.88, 0.080, 0.07, -0.18],
  [0.44, 0.72, 0.070, 0.13, 0.26],
  [0.52, 0.98, 0.078, 0.05, -0.12],
  [0.60, 0.61, 0.064, 0.18, 0.34],
  [0.68, 0.84, 0.076, 0.08, -0.24],
  [0.76, 0.69, 0.067, 0.14, 0.18],
  [0.83, 0.91, 0.081, 0.06, -0.30],
  [0.90, 0.57, 0.060, 0.20, 0.28],
  [0.96, 0.80, 0.073, 0.10, -0.16],
  [0.34, 0.52, 0.056, 0.23, 0.38],
  [0.72, 0.48, 0.053, 0.25, -0.34],
];

let snakeFoliage: THREE.BufferGeometry | null = null;
function snakeFoliageGeometry(): THREE.BufferGeometry {
  if (snakeFoliage) return snakeFoliage;
  const blades = SNAKE_BLADES.map(([turns, height, width, lean, twist], index) =>
    snakeBladeGeometry(
      turns * Math.PI * 2, height, width, lean, twist,
      (index % 2 ? 1 : -1) * 0.012,
      // shorter blades sit further out, the way the outer rank of a clump does
      0.012 + (1 - height / 1.02) * 0.055,
    ));
  const total = blades.reduce((sum, blade) => sum + blade.attributes.position!.count, 0);
  const indexTotal = blades.reduce((sum, blade) => sum + blade.index!.count, 0);
  const position = new Float32Array(total * 3);
  const normal = new Float32Array(total * 3);
  const uv = new Float32Array(total * 2);
  const index = new Uint16Array(indexTotal);
  let vertex = 0;
  let element = 0;
  for (const blade of blades) {
    position.set(blade.attributes.position!.array as Float32Array, vertex * 3);
    normal.set(blade.attributes.normal!.array as Float32Array, vertex * 3);
    uv.set(blade.attributes.uv!.array as Float32Array, vertex * 2);
    const source = blade.index!.array;
    for (let i = 0; i < source.length; i += 1) index[element + i] = source[i]! + vertex;
    vertex += blade.attributes.position!.count;
    element += source.length;
    blade.dispose();
  }
  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(position, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(normal, 3));
  merged.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  merged.setIndex(new THREE.BufferAttribute(index, 1));
  merged.computeBoundingSphere();
  snakeFoliage = merged;
  return merged;
}

/** A floor plant for the corner. The pot echoes the island rather than the wall, so the corner
 *  reads as placed rather than as somewhere a plant ended up. */
function SnakePlant({ position, rotation = 0, scale = 1 }: {
  position: [number, number, number]; rotation?: number; scale?: number;
}) {
  const foliage = snakeFoliageGeometry();
  const materials = useMemo(() => ({
    leaf: new THREE.MeshStandardMaterial({
      map: getSnakePlantTexture(), roughness: 0.62, side: THREE.DoubleSide,
    }),
    pot: new THREE.MeshStandardMaterial({ color: '#2b2724', roughness: 0.78 }),
    soil: new THREE.MeshStandardMaterial({ color: '#241f19', roughness: 0.97 }),
  }), []);
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <mesh material={materials.pot} position={[0, 0.125, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.165, 0.108, 0.25, 24, 1, true]} />
      </mesh>
      {/* a thrown pot has a rolled lip; without one the wall reads straight through the rim */}
      <mesh material={materials.pot} position={[0, 0.248, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.165, 0.012, 8, 26]} />
      </mesh>
      <mesh material={materials.soil} position={[0, 0.232, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.162, 24]} />
      </mesh>
      <mesh geometry={foliage} material={materials.leaf} position={[0, 0.228, 0]} castShadow />
    </group>
  );
}

/* ————— parallax-corrected reflections —————
 * three.js applies one environment map to every object in the scene, sampled purely by reflection
 * direction, as though the probe were infinitely far away. That is right for a sky and wrong for a
 * room: the fridge stands five metres from where this room's probe was baked and faces a different
 * way, so it reflected the room as seen from beside the island. Averaged over a reflection lobe,
 * "somewhere else" resolves to one flat tone — which is exactly how that panel had been reading,
 * through five attempts at fixing its material before I looked at the cause.
 *
 * The room is a box and its bounds are known, so the ray can simply be intersected with it: find
 * where the reflection actually lands on a wall, then re-aim the lookup from the probe to that
 * point. This is the standard interior technique in game engines, and it costs one ray-box
 * intersection per fragment and no extra texture.
 *
 * Applied only to the surfaces where a reflection is doing visible work. Every patched material
 * needs its own program-cache key or three.js hands them all the same compiled shader.
 */
const ROOM_MIN = new THREE.Vector3(-4.98, 0, -1.83);
const ROOM_MAX = new THREE.Vector3(5.72, 3.38, 5.6);
const ROOM_PROBE = new THREE.Vector3(0.4, 1.5, 0.9);

function boxProjectEnv(material: THREE.Material): void {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.envBoxMin = { value: ROOM_MIN };
    shader.uniforms.envBoxMax = { value: ROOM_MAX };
    shader.uniforms.envProbe = { value: ROOM_PROBE };

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vEnvBoxPos;')
      .replace(
        '#include <worldpos_vertex>',
        '#include <worldpos_vertex>\n\tvEnvBoxPos = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;',
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vEnvBoxPos;
uniform vec3 envBoxMin;
uniform vec3 envBoxMax;
uniform vec3 envProbe;
vec3 envBoxProject( vec3 dir ) {
  vec3 inv = 1.0 / dir;
  vec3 near = ( envBoxMin - vEnvBoxPos ) * inv;
  vec3 far = ( envBoxMax - vEnvBoxPos ) * inv;
  vec3 fars = max( near, far );
  float t = min( min( fars.x, fars.y ), fars.z );
  // a ray parallel to an axis gives an infinite t; fall back to the raw direction
  if ( !( t > 0.0 ) || t > 1000.0 ) return dir;
  return normalize( ( vEnvBoxPos + dir * t ) - envProbe );
}`,
      )
      // `onBeforeCompile` hands over the shader with its `#include` directives still unexpanded,
      // so `getIBLRadiance` is not in the string yet and a search for it silently matches nothing.
      // Substitute the chunk itself, patched.
      .replace(
        '#include <envmap_physical_pars_fragment>',
        THREE.ShaderChunk.envmap_physical_pars_fragment.replace(
          'vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );',
          'vec4 envMapColor = textureCubeUV( envMap, envMapRotation * envBoxProject( reflectVec ), roughness );',
        ),
      );
  };
  material.customProgramCacheKey = () => `boxproj-${material.uuid}`;
  material.needsUpdate = true;
}

/* ————— shadow governor —————
 * The directional light re-rendered every shadow-casting mesh into the shadow map on every
 * frame — 369 of the scene's draw calls — for a room that, once the fronts settle, does not
 * move at all. Anything that actually moves asks for a refresh; nothing else pays for one.
 */
let shadowFramesOwed = 3;
function requestShadowUpdate(frames = 2) {
  if (frames > shadowFramesOwed) shadowFramesOwed = frames;
}

function ShadowGovernor() {
  const gl = useThree((state) => state.gl);
  const warmUntil = useRef(0);
  useEffect(() => {
    gl.shadowMap.autoUpdate = false;
    // The kit GLB, the scanned plant and the HDR all arrive through Suspense over the first
    // couple of seconds, each adding casters. A map frozen before they land is missing them —
    // caught by a pixel diff against the previous build: the uppers and the range wall came out
    // measurably brighter because ~180 kit meshes were casting nothing. Keep refreshing until
    // the room has finished assembling itself, then stop.
    warmUntil.current = performance.now() + 4000;
    requestShadowUpdate(3);
    return () => { gl.shadowMap.autoUpdate = true; };
  }, [gl]);
  useFrame(() => {
    if (performance.now() < warmUntil.current) {
      gl.shadowMap.needsUpdate = true;
      return;
    }
    if (shadowFramesOwed <= 0) return;
    shadowFramesOwed -= 1;
    gl.shadowMap.needsUpdate = true;
  });
  return null;
}

/** 32 mm line boring. 3.5 mm across: it reads as a dotted line, never as a lit object, so it
 *  neither casts nor receives a shadow. */
const BORE_GEOMETRY = new THREE.CircleGeometry(0.0035, 8);
const BORE_MATERIAL = new THREE.MeshStandardMaterial({ color: '#6d6154', roughness: 0.9 });

/** Dovetail pins, seen only when a drawer is open and only from above. Both drawer-box
 *  thicknesses land within a millimetre of each other at this size, so one pin serves both. */
const DOVETAIL_GEOMETRY = new THREE.BoxGeometry(0.0102, 0.007, 0.0102);
const DOVETAIL_ROTATION: [number, number, number] = [0, Math.PI / 4, 0];

/** Kit meshes carry baked per-vertex AO (COLOR_0) — clone the live material with
 *  vertexColors on so the bake multiplies under the dynamic finish. */
export type LightMode = 'neutral' | 'lived-in' | 'dusk';
export type WallTone = 'warm' | 'limewash' | 'gallery';
export type GlowTemp = '2700' | '3000' | '3500';
export const GLOW: Record<GlowTemp, { main: string; deep: string; strip: string }> = {
  '2700': { main: '#ffcd85', deep: '#ffb35f', strip: '#ffd28e' },
  '3000': { main: '#ffd9a0', deep: '#ffc36b', strip: '#ffd79a' },
  '3500': { main: '#ffe8c6', deep: '#ffd9a4', strip: '#ffe9c2' },
};
export type StoneFinish = 'polished' | 'honed';
export type IslandTone = 'match' | 'graphite' | 'harbor' | 'ink' | 'soot';
// Tried and reverted: cooling these in hue, to #ded9d0 / #d4cec3 / #e4e3de, taking `warm` from
// red-minus-blue +21 to +14. These are the largest shadow-bearing surfaces in the room, so it was
// the obvious remaining lever on the staged-light axis after the sky reached its limit.
//
// It works, slightly, and not enough. Evening/Upper -2.7 to -4.1, Afternoon/Upper 29.3 to 28.1,
// most other views about a point. No view crosses the reference band that was not already inside
// it. The room still looked warm and the fridge guard stayed healthy at +14.8 against +17.0, so
// there was no visible cost either — but a one-point metric gain is not a reason to change three
// of the shop's named wall colours. That is a design decision and it is not mine to make on this
// evidence. The measurement is the useful part: the walls are worth about a point, which means
// they are not the dominant source of warmth in the shadows any more than the lamps were.
const WALL_TONES: Record<WallTone, string> = {
  warm: '#e0d9cb',
  limewash: '#d6cebd',
  gallery: '#e6e3da',
};
const GRADE: Record<LightMode, {
  exposure: number; ambient: number; hemi: number; keyInt: number; key: string;
  fill: string; fillInt: number; env: number; sky: string; rect: string; rectInt: number;
  practicals: number; sun: number; bg: string;
  bounceFloor: string; bounceFloorInt: number; bounceStone: string; bounceStoneInt: number;
}> = {
  neutral: { exposure: 0.80, ambient: 0.22, hemi: 0.48, keyInt: 0.86, key: '#fffdf8', fill: '#eaf1f2', fillInt: 0.34, env: 2.9, sky: 'day', rect: '#f8fbff', rectInt: 0.62, practicals: 0.4, sun: 1.9, bg: '#ebe9e2', bounceFloor: '#c99a63', bounceFloorInt: 0.15, bounceStone: '#f4efe4', bounceStoneInt: 0.12 },
  'lived-in': { exposure: 0.78, ambient: 0.14, hemi: 0.34, keyInt: 0.72, key: '#fff4df', fill: '#ffe8c7', fillInt: 0.22, env: 2.7, sky: 'day', rect: '#fff1d8', rectInt: 0.85, practicals: 1.0, sun: 1.65, bg: '#e8e1d6', bounceFloor: '#c98f4f', bounceFloorInt: 0.2, bounceStone: '#f7f0e0', bounceStoneInt: 0.15 },
  dusk: { exposure: 0.58, ambient: 0.07, hemi: 0.12, keyInt: 0.1, key: '#8fa3c4', fill: '#5d6f8e', fillInt: 0.12, env: 2.4, sky: 'dusk', rect: '#7d90b5', rectInt: 0.26, practicals: 2.1, sun: 0.42, bg: '#20222b', bounceFloor: '#6d5637', bounceFloorInt: 0.5, bounceStone: '#8e8fa0', bounceStoneInt: 0.45 },
};

const aoCache = new WeakMap<THREE.Material, THREE.Material>();
function withAO(base: THREE.Material): THREE.Material {
  let m = aoCache.get(base);
  if (!m) {
    m = base.clone();
    (m as THREE.MeshStandardMaterial).vertexColors = true;
    aoCache.set(base, m);
  }
  return m;
}

function KitMesh({
  geometry, base, ...props
}: { geometry: THREE.BufferGeometry; base: THREE.Material } & Omit<React.ComponentProps<'mesh'>, 'geometry'>) {
  const mat = useMemo(() => (geometry.getAttribute('color') ? withAO(base) : base), [geometry, base]);
  // A kit part arriving late is a new caster; the frozen shadow map has to be told.
  useEffect(() => { requestShadowUpdate(); }, [geometry]);
  return <mesh geometry={geometry} material={mat} castShadow receiveShadow {...(props as Record<string, unknown>)} />;
}

/* ————— build sequence: parts are born onto the bench in order ————— */

// start < 0 means "settled" (no animation); otherwise a performance.now() epoch.
const BuildTimeCtx = createContext<{ start: number }>({ start: -1 });

/** Wraps a part with a birth time (seconds into the build). Before birth it is
 *  invisible; at birth it lowers into place from above-front and settles. */
function Built({
  at, dur = 0.5, from = [0, 0.85, 0.55], children,
}: { at: number; dur?: number; from?: [number, number, number]; children: React.ReactNode }) {
  const ctx = useContext(BuildTimeCtx);
  const g = useRef<THREE.Group>(null);
  // `settled` latches once the part has arrived. Without it this wrote position and rotation on
  // every group on every frame forever, which marks the matrix dirty and makes three.js walk and
  // recompute the whole subtree's world matrices for a room that is not moving.
  const settled = useRef(false);
  useFrame(() => {
    const gr = g.current;
    if (!gr) return;
    if (ctx.start < 0) {
      if (settled.current) return;
      settled.current = true;
      requestShadowUpdate();
      gr.visible = true;
      gr.position.set(0, 0, 0);
      gr.rotation.z = 0;
      return;
    }
    const t = (performance.now() - ctx.start) / 1000 - at;
    if (t <= 0) {
      if (gr.visible) gr.visible = false;
      settled.current = false;
      return;
    }
    const k = Math.min(1, t / dur);
    if (k >= 1) {
      if (settled.current) return;
      settled.current = true;
      requestShadowUpdate();
      gr.visible = true;
      gr.position.set(0, 0, 0);
      gr.rotation.z = 0;
      return;
    }
    settled.current = false;
    requestShadowUpdate();
    // ease-out quintic: the part arrives fast and lands soft, instead of coasting in
    const e = 1 - Math.pow(1 - k, 5);
    gr.visible = true;
    gr.position.set(from[0] * (1 - e), from[1] * (1 - e), from[2] * (1 - e));
    gr.rotation.z = 0.04 * (1 - e);
  });
  return <group ref={g}>{children}</group>;
}

/* ————— openings state ————— */

type OpeningsApi = { openAll: boolean; get: (id: string) => boolean; toggle: (id: string) => void };
const OpeningsCtx = createContext<OpeningsApi>({ openAll: false, get: () => false, toggle: () => {} });

type OpenKind = 'door-left' | 'door-right' | 'liftup' | 'drawer' | 'pullout';

/** True while the front this sits inside is open or on its way open. Lets the parts that only
 *  exist behind a closed door skip being built at all. */
const FrontOpenCtx = createContext(false);

/** Per-kind weight. A drawer on undermount glides is quicker and lighter than a door on its
 *  hinges; a lift-up carries the most mass and settles slowest. Stiffness is in (rad|m)/s^2 per
 *  unit of displacement; damping is derived, so none of these can overshoot. */
const OPENING_MOTION: Record<OpenKind, { axis: 'x' | 'y' | 'z'; travel: number; stiffness: number; epsilon: number }> = {
  'door-left': { axis: 'y', travel: 1.85, stiffness: 46, epsilon: 0.0015 },
  'door-right': { axis: 'y', travel: 1.85, stiffness: 46, epsilon: 0.0015 },
  liftup: { axis: 'x', travel: -1.5, stiffness: 30, epsilon: 0.0015 },
  drawer: { axis: 'z', travel: 0.4, stiffness: 62, epsilon: 0.0004 },
  pullout: { axis: 'z', travel: 0.5, stiffness: 52, epsilon: 0.0004 },
};

/** Wraps an openable front; pivot group animates toward its open pose. */
function Opening({
  id, kind, hinge = [0, 0, 0], children,
}: { id: string; kind: OpenKind; hinge?: [number, number, number]; children: React.ReactNode }) {
  const api = useContext(OpeningsCtx);
  const group = useRef<THREE.Group>(null);
  const open = api.openAll || api.get(id);

  // A door has mass. Exponential damping — `value += (target - value) * k` — starts at full speed,
  // has no weight, and mathematically never arrives, so every front in the room kept writing a
  // new matrix forever. This is a critically damped spring instead: it eases in, carries through,
  // settles without overshoot, and then stops dead. Substepped so a dropped frame cannot make it
  // explode, and snapped to the target inside a millimetre / a tenth of a degree.
  const velocity = useRef(0);
  const asleep = useRef(false);
  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const spec = OPENING_MOTION[kind];
    const target = open ? (kind === 'door-left' ? -spec.travel : spec.travel) : 0;
    const current = spec.axis === 'z' ? g.position.z : spec.axis === 'x' ? g.rotation.x : g.rotation.y;
    if (asleep.current && current === target) return;

    const step = Math.min(delta, 1 / 30);
    let value = current;
    let speed = velocity.current;
    let remaining = Math.min(delta, 0.1);
    while (remaining > 0) {
      const dt = Math.min(step, remaining);
      remaining -= dt;
      // critically damped: damping = 2 * sqrt(stiffness)
      speed += (-spec.stiffness * (value - target) - 2 * Math.sqrt(spec.stiffness) * speed) * dt;
      value += speed * dt;
    }

    if (Math.abs(value - target) < spec.epsilon && Math.abs(speed) < spec.epsilon * 4) {
      value = target;
      speed = 0;
      asleep.current = true;
      requestShadowUpdate();
    } else {
      asleep.current = false;
      requestShadowUpdate();
    }
    velocity.current = speed;
    if (spec.axis === 'z') g.position.z = value;
    else if (spec.axis === 'x') g.rotation.x = value;
    else g.rotation.y = value;
  });

  return (
    <group position={hinge}>
      <FrontOpenCtx.Provider value={open}>
      <group
        ref={group}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          api.toggle(id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        {children}
      </group>
      </FrontOpenCtx.Provider>
    </group>
  );
}

/* ————— materials ————— */

const ISLAND_TONE_CHIP: Record<Exclude<IslandTone, 'match'>, string> = {
  graphite: 'Graphite', harbor: 'Harbor', ink: 'Ink Green', soot: 'Soot',
};

/**
 * Only twelve of the study's forty-four fields reach a material — these, plus whatever
 * `surfaceOf` reads. Keying the material memo on this signature instead of on the whole
 * selection object means changing the layout, the trim, a fitting or the ceiling rebuilds
 * nothing: the room is already built, so it stays built.
 */
/**
 * Constant procedural maps, built once for the page rather than once per material rebuild.
 *
 * These live at module scope because they do not depend on anything the visitor picks, and
 * `useMats` rebuilds on every selection. Measured by patching `createTexture`/`deleteTexture`:
 * the room created three to four GPU textures on every look change and freed none of them —
 * including when the visitor returned to a look they had already chosen, which is the giveaway
 * that nothing was being reused. Repeat that across a session spent trying combinations and it
 * is an unbounded climb; on a software renderer it took the room out entirely.
 */
let steelMaps: { map: THREE.CanvasTexture; rough: THREE.CanvasTexture } | null = null;
function getSteelMaps() {
  if (steelMaps) return steelMaps;
  const steelCanvas = document.createElement('canvas');
  steelCanvas.width = 256;
  steelCanvas.height = 512;
  const steelCtx = steelCanvas.getContext('2d')!;
  steelCtx.fillStyle = '#cfd4d6';
  steelCtx.fillRect(0, 0, 256, 512);
  for (let x = 0; x < 256; x += 1) {
    const grain = Math.sin(x * 2.399) * 0.5 + Math.sin(x * 0.717) * 0.5;
    steelCtx.fillStyle = `rgba(255,255,255,${(0.05 + grain * 0.035).toFixed(3)})`;
    steelCtx.fillRect(x, 0, 1, 512);
  }
  const steelTex = new THREE.CanvasTexture(steelCanvas);
  steelTex.wrapS = THREE.RepeatWrapping;
  steelTex.wrapT = THREE.RepeatWrapping;
  steelTex.colorSpace = THREE.SRGBColorSpace;

  // The brush marks, as roughness. Vertical streaks of slightly different polish are what make
  // a highlight smear down a stainless door instead of sitting on it as a dot.
  // The brush marks, as roughness, and with enough contrast to actually see. The first version
  // varied roughness by about nine percent, which is invisible: the fridge read as one flat grey
  // slab. Real dressed steel swings much harder line to line, and that variation is the only
  // thing distinguishing a brushed panel from a painted one at this distance.
  //
  // The vertical ramp is the honest part of a compromise. A real appliance door reflects the
  // floor at its bottom and the ceiling at its top, so it is darker below — but the scene has a
  // single environment probe baked beside the island, so every panel in the room reflects the
  // same thing no matter where it stands. Rougher toward the floor reproduces that falloff
  // without pretending to a second probe.
  const brushCanvas = document.createElement('canvas');
  brushCanvas.width = 512;
  brushCanvas.height = 64;
  const brushCtx = brushCanvas.getContext('2d')!;
  for (let y = 0; y < 64; y += 1) {
    const down = y / 63;
    for (let x = 0; x < 512; x += 1) {
      const grain = Math.sin(x * 3.113) * 0.5 + Math.sin(x * 1.237) * 0.3 + Math.sin(x * 0.531) * 0.2
        + Math.sin(x * 7.71) * 0.16;
      // three.js multiplies `roughness` by this channel, so a mid-grey map here quietly turned a
      // 0.26 brushed finish into a 0.11 mirror — which then reflected the dark island and read
      // as charcoal. This stays high and swings within the top third.
      const level = Math.max(0, Math.min(255, Math.round(238 + grain * 46 - down * 34)));
      brushCtx.fillStyle = `rgb(${level},${level},${level})`;
      brushCtx.fillRect(x, y, 1, 1);
    }
  }
  const steelRough = new THREE.CanvasTexture(brushCanvas);
  steelRough.wrapS = THREE.RepeatWrapping;
  steelRough.wrapT = THREE.RepeatWrapping;
  // fine brushing, not corduroy — the grain repeats several times across a door
  steelRough.repeat.set(1, 1);
  steelTex.repeat.set(2.2, 1);
  steelMaps = { map: steelTex, rough: steelRough };
  return steelMaps;
}

let meshMapCache: THREE.CanvasTexture | null = null;
function getMeshMap() {
  if (meshMapCache) return meshMapCache;
  const meshCanvas = document.createElement('canvas');
  meshCanvas.width = 96;
  meshCanvas.height = 96;
  const meshCtx = meshCanvas.getContext('2d')!;
  meshCtx.clearRect(0, 0, 96, 96);
  meshCtx.strokeStyle = 'rgba(184,154,94,0.92)';
  meshCtx.lineWidth = 2.2;
  for (let n = -96; n <= 192; n += 12) {
    meshCtx.beginPath(); meshCtx.moveTo(n, 0); meshCtx.lineTo(n + 96, 96); meshCtx.stroke();
    meshCtx.beginPath(); meshCtx.moveTo(n, 96); meshCtx.lineTo(n + 96, 0); meshCtx.stroke();
  }
  const meshMap = new THREE.CanvasTexture(meshCanvas);
  meshMap.wrapS = THREE.RepeatWrapping;
  meshMap.wrapT = THREE.RepeatWrapping;
  meshMap.repeat.set(2.5, 3.4);
  meshMap.colorSpace = THREE.SRGBColorSpace;
  meshMapCache = meshMap;
  return meshMap;
}

function materialSignature(sel: Sel): string {
  return [
    sel.door, sel.species, sel.paintChip, sel.finish, sel.special, sel.stainTone, sel.sheen,
    sel.drawerBox, sel.hardwareFinish, sel.ledTrack, sel.toeLighting, sel.woodTops,
  ].join('|');
}

function useMats(sel: Sel, mode: LightMode = 'lived-in', wallTone: WallTone = 'warm', stoneFinish: StoneFinish = 'polished', plumbing: 'match' | 'stainless' = 'match', islandTone: IslandTone = 'graphite') {
  const P = GRADE[mode].practicals;
  const sky = GRADE[mode].sky;
  const matKey = materialSignature(sel);
  return useMemo(() => {
    const surface = surfaceOf(sel);
    const tex = getSurfaceTexture(surface);
    const heightTex = getSurfaceHeightTexture(surface);
    const pre = isPrefinished(sel.door);
    const gloss = sel.sheen === 'High Gloss' || (pre && sel.door === 'Prefinished Gloss or Matte');
    const rough = pre
      ? sel.door === 'Prefinished Gloss or Matte' ? 0.15 : 0.55
      : { Matte: 0.82, Satin: 0.6, 'Semi Gloss': 0.42, 'High Gloss': 0.22 }[sel.sheen] ?? 0.6;
    const isPaint = surface.kind !== 'wood';

    // sprayed film finish: every sheen carries a clear coat — this is what makes it
    // read as stained-and-polished furniture instead of raw boards
    const coat = pre
      ? sel.door === 'Prefinished Gloss or Matte' ? 1.0 : 0.2
      : { Matte: 0.04, Satin: 0.14, 'Semi Gloss': 0.42, 'High Gloss': 1.0 }[sel.sheen] ?? 0.14;
    const coatRough = { Matte: 0.55, Satin: 0.46, 'Semi Gloss': 0.24, 'High Gloss': 0.08 }[sel.sheen] ?? 0.46;
    // Sprayed lacquer never levels perfectly: it lands as droplets that flow together and leave a
    // sub-millimetre dimpling. A painted door is essentially one colour, so none of its realism is
    // in the albedo — it is entirely in how that dimpling breaks the highlight. Without it, every
    // painted surface in the room carried one flat roughness and returned a clean mirror, which is
    // what a moulded plastic part does.
    const peel = getOrangePeelMaps();
    const mk = (tint: number, r: number) => {
      const m = new THREE.MeshPhysicalMaterial({ clearcoat: coat, clearcoatRoughness: coatRough });
      m.map = tex;
      if (isPaint) {
        // Roughness only, deliberately. The first version also bound the matching height map as a
        // bumpMap, and those two extra texture units were enough to kill the whole renderer on
        // software WebGL: the scene certification came back with a mean of 0.00 — a black frame —
        // the moment a second painted material forced a shader relink. Orange peel is an optical
        // effect at this scale anyway; sub-millimetre dimples do not need to perturb a normal,
        // they need to break the highlight, and the roughness map alone does that.
        m.roughnessMap = peel.rough;
      } else {
        m.bumpMap = heightTex ?? tex;
        m.bumpScale = heightTex ? 0.009 : 0.014; // finish levels the surface — grain is felt, not carved
        // Open grain scatters where the flat of the board reflects, so a highlight crossing a
        // door breaks along it. Same reasoning as the peel on the painted fronts.
        m.roughnessMap = getGrainRoughnessTexture(surface);
      }
      m.color = new THREE.Color(1, 1, 1).multiplyScalar(tint);
      m.roughness = r;
      m.metalness = 0.02;
      m.envMapIntensity = 0.55;
      return m;
    };

    const front = mk(1, rough);
    // grain runs the length of every member, the way lumber actually does:
    // stiles carry the base map (vertical), rails get the cross-grain rotation
    const railTex = getSurfaceTextureVariant(surface, 'front-rail', [0.5, 0.8], Math.PI / 2);
    const frontRail = mk(1, rough);
    frontRail.map = railTex;
    if (!isPaint) frontRail.bumpMap = railTex;
    const panel = mk(0.955, Math.min(1, rough + 0.08));
    const carcass = mk(0.9, 0.82);
    const accentTex = getSurfaceTexture({
      kind: 'paint', species: 'Paint Grade', paintChip: ISLAND_TONE_CHIP[islandTone === 'match' ? 'graphite' : islandTone], stainMult: 1,
      bleach: false, toner: false, glaze: false, special: 'None',
    });
    const accentFront = new THREE.MeshPhysicalMaterial({
      map: accentTex, color: '#f4f1eb', roughness: 0.58, metalness: 0.02,
      clearcoat: 0.28, clearcoatRoughness: 0.32, envMapIntensity: 0.8,
    });
    const accentPanel = accentFront.clone();
    accentPanel.color.multiplyScalar(0.94);
    accentPanel.roughness = 0.68;
    // An environment map cannot occlude. Left at the default intensity, the inside of a shut
    // cabinet receives the full brightness of the room, and once the environment carried real
    // daylight that lit interior glowed out through every 3 mm reveal — the island read as a
    // stack of light boxes. A closed carcass sees almost none of the room, so it is turned down
    // to match; when a door opens, the ambient, hemisphere and practical lights still fill it.
    const interior = new THREE.MeshStandardMaterial({
      map: getSurfaceTexture({ kind: 'wood', species: 'Maple', paintChip: '', stainMult: 0.98, bleach: false, toner: false, glaze: false, special: 'None' }),
      color: new THREE.Color(1, 1, 1).multiplyScalar(0.94),
      roughness: 0.75,
      envMapIntensity: 0.16,
    });
    const drawerBox = new THREE.MeshStandardMaterial({
      map: getSurfaceTexture({
        kind: 'wood',
        species: sel.drawerBox === '5/8" Hardwood' ? 'Maple' : 'Paint Grade',
        paintChip: '', stainMult: sel.drawerBox === '5/8" Hardwood' ? 0.95 : 1,
        bleach: false, toner: false, glaze: false, special: 'None',
      }),
      roughness: 0.7,
      envMapIntensity: 0.16,
    });
    // Was marble_diff.webp — a running-bond limestone FLOOR, grout joints and all. The Door
    // camera showed the island as a grid of squares, across the top and down the edge fascia,
    // because that is what the file draws. A countertop is one piece of stone; getSlabTextures
    // draws one, seamless in both axes so a 2.6 m island can repeat it without a joint.
    const slab = getSlabTextures();
    const slabTex = slab.map;
    const slabNor = slab.normal;
    const slabRough = slab.rough;
    for (const t of [slabTex, slabNor, slabRough]) t.repeat.set(1.15, 0.75);
    const counter = new THREE.MeshPhysicalMaterial({
      map: sel.woodTops !== 'None' ? getMiscTexture('butcher', 'Maple') : slabTex,
      normalMap: sel.woodTops !== 'None' ? null : slabNor,
      roughnessMap: sel.woodTops !== 'None' ? null : slabRough,
      // polished stone is FLAT. At 0.35 the slab's own normal was catching the grazing
      // light along the 40 mm edge fascia and banding it; the veining should be in the
      // colour and the polish, not in the surface.
      normalScale: new THREE.Vector2(sel.woodTops !== 'None' ? 0.35 : 0.12, sel.woodTops !== 'None' ? 0.35 : 0.12),
      roughness: sel.woodTops !== 'None' ? 0.55 : stoneFinish === 'honed' ? 0.44 : 0.16,
      clearcoat: sel.woodTops !== 'None' ? 0.3 : 0.7,
      // A clearcoat is a SECOND specular lobe stacked on the base one, and at 0.14 it is a very
      // sharp one. Under three pendants hanging a metre above it, polished stone was returning a
      // highlight that clipped to featureless white across a wide band of the counter — the Door
      // camera was the worst-clipping view in the room at 6.4% of frame. Spreading the coat keeps
      // the polish and gives the highlight somewhere to fall off to, which is what a real slab
      // does: it is bright, but you can still read the veining through it.
      clearcoatRoughness: 0.58,
      envMapIntensity: 0.9,
    });
    const wallCounter = new THREE.MeshPhysicalMaterial({
      map: slabTex, normalMap: slabNor, roughnessMap: slabRough, normalScale: new THREE.Vector2(0.12, 0.12),
      roughness: stoneFinish === 'honed' ? 0.44 : 0.16,
      clearcoat: stoneFinish === 'honed' ? 0.15 : 0.7,
      clearcoatRoughness: stoneFinish === 'honed' ? 0.74 : 0.58, envMapIntensity: 0.9,
    });
    const stoneTex = getFileTexture('./assets/materials/polyhaven/marble_diff.webp', { srgb: true, placeholder: getMiscTexture('marble').image as HTMLCanvasElement, key: 'stone' });
    // Measured, not assumed: this stone is worth about five points of shadow warmth in the two
    // views that fail worst — Afternoon/Range 42.4 to 37.1, Afternoon/Sink 40.4 to 34.7 — when
    // tinted cool enough to read as blue-grey limestone, which is not limestone. It also pushes
    // Evening/Upper back OUT of the reference band, -2.7 to +0.9, because the evening room needs
    // the warm bounce this surface gives it. No tint helps both.
    const stone = new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.3, envMapIntensity: 0.8 });
    const kick = new THREE.MeshStandardMaterial({ color: '#221e1a', roughness: 0.92 });
    const hw = new THREE.MeshStandardMaterial({
      color: HARDWARE_FINISHES[sel.hardwareFinish] ?? '#2a2a2a',
      roughness: sel.hardwareFinish === 'Polished Nickel' ? 0.18 : sel.hardwareFinish === 'Brushed Brass' ? 0.38 : 0.5,
      metalness: 0.95, envMapIntensity: 1.4,
    });
    const glide = new THREE.MeshStandardMaterial({ color: '#8d8d8d', roughness: 0.4, metalness: 0.8 });
    const steel = new THREE.MeshStandardMaterial({ color: '#b9bcbe', roughness: 0.35, metalness: 0.9, envMapIntensity: 1.2 });
    // The sink basin is a CAVITY, and the environment map does not know that. The probe is
    // box-projected to the room, so an enclosed steel box sixteen centimetres deep gets handed the
    // whole room's brightness and returns it — the basin came out the same value as the counter
    // around it and read as a shallow tray with a bright bottom, in the camera named after it.
    // The same mistake the transoms made before they were given a falloff: lighting an enclosure
    // as though it were open. A real basin mostly reflects its own walls, so it is darker and
    // softer than the drainboard beside it.
    const basin = steel.clone();
    basin.roughness = 0.52;
    basin.envMapIntensity = 0.42;
    basin.color = new THREE.Color('#9fa4a7');
    // Brushed stainless, rebuilt. The old version painted a hard left-to-right gradient into the
    // albedo — #9ea3a5 → #e2e4e3 → #b6bbbc → #eef0ef → #a4a9aa — which is baked shading fighting
    // the real lights, and it read as a band across the fridge. Worse, it ran metalness 0.42:
    // steel is a metal, and at 0.42 the environment barely reaches it, so the largest appliance
    // in the room came out as a flat pale slab with no reflection in it.
    //
    // A metal's colour IS its reflectance tint, so the albedo goes near-uniform and every bit of
    // variation moves into roughness, where brushing actually lives. The gradient across the door
    // is then produced by the panel reflecting the room, which is what stainless does.
    const { map: steelTex, rough: steelRough } = getSteelMaps();

    // A metal has no diffuse term: everything you see in it is reflection. In a warm interior
    // that means the environment intensity is not a polish setting, it is the brightness of the
    // appliance itself — at 1.25 the fridge reflected a dim room and went nearly black.
    const stainless = new THREE.MeshPhysicalMaterial({
      map: steelTex, roughnessMap: steelRough, color: '#e6eaec',
      // 0.2, not 0.42. A metal's reflection lobe widens with roughness, and by 0.4 it averages so
      // much of the environment that any environment reads as one flat tone — which is what made
      // the fridge a grey slab through four attempts at fixing the map instead of the scalar. It
      // was pushed up to 0.44 to cure a darkness that turned out to be the mid-grey roughness map
      // multiplying it down to 0.11; that map is near-white now, so the scalar can be what a
      // brushed appliance panel actually is.
      roughness: 0.2, metalness: 1, envMapIntensity: 2.2,
    });
    // Choosing stainless should not put a blue panel in the room, and it did. Measured on the
    // default look, the fridge doors came back R-B -46.4 at saturation 0.478 — the only object in
    // the room with a blue cast, at more than twice the saturation of anything else in it.
    //
    // The cause is not the appliance and not the sky. Tonemapping interior.hdr and looking at it
    // shows a blue BAND at wall height running the whole way around: in the bake those walls are
    // lit almost entirely by the Blender world background at (0.085, 0.145, 0.300), because the
    // bake carries two window emitters and some strips for a 10.8 x 8 m room. So the environment's
    // walls are blue while the shipped room's walls are cream at R-B +30, and every mirror in here
    // reflects a room that does not exist. The fridge is the largest flat mirror, so it shows it
    // most.
    //
    // Not corrected at the bake. That world colour is the ONLY source lighting this room's
    // shadows, and cooling it is what finally separated them from the key — six experiments in
    // render_room_env.py converge on it, and warm shadows were the last thing to be fixed here.
    // Re-baking the walls warm would buy a neutral appliance and hand back the heavy shadows.
    //
    // Corrected at the appliance, where there is a real error independent of all that: a
    // refrigerator door is BRUSHED stainless, and this was polished. A brushed panel has a wide
    // reflection lobe that averages the blue band together with the warm ceiling above it and the
    // warm floor below, which is exactly why real ones do not mirror a room. Guard against the
    // known failure on this axis — too much roughness makes the fridge one flat grey slab — is the
    // panel's own sd, which was 24.35 before.
    const applianceBrushed = stainless.clone();
    applianceBrushed.roughness = 0.36;
    applianceBrushed.envMapIntensity = 1.5;
    // Wall-oven fascia: dark smoked stainless, the near-black frame every pro oven actually
    // wears. The surround had been using the bright polished `stainless`, which hands the
    // environment straight back — it read as a pale blue-grey picture frame floating in cream
    // millwork, in every look.
    const applianceDark = new THREE.MeshPhysicalMaterial({
      color: '#3b3e42', roughness: 0.38, metalness: 0.9, envMapIntensity: 0.8,
    });
    const ceramic = new THREE.MeshPhysicalMaterial({ color: '#f4f2ec', roughness: 0.18, clearcoat: 0.8, clearcoatRoughness: 0.1 });
    const bin = new THREE.MeshStandardMaterial({ color: '#5a5e60', roughness: 0.65 });
    const plasterNor = getFileTexture('./assets/materials/polyhaven/plaster_nor.webp', { placeholder: neutralCanvas('#8080ff') });
    plasterNor.repeat.set(6, 2.2);
    const wall = new THREE.MeshStandardMaterial({
      color: WALL_TONES[wallTone], roughness: wallTone === 'limewash' ? 0.98 : 0.95,
      normalMap: plasterNor, normalScale: new THREE.Vector2(wallTone === 'limewash' ? 0.7 : 0.45, wallTone === 'limewash' ? 0.7 : 0.45),
    });
    // photogrammetry oak floor (CC0, Poly Haven wood_floor); the procedural
    // plank canvas paints the very first frame while the scan streams in
    const planks = getFloorPlanksTextures();
    const floorRepeat: [number, number] = [18 / 2.4, 15 / 2.4];
    const floorDiff = getFileTexture('./assets/materials/polyhaven/wood_floor_diff.webp', { srgb: true, placeholder: planks.map.image as HTMLCanvasElement });
    const floorNor = getFileTexture('./assets/materials/polyhaven/wood_floor_nor.webp', { placeholder: neutralCanvas('#8080ff') });
    const floorRough = getFileTexture('./assets/materials/polyhaven/wood_floor_rough.webp', { placeholder: neutralCanvas('#a5a5a5') });
    floorDiff.repeat.set(...floorRepeat);
    floorNor.repeat.set(...floorRepeat);
    floorRough.repeat.set(...floorRepeat);
    const floor = new THREE.MeshPhysicalMaterial({
      map: floorDiff, normalMap: floorNor, normalScale: new THREE.Vector2(0.7, 0.7),
      roughnessMap: floorRough, roughness: 1,
      color: '#f8efdf', clearcoat: 0.12, clearcoatRoughness: 0.5,
    });
    const trim = new THREE.MeshPhysicalMaterial({
      color: '#e9e4d7', roughness: 0.44, clearcoat: 0.2, clearcoatRoughness: 0.3,
    });
    // Glass was asking for it twice: `transmission: 0.72` AND `transparent` with `opacity: 0.34`.
    // Those are two different transparency models stacked on each other — transmission traces the
    // scene behind the surface, opacity just blends it — and the result is milk rather than glass.
    // Transmission alone, at full opacity, with an index of refraction. 1.52 is soda-lime glass,
    // which is what a cabinet pane is, and it is the number that makes an edge bend the light
    // behind it instead of merely dimming it.
    const glass = new THREE.MeshPhysicalMaterial({
      color: '#eef3f1', roughness: 0.07, metalness: 0,
      // A cabinet pane is thin, so `thickness` — which drives how far refraction displaces what
      // is behind the glass — is set to match. It makes no visible difference here either way,
      // which is worth saying plainly: I changed it believing it caused the fine dark lines
      // crossing the glazed doors, and it did not. Those lines are the shelves inside the
      // cabinet, seen edge-on through the glass, tinted by whatever the interior is finished in.
      // They are the cabinet's contents, which is exactly what a glass door is specified to show.
      transmission: 0.94, thickness: 0.0012, ior: 1.52,
      specularIntensity: 1, envMapIntensity: 1.4,
      side: THREE.DoubleSide,
    });
    // A deliberately abstract, procedural exterior. It gives the daylight opening
    // depth and scale without claiming a client location, landscape, or photograph.
    // ————— what is beyond the glass —————
    // Every sightline in the room closes on something except this one, and it is the brightest
    // thing in frame, so the eye goes straight to it. It was a four-stop gradient with 26 ellipses
    // massed along the bottom: a backlit panel with some shrubs on it, and no depth at all.
    //
    // Distance in a landscape is not drawn with detail, it is drawn with ATMOSPHERE. Every
    // kilometre of air between the eye and a hill scatters a little blue into it and washes out
    // its contrast, so a far ridge is pale, low-contrast and cool while a near one is dark, sharp
    // and green. Four ridges, each one nearer, darker and greener than the last, with a haze band
    // laid over the horizon and a treeline whose crowns break the silhouette — that reads as
    // depth, and it stays a generic middle distance with no claim to any real place.
    const daylightCanvas = document.createElement('canvas');
    daylightCanvas.width = 512;
    daylightCanvas.height = 512;
    const daylightCtx = daylightCanvas.getContext('2d')!;
    const dusk = sky === 'dusk';
    const S = 512;

    const skyGradient = daylightCtx.createLinearGradient(0, 0, 0, S);
    if (dusk) {
      skyGradient.addColorStop(0, '#121b31');
      skyGradient.addColorStop(0.34, '#2b3a60');
      skyGradient.addColorStop(0.58, '#6d5a58');
      skyGradient.addColorStop(0.70, '#c07a42');
      skyGradient.addColorStop(0.78, '#e0a061');
    } else {
      // Near-white, barely blue. The saturated cyan band this replaces was the single
      // strongest painted-backdrop tell in the room: an interior photograph surrenders the
      // sky to glare, and in the client's own photography every window does exactly that.
      skyGradient.addColorStop(0, '#c9dde8');
      skyGradient.addColorStop(0.30, '#dcebf1');
      skyGradient.addColorStop(0.58, '#eef4f2');
      skyGradient.addColorStop(0.74, '#f3ecdc');
      skyGradient.addColorStop(0.80, '#f7e9cd');
    }
    daylightCtx.fillStyle = skyGradient;
    daylightCtx.fillRect(0, 0, S, S);

    // A ridge: a soft rolling profile, filled flat. Nearer ridges sit lower and read darker.
    // `blur` is the part that was missing. A ridge ten kilometres away does not have a one-pixel
    // edge against the sky — air softens it, and a hard silhouette is the single clearest tell
    // that a landscape was drawn rather than seen. Each ridge is softened in proportion to how
    // far away it is meant to be, and the nearest treeline keeps its edge.
    const ridge = (baseY: number, amp: number, phase: number, colour: string, alpha: number, blur = 0) => {
      daylightCtx.filter = blur ? `blur(${blur}px)` : 'none';
      daylightCtx.globalAlpha = alpha;
      daylightCtx.fillStyle = colour;
      daylightCtx.beginPath();
      daylightCtx.moveTo(0, S);
      for (let x = 0; x <= S; x += 4) {
        const t = x / S;
        const y = baseY
          - Math.sin(t * Math.PI * 1.6 + phase) * amp
          - Math.sin(t * Math.PI * 4.3 + phase * 2.1) * amp * 0.28
          - Math.sin(t * Math.PI * 9.1 + phase * 0.7) * amp * 0.11;
        daylightCtx.lineTo(x, y);
      }
      daylightCtx.lineTo(S, S);
      daylightCtx.closePath();
      daylightCtx.fill();
      daylightCtx.filter = 'none';
    };

    if (dusk) {
      ridge(338, 13, 1.7, '#5b6480', 0.4, 4);
      ridge(360, 16, 0.4, '#4a5570', 0.55, 2.6);
      ridge(386, 20, 2.1, '#39435c', 0.7, 1.3);
      ridge(414, 24, 3.7, '#262e42', 0.85, 0.5);
    } else {
      // far to near: pale and blue, then progressively deeper, greener and sharper. Four ridges
      // rather than three, and the farthest is barely darker than the sky it sits against —
      // which is what a real distant ridge looks like and what makes the near ones read as near.
      ridge(332, 12, 1.7, '#cbd6d3', 0.55, 4.5);
      ridge(352, 15, 0.4, '#b0c0bd', 0.8, 2.8);
      ridge(378, 19, 2.1, '#93a898', 0.9, 1.4);
      ridge(404, 23, 3.7, '#778f7a', 0.95, 0.5);
    }

    // haze pooling along the horizon — the single strongest depth cue in a landscape
    daylightCtx.globalAlpha = 1;
    const haze = daylightCtx.createLinearGradient(0, 270, 0, 452);
    haze.addColorStop(0, dusk ? 'rgba(200,140,90,0)' : 'rgba(247,240,222,0)');
    haze.addColorStop(0.38, dusk ? 'rgba(206,146,92,0.44)' : 'rgba(249,244,231,0.6)');
    haze.addColorStop(0.66, dusk ? 'rgba(196,136,86,0.3)' : 'rgba(246,241,227,0.4)');
    haze.addColorStop(1, dusk ? 'rgba(180,120,80,0)' : 'rgba(240,236,220,0)');
    daylightCtx.fillStyle = haze;
    daylightCtx.fillRect(0, 270, S, 182);

    // the near treeline, close enough to have crowns rather than a mass
    daylightCtx.fillStyle = dusk ? '#171d2b' : '#596d5a';
    daylightCtx.globalAlpha = dusk ? 0.92 : 0.9;
    daylightCtx.beginPath();
    daylightCtx.moveTo(0, S);
    for (let x = 0; x <= S; x += 3) {
      const t = x / S;
      const crown = 438
        - Math.sin(t * Math.PI * 3.1 + 1.2) * 18
        - Math.sin(t * Math.PI * 11.7) * 9
        - Math.sin(t * Math.PI * 27.3 + 0.6) * 4;
      daylightCtx.lineTo(x, crown);
    }
    daylightCtx.lineTo(S, S);
    daylightCtx.closePath();
    daylightCtx.fill();

    // ground falling away below the treeline
    daylightCtx.globalAlpha = 1;
    const groundGradient = daylightCtx.createLinearGradient(0, 452, 0, S);
    groundGradient.addColorStop(0, dusk ? '#131828' : '#6d7f63');
    groundGradient.addColorStop(1, dusk ? '#0c1020' : '#4f5f47');
    daylightCtx.fillStyle = groundGradient;
    daylightCtx.fillRect(0, 452, S, S - 452);
    const daylightTex = new THREE.CanvasTexture(daylightCanvas);
    daylightTex.colorSpace = THREE.SRGBColorSpace;
    // Daylight needs headroom above the bloom threshold, or an interior LED strip outshines it.
    // Midday reads brightest, the lived-in afternoon sits lower and warmer, dusk gives way to
    // the millwork — each mode owns its own sun.
    const daylightGain = GRADE[mode].sun;
    const daylight = new THREE.MeshBasicMaterial({
      map: daylightTex,
      color: new THREE.Color(daylightGain, daylightGain, daylightGain),
      toneMapped: false,
    });
    const windowFrame = new THREE.MeshStandardMaterial({ color: '#34312c', roughness: 0.52, metalness: 0.18 });
    const meshMap = getMeshMap();
    const metalMesh = new THREE.MeshStandardMaterial({
      map: meshMap, transparent: true, opacity: 0.82, alphaTest: 0.12,
      color: '#c3a66d', metalness: 0.76, roughness: 0.42, side: THREE.DoubleSide,
    });
    // A lit diffuser, not a white bar. The albedo used to be #fff4dd — near white before any
    // light reached it — under fifteen point lights and an emissive of 1.6, so the toe strip
    // sampled rgb(255,255,255): every channel clipped, no hue left, and it read as a fluorescent
    // tube rather than as warm light behind a lens. A mid-grey lens with a lower emissive
    // measures rgb(255,241,175) instead — bright, unmistakably warm, and still the brightest
    // thing on the floor. Roughness goes from 0.4 to 0.85 because a frosted lens does not carry
    // a specular highlight.
    const led = new THREE.MeshStandardMaterial({
      color: '#a8a096', emissive: '#ffdf9e',
      emissiveIntensity: sel.ledTrack !== 'None' || sel.toeLighting !== 'None' ? 0.85 * P : 0, roughness: 0.85,
    });
    // lived-in set dressing, silhouettes referenced from the studio project photos
    const greenery = new THREE.MeshStandardMaterial({ color: '#5d7050', roughness: 0.68, side: THREE.DoubleSide });
    const bloom = new THREE.MeshStandardMaterial({ color: '#f2efe4', roughness: 0.55 });
    const linen = new THREE.MeshStandardMaterial({ color: '#e4decf', roughness: 0.94, side: THREE.DoubleSide });
    const shade = new THREE.MeshStandardMaterial({ color: '#f6f2e8', roughness: 0.82, side: THREE.DoubleSide, emissive: '#ffe9c4', emissiveIntensity: 0.34 });
    const lemon = new THREE.MeshPhysicalMaterial({ color: '#e3bc3f', roughness: 0.44, clearcoat: 0.25, clearcoatRoughness: 0.3 });
    const boardWood = new THREE.MeshStandardMaterial({ map: getMiscTexture('butcher', 'Maple'), roughness: 0.58 });
    const accentRed = new THREE.MeshPhysicalMaterial({ color: '#a8322a', roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.18 });
    // 0.55 and barely metallic. At roughness 0.35 / metalness 0.3 the cooktop deck sat directly
    // under the hood's LED strip and mirrored it, so a near-black enamel measured out as a
    // near-white slab with four discs floating on it. Enamel is not a mirror.
    const cooktop = new THREE.MeshStandardMaterial({ color: '#161614', roughness: 0.55, metalness: 0.08 });
    const terracotta = new THREE.MeshStandardMaterial({ color: '#9a6a4e', roughness: 0.82 });
    const bark = new THREE.MeshStandardMaterial({ color: '#6d5943', roughness: 0.85 });
    const warmStrip = new THREE.MeshStandardMaterial({ color: '#a8a096', emissive: '#ffd79a', emissiveIntensity: 0.95 * P, roughness: 0.85 });
    const brassFixed = new THREE.MeshStandardMaterial({ color: '#b08d4a', roughness: 0.36, metalness: 0.95, envMapIntensity: 1.3 });
    const saddle = new THREE.MeshPhysicalMaterial({ color: '#8a5531', roughness: 0.55, clearcoat: 0.2, clearcoatRoughness: 0.5 });
    const beamWood = new THREE.MeshStandardMaterial({ map: getMiscTexture('butcher', 'Walnut'), color: '#d9c2a0', roughness: 0.78 });
    const amber = new THREE.MeshPhysicalMaterial({ color: '#8a5a22', roughness: 0.15, transmission: 0.55, thickness: 0.01, transparent: true, opacity: 0.85 });
    const plumbingMat = plumbing === 'match' ? hw : steel;
    // Metals and polished stone first, where a wrong reflection is most legible. But the painted
    // fronts need it too: the hood and the wall cabinets are a quarter of the frame, they are
    // large flat white masses, and a sprayed finish at satin sheen still carries a broad specular
    // that was sampling the same distant lookup everywhere. With the environment box-projected
    // they pick up the room they are actually standing in — brighter toward the window, deeper
    // toward the corner — instead of one even tone across two metres of door.
    //
    // The walls and the floor are deliberately NOT in this list. Box projection assumes the shading
    // point is inside the box, and those two are the box: the rear wall runs 10.8 m against a
    // 10.7 m interior and the floor plane is 18 by 15, so their outer parts sit outside it and the
    // ray exits through the wrong face. It put a hard vertical seam down the left wall.
    for (const reflective of [
      stainless, steel, hw, brassFixed, counter, wallCounter, stone, glass,
      front, frontRail, panel, accentFront, accentPanel, carcass,
      applianceBrushed,
      applianceDark,
    ]) {
      boxProjectEnv(reflective);
    }
    const palette = {
      plumbingMat,
      front, frontRail, panel, carcass, accentFront, accentPanel, interior, drawerBox,
      applianceBrushed,
      applianceDark,
      counter, wallCounter, stone, kick, hw, glide, steel, stainless, ceramic, bin,
      wall, floor, trim, glass, daylight, windowFrame, metalMesh, led,
      greenery, bloom, linen, shade, lemon, boardWood, basin,
      accentRed, cooktop, terracotta, bark, warmStrip, brassFixed, beamWood, amber, saddle,
    };
    // Named so a profiler, a scene inspector, or a future reader can tell which of the room's
    // forty materials a given draw call belongs to. Free, and the alternative is guessing by
    // hex value.
    for (const [name, material] of Object.entries(palette)) {
      (material as THREE.Material).name = name;
    }
    return palette;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- matKey is the selection's material identity
  }, [matKey, P, sky, wallTone, stoneFinish, plumbing, islandTone]);
}

type Mats = ReturnType<typeof useMats>;

/* ————— profile geometry (real ogee/cove/step crowns via extrusion) ————— */

function useCrownGeometry(profile: string): THREE.ExtrudeGeometry | null {
  return useMemo(() => {
    if (profile === 'None') return null;
    const s = new THREE.Shape();
    // profile drawn in (z-depth, y-height) plane, extruded along x
    s.moveTo(0, 0);
    if (profile === 'Flat Crown') {
      s.lineTo(0.018, 0); s.lineTo(0.018, 0.075); s.lineTo(0, 0.075);
    } else if (profile === 'Flat Crown w/ Bevel') {
      s.lineTo(0.014, 0); s.lineTo(0.014, 0.05); s.lineTo(0.042, 0.082); s.lineTo(0, 0.082);
    } else if (profile === 'Standard Crown') {
      s.lineTo(0.012, 0); s.lineTo(0.012, 0.02); s.lineTo(0.028, 0.024);
      s.quadraticCurveTo(0.05, 0.045, 0.05, 0.07); s.lineTo(0.056, 0.07); s.lineTo(0.056, 0.086); s.lineTo(0, 0.086);
    } else if (profile === 'Cove Crown') {
      s.lineTo(0.014, 0); s.lineTo(0.014, 0.014);
      s.quadraticCurveTo(0.016, 0.06, 0.052, 0.078); s.lineTo(0.052, 0.09); s.lineTo(0, 0.09);
    } else if (profile === 'RVB Simple Side') {
      s.lineTo(0.016, 0); s.lineTo(0.03, 0.02); s.lineTo(0.03, 0.09); s.lineTo(0, 0.09);
    } else {
      // RVB Block Side
      s.lineTo(0.02, 0); s.lineTo(0.02, 0.036); s.lineTo(0.048, 0.036); s.lineTo(0.048, 0.1); s.lineTo(0, 0.1);
    }
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false });
  }, [profile]);
}

function Crown({ sel, mats, w, y, d, z }: { sel: Sel; mats: Mats; w: number; y: number; d: number; z: number }) {
  const kit = useKit();
  const geo = useCrownGeometry(sel.topTrim);
  if (sel.topTrim === 'None') return null;
  const part = kit?.[CROWN_PARTS[sel.topTrim] ?? ''];
  if (part) {
    return (
      <group position={[0, y, z]}>
        <KitMesh geometry={part} base={mats.front} position={[0, 0, d / 2]} scale={[w + 0.02, 1, 1]} />
        {sel.topTrim === 'RVB Block Side'
          ? [-w / 2 + 0.02, w / 2 - 0.02].map((x) => (
            <mesh key={x} material={mats.front} position={[x, 0.05, d / 2 + 0.02]} castShadow>
              <ChamferedBox args={[0.09, 0.1, 0.05]} />
            </mesh>
          ))
          : null}
      </group>
    );
  }
  if (!geo) return null;
  // Profile drawn in (x=proud-of-face, y=height); extrusion runs along local z.
  // rotY(-90°) maps local z → −x (the run) and profile x → +z (toward the viewer).
  return (
    <group position={[0, y, z]}>
      <mesh
        geometry={geo}
        material={mats.front}
        castShadow
        position={[w / 2, 0, d / 2]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={[1, 1, w]}
      />
      <mesh geometry={geo} material={mats.front} castShadow position={[w / 2, 0, -d / 2]} scale={[1, 1, d]} />
      <mesh geometry={geo} material={mats.front} castShadow position={[-w / 2, 0, d / 2]} rotation={[0, Math.PI, 0]} scale={[1, 1, d]} />
      {sel.topTrim === 'RVB Block Side'
        ? [-w / 2 + 0.02, w / 2 - 0.02].map((x) => (
          <mesh key={x} material={mats.front} position={[x, 0.05, d / 2 + 0.02]} castShadow>
            <ChamferedBox args={[0.09, 0.1, 0.05]} />
          </mesh>
        ))
        : null}
    </group>
  );
}

/* ————— hardware ————— */

function Pull({ sel, mats, w, drawer }: { sel: Sel; mats: Mats; w: number; drawer?: boolean }) {
  const kit = useKit();
  const len = Math.min(drawer ? 0.24 : 0.16, w * 0.6);
  const partName = sel.hardware === 'Cup & Knob' && !drawer
    ? 'pull_knob'
    : PULL_PARTS[sel.hardware] ?? '';
  const part = kit?.[partName];
  if (part) {
    // Every kit pull is authored sitting ON its mounting plane: local X is the length, local Y
    // runs from exactly 0 outward — that is the STANDOFF — and local Z is the bar's own diameter.
    //
    //   pull_slim_bar   X +-0.1262   Y 0 -> 0.0252   Z +-0.0033
    //   pull_bar        X +-0.0858   Y 0 -> 0.0338   Z +-0.0058
    //
    // They were all placed unrotated, so the 25 mm standoff went UP THE FACE of the door and the
    // only thing projecting from it was half a bar diameter — 3.3 mm on the default Slim Bar.
    // That is why the hardware read as a drawn line instead of as metal you can hook a finger
    // behind. Standing it up is the same correction the rails needed in wave 90, and it comes
    // from the same authoring convention.
    //
    // The knob is the exception: it grows along -Z from a base at 0, so it turns instead of
    // tipping.
    const knob = partName === 'pull_knob';
    return (
      <KitMesh
        geometry={part}
        base={mats.hw}
        position={sel.hardware === 'Arch Pull' ? [0, -0.02, 0] : [0, 0, 0]}
        rotation={knob ? [0, Math.PI, 0] : [Math.PI / 2, 0, 0]}
      />
    );
  }
  switch (sel.hardware) {
    case 'Edge Pull':
      return <mesh material={mats.hw} position={[0, 0, 0.012]} castShadow><ChamferedBox args={[len, 0.014, 0.018]} /></mesh>;
    case 'Classic Knob':
    case 'Cup & Knob':
      if (drawer) {
        return (
          <group position={[0, -0.006, 0.014]}>
            <mesh material={mats.hw} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <torusGeometry args={[Math.min(0.042, len / 3), 0.006, 12, 28, Math.PI]} />
            </mesh>
            <mesh material={mats.hw} position={[0, 0.004, -0.003]} castShadow>
              <ChamferedBox args={[Math.min(0.11, len), 0.02, 0.005]} />
            </mesh>
          </group>
        );
      }
      return (
        <group position={[0, 0, 0.008]}>
          <mesh material={mats.hw} castShadow rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.007, 0.01, 0.024, 16]} /></mesh>
          <mesh material={mats.hw} position={[0, 0, 0.022]} castShadow><sphereGeometry args={[0.016, 20, 14]} /></mesh>
        </group>
      );
    case 'Square Ring':
      return (
        <group position={[0, -0.012, 0.012]}>
          <mesh material={mats.hw} castShadow><ChamferedBox args={[0.065, 0.052, 0.005]} /></mesh>
          <mesh material={mats.hw} position={[0, -0.03, 0.015]} castShadow>
            <torusGeometry args={[0.028, 0.0048, 4, 4]} />
          </mesh>
        </group>
      );
    case 'Arch Pull':
      return (
        <mesh material={mats.hw} position={[0, 0, 0.006]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <torusGeometry args={[len / 2.4, 0.0065, 12, 28, Math.PI]} />
        </mesh>
      );
    default: // Shop Bar + Slim Bar procedural fallback
      return (
        <group position={[0, 0, 0.022]}>
          <mesh material={mats.hw} rotation={[0, 0, Math.PI / 2]} castShadow>
            <capsuleGeometry args={[sel.hardware === 'Slim Bar' ? 0.0032 : 0.0055, sel.hardware === 'Slim Bar' ? Math.min(0.24, w * 0.72) : len, 6, 12]} />
          </mesh>
          {[-len / 2.6, len / 2.6].map((x) => (
            <mesh key={x} material={mats.hw} position={[x, 0, -0.011]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.004, 0.004, 0.022, 8]} />
            </mesh>
          ))}
        </group>
      );
  }
}

function EuroHinges({ mats, h }: { mats: Mats; h: number }) {
  const kit = useKit();
  // The kit hinge is 3,264 triangles for a 52 x 35 x 16 mm casting, and there are twelve of them:
  // 39,312 triangles, 23% of everything in the room, for a part that is sealed inside a closed
  // cabinet. It is built the instant a front starts to swing — which is also the first instant
  // anyone can see it — and torn down when the front shuts.
  const visible = useContext(FrontOpenCtx);
  if (!visible) return null;
  return (
    <group>
      {[h * 0.32, -h * 0.32].map((y) => (
        <group key={y} position={[0.012, y, -0.012]}>
          {kit?.hinge_euro ? (
            <KitMesh geometry={kit.hinge_euro} base={mats.glide} rotation={[Math.PI / 2, 0, 0]} />
          ) : (
            <>
              <mesh material={mats.glide}><cylinderGeometry args={[0.017, 0.017, 0.006, 14]} /></mesh>
              <mesh material={mats.glide} position={[0.02, 0.004, 0]}><ChamferedBox args={[0.045, 0.008, 0.016]} /></mesh>
            </>
          )}
        </group>
      ))}
    </group>
  );
}

/* ————— door fronts ————— */

function DoorCenterPanel({
  w, h, depth, upper, sel, mats,
}: { w: number; h: number; depth: number; upper: boolean; sel: Sel; mats: Mats }) {
  const insert = upper && supportsUpperInsert(sel.door) ? sel.upperInsert : 'Solid Panel';
  if (insert === 'Mullion Glass') {
    return (
      <group position={[0, 0, -0.0045]}>
        <mesh material={mats.glass} castShadow receiveShadow>
          <ChamferedBox args={[w, h, Math.max(0.004, depth * 0.55)]} />
        </mesh>
        {/* Cabinet-photo vocabulary: a restrained four-light mullion, not a generic window grid. */}
        <mesh material={mats.front} position={[0, 0, depth * 0.55]} castShadow>
          <ChamferedBox args={[0.018, h, 0.012]} />
        </mesh>
        <mesh material={mats.frontRail} position={[0, 0, depth * 0.55]} castShadow>
          <ChamferedBox args={[w, 0.018, 0.012]} />
        </mesh>
      </group>
    );
  }
  if (insert === 'Metal Mesh') {
    return (
      <group position={[0, 0, -0.0045]}>
        <mesh material={mats.glass} receiveShadow>
          <ChamferedBox args={[w, h, 0.004]} />
        </mesh>
        <mesh material={mats.metalMesh} position={[0, 0, depth * 0.48]} castShadow>
          <planeGeometry args={[w, h]} />
        </mesh>
      </group>
    );
  }
  return (
    <mesh material={mats.panel} position={[0, 0, -0.0045]} castShadow receiveShadow>
      <ChamferedBox args={[w, h, depth]} />
    </mesh>
  );
}

function DoorSlab({
  w, h, sel, mats, drawer = false, plain = false, withHinges = false, hingeSide = 'left', upper = false,
}: {
  w: number; h: number; sel: Sel; mats: Mats;
  drawer?: boolean; plain?: boolean; withHinges?: boolean;
  hingeSide?: 'left' | 'right'; upper?: boolean;
}) {
  const kit = useKit();
  const t = 0.019;
  const door = sel.door;
  const slab = door === 'Hardwood Slab' || door === 'Paint-Grade MDF Slab' || isPrefinished(door) || (drawer && h < 0.18);
  const applied = door.startsWith('Applied Molding');
  const appliedOnSlab = door === 'Applied Molding on Slab';
  const frameBase =
    door === '3" Cope & Stick' ? 0.076
      : door === 'Mitered 2.75"+' ? 0.07
        : door.startsWith('Mitered') ? 0.056 : 0.058;
  // A drawer front is not a door. A shop runs a NARROWER rail on one, because a
  // door-width rail on a front a third the height leaves a bright band top and
  // bottom — and two of those meeting across a 4 mm reveal read as one thick gap
  // between drawers, which is exactly what they were doing here.
  const frame = drawer ? Math.min(frameBase, Math.max(0.034, h * 0.16)) : frameBase;
  const flat = slab || appliedOnSlab;
  // The kit rails are authored LYING DOWN: local X is length, local Y is the 19 mm
  // thickness (show face on +Y), local Z is the 2.25"/3" WIDTH with the panel groove
  // on -Z. They were being placed unrotated, so every rail rendered 19 mm tall and
  // 58 mm DEEP — a thin bar floating in a hole, standing 29 mm proud of the door
  // face. Two of those meeting across a reveal is what read as a gap between drawers.
  // Stand the section up; the placement rotation then aims the grooved edge inward.
  const railProfile: [number, number, number] = [Math.PI / 2, 0, 0];
  // Authored width always equals the door's own rail width, so this is 1 except on
  // drawer fronts, where the rail is deliberately narrowed above.
  const railScaleZ = frame / frameBase;
  const railName = flat ? null : railPartFor(door);
  const railGeo = railName ? kit?.[railName] : undefined;
  // Hardware anchors like a real shop drills them: opposite the hinge, near the reachable
  // corner (top of base doors, bottom of uppers); drawers centered; bars run VERTICAL on doors.
  const isKnob = sel.hardware === 'Classic Knob' || (sel.hardware === 'Cup & Knob' && !drawer);
  const isEdge = sel.hardware === 'Edge Pull';
  const isRing = sel.hardware === 'Square Ring';
  const pullX = drawer ? 0 : (hingeSide === 'left' ? 1 : -1) * (w / 2 - 0.045);
  const pullY = drawer
    ? isEdge ? h / 2 - 0.006 : 0
    : isEdge
      ? (upper ? -h / 2 + 0.006 : h / 2 - 0.006)
      : upper ? -h / 2 + 0.11 : h / 2 - 0.11;
  const vertical = !drawer && !isKnob && !isEdge && !isRing;
  const pullScale = Math.min(1, ((drawer ? w : h) * 0.45) / 0.17);

  return (
    <group>
      {flat ? (
        <RoundedBox args={[w, h, t]} radius={0.0035} smoothness={3} castShadow receiveShadow material={mats.front} />
      ) : railGeo ? (
        // Blender kit frame with real shop joinery: stiles run full height, rails are
        // coped between them (mitered doors instead meet at a visible 45° seam).
        <group>
          <group position={[0, h / 2 - frame / 2, 0]} rotation={[0, 0, Math.PI]}>
            <KitMesh geometry={railGeo} base={mats.frontRail} rotation={railProfile} scale={[Math.max(0.02, w - frame * 2 + 0.004), 1, railScaleZ]} />
          </group>
          <group position={[0, -h / 2 + frame / 2, 0]}>
            <KitMesh geometry={railGeo} base={mats.frontRail} rotation={railProfile} scale={[Math.max(0.02, w - frame * 2 + 0.004), 1, railScaleZ]} />
          </group>
          <group position={[-w / 2 + frame / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <KitMesh geometry={railGeo} base={mats.front} rotation={railProfile} scale={[h, 1, railScaleZ]} />
          </group>
          <group position={[w / 2 - frame / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <KitMesh geometry={railGeo} base={mats.front} rotation={railProfile} scale={[h, 1, railScaleZ]} />
          </group>
          {door.startsWith('Mitered')
            ? ([[-1, 1], [1, 1], [-1, -1], [1, -1]] as [number, number][]).map(([sx, sy]) => (
                <mesh
                  key={`${sx}${sy}`}
                  position={[sx * (w / 2 - frame / 2), sy * (h / 2 - frame / 2), t / 2 + 0.0002]}
                  rotation={[0, 0, sx * sy * -Math.PI / 4]}
                >
                  <planeGeometry args={[0.0012, frame * 1.42]} />
                  <meshStandardMaterial color="#3a332c" roughness={0.9} transparent opacity={0.55} polygonOffset polygonOffsetFactor={-1} />
                </mesh>
              ))
            : null}
          <DoorCenterPanel
            w={Math.max(0.02, w - frame * 2 + 0.004)}
            h={Math.max(0.02, h - frame * 2 + 0.004)}
            depth={t - 0.01}
            upper={upper}
            sel={sel}
            mats={mats}
          />
        </group>
      ) : (
        <group>
          <RoundedBox args={[Math.max(0.02, w - frame * 2 + 0.004), frame, t]} radius={0.003} smoothness={2} position={[0, h / 2 - frame / 2, 0]} castShadow receiveShadow material={mats.frontRail} />
          <RoundedBox args={[Math.max(0.02, w - frame * 2 + 0.004), frame, t]} radius={0.003} smoothness={2} position={[0, -h / 2 + frame / 2, 0]} castShadow receiveShadow material={mats.frontRail} />
          <RoundedBox args={[frame, h, t]} radius={0.003} smoothness={2} position={[-w / 2 + frame / 2, 0, 0]} castShadow material={mats.front} />
          <RoundedBox args={[frame, h, t]} radius={0.003} smoothness={2} position={[w / 2 - frame / 2, 0, 0]} castShadow material={mats.front} />
          {/* sticking profile: 45° beveled strips ringing the panel opening */}
          {(() => {
            const iw = w - frame * 2;
            const ih = h - frame * 2;
            if (iw < 0.04 || ih < 0.04) return null;
            const bs = 0.011;
            // one ring, one draw call — the four bevels never move relative to each other
            return (
              <mesh
                position={[0, 0, t / 2 - 0.004]}
                material={mats.panel}
                geometry={mergeBoxes([
                  { w: iw, h: bs, d: bs, y: ih / 2 - bs / 2, rx: Math.PI / 4 },
                  { w: iw, h: bs, d: bs, y: -ih / 2 + bs / 2, rx: -Math.PI / 4 },
                  { w: bs, h: ih, d: bs, x: -iw / 2 + bs / 2, ry: -Math.PI / 4 },
                  { w: bs, h: ih, d: bs, x: iw / 2 - bs / 2, ry: Math.PI / 4 },
                ])}
              />
            );
          })()}
          <DoorCenterPanel
            w={Math.max(0.02, w - frame * 2 + 0.004)}
            h={Math.max(0.02, h - frame * 2 + 0.004)}
            depth={t - 0.01}
            upper={upper}
            sel={sel}
            mats={mats}
          />
        </group>
      )}
      {applied ? (() => {
        const aw = w - frame * 2 - 0.02;
        const ah = h - frame * 2 - 0.02;
        const m = 0.02;
        if (aw < 0.05 || ah < 0.05) return null;
        const appliedGeo = kit?.rail_applied;
        return appliedGeo ? (
          // Same authoring as the rails — length on X, thickness on Y, width on Z — so
          // the molding needs standing up too. Width scales to the 20 mm strip and
          // thickness to the ~8 mm it stands proud; the group sits so its back face
          // lands on the door rather than hovering a millimetre off it.
          <group position={[0, 0, t / 2 + 0.004]}>
            <group position={[0, ah / 2 - m / 2, 0]} rotation={[0, 0, Math.PI]}>
              <KitMesh geometry={appliedGeo} base={mats.frontRail} rotation={railProfile} scale={[aw, 0.42, m / 0.058]} />
            </group>
            <group position={[0, -ah / 2 + m / 2, 0]}>
              <KitMesh geometry={appliedGeo} base={mats.frontRail} rotation={railProfile} scale={[aw, 0.42, m / 0.058]} />
            </group>
            <group position={[-aw / 2 + m / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <KitMesh geometry={appliedGeo} base={mats.front} rotation={railProfile} scale={[ah - m * 2, 0.42, m / 0.058]} />
            </group>
            <group position={[aw / 2 - m / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <KitMesh geometry={appliedGeo} base={mats.front} rotation={railProfile} scale={[ah - m * 2, 0.42, m / 0.058]} />
            </group>
          </group>
        ) : (
          <mesh
            position={[0, 0, t / 2 + 0.004]}
            material={mats.front}
            castShadow
            geometry={mergeBoxes([
              { w: aw, h: m, d: 0.008, y: ah / 2 - m / 2 },
              { w: aw, h: m, d: 0.008, y: -ah / 2 + m / 2 },
              { w: m, h: ah - m * 2, d: 0.008, x: -aw / 2 + m / 2 },
              { w: m, h: ah - m * 2, d: 0.008, x: aw / 2 - m / 2 },
            ])}
          />
        );
      })() : null}
      {withHinges ? <group position={[-w / 2, 0, -t / 2]}><EuroHinges mats={mats} h={h} /></group> : null}
      {!plain ? (
        <group
          position={[isEdge && !drawer ? 0 : pullX, pullY, t / 2]}
          rotation={vertical ? [0, 0, Math.PI / 2] : [0, 0, 0]}
          // length only. Z is the standoff now, and a narrow door does not get a pull that
          // sits closer to the face — it gets a shorter one.
          scale={[pullScale, 1, 1]}
        >
          <Pull sel={sel} mats={mats} w={drawer ? w : h} drawer={drawer} />
        </group>
      ) : null}
    </group>
  );
}

/* ————— interiors ————— */

/** A real casework shell: top, bottom, back, ends, and bay dividers — a genuine
 *  cavity behind every front, like the section drawings. Interior faces are natural
 *  birch, the way a shop actually builds a box. */
type ShellTimes = { bottom: number; top: number; back: number; left: number; right: number; dividers: number };

function CarcassShell({
  mats, w, h, d, dividerXs = [], at,
}: { mats: Mats; w: number; h: number; d: number; dividerXs?: number[]; at?: ShellTimes }) {
  const t = 0.018;
  const building = useContext(BuildTimeCtx).start >= 0;
  // The shell wears the EXTERIOR finish, not birch. From outside a closed cabinet the only part
  // of the box you can see is the 18 mm edges in the reveals between doors — and on Heritage
  // Black those edges were raw birch, which drew a cream pinstripe around every dark door. The
  // client's black kitchen is black to the bone. Shelves and drawer boxes stay birch; they are
  // the inside, this is the edge.
  // Six boxes and however many dividers, welded together and never moving
  // relative to each other. Only the build cinematic needs them as separate objects — while it
  // runs each part has its own birth time, and the moment it settles this is one draw call.
  const shell = useMemo(() => mergeBoxes([
    { w, h: t, d, y: -h / 2 + t / 2 },
    { w, h: t, d, y: h / 2 - t / 2 },
    { w, h: h - t * 2, d: t, z: -d / 2 + t / 2 },
    { w: t, h: h - t * 2, d, x: -w / 2 + t / 2 },
    { w: t, h: h - t * 2, d, x: w / 2 - t / 2 },
    ...dividerXs.map((x) => ({ w: t, h: h - t * 2, d: d - 0.04, x, z: -0.01 })),
  ]), [w, h, d, t, dividerXs]);
  const B = (birth: number | undefined, child: React.ReactNode, key?: string | number) =>
    birth === undefined ? <group key={key}>{child}</group> : <Built key={key} at={birth}>{child}</Built>;
  if (!at || !building) return <mesh geometry={shell} material={mats.carcass} castShadow receiveShadow />;
  return (
    <group>
      {B(at?.bottom, <mesh material={mats.carcass} position={[0, -h / 2 + t / 2, 0]} castShadow receiveShadow><ChamferedBox args={[w, t, d]} /></mesh>, 'b')}
      {B(at?.top, <mesh material={mats.carcass} position={[0, h / 2 - t / 2, 0]} castShadow receiveShadow><ChamferedBox args={[w, t, d]} /></mesh>, 't')}
      {B(at?.back, <mesh material={mats.carcass} position={[0, 0, -d / 2 + t / 2]} receiveShadow><ChamferedBox args={[w, h - t * 2, t]} /></mesh>, 'k')}
      {B(at?.left, <mesh material={mats.carcass} position={[-w / 2 + t / 2, 0, 0]} castShadow receiveShadow><ChamferedBox args={[t, h - t * 2, d]} /></mesh>, 'l')}
      {B(at?.right, <mesh material={mats.carcass} position={[w / 2 - t / 2, 0, 0]} castShadow receiveShadow><ChamferedBox args={[t, h - t * 2, d]} /></mesh>, 'r')}
      {dividerXs.map((x, i) => B(at ? at.dividers + i * 0.28 : undefined, (
        <mesh material={mats.carcass} position={[x, 0, -0.01]} castShadow receiveShadow>
          <ChamferedBox args={[t, h - t * 2, d - 0.04]} />
        </mesh>
      ), x))}
    </group>
  );
}

/** What lives inside a bay: adjustable shelves on pins, or rollout trays on glides. */
/** A plate and a tumbler, shared across every glazed bay so the crockery costs two draw calls a
 *  bay rather than one per object. */
const PLATE_GEOMETRY = new THREE.CylinderGeometry(0.078, 0.074, 0.008, 20);
const TUMBLER_GEOMETRY = new THREE.CylinderGeometry(0.031, 0.026, 0.082, 14);

function BayFittings({
  sel, mats, w, h, d, fittings,
}: { sel: Sel; mats: Mats; w: number; h: number; d: number; fittings: 'shelves' | 'rollouts-eligible' | 'bare' | 'pantry' }) {
  const rollouts = fittings === 'rollouts-eligible' && sel.rollouts !== 'None';
  const borePlacements = useMemo<Placement[]>(() => {
    const out: Placement[] = [];
    for (const side of [-1, 1]) {
      for (const pz of [d * 0.22, -d * 0.22]) {
        for (let index = 0; index < 7; index += 1) {
          out.push({
            position: [side * (w / 2 - 0.001), -h * 0.36 + index * (h * 0.72 / 6), pz],
            rotation: [0, side * -Math.PI / 2, 0],
          });
        }
      }
    }
    return out;
  }, [w, h, d]);
  if (fittings === 'bare') return null;
  if (rollouts) {
    return (
      <group>
        {[-h * 0.22, -h * 0.02].map((y, i) => (
          <group key={i} position={[0, y, 0.04]}>
            <mesh material={mats.drawerBox} position={[0, 0.03, 0]} castShadow receiveShadow><ChamferedBox args={[w - 0.09, 0.012, d - 0.14]} /></mesh>
            <mesh material={mats.drawerBox} position={[-(w - 0.09) / 2, 0.055, 0]} castShadow><ChamferedBox args={[0.012, 0.06, d - 0.14]} /></mesh>
            <mesh material={mats.drawerBox} position={[(w - 0.09) / 2, 0.055, 0]} castShadow><ChamferedBox args={[0.012, 0.06, d - 0.14]} /></mesh>
            <mesh material={mats.drawerBox} position={[0, 0.055, -(d - 0.14) / 2]}><ChamferedBox args={[w - 0.09, 0.06, 0.012]} /></mesh>
            <mesh material={mats.drawerBox} position={[0, 0.055, (d - 0.14) / 2]} castShadow><ChamferedBox args={[w - 0.09, 0.06, 0.012]} /></mesh>
            {[-1, 1].map((sgn) => (
              <mesh key={sgn} material={mats.glide} position={[sgn * ((w - 0.06) / 2), 0.02, 0]}><ChamferedBox args={[0.008, 0.014, d - 0.12]} /></mesh>
            ))}
          </group>
        ))}
      </group>
    );
  }
  const ys = fittings === 'pantry' ? [h * 0.3, h * 0.05, -h * 0.2, -h * 0.38] : [h * 0.16, -h * 0.18];
  // Glass fronts with nothing behind them. A lit display cabinet is a thing a shop builds so that
  // something can be SEEN in it, and every glazed bay in this room was an empty box with two
  // shelves and interior lighting — which reads as unfinished in the one camera that exists to
  // look at the uppers. Plates and tumblers, stacked the way a cabinet actually gets loaded, and
  // only where the door is glazed: there is no reason to pay for contents nobody can see.
  const glazed = supportsUpperInsert(sel.door) && sel.upperInsert === 'Mullion Glass';
  const crockery = useMemo(() => {
    if (fittings !== 'shelves' || !glazed) return { plates: [] as Placement[], tumblers: [] as Placement[] };
    const plates: Placement[] = [];
    const tumblers: Placement[] = [];
    for (const y of ys) {
      const top = y + 0.009;
      // two stacks toward the left, graded heights so they do not read as one block
      [[-w * 0.26, 5], [-w * 0.08, 3]].forEach(([px, count]) => {
        for (let i = 0; i < (count as number); i += 1) {
          plates.push({ position: [px as number, top + 0.004 + i * 0.0082, 0.01] });
        }
      });
      // a row of tumblers to the right
      for (let i = 0; i < 3; i += 1) {
        tumblers.push({ position: [w * 0.10 + i * 0.072, top + 0.041, 0.012] });
      }
    }
    return { plates, tumblers };
  }, [fittings, glazed, w, ys]);
  return (
    <group>
      {ys.map((y) => (
        <mesh key={y} material={mats.interior} position={[0, y, 0.01]} castShadow receiveShadow>
          <ChamferedBox args={[w - 0.05, 0.018, d - 0.09]} />
        </mesh>
      ))}
      {crockery.plates.length ? (
        <InstancedParts geometry={PLATE_GEOMETRY} material={mats.ceramic} placements={crockery.plates} castShadow />
      ) : null}
      {crockery.tumblers.length ? (
        <InstancedParts geometry={TUMBLER_GEOMETRY} material={mats.glass} placements={crockery.tumblers} castShadow />
      ) : null}
      {/* 32mm line boring — the detail a cabinetmaker checks when the door opens. 28 holes per
          bay, one draw call: as 28 separate meshes this was 168 of the scene's 1,883 calls. */}
      <InstancedParts geometry={BORE_GEOMETRY} material={BORE_MATERIAL} placements={borePlacements} />
    </group>
  );
}

function DrawerUnit({
  id, sel, mats, w, h, d, cutlery = false,
}: { id: string; sel: Sel; mats: Mats; w: number; h: number; d: number; cutlery?: boolean }) {
  const boxT = sel.drawerBox === '5/8" Hardwood' ? 0.016 : 0.012;
  const bw = w - 0.05;
  const bh = Math.max(0.06, h - 0.05);
  const bd = d - 0.1;
  const boxGeometry = useMemo(() => mergeBoxes([
    { w: bw, h: boxT, d: bd, y: -bh / 2 + boxT / 2 },
    { w: boxT, h: bh, d: bd, x: -bw / 2 + boxT / 2 },
    { w: boxT, h: bh, d: bd, x: bw / 2 - boxT / 2 },
    { w: bw - boxT, h: bh, d: boxT, z: -bd / 2 + boxT / 2 },
    // a real box has its own sub-front behind the applied face
    { w: bw - boxT, h: bh, d: boxT, z: bd / 2 - boxT / 2 },
  ]), [bw, bh, bd, boxT]);
  const glideGeometry = useMemo(() => mergeBoxes([
    { w: 0.014, h: 0.012, d: bd, x: -(bw / 2 - 0.02), y: -bh / 2 - 0.008 },
    { w: 0.014, h: 0.012, d: bd, x: bw / 2 - 0.02, y: -bh / 2 - 0.008 },
  ]), [bw, bh, bd]);
  const dovetails = useMemo<Placement[]>(() => {
    const rows = Math.min(6, Math.max(2, Math.floor(bh / 0.022)));
    const out: Placement[] = [];
    for (const side of [-1, 1]) {
      for (let index = 0; index < rows; index += 1) {
        out.push({
          position: [
            side * (bw / 2 - boxT / 2),
            bh / 2 - 0.008 - index * ((bh - 0.016) / Math.max(1, rows - 1)),
            bd / 2 - boxT / 2,
          ],
          rotation: DOVETAIL_ROTATION,
        });
      }
    }
    return out;
  }, [bw, bh, bd, boxT]);
  return (
    <Opening id={id} kind="drawer">
      <group>
        <DoorSlab w={w} h={h} sel={sel} mats={mats} drawer />
        {/* the box rides behind the front. Five sides, one geometry: they are the same birch and
            they never move relative to each other, so five draw calls a drawer bought nothing. */}
        <group position={[0, -h / 2 + bh / 2 + 0.014, -bd / 2 - 0.012]}>
          <mesh geometry={boxGeometry} material={mats.drawerBox} />
          {/* dovetail pins at the side/front joint — the detail you see looking down into an open
              drawer. Twelve of them per drawer, one call. */}
          <InstancedParts geometry={DOVETAIL_GEOMETRY} material={mats.interior} placements={dovetails} />
          {/* undermount glides */}
          <mesh geometry={glideGeometry} material={mats.glide} />
          {cutlery && sel.cutleryInsert !== 'None' ? (
            <group position={[0, -bh / 2 + boxT + 0.02, 0]}>
              {[-bw / 4, 0, bw / 4].map((x) => (
                <mesh key={x} material={mats.interior} position={[x, 0, 0]}><ChamferedBox args={[0.01, 0.04, bd - 0.05]} /></mesh>
              ))}
              <mesh material={mats.interior} position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}><ChamferedBox args={[0.01, 0.04, bw - 0.05]} /></mesh>
            </group>
          ) : null}
        </group>
      </group>
    </Opening>
  );
}

function TrashPullout({ id, sel, mats, w, h, d }: { id: string; sel: Sel; mats: Mats; w: number; h: number; d: number }) {
  return (
    <Opening id={id} kind="pullout">
      <group>
        <DoorSlab w={w} h={h} sel={sel} mats={mats} />
        <group position={[0, -h / 2 + 0.02, -d / 2]}>
          <mesh material={mats.glide} position={[0, 0, 0]}><ChamferedBox args={[w - 0.1, 0.012, d - 0.1]} /></mesh>
          {[-w / 5, w / 5].map((x) => (
            <group key={x} position={[x, 0.17, 0]}>
              <mesh material={mats.bin}><ChamferedBox args={[w / 2 - 0.09, 0.32, d - 0.16]} /></mesh>
              <mesh material={mats.kick} position={[0, 0.17, 0]}><ChamferedBox args={[w / 2 - 0.07, 0.012, d - 0.14]} /></mesh>
            </group>
          ))}
        </group>
      </group>
    </Opening>
  );
}

/* ————— bases ————— */

function Foot({ mats, x, z, h }: { mats: Mats; x: number; z: number; h: number }) {
  const kit = useKit();
  if (kit?.foot_turned) {
    return <KitMesh geometry={kit.foot_turned} base={mats.front} position={[x, 0, z]} />;
  }
  const pts: THREE.Vector2[] = [];
  const prof: [number, number][] = [[0.034, 0], [0.036, 0.15], [0.024, 0.3], [0.03, 0.5], [0.022, 0.72], [0.026, 0.86], [0.02, 1]];
  for (const [r, y] of prof) pts.push(new THREE.Vector2(r, y * h));
  return (
    <mesh material={mats.front} position={[x, 0, z]} castShadow>
      <latheGeometry args={[pts, 18]} />
    </mesh>
  );
}

function Base({ sel, mats, w, d }: { sel: Sel; mats: Mats; w: number; d: number }) {
  const kickH = 0.1;
  // The toe kick is 100 mm and reads as 100 mm; the box is modelled 6 mm taller so its top face
  // is buried inside the 18 mm carcass bottom rather than landing exactly on it. Measured before
  // this: kick.max and interior.min were both y=0.10000 across 4.3 m2 of shared area — two
  // coplanar faces, which flickered against each other as the camera moved. A hidden face wants
  // to be inside its neighbour, never kissing it.
  const kickBox = kickH + 0.006;
  switch (sel.toeKick) {
    case 'No Toe Kick':
      return <mesh material={mats.front} position={[0, kickBox / 2, 0]} castShadow><ChamferedBox args={[w, kickBox, d]} /></mesh>;
    case 'Furniture Feet':
      return (
        <group>
          {[-w / 2 + 0.08, w / 2 - 0.08].flatMap((x) =>
            [-d / 2 + 0.07, d / 2 - 0.07].map((z) => <Foot key={`${x}${z}`} mats={mats} x={x} z={z} h={kickBox} />),
          )}
        </group>
      );
    case 'Extended Stiles':
      return (
        <group>
          <mesh material={mats.front} position={[-w / 2 + 0.011, kickBox / 2, 0]} castShadow><ChamferedBox args={[0.022, kickBox, d]} /></mesh>
          <mesh material={mats.front} position={[w / 2 - 0.011, kickBox / 2, 0]} castShadow><ChamferedBox args={[0.022, kickBox, d]} /></mesh>
          <mesh material={mats.kick} position={[0, kickBox / 2, -0.03]}><ChamferedBox args={[w - 0.08, kickBox, d - 0.06]} /></mesh>
        </group>
      );
    case 'Cabinet Base':
      return (
        <group>
          <mesh material={mats.front} position={[0, kickBox / 2, 0]} castShadow><ChamferedBox args={[w + 0.03, kickBox, d + 0.03]} /></mesh>
          <mesh material={mats.front} position={[0, kickH - 0.011, 0]} castShadow><ChamferedBox args={[w + 0.056, 0.034, d + 0.056]} /></mesh>
        </group>
      );
    case 'Notched Cabinet Base': {
      const segs = Math.max(2, Math.round(w / 0.8));
      const segW = (w + 0.03) / segs;
      return (
        <group>
          <mesh material={mats.front} position={[0, kickH - 0.017, 0]} castShadow><ChamferedBox args={[w + 0.03, 0.046, d + 0.03]} /></mesh>
          {Array.from({ length: segs + 1 }, (_, i) => -(w + 0.03) / 2 + i * segW).map((x) => (
            <mesh key={x} material={mats.front} position={[THREE.MathUtils.clamp(x, -(w / 2 - 0.05), w / 2 - 0.05), (kickH - 0.02) / 2, 0]} castShadow>
              <ChamferedBox args={[0.09, kickH - 0.02, d + 0.03]} />
            </mesh>
          ))}
        </group>
      );
    }
    default:
      return <mesh material={mats.kick} position={[0, kickBox / 2, -0.045]}><ChamferedBox args={[w - 0.09, kickBox, d - 0.09]} /></mesh>;
  }
}

/* ————— under-upper trim ————— */

function UnderUpper({ sel, mats, w, y, z }: { sel: Sel; mats: Mats; w: number; y: number; z: number }) {
  const exposed = sel.lightRail !== 'Standard 1 1/2" Concealed';
  const railMat = exposed ? mats.front : mats.kick;
  const railD = sel.lightRail === 'Custom Light Rail' ? 0.05 : 0.03;
  return (
    <group position={[0, y, z]}>
      <mesh material={railMat} position={[0, -0.019, exposed ? 0.012 : -0.02]} castShadow>
        <ChamferedBox args={[w - (exposed ? 0 : 0.06), 0.038, railD]} />
      </mesh>
      {sel.bottomTrim === 'Spanish' ? (
        <group>
          <mesh material={mats.front} position={[0, -0.048, 0.02]} castShadow><ChamferedBox args={[w + 0.02, 0.022, 0.05]} /></mesh>
          <mesh material={mats.front} position={[0, -0.066, 0.032]} castShadow><ChamferedBox args={[w + 0.04, 0.014, 0.026]} /></mesh>
        </group>
      ) : sel.bottomTrim === 'Flat Bevel' ? (
        <mesh material={mats.front} position={[0, -0.052, 0.018]} rotation={[0.6, 0, 0]} castShadow><ChamferedBox args={[w + 0.02, 0.03, 0.02]} /></mesh>
      ) : null}
      {sel.ledTrack !== 'None' ? (
        <mesh material={mats.led} position={[0, -0.008, 0.05]}><ChamferedBox args={[w - 0.1, 0.008, 0.02]} /></mesh>
      ) : null}
    </group>
  );
}

/* ————— banks ————— */

function FaceFrame({ w, h, mats }: { w: number; h: number; mats: Mats }) {
  const geometry = useMemo(() => {
    const f = 0.04;
    const t = 0.02;
    return mergeBoxes([
      { w, h: f, d: t, y: h / 2 - f / 2 },
      { w, h: f, d: t, y: -h / 2 + f / 2 },
      { w: f, h: h - f * 2, d: t, x: -w / 2 + f / 2 },
      { w: f, h: h - f * 2, d: t, x: w / 2 - f / 2 },
    ]);
  }, [w, h]);
  return <mesh geometry={geometry} material={mats.front} />;
}

function DrawerStack({ idBase, sel, mats, w, h, d, cutleryTop = false }: { idBase: string; sel: Sel; mats: Mats; w: number; h: number; d: number; cutleryTop?: boolean }) {
  // Graduated, the way a bank is actually built: a shallow cutlery drawer on top
  // (which falls under the slab threshold and gets a plain front, as it should),
  // then two deep ones. Three equal drawers is a filing cabinet, not a kitchen.
  const rows = [0.22, 0.37, 0.41];
  let y = h / 2;
  return (
    <group>
      {rows.map((frac, i) => {
        const rh = h * frac;
        y -= rh / 2;
        const el = (
          <group key={i} position={[0, y, 0]}>
            <DrawerUnit id={`${idBase}-dr${i}`} sel={sel} mats={mats} w={w} h={rh - 0.004} d={d} cutlery={cutleryTop && i === 0} />
          </group>
        );
        y -= rh / 2;
        return el;
      })}
    </group>
  );
}

type BayKind = 'door' | 'drawers' | 'trash' | 'appliance' | 'false' | 'range';

function LowerRun({
  idBase, sel, mats, w, d, bays, cutleryBay, baseAt, shellAt, bayAt,
}: {
  idBase: string; sel: Sel; mats: Mats; w: number; d: number; bays: BayKind[]; cutleryBay?: number;
  baseAt?: number; shellAt?: ShellTimes; bayAt?: number[];
}) {
  const kickH = 0.1;
  const boxH = 0.78;
  const bayW = w / bays.length;
  const inset = sel.cabinetStyle === 'Inset Face Frame';
  const gap = inset ? 0.007 : 0.0025;
  return (
    <group>
      {baseAt === undefined ? (
        <Base sel={sel} mats={mats} w={w} d={d} />
      ) : (
        <Built at={baseAt}><Base sel={sel} mats={mats} w={w} d={d} /></Built>
      )}
      <group position={[0, kickH + boxH / 2, 0]}>
        <CarcassShell
          mats={mats}
          w={w}
          h={boxH}
          d={d}
          dividerXs={bays.slice(1).map((_, i) => -w / 2 + bayW * (i + 1))}
          at={shellAt}
        />
      </group>
      {bays.map((kind, i) => {
        const x = -w / 2 + bayW * (i + 0.5);
        const dw = bayW - 0.006 - gap * 2;
        const dh = boxH - 0.012 - gap * 2;
        const bayContent = (
          <group key={i} position={[x, kickH + boxH / 2, d / 2]}>
            {inset && kind !== 'range' ? <FaceFrame w={bayW} h={boxH} mats={mats} /> : null}
            {kind !== 'false' && kind !== 'appliance' && kind !== 'range' ? (
              // the bay group sits at the FRONT face — fittings live a half-depth behind it
              <group position={[0, 0, -d / 2]}>
                <BayFittings
                  sel={sel}
                  mats={mats}
                  w={bayW - 0.04}
                  h={boxH - 0.04}
                  d={d - 0.05}
                  fittings={kind === 'door' ? 'rollouts-eligible' : 'bare'}
                />
              </group>
            ) : null}
            {kind === 'drawers' ? (
              <group position={[0, 0, inset ? -0.006 : 0.011]}>
                <DrawerStack idBase={`${idBase}-b${i}`} sel={sel} mats={mats} w={dw} h={dh} d={d} cutleryTop={cutleryBay === i} />
              </group>
            ) : kind === 'trash' ? (
              <group position={[0, 0, inset ? -0.006 : 0.011]}>
                <TrashPullout id={`${idBase}-trash`} sel={sel} mats={mats} w={dw} h={dh} d={d} />
              </group>
            ) : kind === 'appliance' ? (
              <group position={[0, 0, inset ? -0.006 : 0.011]}>
                {sel.appliancePanels !== 'None' ? (
                  <DoorSlab w={dw} h={dh} sel={sel} mats={mats} plain />
                ) : (
                  <group>
                    <mesh material={mats.stainless} receiveShadow><ChamferedBox args={[dw, dh, 0.02]} /></mesh>
                    <mesh material={mats.hw} position={[0, dh / 2 - 0.05, 0.03]} rotation={[0, 0, Math.PI / 2]} castShadow>
                      <capsuleGeometry args={[0.007, dw - 0.14, 6, 12]} />
                    </mesh>
                  </group>
                )}
              </group>
            ) : kind === 'range' ? null : kind === 'false' ? (
              <group position={[0, 0, inset ? -0.006 : 0.011]}>
                <DoorSlab w={dw} h={dh} sel={sel} mats={mats} plain />
              </group>
            ) : (
              <Opening
                id={`${idBase}-door${i}`}
                kind={i % 2 === 0 ? 'door-left' : 'door-right'}
                hinge={[i % 2 === 0 ? -bayW / 2 + gap : bayW / 2 - gap, 0, inset ? -0.006 : 0.011]}
              >
                <group position={[i % 2 === 0 ? dw / 2 : -dw / 2, 0, 0]}>
                  <DoorSlab w={dw} h={dh} sel={sel} mats={mats} withHinges hingeSide={i % 2 === 0 ? 'left' : 'right'} />
                </group>
              </Opening>
            )}
          </group>
        );
        return bayAt?.[i] !== undefined ? <Built key={i} at={bayAt[i]!}>{bayContent}</Built> : bayContent;
      })}
    </group>
  );
}

function EndPanel({
  sel, mats, d, h, x, flip, island = false,
}: { sel: Sel; mats: Mats; d: number; h: number; x: number; flip?: boolean; island?: boolean }) {
  const kit = useKit();
  const paneled = sel.endsPanels === 'Paneled Ends' || (sel.endsPanels === 'Mix' && !flip);
  const islandTreatment = island ? sel.islandEnd : 'Door-Matched Panel';
  const iw = d - 0.11;
  const ih = h - 0.09;
  const braceLength = Math.sqrt(iw * iw + ih * ih);
  const braceAngle = Math.atan2(ih, iw);
  return (
    <group position={[x, 0.1 + h / 2, 0]} rotation={[0, flip ? Math.PI / 2 : -Math.PI / 2, 0]}>
      {islandTreatment === 'X-Braced Panel' ? (
        <group>
          <RoundedBox args={[d - 0.02, h - 0.012, 0.021]} radius={0.003} smoothness={2} castShadow receiveShadow material={mats.panel} />
          {kit?.xbrace_panel ? (
            <KitMesh
              geometry={kit.xbrace_panel}
              base={mats.front}
              position={[0, 0, 0.014]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[(d - 0.05) / 0.94, (h - 0.04) / 0.72, 1]}
            />
          ) : (
            <group>
              <mesh material={mats.front} position={[0, ih / 2, 0.016]} castShadow><ChamferedBox args={[d - 0.04, 0.05, 0.027]} /></mesh>
              <mesh material={mats.front} position={[0, -ih / 2, 0.016]} castShadow><ChamferedBox args={[d - 0.04, 0.05, 0.027]} /></mesh>
              <mesh material={mats.front} position={[-iw / 2, 0, 0.016]} castShadow><ChamferedBox args={[0.05, h - 0.04, 0.027]} /></mesh>
              <mesh material={mats.front} position={[iw / 2, 0, 0.016]} castShadow><ChamferedBox args={[0.05, h - 0.04, 0.027]} /></mesh>
              <mesh material={mats.front} position={[0, 0, 0.022]} rotation={[0, 0, braceAngle]} castShadow><ChamferedBox args={[braceLength, 0.046, 0.032]} /></mesh>
              <mesh material={mats.front} position={[0, 0, 0.022]} rotation={[0, 0, -braceAngle]} castShadow><ChamferedBox args={[braceLength, 0.046, 0.032]} /></mesh>
            </group>
          )}
        </group>
      ) : islandTreatment === 'Slab Panel' || !paneled ? (
        <RoundedBox args={[d - 0.02, h - 0.01, 0.02]} radius={0.003} smoothness={2} castShadow material={mats.front} />
      ) : (
        <DoorSlab w={d - 0.02} h={h - 0.012} sel={sel} mats={mats} plain />
      )}
    </group>
  );
}

/* ————— assemblies ————— */

function Island({ sel, mats, lightingMode, counterEdge = 'eased', glowTemp = '3000', islandTone = 'graphite' }: { sel: Sel; mats: Mats; lightingMode: LightMode; counterEdge?: 'eased' | 'waterfall'; glowTemp?: GlowTemp; islandTone?: IslandTone }) {
  const kit = useKit();
  const w = 2.6;
  const d = 1.05;
  const boxH = 0.78;
  const bays: BayKind[] = ['door', 'drawers', 'drawers', sel.trashPullout !== 'None' ? 'trash' : 'door'];
  // A darker island under a lighter perimeter is the shop's signature; the end treatment is a
  // separate decision from the finish, so the two no longer ride on one another.
  const darkIsland = islandTone !== 'match';
  const islandMats: Mats = darkIsland
    ? { ...mats, front: mats.accentFront, frontRail: mats.accentFront, panel: mats.accentPanel, carcass: mats.accentFront }
    : mats;
  // The hero: one cabinet run assembling the way the shop assembles it —
  // base, deck, back, ends, dividers, top, finished ends, fronts, counter.
  return (
    <group position={[0, 0, 0.62]}>
      <LowerRun
        idBase="isl"
        sel={sel}
        mats={islandMats}
        w={w}
        d={d}
        bays={bays}
        cutleryBay={1}
        baseAt={0.2}
        shellAt={{ bottom: 0.75, back: 1.3, left: 1.85, right: 2.2, dividers: 2.55, top: 3.5 }}
        bayAt={[4.7, 5.25, 5.8, 6.35]}
      />
      <Built at={3.95}><EndPanel sel={sel} mats={islandMats} d={d} h={boxH} x={-w / 2 - 0.011} island /></Built>
      <Built at={4.25}><EndPanel sel={sel} mats={islandMats} d={d} h={boxH} x={w / 2 + 0.011} flip island /></Built>
      {/* the back of the island is finished like the front — quality carries through
          even where nobody looks (and here, everyone at the sink looks) */}
      <Built at={4.5}>
        <group position={[0, 0.1 + boxH / 2, -d / 2 - 0.011]} rotation={[0, Math.PI, 0]}>
          {[-0.975, -0.325, 0.325, 0.975].map((bx) =>
            sel.endsPanels === 'Flat Ends' ? (
              <RoundedBox key={bx} args={[0.63, boxH - 0.012, 0.02]} radius={0.003} smoothness={2} position={[bx, 0, 0]} castShadow receiveShadow material={islandMats.front} />
            ) : (
              <group key={bx} position={[bx, 0, 0]}>
                <DoorSlab w={0.63} h={boxH - 0.012} sel={sel} mats={islandMats} plain />
              </group>
            ),
          )}
        </group>
      </Built>
      <Built at={6.9} dur={0.6}>
        <group>
          <RoundedBox args={[w + 0.16, 0.055, d + 0.34]} radius={0.006} smoothness={3} position={[0, 0.1 + boxH + 0.028, 0.09]} castShadow receiveShadow material={mats.counter} />
          {counterEdge === 'waterfall' ? (
            [-1, 1].map((side) => (
              <mesh
                key={side}
                material={mats.counter}
                position={[side * ((w + 0.16) / 2 - 0.0275), (0.1 + boxH + 0.055) / 2, 0.09]}
                castShadow
                receiveShadow
              >
                <ChamferedBox args={[0.055, 0.1 + boxH + 0.055, d + 0.34]} />
              </mesh>
            ))
          ) : null}
          {/* No corbels. They hung under the overhang directly in front of the doors — David's
              word was "massive hooks blocking the cabinet doors", and he is right: the one thing
              this studio sells is cabinetry, and these were standing in front of it. */}
        </group>
      </Built>
      {sel.toeLighting === 'Warm LED' ? (
        <group>
          <mesh material={mats.led} position={[0, 0.018, d / 2 - 0.035]}>
            <ChamferedBox args={[w - 0.16, 0.009, 0.018]} />
          </mesh>
          <mesh material={mats.led} position={[0, 0.018, -d / 2 + 0.035]}>
            <ChamferedBox args={[w - 0.16, 0.009, 0.018]} />
          </mesh>
          {/* LED TAPE, not a row of lamps. At y 0.075 with decay 1.6 each emitter dropped its
              own hard pool on the oak and you could count them along the kick. Lifting them and
              flattening the falloff overlaps the pools into one wash — no extra lights, which
              matters because this room already runs a full practical rig. */}
          {/* below the door plane, not at it: at y 0.105 each emitter grazed the door bottoms
              and printed a circular pool on every front above it. At 0.05 the doors start above
              the light and the kick recess shadows them, so the tape shows only on the floor. */}
          {[-0.82, 0, 0.82].map((px) => (
            <pointLight key={px} position={[px, 0.05, d / 2 + 0.07]} intensity={0.20} distance={2.8} decay={1.15} color="#ffd08a" />
          ))}
          {[-0.65, 0.65].map((px) => (
            <pointLight key={px} position={[px, 0.05, -d / 2 - 0.07]} intensity={0.13} distance={2.5} decay={1.15} color="#ffd08a" />
          ))}
        </group>
      ) : null}
      {/* Every pendant terminates at the architectural ceiling. Their actual
          luminaires provide the lived-in working light; neutral mode keeps the
          same fixtures but makes their contribution materially honest. */}
      <Built at={7.2}>
        <group>
          {[-0.68, 0, 0.68].map((px) => (
            <group key={px} position={[px, 0, 0]}>
              <mesh material={mats.hw} position={[0, 3.34, 0]} castShadow>
                <cylinderGeometry args={[0.075, 0.075, 0.022, 24]} />
              </mesh>
              <mesh material={mats.kick} position={[0, 2.52, 0]}>
                <cylinderGeometry args={[0.0035, 0.0035, 1.58, 8]} />
              </mesh>
              {kit?.pendant_ribbed ? (
                // Blender fluted shade, referenced from the pleated pendants in the
                // studio kitchen photography; the procedural cone stays as the fallback
                <KitMesh geometry={kit.pendant_ribbed} base={mats.shade} position={[0, 1.525, 0]} rotation={[Math.PI / 2, 0, 0]} />
              ) : (
                <mesh material={mats.hw} position={[0, 1.61, 0]} castShadow>
                  <cylinderGeometry args={[0.03, 0.115, 0.17, 24, 1, true]} />
                </mesh>
              )}
              <mesh position={[0, 1.54, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.075, 20]} />
                <meshStandardMaterial
                  color={lightingMode === 'neutral' ? '#fffdf7' : '#fff2d8'}
                  emissive={lightingMode === 'neutral' ? '#fff8e9' : '#ffd9a0'}
                  emissiveIntensity={2.0 * GRADE[lightingMode].practicals}
                />
              </mesh>
              <mesh position={[0, 1.585, 0]}>
                <sphereGeometry args={[0.014, 10, 8]} />
                <meshStandardMaterial
                  color="#fff3d4"
                  emissive={lightingMode === 'neutral' ? '#ffedc4' : GLOW[glowTemp].deep}
                  emissiveIntensity={3.2 * GRADE[lightingMode].practicals}
                />
              </mesh>
              {/* Left at 1.05, and that is a result rather than an oversight. The Door camera is
                  the one view in this room that clips past the reference bar, and mapping it shows
                  a single pool on the island. Two obvious causes were tested and neither is it:
                  spreading the stone's clearcoat from 0.58 to 0.70 moved the frame 3.03% to 2.76%
                  and cost the polish, and this lamp — taken all the way to ZERO, not merely
                  dimmed — moved it to 2.55%. The pendants own about half a percentage point of
                  three. The rest is the environment on a pale stone slab seen at a grazing angle,
                  which is also what a photograph of one does. */}
              <pointLight
                position={[0, 1.5, 0]}
                color={lightingMode === 'neutral' ? '#fffdf7' : GLOW[glowTemp].main}
                intensity={1.05 * GRADE[lightingMode].practicals}
                distance={2.4}
                decay={2}
              />
            </group>
          ))}
        </group>
      </Built>
    </group>
  );
}

function Fridge({ sel, mats, x }: { sel: Sel; mats: Mats; x: number }) {
  const paneled = sel.appliancePanels !== 'None';
  const w = 0.92;
  const h = 1.82;
  const d = 0.66;
  const face = paneled ? mats.front : mats.applianceBrushed;
  // rendered inside WallRun's group — coordinates are local to the run
  return (
    <group position={[x, 0, 0]}>
      {/* body — brighter shell so the shadowed side still reads as stainless */}
      <mesh material={mats.applianceBrushed} position={[0, h / 2, 0]} castShadow receiveShadow>
        <ChamferedBox args={[w, h, d]} />
      </mesh>
      {/* The bible specifies separate refrigerator and freezer columns pinned to read as one
          object behind panel fronts — not the big-box french-door silhouette. Twin full-height
          doors on a centre reveal, each with its own long pull. */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh material={face} position={[side * (w / 4 + 0.002), h / 2 + 0.05, d / 2 + 0.011]} castShadow receiveShadow>
            <ChamferedBox args={[w / 2 - 0.016, h - 0.06, 0.02]} />
          </mesh>
          <mesh material={mats.hw} position={[side * 0.028, h / 2 + 0.05, d / 2 + 0.045]} castShadow>
            <capsuleGeometry args={[0.008, h * 0.5, 6, 12]} />
          </mesh>
        </group>
      ))}
      {/* the centre reveal reads as the seam between the two columns */}
      <mesh material={mats.interior} position={[0, h / 2 + 0.05, d / 2 + 0.006]}>
        <ChamferedBox args={[0.008, h - 0.06, 0.008]} />
      </mesh>
      {/* above-fridge cabinet (a real Master File line item) — hollow, one shelf */}
      <group position={[0, h + 0.24, -0.02]}>
        <CarcassShell mats={mats} w={w} h={0.44} d={d - 0.06} dividerXs={[0]} />
        <mesh material={mats.interior} position={[0, 0, 0]} castShadow receiveShadow>
          <ChamferedBox args={[w - 0.06, 0.016, d - 0.14]} />
        </mesh>
      </group>
      <group position={[-w / 4, h + 0.24, -0.02 + (d - 0.06) / 2]}>
        <DoorSlab w={w / 2 - 0.008} h={0.42} sel={sel} mats={mats} hingeSide="left" upper />
      </group>
      <group position={[w / 4, h + 0.24, -0.02 + (d - 0.06) / 2]}>
        <DoorSlab w={w / 2 - 0.008} h={0.42} sel={sel} mats={mats} hingeSide="right" upper />
      </group>
      <Crown sel={sel} mats={mats} w={w} y={h + 0.46} d={d - 0.06} z={-0.02} />
    </group>
  );
}

function ProceduralGooseneckFaucet({ mats }: { mats: Mats }) {
  return (
    <group>
      {/* The arc sits in the y/z plane: stem at the back of the sink, outlet
          over the bowl. This survives when the optional kit faucet is absent. */}
      <mesh material={mats.steel} position={[0, 0.135, -0.14]} castShadow>
        <cylinderGeometry args={[0.014, 0.017, 0.27, 14]} />
      </mesh>
      <mesh material={mats.steel} position={[0, 0.006, -0.14]} castShadow>
        <cylinderGeometry args={[0.035, 0.04, 0.012, 18]} />
      </mesh>
      <mesh material={mats.steel} position={[0, 0.27, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <torusGeometry args={[0.14, 0.013, 10, 28, Math.PI]} />
      </mesh>
      <mesh material={mats.steel} position={[0, 0.237, 0.14]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.068, 12]} />
      </mesh>
      <mesh material={mats.steel} position={[0, 0.202, 0.14]} castShadow>
        <cylinderGeometry args={[0.019, 0.014, 0.016, 12]} />
      </mesh>
      <mesh material={mats.steel} position={[0.062, 0.075, -0.14]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.009, 0.009, 0.08, 12]} />
      </mesh>
    </group>
  );
}

function SinkModule({ sel, mats, x, counterY, frontZ }: { sel: Sel; mats: Mats; x: number; counterY: number; frontZ: number }) {
  const kit = useKit();
  const apron = sel.apronSink !== 'None';
  const lift = sel.sinkHeight === '3/4" above top of cabinet' ? 0.019 : 0;
  if (apron) {
    return (
      <group position={[x, counterY - 0.09 + lift, frontZ - 0.2]}>
        {kit?.sink_apron ? (
          <KitMesh geometry={kit.sink_apron} base={mats.ceramic} />
        ) : (
          <mesh material={mats.ceramic} castShadow>
            <ChamferedBox args={[0.76, 0.24, 0.5]} />
          </mesh>
        )}
        {/* The kit's faucet_bridge is a QUARTER arc, not a gooseneck. Profiled by height
            it rises from the deck and moves forward the whole way, ending at 351 mm
            still travelling up and out — it never turns back down over the bowl, which
            is exactly what a faucet is for. The procedural spout below is a real
            gooseneck: riser at the back, a half-torus arch, and an outlet that DROPS
            at the front with the aerator facing the drain. The kit part stays in
            kit.glb for a bridge fixture that wants it. */}
        <group position={[0, 0.1, -0.2]}><ProceduralGooseneckFaucet mats={mats} /></group>
      </group>
    );
  }
  // Standard undermount: a four-sided stainless rim surrounds an actual basin.
  // The floor and four sloped walls sit below the counter plane so the sink
  // reads as a usable kitchen fixture from both the room and dedicated views.
  return (
    <group position={[x, counterY, frontZ - 0.26]}>
      <mesh material={mats.basin} position={[0, -0.145, 0]} castShadow receiveShadow>
        <ChamferedBox args={[0.53, 0.012, 0.24]} />
      </mesh>
      <mesh material={mats.basin} position={[0, -0.065, -0.162]} rotation={[-0.34, 0, 0]} castShadow receiveShadow>
        <ChamferedBox args={[0.64, 0.16, 0.018]} />
      </mesh>
      <mesh material={mats.basin} position={[0, -0.065, 0.162]} rotation={[0.34, 0, 0]} castShadow receiveShadow>
        <ChamferedBox args={[0.64, 0.16, 0.018]} />
      </mesh>
      <mesh material={mats.basin} position={[-0.31, -0.065, 0]} rotation={[0, 0, 0.34]} castShadow receiveShadow>
        <ChamferedBox args={[0.018, 0.16, 0.32]} />
      </mesh>
      <mesh material={mats.basin} position={[0.31, -0.065, 0]} rotation={[0, 0, -0.34]} castShadow receiveShadow>
        <ChamferedBox args={[0.018, 0.16, 0.32]} />
      </mesh>
      {[-0.215, 0.215].map((z) => (
        <mesh key={z} material={mats.stainless} position={[0, 0.023, z]} castShadow receiveShadow>
          <ChamferedBox args={[0.72, 0.012, 0.038]} />
        </mesh>
      ))}
      {[-0.354, 0.354].map((xPos) => (
        <mesh key={xPos} material={mats.stainless} position={[xPos, 0.023, 0]} castShadow receiveShadow>
          <ChamferedBox args={[0.012, 0.012, 0.40]} />
        </mesh>
      ))}
      <mesh material={mats.basin} position={[0, -0.149, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.008, 16]} />
      </mesh>
      {/* Placed off the drain, not off the cabinet: the arch spans 2 x 0.14 x 1.2 =
          0.336, so a riser at z -0.328 puts the aerator at z +0.008 — over the strainer
          at [0, -0.149, 0], and 113 mm behind the back rim where a deck-mount valve
          actually lands. */}
      <group position={[0, 0.022, -0.16]} scale={[1.2, 1.2, 1.2]}><ProceduralGooseneckFaucet mats={mats} /></group>
    </group>
  );
}

function SinkCounter({ mats, w, d, sinkX, y, rangeX }: { mats: Mats; w: number; d: number; sinkX: number; y: number; rangeX?: number }) {
  const totalW = w + 0.08;
  const totalD = d + 0.1;
  const holeW = 0.68;
  const holeD = 0.38;
  const counterZ = 0.03;
  const leftW = sinkX - holeW / 2 + totalW / 2;
  const railD = (totalD - holeD) / 2;
  // the counter breaks fully at the range bay — a slide-in range owns its slot
  const rangeGapW = 0.79;
  const rangeGapX = rangeX ?? Number.NaN;
  const midW = Number.isNaN(rangeGapX)
    ? totalW - leftW - holeW
    : rangeGapX - rangeGapW / 2 - (sinkX + holeW / 2);
  const rightW = Number.isNaN(rangeGapX)
    ? 0
    : totalW / 2 - (rangeGapX + rangeGapW / 2);
  return (
    <group>
      <RoundedBox args={[leftW, 0.052, totalD]} radius={0.008} smoothness={3} position={[-totalW / 2 + leftW / 2, y, counterZ]} castShadow receiveShadow material={mats.wallCounter} />
      <RoundedBox args={[Math.max(0.02, midW), 0.052, totalD]} radius={0.008} smoothness={3} position={[sinkX + holeW / 2 + midW / 2, y, counterZ]} castShadow receiveShadow material={mats.wallCounter} />
      {rightW > 0.02 ? (
        <RoundedBox args={[rightW, 0.052, totalD]} radius={0.008} smoothness={3} position={[rangeGapX + rangeGapW / 2 + rightW / 2, y, counterZ]} castShadow receiveShadow material={mats.wallCounter} />
      ) : null}
      <RoundedBox args={[holeW, 0.052, railD]} radius={0.006} smoothness={3} position={[sinkX, y, counterZ - holeD / 2 - railD / 2]} castShadow receiveShadow material={mats.wallCounter} />
      <RoundedBox args={[holeW, 0.052, railD]} radius={0.006} smoothness={3} position={[sinkX, y, counterZ + holeD / 2 + railD / 2]} castShadow receiveShadow material={mats.wallCounter} />
    </group>
  );
}

function WallRun({ sel, mats, xOff = 0, tShift = 0, lightingMode = 'lived-in', glowTemp = '3000' }: { sel: Sel; mats: Mats; xOff?: number; tShift?: number; lightingMode?: LightMode; glowTemp?: GlowTemp }) {
  const kit = useKit();
  const P = GRADE[lightingMode].practicals;
  const cavityGlow = getCavityGlowTexture();
  const T = (t: number) => t + tShift;
  const w = 3.6;
  const kickH = 0.1;
  const lowerH = 0.78;
  const lowerD = 0.62;
  // The fridge tower lands just outboard of the tall bank, not at the far end of the run.
  // It was past the range, so the only way to the fridge from the sink was across the cooktop,
  // and it left the two tall masses stranded at opposite ends of a 5.6 m wall. Grouped, the wall
  // reads the way these are actually built and drawn: fridge, pantry, pantry, ovens, then the
  // working counter. The tall bank is 1.90 m wide starting at -w/2 - 1.905 in this group's
  // space, and the tower measures 1.075 across its filler panels.
  const fridgeX = -w / 2 - 1.905 - 0.5375 - 0.025;
  const upperY = 1.48;
  const upperH = 0.82;
  const upperD = 0.34;
  const upperZ = -lowerD / 2 + upperD / 2;
  const inset = sel.cabinetStyle === 'Inset Face Frame';
  const gap = inset ? 0.007 : 0.0025;
  // bay 1 is the sink base; bay 2 is the range alcove; the last bay is the dishwasher
  const bays: BayKind[] = ['door', 'false', 'range', 'appliance'];
  const sinkX = -w / 2 + (w / 4) * 1.5; // centered on bay 1
  const rangeX = -w / 2 + (w / 4) * 2.5; // centered on bay 2
  const transomY = upperY + upperH;
  const transomH = 0.5;
  const crownY = transomY + transomH;
  const wings = [
    { cx: -w / 4, ww: w / 2, bayIdx: [0, 1] },
    { cx: w / 2 - w / 8, ww: w / 4, bayIdx: [3] },
  ] as const;
  return (
    <group position={[xOff, 0, -1.45]}>
      <LowerRun
        idBase="wall"
        sel={sel}
        mats={mats}
        w={w}
        d={lowerD}
        bays={bays}
        baseAt={T(7.4)}
        shellAt={{ bottom: T(7.45), back: T(7.6), left: T(7.75), right: T(7.85), dividers: T(7.95), top: T(8.15) }}
        bayAt={[T(8.35), T(8.55), T(8.75), T(8.95)]}
      />
      <Built at={T(9.2)} dur={0.55}>
        <SinkCounter mats={mats} w={w} d={lowerD} sinkX={sinkX} y={kickH + lowerH + 0.02} rangeX={rangeX} />
      </Built>
      <Built at={T(8.25)}><EndPanel sel={sel} mats={mats} d={lowerD} h={lowerH} x={-w / 2 - 0.011} /></Built>
      <Built at={T(9.45)}><SinkModule sel={sel} mats={mats} x={sinkX} counterY={kickH + lowerH + 0.04} frontZ={lowerD / 2} /></Built>
      {sel.plugMold !== 'None' ? (
        <mesh material={mats.kick} position={[0, kickH + lowerH + 0.16, -lowerD / 2 + 0.012]}>
          <ChamferedBox args={[w - 0.2, 0.05, 0.02]} />
        </mesh>
      ) : null}
      {/* uppers split into two wings flanking the range alcove; each wing runs
          to a lit transom tier and a crown cap, per the drawing standard */}
      {wings.map((wing, wi) => (
        <group key={wi}>
          <group position={[wing.cx, upperY + upperH / 2, upperZ]}>
            <CarcassShell
              mats={mats}
              w={wing.ww}
              h={upperH}
              d={upperD}
              dividerXs={wing.bayIdx.length > 1 ? [0] : []}
              at={{ bottom: T(9.7), back: T(9.8), left: T(9.9), right: T(9.95), dividers: T(10.0), top: T(10.15) }}
            />
          </group>
          {wing.bayIdx.map((i, k) => {
            const bayW = w / 4;
            const x = -w / 2 + bayW * (i + 0.5);
            const dw = bayW - 0.006 - gap * 2;
            const dh = upperH - 0.012 - gap * 2;
            return (
              <Built key={i} at={T(10.3 + i * 0.22)}>
              <group position={[x, upperY + upperH / 2, upperZ + upperD / 2]}>
                {inset ? <FaceFrame w={bayW} h={upperH} mats={mats} /> : null}
                <group position={[0, 0, -upperD / 2]}>
                  <BayFittings sel={sel} mats={mats} w={bayW - 0.04} h={upperH - 0.04} d={upperD - 0.04} fittings="shelves" />
                </group>
                {sel.upperAction === 'Lift-up' ? (
                  <Opening id={`up${i}`} kind="liftup" hinge={[0, dh / 2 - gap, inset ? -0.006 : 0.011]}>
                    <group position={[0, -dh / 2, 0]}>
                      <DoorSlab w={dw} h={dh} sel={sel} mats={mats} upper />
                    </group>
                  </Opening>
                ) : (
                  <Opening
                    id={`up${i}`}
                    kind={k % 2 === 0 ? 'door-left' : 'door-right'}
                    hinge={[k % 2 === 0 ? -bayW / 2 + gap : bayW / 2 - gap, 0, inset ? -0.006 : 0.011]}
                  >
                    <group position={[k % 2 === 0 ? dw / 2 : -dw / 2, 0, 0]}>
                      <DoorSlab w={dw} h={dh} sel={sel} mats={mats} withHinges upper hingeSide={k % 2 === 0 ? 'left' : 'right'} />
                    </group>
                  </Opening>
                )}
              </group>
              </Built>
            );
          })}
          {/* Stacked cabinets, not a light fixture. This tier was a lit mullion-glass box with
              hand-built X braces and an emissive cavity — the busiest object in the room, and
              none of it is Master File vocabulary. The studio sells doors; the tier above the
              uppers is now simply more of them, in whatever construction the visitor chose. */}
          <group position={[wing.cx, transomY + transomH / 2, upperZ]}>
            <mesh material={mats.carcass} position={[0, 0, 0]}>
              <ChamferedBox args={[wing.ww, transomH, upperD - 0.02]} />
            </mesh>
            {wing.bayIdx.map((i) => {
              const bayW = w / 4;
              const x = -w / 2 + bayW * (i + 0.5) - wing.cx;
              return (
                <group key={i} position={[x, 0, upperD / 2 - 0.008]}>
                  <DoorSlab w={bayW - 0.05} h={transomH - 0.05} sel={sel} mats={mats} plain upper />
                </group>
              );
            })}
          </group>
          <group position={[wing.cx, 0, 0]}>
            <Crown sel={sel} mats={mats} w={wing.ww + 0.02} y={crownY} d={upperD} z={upperZ} />
          </group>
          <Built at={T(11.6)}>
            <group position={[wing.cx, 0, 0]}>
              <UnderUpper sel={sel} mats={mats} w={wing.ww} y={upperY} z={upperZ + upperD / 2} />
            </group>
          </Built>
          {/* warm under-cabinet wash: the practicals are always on in lived-in light */}
          <mesh material={mats.warmStrip} position={[wing.cx, upperY - 0.012, upperZ + upperD / 2 - 0.03]}>
            <ChamferedBox args={[wing.ww - 0.08, 0.006, 0.014]} />
          </mesh>
          {/* The light rail is CONCEALED — the Master File's own words. This emitter sat 16 cm
              in FRONT of the door faces, a bare bulb hanging in the air at eye line, washing a
              sphere onto the doors above it. Tucked behind the rail and under the carcass it
              lights what an under-cabinet strip lights: the counter below, the splash behind. */}
          <pointLight
            position={[wing.cx, upperY - 0.035, upperZ + upperD / 2 - 0.05]}
            intensity={0.62 * P}
            distance={1.4}
            decay={1.7}
            color={GLOW[glowTemp].main}
          />
        </group>
      ))}
      {/* the range alcove: plaster hood, full-height slab, pot filler, pro range */}
      <group position={[rangeX, 0, 0]}>
        <mesh material={mats.stone} position={[0, 1.31, -lowerD / 2 + 0.008]} receiveShadow>
          <ChamferedBox args={[0.96, 0.78, 0.018]} />
        </mesh>
        {kit?.hood_tapered ? (
          <KitMesh geometry={kit.hood_tapered} base={mats.wall} position={[0, 1.7, -lowerD / 2]} rotation={[Math.PI / 2, 0, 0]} scale={[0.66, 0.94, 0.75]} />
        ) : (
          <mesh material={mats.wall} position={[0, 2.32, -lowerD / 2 + 0.16]} castShadow>
            <ChamferedBox args={[0.9, 1.24, 0.34]} />
          </mesh>
        )}
        {/* A strap band across the hood's apron. A plaster hood is one large, untextured shape —
            the biggest object in the upper half of the frame and, until now, the only one with no
            detail on it at all, which read as an unfinished block rather than as millwork. A metal
            strap at the apron is what a shop actually builds here, and it earns its place twice:
            it breaks the mass, and it repeats the brass already on every pull in the room. */}
        <group position={[0, 1.775, -lowerD / 2 + 0.26]}>
          <mesh material={mats.hw} castShadow>
            <ChamferedBox args={[0.9, 0.048, 0.74]} />
          </mesh>
        </group>
        {/* No pot filler. It is plumbing on a wall, above a range, in a studio whose only
            product is cabinetry — the answer to "what is that on the wall above the range" should
            not be "something we do not sell". */}
        <group>
          <mesh material={mats.stainless} position={[0, 0.47, 0.002]} castShadow receiveShadow>
            <ChamferedBox args={[0.76, 0.84, 0.6]} />
          </mesh>
          <mesh material={mats.cooktop} position={[0, 0.9, -0.006]}>
            <ChamferedBox args={[0.74, 0.024, 0.56]} />
          </mesh>
          {/* burner heads: a spreader ring and a cap, sunk below the grate the way they sit on a
              real range — the grate is what the eye reads and what a pan would touch */}
          {[[-0.19, -0.14], [0.19, -0.14], [-0.19, 0.13], [0.19, 0.13]].map(([bx, bz], i) => (
            <group key={i} position={[bx!, 0.906, bz!]}>
              <mesh material={mats.kick} castShadow>
                <cylinderGeometry args={[0.048, 0.054, 0.010, 20]} />
              </mesh>
              <mesh material={mats.kick} position={[0, 0.009, 0]} castShadow>
                <cylinderGeometry args={[0.034, 0.038, 0.008, 20]} />
              </mesh>
              <mesh material={mats.hw} position={[0, 0.015, 0]}>
                <cylinderGeometry args={[0.020, 0.020, 0.004, 16]} />
              </mesh>
            </group>
          ))}
          {[-0.19, 0.19].map((gx) => (
            <mesh key={gx} material={mats.kick} geometry={GRATE_GEOMETRY()} position={[gx, 0.925, -0.005]} castShadow receiveShadow />
          ))}
          <mesh material={mats.stainless} position={[0, 0.815, 0.295]}>
            <ChamferedBox args={[0.76, 0.09, 0.022]} />
          </mesh>
          {[-0.27, -0.16, -0.055, 0.055, 0.16, 0.27].map((kx, i) => (
            <mesh key={kx} material={i === 2 || i === 3 ? mats.accentRed : mats.hw} position={[kx, 0.815, 0.312]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.017, 0.017, 0.018, 14]} />
            </mesh>
          ))}
          <mesh material={mats.stainless} position={[0, 0.44, 0.302]} castShadow>
            <ChamferedBox args={[0.72, 0.6, 0.02]} />
          </mesh>
          <mesh material={mats.cooktop} position={[0, 0.47, 0.314]}>
            <ChamferedBox args={[0.5, 0.3, 0.004]} />
          </mesh>
          <mesh material={mats.hw} position={[0, 0.68, 0.345]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <capsuleGeometry args={[0.011, 0.6, 6, 12]} />
          </mesh>
          <mesh material={mats.kick} position={[0, 0.05, 0.3]}>
            <ChamferedBox args={[0.74, 0.07, 0.01]} />
          </mesh>
        </group>
      </group>
      {/* drywall soffit band carries the millwork to the ceiling plane */}
      {/* the drawing standard reads "recessed dimmable LED at kitchen perimeter and island" —
          the island had it, the perimeter sat on a dark kick until now */}
      {sel.toeLighting === 'Warm LED' ? (
        <group>
          <mesh material={mats.led} position={[0, 0.018, lowerD / 2 - 0.035]}>
            <ChamferedBox args={[w - 0.12, 0.009, 0.018]} />
          </mesh>
          {[-1.2, -0.4, 0.4, 1.2].map((px) => (
            <pointLight key={px} position={[px, 0.05, lowerD / 2 + 0.07]} intensity={0.15} distance={2.7} decay={1.15} color="#ffd08a" />
          ))}
        </group>
      ) : null}
      <mesh material={mats.wall} position={[0, (crownY + 0.06 + ceilingOf(sel)) / 2, upperZ + 0.05]} receiveShadow>
        <ChamferedBox args={[w + 0.3, ceilingOf(sel) - crownY - 0.06, upperD + 0.14]} />
      </mesh>
      {/* under-cabinet occlusion: the light must not read as leaking through the uppers */}
      <mesh position={[0, upperY - 0.14, -lowerD / 2 + 0.022]} renderOrder={2}>
        <planeGeometry args={[w, 0.28]} />
        <meshBasicMaterial map={getShadeTexture()} transparent opacity={0.3} depthWrite={false} />
      </mesh>
      {sel.ledTrack !== 'None' ? (
        <pointLight position={[0, upperY - 0.12, upperZ + upperD / 2 + 0.15]} intensity={1.4} distance={1.6} color="#ffdf9e" />
      ) : null}
      {/* backsplash: stone panels option takes it full height */}
      {sel.stonePanels !== 'None' ? (
        <Built at={T(9.55)}>
          <mesh
            material={mats.stone}
            position={[0, (kickH + lowerH + 0.02 + ceilingOf(sel)) / 2, -lowerD / 2 + 0.005]}
            receiveShadow
          >
            <ChamferedBox args={[w + 0.06, ceilingOf(sel) - kickH - lowerH - 0.02, 0.015]} />
          </mesh>
        </Built>
      ) : null}
      {/* 3 mm behind the casework. Its front face and every cabinet back were both at world
          z=-1.76000 over ~5 m2 — the largest coplanar pair in the room after the ceiling. */}
      <mesh material={mats.wall} position={[-0.6, 1.5, -lowerD / 2 - 0.018]} receiveShadow>
        <ChamferedBox args={[w + 6.0, 3.0, 0.03]} />
      </mesh>
      <Built at={T(11.9)} dur={0.65} from={[-0.8, 0.3, 1.1]}>
        <group>
          <Fridge sel={sel} mats={mats} x={fridgeX} />
          {/* the corpus never shows a bare fridge: twin filler panels, a lit-line
              upper cabinet, and a crown cap turn it into an armoire tower */}
          <group position={[fridgeX, 0, 0]}>
            {[-0.51, 0.51].map((fx) => (
              <mesh key={fx} material={mats.panel} position={[fx, 1.41, 0]} castShadow receiveShadow>
                <ChamferedBox args={[0.055, 2.82, 0.66]} />
              </mesh>
            ))}
            <mesh material={mats.carcass} position={[0, 2.32, -0.02]} castShadow receiveShadow>
              <ChamferedBox args={[0.96, 0.98, 0.62]} />
            </mesh>
            {[-0.245, 0.245].map((dx) => (
              <group key={dx} position={[dx, 2.32, 0.31]}>
                <DoorSlab w={0.47} h={0.94} sel={sel} mats={mats} plain />
              </group>
            ))}
            <CeilingStack sel={sel} mats={mats} w={1.07} d={0.66} from={2.81} z={-0.02} />
          </group>
        </group>
      </Built>
    </group>
  );
}

/**
 * The room answers to the selected ceiling. The MasterFile carries the field; until now the
 * scene ignored it and every study was built in the same 11-foot volume.
 */
const CEILING_M: Record<string, number> = { '9 ft': 2.74, '10 ft': 3.05, '11 ft': 3.38, '12 ft': 3.66 };
const ceilingOf = (sel: Sel) => CEILING_M[sel.ceilingHeight] ?? 3.38;

/**
 * The design bible's bolded rule: cabinetry runs to the ceiling and no dead soffit band ever
 * appears. A tall run caps with a stacked upper and carries its crown at the ceiling line,
 * rather than stopping short and leaving the generic-archviz gap above it.
 */
function CeilingStack({ sel, mats, w, d, from, bays = 2, z = 0, endPanel = false }: {
  sel: Sel; mats: Mats; w: number; d: number; from: number; bays?: number; z?: number; endPanel?: boolean;
}) {
  const crownBand = sel.topTrim === 'None' ? 0.012 : 0.11;
  const h = ceilingOf(sel) - from - crownBand;
  // too short to read as casework — leave the reveal rather than fake a cabinet
  if (h < 0.26) return null;
  const depth = d - 0.03;
  const gap = sel.cabinetStyle === 'Inset Face Frame' ? 0.007 : 0.0025;
  return (
    <group position={[0, from, z]}>
      <group position={[0, h / 2, 0]}>
        <CarcassShell mats={mats} w={w} h={h} d={depth} dividerXs={bays > 1 ? [0] : []} />
      </group>
      {endPanel ? (
        <mesh material={mats.panel} position={[-w / 2 - 0.011, h / 2, 0]} castShadow receiveShadow>
          <ChamferedBox args={[0.019, h, depth]} />
        </mesh>
      ) : null}
      {Array.from({ length: bays }, (_, i) => {
        const bayW = w / bays;
        return (
          <group key={i} position={[-w / 2 + bayW * (i + 0.5), h / 2, depth / 2]}>
            <DoorSlab w={bayW - 0.006 - gap * 2} h={h - 0.02} sel={sel} mats={mats} upper />
          </group>
        );
      })}
      <Crown sel={sel} mats={mats} w={w} y={h} d={depth} z={0} />
    </group>
  );
}

/**
 * The bible's appliance program: a 30" wall oven with a speed oven stacked above it, in the tall
 * run rather than buried in a base cabinet. Panel-front cabinetry above and a warming drawer
 * below, so the stack reads as millwork holding appliances, not appliances interrupting millwork.
 */
function OvenStack({ sel, mats, w, h, d }: { sel: Sel; mats: Mats; w: number; h: number; d: number }) {
  const faceZ = d / 2 + 0.012;
  const cavity = (label: number, y: number, boxH: number) => (
    <group key={label} position={[0, y, 0]}>
      {/* dark stainless surround, black glass door, a full-width bar handle */}
      <mesh material={mats.applianceDark} position={[0, 0, faceZ]} castShadow receiveShadow>
        <ChamferedBox args={[w - 0.05, boxH, 0.024]} />
      </mesh>
      <mesh material={mats.cooktop} position={[0, -0.02, faceZ + 0.014]}>
        <ChamferedBox args={[w - 0.14, boxH - 0.14, 0.008]} />
      </mesh>
      <mesh material={mats.hw} position={[0, boxH / 2 - 0.045, faceZ + 0.036]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.009, w - 0.16, 6, 12]} />
      </mesh>
      {/* the control strip is what makes an appliance read as an appliance at distance */}
      <mesh material={mats.led} position={[0.1, boxH / 2 - 0.092, faceZ + 0.015]}>
        <ChamferedBox args={[0.14, 0.012, 0.006]} />
      </mesh>
    </group>
  );
  const ovenH = 0.62;
  const speedH = 0.44;
  const drawerH = 0.24;
  const stackTop = 0.1 + h;
  return (
    <group>
      {cavity(0, stackTop - 0.34 - speedH / 2, speedH)}
      {cavity(1, stackTop - 0.34 - speedH - 0.02 - ovenH / 2, ovenH)}
      {/* warming drawer, then panelled storage up to the crown */}
      <group position={[0, stackTop - 0.34 - speedH - ovenH - 0.06 - drawerH / 2, d / 2]}>
        <DoorSlab w={w - 0.05} h={drawerH} sel={sel} mats={mats} drawer />
      </group>
      <group position={[0, stackTop - 0.17, d / 2]}>
        <DoorSlab w={w - 0.05} h={0.3} sel={sel} mats={mats} upper />
      </group>
    </group>
  );
}

/** Terminates the right end of the run, which is what an elevation does. Moving the refrigerator
 *  over to the tall bank fixed the program but left two metres of blank plaster where the tower
 *  used to close the frame, and a working wall does not just stop at counter height. A tall
 *  utility cabinet is the ordinary answer and it is casework this shop sells. */
function TallUtility({ sel, mats, runOffset = 0.7 }: { sel: Sel; mats: Mats; runOffset?: number }) {
  const w = 0.62;
  const h = 2.3;
  const d = 0.64;
  const x = runOffset + 3.6 / 2 + w / 2 + 0.005;
  const inset = sel.cabinetStyle === 'Inset Face Frame';
  const gap = inset ? 0.007 : 0.0025;
  const dw = w - 0.006 - gap * 2;
  return (
    <group position={[x, 0, -1.44]}>
      <Base sel={sel} mats={mats} w={w} d={d} />
      <group position={[0, 0.1 + h / 2, 0]}>
        <CarcassShell mats={mats} w={w} h={h} d={d} />
      </group>
      <EndPanel sel={sel} mats={mats} d={d} h={h} x={w / 2 + 0.011} />
      <group position={[0, 0.1, d / 2]}>
        {/* the bay group sits at the FRONT face, so the fittings live a half-depth behind it —
            without this the shelves stand through the closed doors */}
        <group position={[0, 0.1 + h / 2 - 0.1, -d / 2]}>
          <BayFittings sel={sel} mats={mats} w={w - 0.04} h={h - 0.1} d={d - 0.05} fittings="pantry" />
        </group>
        <group position={[0, h * 0.32, 0]}>
          <Opening id="util-lo" kind="door-right" hinge={[w / 2 - gap, 0, inset ? -0.006 : 0.011]}>
            <group position={[-dw / 2, 0, 0]}>
              <DoorSlab w={dw} h={h * 0.62} sel={sel} mats={mats} withHinges hingeSide="right" />
            </group>
          </Opening>
        </group>
        <group position={[0, h * 0.82, 0]}>
          <Opening id="util-up" kind="door-right" hinge={[w / 2 - gap, 0, inset ? -0.006 : 0.011]}>
            <group position={[-dw / 2, 0, 0]}>
              <DoorSlab w={dw} h={h * 0.34} sel={sel} mats={mats} withHinges upper hingeSide="right" />
            </group>
          </Opening>
        </group>
      </group>
      <CeilingStack sel={sel} mats={mats} w={w} d={d} from={0.1 + h} bays={1} endPanel />
    </group>
  );
}

function TallPantry({ sel, mats, runOffset = 0.7 }: { sel: Sel; mats: Mats; runOffset?: number }) {
  // The tall run carries two pantry bays and then the oven stack, flush against the left end of
  // the wall run so no orphaned wall gap opens between them.
  //
  // Ovens on the RIGHT of this bank, not the left. They were at the far end, which put the wall
  // oven and the speed oven 3.8 m from the cooktop with the sink in between — a cook carrying a
  // hot tray crossed the whole working wall, and no one builds it that way. On this side they
  // sit against the counter run, 2.6 m from the range, with landing space immediately to hand.
  const ovenW = 0.76;
  const pantryW = 0.57;
  const w = ovenW + pantryW * 2;
  const h = 2.3;
  const d = 0.64;
  const x = runOffset - 3.6 / 2 - w / 2 - 0.005;
  const inset = sel.cabinetStyle === 'Inset Face Frame';
  const gap = inset ? 0.007 : 0.0025;
  return (
    <group position={[x, 0, -1.44]}>
      <Base sel={sel} mats={mats} w={w} d={d} />
      <group position={[0, 0.1 + h / 2, 0]}>
        <CarcassShell mats={mats} w={w} h={h} d={d} dividerXs={[-w / 2 + pantryW, -w / 2 + pantryW * 2]} />
      </group>
      <EndPanel sel={sel} mats={mats} d={d} h={h} x={-w / 2 - 0.011} />
      <group position={[w / 2 - ovenW / 2, 0, 0]}>
        <OvenStack sel={sel} mats={mats} w={ovenW} h={h} d={d} />
      </group>
      {[0, 1].map((i) => {
        const bayW = pantryW;
        const bx = -w / 2 + bayW * (i + 0.5);
        const dw = bayW - 0.006 - gap * 2;
        return (
          <group key={i} position={[bx, 0.1, d / 2]}>
            <group position={[0, 0.1 + h / 2 - 0.1, -d / 2 + d / 2 - d / 2]}>
              <BayFittings sel={sel} mats={mats} w={bayW - 0.04} h={h - 0.1} d={d - 0.05} fittings="pantry" />
            </group>
            <group position={[0, h * 0.32, 0]}>
              <Opening id={`tall${i}-lo`} kind={i === 0 ? 'door-left' : 'door-right'} hinge={[i === 0 ? -bayW / 2 + gap : bayW / 2 - gap, 0, inset ? -0.006 : 0.011]}>
                <group position={[i === 0 ? dw / 2 : -dw / 2, 0, 0]}>
                  <DoorSlab w={dw} h={h * 0.62} sel={sel} mats={mats} withHinges hingeSide={i === 0 ? 'left' : 'right'} />
                </group>
              </Opening>
            </group>
            <group position={[0, h * 0.82, 0]}>
              <Opening id={`tall${i}-up`} kind={i === 0 ? 'door-left' : 'door-right'} hinge={[i === 0 ? -bayW / 2 + gap : bayW / 2 - gap, 0, inset ? -0.006 : 0.011]}>
                <group position={[i === 0 ? dw / 2 : -dw / 2, 0, 0]}>
                  <DoorSlab w={dw} h={h * 0.34} sel={sel} mats={mats} withHinges upper hingeSide={i === 0 ? 'left' : 'right'} />
                </group>
              </Opening>
            </group>
          </group>
        );
      })}
      <CeilingStack sel={sel} mats={mats} w={w} d={d} from={0.1 + h} bays={3} endPanel />
    </group>
  );
}

/* ————— cameras ————— */

const CAMERAS: Record<string, { pos: [number, number, number]; target: [number, number, number]; fov?: number }> = {
  overview: { pos: [3.3, 1.42, 4.9], target: [0.1, 1.18, -0.5], fov: 44 },
  hero: { pos: [2.5, 1.5, 3.2], target: [0, 0.55, 0.62] },
  detail: { pos: [1.15, 1.1, 2.5], target: [0.5, 0.72, 0.62] },
  uppers: { pos: [1.6, 1.9, 1.6], target: [0, 1.9, -1.4] },
  base: { pos: [1.8, 0.5, 2.6], target: [0, 0.22, 0.3] },
  hardware: { pos: [0.75, 1.0, 1.9], target: [0.42, 0.75, 0.66] },
  ends: { pos: [-2.6, 1.2, 2.6], target: [-1.3, 0.6, 0.62] },
  inside: { pos: [1.7, 1.6, 3.1], target: [0, 0.65, 0.5] },
  sink: { pos: [1.6, 1.82, 0.9], target: [0.2, 0.9, -1.2] },
  range: { pos: [0.45, 1.4, 1.02], target: [0.45, 1.48, -1.45], fov: 30 },
};

function GradeRig({ mode }: { mode: LightMode }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    gl.toneMappingExposure = GRADE[mode].exposure;
    const bg = new THREE.Color(GRADE[mode].bg);
    scene.background = bg;
    if (scene.fog) {
      (scene.fog as THREE.Fog).color = bg;
    }
  }, [gl, scene, mode]);
  return null;
}

function CameraRig({ view, controls, xOff = 0 }: { view: string; controls: React.RefObject<ControlsLike | null>; xOff?: number }) {
  const { camera } = useThree();
  const base = CAMERAS[view] ?? CAMERAS.overview!;
  // the wall run (and its range and sink) shifts in the Full room — follow it
  const shifted = xOff !== 0 && (view === 'range' || view === 'sink');
  const goal = shifted
    ? { ...base, pos: [base.pos[0] + xOff, base.pos[1], base.pos[2]] as [number, number, number], target: [base.target[0] + xOff, base.target[1], base.target[2]] as [number, number, number] }
    : base;
  const t = useRef(1);
  const from = useRef({ pos: new THREE.Vector3(), target: new THREE.Vector3(), fov: 35 });
  const goalPos = useRef(new THREE.Vector3());
  const goalTarget = useRef(new THREE.Vector3());
  const prevView = useRef(view);
  useFrame((_, delta) => {
    if (prevView.current !== view) {
      prevView.current = view;
      t.current = 0;
      from.current.pos.copy(camera.position);
      from.current.fov = (camera as THREE.PerspectiveCamera).fov;
      if (controls.current) from.current.target.copy(controls.current.target);
    }
    if (t.current >= 1) return;
    t.current = Math.min(1, t.current + delta * 1.35);
    // Ease in AND out. The old curve was `1 - (1-t)^3`, which leaves at full speed from a dead
    // stop — the one thing a camera never does. Smootherstep has zero velocity and zero
    // acceleration at both ends, so the move starts and lands without a visible snap.
    const x = t.current;
    const k = x * x * x * (x * (x * 6 - 15) + 10);
    goalPos.current.set(goal.pos[0], goal.pos[1], goal.pos[2]);
    camera.position.lerpVectors(from.current.pos, goalPos.current, k);
    // FOV rides the same curve as the position. It used to run a separate compounding lerp, so
    // the dolly and the zoom arrived at different times and the move read as two moves.
    const persp = camera as THREE.PerspectiveCamera;
    const goalFov = goal.fov ?? 35;
    const nextFov = from.current.fov + (goalFov - from.current.fov) * k;
    if (Math.abs(persp.fov - nextFov) > 0.001) {
      persp.fov = nextFov;
      persp.updateProjectionMatrix();
    }
    if (controls.current) {
      goalTarget.current.set(goal.target[0], goal.target[1], goal.target[2]);
      controls.current.target.lerpVectors(from.current.target, goalTarget.current, k);
      controls.current.update();
    }
  });
  return null;
}

/* ————— scene ————— */

/**
 * Lived-in set dressing: Blender-kit props placed the way the studio project
 * photography stages real rooms — cut flowers, a working coffee corner,
 * leaning boards, a towel in use. Pure dressing: appears only once the kit
 * loads, and never blocks or replaces cabinet proof.
 */
const SetDressing = memo(function SetDressing({ sel, mats, seating = true }: { sel: Sel; mats: Mats; seating?: boolean }) {
  const kit = useKit();
  const scannedPlant = null;
  if (!kit) return null;
  const xOff = sel.layout === 'fullshop' ? 0.7 : 0;
  const counterY = 0.92;
  return (
    <group>
      {/* wall-run coffee corner, right of the sink */}
      {kit.kettle ? (
        <group position={[xOff + 1.18, counterY, -1.32]} rotation={[0, -0.6, 0]}>
          <KitMesh geometry={kit.kettle} base={mats.accentRed} rotation={[Math.PI / 2, 0, 0]} />
        </group>
      ) : null}
      {kit.crock_utensils ? (
        <KitMesh geometry={kit.crock_utensils} base={mats.ceramic} position={[xOff - 0.92, counterY, -1.55]} rotation={[Math.PI / 2, 0, 0]} />
      ) : null}
      {kit.boards_leaning ? (
        <group position={[xOff - 1.28, counterY, -1.66]} rotation={[0, 0.09, 0]}>
          <KitMesh geometry={kit.boards_leaning} base={mats.boardWood} rotation={[Math.PI / 2, 0, 0]} />
        </group>
      ) : null}
      {kit.canister_trio ? (
        <KitMesh geometry={kit.canister_trio} base={mats.ceramic} position={[xOff + 1.52, counterY, -1.57]} rotation={[Math.PI / 2, 0.12, 0]} />
      ) : null}
      {kit.towel_drape ? (
        <KitMesh geometry={kit.towel_drape} base={mats.linen} position={[xOff - 1.3, counterY + 0.012, -1.09]} rotation={[Math.PI / 2, 0, 0]} />
      ) : null}
      {/* vintage-washed runner in the work aisle — the aged wildcard */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[xOff + 0.1, 0.012, -0.52]} receiveShadow>
        <planeGeometry args={[2.35, 0.78]} />
        <meshStandardMaterial map={getRunnerTexture()} roughness={0.92} />
      </mesh>
      {/* a sideboard in the selected finish against the rear-right wall — the
          millwork range continues beyond the kitchen, and the mirror bounces it */}
      <group position={[4.3, 0, -1.55]}>
        {[[-0.66, -0.15], [0.66, -0.15], [-0.66, 0.15], [0.66, 0.15]].map(([fx, fz], i) => (
          kit.foot_turned ? (
            <KitMesh key={i} geometry={kit.foot_turned!} base={mats.front} position={[fx!, 0, fz!]} rotation={[Math.PI / 2, 0, 0]} />
          ) : null
        ))}
        <mesh material={mats.carcass} position={[0, 0.47, 0]} castShadow receiveShadow>
          <ChamferedBox args={[1.44, 0.74, 0.42]} />
        </mesh>
        {[-0.47, 0, 0.47].map((dx) => (
          <group key={dx} position={[dx, 0.47, 0.221]}>
            <DoorSlab w={0.44} h={0.68} sel={sel} mats={mats} plain />
            <mesh material={mats.hw} position={[0, 0.24, 0.03]} castShadow>
              <sphereGeometry args={[0.016, 12, 10]} />
            </mesh>
          </group>
        ))}
        <RoundedBox args={[1.52, 0.045, 0.48]} radius={0.006} smoothness={3} position={[0, 0.87, 0.01]} castShadow receiveShadow material={mats.wallCounter} />
        <group position={[0, 1.62, -0.16]}>
          <mesh material={mats.brassFixed} castShadow>
            <torusGeometry args={[0.4, 0.02, 12, 48]} />
          </mesh>
          <mesh position={[0, 0, -0.004]}>
            <circleGeometry args={[0.395, 40]} />
            <meshPhysicalMaterial color="#d6dcda" metalness={1} roughness={0.05} envMapIntensity={2.4} />
          </mesh>
        </group>
        {kit.vase_glass ? (
          <group position={[-0.5, 0.892, 0.02]}>
            <KitMesh geometry={kit.vase_glass} base={mats.glass} rotation={[Math.PI / 2, 0, 0]} scale={[0.8, 0.8, 0.8]} />
            {kit.flower_stems ? <KitMesh geometry={kit.flower_stems} base={mats.greenery} rotation={[Math.PI / 2, 0, 0]} scale={[0.8, 0.8, 0.8]} /> : null}
            {kit.flower_blooms ? <KitMesh geometry={kit.flower_blooms} base={mats.bloom} rotation={[Math.PI / 2, 0, 0]} scale={[0.8, 0.8, 0.8]} /> : null}
          </group>
        ) : null}
      </group>
      {/* The corner under the shelves was the one stretch of bare board the eye had nothing to
          do with. A snake plant is the right height to fill it without reaching the lower
          shelf, and the only houseplant that survives a windowless corner in real life. */}
      <SnakePlant position={[-4.5, 0, -0.72]} rotation={0.5} scale={1.02} />
      {/* No styled open shelving. Books, a brass pitcher and stacked ceramics were dressing a
          wall the refrigerator tower now owns — and open shelves are not a Master File product.
          The studio sells cabinets; the wall shows cabinets. */}
      {/* the fig tree by the window wall — greenery appears in every frame */}
      {kit.tree_pot ? (
        <group position={[-4.15, 0, 2.35]}>
          <KitMesh geometry={kit.tree_pot} base={mats.terracotta} rotation={[Math.PI / 2, 0, 0]} />
          {kit.tree_trunk ? <KitMesh geometry={kit.tree_trunk} base={mats.bark} rotation={[Math.PI / 2, 0, 0]} /> : null}
          {kit.tree_leaves ? <KitMesh geometry={kit.tree_leaves} base={mats.greenery} rotation={[Math.PI / 2, 0, 0]} /> : null}
        </group>
      ) : null}
      {/* No stools. Furniture in front of the run is furniture in front of the product. */}
      {/* island styling — only when an island exists */}
      {sel.layout !== 'galley' ? (
        <group>
          {kit.vase_glass ? (
            <group position={[0.52, counterY + 0.016, 0.5]}>
              <KitMesh geometry={kit.vase_glass} base={mats.glass} rotation={[Math.PI / 2, 0, 0]} />
              {kit.flower_stems ? <KitMesh geometry={kit.flower_stems} base={mats.greenery} rotation={[Math.PI / 2, 0, 0]} /> : null}
              {kit.flower_blooms ? <KitMesh geometry={kit.flower_blooms} base={mats.bloom} rotation={[Math.PI / 2, 0, 0]} /> : null}
            </group>
          ) : null}
          {kit.bowl_dough ? (
            <group position={[-0.56, counterY + 0.016, 0.72]}>
              <KitMesh geometry={kit.bowl_dough} base={mats.ceramic} rotation={[Math.PI / 2, 0, 0]} />
              {[[-0.028, 0.055, 0.012], [0.034, 0.055, -0.018], [0.004, 0.098, -0.002]].map(([lx, ly, lz], i) => (
                <mesh key={i} material={mats.lemon} position={[lx!, ly!, lz!]} rotation={[0.4 * i, 0.8 * i, 0]} castShadow>
                  <sphereGeometry args={[0.036, 18, 14]} />
                </mesh>
              ))}
            </group>
          ) : null}
        </group>
      ) : null}
    </group>
  );
}, (a, b) => (
  a.mats === b.mats
  && a.seating === b.seating
  && a.sel.layout === b.sel.layout
  && a.sel.door === b.sel.door
  && a.sel.hardware === b.sel.hardware
));


function DustMotes({ mode }: { mode: LightMode }) {
  const points = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = 130;
    const pos = new Float32Array(n * 3);
    const seed = new Float32Array(n);
    for (let i = 0; i < n; i += 1) {
      pos[i * 3] = -3.4 + (i % 13) * 0.22 + ((i * 7919) % 100) / 260;
      pos[i * 3 + 1] = 0.7 + ((i * 104729) % 100) / 42;
      pos[i * 3 + 2] = -1.5 + ((i * 1299709) % 100) / 36;
      seed[i] = ((i * 15485863) % 1000) / 1000;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.userData.seed = seed;
    return g;
  }, []);
  const mat = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 32; c.height = 32;
    const ctx = c.getContext('2d')!;
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,244,220,1)');
    grad.addColorStop(1, 'rgba(255,244,220,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
    const tex = new THREE.CanvasTexture(c);
    return new THREE.PointsMaterial({
      map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      size: 0.02, sizeAttenuation: true, opacity: 0.0,
    });
  }, []);
  useFrame(({ clock }) => {
    if (!points.current) return;
    const target = mode === 'dusk' ? 0.11 : mode === 'lived-in' ? 0.055 : 0.03;
    mat.opacity += (target - mat.opacity) * 0.04;
    const t = clock.elapsedTime;
    const pos = geo.getAttribute('position') as THREE.BufferAttribute;
    const seed = geo.userData.seed as Float32Array;
    for (let i = 0; i < pos.count; i += 1) {
      const s = seed[i]!;
      pos.setY(i, 0.7 + ((s * 100 + t * (0.018 + s * 0.02)) % 2.4));
      pos.setX(i, pos.getX(i) + Math.sin(t * 0.3 + s * 12) * 0.0004);
    }
    pos.needsUpdate = true;
  });
  return <points ref={points} geometry={geo} material={mat} />;
}

function JewelBoxContents({ mats }: { mats: Mats }) {
  const kit = useKit();
  if (!kit?.bottles_bar) return null;
  return (
    <group>
      {[0.67, 1.33].map((sy) => (
        <group key={sy}>
          <mesh material={mats.kick} position={[0, sy, -0.14]}>
            <ChamferedBox args={[0.7, 0.03, 0.26]} />
          </mesh>
          <KitMesh geometry={kit.bottles_bar!} base={sy > 1 ? mats.amber : mats.glass} position={[0, sy + 0.018, -0.14]} rotation={[Math.PI / 2, 0, 0]} />
        </group>
      ))}
    </group>
  );
}

const RoomEnvelope = memo(function RoomEnvelope({ mats, lightingMode, ceiling = 3.38 }: { mats: Mats; lightingMode: LightMode; ceiling?: number }) {
  const neutral = lightingMode === 'neutral';
  const G = GRADE[lightingMode];
  return (
    <group>
      {/* A continuous floor, rear wall, two returns, and ceiling terminate the
          room. The front remains open so the cabinet can still be inspected. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.004, 0.4]} material={mats.floor} receiveShadow>
        <planeGeometry args={[18, 15]} />
      </mesh>
      <mesh material={mats.wall} position={[0.35, 1.7, -1.825]} receiveShadow>
        <ChamferedBox args={[10.8, 3.4, 0.045]} />
      </mesh>
      <mesh material={mats.wall} position={[-4.98, 1.7, 1.4]} receiveShadow>
        <ChamferedBox args={[0.045, 3.4, 6.45]} />
      </mesh>
      <mesh material={mats.wall} position={[5.72, 1.7, 0.65]} receiveShadow>
        <ChamferedBox args={[0.045, 3.4, 4.95]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0.35, ceiling, 0.42]} material={mats.wall} receiveShadow>
        <planeGeometry args={[10.8, 8]} />
      </mesh>

      {/* recessed cans, the way the reference kitchens carry their ambient light —
          emissive discs read as fixtures without adding per-frame light cost */}
      {/* reclaimed box beams — the pendants drop from the center beam */}
      {/* Two bugs in one line before this: the beams were pinned at y=3.29 while the ceiling
          moves with the selection (2.74 m at 9 ft, 3.66 m at 12 ft), so they hung in mid-air or
          punched through it; and their top face landed at exactly 3.38000 — the ceiling plane —
          for 7.8 m2 of z-fighting at 11 ft. They now hang from whatever the ceiling is, and
          their top sits 10 mm inside it where nothing can see it. */}
      {[-0.3, 0.62, 1.54].map((bz) => (
        <mesh key={bz} material={mats.beamWood} position={[0.35, ceiling - 0.085, bz]} castShadow receiveShadow>
          <ChamferedBox args={[10.8, 0.19, 0.24]} />
        </mesh>
      ))}
      {[-2.5, 0.3, 3.1].flatMap((cx) => [-1.25, 2.2].map((cz) => (
        <group key={`${cx}:${cz}`} position={[cx, 3.372, cz]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.055, 0.072, 24]} />
            <meshStandardMaterial color="#d8d2c4" roughness={0.6} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]}>
            <circleGeometry args={[0.055, 24]} />
            <meshStandardMaterial
              color={neutral ? '#fefcf6' : '#fff3dc'}
              emissive={neutral ? '#fff9ec' : '#ffe3b0'}
              emissiveIntensity={Math.max(0.55, 1.4 * G.practicals)}
            />
          </mesh>
        </group>
      )))}
      {/* applied panel molding on the return walls — the millwork carries past
          the kitchen, the way the portfolio's houses are actually trimmed */}
      <group position={[5.695, 0, 0.65]} rotation={[0, -Math.PI / 2, 0]}>
        {[-1.7, -0.02, 1.66].map((px) => (
          <group key={px} position={[px, 0, 0]}>
            {([[0.62, 0.72, 1.5], [2.06, 1.52, 1.5]] as const).map(([cy, ph, pw], r) => (
              <group key={r} position={[0, cy, 0]}>
                {[[0, ph / 2 - 0.022, pw, 0.044], [0, -ph / 2 + 0.022, pw, 0.044], [-pw / 2 + 0.022, 0, 0.044, ph], [pw / 2 - 0.022, 0, 0.044, ph]].map(([mx, my, mw, mh], m) => (
                  <mesh key={m} material={mats.trim} position={[mx!, my!, 0.012]} castShadow>
                    <ChamferedBox args={[mw!, mh!, 0.02]} />
                  </mesh>
                ))}
              </group>
            ))}
          </group>
        ))}
      </group>
      <group position={[-4.945, 0, 4.2]} rotation={[0, Math.PI / 2, 0]}>
        {([[0.62, 0.72, 0.62], [2.06, 1.52, 0.62]] as const).map(([cy, ph, pw], r) => (
          <group key={r} position={[0, cy, 0]}>
            {[[0, ph / 2 - 0.022, pw, 0.044], [0, -ph / 2 + 0.022, pw, 0.044], [-pw / 2 + 0.022, 0, 0.044, ph], [pw / 2 - 0.022, 0, 0.044, ph]].map(([mx, my, mw, mh], m) => (
              <mesh key={m} material={mats.trim} position={[mx!, my!, 0.012]} castShadow>
                <ChamferedBox args={[mw!, mh!, 0.02]} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
      {/* painted baseboards with a proud cap, the way the photographed rooms
          are actually trimmed out; the left run breaks for the cased opening */}
      {([
        [[0.35, -1.782], [10.8, 0.035], 0],
        [[5.685, 0.65], [0.035, 4.95], 0],
        [[-4.945, 0.4975], [0.035, 4.645], 0],
        [[-4.945, 4.2], [0.035, 0.845], 0],
      ] as const).map(([[bx, bz], [bw, bd]], i) => (
        <group key={i} position={[bx, 0, bz]}>
          <mesh material={mats.trim} position={[0, 0.0725, 0]} castShadow receiveShadow>
            <ChamferedBox args={[bw, 0.145, bd]} />
          </mesh>
          <mesh material={mats.trim} position={[0, 0.1505, 0]} castShadow>
            <ChamferedBox args={[bw === 0.035 ? 0.049 : bw, 0.011, bd === 0.035 ? 0.049 : bd]} />
          </mesh>
        </group>
      ))}

      {/* the left return wall carries real architecture: a second steel-framed
          opening for cross light, and a cased doorway into the rest of the house */}
      <group position={[-4.955, 2.05, 0.7]} rotation={[0, Math.PI / 2, 0]}>
        <mesh material={mats.windowFrame} position={[0, 0, -0.006]}>
          <ChamferedBox args={[1.62, 1.52, 0.026]} />
        </mesh>
        <mesh material={mats.daylight} position={[0, 0, 0.012]}>
          <planeGeometry args={[1.46, 1.36]} />
        </mesh>
        {[-0.73, 0.73].map((px) => (
          <mesh key={px} material={mats.windowFrame} position={[px, 0, 0.032]} castShadow>
            <ChamferedBox args={[0.055, 1.5, 0.055]} />
          </mesh>
        ))}
        {[-0.68, 0.68].map((py) => (
          <mesh key={py} material={mats.windowFrame} position={[0, py, 0.032]} castShadow>
            <ChamferedBox args={[1.52, 0.055, 0.055]} />
          </mesh>
        ))}
        <mesh material={mats.windowFrame} position={[0, 0, 0.04]} castShadow>
          <ChamferedBox args={[0.026, 1.36, 0.042]} />
        </mesh>
        <mesh material={mats.windowFrame} position={[0, 0, 0.04]} castShadow>
          <ChamferedBox args={[1.46, 0.026, 0.042]} />
        </mesh>
        <mesh material={mats.trim} position={[0, -0.79, 0.07]} castShadow receiveShadow>
          <ChamferedBox args={[1.74, 0.05, 0.16]} />
        </mesh>
      </group>
      <rectAreaLight
        position={[-4.85, 2.05, 0.7]}
        rotation={[0, -Math.PI / 2, 0]}
        width={1.46}
        height={1.36}
        color={G.rect}
        intensity={G.rectInt * 0.7}
      />
      <group position={[-4.952, 0, 3.3]} rotation={[0, Math.PI / 2, 0]}>
        {/* the hallway beyond reads as depth, not decoration */}
        <mesh position={[0, 1.22, -0.03]}>
          <planeGeometry args={[0.95, 2.44]} />
          <meshBasicMaterial color="#161310" toneMapped={false} />
        </mesh>
        {[-0.52, 0.52].map((px) => (
          <mesh key={px} material={mats.trim} position={[px, 1.26, 0.02]} castShadow receiveShadow>
            <ChamferedBox args={[0.09, 2.52, 0.042]} />
          </mesh>
        ))}
        <mesh material={mats.trim} position={[0, 2.56, 0.02]} castShadow>
          <ChamferedBox args={[1.13, 0.1, 0.042]} />
        </mesh>
        {/* the terminus of the sightline: a lit mesh-front hutch in the hall */}
        <group position={[0, 0, -0.78]}>
          <mesh material={mats.kick} position={[0, 0.95, -0.16]}>
            <ChamferedBox args={[0.78, 1.9, 0.3]} />
          </mesh>
          <mesh position={[0, 0.95, -0.28]}>
            <planeGeometry args={[0.7, 1.7]} />
            <meshStandardMaterial color="#f4dcae" emissive="#ffd28e" emissiveIntensity={1.3 * G.practicals} />
          </mesh>
          <JewelBoxContents mats={mats} />
          <mesh material={mats.metalMesh} position={[0, 0.95, 0.005]}>
            <planeGeometry args={[0.72, 1.74]} />
          </mesh>
          {[-0.36, 0.36].map((jx) => (
            <mesh key={jx} material={mats.kick} position={[jx, 0.95, 0.005]}>
              <ChamferedBox args={[0.05, 1.9, 0.05]} />
            </mesh>
          ))}
          {[0.0, 0.62, 1.28, 1.86].map((jy) => (
            <mesh key={jy} material={mats.kick} position={[0, jy + 0.02, 0.005]}>
              <ChamferedBox args={[0.78, 0.05, 0.05]} />
            </mesh>
          ))}
          <pointLight position={[0, 1.2, -0.1]} intensity={0.75 * G.practicals} distance={1.6} decay={2} color="#ffd28e" />
        </group>
      </group>

      {/* A quiet, neutral backsplash gives the wall run an architectural
          termination without pretending to be a specified stone product. */}
      <mesh material={mats.wallCounter} position={[0.35, 1.205, -1.784]} receiveShadow>
        <ChamferedBox args={[4.35, 0.69, 0.024]} />
      </mesh>

      {/* A generic broad opening anchors daylight in a visible source rather
          than a colored world background. It is deliberately non-site-specific. */}
      {/* steel-framed opening, matching the black window frames in the reference
          kitchens; taller and wider so daylight actually owns the left of frame */}
      <group position={[-2.75, 2.0, -1.785]}>
        <mesh material={mats.windowFrame} position={[0, 0, -0.006]}>
          <ChamferedBox args={[2.06, 1.72, 0.026]} />
        </mesh>
        <mesh material={mats.daylight} position={[0, 0, 0.012]}>
          <planeGeometry args={[1.88, 1.55]} />
        </mesh>
        {[-0.94, 0.94].map((px) => (
          <mesh key={px} material={mats.windowFrame} position={[px, 0, 0.032]} castShadow>
            <ChamferedBox args={[0.06, 1.7, 0.06]} />
          </mesh>
        ))}
        {[-0.775, 0.775].map((py) => (
          <mesh key={py} material={mats.windowFrame} position={[0, py, 0.032]} castShadow>
            <ChamferedBox args={[1.95, 0.06, 0.06]} />
          </mesh>
        ))}
        {[-0.313, 0.313].map((px) => (
          <mesh key={px} material={mats.windowFrame} position={[px, 0, 0.042]} castShadow>
            <ChamferedBox args={[0.028, 1.55, 0.045]} />
          </mesh>
        ))}
        <mesh material={mats.windowFrame} position={[0, 0, 0.042]} castShadow>
          <ChamferedBox args={[1.88, 0.028, 0.045]} />
        </mesh>
        <mesh material={mats.wall} position={[0, -0.885, 0.16]} castShadow receiveShadow>
          <ChamferedBox args={[2.2, 0.055, 0.28]} />
        </mesh>
      </group>
      <rectAreaLight
        position={[-2.75, 2.0, -1.69]}
        rotation={[0, Math.PI, 0]}
        width={1.88}
        height={1.55}
        color={G.rect}
        intensity={G.rectInt}
      />
    </group>
  );
});


/**
 * The grade, extracted and memoised — and the reason is a measured leak, not tidiness.
 *
 * This composer used to live inline in `SceneInner`, so its children array was rebuilt on every
 * render of the scene, which means on every single selection the visitor makes. @react-three/
 * postprocessing responds to a changed effect list by rebuilding its passes, and a rebuilt pass
 * allocates fresh render targets without disposing the ones it just abandoned.
 *
 * Counted at the WebGL layer by patching `createTexture`/`deleteTexture`: live GPU textures went
 * 65 -> 100 across eight look changes, climbing three to five each time and never coming back
 * down — freeing stopped entirely after load. Re-picking a look the visitor had already chosen
 * leaked exactly as much as a new one, which is the signature of a rebuild rather than of real
 * work. The stacks agreed: ten of the twelve allocations in two look changes came from
 * `setupRenderTarget` inside a pass update.
 *
 * It only depends on three things. Memoising on those keeps the passes alive for the session.
 */
const Grade = memo(function Grade({
  lightingMode,
  tier,
  degrade,
}: {
  lightingMode: LightMode;
  tier: SceneQualityTier;
  degrade: number;
}) {
  // Multisampling is the last thing to go, not the first. 4x MSAA on a buffer this size is a
  // fraction of a millisecond on any GPU of the last decade, and aliasing is the single loudest
  // "this is a cheap render" signal an edge can send — a room full of face frames, reveals and
  // counter edges is nothing BUT silhouettes. This used to drop to 0 the moment the frame
  // monitor complained, which it did during every load-in, on every machine.
  return (
      <EffectComposer multisampling={degrade >= 3 ? 2 : 4}>
        {/* Ambient occlusion, and NOT depth of field — the two cannot coexist here, which cost
            enough time to be worth writing down.
            N8AO is a custom render pass rather than an effect the composer merges, and it breaks
            the chain for a DepthOfField placed anywhere in this composer. Proven by elimination,
            not assumed: with N8AO removed, DepthOfField blurs the room dramatically at
            bokehScale 9; with N8AO present it does nothing at that same aperture placed BEFORE
            it, nothing placed after it, and nothing with `halfRes` off. Three variables, same
            result. A DepthOfField added earlier in this session was cut as "broken" on the first
            of those observations alone, which was the right call for the wrong reason.
            If both are ever wanted, the fix is a different AO implementation, not a reorder.
            Keeping AO: it makes every reveal, corner and underside read as three-dimensional
            across the whole room, while depth of field is a photographic flourish that actively
            works against someone trying to inspect a door profile. */}
        {tier === 'high' && degrade === 0
          ? <N8AO aoRadius={0.5} intensity={2.2} distanceFalloff={0.8} halfRes />
          : <></>}
        <Bloom intensity={lightingMode === 'dusk' ? 0.65 : 0.32} luminanceThreshold={1.0} mipmapBlur />
        {/* A grade, deliberately. AgX is a scene-referred transform, not a look: it rolls off
            highlights beautifully and leaves the midtones flat and desaturated, which is correct
            for grading FROM and wrong to ship AS. Swapping it for ACES changed the frame so little
            the aggregate statistics were identical, because the composer owns the tone map — so
            the richness has to be asked for explicitly. Small numbers: this is a kitchen someone
            is choosing a paint colour in, not a poster. */}
        {/* Dusk DECONTRASTS. David looked at the evening room and said the shadows were heavy, and he
            was right: 37.33% of the Base frame and 30.03% of the Door frame sat below luminance 32
            against 11.09% in the reference, and the island's dark fronts read as flat voids rather
            than as cabinets.
            Three things were tried first and are worth not repeating. Lifting ambient 3.4x and the
            hemisphere 3x moved it by half a point — near-black paint does not care how much
            ambient you give it. A brightness lift fixed the shadows and blew the highlights,
            Evening/Range clipping 0.28% to 5.18%. Opening the vignette did both at once.
            Negative contrast is the one lever that lifts the dark end and lowers the bright end
            together, which is exactly the note: Base 37.33% to 18.34%, Door 30.03% to 15.57%,
            Room 16.33% to 7.64%, and clipping FELL on every evening view. */}
          <BrightnessContrast brightness={0} contrast={lightingMode === 'dusk' ? -0.07 : 0.10} />
        <HueSaturation saturation={lightingMode === 'neutral' ? 0.03 : 0.055} />
        <Vignette eskil={false} offset={0.22} darkness={lightingMode === 'dusk' ? 0.62 : 0.42} />
      </EffectComposer>
  );
});

function SceneInner({
  sel,
  view,
  quality,
  lightingMode,
  idleDrift = false,
  degrade = 0,
  software = false,
  seating = true,
  wallTone = 'warm',
  stoneFinish = 'polished',
  counterEdge = 'eased',
  glowTemp = '3000',
  plumbing = 'match',
  islandTone = 'graphite',
}: {
  sel: Sel;
  view: string;
  quality: SceneQuality;
  lightingMode: LightMode;
  idleDrift?: boolean;
  /** 0 full · 1 ambient occlusion dropped · 2 resolution eased to 1.4 · 3 resolution at 1 */
  degrade?: number;
  /** drawing through a software rasteriser, where multisampling resolves incorrectly */
  software?: boolean;
  seating?: boolean;
  wallTone?: WallTone;
  stoneFinish?: StoneFinish;
  counterEdge?: 'eased' | 'waterfall';
  glowTemp?: GlowTemp;
  plumbing?: 'match' | 'stainless';
  islandTone?: IslandTone;
}) {
  const mats = useMats(sel, lightingMode, wallTone, stoneFinish, plumbing, islandTone);
  const controls = useRef<ControlsLike | null>(null);
  // The contact shadow bakes one frame. The stools, the props and half the millwork arrive later
  // through the GLB kit, so that bake has to wait for them — see the ContactShadows key below.
  const kitLoaded = Boolean(useKit());
  const neutral = lightingMode === 'neutral';
  const G = GRADE[lightingMode];

  // Any change to the room's shape, finish or light needs one fresh shadow pass.
  useEffect(() => { requestShadowUpdate(3); }, [mats, sel, lightingMode, quality.shadows, seating, islandTone]);

  return (
    <>
      <GradeRig mode={lightingMode} />
      <ShadowGovernor />
      <ambientLight intensity={G.ambient} />
      <hemisphereLight
        color={neutral ? '#fffdf8' : '#fffaf0'}
        groundColor={lightingMode === 'dusk' ? '#3a4152' : neutral ? '#c8c4ba' : '#b7a994'}
        intensity={G.hemi}
      />
      {/* A penumbra, because the sun is not a point. The beam this light throws across the far
          wall is the largest single bright area in the room and it had a hard, stair-stepped edge
          — the one place in the frame where the shadow map's resolution was legible as pixels
          rather than as light. The sun subtends about half a degree, and through a window that
          gives a soft-edged boundary several centimetres wide; a razor edge reads as a stencil.
          PCFSoft samples this radius, so widening it costs nothing per frame, and the shadow map
          is frozen after warm-up anyway.
          This note first went in between the attributes below, wrapped as a JSX expression
          comment, which is not valid there. SWC accepted it and rendered the scene — the build
          was green and the softer shadow was visibly working — and tsc rejected it as TS1005.
          A passing build is not a correct build; that is the second time this session. */}
      <directionalLight
        position={[3.6, 5.2, 4.2]}
        color={G.key}
        intensity={G.keyInt}
        castShadow={quality.shadows}
        shadow-mapSize={[quality.shadowMapSize, quality.shadowMapSize]}
        shadow-camera-left={-5.5}
        shadow-camera-right={5.5}
        shadow-camera-top={4}
        shadow-camera-bottom={-1}
        shadow-camera-near={0.5}
        shadow-camera-far={16}
        shadow-bias={-0.00015}
        shadow-normalBias={0.02}
        shadow-radius={11}
      />
      <directionalLight
        color={G.fill}
        position={[-5, 3.8, 3]}
        intensity={G.fillInt}
      />
      {/* ————— bounce, and why there are no bounce lights here any more —————
          A rasterizer has no global illumination, and an interior that reads as real is mostly
          *second* bounce: sun hits an oak floor and the whole underside of the room turns warm.
          Three broad rectAreaLights used to stand in for that — floor, stone counter, island top.

          They were removed because the room no longer needs them and they were the most
          expensive thing in the frame. Since the environment became a Blender bake of THIS room,
          box-projected so reflections land in the right place, the floor bounce and the counter
          bounce are already IN the environment map: that HDR was rendered with this oak floor
          and this stone in it. The rect lights were adding a second copy of light the image
          already had.

          Measured rather than assumed, because the whole point of them was a local effect that a
          frame average would hide. Aggregate over Room, Base and Sink cameras, with and without:
          mean 137.63/85.63/161.69 -> 136.80/84.38/160.12, sd within 0.3, warmth within 1.8, dark
          pixels within 0.2 percentage points. Pixel diff of the toe-recess and underside crop —
          the exact thing they were added for — max channel difference 22 of 255 in isolated
          spots and a mean difference of 1.5. Side by side they are the same picture.

          The cost was not small: five rectAreaLights measured 18.7-19.6 fps against 30.2-30.6
          without them at dpr 1.75, interleaved A/B to control for thermal drift. Rect-area lights
          integrate an LTC per fragment, so in a fill-bound scene they are pure per-pixel tax.
          That budget is better spent on resolution, which is what actually reads as quality. */}
      <Suspense
        fallback={
          <Environment resolution={256} frames={1}>
            <Lightformer intensity={2.6} position={[0, 5, 6]} rotation-x={-0.6} scale={[9, 4, 1]} />
            <Lightformer intensity={1.4} position={[-7, 3, 1]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
            <Lightformer intensity={1.1} position={[7, 3, -1]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
            <Lightformer intensity={2} position={[0, 8, 0]} rotation-x={-Math.PI / 2} scale={[11, 11, 1]} />
          </Environment>
        }
      >
        {/* Two bakes of the same room, and the evening one is not a dimmed copy of the day.
            One daylight HDR used to light every time of day with only its intensity scaled, which
            is why the evening room's SHADOWS measured warm — +18.8 red-minus-blue against +53.2
            in the lights. Warm light filling warm shadow is a monochrome, and it is the difference
            between a room that is lit and a room that is staged. Colouring the ambient and
            quintupling a cool hemisphere each moved that by under three points, because neither is
            what lights those shadows; this map is. After sundown the openings bake as a dim cool
            sky and the practicals carry the room, so the warm comes from the lamps and the cool
            comes from the glass. */}
        <Environment resolution={256} frames={1} environmentIntensity={quality.environmentIntensity * G.env}>
          <Lightformer intensity={2.6} position={[0, 5, 6]} rotation-x={-0.6} scale={[9, 4, 1]} />
          <Lightformer intensity={1.4} position={[-7, 3, 1]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
          <Lightformer intensity={1.1} position={[7, 3, -1]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
          <Lightformer intensity={2} position={[0, 8, 0]} rotation-x={-Math.PI / 2} scale={[11, 11, 1]} />
        </Environment>
      </Suspense>

      {sel.layout !== 'galley' ? <Island sel={sel} mats={mats} lightingMode={lightingMode} counterEdge={counterEdge} glowTemp={glowTemp} islandTone={islandTone} /> : null}
      <WallRun sel={sel} mats={mats} lightingMode={lightingMode} glowTemp={glowTemp} xOff={sel.layout === 'fullshop' ? 0.7 : 0} tShift={sel.layout === 'galley' ? -7.0 : 0} />
      {sel.layout === 'fullshop' ? <Built at={12.3} dur={0.65} from={[-0.9, 0.4, 1.0]}><TallPantry sel={sel} mats={mats} runOffset={0.7} /></Built> : null}
      {sel.layout === 'fullshop' ? <Built at={12.6} dur={0.65} from={[0.9, 0.4, 1.0]}><TallUtility sel={sel} mats={mats} runOffset={0.7} /></Built> : null}

      <RoomEnvelope mats={mats} lightingMode={lightingMode} ceiling={ceilingOf(sel)} />
      <SetDressing sel={sel} mats={mats} seating={seating} />
      <DustMotes mode={lightingMode} />
      {quality.shadows ? (
        <ContactShadows
          // frames={1} bakes the contact shadow once. Without a key tied to what stands on the
          // floor, switching to the galley left the island's shadow printed on bare boards.
          // Same one-shot-bake trap as the directional shadow map in wave 41: this captured the
          // room before the kit had loaded, so the stools — which arrive with it — cast nothing
          // and stood on the boards with no contact at all. Remount once the kit is in.
          key={`${sel.layout}-${seating ? 'stools' : 'bare'}-${quality.tier}-${kitLoaded ? 'kit' : 'bare'}`}
          position={[0.25, 0.006, -0.35]}
          // Nothing in the room was grounded. The stool legs met the boards with no darkening at
          // all, which is the tell that says an object was pasted onto a photograph rather than
          // standing in it — the eye reads contact occlusion before it reads anything else. At
          // 0.24 over a 12 m span with 2.6 of blur the shadow was spread so thin it may as well
          // not have been rendered. Tighter to the room, darker, and sharper at the point of
          // contact, which is where a real shadow is darkest and hardest.
          opacity={0.55}
          blur={1.6}
          scale={9}
          far={2.2}
          resolution={quality.tier === 'high' ? 2048 : 1024}
          frames={1}
        />
      ) : null}

      <OrbitControls
        ref={controls as React.Ref<never>}
        enablePan={false}
        minDistance={1.2}
        maxDistance={6.6}
        maxPolarAngle={Math.PI / 2.04}
        minAzimuthAngle={-0.82}
        maxAzimuthAngle={0.82}
        target={CAMERAS.overview!.target}
        autoRotate={idleDrift}
        autoRotateSpeed={0.22}
      />
      <CameraRig view={view} controls={controls} xOff={sel.layout === 'fullshop' ? 0.7 : 0} />
      {/* The grade is part of the room, not a bonus. This used to drop the whole composer the
          moment the frame monitor complained — AO, bloom and vignette together — so a marginal
          device watched the kitchen jump flat and bright, and `onIncline` could put it back a
          second later. Only the ambient occlusion is expensive here (it re-renders the scene for
          depth and normals); bloom and vignette are a couple of full-screen passes and this
          scene is nowhere near fill-bound — 16x the pixels costs 1.7 ms. So AO is the only thing
          that ever goes, it goes once, and the look never changes again. */}
      {/* No postprocessing on a software rasteriser, and this is measured rather than cautious.
          SwiftShader renders this composer wrong in two separate ways. Multisampling resolves
          incorrectly: a near-black island came back BRIGHTER than a matched one (140.5 against
          135.3) and the frame lost structure, where the same build on an Apple M5 gives the
          correct direction. Worse, the two wood looks came out as a flat near-white field at mean
          245.72 / sd 10.8 — permanently, for three minutes, with the room still issuing fourteen
          thousand draw calls a second, no shader link failures, no lost context and no error of
          any kind. Removing the composer alone renders both of them properly: Natural Oak at mean
          116.19 / sd 44.8 and Dark Stained at 105.67 / sd 49.8.
          A CPU rasteriser is also the last place that can afford ambient occlusion and a bloom
          pyramid. It gets the room, correctly, without the grade. */}
      {software
        ? null
        : <Grade lightingMode={lightingMode} tier={quality.tier} degrade={degrade} />}
    </>
  );
}

export default function CabinetScene({
  sel, view, openAll, buildNonce = 0, lightingMode = 'lived-in', idleDrift = false, seating = true, wallTone = 'warm', stoneFinish = 'polished', counterEdge = 'eased', glowTemp = '3000', plumbing = 'match', islandTone = 'graphite', onKitReady, onContextLost,
}: {
  sel: Sel;
  view: string;
  openAll: boolean;
  buildNonce?: number;
  lightingMode?: LightMode;
  idleDrift?: boolean;
  seating?: boolean;
  wallTone?: WallTone;
  stoneFinish?: StoneFinish;
  counterEdge?: 'eased' | 'waterfall';
  glowTemp?: GlowTemp;
  plumbing?: 'match' | 'stainless';
  islandTone?: IslandTone;
  onKitReady?: () => void;
  onContextLost?: () => void;
}) {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const [degrade, setDegrade] = useState(0);
  const [software] = useState(() => isSoftwareRenderer());
  const [armed, setArmed] = useState(false);
  const lastStep = useRef(0);
  const kit = useKitLoader();
  const quality = useSceneQuality();
  // The frame monitor must not be allowed to watch the load-in. Streaming the milled kit,
  // compiling shaders and uploading textures stalls the frame rate for a couple of seconds on
  // ANY machine, and an unarmed monitor reads that stall as "this device cannot cope" and
  // latches the room to its worst settings for the rest of the session. Measured on an Apple
  // M5 — one of the fastest GPUs you can buy — the canvas ran at dpr 1.75 at 0.4s and 1.0 from
  // 3.5s onward, permanently, so every material in this scene was being shown through a
  // quarter-resolution buffer with antialiasing switched off. Arm once the kit is in and the
  // room has had a moment to settle; if the kit never arrives, arm on a long fallback so a
  // genuinely struggling device still gets help.
  // ...and it must not watch a rebuild either. Every selection the visitor makes rebuilds
  // materials and re-uploads maps, which stalls the frame for a moment by design. Measured: the
  // canvas held dpr 1.75 through load and collapsed to 1.0 on the very first look change,
  // because the monitor was awake for the stall the click itself caused. So disarm on every
  // change and re-arm once the room is standing still again. The monitor's job is to judge the
  // room at rest, not to judge the work the visitor just asked for.
  useEffect(() => {
    setArmed(false);
    const t = setTimeout(() => setArmed(true), kit ? 3500 : 15000);
    return () => clearTimeout(t);
  }, [kit, sel]);
  // One rung at a time, with a cooldown. `onDecline` can fire repeatedly while the average is
  // still recovering, and without the guard a single rough patch walks straight to the bottom
  // of the ladder — which is the cliff this replaced, wearing a different shape.
  const stepDown = useCallback(() => {
    const now = performance.now();
    if (now - lastStep.current < 6000) return;
    lastStep.current = now;
    setDegrade((d) => Math.min(3, d + 1));
  }, []);
  useEffect(() => {
    if (kit) onKitReady?.();
  }, [kit, onKitReady]);
  const buildTime = useMemo(() => {
    const reduced =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return { start: buildNonce > 0 && !reduced ? performance.now() : -1 };
  }, [buildNonce]);
  const api = useMemo<OpeningsApi>(
    () => ({
      openAll,
      get: (id) => Boolean(openMap[id]),
      toggle: (id) => setOpenMap((m) => ({ ...m, [id]: !m[id] })),
    }),
    [openAll, openMap],
  );
  return (
    <Canvas
      shadows={quality.shadows}
      // A ladder with a rung in the middle, because 1.75 straight to 1 is a cliff — three times
      // fewer pixels in one step, and it is the step you can see. Wave 58 stopped the monitor
      // firing during load; it did not stop it firing at all, and it should not: at 31-37 fps this
      // scene genuinely cannot hold 1.75 against a 50 fps bound, so it steps down at about
      // fourteen seconds and lands on 1. Traced on an Apple M5. 1.4 keeps most of the crispness
      // for roughly half the fill cost, and only a device that still cannot cope after that gives
      // up the last of it.
      dpr={degrade >= 3 ? 1 : degrade === 2 ? [1, Math.min(1.4, quality.dpr[1])] : quality.dpr}
      camera={{ position: CAMERAS.overview!.pos, fov: 35 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.AgXToneMapping, preserveDrawingBuffer: true }}
      onCreated={({ gl }) => {
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        // The single most expensive thing in this room, and it was invisible until it was
        // measured. A material with `transmission` makes three re-render the ENTIRE scene into a
        // separate buffer every frame so the glass has something to refract — at full canvas
        // resolution by default. The glazed doors are a small part of the frame and sit behind
        // mullions, so half resolution there costs nothing anyone can see.
        // Measured on an Apple M5 at dpr 1.75, interleaved A/B across three pairs to control for
        // the thermal drift that had quietly invalidated an earlier sequential run: 11.8 fps
        // before, 19-21 fps after. Scale 0.25 was tried too and bought only another 5%, inside
        // the noise, so 0.5 is where the curve flattens.
        (gl as unknown as { transmissionResolutionScale: number }).transmissionResolutionScale = 0.5;
        // A tab under memory pressure can lose the GPU context mid-orbit. Without this the
        // canvas simply freezes; preventDefault keeps a restore possible, and the callback
        // hands the visitor back the poster and its Retry.
        gl.domElement.addEventListener('webglcontextlost', (event) => {
          event.preventDefault();
          onContextLost?.();
        });
      }}
    >
      <color attach="background" args={[lightingMode === 'neutral' ? '#ebe9e2' : '#e8e1d6']} />
      <fog attach="fog" args={[lightingMode === 'neutral' ? '#ebe9e2' : '#e8e1d6', 8.5, 18]} />
      {/* context providers must sit inside the Canvas — R3F does not bridge external contexts */}
      {/* One way only. Restoring on incline is how a scene ends up oscillating between two looks
          — decline, restore, decline — which reads as the room flickering rather than as an
          adaptive renderer doing its job. Once we have decided this device cannot afford the
          ambient occlusion, we stop asking. */}
      {armed ? (
        <PerformanceMonitor
          onDecline={stepDown}
          flipflops={3}
          onFallback={stepDown}
        />
      ) : null}
      <KitCtx.Provider value={kit}>
        <BuildTimeCtx.Provider value={buildTime}>
          <OpeningsCtx.Provider value={api}>
            <SceneInner sel={sel} view={view} quality={quality} lightingMode={lightingMode} idleDrift={idleDrift} degrade={degrade} software={software} seating={seating} wallTone={wallTone} stoneFinish={stoneFinish} counterEdge={counterEdge} glowTemp={glowTemp} plumbing={plumbing} islandTone={islandTone} />
          </OpeningsCtx.Provider>
        </BuildTimeCtx.Provider>
      </KitCtx.Provider>
    </Canvas>
  );
}
