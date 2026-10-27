import { describe, expect, it } from "vitest";
import { leadCampaignParameters, publicCampaignParameters, publicReferralParameters } from "./socialCampaign";

const searchCampaign = {
  utm_source: "google",
  utm_medium: "cpc",
  utm_campaign: "gulf_websites_search_2026_09",
  utm_content: "search_human_help",
};

describe("public campaign attribution", () => {
  it.each(["chatgpt.com", "claude.ai", "perplexity.ai", "gemini.google.com", "copilot.microsoft.com", "meta.ai", "muse.ai"])(
    "retains the fixed %s source without private prompt or campaign values", (source) => {
      const input = new URLSearchParams({ utm_source: source, prompt: "private-fixture", utm_campaign: "private-fixture", utm_content: "private-fixture" });
      const expected = { utm_source: source, utm_medium: "referral" };
      expect(Object.fromEntries(publicCampaignParameters(input)!)).toEqual(expected);
      expect(Object.fromEntries(leadCampaignParameters(input)!)).toEqual(expected);
    },
  );

  it.each([
    "utm_source=chatgpt.com&utm_medium=cpc",
    "utm_source=chatgpt.com&gclid=private-fixture",
    "utm_source=chatgpt.com&msclkid=private-fixture",
    "utm_source=chatgpt.com&utm_source=private-fixture",
    "utm_source=chatgpt.com&utm_medium=referral&utm_medium=cpc",
    "utm_source=chatgpt.com.evil.invalid",
  ])("rejects a paid, ambiguous or invented assistant arrival: %s", query => {
    expect(publicCampaignParameters(new URLSearchParams(query))).toBeNull();
    expect(leadCampaignParameters(new URLSearchParams(query))).toBeNull();
  });

  it.each(["https://chatgpt.com.evil.invalid/", "https://constructor/", "https://private-fixture.invalid/", "file://chatgpt.com/private", "not a URL"])(
    "rejects an unknown referring address: %s", referrer => expect(publicReferralParameters(referrer)).toBeNull(),
  );

  it("classifies a recognized referrer without retaining its private path or query", () => {
    expect(publicReferralParameters("https://chat.openai.com/c/private-fixture?prompt=private-fixture")?.toString())
      .toBe("utm_source=chatgpt.com&utm_medium=referral");
    expect(publicReferralParameters("https://www.google.com/search?q=private-fixture")?.toString())
      .toBe("utm_source=google&utm_medium=organic");
  });
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

  it.each([
    "utm_source=facebook&utm_medium=organic_social&utm_campaign=lfnyc_first_look_2026_09&utm_content=maps_clarity",
    "utm_source=instagram&utm_medium=organic_social&utm_campaign=lfnyc_first_look_2026_09&utm_content=salon_booking_path",
    "utm_source=partner&utm_medium=referral&utm_campaign=lfnyc_first_look_2026_09&utm_content=owner_control",
    "utm_source=client&utm_medium=referral&utm_campaign=lfnyc_first_look_2026_09&utm_content=owner_control",
    "utm_source=google&utm_medium=cpc&utm_campaign=nyc_websites_search_2026_09&utm_content=search_salon_booking",
    "utm_source=facebook&utm_medium=paid_social&utm_campaign=nyc_first_look_2026_09&utm_content=nyc_owner_control",
    "utm_source=instagram&utm_medium=paid_social&utm_campaign=nyc_first_look_2026_09&utm_content=salon_booking_path",
  ])("retains an approved first-look campaign: %s", (query) => {
    const input = new URLSearchParams(query +
      "&email=private-fixture%40example.com&utm_term=private-query&gclid=private-click-id&business=private-business");
    expect(publicCampaignParameters(input)?.toString()).toBe(query);
    expect(leadCampaignParameters(input)?.toString()).toBe(query);
  });

  it("retains Little Fight's existing Instagram bio label without inventing a campaign", () => {
    const input = new URLSearchParams(
      "utm_source=ig&utm_medium=social&utm_content=link_in_bio&email=private-fixture%40example.com&utm_term=private-query&gclid=private-click-id",
    );
    const expected = "utm_source=ig&utm_medium=social&utm_content=link_in_bio";
    expect(publicCampaignParameters(input)?.toString()).toBe(expected);
    expect(leadCampaignParameters(input)?.toString()).toBe(expected);
  });

  it.each([
    "utm_source=linkedin&utm_medium=organic_social&utm_campaign=lfnyc_first_look_2026_09&utm_content=maps_clarity",
    "utm_source=facebook&utm_medium=paid_social&utm_campaign=lfnyc_first_look_2026_09&utm_content=maps_clarity",
    "utm_source=partner&utm_medium=organic_social&utm_campaign=lfnyc_first_look_2026_09&utm_content=maps_clarity",
    "utm_source=client&utm_medium=referral&utm_campaign=lfnyc_first_look_2026_09&utm_content=recipient-123",
    "utm_source=facebook&utm_medium=organic_social&utm_campaign=lfnyc_first_look_2026_09&utm_content=private-query",
    "utm_source=ig&utm_medium=social&utm_campaign=private-campaign&utm_content=link_in_bio",
    "utm_source=google&utm_medium=cpc&utm_campaign=nyc_websites_search_2026_09&utm_content=recipient-123",
    "utm_source=google&utm_medium=cpc&utm_campaign=nyc_websites_search_2026_09&utm_content=private-query",
    "utm_source=facebook&utm_medium=organic_social&utm_campaign=nyc_first_look_2026_09&utm_content=nyc_owner_control",
    "utm_source=linkedin&utm_medium=paid_social&utm_campaign=nyc_first_look_2026_09&utm_content=salon_booking_path",
    "utm_source=instagram&utm_medium=paid_social&utm_campaign=nyc_first_look_2026_09&utm_content=recipient-123",
  ])("rejects an unapproved first-look combination: %s", (query) => {
    const input = new URLSearchParams(query);
    expect(publicCampaignParameters(input)).toBeNull();
    expect(leadCampaignParameters(input)).toBeNull();
  });

  it("retains only the fixed Business Profile labels for form handoff", () => {
    expect(leadCampaignParameters(new URLSearchParams(
      "utm_source=google&utm_medium=organic&utm_campaign=business_profile",
    ))?.toString()).toBe(
      "utm_source=google&utm_medium=organic&utm_campaign=business_profile",
    );
    const input = new URLSearchParams(
      "utm_source=google&utm_medium=organic&utm_campaign=business_profile&utm_content=booking&email=private-fixture%40example.com",
    );
    expect(leadCampaignParameters(input)?.toString()).toBe(
      "utm_source=google&utm_medium=organic&utm_campaign=business_profile&utm_content=booking",
    );
    expect(leadCampaignParameters(new URLSearchParams(
      "utm_source=google&utm_medium=organic&utm_campaign=business_profile&utm_content=private-content",
    ))).toBeNull();
  });
});
