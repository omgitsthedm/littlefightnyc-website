import {
  LIVING_STUDIO_ASSET_MANIFEST_VERSION,
  LIVING_STUDIO_CAMERA_BINDING_VERSION,
  LIVING_STUDIO_CANONICAL_SERIALIZATION_VERSION,
  LIVING_STUDIO_CATALOG_VERSION,
  LIVING_STUDIO_RESOLVER_VERSION,
  LIVING_STUDIO_SCHEMA_VERSION,
  DEFAULT_STAGING,
  createStudioSnapshot,
  fingerprintStudioSnapshot,
  serializeStudioSnapshot,
  type FieldAttention,
  type FieldReview,
  type FieldValueOrigin,
  type StudioField,
  type StudioSnapshot,
  type StudioStaging,
} from './living-studio-state';
import { DEFAULT_SEL, sanitizeSelection, type Sel } from './options';

const STORAGE_KIND = 'living-cabinet-studio' as const;
const STUDIO_FIELDS = Object.keys(DEFAULT_SEL) as StudioField[];
const ATTENTION: readonly FieldAttention[] = ['unseen', 'visited', 'needs-review'];
const ORIGIN: readonly FieldValueOrigin[] = [
  'starting-world-default', 'user-choice', 'dependency-transaction', 'migration', 'included-standard',
];
const REVIEW: readonly FieldReview[] = ['unconfirmed', 'confirmed'];
const STAGING_VALUES: { [K in keyof StudioStaging]: readonly StudioStaging[K][] } = {
  wallTone: ['warm', 'limewash', 'gallery'],
  stoneFinish: ['polished', 'honed'],
  counterEdge: ['eased', 'waterfall'],
  glowTemp: ['2700', '3000', '3500'],
  plumbing: ['match', 'stainless'],
  islandTone: ['match', 'graphite', 'harbor', 'ink', 'soot'],
  seating: [true, false],
};
const STAGING_FIELDS = Object.keys(DEFAULT_STAGING) as (keyof StudioStaging)[];

type StoredStudioSnapshot = {
  kind: typeof STORAGE_KIND;
  fingerprint: string;
  snapshot: StudioSnapshot;
};

export type StudioPersistenceParseResult =
  | { kind: 'exact'; snapshot: StudioSnapshot; fingerprint: string }
  | { kind: 'recovery'; reason: 'unsupported-version' | 'invalid-snapshot' | 'fingerprint-mismatch'; raw: string }
  | { kind: 'invalid'; reason: 'empty' | 'malformed-json' | 'unrecognized-record'; raw?: string };

export type RecoveryAcceptance = { accepted: true };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasExactFields(value: Record<string, unknown>): boolean {
  const keys = Object.keys(value).sort();
  const expected = [...STUDIO_FIELDS].sort();
  return keys.length === expected.length && keys.every((key, index) => key === expected[index]);
}

function isStringRecord(value: unknown): value is Record<StudioField, string> {
  return isObject(value) && hasExactFields(value) && STUDIO_FIELDS.every((field) => typeof value[field] === 'string');
}

function isEnumRecord<T extends string>(value: unknown, allowed: readonly T[]): value is Record<StudioField, T> {
  return isObject(value) && hasExactFields(value) && STUDIO_FIELDS.every((field) => typeof value[field] === 'string' && allowed.includes(value[field] as T));
}

function isStaging(value: unknown): value is StudioStaging {
  if (!isObject(value)) return false;
  const keys = Object.keys(value).sort();
  const expected = [...STAGING_FIELDS].sort();
  if (keys.length !== expected.length || !keys.every((key, index) => key === expected[index])) return false;
  return STAGING_FIELDS.every((field) => (STAGING_VALUES[field] as readonly unknown[]).includes(value[field]));
}

function asExactSnapshot(value: unknown): StudioSnapshot | undefined {
  if (!isObject(value) || value.schemaVersion !== LIVING_STUDIO_SCHEMA_VERSION) return undefined;
  if (value.catalogVersion !== LIVING_STUDIO_CATALOG_VERSION) return undefined;
  if (value.resolverVersion !== LIVING_STUDIO_RESOLVER_VERSION) return undefined;
  if (value.assetManifestVersion !== LIVING_STUDIO_ASSET_MANIFEST_VERSION) return undefined;
  if (value.cameraBindingVersion !== LIVING_STUDIO_CAMERA_BINDING_VERSION) return undefined;
  if (value.canonicalSerializationVersion !== LIVING_STUDIO_CANONICAL_SERIALIZATION_VERSION) return undefined;
  const revision = value.revision;
  if (typeof revision !== 'number' || !Number.isSafeInteger(revision) || revision < 0) return undefined;
  const selection = value.selection;
  if (!isStringRecord(selection)) return undefined;
  // sanitizeSelection is used only as a comparator here. A different result is rejected rather
  // than adopted, so a stale catalog value can never be silently turned into a default.
  const catalogSelection = sanitizeSelection(selection);
  if (!STUDIO_FIELDS.every((field) => catalogSelection[field] === selection[field])) return undefined;
  if (!isStaging(value.staging)) return undefined;
  if (!isEnumRecord(value.attention, ATTENTION)) return undefined;
  if (!isEnumRecord(value.valueOrigin, ORIGIN)) return undefined;
  if (!isEnumRecord(value.review, REVIEW)) return undefined;
  return {
    schemaVersion: LIVING_STUDIO_SCHEMA_VERSION,
    catalogVersion: LIVING_STUDIO_CATALOG_VERSION,
    resolverVersion: LIVING_STUDIO_RESOLVER_VERSION,
    assetManifestVersion: LIVING_STUDIO_ASSET_MANIFEST_VERSION,
    cameraBindingVersion: LIVING_STUDIO_CAMERA_BINDING_VERSION,
    canonicalSerializationVersion: LIVING_STUDIO_CANONICAL_SERIALIZATION_VERSION,
    revision,
    selection: value.selection as Sel,
    staging: value.staging,
    attention: value.attention,
    valueOrigin: value.valueOrigin,
    review: value.review,
  };
}

/** Stable local-storage envelope. It contains no UI runtime state or timestamps. */
export function encodeStudioSnapshot(snapshot: StudioSnapshot): string {
  const record: StoredStudioSnapshot = {
    kind: STORAGE_KIND,
    fingerprint: fingerprintStudioSnapshot(snapshot),
    snapshot,
  };
  return JSON.stringify(record);
}

/**
 * Parses saved data without repairing it. Only a fully version-matched and fingerprint-matched
 * record is exact; older or semantically broken records demand an explicit recovery decision.
 */
export function parseLocalStudioSnapshot(raw: string | null | undefined): StudioPersistenceParseResult {
  if (!raw) return { kind: 'invalid', reason: 'empty' };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { kind: 'invalid', reason: 'malformed-json', raw };
  }

  if (!isObject(parsed) || parsed.kind !== STORAGE_KIND || !('snapshot' in parsed)) {
    return { kind: 'invalid', reason: 'unrecognized-record', raw };
  }
  if (!isObject(parsed.snapshot) || parsed.snapshot.schemaVersion !== LIVING_STUDIO_SCHEMA_VERSION) {
    return { kind: 'recovery', reason: 'unsupported-version', raw };
  }
  if (typeof parsed.fingerprint !== 'string') return { kind: 'recovery', reason: 'invalid-snapshot', raw };

  const snapshot = asExactSnapshot(parsed.snapshot);
  if (!snapshot) return { kind: 'recovery', reason: 'invalid-snapshot', raw };
  if (parsed.fingerprint !== fingerprintStudioSnapshot(snapshot)) {
    return { kind: 'recovery', reason: 'fingerprint-mismatch', raw };
  }
  return { kind: 'exact', snapshot, fingerprint: parsed.fingerprint };
}

/**
 * Recovery is opt-in at the call site. The acceptance token makes a caller state the user's
 * affirmative action instead of silently replacing an unusable saved study with defaults.
 */
export function createAcceptedRecoveredSnapshot(
  selection: Sel = DEFAULT_SEL,
  acceptance: RecoveryAcceptance,
): StudioSnapshot {
  if (acceptance.accepted !== true) throw new Error('Recovered snapshots require explicit acceptance.');
  const snapshot = createStudioSnapshot(selection);
  return {
    ...snapshot,
    valueOrigin: STUDIO_FIELDS.reduce((record, field) => {
      record[field] = 'migration';
      return record;
    }, {} as Record<StudioField, FieldValueOrigin>),
  };
}

/** Exposed for diagnostics; canonical content intentionally excludes runtime persistence fields. */
export function canonicalStoredSnapshot(snapshot: StudioSnapshot): string {
  return serializeStudioSnapshot(snapshot);
}

// ————— share links —————
// The uncompressed record is ~5.4 kB of extremely repetitive JSON — 44 fields repeated three
// times over for attention, valueOrigin and review — which base64 turns into a 7,274-character
// URL. Measured on a real study. That is past what a `mailto:` body survives in Outlook and
// Apple Mail, past what most chat apps will linkify, and absurd to look at. Deflating it first
// keeps every field, including the provenance the fingerprint covers, and gets the link back to
// a sane length. `z.` is deflated, `u.` is not, and a payload with neither prefix is a legacy
// link from before this codec and still opens.

const SHARE_DEFLATED = 'z.';
const SHARE_PLAIN = 'u.';

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  // chunked because String.fromCharCode(...bytes) blows the argument limit past ~110k
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): Uint8Array {
  const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

async function through(stream: ReadableStream<Uint8Array>): Promise<Uint8Array> {
  const chunks: Uint8Array[] = [];
  const reader = stream.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { out.set(chunk, offset); offset += chunk.length; }
  return out;
}

/** Encodes a snapshot for a URL. Falls back to plain base64 where CompressionStream is absent. */
export async function encodeStudioShare(snapshot: StudioSnapshot): Promise<string> {
  const json = new TextEncoder().encode(encodeStudioSnapshot(snapshot));
  if (typeof CompressionStream === 'undefined') return SHARE_PLAIN + toBase64Url(json);
  try {
    const stream = new Blob([json as BlobPart]).stream().pipeThrough(new CompressionStream('deflate-raw'));
    return SHARE_DEFLATED + toBase64Url(await through(stream));
  } catch {
    return SHARE_PLAIN + toBase64Url(json);
  }
}

/** Reads any share payload this app has ever produced, and refuses anything it cannot verify. */
export async function decodeStudioShare(payload: string): Promise<StudioPersistenceParseResult> {
  try {
    if (payload.startsWith(SHARE_DEFLATED)) {
      if (typeof DecompressionStream === 'undefined') return { kind: 'invalid', reason: 'unrecognized-record', raw: payload };
      const bytes = fromBase64Url(payload.slice(SHARE_DEFLATED.length));
      const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      return parseLocalStudioSnapshot(new TextDecoder().decode(await through(stream)));
    }
    const body = payload.startsWith(SHARE_PLAIN) ? payload.slice(SHARE_PLAIN.length) : payload;
    return parseLocalStudioSnapshot(new TextDecoder().decode(fromBase64Url(body)));
  } catch {
    return { kind: 'invalid', reason: 'malformed-json', raw: payload };
  }
}
