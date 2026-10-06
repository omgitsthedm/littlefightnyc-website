import { build } from 'esbuild';
import { mkdir, readdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const appDirectory = resolve(scriptDirectory, '../..');
const outputDirectory = resolve(appDirectory, 'public/examples/lab/concepts/cabinet-concept');

await mkdir(outputDirectory, { recursive: true });
await rm(resolve(outputDirectory, 'cabinet-lab.js'), { force: true });
await rm(resolve(outputDirectory, 'cabinet-lab.css'), { force: true });
for (const name of await readdir(outputDirectory)) {
  if ((name.startsWith('cabinet-lab-chunk-') && name.endsWith('.js')) || (name.startsWith('cabinet-lab') && name.endsWith('.LEGAL.txt'))) {
    await rm(resolve(outputDirectory, name), { force: true });
  }
}
await build({
  entryPoints: [resolve(scriptDirectory, 'source/main.tsx')],
  outdir: outputDirectory,
  entryNames: 'cabinet-lab',
  chunkNames: 'cabinet-lab-chunk-[hash]',
  bundle: true,
  splitting: true,
  format: 'esm',
  jsx: 'automatic',
  target: ['es2022'],
  minify: true,
  sourcemap: false,
  nodePaths: [resolve(scriptDirectory, 'node_modules')],
  alias: { '@desk/spec': resolve(scriptDirectory, 'source/spec.ts') },
  loader: { '.woff2': 'file' },
  external: ['/assets/*'],
  legalComments: 'linked',
});
