import type { HandlerResponse } from "@netlify/functions";

import { normalizeEmail } from "./auth";
import { resolveWorkspaceContext } from "./workspace-config";

interface IdentityEventUser {
  email?: unknown;
  app_metadata?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readIdentityUser(body: string | null | undefined): IdentityEventUser | null {
  if (!body) return null;

  try {
    const payload: unknown = JSON.parse(body);
    if (!isRecord(payload) || !isRecord(payload.user)) return null;
    return payload.user;
  } catch {
    return null;
  }
}

function response(statusCode: number, body: unknown): HandlerResponse {
  return {
    statusCode,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, noarchive, nosnippet",
    },
    body: JSON.stringify(body),
  };
}

export function enforceDakotaIdentityEvent(
  body: string | null | undefined,
  assignRole: boolean,
): HandlerResponse {
  const user = readIdentityUser(body);
  if (!user) {
    return response(400, { error: "Invalid Identity event." });
  }

  const operator = resolveWorkspaceContext().config.operator;
  if (normalizeEmail(user.email) !== operator.email) {
    return response(403, { error: "Account is not authorized for Dakota." });
  }

  if (!assignRole) return response(200, {});

  const existingMetadata = isRecord(user.app_metadata) ? user.app_metadata : {};
  return response(200, {
    app_metadata: {
      ...existingMetadata,
      roles: [...operator.roles],
    },
  });
}
