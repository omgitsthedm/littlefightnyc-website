import type { Context } from "@netlify/functions";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@netlify/blobs", () => ({ getStore: vi.fn() }));
import { getStore } from "@netlify/blobs";
import runAudit from "../../run-audit.mts";
import recordEngagement from "../../record-engagement.mts";
import { handler as login } from "../../identity-login.mts";
import { handler as signup } from "../../identity-signup.mts";
import { handler as validate } from "../../identity-validate.mts";
import { renderAuditEmail } from "../../lib/audit-email.mts";
import { requestPageSpeed } from "../../lib/pagespeed-request.mts";

class MemoryStore {
  entries = new Map<string, unknown>();
  async get(key: string) { return structuredClone(this.entries.get(key) ?? null); }
  async setJSON(key: string, value: unknown) { this.entries.set(key, structuredClone(value)); }
  async delete(key: string) { this.entries.delete(key); }
}
const stores = new Map<string, MemoryStore>();
function store(name: string) {
  if (!stores.has(name)) stores.set(name, new MemoryStore());
  return stores.get(name)!;
}
const context = { ip: "203.0.113.10", deploy: { context: "production" } } as Context;
function auditRequest(url = "https://example.com") {
  return new Request("https://littlefightnyc.com/examples/audit/api/run-audit", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ url, email: "owner@example.com" }),
  });
}
beforeEach(() => {
  stores.clear();
  vi.mocked(getStore).mockImplementation((options: unknown) => store(
    typeof options === "string" ? options : (options as { name: string }).name,
  ) as never);
  vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 202 })));
});

describe("website check email outcomes", () => {
  const base = {
    companyName: "littlefightnyc.com", domain: "littlefightnyc.com",
    grade: null, overallScore: null, measuredCategoryCount: 0,
    auditUrl: "https://littlefightnyc.com/examples/audit/report/littlefightnyc-com-test",
  };
  it("gives an interrupted check a useful recovery without presenting an audit or score", () => {
    const email = renderAuditEmail(base);
    expect(email.subject).toContain("couldn’t finish");
    expect(email.html).toContain("We couldn’t complete this check.");
    expect(email.html).toContain("doesn’t mean your website is broken");
    expect(email.html).toContain("Get a free human first look");
    expect(email.html).toContain("pagespeed.web.dev/analysis?url=");
    expect(email.html).not.toMatch(/N\/A|just finished|full report|Grade|\/ 100/);
    expect(email.text).toContain("There are no scores or findings to share yet.");
  });
  it("labels partial results and withholds the overall badge even if a caller supplies a score", () => {
    const email = renderAuditEmail({ ...base, measuredCategoryCount: 2, overallScore: 90, grade: "A" });
    expect(email.subject).toContain("partial results");
    expect(email.html).toContain("2 of the 4 checks");
    expect(email.html).not.toMatch(/Grade A|\/ 100|N\/A/);
    expect(email.text).not.toContain("90/100");
  });
  it("renders a measured complete check with an honest summary and plain-text alternative", () => {
    const email = renderAuditEmail({ ...base, measuredCategoryCount: 4, overallScore: 87, grade: "B" });
    expect(email.subject).toContain("is ready");
    expect(email.html).toContain("87");
    expect(email.html).toContain("See my website check");
    expect(email.text).toContain("Average of four mobile checks: 87/100");
  });
  it("escapes supplied business text and prevents mail-header injection", () => {
    const email = renderAuditEmail({ ...base, companyName: '<img src=x onerror="alert(1)">', domain: "example.com\r\nBcc: victim@example.com" });
    expect(email.subject).not.toMatch(/[\r\n]/);
    expect(email.html).not.toContain('<img src=x');
    expect(email.html).toContain("&lt;img");
  });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.mocked(getStore).mockReset(); });

describe("PageSpeed provider recovery", () => {
  it("requires a project key instead of silently depending on exhausted anonymous quota", async () => {
    await expect(requestPageSpeed("https://example.com", undefined)).rejects.toThrow("pagespeed_not_configured");
    expect(fetch).not.toHaveBeenCalled();
  });
  it("does not retry quota exhaustion or expose provider response data", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('private provider details', { status: 429 }));
    await expect(requestPageSpeed("https://example.com", "test-only")).rejects.toThrow(/^pagespeed_quota_exhausted$/);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("recovers once from a transient service error", async () => {
    vi.useFakeTimers();
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 503 })).mockResolvedValueOnce(new Response('{}', { status: 200 }));
    const request = requestPageSpeed("https://example.com", "test-only");
    await vi.runAllTimersAsync();
    expect((await request).status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it("bounds repeated service failures to two attempts", async () => {
    vi.useFakeTimers();
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 503 }));
    const request = expect(requestPageSpeed("https://example.com", "test-only")).rejects.toThrow(/^pagespeed_http_503$/);
    await vi.runAllTimersAsync();
    await request;
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});

describe("public audit operation after private application retirement", () => {
  it("queues a real public request with one-time background authorization and no additional stores", async () => {
    const response = await runAudit(auditRequest(), context);
    expect(response.status).toBe(200);
    const { id } = await response.json();
    expect(id).toMatch(/^example-com-[a-f0-9]{8}$/);
    expect([...stores.keys()].sort()).toEqual(["audit-jobs", "audit-status", "rate-limits"]);
    expect(store("audit-status").entries.get(id)).toMatchObject({ status: "running", step: "queued" });
    const [endpoint, options] = vi.mocked(fetch).mock.calls[0];
    expect(endpoint).toBe("https://littlefightnyc.com/.netlify/functions/run-audit-background");
    expect(JSON.parse(options!.body as string)).toMatchObject({ url: "https://example.com", email: "owner@example.com", slug: id });
    const token = (options!.headers as Record<string, string>)["X-Audit-Job-Token"];
    expect(token).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(store("audit-jobs").entries.get(id))).not.toContain(token);
  });
  it("records a failed background trigger as an error and invalidates the job token", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 503 }));
    const response = await runAudit(auditRequest(), context);
    const { id } = await response.json();
    expect(store("audit-status").entries.get(id)).toMatchObject({ status: "error", step: "queued" });
    expect(store("audit-jobs").entries.has(id)).toBe(false);
  });
  it("keeps the three-request public limit", async () => {
    for (let i = 0; i < 3; i++) expect((await runAudit(auditRequest(), context)).status).toBe(200);
    expect((await runAudit(auditRequest(), context)).status).toBe(429);
    expect(fetch).toHaveBeenCalledTimes(3);
  });
  it("rejects private targets without dispatching background work", async () => {
    expect((await runAudit(auditRequest("http://127.0.0.1"), context)).status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
    expect(stores.size).toBe(0);
  });
  it.each([undefined, "https://foreign.example"])("rejects an engagement beacon with origin %s", async (origin) => {
    const headers = new Headers({ "content-type": "application/json" });
    if (origin) headers.set("origin", origin);
    const response = await recordEngagement(new Request("https://littlefightnyc.com/examples/audit/api/record-engagement", {
      method: "POST", headers, body: JSON.stringify({ slug: "example-com-12345678", scrollDepth: 100, timeOnPage: 300, sectionsViewed: ["findings"] }),
    }), context);
    expect(response.status).toBe(403);
    expect(stores.size).toBe(0);
  });
  it("keeps valid report engagement within the public report stores", async () => {
    const slug = "example-com-12345678";
    store("audit-meta").entries.set(slug, { domain: "example.com" });
    const response = await recordEngagement(new Request("https://littlefightnyc.com/examples/audit/api/record-engagement", {
      method: "POST", headers: { "content-type": "application/json", origin: "https://littlefightnyc.com" },
      body: JSON.stringify({ slug, scrollDepth: 72, timeOnPage: 91, sectionsViewed: ["findings", "roadmap"] }),
    }), context);
    expect(response.status).toBe(200);
    expect([...stores.keys()].sort()).toEqual(["audit-engagement", "audit-meta"]);
    expect(store("audit-engagement").entries.get(slug)).toMatchObject({ maxScrollDepth: 72, maxTimeOnPage: 91 });
    expect(fetch).not.toHaveBeenCalled();
  });
  it.each([login, signup, validate])("keeps retired Identity access closed without storage or provider calls", async (handler) => {
    const response = await handler({} as never, {} as never, () => {});
    expect(response).toMatchObject({ statusCode: 403 });
    expect(stores.size).toBe(0);
    expect(fetch).not.toHaveBeenCalled();
  });
});
