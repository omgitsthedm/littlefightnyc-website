/* Deterministic fixture test for the in-browser answer search. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const source = fs.readFileSync(path.join(root, 'preview-ui/search-relevance.js'), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox, { filename: 'search-relevance.js' });
const { rank } = sandbox.window.LFSearch;
const aliases = JSON.parse(fs.readFileSync(path.join(root, 'preview-content/search-aliases.json'), 'utf8'));
const indexPath = path.join(root, 'dist/search-index.json');
assert.ok(fs.existsSync(indexPath), 'Build the static candidate before verifying search relevance.');
const rows = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
const fixtures = [
  ['printer', '/answers/help/printer/'],
  ['printing', '/answers/help/printer/'],
  ["can't print", '/answers/help/printer/'],
  ['my email is not working', '/answers/help/email/'],
  ['emails going to spam', '/answers/help/email/#answer-email'],
  ['outlook shared mailbox', '/answers/help/email/'],
  ['wifi keeps dropping', '/answers/help/wifi/'],
  ["can't sign in", '/answers/help/it-password-ownership/#answer-it-password-ownership'],
  ['microsoft 365 admin', '/answers/help/it-password-ownership/'],
  ['new mac setup', '/answers/help/computer/'],
  ['change my hours', '/answers/help/maps/'],
  ['update my website', '/answers/help/web-site-health-check/'],
  ['website cost', '/answers/help/cost/'],
  ['website down', '/answers/website-down-emergency-nyc/'],
  ['internet down', '/answers/help/it-internet-outage/'],
  ['stop entering things twice', '/answers/help/software-duplicate-entry/'],
  ['printer in Tucson', '/answers/help/printer/'],
  ['roofing', '/industries/roofing/'],
  ['roofer', '/industries/roofing/'],
  ['farm house', '/labs/house-explorer/'],
  ['truss profiles', '/labs/house-explorer/']
];
for (const [query, expected] of fixtures) {
  const got = rank(rows, query, aliases)[0]?.path;
  assert.equal(got, expected, `${query}: expected ${expected}, got ${got || 'no result'}`);
}
for (const alias of aliases.aliases) {
  const url = new URL(alias.path, 'https://littlefightnyc.local');
  const file = path.join(dist, decodeURIComponent(url.pathname), 'index.html');
  assert.ok(fs.existsSync(file), `alias route exists in generated candidate: ${alias.path}`);
  if (url.hash) {
    const html = fs.readFileSync(file, 'utf8');
    const id = decodeURIComponent(url.hash.slice(1)).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert.match(html, new RegExp(`id=["']${id}["']`), `alias fragment exists in generated candidate: ${alias.path}`);
  }
}
const spamResults = rank(rows, 'emails going to spam', aliases);
assert.equal(spamResults.filter(result => new URL(result.path, 'https://littlefightnyc.local').pathname === '/answers/help/email/').length, 1, 'fragment and reader variants dedupe to one reader result');
assert.equal(rank(rows, 'zzzzzz', aliases).length, 0, 'unknown query stays an honest no-match');
const printer = rank(rows, 'printer', aliases);
assert.equal(printer.some(result => result.path.startsWith('/examples/lab/')), false, 'ordinary task query excludes lab studies');
console.log(`PASS search relevance: ${fixtures.length + 2} deterministic assertions`);
