import { describe, expect, it } from "vitest";
import type { User } from "@netlify/identity";

import { authorizeDakotaUser, normalizeEmail } from "./auth";

function user(overrides: Partial<User> = {}): User {
  return {
    id: "operator",
    email: "hello@littlefightnyc.com",
    roles: ["dakota_operator"],
    ...overrides,
  };
}

describe("Dakota authorization", () => {
  it("normalizes the exact operator email safely", () => {
    expect(normalizeEmail(" Hello@LittleFightNYC.com ")).toBe(
      "hello@littlefightnyc.com",
    );
  });

  it("requires authentication, exact email, and operator role", () => {
    expect(authorizeDakotaUser(null)).toEqual({ allowed: false, status: 401 });
    expect(authorizeDakotaUser(user({ email: "other@example.com" }))).toEqual({
      allowed: false,
      status: 403,
    });
    expect(authorizeDakotaUser(user({ roles: [] }))).toEqual({
      allowed: false,
      status: 403,
    });
    expect(authorizeDakotaUser(user({ roles: ["other_role"] }))).toEqual({
      allowed: false,
      status: 403,
    });
    expect(authorizeDakotaUser(user({
      email: " Hello@LittleFightNYC.com ",
      roles: ["other_role", "dakota_operator"],
    })).allowed).toBe(true);
    expect(authorizeDakotaUser(user()).allowed).toBe(true);
  });
});
