/*
 * Production-candidate browser gate for the static tile rebuild.
 *
 * The browser is deliberately addressed as https://littlefightnyc.com so
 * host-gated consent code and the deployed CSP run normally. Every browser
 * request is intercepted: same-origin files are fulfilled from the local
 * candidate server and optional vendor requests receive inert local replies.
 * A valid form POST is captured and fulfilled as the local thank-you document;
 * it never reaches Netlify or creates an inquiry.
 *
 * Run only after the builder has produced app/dist and started:
 *   TILE_PRODUCTION_URL=http://127.0.0.1:4394 node app/scripts/verify-tile-production.cjs
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');

const localBase = (process.env.TILE_PRODUCTION_URL || 'http://127.0.0.1:4394').replace(/\/$/, '');
const publicOrigin = 'https://littlefightnyc.com';
const evidence = path.resolve(__dirname, '..', '..', '.lifi', 'evidence', 'tile-production');
const allowedVendorHosts = new Set([
  'www.googletagmanager.com',
  'www.google-analytics.com',
  'analytics.google.com',
  'region1.google-analytics.com',
  'connect.facebook.net',
  'www.facebook.com',
  'mpc2-prod-27-is5qnl632q-uk.a.run.app',
  '5z-2b6b7616f94640c2840d1841e1ac24c3.ecs.us-east-1.on.aws',
]);

const report = {
  kind: 'tile-production-candidate-verification',
  localBase,
  publicOrigin,
  browser: 'Google Chrome via Playwright channel chrome',
  assertions: [],
  cspViolations: [],
  pageErrors: [],
  localResourceFailures: [],
  externalRequestHosts: [],
  validPost: null,
};

function pass(name, detail = '') {
  report.assertions.push({ name, passed: true, detail });
}

async function check(name, task) {
  try {
    const detail = await task();
    pass(name, detail || '');
  } catch (error) {
    report.assertions.push({ name, passed: false, detail: error.message || String(error) });
    throw error;
  }
}

function isCspMessage(text) {
  return /content security policy|violates the following directive|refused to .* policy/i.test(text);
}

async function localReply(pathname, search = '') {
  const response = await fetch(localBase + pathname + search, {
    headers: { 'accept-encoding': 'identity' },
    redirect: 'manual',
  });
  const headers = {};
  for (const name of [
    'content-type', 'content-security-policy', 'cache-control', 'x-content-type-options',
    'referrer-policy', 'permissions-policy', 'x-frame-options', 'x-robots-tag',
  ]) {
    const value = response.headers.get(name);
    if (value) headers[name] = value;
  }
  return { status: response.status, headers, body: Buffer.from(await response.arrayBuffer()) };
}

function eventCommands(page) {
  return page.evaluate(() => (window.dataLayer || []).map((row) => Array.from(row)));
}

function namedEventCount(commands, name) {
  return commands.filter((row) => row[0] === 'event' && row[1] === name).length;
}

function tileEvents(commands) {
  return commands.filter((row) => [
    'tile_exposure', 'tile_open', 'answer_view', 'search_result_selected', 'search_no_match',
  ].includes(String(row[1])));
}

async function makeContext(browser, options = {}) {
  const { viewport = { width: 1440, height: 900 }, ...initial } = options;
  const context = await browser.newContext({ serviceWorkers: 'block', viewport });
  const state = { posts: [], externalHosts: new Set(), csp: [], errors: [], localFailures: [] };
  await context.addInitScript((initial) => {
    if (initial.analytics) localStorage.setItem('lf_analytics_consent_v1', 'granted');
    if (initial.meta) localStorage.setItem('lf_meta_consent_v1', 'granted');
    if (initial.googleAds) localStorage.setItem('lf_google_ads_consent_v1', 'granted');
    // Contact links are checked for their bounded analytics events, but must
    // never invoke a device handler while this test is running.
    document.addEventListener('click', (event) => {
      if (event.target instanceof Element && event.target.closest('a[href^="tel:"], a[href^="sms:"], a[href^="mailto:"]')) {
        event.preventDefault();
      }
    }, true);
  }, initial);

  await context.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin === publicOrigin) {
      if (request.method() === 'POST' && url.pathname === '/thanks/') {
        const fields = new URLSearchParams(request.postData() || '');
        state.posts.push({
          fieldNames: [...new Set([...fields.keys()])].sort(),
          intent: fields.get('intent'),
          discoverySource: fields.get('discovery_source'),
          formName: fields.get('form-name'),
        });
        return route.fulfill(await localReply('/thanks/', url.search));
      }
      if (!['GET', 'HEAD'].includes(request.method())) {
        return route.abort('blockedbyclient');
      }
      return route.fulfill(await localReply(url.pathname, url.search));
    }

    state.externalHosts.add(url.hostname);
    // This fulfills optional vendor scripts and pixels locally. No request is
    // allowed to leave the machine during a production-origin simulation.
    return route.fulfill({ status: 204, headers: { 'content-type': 'text/javascript' }, body: '' });
  });
  return { context, state };
}

function observe(page, state) {
  page.on('console', (message) => {
    const text = message.text();
    if (isCspMessage(text)) state.csp.push(text);
  });
  page.on('pageerror', (error) => state.errors.push(error.message));
  page.on('response', (response) => {
    if (new URL(response.url()).origin === publicOrigin && response.status() >= 400) {
      state.localFailures.push({ status: response.status(), path: new URL(response.url()).pathname });
    }
  });
  page.on('requestfailed', (request) => {
    if (new URL(request.url()).origin === publicOrigin) {
      state.localFailures.push({ status: request.failure()?.errorText || 'failed', path: new URL(request.url()).pathname });
    }
  });
}

async function openPage(context, state, path) {
  const page = await context.newPage();
  observe(page, state);
  const response = await page.goto(publicOrigin + path, { waitUntil: 'networkidle', timeout: 45_000 });
  assert.ok(response, `no document response for ${path}`);
  assert.match(response.headers()['content-security-policy'] || '', /default-src 'self'/, `${path} lacks production CSP`);
  return page;
}

async function assertNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(() => Math.max(
    document.documentElement.scrollWidth - document.documentElement.clientWidth,
    document.body.scrollWidth - document.documentElement.clientWidth,
  ));
  assert.ok(overflow <= 1, `${label} has ${overflow}px horizontal overflow`);
}

async function closeContext(context, state) {
  report.cspViolations.push(...state.csp);
  report.pageErrors.push(...state.errors);
  report.localResourceFailures.push(...state.localFailures);
  report.externalRequestHosts.push(...state.externalHosts);
  await context.close();
}

async function run() {
  fs.mkdirSync(evidence, { recursive: true });
  const probe = await fetch(localBase + '/', { headers: { 'accept-encoding': 'identity' } });
  assert.equal(probe.status, 200, `local production candidate unavailable at ${localBase}`);
  assert.match(probe.headers.get('content-security-policy') || '', /default-src 'self'/, 'local candidate is not serving global production CSP');
  pass('candidate server is available with the global production CSP');

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    await check('first visit keeps optional vendor requests off until a choice', async () => {
      const { context, state } = await makeContext(browser, { viewport: { width: 390, height: 844 } });
      const page = await openPage(context, state, '/');
      assert.equal(await page.locator('dialog[data-production-consent]').count(), 0, 'first visit mounted a full consent overlay');
      await page.locator('[data-production-open-consent]:visible').click();
      await page.locator('[aria-label="Privacy preferences"]').waitFor({ state: 'visible' });
      await assertNoHorizontalOverflow(page, '390px consent prompt');
      await page.screenshot({ path: path.join(evidence, 'consent-390.png'), fullPage: true });
      assert.deepEqual([...state.externalHosts], []);
      const commands = await eventCommands(page);
      const defaults = commands.find((row) => row[0] === 'consent' && row[1] === 'default');
      assert.deepEqual(defaults?.[2], {
        ad_storage: 'denied', analytics_storage: 'denied', ad_user_data: 'denied',
        ad_personalization: 'denied', wait_for_update: 500,
      });
      await closeContext(context, state);
      return 'first-visit consent prompt and denied default';
    });

    await check('visit counting, Google Ads, and Meta require distinct choices', async () => {
      const { context, state } = await makeContext(browser);
      const page = await openPage(context, state, '/');
      await page.locator('[data-production-open-consent]:visible').click();
      await page.getByRole('button', { name: 'Allow visit counting', exact: true }).click();
      await page.waitForTimeout(150);
      assert.ok(state.externalHosts.has('www.googletagmanager.com'), 'visit counting did not request its allowed Google loader');
      assert.ok(!state.externalHosts.has('connect.facebook.net'), 'Meta loaded from a visit-counting-only choice');
      await page.evaluate(() => window.dispatchEvent(new CustomEvent('lf:open-consent')));
      await page.getByRole('button', { name: 'Allow visits + Google Ads', exact: true }).click();
      const commands = await eventCommands(page);
      const consentUpdates = commands.filter((row) => row[0] === 'consent' && row[1] === 'update').map((row) => row[2]);
      assert.ok(consentUpdates.some((choice) => choice?.ad_storage === 'granted' && choice?.ad_user_data === 'granted'));
      assert.ok(!state.externalHosts.has('connect.facebook.net'), 'Google Ads choice enabled Meta');
      await page.evaluate(() => window.dispatchEvent(new CustomEvent('lf:open-consent')));
      await page.getByRole('button', { name: 'Allow visits + Meta', exact: true }).click();
      await page.waitForTimeout(150);
      assert.ok(state.externalHosts.has('connect.facebook.net'), 'Meta did not wait for its explicit choice');
      await closeContext(context, state);
      return 'separate Google, Google Ads, and Meta consent transitions';
    });

    await check('tile analytics uses a finite consented taxonomy without search or inquiry content', async () => {
      const beforeConsent = await makeContext(browser);
      const privatePage = await openPage(beforeConsent.context, beforeConsent.state, '/');
      const initialTile = privatePage.locator('a.tile[href]').first();
      await initialTile.click();
      await privatePage.locator('#detail[open]').waitFor({ state: 'visible' });
      assert.deepEqual(tileEvents(await eventCommands(privatePage)), [], 'tile events ran before consent');
      // Reader content is correctly modal, so close it before operating the
      // page-level privacy button as a visitor would.
      await privatePage.locator('#close-detail').click();
      await privatePage.locator('[data-production-open-consent]:visible').click();
      await privatePage.getByRole('button', { name: 'Allow visit counting', exact: true }).click();
      await privatePage.waitForTimeout(100);
      assert.deepEqual(tileEvents(await eventCommands(privatePage)), [], 'pre-consent tile activity replayed after consent');
      await closeContext(beforeConsent.context, beforeConsent.state);

      const { context, state } = await makeContext(browser, { analytics: true });
      const page = await openPage(context, state, '/');
      // The contact reader wraps a long document in one element. Exposure must
      // still register when its heading is visible, regardless of tile order.
      await page.locator('a.tile[data-answer="brand-brief"]').click();
      await page.locator('#detail[open]').waitFor({ state: 'visible' });
      await page.waitForFunction(() => (window.dataLayer || []).some((row) => Array.from(row)[1] === 'tile_open'));
      await page.waitForFunction(() => (window.dataLayer || []).some((row) => Array.from(row)[1] === 'answer_view'));
      await page.waitForFunction(() => (window.dataLayer || []).some((row) => Array.from(row)[1] === 'tile_exposure'));
      await page.locator('#close-detail').click();
      await page.locator('a.tile[data-answer="page-services-custom-local-websites"]').click();
      await page.locator('#detail[open]').waitFor({ state: 'visible' });
      await page.waitForFunction(() => (window.dataLayer || []).some((row) => {
        const values = Array.from(row);
        return values[1] === 'tile_exposure' && values[2]?.tile_id === 'services_custom-local-websites';
      }));
      await page.locator('#close-detail').click();
      await page.locator('#explore-toggle').click();
      await page.locator('#preview-search').fill('zzqvxy-unmatched-fixture');
      await page.waitForFunction(() => (window.dataLayer || []).some((row) => Array.from(row)[1] === 'search_no_match'));
      await page.locator('#preview-search').fill('roofing');
      const result = page.locator('#search-results a.search-result').first();
      await result.waitFor({ state: 'visible' });
      await result.click();
      await page.waitForFunction(() => (window.dataLayer || []).some((row) => Array.from(row)[1] === 'search_result_selected'));
      const events = tileEvents(await eventCommands(page));
      for (const row of events) {
        const parameters = row[2] || {};
        assert.match(String(parameters.tile_id || ''), /^(mosaic|[a-z0-9_-]{1,96})$/);
        // Existing GA delivery supplies only its sanitized document context;
        // the bridge contributes exactly the finite tile ID and funnel stage.
        assert.deepEqual(Object.keys(parameters).filter((key) => ![
          'funnel_stage', 'tile_id', 'page_location', 'page_referrer',
        ].includes(key)), []);
        assert.match(String(parameters.page_location || ''), /^https:\/\/littlefightnyc\.com\/[^?#]*$/);
        assert.match(String(parameters.page_referrer || ''), /^$|^https:\/\/[a-z0-9.-]+\/$/i);
      }
      const serialised = JSON.stringify(events);
      assert.ok(!serialised.includes('zzqvxy-unmatched-fixture') && !serialised.includes('verifier@example.test'));
      await closeContext(context, state);
      return 'tile open, answer view, exposure, result selection, and no-match; no pre-consent replay or raw query';
    });

    await check('direct progressive islands mount and preserve static contact channels', async () => {
      const { context, state } = await makeContext(browser, { analytics: true });
      for (const [route, selector] of [
        ['/tech-audit/?intent=website', 'form[name="tech-audit-scratch"]'],
        ['/contact/', '.lf-contact-page'],
        ['/thanks/', '.lf-thanks'],
        ['/website-check/', '.lf-website-check'],
      ]) {
        const page = await openPage(context, state, route);
        await page.locator(selector).waitFor({ state: 'visible' });
        await page.close();
      }
      const contact = await openPage(context, state, '/contact/');
      for (const [scheme, eventName] of [['tel:', 'phone_click'], ['sms:', 'sms_click'], ['mailto:', 'email_click']]) {
        await contact.locator(`a[href^="${scheme}"]:visible`).first().click();
        await contact.waitForFunction((name) => (window.dataLayer || []).some((row) =>
          Array.from(row)[0] === 'event' && Array.from(row)[1] === name,
        ), eventName);
        assert.ok(namedEventCount(await eventCommands(contact), eventName) >= 1, `${scheme} did not keep its contact event`);
      }
      await closeContext(context, state);
      return 'tech audit, contact, thanks, website check; call/text/email channels';
    });

    await check('invalid inquiry stays client-side and does not create a receipt marker', async () => {
      const { context, state } = await makeContext(browser);
      const page = await openPage(context, state, '/tech-audit/?intent=website');
      const form = page.locator('form[name="tech-audit-scratch"]');
      await form.waitFor({ state: 'visible' });
      await form.locator('button[type="submit"]').click();
      await page.waitForTimeout(100);
      assert.equal(state.posts.length, 0);
      assert.equal(await page.evaluate(() => sessionStorage.getItem('lf_tech_audit_submitted')), null);
      await closeContext(context, state);
      return 'zero intercepted POSTs and no session receipt';
    });

    await check('native inquiry contract posts once and thank-you counts its hydrated receipt once', async () => {
      const { context, state } = await makeContext(browser, { analytics: true, viewport: { width: 390, height: 844 } });
      const page = await openPage(context, state, '/tech-audit/?intent=website');
      const form = page.locator('form[name="tech-audit-scratch"]');
      await form.waitFor({ state: 'visible' });
      await assertNoHorizontalOverflow(page, '390px native inquiry form');
      await page.screenshot({ path: path.join(evidence, 'native-form-390.png'), fullPage: true });
      assert.equal(await form.getAttribute('method'), 'POST');
      assert.equal(await form.getAttribute('data-netlify'), 'true');
      assert.equal(await form.getAttribute('netlify-honeypot'), 'bot-field');
      assert.equal(await form.locator('[name="form-name"]').inputValue(), 'tech-audit-scratch');
      for (const name of ['name', 'business', 'contact', 'message', 'intent', 'discovery_source', 'lead_origin']) {
        assert.equal(await form.locator(`[name="${name}"]`).count(), 1, `missing ${name}`);
      }
      await form.locator('[name="name"]').fill('Local production verifier');
      await form.locator('[name="business"]').fill('Local verifier business');
      await form.locator('[name="contact"]').fill('verifier@example.test');
      await form.locator('[name="follow_up"]').selectOption('email');
      await form.locator('[name="discovery_source"]').selectOption('chatgpt');
      await form.locator('[name="message"]').fill('Local browser verification only.');
      await form.locator('button[type="submit"]').click();
      await page.waitForURL(/\/thanks\//, { timeout: 10_000 });
      assert.equal(state.posts.length, 1, 'valid form must make exactly one intercepted POST');
      assert.equal(state.posts[0].discoverySource, 'chatgpt');
      assert.equal(state.posts[0].formName, 'tech-audit-scratch');
      assert.equal(state.posts[0].intent, 'website');
      for (const field of ['form-name', 'name', 'business', 'contact', 'message', 'intent', 'discovery_source', 'lead_origin', 'bot-field']) {
        assert.ok(state.posts[0].fieldNames.includes(field), `POST omitted ${field}`);
      }
      await page.getByRole('heading', { name: /Your website message is with us/i }).waitFor({ state: 'visible' });
      await page.waitForTimeout(100);
      assert.equal(namedEventCount(await eventCommands(page), 'generate_lead'), 1);
      assert.equal(await page.evaluate(() => sessionStorage.getItem('lf_tech_audit_submitted')), null);
      await page.reload({ waitUntil: 'networkidle' });
      assert.equal(namedEventCount(await eventCommands(page), 'generate_lead'), 0, 'reloading a receipt must not create another lead');
      const serialised = JSON.stringify(await eventCommands(page));
      assert.ok(!serialised.includes('verifier@example.test') && !serialised.includes('Local browser verification only.'), 'analytics contained inquiry content');
      await closeContext(context, state);
      report.validPost = { posted: true, fieldNames: state.posts[0].fieldNames, receiptLeadEvents: 1, reloadLeadEvents: 0 };
      return 'one locally intercepted POST; one hydrated receipt event; no inquiry content in analytics';
    });

    await check('a forged thank-you URL has no receipt and no lead event', async () => {
      const { context, state } = await makeContext(browser, { analytics: true });
      const page = await openPage(context, state, '/thanks/?submitted=tech-audit&confirmed_intent=website&confirmed_source=chatgpt');
      await page.locator('.lf-thanks').waitFor({ state: 'visible' });
      assert.equal(await page.evaluate(() => sessionStorage.getItem('lf_tech_audit_submitted')), null);
      assert.equal(namedEventCount(await eventCommands(page), 'generate_lead'), 0);
      assert.equal(state.posts.length, 0);
      await closeContext(context, state);
      return 'forged query cannot manufacture a lead';
    });
  } finally {
    await browser.close();
  }

  const allStates = report.assertions;
  assert.ok(allStates.every((item) => item.passed), 'a production assertion failed');
  assert.deepEqual(report.cspViolations, [], `CSP violations: ${report.cspViolations.join(' | ')}`);
  assert.deepEqual(report.pageErrors, [], `page errors: ${report.pageErrors.join(' | ')}`);
  assert.deepEqual(report.localResourceFailures, [], `local resource failures: ${JSON.stringify(report.localResourceFailures)}`);
  const externalHosts = [...new Set(report.externalRequestHosts)];
  assert.ok(externalHosts.every((host) => allowedVendorHosts.has(host)), `unexpected external host: ${externalHosts.join(', ')}`);
  report.finishedAt = new Date().toISOString();
  report.evidence = [
    path.relative(path.resolve(__dirname, '..', '..'), path.join(evidence, 'consent-390.png')),
    path.relative(path.resolve(__dirname, '..', '..'), path.join(evidence, 'native-form-390.png')),
  ];
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
}

run().catch((error) => {
  process.stderr.write((error.stack || String(error)) + '\n');
  process.stderr.write(JSON.stringify(report, null, 2) + '\n');
  process.exitCode = 1;
});
