import { createHash } from 'node:crypto';
import { build as esbuild } from 'esbuild';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(fileURLToPath(new URL('.', import.meta.url)));
const output = resolve(packageRoot, '../../public/examples/lab/concepts/house-explorer');
const privateManifest = resolve(packageRoot, 'farm-house-public.json');
const insideSource = resolve(packageRoot, 'inside');
const privateEvidence = resolve(packageRoot, '../../../.lifi/evidence/construction-labs/farm-house-exterior.json');
// This is a reviewed public fixture, never an import path for the original
// property materials. It is outside app/public so Vite/Netlify cannot publish
// it as a second surface; the output audit still owns the release boundary.
const sourceRoot = resolve(packageRoot, '../../../.lifi/design-source/farm-house-public-v1');
const check = process.argv.includes('--check');
const pinnedSourceSha256 = '6e00ec598ce2158f2367ceec0ed441265539023a674f57be0f45e6073c843a42';
const pinnedViewerSha256 = '0da0ca8d126e78ff62593d9a8343a916a65a8da5df0836e98b77f5ecf8d86ec0';
const pinnedHtmlSha256 = '050aaccd39b88a248218143c46b5d220fb5746481c4392d8c5f3aae76f201cf8';
const forbidden = /(?:google\.com\/maps|source ledger|parcel|latitude|longitude|timezone|America\/Phoenix)/i;
const hash = (value) => createHash('sha256').update(value).digest('hex');
const cleanScriptWhitespace = (value) => value.replace(/[ \t]+$/gm, '').replace(/^[ \t]+/gm, (indent) => indent.replaceAll('\t', '  '));

function assertSafe(text, label) {
  if (forbidden.test(text)) throw new Error(`${label} retained a private/source-only reference`);
}
async function readPublicFixture() {
  const [html, viewer, model, manifestText] = await Promise.all([
    readFile(resolve(sourceRoot, 'index.html')),
    readFile(resolve(sourceRoot, 'farm-house-viewer.js')),
    readFile(resolve(sourceRoot, 'assets/farm-house.glb')),
    readFile(privateManifest, 'utf8'),
  ]);
  const fixture = JSON.parse(manifestText).publicFixture;
  if (fixture?.version !== 'farm-house-public-v1' || fixture.root !== '.lifi/design-source/farm-house-public-v1') {
    throw new Error('Farm House reviewed public fixture contract is missing or changed.');
  }
  for (const [name, contents] of Object.entries({ html, viewer, model })) {
    if (fixture[`${name}Sha256`] !== hash(contents)) throw new Error(`Farm House public fixture fingerprint changed: ${name}`);
  }
  assertSafe(html.toString('utf8'), 'reviewed public fixture index.html');
  assertSafe(viewer.toString('utf8'), 'reviewed public fixture farm-house-viewer.js');
  return { html, viewer, model };
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
async function readTree(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => entry.isDirectory() ? readTree(resolve(dir, entry.name)) : [resolve(dir, entry.name)]))).flat();
}
async function verifyOutput() {
  const required = ['index.html', 'farm-house-viewer.js', 'farm-house-adapter.js', 'farm-house-loader.js', 'lab-bootstrap.js', 'assets/farm-house.glb', 'assets/farm-house-load-experience.jpg', 'assets/materials/credits.json', 'CREDITS.txt', 'inside/index.html', 'inside/farm-house-inside.css', 'inside/farm-house-inside.js', 'inside/farm-house-inside-data.json'];
  for (const relative of required) if (!existsSync(resolve(output, relative))) throw new Error(`Missing generated Farm House output: ${relative}`);
  const html = await readFile(resolve(output, 'index.html'), 'utf8');
  const viewer = await readFile(resolve(output, 'farm-house-viewer.js'), 'utf8');
  const adapter = await readFile(resolve(output, 'farm-house-adapter.js'), 'utf8');
  assertSafe(html, 'generated index.html'); assertSafe(viewer, 'generated farm-house-viewer.js');
  const fixture = await readPublicFixture();
  if (!Buffer.from(html).equals(fixture.html) || !Buffer.from(viewer).equals(fixture.viewer)) {
    throw new Error('Farm House output must match the reviewed public fixture for its exterior shell and renderer.');
  }
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
  for (const relative of ['index.html', 'farm-house-viewer.js', 'farm-house-adapter.js', 'farm-house-loader.js', 'CREDITS.txt', 'inside/index.html', 'inside/farm-house-inside.css', 'inside/farm-house-inside.js', 'inside/farm-house-inside-data.json']) {
    if (artifactHashes[relative] !== hash(await readFile(resolve(output, relative)))) throw new Error(`Farm House generated artifact fingerprint changed: ${relative}`);
  }
  if (!/Permission is hereby granted, free of charge, to any person obtaining a copy/i.test(await readFile(resolve(output, 'CREDITS.txt'), 'utf8'))) throw new Error('Farm House credits must retain the full Three.js MIT license.');
  console.log(JSON.stringify({ ok: true, output, files: required, geometryBufferSha256: manifest.geometryBufferSha256 }));
}
if (check) {
  await verifyOutput();
} else {
  const [fixture, adapter, threeLicense] = await Promise.all([
    readPublicFixture(),
    readFile(resolve(packageRoot, 'src/farm-house-adapter.js')),
    readFile(resolve(packageRoot, 'node_modules/three/LICENSE'), 'utf8'),
  ]);
  await rm(output, { recursive: true, force: true });
  await mkdir(resolve(output, 'assets'), { recursive: true });
  await writeFile(resolve(output, 'index.html'), fixture.html);
  await writeFile(resolve(output, 'farm-house-viewer.js'), fixture.viewer);
  await cp(resolve(packageRoot, 'assets/farm-house-load-experience.jpg'), resolve(output, 'assets/farm-house-load-experience.jpg'));
  await cp(resolve(sourceRoot, 'assets/materials'), resolve(output, 'assets/materials'), { recursive: true });
  await writeFile(resolve(output, 'assets/farm-house.glb'), fixture.model);
  await writeFile(resolve(output, 'lab-bootstrap.js'), await readFile(resolve(packageRoot, 'src/lab-bootstrap.js')));
  await writeFile(resolve(output, 'farm-house-adapter.js'), adapter);
  await writeFile(resolve(output, 'farm-house-loader.js'), await readFile(resolve(packageRoot, 'src/farm-house-loader.js')));
  await writeFile(resolve(output, 'CREDITS.txt'), `Farm House interactive property study\n\nThree.js\n\n${threeLicense}`);
  await writeArtifacts(await insideArtifacts());
  const manifest = JSON.parse(await readFile(privateManifest, 'utf8'));
  manifest.sourceViewerSha256 = pinnedViewerSha256;
  manifest.sourceHtmlSha256 = pinnedHtmlSha256;
  manifest.artifactHashes = {};
  for (const relative of ['index.html', 'farm-house-viewer.js', 'farm-house-adapter.js', 'farm-house-loader.js', 'CREDITS.txt', 'inside/index.html', 'inside/farm-house-inside.css', 'inside/farm-house-inside.js', 'inside/farm-house-inside-data.json']) manifest.artifactHashes[relative] = hash(await readFile(resolve(output, relative)));
  await writeFile(privateManifest, `${JSON.stringify(manifest, null, 2)}\n`);
  await cp(privateManifest, privateEvidence);
  await verifyOutput();
}
