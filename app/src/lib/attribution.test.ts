import { afterEach, describe, expect, it, vi } from "vitest";
import { captureAttribution, readAttribution } from "./attribution";

const STORAGE_KEY = "lf-attribution";

function installWindow(search: string, initial: Record<string, string> | null = null) {
  const values = new Map<string, string>();
  if (initial) values.set(STORAGE_KEY, JSON.stringify(initial));
  vi.stubGlobal("window", {
    location: { search },
    sessionStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
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

  it("keeps a valid prior campaign through an unrecognized arrival", () => {
    const values = installWindow(
      "?utm_source=instagram&utm_medium=organic_social&utm_campaign=lfnyc_first_look_2026_09&utm_content=maps_clarity",
    );
    captureAttribution();
    (window.location as { search: string }).search =
      "?utm_source=unknown&utm_medium=private&utm_campaign=private-campaign&utm_content=private-content";
    captureAttribution();
    expect(readAttribution()).toEqual({
      utm_source: "instagram",
      utm_medium: "organic_social",
      utm_campaign: "lfnyc_first_look_2026_09",
      utm_content: "maps_clarity",
    });
    expect(values.get(STORAGE_KEY)).not.toContain("private-campaign");
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
