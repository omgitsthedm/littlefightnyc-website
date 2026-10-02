import { readFile, writeFile } from 'node:fs/promises';
const content = new URL('../preview-content/', import.meta.url);
const read = async file => JSON.parse(await readFile(new URL(file, content), 'utf8'));
const old = JSON.parse(await readFile(new URL('../src/data/route-meta.json', import.meta.url), 'utf8'));
const paths = new Set(old.pages.map(page => page.path));
for (const file of ['live-pages.json', 'answer-pages.json', 'market-pages.json', 'pages.json']) {
  for (const page of await read(file)) paths.add(page.path);
}
for (const album of await read('albums.json')) paths.add(`/photos/${album.id.replace(/^album-/, '')}/`);
for (const pathname of ['/', '/reviews/', '/websites-for-your-business/', '/thanks/']) paths.add(pathname);
const safe = [...paths].filter(path => /^\/[a-z0-9/-]*$/.test(path) && !path.startsWith('/_readers/')).sort();
await writeFile(new URL('../src/data/measurement-paths.json', import.meta.url), JSON.stringify(safe) + '\n');
console.log(`Measurement allowlist: ${safe.length} explicit public paths, no titles or query data.`);
