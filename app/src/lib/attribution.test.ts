import { afterEach, describe, expect, it, vi } from "vitest";
import { applyCurrentAttribution, captureAttribution, readAttribution } from "./attribution";

const consent = vi.hoisted(() => ({ value: "granted" }));
vi.mock("./consent", () => ({ getAnalyticsConsent: () => consent.value }));

const STORAGE_KEY = "lf-attribution";

function installWindow(search: string, initial: Record<string, string> | null = null) {
  consent.value = "granted";
  vi.stubGlobal("document", { referrer: "" });
  const values = new Map<string, string>();
  if (initial) values.set(STORAGE_KEY, JSON.stringify(initial));
  vi.stubGlobal("window", {
    location: { search },
    sessionStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    },
  });
  return values;
}

describe("lead attribution", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("drops a legacy cached arbitrary campaign before a form can read it", () => {
    installWindow("", {
      utm_source: "private-recipient",
      utm_medium: "email",
      utm_campaign: "private-campaign",
      utm_content: "private-content",
    });
    expect(readAttribution()).toEqual({});
  });

  it("does not credit an older campaign for a new unrecognized arrival", () => {
    const values = installWindow(
      "?utm_source=instagram&utm_medium=organic_social&utm_campaign=lfnyc_first_look_2026_09&utm_content=maps_clarity",
    );
    captureAttribution();
    (window.location as { search: string }).search =
      "?utm_source=unknown&utm_medium=private&utm_campaign=private-campaign&utm_content=private-content";
    captureAttribution();
    expect(readAttribution()).toEqual({});
    expect(values.has(STORAGE_KEY)).toBe(false);
  });

  it("captures a source-only ChatGPT landing before the inquiry's first render", () => {
    const values = installWindow("?utm_source=chatgpt.com&prompt=private-fixture&utm_campaign=private-fixture");
    expect(readAttribution()).toEqual({ utm_source: "chatgpt.com", utm_medium: "referral" });
    expect(values.get(STORAGE_KEY)).not.toContain("private-fixture");
    window.location.search = "";
    vi.stubGlobal("document", { referrer: "https://littlefightnyc.com/services/" });
    expect(readAttribution()).toEqual({ utm_source: "chatgpt.com", utm_medium: "referral" });
  });

  it.each(["claude.ai", "muse.ai", "www.perplexity.ai", "www.google.com", "l.instagram.com"])(
    "keeps only public labels from %s across the form handoff", (host) => {
      const values = installWindow("");
      vi.stubGlobal("document", { referrer: `https://${host}/private-fixture?token=private-fixture` });
      const attribution = readAttribution();
      expect(attribution.utm_source).toBeTruthy();
      expect(values.get(STORAGE_KEY)).not.toContain("private-fixture");
    },
  );

  it("clears attribution on consent withdrawal and does not recapture it", () => {
    const values = installWindow("?utm_source=chatgpt.com");
    captureAttribution();
    expect(values.has(STORAGE_KEY)).toBe(true);
    consent.value = "denied";
    expect(readAttribution()).toEqual({});
    captureAttribution();
    expect(values.has(STORAGE_KEY)).toBe(false);
    const body = new URLSearchParams({ "form-name": "tech-audit-scratch", utm_source: "chatgpt.com", utm_medium: "referral", message: "Private local fixture" });
    expect(applyCurrentAttribution(body).toString()).toBe("form-name=tech-audit-scratch&message=Private+local+fixture");
  });

  it("replaces tampered hidden campaign inputs with the current bounded arrival", () => {
    installWindow("?utm_source=muse.ai");
    const body = new URLSearchParams("utm_source=private-fixture&utm_source=other-private-fixture&utm_campaign=private-fixture&intent=website");
    expect(applyCurrentAttribution(body).toString()).toBe("intent=website&utm_source=muse.ai&utm_medium=referral");
  });

  it("does not use an organic referrer for an unrecognized paid click", () => {
    installWindow("?msclkid=private-fixture", { utm_source: "chatgpt.com", utm_medium: "referral" });
    vi.stubGlobal("document", { referrer: "https://www.bing.com/search?q=private-fixture" });
    expect(readAttribution()).toEqual({});
  });

  it("does not relabel a paid or assistant arrival from the unchanged SPA referrer", () => {
    installWindow("?utm_source=google&utm_medium=cpc&utm_campaign=gulf_websites_search_2026_09&utm_content=search_human_help");
    vi.stubGlobal("document", { referrer: "https://www.google.com/" });
    captureAttribution();
    window.location.search = "";
    expect(readAttribution().utm_medium).toBe("cpc");
    window.location.search = "?utm_source=chatgpt.com";
    captureAttribution();
    window.location.search = "";
    expect(readAttribution().utm_source).toBe("chatgpt.com");
  });

  it("replaces prior campaign fields when a valid no-campaign Instagram arrival follows", () => {
    const values = installWindow(
      "?utm_source=google&utm_medium=cpc&utm_campaign=gulf_websites_search_2026_09&utm_content=search_human_help",
    );
    captureAttribution();
    (window.location as { search: string }).search =
      "?utm_source=ig&utm_medium=social&utm_content=link_in_bio&email=private-fixture%40example.com";
    captureAttribution();
    expect(readAttribution()).toEqual({
      utm_source: "ig",
      utm_medium: "social",
      utm_content: "link_in_bio",
    });
    expect(values.get(STORAGE_KEY)).toBe(
      JSON.stringify({ utm_source: "ig", utm_medium: "social", utm_content: "link_in_bio" }),
    );
  });
});
