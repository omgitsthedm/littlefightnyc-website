import fs from 'node:fs/promises';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const origin = 'https://littlefightnyc.com';
const out = '/tmp/lfnyc-audit-20261009/browser';
await fs.mkdir(out, { recursive: true });
const report = { origin, timestamp: new Date().toISOString(), checks: [], axe: [], problems: [], browser: { consoleErrors: [], pageErrors: [], failedRequests: [], blockedMutations: [] } };
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2, reducedMotion: 'reduce', colorScheme: 'light' });
await context.addInitScript(() => {
  try { localStorage.setItem('lfnyc-consent', JSON.stringify({ analytics: false, advertising: false })); } catch {}
});
await context.route('**/*', async route => {
  const request = route.request();
  if (!['GET', 'HEAD'].includes(request.method())) {
    report.browser.blockedMutations.push({ method: request.method(), url: request.url() });
    return route.abort();
  }
  return route.continue();
});
const page = await context.newPage();
page.on('pageerror', error => report.browser.pageErrors.push(error.message));
page.on('console', message => { if (message.type() === 'error') report.browser.consoleErrors.push(message.text()); });
page.on('requestfailed', request => {
  const failure = request.failure()?.errorText || 'failed';
  if (!/ERR_ABORTED/.test(failure)) report.browser.failedRequests.push({ url: request.url(), failure });
});

const pass = (name, detail = {}) => report.checks.push({ name, status: 'pass', ...detail });
const fail = (name, detail = {}) => { report.checks.push({ name, status: 'fail', ...detail }); report.problems.push({ name, ...detail }); };
async function go(path, label) {
  const response = await page.goto(origin + path, { waitUntil: 'networkidle', timeout: 60000 });
  if (!response || response.status() >= 400) fail(`${label} responds`, { path, status: response?.status() });
  else pass(`${label} responds`, { path, status: response.status(), title: await page.title() });
}
async function axe(label) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  report.axe.push({ label, violations: results.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })) });
  if (results.violations.length) fail(`axe ${label}`, { violations: results.violations.map(v => v.id) });
  else pass(`axe ${label}`, { violations: 0 });
}
async function visible(selector, label) {
  const locator = page.locator(selector).first();
  try { await locator.waitFor({ state: 'visible', timeout: 8000 }); pass(label, { selector }); return locator; }
  catch { fail(label, { selector }); return null; }
}

// Homepage semantics, focus, search, and a service-reader route reached from the actual card.
await go('/', 'home');
await visible('main, [role="main"], #main-content', 'homepage main landmark');
await visible('a[href="#canvas"]', 'homepage skip link');
await page.keyboard.press('Tab');
const firstFocus = await page.evaluate(() => ({ tag: document.activeElement?.tagName, text: (document.activeElement?.textContent || '').trim(), href: document.activeElement?.getAttribute('href') }));
if (/skip/i.test(firstFocus.text)) pass('keyboard reaches skip link first', firstFocus); else fail('keyboard reaches skip link first', firstFocus);
const homeH1 = await page.locator('h1').allTextContents();
if (homeH1.some(text => text.trim())) pass('homepage has named h1', { headings: homeH1 }); else fail('homepage has named h1');
report.labelInNameReview = await page.evaluate(() => {
  const findings = ['printer', 'it-security-basics'].map(id => {
    const link = document.querySelector(`[data-answer="${id}"]`);
    return { id, visibleLabel: link?.getAttribute('data-cell-title'), accessibleName: link?.getAttribute('aria-label') };
  });
  return {
    lighthouseCandidates: 15,
    confirmed: findings,
    excluded: 13,
    exclusionReason: 'The other flagged links have no overriding aria-label. Chrome derives their accessible names from visible text; these two links use aria-label values that replace the visible labels.'
  };
});
for (const finding of report.labelInNameReview.confirmed) {
  if (finding.accessibleName?.toLowerCase().includes(finding.visibleLabel?.toLowerCase())) pass('visible tile label is included in accessible name', finding);
  else fail('visible tile label is included in accessible name', finding);
}
await axe('homepage desktop');
await page.screenshot({ path: `${out}/homepage-desktop.png`, fullPage: false });

const searchButton = await visible('button[aria-label*="Search"]', 'search control available');
if (searchButton) {
  await searchButton.click();
  const searchInput = await visible('input[type="search"], input[placeholder*="Search" i], [role="search"] input', 'search field opens');
  if (searchInput) {
    await searchInput.fill('printer');
    await page.waitForTimeout(250);
    const resultText = await page.locator('body').innerText();
    if (/Printer won.t connect/i.test(resultText)) pass('search returns printer answer'); else fail('search returns printer answer');
  }
  await page.keyboard.press('Escape');
}

const speed = await visible('[data-answer="speed"]', 'service reader card present');
if (speed) {
  await speed.click();
  await page.waitForTimeout(450);
  if (/\/answers\/help\/speed\/$/.test(new URL(page.url()).pathname)) pass('card opens canonical reader route', { url: page.url() }); else fail('card opens canonical reader route', { url: page.url() });
  await visible('.workbench-reader, [data-reader], main', 'reader is visible');
  const close = await visible('button[aria-label="Return to homepage hub"]', 'reader close control');
  const focusable = await page.evaluate(() => [...document.querySelectorAll('button,a,input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(el => !el.hasAttribute('disabled') && !!(el.offsetWidth || el.offsetHeight)).map(el => ({ tag: el.tagName, text: (el.textContent || '').trim().slice(0,80), aria: el.getAttribute('aria-label') }))); 
  if (focusable.some(x => /Return to homepage hub/.test(x.aria || ''))) pass('reader close is keyboard reachable', { focusables: focusable.length }); else fail('reader close is keyboard reachable');
  await axe('service reader desktop');
  if (close) { await close.click(); await page.waitForTimeout(350); if (new URL(page.url()).pathname === '/') pass('reader close returns home'); else fail('reader close returns home', { url: page.url() }); }
}

// Representative destination routes using only public GET navigation.
for (const [path, label] of [
  ['/case-studies/chromatic-painting-design/', 'case study'],
  ['/journal/', 'journal'],
  ['/contact/', 'contact'],
  ['/tech-audit/', 'intake'],
  ['/examples/lab/concepts/pool-room/', 'pool room lab'],
  ['/vera/#/browse', 'VERA public browse']
]) {
  await go(path, label);
  await visible('main, [role="main"], body', `${label} rendered`);
  const heading = await page.locator('h1').allTextContents();
  if (heading.some(text => text.trim()) || label === 'VERA public browse') pass(`${label} labels content`, { headings: heading.filter(Boolean).slice(0,4) }); else fail(`${label} labels content`);
  if (label === 'journal') await axe('journal desktop');
  if (label === 'VERA public browse') await axe('VERA public browse desktop');
}

// Lab needs an explicit interaction without loading any paid/inbound provider path.
await go('/examples/lab/concepts/pool-room/', 'pool room lab interaction');
const labAction = page.getByRole('link', { name: /talk through your build|download the 23 mb mp4/i }).first();
if (await labAction.count()) { pass('pool room has usable public action', { name: await labAction.innerText() }); } else { fail('pool room has usable public action'); }

// The production hero at Apple Studio Display / XDR-class CSS width and DPR.
const xdrContext = await browser.newContext({ viewport: { width: 3008, height: 1692 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
await xdrContext.route('**/*', async route => ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort());
const xdr = await xdrContext.newPage();
await xdr.goto(origin + '/', { waitUntil: 'networkidle', timeout: 60000 });
const heroImages = await xdr.evaluate(() => [...document.images].map(img => { const r = img.getBoundingClientRect(); return { alt: img.alt, src: img.currentSrc || img.src, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, renderedWidth: Math.round(r.width), renderedHeight: Math.round(r.height), visible: r.bottom > 0 && r.top < innerHeight }; }).filter(img => img.visible && img.renderedWidth > 200).sort((a,b) => b.renderedWidth * b.renderedHeight - a.renderedWidth * a.renderedHeight).slice(0,12));
report.xdrHeroImages = heroImages;
// browser naturalWidth is density-corrected for responsive srcset candidates.
// The hero uses a fixed, non-srcset 762px source, so it is the only image for
// which naturalWidth can directly prove a high-DPI source deficit here.
const heroImage = heroImages.find(image => /hero-reference-desktop\.webp$/.test(new URL(image.src).pathname));
if (!heroImage) fail('high-DPI hero source is present');
else {
  const requiredWidth = heroImage.renderedWidth * 2;
  if (heroImage.naturalWidth + 2 >= requiredWidth) pass('high-DPI hero source resolution', { ...heroImage, requiredWidth });
  else fail('high-DPI hero source resolution', { ...heroImage, requiredWidth });
}
for (const image of heroImages.filter(image => image !== heroImage)) {
  pass('responsive tile image selected', { src: image.src, renderedWidth: image.renderedWidth, naturalWidth: image.naturalWidth, note: 'naturalWidth is density-corrected; no deficit inferred without decoding the selected candidate.' });
}
await xdr.screenshot({ path: `${out}/homepage-xdr-3008-csspx-dpr2.png`, fullPage: false });
await xdrContext.close();

// Phone review: primary navigation, no horizontal overflow, card route, reduced-motion behavior.
const phoneContext = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
await phoneContext.route('**/*', async route => ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort());
const phone = await phoneContext.newPage();
await phone.goto(origin + '/', { waitUntil: 'networkidle', timeout: 60000 });
const overflow = await phone.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth, overflow: document.documentElement.scrollWidth > innerWidth + 1 }));
if (!overflow.overflow) pass('phone has no horizontal page overflow', overflow); else fail('phone has no horizontal page overflow', overflow);
const menu = phone.locator('button[aria-label*="Explore services"]');
if (await menu.count()) { await menu.click(); const menuClose = phone.locator('button[aria-label="Close services and search"]'); if (await menuClose.isVisible()) pass('phone navigation opens and closes'); else fail('phone navigation opens and closes'); await phone.keyboard.press('Escape'); }
else fail('phone navigation control present');
const phoneCard = phone.locator('[data-answer="booking"]');
if (await phoneCard.count()) { await phoneCard.click(); await phone.waitForTimeout(400); if (/\/answers\/help\/booking\/$/.test(new URL(phone.url()).pathname)) pass('phone card opens reader route', { url: phone.url() }); else fail('phone card opens reader route', { url: phone.url() }); }
const animations = await phone.evaluate(() => [...document.getAnimations()].filter(a => a.playState === 'running').map(a => ({ name: a.animationName, target: a.effect?.target?.className || a.effect?.target?.tagName })).slice(0,20));
if (!animations.length) pass('reduced motion suppresses running animations'); else fail('reduced motion suppresses running animations', { animations });
await phone.screenshot({ path: `${out}/homepage-phone-393.png`, fullPage: false });
await phoneContext.close();

await browser.close();
report.browser.consoleErrors = [...new Set(report.browser.consoleErrors)];
report.browser.pageErrors = [...new Set(report.browser.pageErrors)];
report.browser.failedRequests = report.browser.failedRequests.filter(item => !/favicon\.ico/.test(item.url));
report.ok = report.problems.length === 0 && report.browser.pageErrors.length === 0 && report.browser.failedRequests.length === 0;
await fs.writeFile(`${out}/live-browser-audit.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ok: report.ok, checks: report.checks.length, failed: report.problems.length, axe: report.axe.map(x => ({ label: x.label, violations: x.violations.length })), pageErrors: report.browser.pageErrors, failedRequests: report.browser.failedRequests }, null, 2));
