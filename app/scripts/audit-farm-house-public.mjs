/**
 * Farm House is a public, sanitized presentation derivative. This gate keeps
 * the website from quietly turning into a distribution point for source plans,
 * property records, location data, or a live upstream embed.
 *
 * It intentionally audits only the public Little Fight artifact. The original
 * project and its source material stay outside this repository and are never
 * opened by this check.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const conceptRoot = path.join(appRoot, "public", "examples", "lab", "concepts", "house-explorer");
const catalog = JSON.parse(await readFile(path.join(appRoot, "preview-content", "labs.json"), "utf8"));
const entry = catalog.find((lab) => lab.slug === "house-explorer");
assert.ok(entry, "Farm House must remain in the public Lab catalog");
assert.equal(entry.embedPath, "/examples/lab/concepts/house-explorer/", "Farm House keeps its same-origin working surface");
assert.equal(entry.sharePath, "/labs/house-explorer/", "Farm House keeps its stable share reader");

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  }));
  return nested.flat();
}

const files = await walk(conceptRoot);
const relative = files.map((file) => path.relative(conceptRoot, file).replaceAll(path.sep, "/"));
const disallowedDocument = /\.(?:pdf|dwg|dxf|rvt|skp|ifc|csv|tsv|xlsx?|docx?|pptx?|zip|7z|tar|gz)$/i;
const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");
assert.equal(relative.includes("assets/farm-house-public.json"), false,
  "Farm House provenance receipt is private source evidence, never a deployed visitor asset");

for (const name of relative) {
  assert.equal(disallowedDocument.test(name), false, `Farm House public artifact must not ship source/private document: ${name}`);
}

const textFiles = files.filter((file) => /\.(?:html|css|js|json|txt)$/i.test(file));
// Fixed digests let this public-repository check reject the confirmed private
// source identifiers without placing those identifiers in version control.
// They are intentionally narrow: ordinary architectural words and normal
// Three.js/Poly Haven attribution remain allowed.
const privateTokenDigests = new Set([
  "3ac37d301305cc811be4c12ae3c8ac680308d439e19e016b8fa9f94f398a64eb",
  "50c50440622e5b6f8535fa30a461269b3919e16ccab5eff679296b6f30a2c678",
  "d0f527cc33a3dc9d3b4c7d4089a47a9da2f61c710bbf320d818afcdb99e67a75",
  "ce6e13282288449c8cdf99efae908b1c8fd9c29bd5e8b6b24f19a57ccd862a07",
  "77ae33b38ebee5795953c7e78efe63d15d80f7d1ae769434f59be45c99a0859d",
  "f2f86917748f339c0f5628b576ad4e05bc9998ce20830b73013b01e38a97b384",
  "5bf11464a2147b9e3ff58ead9d98ff037d6cab0f550c356aebda5990c909cf67",
  "38a2359a88a2ee1e92af792da8c8396d1057a196d1b368a2b2414b5cb819f549",
  "3c1cd05a9cfbb14946eb8c6716ac876699084aa69d30384151b214bb02f9ed01",
]);
const sourceSheetId = /\bD\d{2}-P\d{3}\b/i;
const serializedLocationField = /(?:latitude|longitude|timezone)\s*:/i;
const internalConstructionNote = /source evidence remains inspectable|source lumber member|e1 symbol|source\/conflict-retained|fixture position traced from plan|plan symbol position traced|wall endpoints traced to dimensional grid|aerial imagery|aerial boundary|aerial alignment|aerial-traced|street view|reported by family|owner update|owner direction|owner correction|accepted original|source geometry|source barn|source shoulder|design-directed|supplied drone|entrance photo|field survey|right-of-way|clear-zone|no verified flow|original-house-gooseneck/i;

// Run the exact-identifier check across every deployed byte stream, not only
// text. That also catches EXIF-style metadata in a future image/model import.
for (const file of files) {
  const source = await readFile(file);
  const name = path.relative(conceptRoot, file).replaceAll(path.sep, "/");
  const lower = source.toString("latin1").toLowerCase();
  for (const token of lower.match(/[a-z0-9_.-]+/g) ?? []) {
    assert.equal(privateTokenDigests.has(sha256(Buffer.from(token))), false,
      `Farm House public artifact exposes a private source identifier in ${name}`);
  }
}

for (const file of textFiles) {
  const source = await readFile(file, "utf8");
  const name = path.relative(conceptRoot, file).replaceAll(path.sep, "/");
  assert.equal(sourceSheetId.test(source), false, `Farm House public artifact exposes a source-sheet identifier in ${name}`);
  assert.equal(serializedLocationField.test(source), false,
    `Farm House public artifact serializes private location data in ${name}`);
  assert.equal(internalConstructionNote.test(source), false,
    `Farm House public artifact exposes an internal construction note in ${name}`);
}

const html = await readFile(path.join(conceptRoot, "index.html"), "utf8");
assert.match(html, /\/examples\/lab\/assets\/lab-return\.js/, "Farm House must retain the shared in-card return bridge");
assert.match(html, /(?:<canvas|id=["'](?:scene|viewport)["'])/i, "Farm House direct route must expose a real viewer surface");
for (const collection of ["property", "inside", "find"]) {
  assert.match(html, new RegExp(`data-collection=["']${collection}["']`),
    `Farm House keeps its ${collection} collection entry`);
}
const insideRoot = path.join(conceptRoot, "inside");
for (const asset of ["index.html", "farm-house-inside.js", "farm-house-inside.css", "farm-house-inside-data.json"]) {
  await stat(path.join(insideRoot, asset));
}
const insideData = JSON.parse(await readFile(path.join(insideRoot, "farm-house-inside-data.json"), "utf8"));
assert.equal(insideData.schema, "farm-house-construction-safe-v2", "Farm House Inside uses the safe construction schema");
assert.equal(insideData.house?.walls?.length, 77, "Farm House Inside retains the approved wall model");
assert.equal(insideData.house?.rooms?.length, 29, "Farm House Inside retains the approved room model");
assert.equal(insideData.house?.fixtures?.length, 43, "Farm House Inside retains the approved fixture model");
assert.equal(insideData.electrical_devices?.length, 281, "Farm House Inside retains the approved electrical model");
assert.equal(insideData.trusses?.length, 60, "Farm House Inside retains the approved truss model");
assert.equal(insideData.truss_vectors?.length, 60, "Farm House Inside retains every approved truss profile");
const viewer = await readFile(path.join(conceptRoot, "farm-house-viewer.js"), "utf8");
// This is deliberately narrower than a generic search across bundled Three.js:
// it rejects only the serialized geolocation/source fields that the former
// solar-preset object carried into the public viewer.
assert.doesNotMatch(viewer, serializedLocationField,
  "Farm House viewer must use anonymous lighting presets, never serialized property geolocation");
assert.doesNotMatch(viewer, /NOAA general solar equations|geometric azimuth\/elevation/i,
  "Farm House viewer must not disclose source solar-reference methodology");
const credits = await readFile(path.join(conceptRoot, "CREDITS.txt"), "utf8");
assert.doesNotMatch(credits, /public boundary|source ledger|construction drawings|source documents/i,
  "Farm House public credits stay limited to ordinary visitor-facing attribution");

const glbs = relative.filter((name) => /\.glb$/i.test(name));
assert.equal(glbs.length, 1, `Farm House must ship one deliberate sanitized model asset, found ${glbs.length}`);
const modelPath = path.join(conceptRoot, glbs[0]);
await stat(modelPath);
// The redaction receipt is deliberately private source evidence. The deployed
// Lab contains only the working presentation and ordinary attribution.
const manifestPath = path.join(appRoot, "scripts", "property-explorer", "farm-house-public.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
assert.equal(manifest.schemaVersion, 2, "Farm House provenance manifest schema");
assert.equal(manifest.artifact, "farm-house-exterior", "Farm House provenance manifest artifact");
assert.equal(manifest.geometryPreserved, true, "Farm House viewer must preserve the approved model geometry");

function glbDocument(buffer) {
  assert.equal(buffer.readUInt32LE(0), 0x46546c67, "Farm House asset must be a GLB");
  assert.equal(buffer.readUInt32LE(4), 2, "Farm House asset must use glTF 2.0");
  let offset = 12;
  const jsonLength = buffer.readUInt32LE(offset); offset += 4;
  assert.equal(buffer.readUInt32LE(offset), 0x4e4f534a, "Farm House GLB needs a JSON chunk");
  offset += 4;
  const document = JSON.parse(buffer.subarray(offset, offset + jsonLength).toString("utf8"));
  offset += jsonLength;
  const binaryLength = buffer.readUInt32LE(offset); offset += 4;
  assert.equal(buffer.readUInt32LE(offset), 0x004e4942, "Farm House GLB needs a binary chunk");
  offset += 4;
  return { document, binary: buffer.subarray(offset, offset + binaryLength) };
}

const { document, binary } = glbDocument(await readFile(modelPath));
assert.deepEqual(document.extensions ?? [], [], "Farm House GLB must not retain source extensions");
assert.deepEqual(document.extensionsUsed ?? [], [], "Farm House GLB must not retain source extension declarations");
assert.deepEqual(document.extensionsRequired ?? [], [], "Farm House GLB must not retain source required extension declarations");
assert.equal(document.extras, undefined, "Farm House GLB root must not retain source extras");
const safeRuntimeNames = new Set(manifest.safeRuntimeNames ?? manifest.retainedSemanticGroups ?? []);
assert.ok(safeRuntimeNames.size > 0, "Farm House manifest declares only the semantic names needed by its public runtime");
for (const name of safeRuntimeNames) {
  assert.match(name, /^[a-z0-9 _.-]{1,80}$/i, `Farm House runtime name is not a safe semantic token: ${name}`);
  assert.doesNotMatch(name, /\b(?:address|map|record|guide|source|drawing|document|parcel|county|street|road|lane)\b/i,
    `Farm House runtime name exposes private provenance: ${name}`);
}
for (const group of ["nodes", "meshes", "materials", "textures", "images", "accessors", "bufferViews", "scenes", "samplers"]) {
  for (const item of document[group] ?? []) {
    assert.ok(!item.name || safeRuntimeNames.has(item.name), `Farm House GLB ${group} exposes a name outside the public runtime contract: ${item.name}`);
    assert.equal(item.extras, undefined, `Farm House GLB ${group} must not retain source extras`);
    assert.equal(item.extensions, undefined, `Farm House GLB ${group} must not retain source extensions`);
  }
}

assert.equal(manifest.geometryBufferSha256, sha256(binary), "Farm House public geometry buffer fingerprint");
assert.equal(manifest.publicArtifactSha256, sha256(await readFile(modelPath)), "Farm House public model fingerprint");
assert.match(manifest.sourceSha256 ?? "", /^[a-f0-9]{64}$/i, "Farm House source fingerprint is a non-reversible digest");
assert.match(manifest.sourceViewerSha256 ?? "", /^[a-f0-9]{64}$/i, "Farm House source viewer fingerprint is a non-reversible digest");
assert.match(manifest.sourceHtmlSha256 ?? "", /^[a-f0-9]{64}$/i, "Farm House source HTML fingerprint is a non-reversible digest");
for (const name of ["index.html", "farm-house-viewer.js", "farm-house-adapter.js", "CREDITS.txt"]) {
  assert.equal(manifest.artifactHashes?.[name], sha256(await readFile(path.join(conceptRoot, name))),
    `Farm House generated ${name} fingerprint`);
}
assert.deepEqual(manifest.counts?.source, manifest.counts?.public, "Farm House sanitizer must preserve model counts");
assert.deepEqual([...safeRuntimeNames].sort(), [...safeRuntimeNames], "Farm House public runtime names are deterministically ordered");
assert.ok(manifest.removedMetadata?.includes("extras") && manifest.removedMetadata?.includes("extensions"),
  "Farm House redaction manifest records its source metadata removal");
assert.match(manifest.publicBoundary ?? "", /No address, records, guide, research, source ledger, maps, construction documents, or source drawing files/i,
  "Farm House public boundary remains explicit");

console.log(`PASS Farm House public-artifact boundary: ${relative.length} public files, model metadata redacted, geometry fingerprint preserved, no source documents or upstream embed.`);
