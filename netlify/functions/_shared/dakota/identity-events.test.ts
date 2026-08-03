import { describe, expect, it } from "vitest";

import { enforceDakotaIdentityEvent } from "./identity-events";

function body(email: string): string {
  return JSON.stringify({
    user: {
      email,
      app_metadata: { provider: "google", roles: ["untrusted"] },
    },
  });
}

describe("enforceDakotaIdentityEvent", () => {
  it("rejects every other email", () => {
    expect(enforceDakotaIdentityEvent(body("other@example.com"), true).statusCode).toBe(
      403,
    );
  });

  it("assigns only the Dakota operator role to the allowed account", () => {
    const result = enforceDakotaIdentityEvent(
      body("Hello@LittleFightNYC.com"),
      true,
    );
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body ?? "{}")).toEqual({
      app_metadata: {
        provider: "google",
        roles: ["dakota_operator"],
      },
    });
  });

  it("validates without returning role metadata", () => {
    const result = enforceDakotaIdentityEvent(
      body("hello@littlefightnyc.com"),
      false,
    );
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body ?? "{}")).toEqual({});
  });

  it("rejects malformed Identity events", () => {
    expect(enforceDakotaIdentityEvent("{}", true).statusCode).toBe(400);
    expect(enforceDakotaIdentityEvent("not json", true).statusCode).toBe(400);
  });
});
