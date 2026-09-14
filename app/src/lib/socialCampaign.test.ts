import { describe, expect, it } from "vitest";
import { publicCampaignParameters } from "./socialCampaign";

const searchCampaign = {
  utm_source: "google",
  utm_medium: "cpc",
  utm_campaign: "gulf_websites_search_2026_09",
  utm_content: "search_human_help",
};

describe("public campaign attribution", () => {
  it.each(["search_human_help", "search_owner_control", "search_sitelink"])(
    "retains the fixed Google creative %s without private query values",
    (utm_content) => {
      const expected = { ...searchCampaign, utm_content };
      const input = new URLSearchParams({
        ...expected,
        email: "private-fixture@example.com",
        utm_term: "private search fixture",
        gclid: "private-click-fixture",
        gbraid: "private-braid-fixture",
        wbraid: "private-web-braid-fixture",
        report: "private-report-fixture",
      });
      expect(Object.fromEntries(publicCampaignParameters(input)!)).toEqual(expected);
    },
  );

  it.each([
    { utm_source: "google-private-fixture" },
    { utm_medium: "organic" },
    { utm_campaign: "unapproved-campaign" },
    { utm_content: "recipient-private-fixture" },
    { utm_content: "" },
  ])("rejects an unapproved Google label: %j", (replacement) => {
    expect(publicCampaignParameters(new URLSearchParams({
      ...searchCampaign, ...replacement,
    }))).toBeNull();
  });

  it.each([
    "utm_source=facebook&utm_medium=organic_social&utm_campaign=new_chapter_2026_09&utm_content=01-interior-design-studios",
    "utm_source=instagram&utm_medium=organic_social&utm_campaign=next_chapter_2026_09&utm_content=g01-independent-bike-shops",
    "utm_source=outreach&utm_medium=email&utm_campaign=louisiana_business_2026_09&utm_content=la01-seafood-markets",
    "utm_source=facebook&utm_medium=paid_social&utm_campaign=rv_first_look_2026_09&utm_content=rv_guest_path",
    "utm_source=instagram&utm_medium=paid_social&utm_campaign=rv_first_look_2026_09&utm_content=rv_owner_control",
  ])("preserves an existing campaign: %s", (query) => {
    expect(publicCampaignParameters(new URLSearchParams(query))?.toString()).toBe(query);
  });
});
