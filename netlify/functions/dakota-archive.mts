import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";

import {
  archiveDakotaRecord,
  clearDakotaArchiveReconciliationRequest,
  DAKOTA_ARCHIVE_SCHEMA,
  DAKOTA_ARCHIVE_STORE,
  DakotaArchiveConflictError,
  DakotaArchiveUnavailableError,
  DakotaArchiveValidationError,
  previewDakotaArchive,
  restoreDakotaRecord,
} from "./_shared/dakota/archive";
import { getDakotaAuthorization } from "./_shared/dakota/auth";
import { methodNotAllowed, privateJson } from "./_shared/dakota/http";
import { DAKOTA_OPERATOR_BLOB_STORE } from "./_shared/dakota/operator-state-constants";
import {
  archiveDakotaRevenueBridgeRecord,
  DAKOTA_REVENUE_BRIDGE_ARCHIVE_STORE,
  markDakotaRevenueBridgeArchiveReconciled,
  restoreDakotaRevenueBridgeRecord,
} from "./_shared/dakota/revenue-bridge-archive";
import { DAKOTA_REVENUE_BRIDGE_STORE } from "./_shared/dakota/revenue-bridge-schema";

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

export default async function dakotaArchive(
  request: Request,
  _context: Context,
): Promise<Response> {
  if (request.method !== "GET" && request.method !== "POST") return methodNotAllowed(["GET", "POST"]);
  let authorization;
  try {
    authorization = await getDakotaAuthorization();
  } catch {
    return privateJson({ error: "Dakota authorization is temporarily unavailable." }, 503);
  }
  if (!authorization.allowed) {
    return privateJson({ error: authorization.status === 401 ? "Authentication required." : "Forbidden." }, authorization.status);
  }

  const dependencies = {
    getOperatorStore: () => getStore({ name: DAKOTA_OPERATOR_BLOB_STORE, consistency: "strong" }),
    getArchiveStore: () => getStore({ name: DAKOTA_ARCHIVE_STORE, consistency: "strong" }),
  };
  const bridgeDependencies = {
    getBridgeStore: () => getStore({ name: DAKOTA_REVENUE_BRIDGE_STORE, consistency: "strong" }),
    getArchiveStore: () => getStore({ name: DAKOTA_REVENUE_BRIDGE_ARCHIVE_STORE, consistency: "strong" }),
  };
  try {
    if (request.method === "GET") {
      if (new URL(request.url).search !== "") return privateJson({ error: "Archive preview does not accept query parameters." }, 400);
      return privateJson({ schema_version: "dakota.archive-preview.v1", ...(await previewDakotaArchive(dependencies)) });
    }
    if (!sameOrigin(request)) return privateJson({ error: "A same-origin request is required." }, 403);
    if (request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() !== "application/json") {
      return privateJson({ error: "Content-Type must be application/json." }, 415);
    }
    const body = await request.json();
    if (!isRecord(body)) return privateJson({ error: "Archive request has an invalid shape." }, 422);
    if (
      body.action === "archive" &&
      Object.keys(body).length === 3 &&
      typeof body.candidate_key === "string" &&
      typeof body.expected_updated_at === "string"
    ) {
      const archive = await archiveDakotaRecord(body.candidate_key, body.expected_updated_at, dependencies);
      const bridge = await archiveDakotaRevenueBridgeRecord(
        archive.candidate_key,
        archive.archive_id,
        bridgeDependencies,
      ).catch(() => null);
      let bridgeComplete = Boolean(bridge && ["stored", "unchanged"].includes(bridge.outcome));
      if (bridgeComplete) {
        try {
          await markDakotaRevenueBridgeArchiveReconciled({
            archive_id: archive.archive_id,
            candidate_key: archive.candidate_key,
            core_status: "removed_from_active",
          }, bridgeDependencies.getArchiveStore());
          await clearDakotaArchiveReconciliationRequest(
            archive.archive_id,
            dependencies.getArchiveStore(),
          );
        } catch {
          bridgeComplete = false;
        }
      }
      return privateJson({
        schema_version: DAKOTA_ARCHIVE_SCHEMA,
        archive_id: archive.archive_id,
        candidate_key: archive.candidate_key,
        status: archive.transaction_status,
        bridge_status: bridgeComplete ? "complete" : "pending",
      });
    }
    if (
      body.action === "restore" &&
      Object.keys(body).length === 2 &&
      typeof body.archive_id === "string"
    ) {
      const archive = await restoreDakotaRecord(body.archive_id, dependencies);
      const bridge = await restoreDakotaRevenueBridgeRecord(
        archive.candidate_key,
        archive.archive_id,
        bridgeDependencies,
      ).catch(() => null);
      let bridgeComplete = Boolean(bridge && ["stored", "unchanged"].includes(bridge.outcome));
      if (bridgeComplete) {
        try {
          await markDakotaRevenueBridgeArchiveReconciled({
            archive_id: archive.archive_id,
            candidate_key: archive.candidate_key,
            core_status: "restored",
          }, bridgeDependencies.getArchiveStore());
          await clearDakotaArchiveReconciliationRequest(
            archive.archive_id,
            dependencies.getArchiveStore(),
          );
        } catch {
          bridgeComplete = false;
        }
      }
      return privateJson({
        schema_version: DAKOTA_ARCHIVE_SCHEMA,
        archive_id: archive.archive_id,
        candidate_key: archive.candidate_key,
        status: archive.transaction_status,
        bridge_status: bridgeComplete ? "complete" : "pending",
      });
    }
    return privateJson({ error: "Archive request has an invalid shape." }, 422);
  } catch (error) {
    if (error instanceof DakotaArchiveValidationError) return privateJson({ error: "This record is not eligible for the requested archive action." }, 422);
    if (error instanceof DakotaArchiveConflictError) return privateJson({ error: "Archive state changed. Refresh Dakota and try again." }, 409);
    if (error instanceof DakotaArchiveUnavailableError) return privateJson({ error: "Dakota archive is temporarily unavailable." }, 503);
    return privateJson({ error: "Dakota archive is temporarily unavailable." }, 503);
  }
}

export const config: Config = {
  path: "/api/dakota/archive",
};
