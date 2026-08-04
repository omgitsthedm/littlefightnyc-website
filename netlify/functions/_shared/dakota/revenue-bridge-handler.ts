import type { DakotaAuthorization } from "./auth";
import { methodNotAllowed, privateJson } from "./http";
import {
  DAKOTA_REVENUE_BRIDGE_REQUEST_MAX_BYTES,
  DAKOTA_REVENUE_BRIDGE_SCHEMA,
  type DakotaRevenueBridgePutPayload,
  validateDakotaRevenueBridgePutPayload,
} from "./revenue-bridge-schema";
import {
  applyDakotaRevenueBridgeOperatorMutation,
  InvalidDakotaRevenueBridgeStateError,
  loadDakotaRevenueBridgeState,
  type DakotaRevenueBridgeStoreDependencies,
} from "./revenue-bridge-store";

export interface DakotaRevenueBridgeHandlerDependencies extends DakotaRevenueBridgeStoreDependencies {
  authorize: () => Promise<DakotaAuthorization>;
}

function authorizationResponse(authorization: DakotaAuthorization): Response | null {
  if (authorization.allowed) return null;
  return privateJson(
    { error: authorization.status === 401 ? "Authentication required." : "Forbidden." },
    authorization.status,
  );
}

export function isSameOriginRevenueBridgeWrite(request: Request): boolean {
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
    return { ok: false, response: privateJson({ error: "Content-Type must be application/json." }, 415) };
  }
  const contentLength = request.headers.get("content-length");
  if (contentLength && /^\d+$/u.test(contentLength) && Number(contentLength) > DAKOTA_REVENUE_BRIDGE_REQUEST_MAX_BYTES) {
    return { ok: false, response: privateJson({ error: "Revenue Bridge request is too large." }, 413) };
  }
  const rawBody = new Uint8Array(await request.arrayBuffer());
  if (rawBody.byteLength === 0) {
    return { ok: false, response: privateJson({ error: "Revenue Bridge request body is required." }, 400) };
  }
  if (rawBody.byteLength > DAKOTA_REVENUE_BRIDGE_REQUEST_MAX_BYTES) {
    return { ok: false, response: privateJson({ error: "Revenue Bridge request is too large." }, 413) };
  }
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(rawBody);
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false, response: privateJson({ error: "Revenue Bridge request must be valid UTF-8 JSON." }, 400) };
  }
}

async function readRevenueBridge(
  dependencies: DakotaRevenueBridgeHandlerDependencies,
): Promise<Response> {
  const state = await loadDakotaRevenueBridgeState(dependencies.getStore());
  if (state.envelope) return privateJson(state.envelope);
  return privateJson({
    schema_version: DAKOTA_REVENUE_BRIDGE_SCHEMA,
    updated_at: null,
    records: {},
    providers: {},
  });
}

async function writeRevenueBridge(
  request: Request,
  dependencies: DakotaRevenueBridgeHandlerDependencies,
): Promise<Response> {
  if (!isSameOriginRevenueBridgeWrite(request)) {
    return privateJson({ error: "A same-origin request is required." }, 403);
  }
  const parsed = await parseJsonBody(request);
  if (!parsed.ok) return parsed.response;
  const payload = validateDakotaRevenueBridgePutPayload(parsed.value);
  if (!payload.valid) return privateJson({ error: payload.error }, 422);
  const result = await applyDakotaRevenueBridgeOperatorMutation(
    payload.value as DakotaRevenueBridgePutPayload,
    dependencies,
  );
  if (result.outcome === "stored" || result.outcome === "unchanged") {
    return privateJson({
      schema_version: DAKOTA_REVENUE_BRIDGE_SCHEMA,
      outcome: result.outcome,
      updated_at: result.updated_at,
      candidate_key: payload.value.candidate_key,
      record: result.envelope.records[payload.value.candidate_key],
    });
  }
  if (result.outcome === "not_found") return privateJson({ error: result.error }, 404);
  if (result.outcome === "invalid_transition") return privateJson({ error: result.error }, 422);
  return privateJson({ error: result.error }, 409);
}

export async function handleDakotaRevenueBridgeRequest(
  request: Request,
  dependencies: DakotaRevenueBridgeHandlerDependencies,
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
    if (new URL(request.url).search !== "") {
      return privateJson({ error: "Revenue Bridge does not accept query parameters." }, 400);
    }
    if (request.method === "GET") return await readRevenueBridge(dependencies);
    return await writeRevenueBridge(request, dependencies);
  } catch (error) {
    if (error instanceof InvalidDakotaRevenueBridgeStateError) {
      return privateJson({ error: "The stored Revenue Bridge state is unavailable." }, 503);
    }
    if (error instanceof TypeError) {
      return privateJson({ error: "Revenue Bridge mutation is invalid." }, 422);
    }
    return privateJson({ error: "Dakota Revenue Bridge is temporarily unavailable." }, 503);
  }
}
