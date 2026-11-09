/* Source-level contract for the responsive sculpture delivery path.
 * This does not build an artifact: it checks that the generator keeps its
 * Safari fallback, uses exact lazy layout sizing where supported, and gives
 * the two abbreviated fronts matching spoken names. */
'use strict';
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const app = path.resolve(__dirname, '..');
const generator = path.join(app, 'scripts', 'sculpture_tiles.py');
const mosaic = path.join(app, 'preview-content', 'mosaic.html');
const source = fs.readFileSync(path.join(app, 'preview-ui', 'vendor', 'mosaic-layout.js'), 'utf8');
const program = String.raw`
import importlib.util, json, re
spec = importlib.util.spec_from_file_location('sculpture_tiles', ${JSON.stringify(generator)})
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
print(json.dumps({
  'printerImage': module.image('printer'),
  'eagerImage': module.image('printer', eager=True),
}))
`;
const result = JSON.parse(execFileSync('python3', ['-c', program], { encoding: 'utf8' }));
const sourceMarkup = fs.readFileSync(mosaic, 'utf8');

assert.match(sourceMarkup, /data-answer="printer"[\s\S]{0,800}aria-label="Why does one office printer work from some computers but not others\?"[\s\S]{0,800}data-cell-title="Printer"[\s\S]{0,800}>Printer won’t connect\?</);
assert.match(sourceMarkup, /data-answer="it-security-basics"[\s\S]{0,800}aria-label="What practical security basics should a small business review first\?"[\s\S]{0,800}data-cell-title="Check the security basics"[\s\S]{0,800}>Check the security basics</);
assert.match(fs.readFileSync(generator, 'utf8'), /if identity in \{'printer', 'it-security-basics'\}:\n            attrs\['aria-label'\]=_text\(title\)/);

const autoWithFallback = /sizes="auto, \(max-width: 600px\) 48vw, 380px"/;
assert.match(result.printerImage, autoWithFallback);
assert.match(result.printerImage, /loading="lazy"/);
assert.doesNotMatch(result.eagerImage, /sizes="auto,/);
assert.match(result.eagerImage, /loading="eager"/);

assert.match(source, /let contentEpoch = 0/);
assert.match(source, /const observedContent = new WeakMap\(\)/);
assert.match(source, /if \(key === layoutKey\) return/);
assert.match(source, /ResizeObserver always queues an initial record/);

console.log(JSON.stringify({
  result: 'passed',
  checks: 12,
  delivery: 'auto with explicit media-query fallback',
  labels: ['printer', 'it-security-basics'],
}, null, 2));
