// The full customer-facing option catalog — every field from the real MasterFile census,
// plus the availability rules that make impossible combinations honest (disabled, never hidden).
// Pricing is deliberately absent from this surface.

import { LAYOUTS, type LayoutId } from '@desk/spec';
import { HARDWARE_FINISHES, PAINT_CHIPS, STAIN_MULT, type SurfaceSpec } from './textures';

export type DoorKey =
  | '2.25" Cope & Stick'
  | '3" Cope & Stick'
  | 'Mitered 2.25"'
  | 'Mitered 2.75"+'
  | 'Applied Molding on Cope & Stick'
  | 'Applied Molding on Slab'
  | 'Hardwood Slab'
  | 'Paint-Grade MDF Slab'
  | 'Prefinished Gloss or Matte'
  | 'Prefinished Texture Laminate'
  | 'Prefinished Solid Color Melamine'
  | 'Prefinished Real Wood Veneer';

export const DOOR_GROUPS: { family: string; doors: DoorKey[] }[] = [
  { family: 'Cope & Stick', doors: ['2.25" Cope & Stick', '3" Cope & Stick'] },
  { family: 'Mitered', doors: ['Mitered 2.25"', 'Mitered 2.75"+'] },
  { family: 'Applied Molding', doors: ['Applied Molding on Cope & Stick', 'Applied Molding on Slab'] },
  { family: 'Slab', doors: ['Hardwood Slab', 'Paint-Grade MDF Slab'] },
  {
    family: 'Prefinished',
    doors: [
      'Prefinished Gloss or Matte',
      'Prefinished Texture Laminate',
      'Prefinished Solid Color Melamine',
      'Prefinished Real Wood Veneer',
    ],
  },
];

export const FINISHES_UI = [
  'Painted', 'Painted w/ Glaze', 'Stained', 'Stained w/ Glaze',
  'Natural Finish', 'Natural w/ Glaze', 'Natural w/ Toner', 'Bleach',
] as const;

export const SHEENS_UI = ['Matte', 'Satin', 'Semi Gloss', 'High Gloss'] as const;
export const SPECIES_UI = [
  'Paint Grade', 'Maple', 'Clear Alder', 'Knotty Alder',
  'Rift White Oak', 'Plain Sawn Oak', 'Quarter Sawn Oak', 'Walnut',
] as const;
export const STAIN_TONES_UI = ['Natural', 'Light', 'Medium', 'Medium Dark', 'Dark', 'Solid Color'] as const;
export const SPECIAL_UI = ['None', 'Cerused', 'Glaze', 'Distressed'] as const;
export const ENDS_UI = ['Flat Ends', 'Paneled Ends', 'Mix'] as const;
export const TOP_TRIM_UI = ['None', 'Flat Crown', 'Flat Crown w/ Bevel', 'Standard Crown', 'Cove Crown', 'RVB Simple Side', 'RVB Block Side'] as const;
export const TOE_KICK_UI = ['Standard', 'No Toe Kick', 'Extended Stiles', 'Furniture Feet', 'Cabinet Base', 'Notched Cabinet Base'] as const;
export const BOTTOM_TRIM_UI = ['Flat', 'Spanish', 'Flat Bevel'] as const;
export const LIGHT_RAIL_UI = ['Standard 1 1/2" Concealed', '1 1/2" Exposed', 'Custom Light Rail'] as const;
export const DRAWER_BOX_UI = ['1/2" Baltic Birch Ply', '5/8" Hardwood'] as const;
export const HARDWARE_UI = [
  'Shop Bar', 'Slim Bar', 'Cup & Knob', 'Square Ring', 'Edge Pull', 'Classic Knob', 'Arch Pull',
] as const;
export const UPPER_INSERT_UI = ['Solid Panel', 'Mullion Glass', 'Metal Mesh'] as const;
export const ISLAND_END_UI = ['Door-Matched Panel', 'X-Braced Panel', 'Slab Panel'] as const;
export const TOE_LIGHTING_UI = ['None', 'Warm LED'] as const;
export const YESNO_UI = ['Yes as noted on drawings', 'None'] as const;
export const SINK_HEIGHT_UI = ['Flush with top of cabinet', '3/4" above top of cabinet', 'Custom Height Listed in Notes'] as const;
export const UPPER_ACTION_UI = ['Swing', 'Lift-up'] as const;
export const FINISH_METHOD_UI = ['Stain', 'Paint', 'Pre Finished'] as const;
export const DOORS_ORDER_UI = ['Order Doors', 'CNC Doors'] as const;

export type Sel = {
  layout: LayoutId;
  cabinetStyle: string;
  door: DoorKey;
  species: string;
  finish: string;
  paintChip: string;
  stainTone: string;
  sheen: string;
  special: string;
  endsPanels: string;
  topTrim: string;
  toeKick: string;
  bottomTrim: string;
  lightRail: string;
  drawerBox: string;
  hardware: string;
  hardwareFinish: string;
  upperInsert: string;
  islandEnd: string;
  toeLighting: string;
  plugMold: string;
  ledTrack: string;
  // openings + interior
  upperAction: string;
  rollouts: string;
  cutleryInsert: string;
  trashPullout: string;
  // MasterFile extras (visual)
  woodTops: string;
  apronSink: string;
  sinkHeight: string;
  appliancePanels: string;
  stonePanels: string;
  // job details (spec-only; the rest of the census)
  panelName: string;
  finishName: string;
  edgebanding: string;
  crownHeight: string;
  ceilingHeight: string;
  counterThickness: string;
  installBeforeFlooring: string;
  flooringThickness: string;
  drywallThickness: string;
  casingThickness: string;
  deliveryDate: string;
  doorsOrderVsCnc: string;
  finishMethod: string;
};

export const DEFAULT_SEL: Sel = {
  layout: 'fullshop',
  cabinetStyle: 'Inset Face Frame',
  door: '2.25" Cope & Stick',
  species: 'Paint Grade',
  finish: 'Painted',
  paintChip: 'Putty',
  stainTone: 'Medium',
  sheen: 'Satin',
  special: 'None',
  endsPanels: 'Paneled Ends',
  topTrim: 'Standard Crown',
  toeKick: 'Standard',
  bottomTrim: 'Flat',
  lightRail: 'Standard 1 1/2" Concealed',
  drawerBox: '1/2" Baltic Birch Ply',
  hardware: 'Slim Bar',
  hardwareFinish: 'Brushed Brass',
  // Solid, matched, simple. The Master File sells doors, species, finishes and trim — it has
  // no glass-insert or X-brace vocabulary anywhere in its 26 lists. Glass and braces remain
  // choosable; the room the visitor lands in shows the product line, not set decoration.
  upperInsert: 'Solid Panel',
  islandEnd: 'Door-Matched Panel',
  toeLighting: 'Warm LED',
  plugMold: 'None',
  ledTrack: 'None',
  upperAction: 'Swing',
  rollouts: 'None',
  cutleryInsert: 'Yes as noted on drawings',
  trashPullout: 'None',
  woodTops: 'None',
  apronSink: 'None',
  sinkHeight: 'Flush with top of cabinet',
  // Panelled, not stainless. The studio sells cabinets, and the fridge is the largest single
  // face in the room — as bare stainless it is the biggest object in the frame that is not
  // the product. Panelled it becomes a 0.92 x 1.82 m cabinet door. Stainless is still one
  // click away under Appliance fronts.
  appliancePanels: 'Yes as noted on drawings',
  stonePanels: 'None',
  panelName: '',
  finishName: '',
  edgebanding: '',
  crownHeight: '',
  ceilingHeight: '11 ft',
  counterThickness: '3cm',
  installBeforeFlooring: 'None',
  flooringThickness: '',
  drywallThickness: '',
  casingThickness: '',
  deliveryDate: '',
  doorsOrderVsCnc: 'Order Doors',
  finishMethod: 'Paint',
};

/**
 * The MasterFile carries a ceiling height and the drawing sets work at generous volumes; these
 * are the four the shop actually builds to, and the room answers to the selected one.
 */
export const CEILING_HEIGHT_UI = ['9 ft', '10 ft', '11 ft', '12 ft'] as const;

const ENUM_FIELDS: Partial<Record<keyof Sel, readonly string[]>> = {
  layout: Object.keys(LAYOUTS),
  cabinetStyle: ['Full Overlay Frameless', 'Inset Face Frame'],
  door: DOOR_GROUPS.flatMap((group) => group.doors),
  species: SPECIES_UI,
  finish: FINISHES_UI,
  paintChip: Object.keys(PAINT_CHIPS),
  stainTone: STAIN_TONES_UI,
  sheen: SHEENS_UI,
  special: SPECIAL_UI,
  endsPanels: ENDS_UI,
  topTrim: TOP_TRIM_UI,
  toeKick: TOE_KICK_UI,
  bottomTrim: BOTTOM_TRIM_UI,
  lightRail: LIGHT_RAIL_UI,
  drawerBox: DRAWER_BOX_UI,
  hardware: HARDWARE_UI,
  hardwareFinish: Object.keys(HARDWARE_FINISHES),
  upperInsert: UPPER_INSERT_UI,
  islandEnd: ISLAND_END_UI,
  toeLighting: TOE_LIGHTING_UI,
  plugMold: YESNO_UI,
  ledTrack: YESNO_UI,
  upperAction: UPPER_ACTION_UI,
  rollouts: YESNO_UI,
  cutleryInsert: YESNO_UI,
  trashPullout: YESNO_UI,
  woodTops: YESNO_UI,
  apronSink: YESNO_UI,
  sinkHeight: SINK_HEIGHT_UI,
  appliancePanels: YESNO_UI,
  stonePanels: YESNO_UI,
  installBeforeFlooring: YESNO_UI,
  ceilingHeight: CEILING_HEIGHT_UI,
  doorsOrderVsCnc: DOORS_ORDER_UI,
  finishMethod: FINISH_METHOD_UI,
};

export type VisualPreset = {
  id: 'heritage' | 'natural' | 'tailored' | 'darkwood';
  name: string;
  description: string;
  selection: Partial<Sel>;
};

/**
 * Coherent visual starting points distilled from the commissioned project-photo review.
 * Names remain neutral and no room-specific dimensions, identities, or project facts ship.
 */
export const VISUAL_PRESETS: readonly VisualPreset[] = [
  {
    id: 'tailored',
    name: 'House Gray + Midnight',
    description: 'A quiet starting point: soft gray inset Shaker, brass bars, a dark X-braced island, and warm toe light.',
    selection: {
      cabinetStyle: 'Inset Face Frame',
      door: '2.25" Cope & Stick',
      species: 'Paint Grade',
      finish: 'Painted',
      paintChip: 'Putty',
      sheen: 'Satin',
      endsPanels: 'Paneled Ends',
      topTrim: 'Standard Crown',
      toeKick: 'Standard',
      hardware: 'Slim Bar',
      hardwareFinish: 'Brushed Brass',
      upperInsert: 'Solid Panel',
      islandEnd: 'Door-Matched Panel',
      toeLighting: 'Warm LED',
      finishMethod: 'Paint',
    },
  },
  {
    id: 'heritage',
    name: 'Heritage Black + Brass',
    description: 'Deep framed fronts, layered crown, warm brass cups and knobs, and mesh uppers.',
    selection: {
      cabinetStyle: 'Inset Face Frame',
      door: 'Applied Molding on Cope & Stick',
      species: 'Paint Grade',
      finish: 'Painted',
      paintChip: 'Soot',
      sheen: 'Satin',
      endsPanels: 'Paneled Ends',
      topTrim: 'Standard Crown',
      toeKick: 'Standard',
      hardware: 'Cup & Knob',
      hardwareFinish: 'Brushed Brass',
      upperInsert: 'Solid Panel',
      islandEnd: 'Door-Matched Panel',
      toeLighting: 'None',
      finishMethod: 'Paint',
    },
  },
  {
    id: 'natural',
    name: 'Natural Oak + Black',
    description: 'Quiet straight grain, slim black bars, mullion glass, and furniture-like ends.',
    selection: {
      cabinetStyle: 'Full Overlay Frameless',
      door: '2.25" Cope & Stick',
      species: 'Rift White Oak',
      finish: 'Natural Finish',
      paintChip: 'Shop White',
      stainTone: 'Natural',
      sheen: 'Satin',
      endsPanels: 'Paneled Ends',
      topTrim: 'Flat Crown',
      toeKick: 'Standard',
      hardware: 'Slim Bar',
      hardwareFinish: 'Matte Black',
      upperInsert: 'Solid Panel',
      islandEnd: 'Door-Matched Panel',
      toeLighting: 'None',
      finishMethod: 'Stain',
    },
  },

  {
    id: 'darkwood',
    name: 'Dark Stained Furniture',
    description: 'Deep visible grain, wide mitered frames, a proud base, and tailored ring pulls.',
    selection: {
      cabinetStyle: 'Inset Face Frame',
      door: 'Mitered 2.75"+',
      species: 'Plain Sawn Oak',
      finish: 'Stained',
      stainTone: 'Dark',
      sheen: 'Satin',
      endsPanels: 'Paneled Ends',
      topTrim: 'Standard Crown',
      toeKick: 'Cabinet Base',
      hardware: 'Square Ring',
      hardwareFinish: 'Polished Nickel',
      upperInsert: 'Solid Panel',
      islandEnd: 'Door-Matched Panel',
      toeLighting: 'None',
      finishMethod: 'Stain',
    },
  },
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Runtime boundary for URL hashes and localStorage. Unknown fields and stale enum values fall
 * back to the catalog defaults; free-text MasterFile notes remain strings only.
 */
export function sanitizeSelection(value: unknown): Sel {
  const next = { ...DEFAULT_SEL };
  if (!isRecord(value)) return next;

  for (const field of Object.keys(DEFAULT_SEL) as (keyof Sel)[]) {
    const candidate = value[field];
    if (typeof candidate !== 'string') continue;
    const allowed = ENUM_FIELDS[field];
    if (!allowed || allowed.includes(candidate)) next[field] = candidate as never;
  }

  return next;
}

export const isPrefinished = (door: DoorKey): boolean => door.startsWith('Prefinished');
export const isMdfSlab = (door: DoorKey): boolean => door === 'Paint-Grade MDF Slab';
export const supportsUpperInsert = (door: DoorKey): boolean => !isPrefinished(door) && !door.includes('Slab');

/** Availability rules — unavailable options are disabled, never hidden. */
export function ruleFor(sel: Sel, section: string, option: string): string | null {
  const pre = isPrefinished(sel.door);
  if (section === 'species') {
    if (pre && sel.door !== 'Prefinished Real Wood Veneer')
      return 'Species applies to real-wood doors — this prefinished door carries its own face.';
    if (isMdfSlab(sel.door) && option !== 'Paint Grade')
      return 'MDF slab doors are paint grade by definition.';
  }
  if (section === 'finish') {
    if (pre) return 'Prefinished doors arrive finished — the shop does not spray them.';
    if (isMdfSlab(sel.door) && !option.startsWith('Painted'))
      return 'MDF slab takes paint, not stain or clear coats.';
    if (sel.species === 'Paint Grade' && !option.startsWith('Painted') && option !== 'Bleach')
      return 'Paint-grade material is chosen to be painted.';
  }
  if (section === 'sheen' && pre) return 'Sheen is set by the prefinished face.';
  if (section === 'special' && pre && option !== 'None')
    return 'Hand treatments apply to shop-finished doors only.';
  if (section === 'upperInsert' && !supportsUpperInsert(sel.door) && option !== 'Solid Panel')
    return 'Glass and mesh inserts require a framed, shop-finished door.';
  if (section === 'sinkHeight' && sel.apronSink === 'None')
    return 'Sink height applies when there is an apron sink.';
  return null;
}

/** The door-front surface for the current selection (drives materials + swatches). */
export function surfaceOf(sel: Sel): SurfaceSpec {
  const pre = isPrefinished(sel.door);
  if (pre) {
    if (sel.door === 'Prefinished Real Wood Veneer') {
      return { kind: 'wood', species: sel.species, paintChip: sel.paintChip, stainMult: 1, bleach: false, toner: false, glaze: false, special: 'None' };
    }
    if (sel.door === 'Prefinished Texture Laminate') {
      return { kind: 'wood', species: 'Rift White Oak', paintChip: sel.paintChip, stainMult: 0.85, bleach: false, toner: false, glaze: false, special: 'None' };
    }
    return { kind: 'solid', species: sel.species, paintChip: sel.paintChip, stainMult: 1, bleach: false, toner: false, glaze: false, special: 'None' };
  }
  const painted = sel.finish.startsWith('Painted');
  if (painted || isMdfSlab(sel.door)) {
    return {
      kind: 'paint',
      species: sel.species,
      paintChip: sel.paintChip,
      stainMult: 1,
      bleach: false,
      toner: false,
      glaze: sel.finish.includes('Glaze') || sel.special === 'Glaze',
      special: (sel.special as SurfaceSpec['special']) ?? 'None',
    };
  }
  const stained = sel.finish.startsWith('Stained');
  return {
    kind: 'wood',
    species: sel.species,
    paintChip: sel.paintChip,
    stainMult: stained ? (STAIN_MULT[sel.stainTone] ?? 0.74) : 1,
    bleach: sel.finish === 'Bleach',
    toner: sel.finish === 'Natural w/ Toner',
    glaze: sel.finish.includes('Glaze') || sel.special === 'Glaze',
    special: (sel.special as SurfaceSpec['special']) ?? 'None',
  };
}

export { PAINT_CHIPS, LAYOUTS };
export type { LayoutId };
