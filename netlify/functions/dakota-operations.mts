import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";

import { getDakotaAuthorization } from "./_shared/dakota/auth";
import { methodNotAllowed, privateJson } from "./_shared/dakota/http";
import {
  DAKOTA_INGRESS_RECEIPT_STORE,
  DakotaIngressReceiptNotFoundError,
  redriveDakotaIngressReceipt,
  summarizeDakotaIngressOperations,
} from "./_shared/dakota/ingress-receipts";
import {
  DAKOTA_OPERATOR_ALERT_STORE,
  summarizeDakotaOperatorAlerts,
} from "./_shared/dakota/operator-alert";
import {
  DAKOTA_WEBSITE_AUDIT_OUTBOX_STORE,
  summarizeDakotaWebsiteAuditOutbox,
} from "./_shared/dakota/website-audit-outbox";
import { DAKOTA_OPERATOR_BLOB_STORE } from "./_shared/dakota/operator-state-constants";

const REQUEST_MAX_BYTES = 1_024;

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

async function readAction(request: Request): Promise<unknown | Response> {
  if (request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() !== "application/json") {
    return privateJson({ error: "Content-Type must be application/json." }, 415);
  }
  const contentLength = request.headers.get("content-length");
  if (contentLength && /^\d+$/u.test(contentLength) && Number(contentLength) > REQUEST_MAX_BYTES) {
    return privateJson({ error: "Dakota operations request is too large." }, 413);
  }
  const raw = new Uint8Array(await request.arrayBuffer());
  if (raw.byteLength === 0) return privateJson({ error: "Dakota operations request body is required." }, 400);
  if (raw.byteLength > REQUEST_MAX_BYTES) return privateJson({ error: "Dakota operations request is too large." }, 413);
  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(raw)) as unknown;
  } catch {
    return privateJson({ error: "Dakota operations request must be valid UTF-8 JSON." }, 400);
  }
}

export default async function dakotaOperations(
  request: Request,
  _context: Context,
): Promise<Response> {
  if (request.method !== "GET" && request.method !== "POST") return methodNotAllowed(["GET", "POST"]);
  if (new URL(request.url).search !== "") {
    return privateJson({ error: "Dakota operations does not accept query parameters." }, 400);
  }

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

  if (request.method === "POST") {
    if (!sameOrigin(request)) return privateJson({ error: "A same-origin request is required." }, 403);
    const body = await readAction(request);
    if (body instanceof Response) return body;
    if (
      !isRecord(body) ||
      Object.keys(body).length !== 2 ||
      body.action !== "redrive_ingress_receipt" ||
      typeof body.receipt_id !== "string" ||
      !/^[0-9a-f]{32}$/u.test(body.receipt_id)
    ) {
      return privateJson({ error: "Dakota operations request has an invalid shape." }, 422);
    }
    try {
      const result = await redriveDakotaIngressReceipt(body.receipt_id, {
        getOperatorStore: () => getStore({ name: DAKOTA_OPERATOR_BLOB_STORE, consistency: "strong" }),
        getReceiptStore: () => getStore({ name: DAKOTA_INGRESS_RECEIPT_STORE, consistency: "strong" }),
      });
      return privateJson({ schema_version: "dakota.ingress-redrive.v1", ...result });
    } catch (error) {
      if (error instanceof DakotaIngressReceiptNotFoundError) {
        return privateJson({ error: "That ingress receipt was not found." }, 404);
      }
      return privateJson({ error: "Dakota could not redrive that ingress receipt." }, 503);
    }
  }

  try {
    const [ingress, operatorAlerts, websiteAuditOutbox] = await Promise.all([
      summarizeDakotaIngressOperations(
        getStore({ name: DAKOTA_INGRESS_RECEIPT_STORE, consistency: "strong" }),
      ),
      summarizeDakotaOperatorAlerts(
        getStore({ name: DAKOTA_OPERATOR_ALERT_STORE, consistency: "strong" }),
      ),
      summarizeDakotaWebsiteAuditOutbox(
        getStore({ name: DAKOTA_WEBSITE_AUDIT_OUTBOX_STORE, consistency: "strong" }),
      ),
    ]);
    return privateJson({
      schema_version: "dakota.operations.v1",
      checked_at: [
        ingress.checked_at,
        operatorAlerts.checked_at,
        websiteAuditOutbox.checked_at,
      ].sort().at(-1),
      ingress,
      operator_alerts: operatorAlerts,
      website_audit_outbox: websiteAuditOutbox,
    });
  } catch {
    return privateJson({ error: "Dakota operations is temporarily unavailable." }, 503);
  }
}

export const config: Config = {
  path: "/api/dakota/operations",
};
