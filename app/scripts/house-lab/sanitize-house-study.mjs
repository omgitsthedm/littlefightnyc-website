#!/usr/bin/env node
/**
 * Creates the public, anonymous House Explorer model from a stable design-study
 * snapshot. This script never changes the source project.
 *
 * Usage:
 *   node app/scripts/house-lab/sanitize-house-study.mjs /absolute/path/to/source.glb
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const output = resolve('app/public/examples/lab/concepts/house-explorer/assets/house-study.glb');
const evidence = resolve('.lifi/evidence/construction-labs/house-source.json');
const source = process.argv[2];

if (!source) {
  throw new Error('Pass the stable .glb snapshot to sanitize.');
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function readGlb(buffer) {
  if (buffer.readUInt32LE(0) !== 0x46546c67 || buffer.readUInt32LE(4) !== 2) {
    throw new Error('Expected a binary glTF 2.0 file.');
  }
  let offset = 12;
  const jsonLength = buffer.readUInt32LE(offset); offset += 4;
  if (buffer.readUInt32LE(offset) !== 0x4e4f534a) throw new Error('Missing JSON chunk.');
  offset += 4;
  const document = JSON.parse(buffer.subarray(offset, offset + jsonLength).toString('utf8'));
  offset += jsonLength;
  const binLength = buffer.readUInt32LE(offset); offset += 4;
  if (buffer.readUInt32LE(offset) !== 0x004e4942) throw new Error('Missing BIN chunk.');
  offset += 4;
  return { document, bin: buffer.subarray(offset, offset + binLength) };
}

function pad4(buffer, fill = 0x20) {
  const paddedLength = Math.ceil(buffer.length / 4) * 4;
  if (paddedLength === buffer.length) return buffer;
  return Buffer.concat([buffer, Buffer.alloc(paddedLength - buffer.length, fill)]);
}

function stripMetadata(value) {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach(stripMetadata);
    return;
  }
  delete value.name;
  delete value.extras;
  delete value.extensions;
  Object.values(value).forEach(stripMetadata);
}

function collectNodes(document) {
  const excludedRoots = new Set();
  document.nodes.forEach((node, index) => {
    if (/\b(site|road|parcel|soil|fence)\b/i.test(node.name || '')) excludedRoots.add(index);
  });
  const reachable = new Set();
  const visit = (index) => {
    if (excludedRoots.has(index) || reachable.has(index)) return;
    reachable.add(index);
    for (const child of document.nodes[index].children || []) visit(child);
  };
  for (const scene of document.scenes || []) {
    for (const root of scene.nodes || []) visit(root);
  }
  return reachable;
}

function mapUsed(items, used) {
  const map = new Map();
  const result = [];
  for (const oldIndex of [...used].sort((a, b) => a - b)) {
    map.set(oldIndex, result.length);
    result.push(items[oldIndex]);
  }
  return { map, result };
}

function packGlb(document, bin) {
  const json = pad4(Buffer.from(JSON.stringify(document)), 0x20);
  const binary = pad4(bin, 0);
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + json.length + 8 + binary.length, 8);
  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(json.length, 0);
  jsonHeader.writeUInt32LE(0x4e4f534a, 4);
  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(binary.length, 0);
  binHeader.writeUInt32LE(0x004e4942, 4);
  return Buffer.concat([header, jsonHeader, json, binHeader, binary]);
}

const sourceBuffer = await readFile(source);
const { document: original, bin } = readGlb(sourceBuffer);
const document = structuredClone(original);
const retainedNodes = collectNodes(document);
const usedMeshes = new Set();
for (const index of retainedNodes) if (Number.isInteger(document.nodes[index].mesh)) usedMeshes.add(document.nodes[index].mesh);

const meshData = mapUsed(document.meshes || [], usedMeshes);
const usedMaterials = new Set();
const usedAccessors = new Set();
for (const mesh of meshData.result) {
  for (const primitive of mesh.primitives || []) {
    if (Number.isInteger(primitive.material)) usedMaterials.add(primitive.material);
    if (Number.isInteger(primitive.indices)) usedAccessors.add(primitive.indices);
    Object.values(primitive.attributes || {}).forEach((index) => usedAccessors.add(index));
  }
}

const materialData = mapUsed(document.materials || [], usedMaterials);
const usedTextures = new Set();
for (const material of materialData.result) {
  const textureSlots = [
    material.pbrMetallicRoughness?.baseColorTexture,
    material.pbrMetallicRoughness?.metallicRoughnessTexture,
    material.normalTexture,
    material.occlusionTexture,
    material.emissiveTexture,
  ];
  textureSlots.forEach((slot) => Number.isInteger(slot?.index) && usedTextures.add(slot.index));
}

const textureData = mapUsed(document.textures || [], usedTextures);
const usedImages = new Set();
for (const texture of textureData.result) if (Number.isInteger(texture.source)) usedImages.add(texture.source);
const imageData = mapUsed(document.images || [], usedImages);
const accessorData = mapUsed(document.accessors || [], usedAccessors);
const usedBufferViews = new Set();
for (const accessor of accessorData.result) if (Number.isInteger(accessor.bufferView)) usedBufferViews.add(accessor.bufferView);
for (const image of imageData.result) if (Number.isInteger(image.bufferView)) usedBufferViews.add(image.bufferView);

const viewData = mapUsed(document.bufferViews || [], usedBufferViews);
const packedChunks = [];
let byteOffset = 0;
for (const view of viewData.result) {
  const originalOffset = view.byteOffset || 0;
  const sourceSlice = bin.subarray(originalOffset, originalOffset + view.byteLength);
  const alignment = byteOffset % 4;
  if (alignment) {
    const padding = Buffer.alloc(4 - alignment);
    packedChunks.push(padding);
    byteOffset += padding.length;
  }
  view.byteOffset = byteOffset;
  packedChunks.push(sourceSlice);
  byteOffset += sourceSlice.length;
}

const nodeData = mapUsed(document.nodes || [], retainedNodes);
for (const node of nodeData.result) {
  if (Number.isInteger(node.mesh)) node.mesh = meshData.map.get(node.mesh);
  if (node.children) node.children = node.children.filter((child) => nodeData.map.has(child)).map((child) => nodeData.map.get(child));
}
for (const scene of document.scenes || []) {
  scene.nodes = (scene.nodes || []).filter((node) => nodeData.map.has(node)).map((node) => nodeData.map.get(node));
}
for (const mesh of meshData.result) for (const primitive of mesh.primitives || []) {
  if (Number.isInteger(primitive.material)) primitive.material = materialData.map.get(primitive.material);
  if (Number.isInteger(primitive.indices)) primitive.indices = accessorData.map.get(primitive.indices);
  for (const [semantic, index] of Object.entries(primitive.attributes || {})) primitive.attributes[semantic] = accessorData.map.get(index);
}
for (const accessor of accessorData.result) if (Number.isInteger(accessor.bufferView)) accessor.bufferView = viewData.map.get(accessor.bufferView);
for (const image of imageData.result) if (Number.isInteger(image.bufferView)) image.bufferView = viewData.map.get(image.bufferView);
for (const texture of textureData.result) if (Number.isInteger(texture.source)) texture.source = imageData.map.get(texture.source);
for (const material of materialData.result) {
  const textureSlots = [
    material.pbrMetallicRoughness?.baseColorTexture,
    material.pbrMetallicRoughness?.metallicRoughnessTexture,
    material.normalTexture,
    material.occlusionTexture,
    material.emissiveTexture,
  ];
  textureSlots.forEach((slot) => { if (Number.isInteger(slot?.index)) slot.index = textureData.map.get(slot.index); });
}

document.asset = { version: '2.0', generator: 'Little Fight NYC House Explorer sanitizer' };
document.nodes = nodeData.result;
document.meshes = meshData.result;
document.materials = materialData.result;
document.textures = textureData.result;
document.images = imageData.result;
document.accessors = accessorData.result;
document.bufferViews = viewData.result;
document.buffers = [{ byteLength: byteOffset }];
delete document.extensions;
delete document.extensionsUsed;
delete document.extensionsRequired;
delete document.animations;
delete document.cameras;
stripMetadata(document);

const outputBuffer = packGlb(document, Buffer.concat(packedChunks));
await mkdir(dirname(output), { recursive: true });
await mkdir(dirname(evidence), { recursive: true });
await writeFile(output, outputBuffer);
await writeFile(evidence, JSON.stringify({
  schemaVersion: 1,
  artifact: 'house-explorer',
  sourceKind: 'stable-public-design-study-snapshot',
  sourceSha256: sha256(sourceBuffer),
  publicArtifactSha256: sha256(outputBuffer),
  sanitizer: 'app/scripts/house-lab/sanitize-house-study.mjs',
  publicBoundary: 'Removed site root, road, parcel, soil, fence, names, extras, extensions, and source metadata. Public model is illustrative only.',
}, null, 2) + '\n');

console.log(JSON.stringify({ output, bytes: outputBuffer.length, nodes: document.nodes.length, meshes: document.meshes.length }, null, 2));
