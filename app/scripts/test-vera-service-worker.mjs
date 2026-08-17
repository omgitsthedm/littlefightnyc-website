import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const workerSource = await readFile(new URL("../public/vera/sw.js", import.meta.url), "utf8");
const dataURL = "https://littlefightnyc.com/vera/data/public.json";
const dataPath = "/vera/data/public.json";
const savedPublication = {
  generated_at: "2026-08-16T00:00:00Z",
  origin: "cloud",
  pool: [{ listing_uid: "saved-listing" }],
  shortlist: [],
};

function createHarness(fetchImplementation) {
  const listeners = new Map();
  const stores = new Map();
  const putCalls = [];
  const cacheFor = (name) => {
    if (!stores.has(name)) stores.set(name, new Map());
    const store = stores.get(name);
    return {
      async addAll() {},
      async put(key, response) {
        putCalls.push({ name, key });
        store.set(key, response.clone());
      },
      async match(key) {
        const response = store.get(key);
        return response ? response.clone() : undefined;
      },
      async delete(key) {
        return store.delete(key);
      },
    };
  };
  const caches = {
    async open(name) {
      return cacheFor(name);
    },
    async keys() {
      return [...stores.keys()];
    },
    async delete(name) {
      return stores.delete(name);
    },
  };
  const self = {
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    skipWaiting() {},
    clients: { claim() {} },
  };

  vm.runInNewContext(workerSource, {
    Date,
    Error,
    Headers,
    JSON,
    Promise,
    Response,
    URL,
    caches,
    console,
    fetch: fetchImplementation,
    location: { origin: "https://littlefightnyc.com" },
    self,
  }, { filename: "vera/sw.js" });

  return {
    caches,
    putCalls,
    dispatch(request = new Request(dataURL)) {
      const waits = [];
      let response;
      listeners.get("fetch")({
        request,
        respondWith(value) {
          response = Promise.resolve(value);
        },
        waitUntil(value) {
          waits.push(Promise.resolve(value));
        },
      });
      assert.ok(response, "VERA feed request must have a response handler");
      return {
        response,
        waits,
        waitUntil: () => Promise.all(waits),
      };
    },
  };
}

async function seedPublication(harness) {
  const cache = await harness.caches.open("vera-feed-v2");
  await cache.put(dataPath, new Response(JSON.stringify(savedPublication), {
    headers: { "X-Vera-Cached-At": "2026-08-16T00:00:00.000Z" },
  }));
  harness.putCalls.length = 0;
}

async function assertCachedFallback(status) {
  const harness = createHarness(async () => new Response(null, { status }));
  await seedPublication(harness);
  const operation = harness.dispatch();
  const response = await operation.response;

  assert.equal(response.status, 200, `${status} should use the saved publication`);
  assert.equal(response.headers.get("X-Vera-Cache"), "2026-08-16T00:00:00.000Z");
  assert.deepEqual(await response.json(), savedPublication);
  assert.equal(harness.putCalls.length, 0, `${status} must not overwrite cached data`);
}

await assertCachedFallback(304);
await assertCachedFallback(429);
await assertCachedFallback(503);

{
  const harness = createHarness(async () => {
    throw new TypeError("network unavailable");
  });
  await seedPublication(harness);
  const response = await harness.dispatch().response;
  assert.equal(response.status, 200, "network errors should use the saved publication");
  assert.equal(response.headers.get("X-Vera-Cache"), "2026-08-16T00:00:00.000Z");
}

{
  const harness = createHarness(async () => new Response("upstream unavailable", { status: 503 }));
  const response = await harness.dispatch().response;
  assert.equal(response.status, 503, "without a saved publication, preserve the network status");
  assert.equal(response.headers.get("X-Vera-Cache"), null);
}

{
  const harness = createHarness(async () => new Response("upstream unavailable", { status: 503 }));
  const cache = await harness.caches.open("vera-feed-v2");
  await cache.put(dataPath, new Response('{"legacy":"invalid"}', {
    headers: { "X-Vera-Cached-At": "2026-08-15T00:00:00.000Z" },
  }));
  const operation = harness.dispatch();
  const response = await operation.response;
  assert.equal(response.status, 503, "an invalid legacy cache must not mask the real network status");
  assert.equal(await cache.match(dataPath), undefined, "an invalid legacy cache should be pruned during migration");
  await operation.waitUntil();
}

{
  const harness = createHarness(async () => {
    throw new TypeError("network unavailable");
  });
  await assert.rejects(
    harness.dispatch().response,
    /offline, no cached sweep/,
    "a first offline visit should still report the absent publication",
  );
}

{
  const freshPublication = { generated_at: "2026-08-16T00:00:00Z", origin: "cloud", pool: [], shortlist: [] };
  const harness = createHarness(async () => new Response(JSON.stringify(freshPublication), {
    headers: { "Content-Type": "application/json" },
  }));
  const operation = harness.dispatch();
  const response = await operation.response;

  assert.deepEqual(await response.json(), freshPublication);
  assert.equal(operation.waits.length, 1, "a successful publication write must extend the worker lifetime");
  await operation.waitUntil();
  const cached = await (await harness.caches.open("vera-feed-v2")).match(dataPath);
  assert.ok(cached, "the completed lifetime task must persist the fresh publication");
  assert.equal(cached.headers.get("X-Vera-Cached-At") !== null, true);
  assert.deepEqual(await cached.json(), freshPublication);
}

{
  const harness = createHarness(async () => new Response("{}", {
    status: 200,
    headers: { "Content-Type": "application/json" },
  }));
  const operation = harness.dispatch();
  assert.equal((await operation.response).status, 200, "without a cache, preserve the invalid live response for app retries");
  await operation.waitUntil();
  const cached = await (await harness.caches.open("vera-feed-v2")).match(dataPath);
  assert.equal(cached, undefined, "a schema-invalid publication must never enter the fallback cache");
}

{
  const harness = createHarness(async () => new Response("{}", {
    status: 200,
    headers: { "Content-Type": "application/json" },
  }));
  await seedPublication(harness);
  const operation = harness.dispatch();
  const response = await operation.response;
  assert.equal(response.headers.get("X-Vera-Cache"), "2026-08-16T00:00:00.000Z");
  assert.deepEqual(await response.json(), savedPublication, "invalid 200 data should fall back to the saved publication");
  await operation.waitUntil();
  assert.equal(harness.putCalls.length, 0, "an invalid 200 must not replace a saved publication");
}

{
  let requestCount = 0;
  let resolveOlder;
  let resolveNewer;
  const olderResponse = new Promise((resolve) => { resolveOlder = resolve; });
  const newerResponse = new Promise((resolve) => { resolveNewer = resolve; });
  const harness = createHarness(() => {
    requestCount += 1;
    return requestCount === 1 ? olderResponse : newerResponse;
  });
  const olderOperation = harness.dispatch();
  const newerOperation = harness.dispatch();

  resolveNewer(new Response('{"generated_at":"2026-08-17T00:00:00Z","origin":"cloud","pool":[],"shortlist":[]}', {
    headers: { "Content-Type": "application/json" },
  }));
  assert.equal((await newerOperation.response).status, 200);
  await newerOperation.waitUntil();

  resolveOlder(new Response('{"generated_at":"2026-08-15T00:00:00Z","origin":"cloud","pool":[],"shortlist":[]}', {
    headers: { "Content-Type": "application/json" },
  }));
  assert.equal((await olderOperation.response).status, 200);
  await olderOperation.waitUntil();

  const cached = await (await harness.caches.open("vera-feed-v2")).match(dataPath);
  assert.equal(
    (await cached.json()).generated_at,
    "2026-08-17T00:00:00Z",
    "a slower older response must not overwrite a newer saved publication",
  );
}

console.log("VERA service-worker resilience checks passed: fallbacks, validation, lifecycle persistence, and monotonic writes are covered.");
