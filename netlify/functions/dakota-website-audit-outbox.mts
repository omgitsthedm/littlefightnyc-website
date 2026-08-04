import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";

import { getDakotaAuthorization } from "./_shared/dakota/auth";
import { methodNotAllowed, privateJson } from "./_shared/dakota/http";
import { DAKOTA_REVENUE_BRIDGE_STORE } from "./_shared/dakota/revenue-bridge-store";
import {
  acknowledgeFailedDakotaWebsiteAuditOutboxEntry,
  DAKOTA_WEBSITE_AUDIT_OUTBOX_STORE,
  redriveFailedDakotaWebsiteAuditOutboxEntry,
} from "./_shared/dakota/website-audit-outbox";

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin || origin === "null") return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export default async function dakotaWebsiteAuditOutbox(
  request: Request,
  _context: Context,
): Promise<Response> {
  if (request.method !== "POST") return methodNotAllowed(["POST"]);

  let authorization;
  try {
    authorization = await getDakotaAuthorization();
  } catch {
    return privateJson({ error: "Dakota authorization is temporarily unavailable." }, 503);
  }
  if (!authorization.allowed) {
    return privateJson(
      { error: authorization.status === 401 ? "Authentication required." : "Forbidden." },
      authorization.status,
    );
  }
  if (!sameOrigin(request)) {
    return privateJson({ error: "A same-origin request is required." }, 403);
  }
  if (
    request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() !==
      "application/json"
  ) {
    return privateJson({ error: "Content-Type must be application/json." }, 415);
  }

  try {
    const body = await request.json();
    if (
      !isRecord(body) ||
      Object.keys(body).length !== 2 ||
      typeof body.entry_id !== "string" ||
      !/^[0-9a-f]{32}$/u.test(body.entry_id) ||
      !["redrive", "acknowledge"].includes(String(body.action))
    ) {
      return privateJson({ error: "Website Audit recovery request has an invalid shape." }, 422);
    }

    const outboxStore = () => getStore({
      name: DAKOTA_WEBSITE_AUDIT_OUTBOX_STORE,
      consistency: "strong",
    });
    const result = body.action === "redrive"
      ? await redriveFailedDakotaWebsiteAuditOutboxEntry(body.entry_id, {
        getOutboxStore: outboxStore,
        getRevenueBridgeStore: () => getStore({
          name: DAKOTA_REVENUE_BRIDGE_STORE,
          consistency: "strong",
        }),
      })
      : await acknowledgeFailedDakotaWebsiteAuditOutboxEntry(
        body.entry_id,
        outboxStore(),
      );

    if (result.outcome === "missing") {
      return privateJson({ error: "Website Audit recovery entry was not found." }, 404);
    }
    if (result.outcome === "not_failed" || result.outcome === "not_surfaced") {
      return privateJson({
        error: result.outcome === "not_surfaced"
          ? "Refresh Dakota before acting on this Website Audit failure."
          : "Only failed Website Audit recovery entries accept this action.",
      }, 409);
    }
    return privateJson({ schema_version: "dakota.website-audit-outbox-operation.v1", result });
  } catch (error) {
    if (error instanceof TypeError) {
      return privateJson({ error: "Website Audit recovery request is invalid." }, 422);
    }
    return privateJson({ error: "Website Audit recovery is temporarily unavailable." }, 503);
  }
}

export const config: Config = {
  path: "/api/dakota/website-audit-outbox",
};
