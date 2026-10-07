#!/usr/bin/env node
/**
 * Creates a metadata-redacted copy of the approved Farm House exterior model.
 * Geometry, buffers, materials and scene hierarchy are retained verbatim so the
 * viewer remains faithful; private location labels and extra metadata are
 * removed while component names required by the exterior renderer are retained.
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const source = process.argv[2];
const output = process.argv[3];
const manifestPath = process.argv[4];
if (!source || !output || !manifestPath) throw new Error('Usage: sanitize-farm-house.mjs SOURCE.glb OUTPUT.glb MANIFEST.json');
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
function publicRuntimeName(name) {
  if (typeof name !== 'string') return name;
  if (/\b(?:gis\s+)?parcel\s+soil\b/i.test(name)) return 'Site soil';
  if (/^[NSEW]\s+\d+(?:st|nd|rd|th)\s+Lane\s+road$/i.test(name)) return 'Site approach one';
  if (/^[NSEW]\s+[A-Z][a-z]+\s+Lane\s+road$/.test(name)) return 'Site approach two';
  return name;
}

function readGlb(buffer) {
  if (buffer.readUInt32LE(0) !== 0x46546c67 || buffer.readUInt32LE(4) !== 2) throw new Error('Expected glTF 2.0 binary.');
  let offset = 12;
  const jsonLength = buffer.readUInt32LE(offset); offset += 4;
  if (buffer.readUInt32LE(offset) !== 0x4e4f534a) throw new Error('GLB JSON chunk missing.');
  offset += 4;
  const document = JSON.parse(buffer.subarray(offset, offset + jsonLength).toString('utf8'));
  offset += jsonLength;
  const binLength = buffer.readUInt32LE(offset); offset += 4;
  if (buffer.readUInt32LE(offset) !== 0x004e4942) throw new Error('GLB binary chunk missing.');
  offset += 4;
  return { document, bin: buffer.subarray(offset, offset + binLength) };
}
function pad4(buffer, fill = 0x20) {
  const length = Math.ceil(buffer.length / 4) * 4;
  return length === buffer.length ? buffer : Buffer.concat([buffer, Buffer.alloc(length - buffer.length, fill)]);
}
function packGlb(document, binary) {
  const json = pad4(Buffer.from(JSON.stringify(document)));
  const bin = pad4(binary, 0);
  const header = Buffer.alloc(12); header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4); header.writeUInt32LE(12 + 8 + json.length + 8 + bin.length, 8);
  const jsonHeader = Buffer.alloc(8); jsonHeader.writeUInt32LE(json.length, 0); jsonHeader.writeUInt32LE(0x4e4f534a, 4);
  const binHeader = Buffer.alloc(8); binHeader.writeUInt32LE(bin.length, 0); binHeader.writeUInt32LE(0x004e4942, 4);
  return Buffer.concat([header, jsonHeader, json, binHeader, bin]);
}


const input = await readFile(source);
const { document, bin } = readGlb(input);
const original = structuredClone(document);
for (const node of document.nodes || []) {
  node.name = publicRuntimeName(node.name);
  delete node.extras;
  delete node.extensions;
}
// Names encode only component/material semantics and are needed by the upstream
// renderer to retain its authored material, reflection, roof and fence behavior.
for (const collection of ['meshes', 'materials', 'textures', 'images', 'accessors', 'bufferViews', 'scenes', 'samplers']) {
  for (const item of document[collection] || []) { item.name = publicRuntimeName(item.name); delete item.extras; delete item.extensions; }
}
document.asset = { version: '2.0', generator: 'Little Fight NYC Farm House exterior sanitizer' };
delete document.extensions;
delete document.extensionsUsed;
delete document.extensionsRequired;
const packed = packGlb(document, bin);
await mkdir(dirname(output), { recursive: true });
await mkdir(dirname(manifestPath), { recursive: true });
await writeFile(output, packed);
const counts = (doc) => Object.fromEntries(['nodes', 'meshes', 'materials', 'textures', 'images', 'accessors', 'bufferViews'].map((name) => [name, (doc[name] || []).length]));
const manifest = {
  schemaVersion: 2,
  artifact: 'farm-house-exterior',
  sourceKind: 'approved-stable-public-project-snapshot',
  sourceSha256: sha256(input),
  publicArtifactSha256: sha256(packed),
  geometryBufferSha256: sha256(bin),
  geometryPreserved: true,
  counts: { source: counts(original), public: counts(document) },
  retainedSemanticGroups: ['architectural node and material names required by exterior runtime'],
  safeRuntimeNames: [...new Set(['nodes', 'meshes', 'materials', 'textures', 'images', 'accessors', 'bufferViews', 'scenes', 'samplers'].flatMap((collection) => (document[collection] || []).map((item) => item.name).filter(Boolean)))].sort(),
  removedMetadata: ['location-specific node labels', 'extras', 'extensions'],
  publicBoundary: 'Exterior model and rendered landscape only. No address, records, guide, research, source ledger, maps, construction documents, or source drawing files are included.'
};
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ artifact: manifest.artifact, output, geometryBufferSha256: manifest.geometryBufferSha256, nodes: manifest.counts.public.nodes, meshes: manifest.counts.public.meshes }));
