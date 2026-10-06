// SAMPLE PRICING — authored fresh from public market ranges for custom millwork.
// These numbers are illustrative and are NOT any shop's real rates (Guardrail 2).
// Every consumer of SAMPLE_RATES must render a "Sample pricing" label (L-56).

export type LayoutId = 'galley' | 'island' | 'fullshop';

/** The three demo objects — the "model picker". LF drives per-LF pricing. */
export const LAYOUTS: Record<
  LayoutId,
  { name: string; strap: string; lowerLf: number; upperLf: number; tallLf: number; drawers: number; pulls: number; runs: number }
> = {
  galley: { name: 'The Galley', strap: 'One wall run — lowers, uppers, crown', lowerLf: 14, upperLf: 12, tallLf: 0, drawers: 3, pulls: 12, runs: 1 },
  island: { name: 'The Island Kitchen', strap: 'Hero island plus a full wall run', lowerLf: 23, upperLf: 12, tallLf: 0, drawers: 9, pulls: 18, runs: 2 },
  fullshop: { name: 'The Full Shop', strap: 'Island, wall run, and a tall pantry wall', lowerLf: 23, upperLf: 12, tallLf: 8, drawers: 9, pulls: 24, runs: 3 },
};

export const SAMPLE_RATES = {
  label: 'Sample pricing — your quote is built from your drawings.',
  /** Base rate per linear foot by cabinet style (lowers; uppers 0.8×, talls 1.6×). */
  basePerLf: {
    'Full Overlay Frameless': 520,
    'Inset Face Frame': 690,
  } as Record<string, number>,
  /** Door family+variant adder per LF. */
  doorAdder: {
    '2.25" Cope & Stick': 0,
    '3" Cope & Stick': 28,
    'Mitered 2.25"': 45,
    'Mitered 2.75"+': 72,
    'Applied Molding on Cope & Stick': 84,
    'Applied Molding on Slab': 64,
    'Hardwood Slab': -12,
    'Paint-Grade MDF Slab': -30,
    'Prefinished Gloss or Matte': -55,
    'Prefinished Texture Laminate': -62,
    'Prefinished Solid Color Melamine': -78,
    'Prefinished Real Wood Veneer': -20,
  } as Record<string, number>,
  /** Species adder per LF. */
  speciesAdder: {
    'Paint Grade': 0,
    'Maple': 35,
    'Clear Alder': 40,
    'Knotty Alder': 30,
    'Rift White Oak': 120,
    'Plain Sawn Oak': 60,
    'Quarter Sawn Oak': 95,
    'Walnut': 150,
  } as Record<string, number>,
  /** Finish adder per LF (full vocab incl. glazes). */
  finishAdder: {
    'Painted': 55,
    'Painted w/ Glaze': 92,
    'Stained': 40,
    'Stained w/ Glaze': 76,
    'Natural Finish': 25,
    'Natural w/ Glaze': 58,
    'Natural w/ Toner': 34,
    'Bleach': 66,
    'Pre Finished': 0,
  } as Record<string, number>,
  /** Sheen adder per LF. */
  sheenAdder: {
    'Matte': 0,
    'Satin': 0,
    'Semi Gloss': 10,
    'High Gloss': 90,
    'Pre Finished': 0,
  } as Record<string, number>,
  /** Special feature adder per LF. */
  specialAdder: {
    'None': 0,
    'Cerused': 48,
    'Glaze': 36,
    'Distressed': 42,
  } as Record<string, number>,
  /** Top trim, flat per run of uppers/talls. */
  topTrimFlat: {
    'None': 0,
    'Flat Crown': 240,
    'Flat Crown w/ Bevel': 320,
    'Standard Crown': 380,
    'Cove Crown': 460,
    'RVB Simple Side': 340,
    'RVB Block Side': 520,
  } as Record<string, number>,
  /** Toe kick, flat per base run. */
  toeKickFlat: {
    'Standard': 0,
    'No Toe Kick': -60,
    'Extended Stiles': 260,
    'Furniture Feet': 420,
    'Cabinet Base': 380,
    'Notched Cabinet Base': 440,
  } as Record<string, number>,
  /** Bottom trim (under uppers), flat per upper run. */
  bottomTrimFlat: {
    'Flat': 0,
    'Spanish': 140,
    'Flat Bevel': 90,
  } as Record<string, number>,
  /** Light rail, flat per upper run. */
  lightRailFlat: {
    'Standard 1 1/2" Concealed': 0,
    '1 1/2" Exposed': 60,
    'Custom Light Rail': 180,
  } as Record<string, number>,
  /** Ends / panels, flat per job. */
  endsPanelsFlat: {
    'Flat Ends': 0,
    'Paneled Ends': 520,
    'Mix': 300,
  } as Record<string, number>,
  /** Drawer box, per drawer. */
  drawerBoxEach: {
    '1/2" Baltic Birch Ply': 0,
    '5/8" Hardwood': 38,
  } as Record<string, number>,
  /** Hardware per pull. */
  hardwareEach: {
    'Shop Bar': 14,
    'Edge Pull': 18,
    'Classic Knob': 9,
    'Arch Pull': 22,
  } as Record<string, number>,
  /** Hardware finish multiplier. */
  hardwareFinishMult: {
    'Matte Black': 1,
    'Brushed Brass': 1.35,
    'Polished Nickel': 1.2,
  } as Record<string, number>,
  /** Extras, flat. */
  plugMoldFlat: { 'Yes as noted on drawings': 260, 'None': 0 } as Record<string, number>,
  ledTrackFlat: { 'Yes as noted on drawings': 340, 'None': 0 } as Record<string, number>,
} as const;

export type PricedSelection = {
  layout: LayoutId;
  cabinetStyle: string;
  door: string; // family+variant key into doorAdder
  species: string;
  finish: string;
  sheen: string;
  special: string;
  topTrim: string;
  toeKick: string;
  bottomTrim: string;
  lightRail: string;
  endsPanels: string;
  drawerBox: string;
  hardware: string;
  hardwareFinish: string;
  plugMold: string;
  ledTrack: string;
};

export function samplePrice(sel: PricedSelection): number {
  const L = LAYOUTS[sel.layout] ?? LAYOUTS.island;
  const r = SAMPLE_RATES;
  const perLf =
    (r.doorAdder[sel.door] ?? 0) +
    (r.speciesAdder[sel.species] ?? 0) +
    (r.finishAdder[sel.finish] ?? 0) +
    (r.sheenAdder[sel.sheen] ?? 0) +
    (r.specialAdder[sel.special] ?? 0);
  const base = r.basePerLf[sel.cabinetStyle] ?? 0;
  const lfTotal =
    L.lowerLf * (base + perLf) + L.upperLf * 0.8 * (base + perLf) + L.tallLf * 1.6 * (base + perLf);
  const upperRuns = L.upperLf > 0 ? 1 : 0;
  const flats =
    (r.topTrimFlat[sel.topTrim] ?? 0) * (upperRuns + (L.tallLf > 0 ? 1 : 0)) +
    (r.toeKickFlat[sel.toeKick] ?? 0) * L.runs +
    (r.bottomTrimFlat[sel.bottomTrim] ?? 0) * upperRuns +
    (r.lightRailFlat[sel.lightRail] ?? 0) * upperRuns +
    (r.endsPanelsFlat[sel.endsPanels] ?? 0) +
    (r.plugMoldFlat[sel.plugMold] ?? 0) +
    (r.ledTrackFlat[sel.ledTrack] ?? 0);
  const per =
    (r.drawerBoxEach[sel.drawerBox] ?? 0) * L.drawers +
    (r.hardwareEach[sel.hardware] ?? 0) * (r.hardwareFinishMult[sel.hardwareFinish] ?? 1) * L.pulls;
  return Math.round(lfTotal + flats + per);
}
