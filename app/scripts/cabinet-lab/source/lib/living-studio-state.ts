import {
  evaluateCompatibility,
  type CompatibilityRequirement,
  type CompatibilityResult,
  type CompatibilityWarning,
} from './compatibility';
import { DEFAULT_SEL, type Sel } from './options';

/** Durable contract versions. Change only alongside an explicit persistence migration. */
export const LIVING_STUDIO_SCHEMA_VERSION = 2 as const;
/** @deprecated Use LIVING_STUDIO_SCHEMA_VERSION to distinguish schema from a snapshot revision. */
export const LIVING_STUDIO_SNAPSHOT_VERSION = LIVING_STUDIO_SCHEMA_VERSION;
export const LIVING_STUDIO_CATALOG_VERSION = 'living-cabinet-catalog-1' as const;
export const LIVING_STUDIO_RESOLVER_VERSION = 'compatibility-1' as const;
export const LIVING_STUDIO_ASSET_MANIFEST_VERSION = 'cabinet-showcase-assets-1' as const;
export const LIVING_STUDIO_CAMERA_BINDING_VERSION = 'cabinet-scene-1' as const;
export const LIVING_STUDIO_CANONICAL_SERIALIZATION_VERSION = 3 as const;

export type StudioField = keyof Sel;

/**
 * Room staging travels with the study but is not millwork: it never enters the MasterFile
 * catalog or the compatibility rules, and it carries no per-field review metadata.
 */
export type StudioStaging = {
  wallTone: 'warm' | 'limewash' | 'gallery';
  stoneFinish: 'polished' | 'honed';
  counterEdge: 'eased' | 'waterfall';
  glowTemp: '2700' | '3000' | '3500';
  plumbing: 'match' | 'stainless';
  /** The shop's signature move: a darker island grounding a lighter perimeter. */
  islandTone: 'match' | 'graphite' | 'harbor' | 'ink' | 'soot';
  seating: boolean;
};

export const DEFAULT_STAGING: StudioStaging = {
  wallTone: 'warm',
  stoneFinish: 'polished',
  counterEdge: 'eased',
  glowTemp: '3000',
  plumbing: 'match',
  islandTone: 'match',
  seating: true,
};

export const STAGING_FIELDS = Object.keys(DEFAULT_STAGING) as (keyof StudioStaging)[];

function orderedStaging(staging: StudioStaging): StudioStaging {
  return {
    wallTone: staging.wallTone,
    stoneFinish: staging.stoneFinish,
    counterEdge: staging.counterEdge,
    glowTemp: staging.glowTemp,
    plumbing: staging.plumbing,
    islandTone: staging.islandTone,
    seating: staging.seating,
  };
}
export type FieldAttention = 'unseen' | 'visited' | 'needs-review';
export type FieldValueOrigin =
  | 'starting-world-default'
  | 'user-choice'
  | 'dependency-transaction'
  | 'migration'
  | 'included-standard';
export type FieldReview = 'unconfirmed' | 'confirmed';

export type StudioSnapshot = {
  schemaVersion: typeof LIVING_STUDIO_SCHEMA_VERSION;
  catalogVersion: typeof LIVING_STUDIO_CATALOG_VERSION;
  resolverVersion: typeof LIVING_STUDIO_RESOLVER_VERSION;
  assetManifestVersion: typeof LIVING_STUDIO_ASSET_MANIFEST_VERSION;
  cameraBindingVersion: typeof LIVING_STUDIO_CAMERA_BINDING_VERSION;
  canonicalSerializationVersion: typeof LIVING_STUDIO_CANONICAL_SERIALIZATION_VERSION;
  /** Increments for every durable selection or metadata change. */
  revision: number;
  selection: Sel;
  /** The room around the millwork. Durable, so a shared or saved study restores the same room. */
  staging: StudioStaging;
  /** Visual prominence is intentionally independent from where a value came from. */
  attention: Record<StudioField, FieldAttention>;
  /** Whether a value was selected directly, supplied by a catalog rule, or restored. */
  valueOrigin: Record<StudioField, FieldValueOrigin>;
  /** A review is a separate decision state and is never inferred from a changed value. */
  review: Record<StudioField, FieldReview>;
};

export type StudioOutcome = {
  sourceLabel: 'Catalog compatibility';
  kind: 'ready' | 'review' | 'blocked';
  title: string;
  description: string;
};

export type StudioProposalClassification = {
  status: 'ready' | 'needs-review' | 'blocked';
  proposal: Partial<Sel>;
  compatibility: CompatibilityResult;
  outcome: StudioOutcome;
};

export type StudioTransaction = {
  before: StudioSnapshot;
  after: StudioSnapshot;
  classification?: StudioProposalClassification;
  label?: string;
};

export type StudioHistory = {
  past: readonly StudioTransaction[];
  present: StudioSnapshot;
  future: readonly StudioTransaction[];
};

export type StudioCommitResult = {
  history: StudioHistory;
  committed: boolean;
  transaction?: StudioTransaction;
};

const STUDIO_FIELDS = Object.keys(DEFAULT_SEL) as StudioField[];

export const STUDIO_FIELD_LABEL: Record<StudioField, string> = {
  layout: 'Kitchen layout', cabinetStyle: 'Cabinet style', door: 'Door family', species: 'Wood species',
  finish: 'Finish type', paintChip: 'Paint color', stainTone: 'Stain tone', sheen: 'Sheen',
  special: 'Finish feature', endsPanels: 'Finished ends', topTrim: 'Crown profile', toeKick: 'Toe kick',
  bottomTrim: 'Bottom trim', lightRail: 'Light rail', drawerBox: 'Drawer box', hardware: 'Hardware',
  hardwareFinish: 'Hardware finish', upperInsert: 'Upper door insert', islandEnd: 'Island end treatment',
  toeLighting: 'Island toe lighting', plugMold: 'Plug molding', ledTrack: 'Routed LED track',
  upperAction: 'Upper door action', rollouts: 'Rollout trays', cutleryInsert: 'Cutlery insert',
  trashPullout: 'Trash pullout', woodTops: 'Wood tops', apronSink: 'Apron sink', sinkHeight: 'Sink height',
  appliancePanels: 'Appliance panels', stonePanels: 'Wall or ceiling stone panels', panelName: 'Panel name',
  finishName: 'Finish name', edgebanding: 'Edgebanding', crownHeight: 'Crown height',
  ceilingHeight: 'Ceiling height', counterThickness: 'Counter thickness', installBeforeFlooring: 'Install before flooring',
  flooringThickness: 'Flooring thickness', drywallThickness: 'Drywall thickness', casingThickness: 'Casing thickness',
  deliveryDate: 'Delivery date', doorsOrderVsCnc: 'Doors order vs. CNC', finishMethod: 'Finish method',
};

export type StudioFieldMetaPatch = Partial<{
  attention: FieldAttention;
  valueOrigin: FieldValueOrigin;
  review: FieldReview;
}>;

function fieldRecord<T>(value: T): Record<StudioField, T> {
  return STUDIO_FIELDS.reduce((record, field) => {
    record[field] = value;
    return record;
  }, {} as Record<StudioField, T>);
}

function orderedSelection(selection: Sel): Sel {
  const ordered = {} as Record<StudioField, string>;
  for (const field of STUDIO_FIELDS) ordered[field] = selection[field];
  return ordered as Sel;
}

function orderedFieldRecord<T>(record: Record<StudioField, T>): Record<StudioField, T> {
  return STUDIO_FIELDS.reduce((ordered, field) => {
    ordered[field] = record[field];
    return ordered;
  }, {} as Record<StudioField, T>);
}

function hasOwn(object: object, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function fieldsFromRequirements(items: readonly CompatibilityRequirement[]): StudioField[] {
  return items.flatMap((item) => item.field ? [item.field] : []);
}

function fieldsFromWarnings(items: readonly CompatibilityWarning[]): StudioField[] {
  return items.flatMap((item) => item.field ? [item.field] : []);
}

function qualitativeOutcome(compatibility: CompatibilityResult): StudioOutcome {
  if (!compatibility.allowed) {
    return {
      sourceLabel: 'Catalog compatibility',
      kind: 'blocked',
      title: 'This combination needs another direction.',
      description: 'The catalog rules identify a conflict before the cabinet study changes.',
    };
  }

  if (compatibility.needsConfirmation || compatibility.requires.length > 0 || compatibility.warnings.length > 0) {
    return {
      sourceLabel: 'Catalog compatibility',
      kind: 'review',
      title: 'This direction is ready to review.',
      description: 'The catalog identifies related details that should be considered with this cabinet study.',
    };
  }

  return {
    sourceLabel: 'Catalog compatibility',
    kind: 'ready',
    title: 'This direction is ready to study.',
    description: 'The selected cabinet details can be viewed together in the room.',
  };
}

/** Creates a complete, versioned snapshot. It never runs compatibility or changes a value. */
export function createStudioSnapshot(
  selection: Sel = DEFAULT_SEL,
  staging: StudioStaging = DEFAULT_STAGING,
): StudioSnapshot {
  return {
    schemaVersion: LIVING_STUDIO_SCHEMA_VERSION,
    catalogVersion: LIVING_STUDIO_CATALOG_VERSION,
    resolverVersion: LIVING_STUDIO_RESOLVER_VERSION,
    assetManifestVersion: LIVING_STUDIO_ASSET_MANIFEST_VERSION,
    cameraBindingVersion: LIVING_STUDIO_CAMERA_BINDING_VERSION,
    canonicalSerializationVersion: LIVING_STUDIO_CANONICAL_SERIALIZATION_VERSION,
    revision: 0,
    selection: orderedSelection(selection),
    staging: orderedStaging(staging),
    attention: fieldRecord('unseen'),
    valueOrigin: fieldRecord('starting-world-default'),
    review: fieldRecord('unconfirmed'),
  };
}

/**
 * Serializes only durable snapshot data. Runtime UI state and timestamps are deliberately absent,
 * so the same cabinet study always produces the same string and fingerprint.
 *
 * `revision` is deliberately excluded, and that exclusion is the whole point of v3. It is an edit
 * counter, not part of what the kitchen *is*: choosing Soot directly and choosing Putty then Soot
 * leave every durable field identical and differ only in how many commits it took. With revision
 * in the hash those two produced lcs1-91db6b07 and lcs1-cb61b09c — two IDs for one kitchen, on a
 * string the customer sees on their saved sheet and its filename. Nothing reads revision for
 * behaviour; it stays on the snapshot and is still validated on parse.
 */
export function serializeStudioSnapshot(snapshot: StudioSnapshot): string {
  return JSON.stringify({
    schemaVersion: snapshot.schemaVersion,
    catalogVersion: snapshot.catalogVersion,
    resolverVersion: snapshot.resolverVersion,
    assetManifestVersion: snapshot.assetManifestVersion,
    cameraBindingVersion: snapshot.cameraBindingVersion,
    canonicalSerializationVersion: snapshot.canonicalSerializationVersion,
    selection: orderedSelection(snapshot.selection),
    staging: orderedStaging(snapshot.staging),
    attention: orderedFieldRecord(snapshot.attention),
    valueOrigin: orderedFieldRecord(snapshot.valueOrigin),
    review: orderedFieldRecord(snapshot.review),
  });
}

/** A small synchronous FNV-1a fingerprint for UI identity and persistence integrity checks. */
export function fingerprintStudioSnapshot(snapshot: StudioSnapshot): string {
  let hash = 0x811c9dc5;
  const source = serializeStudioSnapshot(snapshot);
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `lcs1-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

/** A small view model for UI/local-storage callers that need snapshot and fingerprint together. */
export function withStudioFingerprint(snapshot: StudioSnapshot): { snapshot: StudioSnapshot; fingerprint: string } {
  return { snapshot, fingerprint: fingerprintStudioSnapshot(snapshot) };
}

/** A pure proposal evaluation that delegates all catalog decisions to evaluateCompatibility. */
export function classifyStudioProposal(
  snapshot: StudioSnapshot,
  proposal: Partial<Sel>,
): StudioProposalClassification {
  const compatibility = evaluateCompatibility(snapshot.selection, proposal);
  return {
    status: !compatibility.allowed
      ? 'blocked'
      : compatibility.needsConfirmation || compatibility.requires.length > 0 || compatibility.warnings.length > 0
        ? 'needs-review'
        : 'ready',
    proposal: { ...proposal },
    compatibility,
    outcome: qualitativeOutcome(compatibility),
  };
}

function snapshotAfterCommit(
  current: StudioSnapshot,
  classification: StudioProposalClassification,
): StudioSnapshot {
  const { compatibility, proposal } = classification;
  const attention = { ...current.attention };
  const valueOrigin = { ...current.valueOrigin };
  const review = { ...current.review };
  const reviewFields = new Set<StudioField>([
    ...fieldsFromRequirements(compatibility.requires),
    ...fieldsFromWarnings(compatibility.warnings),
    ...compatibility.removes.flatMap((item) => item.field ? [item.field] : []),
  ]);

  for (const field of STUDIO_FIELDS) {
    const changed = current.selection[field] !== compatibility.next[field];
    if (!changed) continue;

    const directlyChosen = hasOwn(proposal, field);
    valueOrigin[field] = directlyChosen ? 'user-choice' : 'dependency-transaction';
    attention[field] = reviewFields.has(field) ? 'needs-review' : 'visited';
    review[field] = 'unconfirmed';
  }

  // A field can require review even when its value is unchanged (for example, a service-zone note).
  for (const field of reviewFields) {
    attention[field] = 'needs-review';
    review[field] = 'unconfirmed';
  }

  return {
    schemaVersion: LIVING_STUDIO_SCHEMA_VERSION,
    catalogVersion: LIVING_STUDIO_CATALOG_VERSION,
    resolverVersion: LIVING_STUDIO_RESOLVER_VERSION,
    assetManifestVersion: LIVING_STUDIO_ASSET_MANIFEST_VERSION,
    cameraBindingVersion: LIVING_STUDIO_CAMERA_BINDING_VERSION,
    canonicalSerializationVersion: LIVING_STUDIO_CANONICAL_SERIALIZATION_VERSION,
    revision: current.revision + 1,
    selection: orderedSelection(compatibility.next),
    staging: orderedStaging(current.staging),
    attention: orderedFieldRecord(attention),
    valueOrigin: orderedFieldRecord(valueOrigin),
    review: orderedFieldRecord(review),
  };
}

export function createStudioHistory(initial: StudioSnapshot = createStudioSnapshot()): StudioHistory {
  return { past: [], present: initial, future: [] };
}

/**
 * Applies a compatible proposal in one all-or-nothing history transaction. A new commit always
 * invalidates redo; a blocked proposal is a no-op so a caller may explain it without losing work.
 */
export function commitStudioProposal(
  history: StudioHistory,
  classification: StudioProposalClassification,
  label?: string,
): StudioCommitResult {
  if (classification.status === 'blocked') return { history, committed: false };

  const after = snapshotAfterCommit(history.present, classification);
  const transaction: StudioTransaction = { before: history.present, after, classification, label };
  return {
    committed: true,
    transaction,
    history: {
      past: [...history.past, transaction],
      present: after,
      future: [],
    },
  };
}

/**
 * Commits a room-staging change as one reversible transaction. Staging never consults the catalog
 * rules, so it cannot be blocked, but it travels in the same snapshot and the same undo stack.
 */
export function commitStudioStaging(
  history: StudioHistory,
  patch: Partial<StudioStaging>,
  label?: string,
): StudioCommitResult {
  const staging = orderedStaging({ ...history.present.staging, ...patch });
  const unchanged = STAGING_FIELDS.every((field) => staging[field] === history.present.staging[field]);
  if (unchanged) return { history, committed: false };

  const after: StudioSnapshot = { ...history.present, revision: history.present.revision + 1, staging };
  const transaction: StudioTransaction = { before: history.present, after, label };
  return {
    committed: true,
    transaction,
    history: { past: [...history.past, transaction], present: after, future: [] },
  };
}

/**
 * Adopts a whole snapshot — a saved comparison slot, or a shared link — as one reversible
 * transaction. Replacing the history outright would silently throw away everything the visitor
 * had done, with Undo greyed out and no way back.
 */
export function commitStudioSnapshot(
  history: StudioHistory,
  snapshot: StudioSnapshot,
  label?: string,
): StudioCommitResult {
  const after: StudioSnapshot = { ...snapshot, revision: history.present.revision + 1 };
  const transaction: StudioTransaction = { before: history.present, after, label };
  return {
    committed: true,
    transaction,
    history: { past: [...history.past, transaction], present: after, future: [] },
  };
}

/**
 * Restores the complete opening study without treating its coupled defaults as independent catalog
 * proposals. The reset remains one reversible history transaction and clears any redo branch.
 */
export function resetStudioHistory(history: StudioHistory, label = 'Starting kitchen'): StudioCommitResult {
  const opening = createStudioSnapshot();
  const differsFromOpening = STUDIO_FIELDS.some((field) => (
    history.present.selection[field] !== opening.selection[field]
    || history.present.attention[field] !== opening.attention[field]
    || history.present.valueOrigin[field] !== opening.valueOrigin[field]
    || history.present.review[field] !== opening.review[field]
 )) || STAGING_FIELDS.some((field) => history.present.staging[field] !== opening.staging[field]);

  if (!differsFromOpening) return { history, committed: false };

  const after: StudioSnapshot = { ...opening, revision: history.present.revision + 1 };
  const transaction: StudioTransaction = { before: history.present, after, label };
  return {
    committed: true,
    transaction,
    history: {
      past: [...history.past, transaction],
      present: after,
      future: [],
    },
  };
}

export function undoStudioHistory(history: StudioHistory): StudioHistory {
  const transaction = history.past.at(-1);
  if (!transaction) return history;
  return {
    past: history.past.slice(0, -1),
    present: transaction.before,
    future: [transaction, ...history.future],
  };
}

export function redoStudioHistory(history: StudioHistory): StudioHistory {
  const transaction = history.future[0];
  if (!transaction) return history;
  return {
    past: [...history.past, transaction],
    present: transaction.after,
    future: history.future.slice(1),
  };
}

/** Explicitly acknowledges only the fields a caller has presented for review. */
export function confirmStudioReview(snapshot: StudioSnapshot, fields: readonly StudioField[]): StudioSnapshot {
  return updateStudioFieldMeta(snapshot, fields, { attention: 'visited', review: 'confirmed' });
}

/** @deprecated Use confirmStudioReview; the older name is retained for a gentle UI migration. */
export const acknowledgeStudioReview = confirmStudioReview;

/**
 * Pure, selection-free field metadata update for section visitation and explicit review actions.
 * The returned snapshot remains canonical; call `withStudioFingerprint` when passing it to UI or
 * persistence state that displays its durable identity.
 */
export function updateStudioFieldMeta(
  snapshot: StudioSnapshot,
  fields: readonly StudioField[],
  patch: StudioFieldMetaPatch,
): StudioSnapshot {
  const attention = { ...snapshot.attention };
  const valueOrigin = { ...snapshot.valueOrigin };
  const review = { ...snapshot.review };
  let changed = false;
  for (const field of fields) {
    if (patch.attention && attention[field] !== patch.attention) {
      attention[field] = patch.attention;
      changed = true;
    }
    if (patch.valueOrigin && valueOrigin[field] !== patch.valueOrigin) {
      valueOrigin[field] = patch.valueOrigin;
      changed = true;
    }
    if (patch.review && review[field] !== patch.review) {
      review[field] = patch.review;
      changed = true;
    }
  }
  if (!changed) return snapshot;
  return {
    ...snapshot,
    revision: snapshot.revision + 1,
    attention: orderedFieldRecord(attention),
    valueOrigin: orderedFieldRecord(valueOrigin),
    review: orderedFieldRecord(review),
  };
}

/** Commits a metadata-only interaction as one reversible transaction and invalidates redo. */
export function commitStudioFieldMeta(
  history: StudioHistory,
  fields: readonly StudioField[],
  patch: StudioFieldMetaPatch,
  label?: string,
): StudioCommitResult {
  const after = updateStudioFieldMeta(history.present, fields, patch);
  const transaction: StudioTransaction = { before: history.present, after, label };
  return {
    committed: true,
    transaction,
    history: { past: [...history.past, transaction], present: after, future: [] },
  };
}
