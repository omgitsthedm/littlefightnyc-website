import { readFile, writeFile } from 'node:fs/promises';
const content = new URL('../preview-content/', import.meta.url);
const read = async file => JSON.parse(await readFile(new URL(file, content), 'utf8'));
const old = JSON.parse(await readFile(new URL('../src/data/route-meta.json', import.meta.url), 'utf8'));
const paths = new Set(old.pages.map(page => page.path));
for (const file of ['live-pages.json', 'answer-pages.json', 'market-pages.json', 'pages.json']) {
  for (const page of await read(file)) paths.add(page.path);
}
// build-tile-preview creates one canonical reader route for every topic tile.
// Add those paths from the same authored data rather than accepting an open
// route pattern at runtime; provenance stays bounded to public build output.
const topicPaths = new Set();
for (const tile of await read('topic-tiles.json')) {
  if (typeof tile?.id !== 'string' || !/^[a-z0-9-]+$/.test(tile.id)) {
    throw new Error('Topic tiles need a lowercase slug id before they can become measurement paths.');
  }
  const path = `/answers/help/${tile.id}/`;
  topicPaths.add(path);
  paths.add(path);
}
for (const album of await read('albums.json')) paths.add(`/photos/${album.id.replace(/^album-/, '')}/`);
for (const pathname of ['/', '/reviews/', '/websites-for-your-business/', '/thanks/']) paths.add(pathname);
const safe = [...paths].filter(path => /^\/[a-z0-9/-]*$/.test(path) && !path.startsWith('/_readers/')).sort();
for (const path of topicPaths) {
  if (!safe.includes(path)) throw new Error(`Topic reader is missing from measurement allowlist: ${path}`);
}
await writeFile(new URL('../src/data/measurement-paths.json', import.meta.url), JSON.stringify(safe) + '\n');
console.log(`Measurement allowlist: ${safe.length} explicit public paths, no titles or query data.`);
