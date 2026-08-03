import type { Store } from "@netlify/blobs";

import type { DakotaAuthorization } from "./auth";
import { methodNotAllowed, privateJson } from "./http";
import {
  createDakotaOperatorRecord,
  createDakotaOperatorStateEnvelope,
  DAKOTA_OPERATOR_RECORD_LIMIT,
  DAKOTA_OPERATOR_REQUEST_MAX_BYTES,
  DAKOTA_OPERATOR_STATE_MAX_BYTES,
  DAKOTA_OPERATOR_STATE_SCHEMA,
  type DakotaOperatorRecord,
  type DakotaOperatorStateEnvelope,
  validateDakotaOperatorPutPayload,
  validateDakotaOperatorStateEnvelope,
} from "./operator-state-schema";

export const DAKOTA_OPERATOR_BLOB_STORE = "dakota-operator-state";
export const DAKOTA_OPERATOR_BLOB_KEY = "state/v1";

export type DakotaOperatorStateStore = Pick<Store, "getWithMetadata" | "setJSON">;

export interface DakotaOperatorStateDependencies {
  authorize: () => Promise<DakotaAuthorization>;
  getStore: () => DakotaOperatorStateStore;
  now?: () => Date;
}

interface LoadedState {
  envelope: DakotaOperatorStateEnvelope | null;
  etag: string | null;
}

class InvalidStoredStateError extends Error {}

function authorizationResponse(authorization: DakotaAuthorization): Response | null {
  if (authorization.allowed) return null;
  const error = authorization.status === 401 ? "Authentication required." : "Forbidden.";
  return privateJson({ error }, authorization.status);
}

function isSameOriginWrite(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin || origin === "null") return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

async function parseJsonBody(request: Request): Promise<
  | { ok: true; value: unknown }
  | { ok: false; response: Response }
> {
  const contentType =
    request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() ?? "";
  if (contentType !== "application/json") {
    return {
      ok: false,
      response: privateJson({ error: "Content-Type must be application/json." }, 415),
    };
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength && /^\d+$/u.test(contentLength) && Number(contentLength) > DAKOTA_OPERATOR_REQUEST_MAX_BYTES) {
    return {
      ok: false,
      response: privateJson({ error: "Operator-state request is too large." }, 413),
    };
  }

  const rawBody = new Uint8Array(await request.arrayBuffer());
  if (rawBody.byteLength === 0) {
    return {
      ok: false,
      response: privateJson({ error: "Operator-state request body is required." }, 400),
    };
  }
  if (rawBody.byteLength > DAKOTA_OPERATOR_REQUEST_MAX_BYTES) {
    return {
      ok: false,
      response: privateJson({ error: "Operator-state request is too large." }, 413),
    };
  }

  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(rawBody);
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return {
      ok: false,
      response: privateJson({ error: "Operator-state request must be valid UTF-8 JSON." }, 400),
    };
  }
}

async function loadState(store: DakotaOperatorStateStore): Promise<LoadedState> {
  const result = await store.getWithMetadata(DAKOTA_OPERATOR_BLOB_KEY, { type: "json" });
  if (!result) return { envelope: null, etag: null };
  if (!result.etag) throw new InvalidStoredStateError("Stored state has no ETag.");

  const validation = validateDakotaOperatorStateEnvelope(result.data);
  if (!validation.valid) throw new InvalidStoredStateError(validation.error);
  return { envelope: validation.value, etag: result.etag };
}

function emptyRecords(): Record<string, DakotaOperatorRecord> {
  return Object.create(null) as Record<string, DakotaOperatorRecord>;
}

async function readOperatorState(store: DakotaOperatorStateStore): Promise<Response> {
  const current = await loadState(store);
  if (!current.envelope) {
    return privateJson({
      schema_version: DAKOTA_OPERATOR_STATE_SCHEMA,
      updated_at: null,
      records: {},
    });
  }
  return privateJson(current.envelope);
}

async function upsertOperatorState(
  request: Request,
  store: DakotaOperatorStateStore,
  now: () => Date,
): Promise<Response> {
  if (!isSameOriginWrite(request)) {
    return privateJson({ error: "A same-origin request is required." }, 403);
  }

  const parsed = await parseJsonBody(request);
  if (!parsed.ok) return parsed.response;
  const payload = validateDakotaOperatorPutPayload(parsed.value);
  if (!payload.valid) return privateJson({ error: payload.error }, 422);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const current = await loadState(store);
    const existingRecords = current.envelope?.records ?? emptyRecords();
    const isNewRecord = !Object.hasOwn(existingRecords, payload.value.candidate_key);
    if (isNewRecord && Object.keys(existingRecords).length >= DAKOTA_OPERATOR_RECORD_LIMIT) {
      return privateJson({ error: "Operator-state record capacity has been reached." }, 409);
    }

    const updatedAt = now().toISOString();
    const record = createDakotaOperatorRecord(
      payload.value.record,
      updatedAt,
      existingRecords[payload.value.candidate_key],
    );
    const records = { ...existingRecords, [payload.value.candidate_key]: record };
    const envelope = createDakotaOperatorStateEnvelope(records, updatedAt);
    const encodedSize = new TextEncoder().encode(JSON.stringify(envelope)).byteLength;
    if (encodedSize > DAKOTA_OPERATOR_STATE_MAX_BYTES) {
      return privateJson({ error: "Operator-state storage limit has been reached." }, 409);
    }

    const metadata = {
      schemaVersion: DAKOTA_OPERATOR_STATE_SCHEMA,
      recordCount: Object.keys(records).length,
      updatedAt,
    };
    const result = await store.setJSON(
      DAKOTA_OPERATOR_BLOB_KEY,
      envelope,
      current.etag
        ? { metadata, onlyIfMatch: current.etag }
        : { metadata, onlyIfNew: true },
    );
    if (result.modified) {
      return privateJson({
        schema_version: DAKOTA_OPERATOR_STATE_SCHEMA,
        updated_at: updatedAt,
        candidate_key: payload.value.candidate_key,
        record,
      });
    }
  }

  return privateJson(
    { error: "Operator state changed during this save. Refresh and try again." },
    409,
  );
}

export async function handleDakotaOperatorStateRequest(
  request: Request,
  dependencies: DakotaOperatorStateDependencies,
): Promise<Response> {
  if (request.method !== "GET" && request.method !== "PUT") {
    return methodNotAllowed(["GET", "PUT"]);
  }

  let authorization: DakotaAuthorization;
  try {
    authorization = await dependencies.authorize();
  } catch {
    return privateJson({ error: "Dakota authorization is temporarily unavailable." }, 503);
  }
  const denied = authorizationResponse(authorization);
  if (denied) return denied;

  try {
    const store = dependencies.getStore();
    if (request.method === "GET") {
      if (new URL(request.url).search !== "") {
        return privateJson({ error: "Operator-state GET does not accept query parameters." }, 400);
      }
      return await readOperatorState(store);
    }
    return await upsertOperatorState(request, store, dependencies.now ?? (() => new Date()));
  } catch (error) {
    if (error instanceof InvalidStoredStateError) {
      return privateJson({ error: "The stored operator state is unavailable." }, 503);
    }
    return privateJson({ error: "Dakota operator state is temporarily unavailable." }, 503);
  }
}
