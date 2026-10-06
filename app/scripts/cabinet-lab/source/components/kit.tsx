'use client';

// Blender part-kit loader. Loads /kit/kit.glb once, exposes geometries by part name.
// Deliberately imperative (no suspense): the scene renders its procedural parts until
// the kit arrives, and keeps them forever if the kit fails — never a blank viewer.

import { createContext, useContext, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export type KitGeos = Record<string, THREE.BufferGeometry>;

let cache: KitGeos | null | undefined; // undefined = not loaded yet, null = failed
let pending: Promise<KitGeos | null> | null = null;

function loadKit(): Promise<KitGeos | null> {
  if (pending) return pending;
  pending = new Promise((resolve) => {
    new GLTFLoader().load(
      './assets/kit.glb',
      (gltf) => {
        const geos: KitGeos = {};
        gltf.scene.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (mesh.isMesh && mesh.geometry) {
            // the kit ships without normals (pure weight); edge-split vertex
            // duplication means recomputing here restores every sharp edge
            if (!mesh.geometry.getAttribute('normal')) mesh.geometry.computeVertexNormals();
            // node name wins; mesh datablock names can differ after joins
            geos[obj.name || mesh.name] = mesh.geometry;
          }
        });
        cache = geos;
        resolve(geos);
      },
      undefined,
      (err) => {
        console.error('kit.glb failed to load — procedural parts stay in service', err);
        cache = null;
        resolve(null);
      },
    );
  });
  return pending;
}

export function useKitLoader(): KitGeos | null {
  const [geos, setGeos] = useState<KitGeos | null>(cache ?? null);
  useEffect(() => {
    if (cache !== undefined) {
      setGeos(cache);
      return;
    }
    let live = true;
    void loadKit().then((g) => {
      if (live) setGeos(g);
    });
    return () => {
      live = false;
    };
  }, []);
  return geos;
}

/** Imperative full-scene loader for scanned CC0 props (own PBR materials). */
const modelCache = new Map<string, THREE.Group | null>();
const modelPending = new Map<string, Promise<THREE.Group | null>>();
export function useExtraModel(url: string): THREE.Group | null {
  const [scene, setScene] = useState<THREE.Group | null>(modelCache.get(url) ?? null);
  useEffect(() => {
    if (modelCache.has(url)) {
      setScene(modelCache.get(url)!);
      return;
    }
    let live = true;
    let promise = modelPending.get(url);
    if (!promise) {
      promise = new Promise((resolve) => {
        new GLTFLoader().load(
          url,
          (gltf) => {
            gltf.scene.traverse((obj) => {
              const mesh = obj as THREE.Mesh;
              if (mesh.isMesh) {
                mesh.castShadow = true;
                mesh.receiveShadow = true;
              }
            });
            modelCache.set(url, gltf.scene);
            resolve(gltf.scene);
          },
          undefined,
          (err) => {
            console.error(`${url} failed to load — the scene stays procedural`, err);
            modelCache.set(url, null);
            resolve(null);
          },
        );
      });
      modelPending.set(url, promise);
    }
    void promise.then((s) => {
      if (live) setScene(s);
    });
    return () => {
      live = false;
    };
  }, [url]);
  return scene;
}

export const KitCtx = createContext<KitGeos | null>(null);
export const useKit = (): KitGeos | null => useContext(KitCtx);

/** Map a Panel Construction selection to its kit rail part, if any. */
export function railPartFor(door: string): string | null {
  switch (door) {
    case '2.25" Cope & Stick':
    case 'Applied Molding on Cope & Stick':
      return 'rail_cope_225';
    case '3" Cope & Stick':
      return 'rail_cope_300';
    case 'Mitered 2.25"':
      return 'rail_mitered_225';
    case 'Mitered 2.75"+':
      return 'rail_mitered_275';
    default:
      return null;
  }
}

export const CROWN_PARTS: Record<string, string> = {
  'Flat Crown': 'crown_flat',
  'Flat Crown w/ Bevel': 'crown_flat_bevel',
  'Standard Crown': 'crown_standard',
  'Cove Crown': 'crown_cove',
  'RVB Simple Side': 'crown_rvb_simple',
  'RVB Block Side': 'crown_rvb_block',
};

export const PULL_PARTS: Record<string, string> = {
  'Shop Bar': 'pull_bar',
  'Slim Bar': 'pull_slim_bar',
  'Cup & Knob': 'pull_cup',
  'Square Ring': 'pull_square_ring',
  'Edge Pull': 'pull_edge',
  'Classic Knob': 'pull_knob',
  'Arch Pull': 'pull_arch',
};
