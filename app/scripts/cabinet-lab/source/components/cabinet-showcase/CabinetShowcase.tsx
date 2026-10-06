'use client';

import React, { lazy, Suspense } from 'react';
import { preload } from 'react-dom';
import {
  Component,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_SEL,
  VISUAL_PRESETS,
  ruleFor,
  isMdfSlab,
  surfaceOf,
  TOP_TRIM_UI,
  TOE_KICK_UI,
  BOTTOM_TRIM_UI,
  LIGHT_RAIL_UI,
  DRAWER_BOX_UI,
  ENDS_UI,
  ISLAND_END_UI,
  TOE_LIGHTING_UI,
  UPPER_ACTION_UI,
  YESNO_UI,
  PAINT_CHIPS,
  SPECIES_UI,
  SHEENS_UI,
  STAIN_TONES_UI,
  FINISHES_UI,
  SPECIAL_UI,
  HARDWARE_UI,
  SINK_HEIGHT_UI,
  DOOR_GROUPS,
  type DoorKey,
  type Sel,
} from '../../lib/options';
import { getSwatchDataUrl } from '../../lib/textures';
import { focusHolder, focusWhenUnclaimed } from '../../lib/focus-when-unclaimed';
import { canvasToPdfBlob } from '../../lib/sheet-pdf';
import {
  DEFAULT_STAGING,
  classifyStudioProposal,
  commitStudioProposal,
  commitStudioSnapshot,
  commitStudioStaging,
  createStudioHistory,
  createStudioSnapshot,
  fingerprintStudioSnapshot,
  redoStudioHistory,
  resetStudioHistory,
  undoStudioHistory,
  type StudioHistory,
  type StudioSnapshot,
  type StudioStaging,
} from '../../lib/living-studio-state';
import {
  createAcceptedRecoveredSnapshot,
  decodeStudioShare,
  encodeStudioShare,
  encodeStudioSnapshot,
  parseLocalStudioSnapshot,
} from '../../lib/living-studio-persistence';
import styles from './CabinetShowcase.module.css';

const CabinetScene = lazy(() => import('../CabinetScene'));

const LOCAL_STUDY_KEY = 'little-fight:labs:cabinet:study:v1';
const STUDIES_KEY = 'little-fight:labs:cabinet:studies:v1';

type View = 'overview' | 'detail' | 'uppers' | 'base' | 'hardware' | 'sink' | 'range';
type LightingMode = 'neutral' | 'lived-in' | 'dusk';
type SaveState = 'checking' | 'saved' | 'paused' | 'unavailable';

type SceneBoundaryProps = { children: ReactNode; onFailure: () => void };
type SceneBoundaryState = { failed: boolean };

type RecoveryNotice = {
  kind: 'recovery' | 'invalid';
  reason: string;
};

class SceneBoundary extends Component<SceneBoundaryProps, SceneBoundaryState> {
  state: SceneBoundaryState = { failed: false };

  static getDerivedStateFromError(): SceneBoundaryState {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFailure();
  }

  render() {
    return this.state.failed
      ? <ScenePoster status="The 3D view is unavailable here. Your choices are safe." />
      : this.props.children;
  }
}

function ScenePoster({ status }: { status: string }) {
  return (
    <div className={styles.poster} role="status" aria-live="polite">
      <img src="./assets/looks/natural.webp" alt="An example cabinet room visual study" width={1090} height={582} fetchPriority="high" />
      <div className={styles.posterCopy}>
        <span>Example kitchen — not your choices yet</span>
        <p>{status}</p>
      </div>
    </div>
  );
}

const doors: readonly {
  label: string;
  short: string;
  value: DoorKey;
  benefit: string;
  style: Sel['cabinetStyle'];
}[] = [
  {
    label: 'Quiet framed door',
    short: 'Framed',
    value: '2.25" Cope & Stick',
    benefit: 'A calm rail-and-stile profile that keeps the room familiar.',
    style: 'Inset Face Frame',
  },
  {
    label: 'Tailored mitered door',
    short: 'Mitered',
    value: 'Mitered 2.25"',
    benefit: 'Picture-frame corners give the door a more dressed character.',
    style: 'Inset Face Frame',
  },
  {
    label: 'Deep layered door',
    short: 'Layered',
    value: 'Applied Molding on Cope & Stick',
    benefit: 'A second profile adds furniture-like depth and shadow.',
    style: 'Inset Face Frame',
  },
  {
    label: 'Continuous slab door',
    short: 'Slab',
    value: 'Paint-Grade MDF Slab',
    benefit: 'One smooth painted plane lets proportion and hardware lead.',
    style: 'Full Overlay Frameless',
  },
] as const;

const palettes: readonly {
  id: string;
  label: string;
  benefit: string;
  patch: Partial<Sel>;
}[] = [
  {
    id: 'carbon',
    label: 'Carbon paint',
    benefit: 'A dark architectural field that makes brass and profiles read clearly.',
    patch: { species: 'Paint Grade', finish: 'Painted', paintChip: 'Soot', stainTone: 'Medium', sheen: 'Satin', special: 'None' },
  },
  {
    id: 'chalk',
    label: 'Chalk paint',
    benefit: 'A warm pale surface that lets shadow lines stay soft.',
    patch: { species: 'Paint Grade', finish: 'Painted', paintChip: 'Shop White', stainTone: 'Medium', sheen: 'Satin', special: 'None' },
  },
  {
    id: 'oak',
    label: 'Natural oak',
    benefit: 'Straight, quiet grain gives the room a lighter architectural rhythm.',
    patch: { species: 'Rift White Oak', finish: 'Natural Finish', stainTone: 'Natural', sheen: 'Satin', special: 'None' },
  },
  {
    id: 'walnut',
    label: 'Dark walnut',
    benefit: 'A deeper wood field gives the cabinetry a furniture-scale presence.',
    patch: { species: 'Walnut', finish: 'Stained', stainTone: 'Medium Dark', sheen: 'Satin', special: 'None' },
  },
  {
    id: 'cerused',
    label: 'Cerused oak',
    benefit: 'A pale grain treatment gives the surface more texture at close range.',
    patch: { species: 'Rift White Oak', finish: 'Natural Finish', stainTone: 'Light', sheen: 'Matte', special: 'Cerused' },
  },
] as const;

const hardwareOptions: readonly {
  label: string;
  short: string;
  benefit: string;
  patch: Partial<Sel>;
}[] = [
  {
    label: 'Slim black bar',
    short: 'Black bar',
    benefit: 'A long, narrow line with very little visual weight.',
    patch: { hardware: 'Slim Bar', hardwareFinish: 'Matte Black' },
  },
  {
    label: 'Brass cup & knob',
    short: 'Brass cup',
    benefit: 'A furniture-grade pairing with a warmer daily touch point.',
    patch: { hardware: 'Cup & Knob', hardwareFinish: 'Brushed Brass' },
  },
  {
    label: 'Nickel edge pull',
    short: 'Nickel edge',
    benefit: 'A fingertip grip that nearly disappears into the front.',
    patch: { hardware: 'Edge Pull', hardwareFinish: 'Satin Nickel' },
  },
] as const;

const insertOptions: readonly {
  label: string;
  short: string;
  value: Sel['upperInsert'];
  benefit: string;
}[] = [
  {
    label: 'Solid upper',
    short: 'Solid',
    value: 'Solid Panel',
    benefit: 'A continuous face keeps stored objects completely quiet.',
  },
  {
    label: 'Mullion glass upper',
    short: 'Glass',
    value: 'Mullion Glass',
    benefit: 'Four-light glass reveals depth, shelves, and selected objects.',
  },
  {
    label: 'Woven mesh upper',
    short: 'Mesh',
    value: 'Metal Mesh',
    benefit: 'Fine woven metal adds shadow while keeping storage discreet.',
  },
] as const;

// Layout effects must run before paint to correct a scroll position without a visible jump.
// The studio is prerendered, so fall back to useEffect on the server where layout effects are a
// no-op and React would warn.
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Three grades, all of them already built and only one of them previously reachable.
 *
 * `lightingMode` was a hardcoded 'lived-in' with complete `neutral` and `dusk` grades sitting
 * behind it — each with its own exposure, key, fill, sky, ridge palette, bounce colours and
 * practicals, and its own branches through the bloom, contrast, saturation and vignette. Midday
 * is cooler and brighter, the afternoon is the warm default, and the evening is the only view in
 * which the cabinet lighting does the job it was built for.
 */
const LIGHTING_TIMES: readonly { id: LightingMode; label: string; note: string }[] = [
  { id: 'neutral', label: 'Midday', note: 'Cool, even daylight through the windows.' },
  { id: 'lived-in', label: 'Afternoon', note: 'Warm low sun across the room.' },
  { id: 'dusk', label: 'Evening', note: 'The cabinet lighting, toe glow and lit transoms carry the room.' },
] as const;

// Four cameras, all pointed at cabinetry. Range and Sink were framing appliances and plumbing —
// "do we build sinks? do we build ranges?" — no. The camera ids survive as flight targets for
// choices that live near those fixtures (sink height, apron front); the visitor's row shows only
// what the shop sells.
const views: readonly { id: View; label: string }[] = [
  { id: 'overview', label: 'Room' },
  { id: 'detail', label: 'Door' },
  { id: 'uppers', label: 'Upper' },
  { id: 'base', label: 'Base' },
] as const;

const layouts: readonly {
  id: Sel['layout'];
  label: string;
  short: string;
  benefit: string;
  effect: string;
}[] = [
  { id: 'galley', label: 'Focused wall', short: 'Wall', benefit: 'A single cabinet run keeps the composition concise.', effect: 'The most compact visual scope.' },
  { id: 'island', label: 'Island room', short: 'Island', benefit: 'A central work surface gives the room a second furniture object.', effect: 'Balanced wall and island composition.' },
  { id: 'fullshop', label: 'Full room', short: 'Full', benefit: 'Wall, island, and tall storage read as one complete environment.', effect: 'The broadest visual scope in this study.' },
] as const;

type DeepRow = {
  field: keyof Sel;
  label: string;
  camera: View;
  values: readonly { value: string; short: string }[];
};

const DEEP_GROUPS: readonly { title: string; rows: readonly DeepRow[] }[] = [
  {
    title: 'Trim & structure',
    rows: [
      { field: 'topTrim', label: 'Crown', camera: 'uppers', values: TOP_TRIM_UI.map((v, i) => ({ value: v, short: ['None', 'Flat', 'Bevel', 'Standard', 'Cove', 'RVB', 'RVB block'][i]! })) },
      { field: 'toeKick', label: 'Toe', camera: 'base', values: TOE_KICK_UI.map((v, i) => ({ value: v, short: ['Standard', 'No toe', 'Stiles', 'Feet', 'Base', 'Notched'][i]! })) },
      { field: 'bottomTrim', label: 'Bottom trim', camera: 'uppers', values: BOTTOM_TRIM_UI.map((v, i) => ({ value: v, short: ['Flat', 'Spanish', 'Bevel'][i]! })) },
      { field: 'lightRail', label: 'Light rail', camera: 'uppers', values: LIGHT_RAIL_UI.map((v, i) => ({ value: v, short: ['Concealed', 'Exposed', 'Custom'][i]! })) },
      { field: 'endsPanels', label: 'Ends', camera: 'detail', values: ENDS_UI.map((v, i) => ({ value: v, short: ['Flat', 'Paneled', 'Mix'][i]! })) },
      { field: 'islandEnd', label: 'Island end', camera: 'overview', values: ISLAND_END_UI.map((v, i) => ({ value: v, short: ['Matched', 'X-brace', 'Slab'][i]! })) },
    ],
  },
  {
    title: 'Door construction — the full catalog',
    rows: [
      { field: 'door', label: 'Framed', camera: 'detail', values: [
        { value: '2.25\" Cope & Stick', short: 'C&S 2\u00bc\"' },
        { value: '3\" Cope & Stick', short: 'C&S 3\"' },
        { value: 'Mitered 2.25\"', short: 'Mitered 2\u00bc\"' },
        { value: 'Mitered 2.75\"+', short: 'Mitered 2\u00be\"' },
        { value: 'Applied Molding on Cope & Stick', short: 'AM on C&S' },
        { value: 'Applied Molding on Slab', short: 'AM on slab' },
      ] },
      { field: 'door', label: 'Slab & prefin.', camera: 'detail', values: [
        { value: 'Hardwood Slab', short: 'Wood slab' },
        { value: 'Paint-Grade MDF Slab', short: 'MDF slab' },
        { value: 'Prefinished Gloss or Matte', short: 'Gloss/matte' },
        { value: 'Prefinished Texture Laminate', short: 'Laminate' },
        { value: 'Prefinished Solid Color Melamine', short: 'Melamine' },
        { value: 'Prefinished Real Wood Veneer', short: 'Veneer' },
      ] },
    ],
  },
  {
    title: 'Finish system',
    rows: [
      { field: 'finish', label: 'Finish type', camera: 'detail', values: FINISHES_UI.map((v, i) => ({ value: v, short: ['Painted', 'Paint+glaze', 'Stained', 'Stain+glaze', 'Natural', 'Nat.+glaze', 'Toner', 'Bleach'][i]! })) },
      { field: 'special', label: 'Feature', camera: 'detail', values: SPECIAL_UI.map((v) => ({ value: v, short: v })) },
    ],
  },
  {
    title: 'Hardware — the full wall',
    rows: [
      { field: 'hardware', label: 'Pull style', camera: 'hardware', values: HARDWARE_UI.map((v, i) => ({ value: v, short: ['Shop bar', 'Slim bar', 'Cup+knob', 'Sq. ring', 'Edge', 'Knob', 'Arch'][i]! })) },
      { field: 'hardwareFinish', label: 'Pull finish', camera: 'hardware', values: [
        { value: 'Matte Black', short: 'Black' },
        { value: 'Brushed Brass', short: 'Brass' },
        { value: 'Polished Nickel', short: 'Nickel' },
      ] },
    ],
  },
  {
    title: 'Fittings & storage',
    rows: [
      { field: 'rollouts', label: 'Rollouts', camera: 'base', values: YESNO_UI.map((v, i) => ({ value: v, short: ['Rollout trays', 'None'][i]! })) },
      { field: 'cutleryInsert', label: 'Cutlery', camera: 'base', values: YESNO_UI.map((v, i) => ({ value: v, short: ['Insert', 'None'][i]! })) },
      { field: 'trashPullout', label: 'Trash', camera: 'base', values: YESNO_UI.map((v, i) => ({ value: v, short: ['Pullout', 'None'][i]! })) },
      { field: 'plugMold', label: 'Plug mold', camera: 'uppers', values: YESNO_UI.map((v, i) => ({ value: v, short: ['Routed', 'None'][i]! })) },
      { field: 'ledTrack', label: 'LED track', camera: 'uppers', values: YESNO_UI.map((v, i) => ({ value: v, short: ['Routed LED', 'None'][i]! })) },
      { field: 'sinkHeight', label: 'Sink height', camera: 'sink', values: SINK_HEIGHT_UI.map((v, i) => ({ value: v, short: ['Flush', '+\u00be\" proud', 'Custom'][i]! })) },
      { field: 'drawerBox', label: 'Drawer box', camera: 'base', values: DRAWER_BOX_UI.map((v, i) => ({ value: v, short: ['Birch ply', 'Hardwood'][i]! })) },
      { field: 'upperAction', label: 'Uppers open', camera: 'uppers', values: UPPER_ACTION_UI.map((v, i) => ({ value: v, short: ['Swing', 'Lift-up'][i]! })) },
      { field: 'toeLighting', label: 'Toe light', camera: 'base', values: TOE_LIGHTING_UI.map((v, i) => ({ value: v, short: ['Off', 'Warm LED'][i]! })) },
    ],
  },
  {
    title: 'Counters & fronts',
    rows: [
      { field: 'appliancePanels', label: 'Appliance fronts', camera: 'overview', values: YESNO_UI.map((v, i) => ({ value: v, short: ['Paneled', 'Stainless'][i]! })) },
      { field: 'woodTops', label: 'Counter', camera: 'detail', values: YESNO_UI.map((v, i) => ({ value: v, short: ['Butcher block', 'Stone'][i]! })) },
      { field: 'apronSink', label: 'Sink', camera: 'sink', values: YESNO_UI.map((v, i) => ({ value: v, short: ['Apron front', 'Undermount'][i]! })) },
      { field: 'stonePanels', label: 'Backsplash', camera: 'range', values: YESNO_UI.map((v, i) => ({ value: v, short: ['Full stone', 'Painted'][i]! })) },
    ],
  },
] as const;

const TOUR_VIEWS: readonly View[] = ['overview', 'range', 'detail', 'uppers', 'sink'];

const TOUR_CAPTIONS: Record<string, string> = {
  overview: 'The room shot — chest height, verticals true, the island leading the frame.',
  range: 'The focal wall: a plaster hood, full-height stone, and the range\u2019s red knobs.',
  detail: 'Raking light across the door — reveal discipline is the luxury argument.',
  uppers: 'Stacked, lit uppers run the millwork to the ceiling. No dead soffit, ever.',
  sink: 'The working corner — bridge faucet, boards in reach, a towel in use.',
};

/** Twelve paint chips in one row exceeds what anyone can hold at once; these are the shop's families. */
const PAINT_FAMILIES: readonly { label: string; chips: readonly string[] }[] = [
  { label: 'Pale', chips: ['Shop White', 'Bone', 'Putty'] },
  { label: 'Green & blue', chips: ['Sage', 'Eucalyptus', 'Slate Blue', 'Harbor', 'Ink Green'] },
  { label: 'Warm & dark', chips: ['Oxblood', 'Clay', 'Graphite', 'Soot'] },
] as const;

// The island tone chooser was removed in wave 88 — the island is finished to match. Its option
// list went with it; ISLAND_TONE_NAME below survives because a shared link from before that wave
// can still carry a tone, and the legend has to be able to name what it is showing.

const ISLAND_TONE_NAME: Record<Exclude<StudioStaging['islandTone'], 'match'>, string> = {
  graphite: 'Graphite', harbor: 'Harbor blue', ink: 'Ink green', soot: 'Soot black',
};

type LegendRow = { label: string; value: string };

/** A plain summary of what the visitor chose — the shop's coded schedule is not their language. */
function buildLegend(selection: Sel, staging: StudioStaging): LegendRow[] {
  const paint = selection.finish === 'Painted' || selection.finish === 'Painted w/ Glaze';
  const material = paint
    ? `${selection.paintChip} paint, ${selection.sheen.toLowerCase()}`
    : `${selection.species}, ${selection.finish.toLowerCase()}${selection.stainTone !== 'Natural' ? `, ${selection.stainTone.toLowerCase()}` : ''}, ${selection.sheen.toLowerCase()}`;
  const rows: LegendRow[] = [
    { label: 'Cabinets', value: `${selection.cabinetStyle} \u00b7 ${selection.door}` },
    { label: 'Color', value: `${material}${selection.special !== 'None' ? ` \u00b7 ${selection.special.toLowerCase()}` : ''}` },
    { label: 'Island', value: staging.islandTone === 'match'
      ? `Finished to match the cabinets \u00b7 ${selection.islandEnd.toLowerCase()} ends`
      : `${ISLAND_TONE_NAME[staging.islandTone]} \u00b7 ${selection.islandEnd.toLowerCase()} ends` },
    { label: 'Countertops', value: selection.woodTops !== 'None' ? 'Butcher block' : 'Veined stone' },
    { label: 'Handles', value: `${selection.hardware}, ${selection.hardwareFinish.toLowerCase()}` },
    { label: 'Upper doors', value: `${selection.upperInsert} \u00b7 ${selection.upperAction.toLowerCase()}` },
    { label: 'Trim', value: `${selection.topTrim} \u00b7 ${selection.toeKick.toLowerCase()} toe kick \u00b7 ${selection.lightRail.toLowerCase()} light rail \u00b7 ${selection.bottomTrim.toLowerCase()} bottom` },
    { label: 'Ends', value: `${selection.endsPanels} \u00b7 ${selection.drawerBox} drawer boxes` },
  ];

  // Anything the customer opted into inside the cabinets belongs on the sheet the shop reads.
  const storage = [
    selection.rollouts !== 'None' ? 'rollout trays' : null,
    selection.cutleryInsert !== 'None' ? 'cutlery insert' : null,
    selection.trashPullout !== 'None' ? 'trash pullout' : null,
    selection.plugMold !== 'None' ? 'routed plug moulding' : null,
    selection.ledTrack !== 'None' ? 'routed LED track' : null,
    selection.toeLighting !== 'None' ? 'lit toe kick' : null,
  ].filter(Boolean);
  rows.push({ label: 'Storage & fittings', value: storage.length ? storage.join(' \u00b7 ') : 'None added' });

  rows.push({ label: 'Sink & splash', value: `${selection.apronSink !== 'None' ? 'Apron front' : 'Undermount'} sink, ${selection.sinkHeight.toLowerCase()} \u00b7 ${selection.stonePanels !== 'None' ? 'full stone splash' : 'painted splash'}` });
  rows.push({ label: 'Appliances', value: selection.appliancePanels !== 'None' ? 'Panelled to match the cabinets' : 'Stainless, unpanelled' });
  return rows;
}

function CatalogRow({
  row,
  selection,
  propose,
}: {
  row: DeepRow;
  selection: Sel;
  propose: (patch: Partial<Sel>, label: string, camera: View) => void;
}) {
  return (
    <div className={styles.deepRow}>
      <span>{row.label}</span>
      <div className={styles.deepChoices} data-ux-choice-set={`detail: ${row.label}`} data-ux-max-choices={Math.min(9, row.values.length)}>
        {row.values.map((option) => (
          <button
            key={option.value}
            type="button"
            data-ux-target
            aria-pressed={selection[row.field] === option.value}
            aria-label={`${row.label}: ${option.value}`}
            title={option.value}
            onClick={() => propose({ [row.field]: option.value } as Partial<Sel>, `${row.label} \u2014 ${option.short}`, row.camera)}
          >
            {option.short}
          </button>
        ))}
      </div>
    </div>
  );
}

function matchesPatch(selection: Sel, patch: Partial<Sel>) {
  return (Object.keys(patch) as (keyof Sel)[]).every((field) => selection[field] === patch[field]);
}

function describeSelection(selection: Sel) {
  const door = selection.door
    .replace('Applied Molding on Cope & Stick', 'deep layered')
    .replace('Paint-Grade MDF Slab', 'continuous slab')
    .replace('2.25" Cope & Stick', 'quiet framed')
    .replace('Mitered 2.25"', 'tailored mitered');
  return `${door} door · ${selection.species} · ${selection.sheen.toLowerCase()} · ${selection.hardware}`;
}

function currentPalette(selection: Sel) {
  return palettes.find((palette) => matchesPatch(selection, palette.patch));
}

function MaterialSwatch({
  patch,
  compact = false,
}: {
  patch: Partial<Sel>;
  compact?: boolean;
}) {
  const [source, setSource] = useState<string | null>(null);
  const key = JSON.stringify(patch);

  useEffect(() => {
    const paint = () => {
      const selection = { ...DEFAULT_SEL, ...JSON.parse(key) } as Sel;
      setSource(getSwatchDataUrl(surfaceOf(selection)));
    };
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback;
    if (idle) {
      const handle = idle(paint, { timeout: 1200 });
      return () => (window as unknown as { cancelIdleCallback?: (h: number) => void }).cancelIdleCallback?.(handle);
    }
    const timer = window.setTimeout(paint, 40);
    return () => window.clearTimeout(timer);
  }, [key]);

  return source
    ? (
      <img
        className={compact ? styles.materialBubble : styles.materialSwatch}
        src={source}
        alt=""
        aria-hidden="true"
        width={compact ? 32 : 360}
        height={compact ? 32 : 118}
      />
    )
    : (
      <span
        className={compact ? styles.materialBubbleLoading : styles.materialLoading}
        aria-hidden="true"
      >
        {compact ? '' : 'Preparing material study…'}
      </span>
    );
}

function ChoiceBubble({
  label,
  short,
  selected,
  onClick,
  description,
  swatch,
  disabled = false,
}: {
  label: string;
  short?: string;
  selected: boolean;
  onClick: () => void;
  description: string;
  swatch?: Partial<Sel>;
  disabled?: boolean;
}) {
  const dot = Boolean(swatch) && !short;
  return (
    <button
      type="button"
      data-ux-target
      className={dot ? styles.choiceDot : styles.choiceBubble}
      aria-pressed={selected}
      aria-disabled={disabled || undefined}
      aria-label={`${label}. ${description}`}
      title={`${label} — ${description}`}
      onClick={onClick}
    >
      {swatch ? <MaterialSwatch patch={swatch} compact /> : null}
      {dot ? null : <span>{short ?? label}</span>}
    </button>
  );
}

function ChoiceGroup({
  title,
  current,
  caption,
  choiceSet,
  maxChoices,
  segmented = false,
  children,
}: {
  title: string;
  current: string;
  caption?: string;
  choiceSet: string;
  maxChoices: number;
  segmented?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={styles.group} role="group" aria-label={title}>
      <header className={styles.groupHead}>
        <h3>{title}</h3>
        <span>{current}</span>
      </header>
      <div
        className={segmented ? styles.segmentRow : styles.choiceCloud}
        data-ux-choice-set={choiceSet}
        data-ux-max-choices={maxChoices}
      >
        {children}
      </div>
      {caption ? <p className={styles.groupNote} aria-live="polite">{caption}</p> : null}
    </section>
  );
}

export function CabinetShowcase() {
  const [history, setHistory] = useState<StudioHistory>(() => createStudioHistory());
  const [view, setView] = useState<View>('overview');
  // One fixed look. The lighting study was a designer's control, not a customer's decision.
  // Daylight or evening. This was a hardcoded constant for a long time while a complete dusk
  // grade sat behind it — its own sky, its own ridges, its own bounce colours, practicals at more
  // than twice daytime strength, and dusk branches through the whole composer — none of it
  // reachable by anyone using the studio.
  //
  // It is also, measured, the closest this room gets to the reference. Against Rivian's hero shot
  // (mean 82.1, 11.22% below 32, nothing at all above 235) the daylight room reads 121.8 / 6.99%
  // / 8.27% and the evening room reads 75.9 / 15.72% / 1.65% — nearer on every axis, including
  // saturation. It is also the only view in which the cabinet lighting, the toe glow and the lit
  // transoms do the job they were built for, which is most of what a shop is selling.
  const [lightingMode, setLightingMode] = useState<LightingMode>('lived-in');
  const [openAll, setOpenAll] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneKey, setSceneKey] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [previewStatus, setPreviewStatus] = useState<'preparing' | 'updating' | 'current' | 'failed'>('preparing');
  const [notice, setNotice] = useState<{ text: string; tone: 'info' | 'blocked' }>({
    text: 'Pick a look.',
    tone: 'info',
  });
  // One live region serves both the screen reader and the visible status line, so a blocked
  // click always says so on screen instead of appearing to do nothing.
  const setAnnouncement = useCallback((text: string) => setNotice({ text, tone: 'info' }), []);
  const announceBlocked = useCallback((text: string) => setNotice({ text, tone: 'blocked' }), []);
  const [saveState, setSaveState] = useState<SaveState>('checking');
  const [persistenceReady, setPersistenceReady] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [recoveryNotice, setRecoveryNotice] = useState<RecoveryNotice | null>(null);
  const [sharedNotice, setSharedNotice] = useState<'kept' | 'damaged' | null>(null);
  const [touring, setTouring] = useState(false);
  const [buildNonce, setBuildNonce] = useState(0);
  const [idleDrift, setIdleDrift] = useState(false);
  const [openSection, setOpenSection] = useState<'construction' | 'finish' | 'fittings' | null>(null);
  const sectionSummaries = useRef<Partial<Record<'construction' | 'finish' | 'fittings', HTMLElement | null>>>({});
  const sectionAnchor = useRef<{ id: 'construction' | 'finish' | 'fittings'; top: number } | null>(null);

  // One section is open at a time, so opening a lower one collapses a taller one above it and the
  // page shortens underneath the visitor. Measured: the summary they clicked moved from y=300 to
  // y=-220 — 520px up and off the top of the screen — and the browser clamped scrollY 1930 to 945,
  // so the section they had just asked for was nowhere in sight. Pin the clicked summary to the
  // exact place it was clicked.
  useIsomorphicLayoutEffect(() => {
    const anchor = sectionAnchor.current;
    sectionAnchor.current = null;
    if (!anchor) return;
    const summary = sectionSummaries.current[anchor.id];
    if (!summary) return;
    const drift = summary.getBoundingClientRect().top - anchor.top;
    // `behavior: 'instant'` is load-bearing: html carries `scroll-behavior: smooth`, so the
    // two-argument scrollBy animated the correction instead of applying it, which read as a
    // no-op in the same frame and never landed at all in WebKit.
    if (Math.abs(drift) > 1) window.scrollBy({ top: drift, behavior: 'instant' });
  }, [openSection]);
  // Read in an effect, never in the initializer. Reading localStorage during render made the
  // first client render disagree with the prerendered HTML whenever a slot was saved — the
  // strip came back with aria-pressed="true" and a Clear button that the server never wrote —
  // and React threw #418 (hydration failed) on every reload. The rest of the studio already
  // restores its study this way; the Compare slots were the one holdout.
  const [studies, setStudies] = useState<Record<'A' | 'B' | 'C', string | null>>({ A: null, B: null, C: null });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STUDIES_KEY);
      if (raw) setStudies((current) => ({ ...current, ...JSON.parse(raw) }));
    } catch { /* private mode — the slots stay empty and saving still works this session */ }
  }, []);

  const [previewLook, setPreviewLook] = useState<string | null>(null);
  const [lookCard, setLookCard] = useState<{ nonce: number; name: string; note: string } | null>(null);
  const [kiosk, setKiosk] = useState(false);
  const [kitReady, setKitReady] = useState(false);
  const [motionOverride, setMotionOverride] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const onKitReady = useCallback(() => setKitReady(true), []);
  const lastActive = useRef(0);

  const snapshot = history.present;
  const selection = snapshot.selection;
  const staging = snapshot.staging;
  const { wallTone, stoneFinish, counterEdge, glowTemp, plumbing, seating } = staging;
  const fingerprint = useMemo(() => fingerprintStudioSnapshot(snapshot), [snapshot]);

  // Encoding is async (CompressionStream), and Safari discards a clipboard write that happens
  // after an await, so the link is kept ready for whichever button is pressed next.
  useEffect(() => {
    let live = true;
    void encodeStudioShare(snapshot).then((payload) => {
      if (live) {
        setShareUrl(`${window.location.origin}/labs/cabinet-concept/?study=${payload}`);
      }
    }).catch(() => { /* legacy fallback below covers an encode failure */ });
    return () => { live = false; };
  }, [snapshot]);

  const proposeStaging = useCallback((patch: Partial<StudioStaging>, label: string, camera?: View) => {
    setTouring(false);
    if (camera) setView(camera);
    const result = commitStudioStaging(history, patch, label);
    if (!result.committed) {
      setAnnouncement(`${label} is already part of the current cabinet study.`);
      return;
    }
    setHistory(result.history);
    setAnnouncement(`${label} applied. Undo restores the room.`);
  }, [history, setAnnouncement]);
  const touchStudySlot = useCallback((slot: 'A' | 'B' | 'C') => {
    const stored = studies[slot];
    if (!stored) {
      const encoded = encodeStudioSnapshot(snapshot);
      const next = { ...studies, [slot]: encoded };
      setStudies(next);
      try { window.localStorage.setItem(STUDIES_KEY, JSON.stringify(next)); } catch { /* private mode */ }
      setAnnouncement(`Kitchen ${slot} saved. Tap it any time to come back.`);
      return;
    }
    const parsed = parseLocalStudioSnapshot(stored);
    if (parsed.kind === 'exact') {
      // adopting a slot is undoable — it used to replace the history and strand the visitor
      setHistory(commitStudioSnapshot(history, parsed.snapshot, `Kitchen ${slot}`).history);
      setAnnouncement(`Kitchen ${slot} restored. Undo goes back to what you had.`);
    } else {
      setAnnouncement(`Kitchen ${slot} could not be opened on this device.`);
    }
  }, [studies, snapshot, history]);

  const clearStudySlot = useCallback((slot: 'A' | 'B' | 'C') => {
    const next = { ...studies, [slot]: null };
    setStudies(next);
    try { window.localStorage.setItem(STUDIES_KEY, JSON.stringify(next)); } catch { /* private mode */ }
    setAnnouncement(`Kitchen ${slot} cleared.`);
  }, [studies]);

  const selectionKey = useMemo(() => JSON.stringify(selection), [selection]);
  const palette = currentPalette(selection);
  const selectedWorld = VISUAL_PRESETS.find((preset) => matchesPatch(selection, preset.selection));
  const selectedLayout = layouts.find((layout) => layout.id === selection.layout)!;
  const selectedDoor = doors.find((door) => door.value === selection.door);
  const selectedHardware = hardwareOptions.find((item) => matchesPatch(selection, item.patch));
  const selectedInsert = insertOptions.find((item) => item.value === selection.upperInsert)!;
  const lastTransaction = history.past.at(-1);

  // Kiosk chrome flag on <html>, with cleanup so client-side navigation can never leak a
  // chromeless site (the decision workspace's body.deskMode pattern).
  useEffect(() => {
    if (!kiosk) return;
    document.documentElement.dataset.kiosk = 'true';
    return () => { delete document.documentElement.dataset.kiosk; };
  }, [kiosk]);

  // The kiosk idle reset. The first version captured the first render's reset callback in a
  // stale closure and reset nothing, ever (caught in review, after it shipped) — the ref below
  // always holds the current callback. And a reset between showroom visitors has to clear
  // EVERYTHING the previous visitor left: their kitchen, their compare slots, a mail-fallback
  // panel showing their study link, any shared-study banner, and the scroll position.
  useEffect(() => {
    if (!kiosk) return;
    let timer: ReturnType<typeof setTimeout>;
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        kioskResetRef.current();
        arm();
      }, kioskIdleRef.current);
    };
    arm();
    const events: (keyof DocumentEventMap)[] = ['pointerdown', 'keydown', 'wheel'];
    events.forEach((event) => document.addEventListener(event, arm, { passive: true }));
    window.addEventListener('scroll', arm, { passive: true });
    return () => {
      clearTimeout(timer);
      events.forEach((event) => document.removeEventListener(event, arm));
      window.removeEventListener('scroll', arm);
    };
  }, [kiosk]);

  useEffect(() => {
    // warm the heavy lazy assets alongside the booting scene — but only when the scene will
    // actually mount. A Reduce Motion visitor gets a 78KB still; pulling 2MB of kit, HDR and
    // textures behind it made their "still image" the heaviest page on the site.
    preload('./assets/looks/natural.webp', { as: 'image', fetchPriority: 'high' });
    if (!sceneReady || (reducedMotion && !motionOverride)) return;
    preload('./assets/kit.glb', { as: 'fetch', crossOrigin: 'anonymous' });
    preload('./assets/materials/polyhaven/wood_floor_diff.webp', { as: 'image' });
    preload('./assets/materials/polyhaven/marble_diff.webp', { as: 'image' });
  }, [sceneReady, reducedMotion, motionOverride]);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setReducedMotion(preference.matches);
      setSceneReady(true);
    };
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // The recording rig's trigger for the home-page hero film: `?replay=build` plays the
    // assembly the moment the room arms. Not a public control — the visitor-facing "Build it"
    // button retired when the assembly moved to the home page as the film.
    if (params.get('replay') === 'build') setBuildNonce((n) => n + 1);

    // Kiosk mode for the showroom iPad and builder selections meetings: `?kiosk` strips the
    // site chrome so the studio is the whole screen. One parsed boolean feeds every consumer;
    // the dataset flag and the idle reset live in their own effects, with cleanup.
    if (params.has('kiosk')) {
      setKiosk(true);
      // test hook: the certification suite proves the reset fires without waiting 4 minutes
      const idle = Number(params.get('kioskIdle'));
      if (Number.isFinite(idle) && idle > 0) kioskIdleRef.current = idle;
    }

    // Both link formats land here. `?sel=` used to take a shortcut that skipped every protection
    // the `?study=` path had: it overwrote whatever kitchen the visitor had saved (measured — the
    // stored record changed the moment someone else's link was opened) and a damaged one fell
    // through in silence to the default room. Emails now carry `?study=`, but links already sent
    // must keep working, and they get the same treatment.
    const adopt = (snapshot: StudioSnapshot) => {
      let mine: string | null = null;
      try { mine = window.localStorage.getItem(LOCAL_STUDY_KEY); } catch { /* private mode */ }
      setHistory(createStudioHistory(snapshot));
      setHydrated(true);
      // Strip the share payload from the address bar but never the kiosk flag — a reload on
      // the showroom iPad must come back chromeless with the reset armed.
      window.history.replaceState(null, '', `${window.location.pathname}${new URLSearchParams(window.location.search).has('kiosk') ? '?kiosk' : ''}`);
      if (mine) {
        // Someone else's kitchen must never overwrite the one this visitor saved. Hold
        // autosave until they choose, and keep theirs intact in the meantime.
        setSaveState('paused');
        setSharedNotice('kept');
        setAnnouncement('You opened a shared kitchen. Your own saved kitchen is untouched.');
      } else {
        setPersistenceReady(true);
        setSaveState('saved');
        setAnnouncement('A shared kitchen was opened. It is now saved on this device.');
      }
    };

    const compact = params.get('sel');
    if (compact) {
      try {
        const payload = JSON.parse(atob(compact.replace(/-/g, '+').replace(/_/g, '/'))) as
          Partial<Sel> | { s: Partial<Sel>; g?: Partial<StudioStaging> };
        const parsedSel = ('s' in payload ? payload.s : payload) as Partial<Sel>;
        const parsedStaging = ('g' in payload ? payload.g : undefined) as Partial<StudioStaging> | undefined;
        adopt(createStudioSnapshot(
          { ...DEFAULT_SEL, ...parsedSel },
          { ...DEFAULT_STAGING, ...parsedStaging },
        ));
        return;
      } catch {
        setSharedNotice('damaged');
        setAnnouncement('That shared link is damaged, so it could not be opened.');
      }
    }
    // The visitor's own saved study. A damaged share link still lands here, so they keep their
    // kitchen and read the notice instead of being left on a page that never finishes loading.
    const restoreLocalStudy = () => {
      let raw: string | null = null;
      try {
        raw = window.localStorage.getItem(LOCAL_STUDY_KEY);
      } catch {
        setSaveState('unavailable');
        setHydrated(true);
        return;
      }

      if (!raw) {
        setPersistenceReady(true);
        setHydrated(true);
        return;
      }

      const parsed = parseLocalStudioSnapshot(raw);
      if (parsed.kind === 'exact') {
        setHistory(createStudioHistory(parsed.snapshot));
        setPersistenceReady(true);
        setSaveState('saved');
      } else {
        setSaveState('paused');
        setRecoveryNotice({ kind: parsed.kind === 'recovery' ? 'recovery' : 'invalid', reason: parsed.reason });
      }
      setHydrated(true);
    };

    const shared = params.get('study');
    if (shared) {
      void decodeStudioShare(shared).then((parsed) => {
        if (parsed.kind === 'exact') {
          adopt(parsed.snapshot);
          return;
        }
        // Silently showing a different kitchen is worse than saying the link is damaged.
        setSharedNotice('damaged');
        setAnnouncement('That shared link is damaged, so it could not be opened.');
        restoreLocalStudy();
      });
      return;
    }

    restoreLocalStudy();
  }, []);

  useEffect(() => {
    if (!hydrated || !persistenceReady) return;
    try {
      window.localStorage.setItem(LOCAL_STUDY_KEY, encodeStudioSnapshot(snapshot));
      setSaveState('saved');
    } catch {
      setSaveState('unavailable');
    }
  }, [hydrated, persistenceReady, snapshot]);

  useEffect(() => {
    if (!sceneReady || (reducedMotion && !motionOverride) || sceneFailed) return;
    setPreviewStatus('updating');
    const timer = window.setTimeout(() => setPreviewStatus('current'), 180);
    return () => window.clearTimeout(timer);
  }, [selectionKey, sceneReady, reducedMotion, motionOverride, sceneFailed, sceneKey]);

  useEffect(() => {
    if (!touring) return;
    const advance = () => {
      setView((current) => {
        const index = TOUR_VIEWS.indexOf(current);
        return TOUR_VIEWS[(index + 1) % TOUR_VIEWS.length]!;
      });
    };
    const timer = window.setInterval(advance, 4200);
    return () => window.clearInterval(timer);
  }, [touring]);

  const stopTour = useCallback(() => setTouring(false), []);

  // idle drift: after 14 quiet seconds the camera breathes; any touch stops it
  useEffect(() => {
    lastActive.current = performance.now();
    const poke = () => {
      lastActive.current = performance.now();
      setIdleDrift(false);
    };
    window.addEventListener('pointerdown', poke, { passive: true });
    window.addEventListener('keydown', poke, { passive: true });
    const timer = window.setInterval(() => {
      if (reducedMotion || touring) return;
      if (performance.now() - lastActive.current > 14000) setIdleDrift(true);
    }, 2000);
    return () => {
      window.removeEventListener('pointerdown', poke);
      window.removeEventListener('keydown', poke);
      window.clearInterval(timer);
    };
  }, [reducedMotion, touring]);

  const saveStudySheet = useCallback(() => {
    const source = document.querySelector('[data-testid="studio-stage"] canvas') as HTMLCanvasElement | null;
    const sheet = document.createElement('canvas');
    sheet.width = 1600;
    sheet.height = 1180;
    const ctx = sheet.getContext('2d')!;
    ctx.fillStyle = '#faf7f0';
    ctx.fillRect(0, 0, 1600, 1180);
    ctx.fillStyle = '#b79858';
    ctx.font = '600 26px ui-monospace, monospace';
    ctx.fillText('CABINET CONCEPT', 60, 74);
    ctx.fillStyle = '#10100f';
    ctx.font = '500 54px Georgia, serif';
    // The title is only true when the picture is actually the visitor's room.
    ctx.fillText(source ? 'Your kitchen' : 'Your choices', 60, 140);
    // returns the drawn rect so a caption can sit on the picture rather than beside it
    const draw = (image: CanvasImageSource, iw: number, ih: number) => {
      const ratio = Math.min(1480 / iw, 640 / ih);
      const dw = iw * ratio;
      const dh = ih * ratio;
      const dx = (1600 - dw) / 2;
      ctx.drawImage(image, dx, 176, dw, dh);
      return { dx, dy: 176, dw, dh };
    };
    if (source) {
      draw(source, source.width, source.height);
    } else {
      // Reduced motion, a failed context, or a sheet saved before the room armed: use the poster
      // still rather than shipping a sheet that is mostly empty between the title and the legend.
      const poster = document.querySelector('[data-testid="studio-stage"] img') as HTMLImageElement | null;
      if (poster?.complete && poster.naturalWidth) {
        const rect = draw(poster, poster.naturalWidth, poster.naturalHeight);
        // This is the example room, not their room — saying so is the difference between a
        // useful sheet and one that shows a kitchen they never chose under the word "Your".
        ctx.fillStyle = 'rgb(16 16 15 / 82%)';
        ctx.fillRect(rect.dx, rect.dy + rect.dh - 54, rect.dw, 54);
        ctx.fillStyle = '#f3eee4';
        ctx.font = 'italic 25px Georgia, serif';
        ctx.fillText('Example room — the 3D view was off, so this is not your configured kitchen.', rect.dx + 24, rect.dy + rect.dh - 20);
      } else {
        ctx.fillStyle = '#e9e3d7';
        ctx.fillRect(60, 176, 1480, 640);
        ctx.fillStyle = '#5d5849';
        ctx.font = 'italic 30px Georgia, serif';
        ctx.fillText('Room image unavailable on this device — the schedule below is your study.', 96, 500);
      }
    }
    // the spec book writes the same coded legend the page shows
    const rows = buildLegend(selection, staging)
      .map((row) => [row.label, row.value] as [string, string]);
    // the schedule grew from seven rows to eleven, so it is spaced to fit the sheet
    const rowTop = 858;
    const rowGap = Math.min(30, Math.floor((1120 - rowTop) / Math.max(1, rows.length)));
    rows.forEach(([label, value], i) => {
      const y = rowTop + i * rowGap;
      ctx.fillStyle = '#6d5426';
      ctx.font = '600 19px ui-monospace, monospace';
      ctx.fillText(label.toUpperCase(), 60, y);
      ctx.fillStyle = '#10100f';
      ctx.font = '400 19px Georgia, serif';
      ctx.fillText(value.length > 108 ? `${value.slice(0, 107)}\u2026` : value, 330, y);
    });
    ctx.fillStyle = '#75705f';
    ctx.font = 'italic 24px Georgia, serif';
    ctx.fillText('A visual study. A qualified builder confirms every measurement and finish before building.', 60, 1160);
    const link = document.createElement('a');
    link.download = `cabinet-study-${fingerprint}.pdf`;
    const url = URL.createObjectURL(canvasToPdfBlob(sheet, `Little Fight NYC Cabinet Lab study ${fingerprint}`));
    link.href = url;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 10000);
    setAnnouncement('Your study sheet was downloaded as a PDF you can print or send on.');
  }, [fingerprint, palette, selectedDoor, selectedHardware, selectedInsert, selectedLayout, selection, staging, setAnnouncement]);

  const copyShareLink = useCallback(() => {
    const url = shareUrl ?? `${window.location.origin}/labs/cabinet-concept/?study=${btoa(encodeStudioSnapshot(snapshot)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`;
    void navigator.clipboard?.writeText(url).then(
      () => setAnnouncement('A share link for this exact study was copied.'),
      () => setAnnouncement(`Share link: ${url}`),
    );
  }, [shareUrl, snapshot, setAnnouncement]);

  const propose = useCallback((patch: Partial<Sel>, label: string, camera: View) => {
    setTouring(false);
    if (matchesPatch(history.present.selection, patch)) {
      setView(camera);
      setAnnouncement(`${label} is already part of the current cabinet study.`);
      return;
    }
    const classification = classifyStudioProposal(history.present, patch);
    if (classification.status === 'blocked') {
      const reason = classification.compatibility.requires[0]?.message
        ?? 'The catalog rules identify a conflict, so nothing was changed.';
      announceBlocked(`${label} is not available with the current study. ${reason}`);
      return;
    }
    const result = commitStudioProposal(history, classification, label);
    if (!result.committed) return;
    const coordinated = classification.compatibility.changes.length
      + classification.compatibility.removes.length;
    setHistory(result.history);
    setView(camera);
    setAnnouncement(coordinated > 1
      ? `${label} applied · ${coordinated} details changed together. Undo restores them.`
      : `${label} applied. The configured room is updating.`);
  }, [history]);

  /**
   * A slab door is paint-grade by definition, so asking for walnut on one is impossible. Rather
   * than refuse a customer who has just told us exactly what they want, bring the door along:
   * one undoable change, and the status line says what else moved.
   */
  const proposeMaterial = useCallback((patch: Partial<Sel>, label: string) => {
    const wantsWood = Boolean(patch.species) && patch.species !== 'Paint Grade';
    const coordinated = wantsWood && isMdfSlab(selection.door)
      ? { door: '2.25" Cope & Stick' as Sel['door'], cabinetStyle: 'Inset Face Frame' as Sel['cabinetStyle'], ...patch }
      : patch;
    propose(coordinated, label, 'detail');
  }, [selection.door, propose]);

  const undoRef = useRef<HTMLButtonElement>(null);
  const redoRef = useRef<HTMLButtonElement>(null);
  const historyFocusRef = useRef<'undo' | 'redo' | null>(null);
  const historyFocusFromRef = useRef<Element | null>(null);

  // The handoff is decided in undo()/redo() and executed here, a passive effect later. Between
  // those two moments the visitor may have tabbed on — so `!element.disabled` is not enough, it
  // guards the destination and not the source. Same defect as the workspace's deferred focus.
  useEffect(() => {
    const target = historyFocusRef.current;
    const from = historyFocusFromRef.current;
    historyFocusRef.current = null;
    historyFocusFromRef.current = null;
    if (!target) return;
    const element = target === 'undo' ? undoRef.current : redoRef.current;
    if (element && !element.disabled) focusWhenUnclaimed(element, from);
  }, [history]);

  const kioskResetRef = useRef<() => void>(() => {});
  const kioskIdleRef = useRef(240000);

  const resetToOpeningStudy = useCallback(() => {
    const result = resetStudioHistory(history);
    setView('overview');
    setOpenAll(false);
    if (!result.committed) {
      setAnnouncement('You are already on the starting kitchen.');
      return;
    }
    setHistory(result.history);
    setAnnouncement('Back to the starting kitchen. Undo returns to what you had.');
  }, [history]);

  function undo() {
    const transaction = history.past.at(-1);
    if (!transaction) return;
    const next = undoStudioHistory(history);
    // The last Undo disables Undo, and a control that disables itself drops focus to <body> —
    // measured: activeElement went to BODY, so the next Tab restarted at the skip link. Hand
    // focus to Redo, which is the control that just came alive.
    if (!next.past.length && document.activeElement === undoRef.current) {
      historyFocusRef.current = 'redo';
      historyFocusFromRef.current = focusHolder();
    }
    setHistory(next);
    setAnnouncement(`Undid ${transaction.label ?? transaction.classification?.outcome.title ?? 'the last decision'}.`);
  }

  function redo() {
    const transaction = history.future[0];
    if (!transaction) return;
    const next = redoStudioHistory(history);
    if (!next.future.length && document.activeElement === redoRef.current) {
      historyFocusRef.current = 'undo';
      historyFocusFromRef.current = focusHolder();
    }
    setHistory(next);
    setAnnouncement(`Restored ${transaction.label ?? transaction.classification?.outcome.title ?? 'the next decision'}.`);
  }

  function retryScene() {
    setSceneFailed(false);
    setPreviewStatus('preparing');
    setSceneKey((value) => value + 1);
    setAnnouncement('Retrying the configured 3D preview. Your selections have not changed.');
  }

  function acceptSafeRecovery() {
    const recovered = createAcceptedRecoveredSnapshot(DEFAULT_SEL, { accepted: true });
    setHistory(createStudioHistory(recovered));
    setRecoveryNotice(null);
    setPersistenceReady(true);
    setSaveState('saved');
    setAnnouncement('A new safe local study was accepted. The older incompatible study was not silently changed.');
  }

  function continueWithoutSaving() {
    setRecoveryNotice(null);
    setPersistenceReady(false);
    setSaveState('paused');
    setAnnouncement('Continuing without replacing the older local study. Autosave remains paused.');
  }

  // Reduce Motion keeps the room still by default; the override is an explicit, on-screen opt-in.
  // latest-callback ref: the kiosk timer always calls the current reset, never a stale one
  kioskResetRef.current = () => {
    resetToOpeningStudy();
    setSharedNotice(null);
    setStudies({ A: null, B: null, C: null });
    try {
      window.localStorage.removeItem(LOCAL_STUDY_KEY);
      window.localStorage.removeItem(STUDIES_KEY);
    } catch { /* private mode */ }
    window.scrollTo(0, 0);
  };

  const liveRoom = !reducedMotion || motionOverride;
  const latestOutcome = lastTransaction?.classification?.compatibility.changes[0]?.reason
    ?? lastTransaction?.classification?.outcome.description
    ?? lastTransaction?.label
    ?? 'Nothing changed yet.';

  return (
    <div className={styles.showcase}>
      {/* The old full-screen hero was a second front door in front of an open one — David cut it.
          The studio is the page now; what survives of the hero is one slim masthead line: the h1
          the page still needs, and the boundary sentence the artifact gate greps for verbatim. */}
      <header className={styles.masthead} aria-labelledby="cabinet-showcase-title" data-ux-task-entry>
        <div>
          <p className={styles.eyebrow}>Little Fight NYC · The Lab</p>
          <h1 id="cabinet-showcase-title">Cabinet Lab</h1>
        </div>
        {/* role=note: a <p> may not carry an author name (ARIA prohibits it on role=paragraph);
            the old markup was a labeled <aside> and screen readers should keep that landmark. */}
        <p className={styles.mastheadNote} role="note" aria-label="Cabinet Lab boundary">
          <b>Visual study.</b> A place to explore a direction before a real project is scoped.
        </p>
      </header>

      {sharedNotice ? (
        <section className={styles.recoveryBanner} aria-labelledby="shared-title" role="alert" data-testid="shared-notice">
          <div>
            <p className={styles.eyebrow}>{sharedNotice === 'kept' ? 'Shared kitchen' : 'Damaged link'}</p>
            <h2 id="shared-title">
              {sharedNotice === 'kept'
                ? 'You are looking at someone else\u2019s kitchen.'
                : 'That link could not be opened.'}
            </h2>
            <p>
              {sharedNotice === 'kept'
                ? 'Your own saved kitchen has not been touched. Keep this one to replace yours, or go back to what you had.'
                : 'The link was damaged in transit, so this is the standard starting kitchen rather than the one you were sent. Ask for the link again.'}
            </p>
          </div>
          {sharedNotice === 'kept' ? (
            <div className={styles.recoveryActions}>
              <button
                type="button"
                onClick={() => {
                  setPersistenceReady(true);
                  setSaveState('saved');
                  setSharedNotice(null);
                  setAnnouncement('The shared kitchen is now the one saved on this device.');
                }}
              >
                Keep the shared kitchen
              </button>
              <button
                type="button"
                onClick={() => {
                  let mine = null;
                  try { mine = parseLocalStudioSnapshot(window.localStorage.getItem(LOCAL_STUDY_KEY)); } catch { /* private mode */ }
                  if (mine && mine.kind === 'exact') setHistory(createStudioHistory(mine.snapshot));
                  setPersistenceReady(true);
                  setSaveState('saved');
                  setSharedNotice(null);
                  setAnnouncement('Back to your own saved kitchen.');
                }}
              >
                Go back to mine
              </button>
            </div>
          ) : (
            <div className={styles.recoveryActions}>
              <button type="button" onClick={() => setSharedNotice(null)}>Start designing instead</button>
            </div>
          )}
        </section>
      ) : null}

      {recoveryNotice ? (
        <section className={styles.recoveryBanner} aria-labelledby="recovery-title" role="alert">
          <div>
            <p className={styles.eyebrow}>Local recovery</p>
            <h2 id="recovery-title">Your earlier local study needs an explicit decision.</h2>
            <p>
              Its saved format cannot be restored exactly ({recoveryNotice.reason.replaceAll('-', ' ')}). Nothing has been overwritten.
            </p>
          </div>
          <div className={styles.recoveryActions}>
            <button type="button" onClick={acceptSafeRecovery}>Start a new safe local study</button>
            <button type="button" onClick={continueWithoutSaving}>Continue without replacing it</button>
          </div>
        </section>
      ) : null}

      <section
        id="living-studio"
        className={styles.studio}
        data-testid="cabinet-concept-model"
        data-fingerprint={fingerprint}
        data-ux-task-region="cabinet study"
        aria-label="Cabinet Lab 3D cabinet model"
      >
        <div className={styles.productColumn} data-testid="studio-stage">
          <header className={styles.stageHead} data-cabinet-stage-head>
            <div>
              <p className={styles.eyebrow}>Your kitchen</p>
              <h2>{selectedWorld?.name ?? palette?.label ?? selection.species}</h2>
              <p aria-live="polite" className={styles.specLine} key={fingerprint}>{describeSelection(selection)}</p>
            </div>
            <div className={styles.previewState} data-testid="ui-feedback" data-status={sceneFailed ? 'failed' : previewStatus} role="status" aria-live="polite">
              {sceneFailed
                ? '3D unavailable'
                : !liveRoom
                  ? 'Still'
                  : !kitReady
                    ? 'Loading 3D\u2026'
                    : previewStatus === 'current'
                      ? 'Ready'
                      : 'Updating\u2026'}
            </div>
          </header>

          <div className={styles.sceneWrap}>
            <div className={styles.viewControlsTop}>
              <div className={styles.cameraControls} role="group" aria-label="Camera position" data-ux-choice-set="camera positions" data-ux-max-choices="4">
                {views.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    data-ux-target
                    aria-pressed={view === item.id}
                    onClick={() => {
                      setTouring(false);
                      setView(item.id);
                      setAnnouncement(`${item.label} view.`);
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.viewportFrame} data-testid="studio-viewport">
              {sceneReady && liveRoom && !sceneFailed ? (
                <SceneBoundary
                  key={sceneKey}
                  onFailure={() => {
                    setSceneFailed(true);
                    setPreviewStatus('failed');
                    setAnnouncement('3D unavailable. Your study is safe.');
                  }}
                >
                  <Suspense fallback={<ScenePoster status="Loading 3D…" />}>
                    <CabinetScene
                      sel={selection}
                      view={view}
                      openAll={openAll}
                      buildNonce={buildNonce}
                      lightingMode={lightingMode}
                      idleDrift={idleDrift}
                      seating={seating}
                      wallTone={wallTone}
                      stoneFinish={stoneFinish}
                      counterEdge={counterEdge}
                      glowTemp={glowTemp}
                      plumbing={plumbing}
                      islandTone={staging.islandTone}
                      onKitReady={onKitReady}
                      onContextLost={() => {
                        setSceneFailed(true);
                        setPreviewStatus('failed');
                        announceBlocked('3D connection lost. Your study is safe.');
                      }}
                    />
                  </Suspense>
                </SceneBoundary>
              ) : (
                <ScenePoster
                  status={reducedMotion && !motionOverride
                    ? 'Motion reduced. View in 3D when ready.'
                    : sceneFailed
                      ? '3D unavailable. Try again below.'
                      : 'Loading 3D…'}
                />
              )}

              {lookCard ? (
                <div
                  key={lookCard.nonce}
                  className={styles.lookCard}
                  aria-hidden="true"
                  onAnimationEnd={() => setLookCard(null)}
                >
                  <strong>{lookCard.name}</strong>
                  <span>{lookCard.note}</span>
                </div>
              ) : null}

              {/* The phone frame stays image-only. The status above the frame carries loading
                  truth there; this compact card remains a desktop treatment. */}
              {sceneReady && liveRoom && !sceneFailed && !kitReady ? (
                <div className={styles.loadingScreen} data-testid="studio-loading">
                  <img src="./assets/looks/natural.webp" alt="" width={1090} height={582} />
                  <div className={styles.loadingCard}>
                    <span className={styles.loadingBar} aria-hidden="true" />
                    <strong>Loading 3D&hellip;</strong>
                    <p>A few seconds.</p>
                  </div>
                </div>
              ) : null}

              <div className={styles.stageOverlay}>
                {touring ? (
                  <p className={styles.tourCaption} aria-live="polite">{TOUR_CAPTIONS[view] ?? ''}</p>
                ) : sceneReady && liveRoom && !sceneFailed ? (
                  <p className={styles.sceneHint}>Drag to look · Tap doors to open</p>
                ) : null}
              </div>
            </div>

            <div className={styles.viewControlsBottom}>
              <div className={styles.roomControls} role="group" aria-label="Room actions" data-ux-choice-set="room actions" data-ux-max-choices="2">
                <button
                  type="button"
                  data-ux-target
                  aria-pressed={openAll}
                  onClick={() => {
                    setOpenAll((current) => !current);
                    setAnnouncement(openAll ? 'Closed.' : 'Open.');
                  }}
                >
                  {openAll ? 'Close' : 'Open'}
                </button>
                <button
                  type="button"
                  data-ux-target
                  aria-pressed={touring}
                  onClick={() => {
                    setTouring((current) => !current);
                    setAnnouncement(touring ? 'Tour off.' : 'Tour on.');
                  }}
                >
                  {touring ? 'Stop' : 'Tour'}
                </button>
              </div>
              <div className={styles.cameraControls} role="group" aria-label="Time of day" data-ux-choice-set="lighting" data-ux-max-choices="3">
                {LIGHTING_TIMES.map((time) => (
                  <button
                    key={time.id}
                    type="button"
                    data-ux-target
                    aria-pressed={lightingMode === time.id}
                    onClick={() => {
                      setLightingMode(time.id);
                      setAnnouncement(`${time.label}.`);
                    }}
                  >
                    {time.label}
                  </button>
                ))}
              </div>
            </div>

            {reducedMotion && !motionOverride && !sceneFailed ? (
              <button
                type="button"
                data-ux-target
                className={styles.enterStudio}
                onClick={() => {
                  setMotionOverride(true);
                  setAnnouncement('Loading 3D. Motion stays reduced.');
                }}
              >
                View in 3D <span aria-hidden="true">+</span>
              </button>
            ) : null}

            <p className={styles.notice} data-tone={notice.tone} role="status" aria-live="polite">{notice.text}</p>
          </div>

          {sceneFailed ? (
            <div className={styles.sceneFooter}>
              <p>3D unavailable. Your choices are safe.</p>
              <button type="button" onClick={retryScene}>Try again</button>
            </div>
          ) : null}

          <div className={styles.continuityBar} data-journey={history.past.length || history.future.length ? 'active' : 'fresh'}>
            <p><span>Last change</span><span className={styles.note}>{latestOutcome}</span></p>
            <div>
              <button ref={undoRef} type="button" data-ux-target onClick={undo} disabled={!history.past.length}>Undo last decision</button>
              <button ref={redoRef} type="button" data-ux-target onClick={redo} disabled={!history.future.length}>Redo decision</button>
            </div>
          </div>
        </div>

        <div className={styles.decisionRail} data-testid="cabinet-concept-decisions">
          <header className={styles.decisionHead}>
            <p className={styles.eyebrow}>Cabinet Lab</p>
            <h2>Pick a look.</h2>
            <p>Change anything below.</p>
          </header>

          <div className={styles.decisionBody}>
            <div className={styles.lookSlot}>
            <ChoiceGroup
              title="The look"
              current={selectedWorld?.name ?? 'Custom study'}
              caption={selectedWorld?.description ?? 'Your own combination — every group below remains yours to tune.'}
              choiceSet="starting worlds"
              maxChoices={4}
            >
              {VISUAL_PRESETS.map((preset) => (
                <span
                  key={preset.id}
                  onPointerEnter={() => setPreviewLook(preset.id)}
                  onPointerLeave={() => setPreviewLook(null)}
                  onFocus={() => setPreviewLook(preset.id)}
                  onBlur={() => setPreviewLook(null)}
                >
                  <ChoiceBubble
                    label={preset.name}
                    selected={matchesPatch(selection, preset.selection)}
                    description={preset.description}
                    swatch={preset.selection}
                    onClick={() => {
                      propose(preset.selection, preset.name, 'overview');
                      // the demo's most expensive moment gets a beat of occasion — a lower-third
                      // title card over the canvas, UI layer only, skipped under reduced motion
                      if (!reducedMotion || motionOverride) setLookCard({ nonce: Date.now(), name: preset.name, note: preset.description });
                    }}
                  />
                </span>
              ))}
            </ChoiceGroup>
            {previewLook ? (
              <div className={styles.lookPreview} aria-hidden="true">
                <img src={`./assets/looks/${previewLook}.webp`} alt="" width={520} height={276} />
                <span>{VISUAL_PRESETS.find((preset) => preset.id === previewLook)?.name}</span>
              </div>
            ) : null}
            </div>

            {/* No Room choice and no Island tone. Both removed on David's direction: the room is
                always the full room, because a smaller room is a smaller showing of the product,
                and the island matches the perimeter, because a contrasting island is a decorating
                decision competing with the thing being sold. The only thing this studio sells is
                cabinetry. */}

            <ChoiceGroup
              title="Door"
              current={selectedDoor?.label ?? selection.door}
              caption={selectedDoor?.benefit ?? 'A door profile from the wider catalog.'}
              choiceSet="door profiles"
              maxChoices={4}
              segmented
            >
              {doors.map((door) => (
                <ChoiceBubble
                  key={door.value}
                  label={door.label}
                  short={door.short}
                  selected={selection.door === door.value}
                  description={door.benefit}
                  onClick={() => propose({ door: door.value, cabinetStyle: door.style }, door.label, 'detail')}
                />
              ))}
            </ChoiceGroup>

            <ChoiceGroup
              title="Material"
              current={palette?.label ?? `${selection.species} · ${selection.finish}`}
              caption={palette?.benefit ?? 'A custom material path across species, finish, and sheen.'}
              choiceSet="material studies"
              maxChoices={6}
            >
              {palettes.map((item) => (
                <ChoiceBubble
                  key={item.id}
                  label={item.label}
                  selected={matchesPatch(selection, item.patch)}
                  description={item.benefit}
                  swatch={item.patch}
                  onClick={() => proposeMaterial(item.patch, item.label)}
                />
              ))}
            </ChoiceGroup>

            <ChoiceGroup
              title="Hardware"
              current={selectedHardware?.label ?? selection.hardware}
              caption={selectedHardware?.benefit ?? 'A hardware pairing from the wider catalog.'}
              choiceSet="hardware studies"
              maxChoices={3}
              segmented
            >
              {hardwareOptions.map((item) => (
                <ChoiceBubble
                  key={item.label}
                  label={item.label}
                  short={item.short}
                  selected={matchesPatch(selection, item.patch)}
                  description={item.benefit}
                  onClick={() => propose(item.patch, item.label, 'hardware')}
                />
              ))}
            </ChoiceGroup>

            <ChoiceGroup
              title="Upper doors"
              current={selectedInsert.label}
              caption={ruleFor(selection, 'upperInsert', 'Metal Mesh') && selection.upperInsert !== 'Metal Mesh'
                ? `${selectedInsert.benefit} Glass and mesh ask for a framed door.`
                : selectedInsert.benefit}
              choiceSet="upper door studies"
              maxChoices={3}
              segmented
            >
              {insertOptions.map((item) => {
                const unavailable = ruleFor(selection, 'upperInsert', item.value);
                return (
                  <ChoiceBubble
                    key={item.value}
                    label={item.label}
                    short={item.short}
                    selected={selection.upperInsert === item.value}
                    description={unavailable ?? item.benefit}
                    onClick={() => propose({ upperInsert: item.value }, item.label, 'uppers')}
                  />
                );
              })}
            </ChoiceGroup>

            <div className={styles.catalog} data-testid="every-detail">
              <p className={styles.catalogTitle}>All the details</p>
              {([
                ['construction', 'How it is built', 'Door profiles, hardware, trim, and how it opens'],
                ['finish', 'Color and wood', 'Every paint, wood, stain, and sheen'],
                ['fittings', 'Inside the cabinets', 'Drawers, rollouts, inserts, and storage'],
              ] as const).map(([id, title, blurb]) => (
                <details
                  key={id}
                  className={styles.catalogSection}
                  open={openSection === id}
                >
                  <summary
                    ref={(node) => { sectionSummaries.current[id] = node; }}
                    data-ux-target
                    onClick={(event) => {
                      event.preventDefault();
                      sectionAnchor.current = { id, top: event.currentTarget.getBoundingClientRect().top };
                      setOpenSection((current) => (current === id ? null : id));
                    }}
                  >
                    <strong>{title}</strong>
                    <span>{blurb}</span>
                  </summary>
                  <div className={styles.deepBody}>
                    {id === 'construction' ? (
                      DEEP_GROUPS.filter((group) => ['Door construction \u2014 the full catalog', 'Hardware \u2014 the full wall', 'Trim & structure'].includes(group.title)).map((group) => (
                        <div key={group.title} className={styles.deepGroup}>
                          <h4>{group.title}</h4>
                          {group.rows.map((row) => (
                            <CatalogRow key={`${String(row.field)}-${row.label}`} row={row} selection={selection} propose={propose} />
                          ))}
                        </div>
                      ))
                    ) : null}
                    {id === 'finish' ? (
                      <>
                        {DEEP_GROUPS.filter((group) => group.title === 'Finish system').map((group) => (
                          <div key={group.title} className={styles.deepGroup}>
                            {group.rows.map((row) => (
                              <CatalogRow key={`${String(row.field)}-${row.label}`} row={row} selection={selection} propose={propose} />
                            ))}
                          </div>
                        ))}
              {PAINT_FAMILIES.map((family) => (
              <div className={styles.deepRow} key={family.label}>
                <span>{family.label}</span>
                <div className={styles.choiceCloud} data-ux-choice-set={`paint: ${family.label}`} data-ux-max-choices={family.chips.length}>
                  {family.chips.map((chip) => (
                    <ChoiceBubble
                      key={chip}
                      label={`${chip} paint`}
                      selected={selection.finish === 'Painted' && selection.paintChip === chip}
                      description={`Sprayed ${chip} over paint-grade fronts.`}
                      swatch={{ species: 'Paint Grade', finish: 'Painted', paintChip: chip }}
                      onClick={() => propose({ species: 'Paint Grade', finish: 'Painted', paintChip: chip, special: 'None' }, `${chip} paint`, 'detail')}
                    />
                  ))}
                </div>
              </div>
              ))}
              <div className={styles.deepRow}>
                <span>Wood</span>
                <div className={styles.choiceCloud} data-ux-choice-set="wood species" data-ux-max-choices={7}>
                  {SPECIES_UI.filter((s) => s !== 'Paint Grade').map((species) => (
                    <ChoiceBubble
                      key={species}
                      label={species}
                      selected={selection.species === species && selection.finish !== 'Painted'}
                      description={`${species}, finished naturally.`}
                      swatch={{ species, finish: 'Natural Finish', stainTone: 'Natural' }}
                      onClick={() => proposeMaterial({ species, finish: 'Natural Finish', stainTone: 'Natural', special: 'None' }, species)}
                    />
                  ))}
                </div>
              </div>
              {selection.finish !== 'Painted' ? (
                <div className={styles.deepRow}>
                  <span>Stain</span>
                  <div className={styles.deepChoices} data-ux-choice-set="stain tones" data-ux-max-choices={6}>
                    {STAIN_TONES_UI.map((tone) => (
                      <button
                        key={tone}
                        type="button"
                        data-ux-target
                        aria-pressed={selection.stainTone === tone}
                        aria-label={`Stain tone: ${tone}`}
                        onClick={() => propose({ stainTone: tone, finish: tone === 'Natural' ? 'Natural Finish' : 'Stained' }, `${tone} stain`, 'detail')}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className={styles.deepRow}>
                <span>Sheen</span>
                <div className={styles.deepChoices} data-ux-choice-set="sheens" data-ux-max-choices={4}>
                  {SHEENS_UI.map((sheen) => (
                    <button
                      key={sheen}
                      type="button"
                      data-ux-target
                      aria-pressed={selection.sheen === sheen}
                      aria-label={`Sheen: ${sheen}`}
                      onClick={() => propose({ sheen }, `${sheen} sheen`, 'detail')}
                    >
                      {sheen}
                    </button>
                  ))}
                </div>
              </div>
                      </>
                    ) : null}
                    {id === 'fittings' ? (
                      DEEP_GROUPS.filter((group) => ['Fittings & storage', 'Counters & fronts'].includes(group.title)).map((group) => (
                        <div key={group.title} className={styles.deepGroup}>
                          <h4>{group.title}</h4>
                          {group.rows.map((row) => (
                            <CatalogRow key={`${String(row.field)}-${row.label}`} row={row} selection={selection} propose={propose} />
                          ))}
                        </div>
                      ))
                    ) : null}
                  </div>
                </details>
              ))}
            </div>

            {ruleFor(selection, 'upperInsert', 'Metal Mesh') ? (
              <aside className={styles.resolutionCard} aria-label="Path to framed upper inserts">
                <strong>Glass and mesh need a framed door.</strong>
                <p>Keep the current slab, or apply one coordinated change that restores a framed opening and woven mesh. Undo reverses it.</p>
                <button
                  type="button"
                  onClick={() => propose({ door: 'Applied Molding on Cope & Stick', cabinetStyle: 'Inset Face Frame', upperInsert: 'Metal Mesh' }, 'Framed door with woven mesh', 'uppers')}
                >
                  Apply the framed-door change
                </button>
              </aside>
            ) : null}
          </div>

          <div className={styles.studies} data-testid="studies-strip">
            <span className={styles.studiesLabel}>Compare</span>
            {(['A', 'B', 'C'] as const).map((slot) => (
              <span key={slot} className={styles.studySlot}>
                <button
                  type="button"
                  data-ux-target
                  aria-pressed={Boolean(studies[slot])}
                  aria-label={studies[slot] ? `Open saved kitchen ${slot}` : `Save this kitchen as ${slot}`}
                  onClick={() => touchStudySlot(slot)}
                >
                  {slot}
                </button>
                {studies[slot] ? (
                  <button
                    type="button"
                    className={styles.studyClear}
                    aria-label={`Clear saved kitchen ${slot}`}
                    onClick={() => clearStudySlot(slot)}
                  >
                    {'\u00d7'}
                  </button>
                ) : null}
              </span>
            ))}
            <em>Tap a letter to save this kitchen · tap it again to come back to it</em>
          </div>
          {/* On a phone this bar is hidden until there is a decision to save — Save as PDF,
              Copy link and Start over are end-of-journey actions, and on first load they were
              spending a third of the viewport answering a question nobody had asked yet. */}
          <footer className={styles.decisionFooter} data-journey={history.past.length || history.future.length ? 'active' : 'fresh'}>
            <div className={styles.localState} data-state={saveState} data-testid="studio-local-state">
              <span>{saveState === 'saved' ? 'Saved on this device' : saveState === 'paused' ? 'Not saving' : saveState === 'unavailable' ? 'Cannot save here' : 'Checking\u2026'}</span>
            </div>
            <button type="button" data-ux-target className={styles.resetAction} onClick={saveStudySheet}>
              Save as PDF
            </button>
            <button type="button" data-ux-target className={styles.resetAction} onClick={copyShareLink}>
              Copy link
            </button>
            <button
              type="button"
              data-ux-target
              className={styles.resetAction}
              aria-label="Start over"
              onClick={resetToOpeningStudy}
            >
              Start over
            </button>
          </footer>
        </div>
      </section>

      <section className={styles.legend} aria-labelledby="legend-title">
        <header>
          <p className={styles.eyebrow}>Your choices</p>
          <h2 id="legend-title">Everything you picked, in one place.</h2>
          <p className={styles.legendStamp} aria-hidden="true">STUDY SHEET · REV A · NOT FOR CONSTRUCTION</p>
        </header>
        <div className={styles.legendTable} role="table" aria-label="Your choices">
          {buildLegend(selection, staging).map((row) => (
            <div key={row.label} role="row" className={styles.legendRow}>
              <span role="cell" className={styles.legendScope}>{row.label}</span>
              <span role="cell" className={styles.legendDesc}>{row.value}</span>
            </div>
          ))}
        </div>
        <p className={styles.legendNote}>
          This is a visual study, not a final drawing, quote, or order. Every measurement and finish
          needs real-world confirmation before anything is built.
        </p>
      </section>

      <section className={styles.bridge} aria-labelledby="bridge-title">
        <div>
          <p className={styles.eyebrow}>Keep the concept moving</p>
          <h2 id="bridge-title">Save what you explored.</h2>
          <p>
            Download a study sheet or copy a link to this exact set of visual choices. This public
            proof of concept does not send a request, contact a business, or create an order.
          </p>
          <p className={styles.bridgeSelections}>
            The saved study is a starting point for a future custom-shopping flow, not a final specification.
          </p>
        </div>
        {/* the study sheet as a physical object on the bench — same data as the summary table */}
        <aside className={styles.facsimile} aria-hidden="true">
            <span className={styles.facsimileMark}>LITTLE FIGHT NYC · CABINET LAB</span>
          <strong>{selectedWorld?.name ?? 'Custom study'}</strong>
          {buildLegend(selection, staging).slice(0, 6).map((row) => (
            <p key={row.label}><span>{row.label}</span>{row.value}</p>
          ))}
          <em>STUDY SHEET · REV A</em>
        </aside>
        <div className={styles.bridgeActions}>
          <button type="button" data-ux-target onClick={saveStudySheet}>Download study sheet</button>
          <button type="button" data-ux-target onClick={copyShareLink}>Copy study link</button>
        </div>
      </section>

      <section className={styles.closer} aria-labelledby="showcase-close-title" data-testid="showcase-close" data-ux-terminal>
        <p className={styles.eyebrow}>What happens next</p>
        <h2 id="showcase-close-title">Take it with you.</h2>
        <p>
          Save the sheet or copy the link and your study comes back exactly as you left it, on any screen. Cabinet Lab does not put a number on a project or create an order. It makes a direction tangible enough to discuss and improve.
        </p>
      </section>

    </div>
  );
}
