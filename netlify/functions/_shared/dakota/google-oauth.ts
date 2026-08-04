const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const REQUEST_TIMEOUT_MS = 10_000;
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);
const RETRY_DELAYS_MS = [250, 1_000, 3_000] as const;

declare const Netlify: {
  env: { get(name: string): string | undefined };
};

export const GOOGLE_GMAIL_READ_SCOPES = [
  "https://www.googleapis.com/auth/gmail.metadata",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://mail.google.com/",
] as const;

export const GOOGLE_GMAIL_SEND_SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://mail.google.com/",
] as const;

export const GOOGLE_CALENDAR_READ_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events.readonly",
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar",
] as const;

export type GoogleWorkspaceHealthStatus =
  | "connected"
  | "not_configured"
  | "insufficient_scope"
  | "unavailable";

export type GoogleOAuthAccessToken =
  | {
      status: "connected";
      accessToken: string;
      grantedScopes: readonly string[] | null;
    }
  | { status: Exclude<GoogleWorkspaceHealthStatus, "connected"> };

export interface GoogleOAuthDependencies {
  getEnv?: (name: string) => string | undefined;
  fetch?: typeof globalThis.fetch;
  wait?: (milliseconds: number) => Promise<void>;
  maxAttempts?: number;
  requestTimeoutMs?: number;
}

export interface GoogleOAuthTokenRequest {
  acceptedScopes?: readonly string[];
}

function defaultGetEnv(name: string): string | undefined {
  return Netlify.env.get(name);
}

async function defaultWait(milliseconds: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function grantedScopes(value: unknown): readonly string[] | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const scopes = value.trim().split(/\s+/u).filter(Boolean);
  return scopes.length > 0 ? scopes : null;
}

function hasAcceptedScope(
  scopes: readonly string[] | null,
  acceptedScopes: readonly string[] | undefined,
): boolean {
  if (!scopes || !acceptedScopes || acceptedScopes.length === 0) return true;
  const granted = new Set(scopes);
  return acceptedScopes.some((scope) => granted.has(scope));
}

function insufficientScopeText(value: string): boolean {
  return /(?:insufficient[_ ]?scope|insufficient[_ ]?permissions?|insufficient authentication scopes?|access_token_scope_insufficient)/iu.test(value);
}

async function fetchTokenWithRetry(
  fetcher: typeof globalThis.fetch,
  wait: (milliseconds: number) => Promise<void>,
  body: URLSearchParams,
  maximumAttempts: number,
  requestTimeoutMs: number,
): Promise<Response> {
  let lastError: unknown;
  const attemptLimit = Math.max(1, Math.min(maximumAttempts, RETRY_DELAYS_MS.length));
  for (let attempt = 0; attempt < attemptLimit; attempt += 1) {
    try {
      const response = await fetcher(GOOGLE_TOKEN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        signal: AbortSignal.timeout(requestTimeoutMs),
      });
      if (
        response.ok ||
        !RETRYABLE_STATUS.has(response.status) ||
        attempt === attemptLimit - 1
      ) {
        return response;
      }
    } catch (error) {
      lastError = error;
      if (attempt === attemptLimit - 1) throw error;
    }
    await wait(RETRY_DELAYS_MS[attempt] ?? 3_000);
  }
  throw lastError instanceof Error ? lastError : new Error("google_oauth_unavailable");
}

/**
 * Exchange the existing server-side Gmail refresh token without ever exposing
 * credentials to a caller or client bundle. A returned scope list is checked
 * when Google supplies one; provider calls still enforce scope when it does not.
 */
export async function getGoogleWorkspaceAccessToken(
  request: GoogleOAuthTokenRequest = {},
  dependencies: GoogleOAuthDependencies = {},
): Promise<GoogleOAuthAccessToken> {
  const getEnv = dependencies.getEnv ?? defaultGetEnv;
  const clientId = getEnv("GMAIL_OAUTH_CLIENT_ID")?.trim() ?? "";
  const clientSecret = getEnv("GMAIL_OAUTH_CLIENT_SECRET")?.trim() ?? "";
  const refreshToken = getEnv("GMAIL_OAUTH_REFRESH_TOKEN")?.trim() ?? "";
  if (!clientId || !clientSecret || !refreshToken) return { status: "not_configured" };

  let response: Response;
  try {
    response = await fetchTokenWithRetry(
      dependencies.fetch ?? globalThis.fetch,
      dependencies.wait ?? defaultWait,
      new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
      dependencies.maxAttempts ?? RETRY_DELAYS_MS.length,
      dependencies.requestTimeoutMs ?? REQUEST_TIMEOUT_MS,
    );
  } catch {
    return { status: "unavailable" };
  }

  let body: { access_token?: unknown; scope?: unknown; error?: unknown; error_description?: unknown };
  try {
    body = await response.json() as typeof body;
  } catch {
    return { status: "unavailable" };
  }

  if (!response.ok) {
    const errorText = [body.error, body.error_description]
      .filter((value): value is string => typeof value === "string")
      .join(" ");
    return {
      status: insufficientScopeText(errorText) ? "insufficient_scope" : "unavailable",
    };
  }

  const scopes = grantedScopes(body.scope);
  if (!hasAcceptedScope(scopes, request.acceptedScopes)) {
    return { status: "insufficient_scope" };
  }
  if (
    typeof body.access_token !== "string" ||
    body.access_token.length === 0 ||
    body.access_token.length > 16_384 ||
    body.access_token !== body.access_token.trim() ||
    /[\s<>]|\p{Cc}/u.test(body.access_token)
  ) {
    return { status: "unavailable" };
  }
  return {
    status: "connected",
    accessToken: body.access_token,
    grantedScopes: scopes,
  };
}

/** Classify a Google API error without returning its body or headers. */
export async function googleApiFailureStatus(
  response: Response,
): Promise<"insufficient_scope" | "unavailable"> {
  let body = "";
  try {
    body = await response.text();
  } catch {
    // An unreadable provider error remains unavailable.
  }
  const authenticate = response.headers.get("www-authenticate") ?? "";
  return insufficientScopeText(`${authenticate} ${body}`)
    ? "insufficient_scope"
    : "unavailable";
}
