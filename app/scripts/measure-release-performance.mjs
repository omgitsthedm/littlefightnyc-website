import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = process.env.PREVIEW_URL;
assert(base && ['127.0.0.1', 'localhost'].includes(new URL(base).hostname), 'Set PREVIEW_URL to the built local release candidate');
const out = path.resolve(process.env.PERFORMANCE_EVIDENCE || path.join(app, '../.lifi/evidence/retina-performance/lighthouse'));
await mkdir(out, { recursive: true });
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
const report = { base, capturedAt: new Date().toISOString(), method: 'Lighthouse 13.5.0, installed Google Chrome, serial mobile simulated throttling; lab evidence, not field Core Web Vitals', release: await (await fetch(new URL('/release.json', base))).json(), pages: [] };
for (const profile of [{ name: 'home-mobile', route: '/', lcpBudget: 2500 }, { name: 'websites-mobile', route: '/services/custom-local-websites/', lcpBudget: 3500 }]) {
  const runs = [];
  for (let run = 1; run <= 3; run++) {
    const prefix = path.join(out, `${profile.name}-${run}`);
    const args = ['exec', '--yes', '--package=lighthouse@13.5.0', '--', 'lighthouse', new URL(profile.route, base).href,
      '--chrome-flags=--headless --disable-gpu', '--only-categories=performance,accessibility,best-practices,seo',
      '--output=json', '--output=html', `--output-path=${prefix}`, '--quiet'];
    await new Promise((resolve, reject) => {
      const child = spawn('npm', args, { cwd: app, stdio: 'inherit', env: { ...process.env, CHROME_PATH: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' } });
      child.on('error', reject);
      child.on('exit', code => code === 0 ? resolve() : reject(new Error(`Lighthouse exited ${code}`)));
    });
    const result = JSON.parse(await readFile(`${prefix}.report.json`, 'utf8'));
    assert(!result.runtimeError, JSON.stringify(result.runtimeError));
    runs.push({ score: Math.round(result.categories.performance.score * 100), lcp: result.audits['largest-contentful-paint'].numericValue,
      tbt: result.audits['total-blocking-time'].numericValue, cls: result.audits['cumulative-layout-shift'].numericValue });
    console.log(`${profile.name} ${run}/3: ${runs.at(-1).score}, LCP ${Math.round(runs.at(-1).lcp)}ms`);
  }
  const summary = Object.fromEntries(['score', 'lcp', 'tbt', 'cls'].map(key => [key, median(runs.map(run => run[key]))]));
  report.pages.push({ ...profile, runs, median: summary });
}
const failures = report.pages.flatMap(page => [
  ...(page.median.score < 90 ? [`${page.name}: median score below 90`] : []),
  ...(page.median.lcp > page.lcpBudget ? [`${page.name}: median LCP above ${page.lcpBudget}ms`] : []),
  ...(page.median.tbt > 200 ? [`${page.name}: median blocking time above 200ms`] : []),
  ...(page.median.cls > 0.1 ? [`${page.name}: layout shift above 0.1`] : []),
]);
report.failures = failures;
report.result = failures.length ? 'failed' : 'passed';
await writeFile(path.join(out, 'summary.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report.pages.map(({ name, median }) => ({ name, median })), null, 2));
assert.deepEqual(failures, [], 'Performance budget regression');
