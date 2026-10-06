import {
  DEFAULT_SEL, isMdfSlab, isPrefinished, ruleFor, sanitizeSelection, supportsUpperInsert, type Sel,
} from './options';

/** Camera names are intentionally the same names consumed by CabinetScene. */
export type CompatibilityCamera =
  | 'overview'
  | 'detail'
  | 'uppers'
  | 'base'
  | 'hardware'
  | 'ends'
  | 'inside'
  | 'sink';

export type CompatibilityField = keyof Sel;

export type ChangeKind = 'changed' | 'added' | 'removed' | 'locked';

export type ChangeRow = {
  id: string;
  label: string;
  before: string;
  after: string;
  kind: ChangeKind;
  field?: CompatibilityField;
  reason?: string;
};

export type CompatibilityRequirement = {
  id: string;
  label: string;
  message: string;
  kind: 'confirmation' | 'lock' | 'review';
  field?: CompatibilityField;
};

export type CompatibilityWarning = {
  id: string;
  message: string;
  field?: CompatibilityField;
};

export type CompatibilityResult = {
  /** False means the proposal asks for a combination the current catalog disallows. */
  allowed: boolean;
  /** The selection to apply after Continue. Invalid proposals intentionally return the current selection. */
  next: Sel;
  /** The direct user proposal, retained so the caller can retry or explain a rejected choice. */
  proposal: Partial<Sel>;
  /** Slate-style rows: current value → resulting value, including automatic downstream updates. */
  changes: ChangeRow[];
  /** Conditions the customer should see before applying an otherwise valid downstream update. */
  requires: CompatibilityRequirement[];
  /** Values that stop applying, even when Sel has no honest "None" vocabulary for that field. */
  removes: ChangeRow[];
  /** Non-blocking details that need a drawing/shop confirmation rather than a fabricated rule. */
  warnings: CompatibilityWarning[];
  /** The focused scene view for this decision. */
  camera: CompatibilityCamera;
  /** Use this to decide whether to present ChangeSheet before applying `next`. */
  needsConfirmation: boolean;
};

const FIELD_LABEL: Record<CompatibilityField, string> = {
  layout: 'Kitchen layout',
  cabinetStyle: 'Cabinet style',
  door: 'Door family',
  species: 'Wood species',
  finish: 'Finish type',
  paintChip: 'Paint color',
  stainTone: 'Stain tone',
  sheen: 'Sheen',
  special: 'Finish feature',
  endsPanels: 'Finished ends',
  topTrim: 'Crown profile',
  toeKick: 'Toe kick',
  bottomTrim: 'Bottom trim',
  lightRail: 'Light rail',
  drawerBox: 'Drawer box',
  hardware: 'Hardware',
  hardwareFinish: 'Hardware finish',
  upperInsert: 'Upper door insert',
  islandEnd: 'Island end treatment',
  toeLighting: 'Island toe lighting',
  plugMold: 'Plug molding',
  ledTrack: 'Routed LED track',
  upperAction: 'Upper door action',
  rollouts: 'Rollout trays',
  cutleryInsert: 'Cutlery insert',
  trashPullout: 'Trash pullout',
  woodTops: 'Wood tops',
  apronSink: 'Apron sink',
  sinkHeight: 'Sink height',
  appliancePanels: 'Appliance panels',
  stonePanels: 'Wall or ceiling stone panels',
  panelName: 'Panel name',
  finishName: 'Finish name',
  edgebanding: 'Edgebanding',
  crownHeight: 'Crown height',
  ceilingHeight: 'Ceiling height',
  counterThickness: 'Counter thickness',
  installBeforeFlooring: 'Install before flooring',
  flooringThickness: 'Flooring thickness',
  drywallThickness: 'Drywall thickness',
  casingThickness: 'Casing thickness',
  deliveryDate: 'Delivery date',
  doorsOrderVsCnc: 'Doors order vs. CNC',
  finishMethod: 'Finish method',
};

const CAMERA_BY_FIELD: Partial<Record<CompatibilityField, CompatibilityCamera>> = {
  layout: 'overview',
  cabinetStyle: 'detail',
  door: 'detail',
  species: 'detail',
  finish: 'detail',
  paintChip: 'detail',
  stainTone: 'detail',
  sheen: 'detail',
  special: 'detail',
  endsPanels: 'ends',
  topTrim: 'uppers',
  toeKick: 'base',
  bottomTrim: 'base',
  lightRail: 'uppers',
  drawerBox: 'inside',
  hardware: 'hardware',
  hardwareFinish: 'hardware',
  upperInsert: 'uppers',
  islandEnd: 'ends',
  toeLighting: 'base',
  plugMold: 'uppers',
  ledTrack: 'uppers',
  upperAction: 'inside',
  rollouts: 'inside',
  cutleryInsert: 'inside',
  trashPullout: 'inside',
  woodTops: 'ends',
  apronSink: 'sink',
  sinkHeight: 'sink',
  appliancePanels: 'overview',
  stonePanels: 'uppers',
};

const RULED_FIELDS: Partial<Record<CompatibilityField, string>> = {
  species: 'species',
  finish: 'finish',
  sheen: 'sheen',
  special: 'special',
  upperInsert: 'upperInsert',
  sinkHeight: 'sinkHeight',
};

function owns<T extends object>(object: T, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function isEnabled(value: string): boolean {
  return value !== 'None';
}

function cameraFor(proposal: Partial<Sel>): CompatibilityCamera {
  const fields = Object.keys(proposal) as CompatibilityField[];
  for (let index = fields.length - 1; index >= 0; index -= 1) {
    const field = fields[index];
    if (field && CAMERA_BY_FIELD[field]) return CAMERA_BY_FIELD[field]!;
  }
  return 'overview';
}

function valueOf(selection: Sel, field: CompatibilityField): string {
  return String(selection[field]);
}

/**
 * Evaluates the customer-facing catalog without making up unavailable MasterFile values.
 *
 * `next` may include only deterministic catalog corrections already implied by the existing
 * availability rules: MDF becomes Paint Grade + Painted, a prefinished door's finish method
 * becomes Pre Finished, and frameless door families revert upper inserts to a solid panel.
 * Everything else remains a visible requirement, warning, or inapplicable row for review.
 */
export function evaluateCompatibility(current: Sel, proposal: Partial<Sel>): CompatibilityResult {
  const candidate: Sel = { ...current, ...proposal };
  const changes: ChangeRow[] = [];
  const requires: CompatibilityRequirement[] = [];
  const removes: ChangeRow[] = [];
  const warnings: CompatibilityWarning[] = [];
  let allowed = true;

  const addChange = (field: CompatibilityField, reason?: string) => {
    if (current[field] === candidate[field]) return;
    changes.push({
      id: `change-${field}`,
      field,
      label: FIELD_LABEL[field],
      before: valueOf(current, field),
      after: valueOf(candidate, field),
      kind: isEnabled(valueOf(candidate, field)) && !isEnabled(valueOf(current, field)) ? 'added' : 'changed',
      reason,
    });
  };

  const force = (field: CompatibilityField, value: Sel[CompatibilityField], message: string) => {
    if (candidate[field] === value) return;
    candidate[field] = value as never;
    addChange(field, message);
    requires.push({
      id: `required-${field}`,
      field,
      label: FIELD_LABEL[field],
      message,
      kind: 'confirmation',
    });
  };

  // A Paint-Grade MDF Slab has two catalog-defined downstream values. This exactly mirrors
  // options.ruleFor(), rather than adding a new material or finish vocabulary.
  if (isMdfSlab(candidate.door)) {
    force('species', 'Paint Grade', 'MDF slab doors are paint grade by definition.');
    if (!candidate.finish.startsWith('Painted')) {
      force('finish', 'Painted', 'MDF slab doors use a painted finish.');
    }
  }

  // If the customer picks Paint Grade first, keep a previously valid paint selection. A directly
  // proposed incompatible finish is blocked below rather than silently replaced.
  if (
    candidate.species === 'Paint Grade'
    && !candidate.finish.startsWith('Painted')
    && candidate.finish !== 'Bleach'
    && !owns(proposal, 'finish')
  ) {
    force('finish', 'Painted', 'Paint Grade is selected for a painted finish.');
  }

  if (isPrefinished(candidate.door)) {
    force('finishMethod', 'Pre Finished', 'This door arrives factory finished.');
    if (candidate.special !== 'None') {
      force('special', 'None', 'Hand-applied finish features do not apply to prefinished doors.');
    }

    const lockedFields: CompatibilityField[] = candidate.door === 'Prefinished Real Wood Veneer'
      ? ['finish', 'sheen', 'special']
      : ['species', 'finish', 'sheen', 'special'];

    for (const field of lockedFields) {
      requires.push({
        id: `lock-${field}`,
        field,
        label: FIELD_LABEL[field],
        message: `${FIELD_LABEL[field]} is defined by the selected prefinished face.`,
        kind: 'lock',
      });
      removes.push({
        id: `locked-${field}`,
        field,
        label: FIELD_LABEL[field],
        before: valueOf(current, field),
        after: field === 'species' && candidate.door === 'Prefinished Real Wood Veneer'
          ? valueOf(candidate, field)
          : 'Factory-defined',
        kind: 'locked',
        reason: 'The selected prefinished door carries this specification.',
      });
    }
  } else if (candidate.finishMethod === 'Pre Finished') {
    force(
      'finishMethod',
      candidate.finish.startsWith('Painted') || isMdfSlab(candidate.door) ? 'Paint' : 'Stain',
      'Pre Finished applies only to a prefinished door family.',
    );
  }

  // A door-family change must never leave a hidden glass/mesh selection in review documents.
  // A direct incompatible insert choice stays visible as a blocked catalog choice below.
  if (
    !supportsUpperInsert(candidate.door)
    && candidate.upperInsert !== 'Solid Panel'
    && !owns(proposal, 'upperInsert')
  ) {
    force('upperInsert', 'Solid Panel', 'This door family uses a continuous solid face.');
  }

  // Existing ruleFor() remains the sole source of hard catalog availability. Evaluate only values
  // the user explicitly proposed so a door-family change can present a Slate-style confirmation
  // instead of being rejected for state that has become factory-defined or was auto-corrected.
  for (const field of Object.keys(proposal) as CompatibilityField[]) {
    const section = RULED_FIELDS[field];
    if (!section) continue;
    const proposed = proposal[field];
    const reason = ruleFor(candidate, section, typeof proposed === 'string' ? proposed : valueOf(candidate, field));
    if (!reason) continue;
    allowed = false;
    requires.push({
      id: `incompatible-${field}`,
      field,
      label: FIELD_LABEL[field],
      message: reason,
      kind: 'review',
    });
  }

  if (candidate.apronSink === 'None') {
    if (current.apronSink !== 'None' || owns(proposal, 'sinkHeight')) {
      removes.push({
        id: 'remove-sink-height',
        field: 'sinkHeight',
        label: FIELD_LABEL.sinkHeight,
        before: valueOf(current, 'sinkHeight'),
        after: 'Not applicable',
        kind: 'removed',
        reason: 'Sink height applies when an apron sink is selected.',
      });
    }
  } else if (current.apronSink === 'None' || owns(proposal, 'apronSink')) {
    requires.push({
      id: 'requires-sink-height',
      field: 'sinkHeight',
      label: FIELD_LABEL.sinkHeight,
      message: `The apron sink will use ${candidate.sinkHeight}.`,
      kind: 'confirmation',
    });
  }

  if (isEnabled(candidate.appliancePanels) && (current.appliancePanels === 'None' || owns(proposal, 'appliancePanels'))) {
    requires.push({
      id: 'requires-appliance-panels',
      field: 'appliancePanels',
      label: FIELD_LABEL.appliancePanels,
      message: 'Selected appliances will use the cabinet door surface in the room view.',
      kind: 'confirmation',
    });
  }

  if (isEnabled(candidate.woodTops) && (current.woodTops === 'None' || owns(proposal, 'woodTops'))) {
    requires.push({
      id: 'requires-wood-top-review',
      field: 'woodTops',
      label: FIELD_LABEL.woodTops,
      message: 'Wood top is included in this build; its final treatment stays a shop-confirmed detail.',
      kind: 'review',
    });
  }

  if (isEnabled(candidate.ledTrack) && (current.ledTrack === 'None' || owns(proposal, 'ledTrack'))) {
    requires.push({
      id: 'requires-light-rail',
      field: 'lightRail',
      label: FIELD_LABEL.lightRail,
      message: `The LED track routes below the selected ${candidate.lightRail}.`,
      kind: 'confirmation',
    });
  }

  if (isEnabled(candidate.plugMold) && (current.plugMold === 'None' || owns(proposal, 'plugMold'))) {
    requires.push({
      id: 'review-plug-mold',
      field: 'plugMold',
      label: FIELD_LABEL.plugMold,
      message: 'Plug molding is included as noted on drawings; its exact placement remains a drawing-confirmed detail.',
      kind: 'review',
    });
  }

  if (isEnabled(candidate.ledTrack) && isEnabled(candidate.plugMold)) {
    warnings.push({
      id: 'service-zone-review',
      field: 'plugMold',
      message: 'LED and plug molding are both selected below the uppers. Confirm their final locations in the drawings.',
    });
  }

  if (candidate.upperAction === 'Lift-up' && (current.upperAction !== 'Lift-up' || owns(proposal, 'hardware'))) {
    warnings.push({
      id: 'lift-up-hardware-review',
      field: 'upperAction',
      message: `Lift-up uppers retain ${candidate.hardware} hardware. Confirm clearance on the elevations.`,
    });
  }

  for (const field of Object.keys(proposal) as CompatibilityField[]) addChange(field);

  const next = allowed ? candidate : current;
  const hasSheetContent = changes.length > 1 || requires.length > 0 || removes.length > 0 || warnings.length > 0;

  return {
    allowed,
    next,
    proposal,
    changes,
    requires,
    removes,
    warnings,
    camera: cameraFor(proposal),
    needsConfirmation: allowed && hasSheetContent,
  };
}

export function hasCompatibilityChanges(result: CompatibilityResult): boolean {
  return result.changes.length > 0 || result.requires.length > 0 || result.removes.length > 0 || result.warnings.length > 0;
}

/**
 * Replays an external selection through the same one-change-at-a-time compatibility path used by
 * the interface. This keeps old links and local saves useful without allowing them to bypass the
 * current catalog, while preserving valid free-text job notes.
 */
export function normalizeSelection(value: unknown): Sel {
  const sanitized = sanitizeSelection(value);
  let current = { ...DEFAULT_SEL };

  for (const field of Object.keys(DEFAULT_SEL) as CompatibilityField[]) {
    if (current[field] === sanitized[field]) continue;
    const result = evaluateCompatibility(current, { [field]: sanitized[field] } as Partial<Sel>);
    if (result.allowed) current = result.next;
  }

  return current;
}
