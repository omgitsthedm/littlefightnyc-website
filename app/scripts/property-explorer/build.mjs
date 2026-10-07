import { createHash } from 'node:crypto';
import { build as esbuild } from 'esbuild';
import { parse } from 'acorn';
import { execFileSync } from 'node:child_process';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(fileURLToPath(new URL('.', import.meta.url)));
const output = resolve(packageRoot, '../../public/examples/lab/concepts/house-explorer');
const privateManifest = resolve(packageRoot, 'farm-house-public.json');
const insideSource = resolve(packageRoot, 'inside');
const privateEvidence = resolve(packageRoot, '../../../.lifi/evidence/construction-labs/farm-house-exterior.json');
const sourceRoot = process.env.FARM_HOUSE_SOURCE;
const check = process.argv.includes('--check');
const pinnedSourceSha256 = '6e00ec598ce2158f2367ceec0ed441265539023a674f57be0f45e6073c843a42';
const pinnedViewerSha256 = '0da0ca8d126e78ff62593d9a8343a916a65a8da5df0836e98b77f5ecf8d86ec0';
const pinnedHtmlSha256 = '34f7f0910a2f04783f0cea124f3cd4b0883afb35d9805152262c0a9cf64ce951';
const forbidden = /(?:google\.com\/maps|source ledger|parcel|latitude|longitude|timezone|America\/Phoenix)/i;
const hash = (value) => createHash('sha256').update(value).digest('hex');
const cleanScriptWhitespace = (value) => value.replace(/[ \t]+$/gm, '').replace(/^[ \t]+/gm, (indent) => indent.replaceAll('\t', '  '));

function assertSafe(text, label) {
  if (forbidden.test(text)) throw new Error(`${label} retained a private/source-only reference`);
}
function replaceAllRequired(value, from, to) {
  const count = value.split(from).length - 1;
  return { value: value.split(from).join(to), count };
}
async function readPinnedSnapshotFile(root, expectedHash) {
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const contents = await readFile(resolve(root, entry.name));
    if (hash(contents) === expectedHash) return { name: entry.name, contents };
  }
  throw new Error(`The approved Farm House snapshot is missing pinned artifact ${expectedHash}.`);
}
function privateRoadTerms(modelBuffer) {
  let offset = 12;
  const jsonLength = modelBuffer.readUInt32LE(offset); offset += 8;
  const document = JSON.parse(modelBuffer.subarray(offset, offset + jsonLength).toString('utf8'));
  return [...new Set((document.nodes ?? []).map((node) => node.name).filter((name) => /^[NSEW]\s+(?:\d+(?:st|nd|rd|th)|[A-Z][a-z]+)\s+Lane\s+road$/.test(name)).flatMap((name) => name.match(/\b(?:\d+(?:st|nd|rd|th)|[A-Z][a-z]+)\b/g) ?? []))];
}
async function insideArtifacts() {
  const bundle = await esbuild({
    entryPoints: [resolve(insideSource, 'app.js')],
    bundle: true,
    format: 'esm',
    target: ['es2022'],
    minify: true,
    legalComments: 'none',
    write: false,
    outfile: resolve(output, 'inside/farm-house-inside.js'),
  });
  const script = bundle.outputFiles.find((file) => file.path.endsWith('farm-house-inside.js'));
  if (!script) throw new Error('Farm House Inside bundle was not emitted.');
  const [html, css, data] = await Promise.all([
    readFile(resolve(insideSource, 'index.html'), 'utf8'),
    readFile(resolve(insideSource, 'style.css'), 'utf8'),
    readFile(resolve(insideSource, 'farm-house-inside-data.json')),
  ]);
  if (!html.includes('farm-house-inside.js') || !css.includes('/assets/mineral/atkinson-hyperlegible-next-latin.woff2')) throw new Error('Farm House Inside source contract is incomplete.');
  return new Map([
    ['inside/index.html', Buffer.from(html.replace(/\s*<script type="module" src="\.\/enhancements\.js"><\/script>/, ''))],
    ['inside/farm-house-inside.css', Buffer.from(css)],
    ['inside/farm-house-inside.js', Buffer.from(cleanScriptWhitespace(Buffer.from(script.contents).toString('utf8')))],
    ['inside/farm-house-inside-data.json', data],
  ]);
}
async function writeArtifacts(artifacts) {
  for (const [relative, contents] of artifacts) {
    const target = resolve(output, relative);
    await mkdir(resolve(target, '..'), { recursive: true });
    await writeFile(target, contents);
  }
}
function removeProvenance(viewer) {
  const fields = new Set(['source', 'evidence', 'placement', 'status', 'scopeNote', 'rockExtent']);
  const edits = [];
  const pending = [parse(viewer, { ecmaVersion: 'latest' })];
  while (pending.length) {
    const node = pending.pop();
    if (!node || typeof node !== 'object') continue;
    if (node.type === 'Property' && !node.computed) {
      const key = node.key.name ?? node.key.value;
      if (fields.has(key) && node.value.type === 'Literal' && typeof node.value.value === 'string') edits.push([node.value.start, node.value.end, '""']);
      else if (key === 'sourceParts') { edits.push([node.value.start, node.value.end, '[]']); continue; }
    }
    if (node.type === 'AssignmentExpression' && node.left.type === 'MemberExpression' && !node.left.computed && node.right.type === 'Literal' && typeof node.right.value === 'string') {
      const key = node.left.property.name;
      if (fields.has(key) || ['roadContext', 'gateFixtureStyle'].includes(key)) edits.push([node.right.start, node.right.end, '""']);
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) pending.push(...value);
      else if (value && typeof value === 'object') pending.push(value);
    }
  }
  for (const [start, end, replacement] of edits.sort((a, b) => b[0] - a[0])) viewer = viewer.slice(0, start) + replacement + viewer.slice(end);
  return viewer;
}
function safeViewer(source, modelFileName, privateTerms) {
  let viewer = source;
  const substitutions = [
    [modelFileName, 'assets/farm-house.glb', 'model URL'],
    ['Farm-House-Materials/', 'assets/materials/', 'material directory'],
  ];
  const applied = new Map();
  for (const [from, to, label] of substitutions) { const result = replaceAllRequired(viewer, from, to); viewer = result.value; applied.set(label, result.count); }
  for (const label of ['model URL', 'material directory']) if (!applied.get(label)) throw new Error(`Pinned Farm House viewer changed: expected ${label}.`);
  const nestedRoute = /[A-Za-z-]+\/\?embed=1&collection=/g;
  const nestedRouteCount = (viewer.match(nestedRoute) || []).length;
  viewer = viewer.replace(nestedRoute, './inside/?collection=');
  if (nestedRouteCount !== 1) throw new Error('Pinned Farm House viewer did not contain one nested collection route.');
  const collectionReload = /K4\?K4\.contentWindow\.postMessage\(\{type:"farm-house-collection",collection:s\},location\.origin\):/;
  if (!collectionReload.test(viewer)) throw new Error('Pinned Farm House viewer did not contain the nested collection switch.');
  viewer = viewer.replace(collectionReload, 'K4?(K4.src="./inside/?collection="+s,K4.focus()):');
  // Location names are discovered and normalized by form, never retained in the repository.
  const address = /\b\d{4,6}\s+[NSEW]\s+\d+(?:st|nd|rd|th)\s+Ln\b/gi;
  const numberedRoad = /\b[NSEW]\s+\d+(?:st|nd|rd|th)\s+Lane(?:\s+road)?\b/gi;
  const namedRoad = /\b[NSEW]\s+[A-Z][a-z]+\s+Lane\s+road\b/g;
  const mapUrls = /https:\/\/www\.google\.com\/maps\/[^"'`\s]+/g;
  const internalAsset = /Farm-House-[A-Za-z-]+assets\/[^"'`\s]+/g;
  const locationCounts = { address: (viewer.match(address) || []).length, numberedRoad: (viewer.match(numberedRoad) || []).length, namedRoad: (viewer.match(namedRoad) || []).length, map: (viewer.match(mapUrls) || []).length, internalAsset: (viewer.match(internalAsset) || []).length };
  viewer = viewer.replace(address, 'Farm House').replace(numberedRoad, 'Site approach one').replace(namedRoad, 'Site approach two').replace(mapUrls, 'about:blank').replace(internalAsset, '').replace(/\bparcel\b/gi, 'site');
  viewer = viewer.replaceAll('owner-confirmed', 'verified').replaceAll('Owner-confirmed', 'Verified').replaceAll('owner-directed', 'design-directed').replaceAll('Owner-directed', 'Design-directed');
  for (const token of privateTerms) viewer = viewer.split(token).join('Site');
  viewer = viewer.replace(/"[^"]*(?:\\xB7|·) Photo reference"/g, '"Project · Photo reference"');
  if (!locationCounts.address || !locationCounts.numberedRoad || !locationCounts.namedRoad || locationCounts.map < 1 || !locationCounts.internalAsset) throw new Error('Pinned Farm House viewer changed: expected private location references.');
  const solarPrefix = /var s6=\{date:[^,]*,timezone:[^,]*,latitude:[^,]*,longitude:[^,]*,method:"[^"]*",source:"[^"]*",presets:/;
  if (!solarPrefix.test(viewer)) throw new Error('Pinned Farm House viewer did not contain the expected solar metadata block.');
  viewer = viewer.replace(solarPrefix, 'var s6={presets:');
  viewer = viewer.replace('source:"assets/farm-house.glb",', '');
  // The preserved renderer also carries working notes for its original private
  // project. They are neither needed for rendering nor appropriate for this
  // public presentation. Keep the object shape so optional upstream reads
  // remain harmless, but blank every provenance-bearing string and collection.
  viewer = removeProvenance(viewer);
  viewer = viewer.replace(/Original grounds (?:\\xB7|·) design-directed finished landscape/g, 'Farm House grounds');
  viewer = viewer.replace(/confidence:"design-directed"/g, 'confidence:"illustrative"');
  // View labels are visible in the exterior UI. Preserve the useful location
  // label while removing the private confidence/provenance suffix.
  viewer = viewer.replace(/(label:"(?:\\.|[^"\\])*?)(?:\\xB7|·)\s*(?=(?:\\.|[^"\\])*(?:estimated|inferred|traced|aerial|source|owner|accepted|original|design-directed|photo|street)(?:\\.|[^"\\])*")(?:\\.|[^"\\])*"/gi, '$1"');
  const privateNarrative = /(?:aerial(?:[-\s]+(?:imagery|boundary|alignment|traced))|street\s+view|reported\s+by\s+family|owner(?:[-\s]+(?:update|direction|correction))|accepted(?:\s+original)?|source\s+(?:geometry|barn|shoulder)|design-directed|supplied\s+drone|entrance\s+photo|field\s+survey|right-of-way|clear-zone|no\s+verified\s+flow|original-house-gooseneck)/i;
  if (privateNarrative.test(viewer)) throw new Error('Pinned Farm House viewer retained a private provenance note.');
  const guideBinding = /document\.getElementById\("house-info"\)\.addEventListener\("click",\(\)=>\{try\{.*?\}catch\{\}\}\);function Vr/s;
  if (!guideBinding.test(viewer)) throw new Error('Pinned Farm House viewer did not contain the guide binding.');
  viewer = viewer.replace(guideBinding, 'function Vr');
  const collectionMessage = /window\.addEventListener\("message",s=>\{s\.origin!==location\.origin\|\|s\.source!==K4\?\.contentWindow\|\|s\.data\?\.type==="farm-house-property"&&Wr\("property"\)\}\);/;
  if (!collectionMessage.test(viewer)) throw new Error('Pinned Farm House viewer did not contain the collection message bridge.');
  viewer = viewer.replace(collectionMessage, 'window.addEventListener("message",s=>{if(s.origin!==location.origin||s.source!==K4?.contentWindow)return;if(s.data?.type==="farm-house-property"){Wr("property");return}if(s.data?.type==="farm-house-exit"){if(window.parent!==window)window.parent.postMessage({type:"lf:lab-exit",version:1},location.origin);else location.assign("/examples/lab/#showroom")}});');
  viewer = viewer.replace('Farm House construction and service collections', 'Farm House Inside and Find');
  const fallback = /function bc\(s\)\{.*?\}new En\(\)\.load/s;
  if (!fallback.test(viewer)) throw new Error('Pinned Farm House viewer did not contain the expected fallback handler.');
  viewer = viewer.replace(fallback, 'function bc(s){L9.textContent=s}new En().load');
  const exteriorApi = 'chooseLighting:Ge};})()';
  if (!viewer.includes(exteriorApi)) throw new Error('Pinned Farm House viewer did not contain the exterior API.');
  viewer = viewer.replace(exteriorApi, 'chooseLighting:Ge,chooseGarden:Bg};})()');
  try { new Function(viewer); } catch (error) { throw new Error(`Farm House sanitized script syntax: ${error.message}`); }
  assertSafe(viewer, 'farm-house-viewer.js');
  return cleanScriptWhitespace(viewer);
}
function safeHtml(source) {
  let html = source;
  html = html.replace('<title>Farm House · Explore the property</title>', '<title>Farm House · Little Fight NYC</title>');
  html = html.replace('Explore the property</p>', 'Interactive property study of the house, barn, and grounds.</p>');
  html = html.replace(/<a class="action" href="[^"]+" id="house-info">.*?<\/a>/s, '');
  html = html.replace('<div class="top-actions"><button class="action holiday-toggle"', '<div class="top-actions"><a class="action" id="lab-return-link" aria-label="Return to all Labs" href="/examples/lab/#showroom">The Lab</a><button class="action holiday-toggle"');
  html = html.replace(/<nav class="collections" aria-label="Property collections">.*?<\/nav>/s, '<nav class="collections" aria-label="Farm House sections"><button data-collection="property" aria-pressed="true">Property</button><button data-collection="inside" aria-pressed="false">Inside</button><button data-collection="find" aria-pressed="false">Find</button></nav>');
  html = html.replace('<section id="construction-panel" hidden aria-label="Construction collections"></section>', '<section id="construction-panel" hidden aria-label="Farm House Inside and Find"></section>');
  html = html.replace('id="christmas-toggle"', 'id="christmas-toggle" aria-label="Christmas decorations"');
  html = html.replace(/(<\/select>)(<button class="reset" id="gate-toggle")/, '$1<button class="reset" id="yard-toggle" aria-pressed="true" disabled>Garden</button>$2');
  html = html.replace(/<script src="Farm-House-Viewer\.js[^"]*"><\/script>/, '<script defer src="./lab-bootstrap.js"></script><script defer src="/examples/lab/assets/lab-return.js"></script><script src="./farm-house-viewer.js?v=authentic-exterior-v2"></script><script src="./farm-house-adapter.js"></script>');
  html = html.replace(/<noscript>.*?<\/noscript>/s, '<noscript><div class="loading"><h2>Farm House</h2><p>This interactive property study needs JavaScript enabled.</p></div></noscript>');
  html = html.replace('</style>', `
html.lab-concept-page:not(.lab-concept-embed) .lab-concept-shell,html.lab-concept-page:not(.lab-concept-embed) .lab-concept-hint,html.lab-concept-page:not(.lab-concept-embed) .lab-concept-status{display:none!important}
html.lab-concept-embed #lab-return-link{display:none}
html.lab-concept-embed .topbar{right:calc(78px + var(--safe-right))}
html.lab-concept-embed body:is([data-collection="inside"],[data-collection="find"]) .lab-embed-exit{display:none}
/* The viewport here is the card's inner frame, which can be narrower than a phone. */
@media(max-width:480px){
  .topbar,html.lab-concept-embed .topbar{top:calc(12px + var(--safe-top));left:calc(8px + var(--safe-left));right:calc(60px + var(--safe-right));display:grid;grid-template-columns:minmax(0,1fr) 44px;gap:6px}
  .brand{padding:10px 6px;width:max-content;max-width:100%;min-height:44px}
  .brand h1{font-size:20px;line-height:1.2;margin:0;white-space:normal}
  .brand p{display:none}
  .top-actions{display:flex;flex-wrap:wrap;justify-content:flex-start;max-width:100%}
  .top-actions .holiday-toggle{width:44px;min-height:44px;padding:0;gap:0;font-size:0}
  .holiday-toggle span{display:none}
  .holiday-toggle svg{width:24px;height:24px}
  html:not(.lab-concept-embed) #lab-return-link{position:fixed;top:calc(12px + var(--safe-top));right:calc(8px + var(--safe-right));display:inline-flex;width:44px;min-height:44px;padding:0;font-size:0}
  html:not(.lab-concept-embed) #lab-return-link::after{content:'×';font-size:28px;line-height:1}
  .collections{top:calc(68px + var(--safe-top));left:calc(12px + var(--safe-left));right:calc(12px + var(--safe-right));max-width:none;transform:none;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:2px}
  .collections button{min-width:0;min-height:44px;padding:0 2px;font-size:16px}
  .view-footer{left:calc(8px + var(--safe-left));right:calc(8px + var(--safe-right));bottom:calc(8px + var(--safe-bottom));gap:6px}
  .lights button{min-height:48px;padding:4px 2px;font-size:14px}
  .lights button svg{width:18px;height:18px}
  .below-dock{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));padding:4px;gap:2px;min-height:0}
  .below-dock #view-select{grid-column:1/-1;width:100%;height:44px;font-size:15px;padding:0 8px}
  .below-dock #yard-toggle,.below-dock #gate-toggle,.below-dock #reset{min-width:0;min-height:44px;padding:0 2px;font-size:14px}
}
</style>`);
  assertSafe(html, 'index.html');
  return html;
}
async function readTree(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => entry.isDirectory() ? readTree(resolve(dir, entry.name)) : [resolve(dir, entry.name)]))).flat();
}
async function verifyOutput() {
  const required = ['index.html', 'farm-house-viewer.js', 'farm-house-adapter.js', 'lab-bootstrap.js', 'assets/farm-house.glb', 'assets/materials/credits.json', 'CREDITS.txt', 'inside/index.html', 'inside/farm-house-inside.css', 'inside/farm-house-inside.js', 'inside/farm-house-inside-data.json'];
  for (const relative of required) if (!existsSync(resolve(output, relative))) throw new Error(`Missing generated Farm House output: ${relative}`);
  const html = await readFile(resolve(output, 'index.html'), 'utf8');
  const viewer = await readFile(resolve(output, 'farm-house-viewer.js'), 'utf8');
  const adapter = await readFile(resolve(output, 'farm-house-adapter.js'), 'utf8');
  assertSafe(html, 'generated index.html'); assertSafe(viewer, 'generated farm-house-viewer.js');
  new Function(adapter);
  const expectedInside = await insideArtifacts();
  for (const [relative, expected] of expectedInside) {
    const actual = await readFile(resolve(output, relative));
    if (!Buffer.from(actual).equals(Buffer.from(expected))) throw new Error(`Farm House Inside output is not reproducible: ${relative}`);
  }
  const assets = await readTree(resolve(output, 'assets'));
  if (assets.some((path) => /(?:guide|research|construction|source|record|\.pdf$)/i.test(path))) throw new Error('Generated Farm House output contains a prohibited source artifact.');
  const manifest = JSON.parse(await readFile(privateManifest, 'utf8'));
  if (manifest.sourceSha256 !== pinnedSourceSha256 || manifest.sourceViewerSha256 !== pinnedViewerSha256 || manifest.sourceHtmlSha256 !== pinnedHtmlSha256 || !manifest.geometryPreserved || manifest.counts.source.nodes !== manifest.counts.public.nodes) throw new Error('Farm House geometry/source manifest does not match the approved snapshot.');
  const artifactHashes = manifest.artifactHashes ?? {};
  for (const relative of ['index.html', 'farm-house-viewer.js', 'farm-house-adapter.js', 'CREDITS.txt', 'inside/index.html', 'inside/farm-house-inside.css', 'inside/farm-house-inside.js', 'inside/farm-house-inside-data.json']) {
    if (artifactHashes[relative] !== hash(await readFile(resolve(output, relative)))) throw new Error(`Farm House generated artifact fingerprint changed: ${relative}`);
  }
  if (!/Permission is hereby granted, free of charge, to any person obtaining a copy/i.test(await readFile(resolve(output, 'CREDITS.txt'), 'utf8'))) throw new Error('Farm House credits must retain the full Three.js MIT license.');
  console.log(JSON.stringify({ ok: true, output, files: required, geometryBufferSha256: manifest.geometryBufferSha256 }));
}
if (check) {
  await verifyOutput();
} else {
  if (!sourceRoot) throw new Error('Set FARM_HOUSE_SOURCE to the approved stable public Farm House snapshot.');
  const [sourceModel, sourceHtml, sourceViewer, adapter, threeLicense] = await Promise.all([
    readPinnedSnapshotFile(sourceRoot, pinnedSourceSha256),
    readPinnedSnapshotFile(sourceRoot, pinnedHtmlSha256),
    readPinnedSnapshotFile(sourceRoot, pinnedViewerSha256),
    readFile(resolve(packageRoot, 'src/farm-house-adapter.js')),
    readFile(resolve(packageRoot, 'node_modules/three/LICENSE'), 'utf8'),
  ]);
  await rm(output, { recursive: true, force: true });
  await mkdir(resolve(output, 'assets'), { recursive: true });
  const privateTerms = privateRoadTerms(sourceModel.contents);
  if (privateTerms.length < 2) throw new Error('Pinned Farm House model did not expose expected location labels for redaction.');
  await writeFile(resolve(output, 'index.html'), safeHtml(sourceHtml.contents.toString('utf8')));
  await writeFile(resolve(output, 'farm-house-viewer.js'), safeViewer(sourceViewer.contents.toString('utf8'), sourceModel.name, privateTerms));
  await cp(resolve(sourceRoot, 'Farm-House-Materials'), resolve(output, 'assets/materials'), { recursive: true });
  execFileSync(process.execPath, [resolve(packageRoot, 'sanitize-farm-house.mjs'), resolve(sourceRoot, sourceModel.name), resolve(output, 'assets/farm-house.glb'), privateManifest], { stdio: 'inherit' });
  await writeFile(resolve(output, 'lab-bootstrap.js'), await readFile(resolve(packageRoot, 'src/lab-bootstrap.js')));
  await writeFile(resolve(output, 'farm-house-adapter.js'), adapter);
  await writeFile(resolve(output, 'CREDITS.txt'), `Farm House interactive property study\n\nThree.js\n\n${threeLicense}`);
  await writeArtifacts(await insideArtifacts());
  const manifest = JSON.parse(await readFile(privateManifest, 'utf8'));
  manifest.sourceViewerSha256 = pinnedViewerSha256;
  manifest.sourceHtmlSha256 = pinnedHtmlSha256;
  manifest.artifactHashes = {};
  for (const relative of ['index.html', 'farm-house-viewer.js', 'farm-house-adapter.js', 'CREDITS.txt', 'inside/index.html', 'inside/farm-house-inside.css', 'inside/farm-house-inside.js', 'inside/farm-house-inside-data.json']) manifest.artifactHashes[relative] = hash(await readFile(resolve(output, relative)));
  await writeFile(privateManifest, `${JSON.stringify(manifest, null, 2)}\n`);
  await cp(privateManifest, privateEvidence);
  await verifyOutput();
}
