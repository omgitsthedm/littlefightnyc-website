const fs = require('fs');
const { chromium } = require('playwright');
const base = 'http://127.0.0.1:4399';
const evidence = '../.lifi/evidence/tile-rewrite';
fs.mkdirSync(evidence, { recursive: true });
const allCategories = [
  { path: '/services/custom-local-websites/', heading: 'Make your business easy to choose.', answers: 27, key: 'website' },
  { path: '/services/it-support/', heading: 'On-site tech help in New York', answers: 28, key: 'support' },
  { path: '/services/tech-consulting/', heading: 'Know what to fix first', answers: 6, key: 'consulting' },
  { path: '/services/business-systems/', heading: 'Small tools for repeated work', answers: 8, key: 'software' }
];
const categories = process.env.QA_KEYS ? allCategories.filter(item => process.env.QA_KEYS.split(',').includes(item.key)) : allCategories;
const widths = process.env.QA_WIDTHS ? process.env.QA_WIDTHS.split(',').map(Number) : [320, 390, 768, 1440];
const report = { base, browser: 'installed Google Chrome via Playwright channel:chrome; isolated temporary context', native: [], responsive: [], text200: [], journey: {}, console: [], failures: [] };
function fail(message) { report.failures.push(message); }
async function geometry(page) {
  return page.evaluate(() => {
    const visible = el => {
      const s = getComputedStyle(el), r = el.getBoundingClientRect();
      return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0;
    };
    const textNodes = [...document.querySelectorAll('.category-answer h3, .category-answer p, .rw-reader h1, .rw-reader h2, .rw-reader h3, .rw-reader p')].filter(visible);
    const overflow = textNodes.filter(el => el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1).map(el => ({ text: el.textContent.trim().slice(0, 80), tag: el.tagName, scroll: [el.scrollWidth, el.scrollHeight], client: [el.clientWidth, el.clientHeight] }));
    const outOfViewport = [...document.querySelectorAll('.category-answer, .rw-reader h1, .rw-reader h2, .rw-reader h3, .rw-reader p')].filter(visible).filter(el => {
      const r = el.getBoundingClientRect();
      return r.left < -1 || r.right > window.innerWidth + 1;
    }).map(el => ({ text: el.textContent.trim().slice(0, 80), rect: el.getBoundingClientRect().toJSON() }));
    const contacts = [...document.querySelectorAll('a[href^="tel:"], a[href^="sms:"], a[href^="mailto:"]')].filter(visible).map(el => ({ text: el.textContent.trim(), width: Math.round(el.getBoundingClientRect().width), height: Math.round(el.getBoundingClientRect().height), y: Math.round(el.getBoundingClientRect().y) }));
    const heading = document.querySelector('h1'), paragraph = document.querySelector('p');
    return { pageWidth: document.documentElement.scrollWidth, viewport: window.innerWidth, overflow, outOfViewport, contacts, bodyFont: paragraph ? getComputedStyle(paragraph).fontFamily : '', headingFont: heading ? getComputedStyle(heading).fontFamily : '', color: heading ? getComputedStyle(heading).color : '', background: getComputedStyle(document.body).backgroundColor };
  });
}
async function controlIntersections(page) {
  return page.evaluate(() => {
    const rect = el => el.getBoundingClientRect();
    const intersects = (a, b) => Math.max(a.left, b.left) < Math.min(a.right, b.right) && Math.max(a.top, b.top) < Math.min(a.bottom, b.bottom);
    const close = document.querySelector('.reader-hub-return');
    const contacts = [...document.querySelectorAll('.direct-contact-rail a')].filter(el => {
      const style = getComputedStyle(el), box = rect(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 0 && box.height > 0;
    });
    if (!close) return { close: null, contacts: [], intersections: [] };
    const closeRect = rect(close).toJSON();
    return {
      close: closeRect,
      contacts: contacts.map(el => ({ text: el.textContent.trim(), rect: rect(el).toJSON() })),
      intersections: contacts.filter(el => intersects(rect(close), rect(el))).map(el => el.textContent.trim())
    };
  });
}
async function nativeCheck(browser) {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  for (const item of categories) {
    const page = await context.newPage();
    await page.goto(base + item.path, { waitUntil: 'networkidle' });
    const summary = page.locator('.category-questions > details > summary').first();
    const before = await summary.count();
    if (!before) fail('native ' + item.key + ': no closed disclosure to test');
    else {
      await summary.focus(); await page.keyboard.press('Enter');
      if (!await summary.evaluate(el => el.parentElement.open)) fail('native ' + item.key + ': Enter did not open disclosure');
      await page.keyboard.press('Enter');
      if (!await summary.evaluate(el => !el.parentElement.open)) fail('native ' + item.key + ': Enter did not close disclosure');
    }
    report.native.push({ key: item.key, details: await page.locator('details').count(), summaries: await page.locator('summary').count(), keyboardDisclosure: !!before });
    await page.close();
  }
  await context.close();
}
async function responsiveCheck(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  for (const width of widths) for (const item of categories) {
    const page = await context.newPage(), pageErrors = [];
    page.on('console', msg => { if (msg.type() === 'error') pageErrors.push(msg.text()); });
    page.on('pageerror', err => pageErrors.push(String(err)));
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base + item.path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(650);
    const h1 = (await page.locator('h1').first().textContent() || '').trim();
    if (h1 !== item.heading) fail(item.key + '@' + width + ': H1 mismatch: ' + h1);
    const categorySummary = page.locator('.category-questions > details > summary').first();
    if (await categorySummary.count()) {
      await categorySummary.scrollIntoViewIfNeeded(); await categorySummary.focus(); await page.keyboard.press('Enter');
      if (!await categorySummary.evaluate(el => el.parentElement.open)) fail(item.key + '@' + width + ': keyboard category summary did not open');
    }
    const intersections = await controlIntersections(page);
    if (intersections.intersections.length) fail(item.key + '@' + width + ': return control overlaps ' + intersections.intersections.join(', '));
    const categoryAnswers = await page.locator('.category-answer:visible').count();
    if (categoryAnswers !== item.answers) fail(item.key + '@' + width + ': expected ' + item.answers + ' visible answer sections, saw ' + categoryAnswers);
    const invalidAnswers = await page.locator('.category-answer:visible').evaluateAll(nodes => nodes.filter(node => !node.querySelector('h3') || !node.querySelector('p')).map(node => node.id || '(no id)'));
    if (invalidAnswers.length) fail(item.key + '@' + width + ': answer sections lack h3/p: ' + invalidAnswers.join(', '));
    const g = await geometry(page);
    if (g.pageWidth > width + 1) fail(item.key + '@' + width + ': horizontal document overflow ' + g.pageWidth + '/' + width);
    if (g.overflow.length) fail(item.key + '@' + width + ': clipped text ' + JSON.stringify(g.overflow));
    if (g.outOfViewport.length) fail(item.key + '@' + width + ': visible content crosses viewport ' + JSON.stringify(g.outOfViewport));
    const headerContacts = g.contacts.filter(contact => contact.y < 240);
    if (headerContacts.length < 3 || headerContacts.some(contact => contact.height < 44)) fail(item.key + '@' + width + ': header contact target failure ' + JSON.stringify(headerContacts));
    if (!/Atkinson Hyperlegible/i.test(g.bodyFont)) fail(item.key + '@' + width + ': expected Atkinson body font, got ' + g.bodyFont);
    if (pageErrors.length) report.console.push({ key: item.key, width, errors: pageErrors });
    report.responsive.push({ key: item.key, width, answers: categoryAnswers, ...g, controlIntersections: intersections, consoleErrors: pageErrors.length });
    if (item.key === 'website' && width === 1440) await page.screenshot({ path: evidence + '/website-desktop-1440.png' });
    if (item.key === 'consulting' && width === 390) { await page.locator('.category-answer').nth(2).scrollIntoViewIfNeeded(); await page.waitForTimeout(300); await page.screenshot({ path: evidence + '/consulting-mobile-390.png' }); }
    if (item.key === 'software' && width === 390) { await page.locator('.category-answer').nth(3).scrollIntoViewIfNeeded(); await page.waitForTimeout(300); await page.screenshot({ path: evidence + '/software-mobile-390.png' }); }
    await page.close();
  }
  await context.close();
}
async function text200Check(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  for (const item of categories) {
    const page = await context.newPage();
    await page.goto(base + item.path, { waitUntil: 'networkidle' });
    const categorySummary = page.locator('.category-questions > details > summary').first();
    await categorySummary.focus(); await page.keyboard.press('Enter');
    await page.evaluate(() => {
      const measurements = [...document.querySelectorAll('h1,h2,h3,h4,p,summary,a,li,button,label')].map(el => [el, parseFloat(getComputedStyle(el).fontSize)]);
      for (const [el, size] of measurements) if (Number.isFinite(size) && size > 0) el.style.setProperty('font-size', (size * 2) + 'px', 'important');
      window.dispatchEvent(new Event('resize'));
    });
    await page.waitForTimeout(500);
    const intersections = await controlIntersections(page);
    if (intersections.intersections.length) fail(item.key + '@390 200% computed text: return control overlaps ' + intersections.intersections.join(', '));
    const g = await geometry(page);
    if (g.pageWidth > 391) fail(item.key + '@390 200% computed text: horizontal overflow ' + g.pageWidth + '/390');
    if (g.overflow.length) fail(item.key + '@390 200% computed text: clipped text ' + JSON.stringify(g.overflow));
    if (g.outOfViewport.length) fail(item.key + '@390 200% computed text: content crosses viewport ' + JSON.stringify(g.outOfViewport));
    report.text200.push({ key: item.key, ...g, controlIntersections: intersections });
    await page.close();
  }
  await context.close();
}
async function homepageJourney(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } }), page = await context.newPage(), errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(base + '/', { waitUntil: 'networkidle' }); await page.waitForTimeout(900);
  const card = page.locator('[data-answer="page-services-custom-local-websites"]').first();
  await card.focus(); await card.press('Enter'); await page.waitForTimeout(1200);
  const cardReader = page.locator('#detail[open] .detail-window');
  if (!await cardReader.count()) fail('homepage journey: Website card did not open reader');
  const h1 = (await cardReader.locator('h1').first().textContent() || '').trim();
  if (h1 !== 'Make your business easy to choose.') fail('homepage journey: Website reader H1 mismatch ' + h1);
  const category = cardReader.locator('.category-answer').nth(10);
  await category.scrollIntoViewIfNeeded(); await page.waitForTimeout(250);
  const readerScrollTop = await cardReader.locator('.detail-body').evaluate(el => el.scrollTop);
  const beforeCloseY = await page.evaluate(() => window.scrollY);
  const detail = cardReader.locator('.category-questions > details > summary').first();
  const hasDetail = await detail.count(); let detailOpened = false;
  if (!hasDetail) fail('homepage journey: Website category disclosure missing');
  else { await detail.focus(); await page.keyboard.press('Enter'); detailOpened = await detail.evaluate(el => el.parentElement.open); if (!detailOpened) fail('homepage journey: Website disclosure did not open'); }
  const close = page.locator('#close-detail').first();
  if (!await close.count()) fail('homepage journey: close X missing');
  else {
    await close.click(); await page.waitForTimeout(900);
    if (await page.locator('#detail[open]').count()) fail('homepage journey: reader remained visible after close');
    const active = await page.evaluate(() => document.activeElement?.getAttribute('data-view') || document.activeElement?.getAttribute('data-answer') || document.activeElement?.tagName);
    const afterCloseY = await page.evaluate(() => window.scrollY);
    if (active !== 'page-services-custom-local-websites') fail('homepage journey: focus did not return to website tile (' + active + ')');
    if (afterCloseY < Math.max(0, beforeCloseY - 120)) fail('homepage journey: homepage scroll context regressed ' + beforeCloseY + ' -> ' + afterCloseY);
    report.journey = { openedHeading: h1, detailOpened, readerScrollTop, beforeCloseY, afterCloseY, focus: active, consoleErrors: errors };
  }
  if (errors.length) report.console.push({ key: 'homepageJourney', errors });
  await page.screenshot({ path: evidence + '/homepage-return-mobile-390.png' });
  await context.close();
}
(async() => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try { if (!process.env.QA_SKIP_NATIVE) await nativeCheck(browser); if (!process.env.QA_SKIP_RESPONSIVE) await responsiveCheck(browser); if (!process.env.QA_SKIP_TEXT) await text200Check(browser); if (!process.env.QA_SKIP_JOURNEY) await homepageJourney(browser); }
  finally { await browser.close(); }
  fs.writeFileSync(evidence + '/category-qa-report.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ native: report.native, responsiveChecks: report.responsive.length, text200Checks: report.text200.length, journey: report.journey, console: report.console, failures: report.failures, evidence }, null, 2));
  process.exitCode = report.failures.length ? 1 : 0;
})().catch(error => { console.error(error); process.exit(1); });
