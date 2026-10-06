'use client';

import { useEffect, useState } from 'react';

export type SceneQualityTier = 'low' | 'compact' | 'balanced' | 'high';

export type SceneQuality = {
  tier: SceneQualityTier;
  dpr: [number, number];
  shadows: boolean;
  shadowMapSize: number;
  postProcessing: boolean;
  multisampling: number;
  environmentIntensity: number;
};

export type SceneCapabilities = {
  width: number;
  reducedMotion: boolean;
  coarsePointer: boolean;
  hardwareConcurrency?: number;
  deviceMemory?: number;
};

const QUALITY: Record<SceneQualityTier, SceneQuality> = {
  low: {
    tier: 'low', dpr: [1, 1], shadows: false, shadowMapSize: 1024,
    postProcessing: false, multisampling: 0, environmentIntensity: 0.4,
  },
  // A phone is small and DENSE, which is not the same thing as weak, and the old table treated
  // them as one. Any width under 680 fell to `low`, which pins dpr to 1 — so a handset with a
  // devicePixelRatio of 3 rendered the room at a ninth of the pixels it owns and upscaled the
  // result, on the highest-density screen most people will ever look at this on. That is the same
  // fault wave 58 found on the desktop, sitting in the tier table rather than in a latch.
  //
  // The arithmetic says it is safe: the stage on an iPhone 13 is 370x231 CSS pixels, so 2x is
  // about 342,000 pixels against the 2,500,000 the desktop tier drives at 31-37 fps on this
  // machine — roughly a seventh of the work. Everything else stays where `low` had it, because
  // shadows and a postprocessing chain genuinely are worth dropping on a handset; resolution is
  // the one thing that reads as quality and it is also the cheapest here.
  compact: {
    tier: 'compact', dpr: [1, 2], shadows: false, shadowMapSize: 1024,
    postProcessing: false, multisampling: 0, environmentIntensity: 0.4,
  },
  balanced: {
    tier: 'balanced', dpr: [1, 1.35], shadows: true, shadowMapSize: 2048,
    postProcessing: false, multisampling: 0, environmentIntensity: 0.5,
  },
  high: {
    tier: 'high', dpr: [1, 1.75], shadows: true, shadowMapSize: 3072,
    postProcessing: true, multisampling: 2, environmentIntensity: 0.58,
  },
};

export function sceneQualityForCapabilities(capabilities: SceneCapabilities): SceneQuality {
  // Weak and small are separate questions. A device is weak because of its cores, its memory or
  // an explicit motion preference; it is small because of its viewport. Only the first is a
  // reason to give up pixels.
  const weak = capabilities.reducedMotion
    || (capabilities.hardwareConcurrency !== undefined && capabilities.hardwareConcurrency <= 4)
    || (capabilities.deviceMemory !== undefined && capabilities.deviceMemory <= 4);
  if (weak) return QUALITY.low;
  const small = capabilities.width < 680
    || (capabilities.coarsePointer && capabilities.width < 900);
  if (small) return QUALITY.compact;

  const highEnd = capabilities.width >= 1100
    && !capabilities.coarsePointer
    && (capabilities.hardwareConcurrency === undefined || capabilities.hardwareConcurrency >= 8)
    && (capabilities.deviceMemory === undefined || capabilities.deviceMemory >= 8);
  return highEnd ? QUALITY.high : QUALITY.balanced;
}

/**
 * True when the page is drawing through a software rasteriser rather than a GPU.
 *
 * This exists for one specific, measured reason: SwiftShader resolves a multisampled buffer
 * incorrectly for this scene. With `multisampling: 4` the certification frame came back both
 * brighter and flatter — a near-black island read as 140.5 mean against a matched island's 135.3,
 * i.e. the dark option appeared to LIGHTEN the room, and the frame lost structure (sd 52.7). The
 * same build with multisampling 0 gives 140.0 -> 128.4 at sd 57.8, and the same build on an Apple
 * M5 gives the correct direction with multisampling 4. The renderer is the variable.
 *
 * Antialiasing is not something to give up on real hardware — it is the difference between a
 * room of crisp face frames and a staircase — so the check is narrow: ask for it everywhere
 * except where it is known to be broken.
 *
 * The unmasked string is the one that matters. `RENDERER` alone reports "WebKit WebGL" under
 * automation, which tells you nothing.
 */
export function isSoftwareRenderer(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') || probe.getContext('webgl');
    if (!gl) return false;
    const debug = gl.getExtension('WEBGL_debug_renderer_info');
    const name = String(
      (debug && gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)) || gl.getParameter(gl.RENDERER) || '',
    );
    return /swiftshader|software|llvmpipe|basic render|microsoft basic/i.test(name);
  } catch {
    return false;
  }
}

function readCapabilities(): SceneCapabilities {
  const navigatorWithMemory = navigator as Navigator & { deviceMemory?: number };
  return {
    width: window.innerWidth,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    coarsePointer: window.matchMedia('(pointer: coarse)').matches,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigatorWithMemory.deviceMemory,
  };
}

/** Uses conservative settings first, then responds to capability and viewport changes. */
export function useSceneQuality(): SceneQuality {
  const [quality, setQuality] = useState<SceneQuality>(QUALITY.balanced);

  useEffect(() => {
    const update = () => setQuality(sceneQualityForCapabilities(readCapabilities()));
    update();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarsePointer = window.matchMedia('(pointer: coarse)');
    window.addEventListener('resize', update);
    reducedMotion.addEventListener('change', update);
    coarsePointer.addEventListener('change', update);
    return () => {
      window.removeEventListener('resize', update);
      reducedMotion.removeEventListener('change', update);
      coarsePointer.removeEventListener('change', update);
    };
  }, []);

  return quality;
}
