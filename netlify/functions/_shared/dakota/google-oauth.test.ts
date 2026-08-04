import { describe, expect, it, vi } from "vitest";

import {
  getGoogleWorkspaceAccessToken,
  GOOGLE_CALENDAR_READ_SCOPES,
  GOOGLE_GMAIL_READ_SCOPES,
  googleApiFailureStatus,
} from "./google-oauth";

const ENVIRONMENT = new Map([
  ["GMAIL_OAUTH_CLIENT_ID", "client-id"],
  ["GMAIL_OAUTH_CLIENT_SECRET", "client-secret"],
  ["GMAIL_OAUTH_REFRESH_TOKEN", "refresh-token"],
]);

function getEnv(name: string): string | undefined {
  return ENVIRONMENT.get(name);
}

describe("Dakota Google OAuth token helper", () => {
  it("returns not_configured without a network request when any existing Gmail OAuth env is absent", async () => {
    const fetcher = vi.fn<typeof fetch>();
    const result = await getGoogleWorkspaceAccessToken({}, {
      getEnv: (name) => name === "GMAIL_OAUTH_CLIENT_ID" ? "client-id" : undefined,
      fetch: fetcher,
    });

    expect(result).toEqual({ status: "not_configured" });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("uses only the existing server-side Gmail OAuth env names and checks a returned scope list", async () => {
    const fetcher = vi.fn<typeof fetch>(async (input, init) => {
      expect(String(input)).toBe("https://oauth2.googleapis.com/token");
      expect(init?.method).toBe("POST");
      const body = new URLSearchParams(String(init?.body));
      expect(Object.fromEntries(body)).toEqual({
        client_id: "client-id",
        client_secret: "client-secret",
        refresh_token: "refresh-token",
        grant_type: "refresh_token",
      });
      return new Response(JSON.stringify({
        access_token: "access-token",
        scope: GOOGLE_GMAIL_READ_SCOPES[0],
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    });

    const result = await getGoogleWorkspaceAccessToken(
      { acceptedScopes: GOOGLE_GMAIL_READ_SCOPES },
      { getEnv, fetch: fetcher },
    );

    expect(result).toEqual({
      status: "connected",
      accessToken: "access-token",
      grantedScopes: [GOOGLE_GMAIL_READ_SCOPES[0]],
    });
  });

  it("returns insufficient_scope instead of attempting an unsupported adapter", async () => {
    const fetcher = vi.fn<typeof fetch>(async () => new Response(JSON.stringify({
      access_token: "access-token",
      scope: GOOGLE_GMAIL_READ_SCOPES[0],
    }), { status: 200, headers: { "Content-Type": "application/json" } }));

    const result = await getGoogleWorkspaceAccessToken(
      { acceptedScopes: GOOGLE_CALENDAR_READ_SCOPES },
      { getEnv, fetch: fetcher },
    );

    expect(result).toEqual({ status: "insufficient_scope" });
  });

  it("distinguishes provider scope errors from general unavailability", async () => {
    const scopeError = await googleApiFailureStatus(new Response(JSON.stringify({
      error: {
        status: "PERMISSION_DENIED",
        message: "Request had insufficient authentication scopes.",
      },
    }), { status: 403 }));
    const unavailable = await googleApiFailureStatus(new Response("rate limited", { status: 429 }));

    expect(scopeError).toBe("insufficient_scope");
    expect(unavailable).toBe("unavailable");
  });

  it("recognizes Google's camel-case insufficientPermissions reason", async () => {
    const result = await googleApiFailureStatus(new Response(JSON.stringify({
      error: { errors: [{ reason: "insufficientPermissions" }] },
    }), { status: 403 }));

    expect(result).toBe("insufficient_scope");
  });

  it("fails closed as unavailable when the token endpoint cannot be reached", async () => {
    const fetcher = vi.fn<typeof fetch>(async () => {
      throw new Error("synthetic transport failure");
    });
    const result = await getGoogleWorkspaceAccessToken({}, {
      getEnv,
      fetch: fetcher,
      wait: async () => undefined,
    });

    expect(result).toEqual({ status: "unavailable" });
    expect(fetcher).toHaveBeenCalledTimes(3);
  });
});
