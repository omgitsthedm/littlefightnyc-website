const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const url = JSON.parse(fs.readFileSync('../.lifi/evidence/mixed-tile-rhythm/review-server.json')).url;
const names = ['PREVIEW_URL', 'TILE_PRODUCTION_URL', 'VERA_PREVIEW_URL', 'CASE_EDITORIAL_URL', 'INQUIRY_ENHANCEMENT_URL', 'TOPIC_MOSAIC_URL', 'LAB_FRONTS_URL', 'CONSTRUCTION_URL', 'READER_AUDIT_URL', 'CARD_INTERIORS_URL', 'ANCHOR_READER_URL', 'RESEARCH_URL', 'ANSWER_HUB_URL', 'SEARCH_URL', 'SUPPORT_FORM_URL'];
const env = { ...process.env, TILE_DIST: 'production', ...Object.fromEntries(names.map(name => [name, url])) };
const remaining = ['verify-responsive-sculpture.cjs', 'verify-hero-reference.cjs', 'verify-lab-fronts.cjs', 'verify-construction-labs.cjs', 'verify-tile-production.cjs', 'verify-vera-freshness.cjs', 'verify-case-editorial.cjs', 'verify-inquiry-enhancement.cjs', 'verify-reader-audit.cjs', 'verify-card-interiors.cjs', 'verify-anchor-readers.cjs', 'verify-research-improvements.cjs', 'verify-answer-hub.cjs', 'verify-answer-accessibility.cjs', 'verify-search-browser.cjs'];
for (const script of remaining) {
  console.log('\n> ' + script);
  execFileSync(process.execPath, ['scripts/' + script], { env, stdio: 'inherit' });
}
execFileSync('npx', ['playwright', 'test', '--config=playwright.support-form.config.ts'], { env, stdio: 'inherit' });
execFileSync('npm', ['run', 'audit:quality-manifest'], { env, stdio: 'inherit' });
console.log('PASS remaining functional lanes and quality manifest.');
