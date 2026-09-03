import { getStore, type Store } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";
import { createHmac } from "node:crypto";

import { methodNotAllowed, privateJson } from "./_shared/dakota/http";
import { verifySignedPayload } from "./_shared/dakota/signing";

const META_PAGE_ID = "1311467162048309";
const META_INSTAGRAM_ACCOUNT_ID = "17841439986493896";
const META_GRAPH_VERSION_DEFAULT = "v26.0";
const META_BLOB_STORE = "meta-publisher";
const META_REPLAY_PREFIX = "replay/v1/";
const META_REQUEST_PREFIX = "requests/v1/";
const META_MAX_BODY_BYTES = 64 * 1024;
const META_REPLAY_RETENTION_SECONDS = 60 * 60;
const META_MAX_FACEBOOK_TEXT = 10_000;
const META_MAX_INSTAGRAM_CAPTION = 2_200;
const META_MAX_ALT_TEXT = 1_000;
const META_REQUEST_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/u;
const META_GRAPH_VERSION = /^v\d+\.\d+$/u;

interface MetaPublishPayload {
  request_id: string;
  platform: "facebook" | "instagram";
  text: string;
  image_url: string | null;
  alt_text: string | null;
  publish: boolean;
}

type PayloadValidation =
  | { valid: true; payload: MetaPublishPayload }
  | { valid: false; error: string };

interface MetaGraphConfig {
  accessToken: string;
  appSecretProof: string;
  version: string;
}

interface MetaGraphErrorDetails {
  code: number | null;
  subcode: number | null;
  type: string | null;
}

class MetaGraphError extends Error {
  readonly details: MetaGraphErrorDetails;

  constructor(details: MetaGraphErrorDetails) {
    super("Meta rejected the publishing request.");
    this.name = "MetaGraphError";
    this.details = details;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned.length > 0 ? cleaned : null;
}

function configuredImageHosts(): readonly string[] {
  const configured = Netlify.env.get("META_ALLOWED_IMAGE_HOSTS")?.trim();
  const hosts = (configured || "littlefightnyc.com,www.littlefightnyc.com")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set(hosts)];
}

function imageUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 2_048) return null;

  try {
    const parsed = new URL(value);
    if (
      parsed.protocol !== "https:" ||
      parsed.username ||
      parsed.password ||
      parsed.hash
    ) {
      return null;
    }

    const hostname = parsed.hostname.toLowerCase();
    const allowed = configuredImageHosts().some((entry) => {
      if (entry.startsWith("*.")) {
        const suffix = entry.slice(1);
        return hostname.endsWith(suffix) && hostname.length > suffix.length;
      }
      return hostname === entry;
    });

    return allowed ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function validatePayload(value: unknown): PayloadValidation {
  if (!isRecord(value)) {
    return { valid: false, error: "Payload must be a JSON object." };
  }

  const allowedKeys = new Set([
    "request_id",
    "platform",
    "text",
    "image_url",
    "alt_text",
    "publish",
  ]);
  const unknownKeys = Object.keys(value).filter((key) => !allowedKeys.has(key));
  if (unknownKeys.length > 0) {
    return { valid: false, error: "Payload contains unsupported fields." };
  }

  const requestId = cleanText(value.request_id);
  if (!requestId || !META_REQUEST_ID.test(requestId)) {
    return {
      valid: false,
      error: "request_id must be 8-128 safe identifier characters.",
    };
  }

  if (value.platform !== "facebook" && value.platform !== "instagram") {
    return { valid: false, error: "platform must be facebook or instagram." };
  }

  if (value.publish !== undefined && typeof value.publish !== "boolean") {
    return { valid: false, error: "publish must be a boolean when provided." };
  }
  if (
    value.text !== undefined &&
    value.text !== null &&
    typeof value.text !== "string"
  ) {
    return { valid: false, error: "text must be a string when provided." };
  }

  const text = cleanText(value.text) ?? "";
  const maxText =
    value.platform === "instagram"
      ? META_MAX_INSTAGRAM_CAPTION
      : META_MAX_FACEBOOK_TEXT;
  if (text.length > maxText) {
    return { valid: false, error: "Text exceeds the platform safety limit." };
  }

  const suppliedImage = value.image_url !== undefined && value.image_url !== null;
  const validatedImage = suppliedImage ? imageUrl(value.image_url) : null;
  if (suppliedImage && !validatedImage) {
    return {
      valid: false,
      error: "image_url must be an allowed public HTTPS URL.",
    };
  }

  const altText = cleanText(value.alt_text);
  if (value.alt_text !== undefined && value.alt_text !== null && !altText) {
    return { valid: false, error: "alt_text must not be blank." };
  }
  if (altText && altText.length > META_MAX_ALT_TEXT) {
    return { valid: false, error: "alt_text exceeds the safety limit." };
  }

  if (value.platform === "instagram" && !validatedImage) {
    return { valid: false, error: "Instagram publishing requires image_url." };
  }
  if (value.platform === "instagram" && altText) {
    return {
      valid: false,
      error: "alt_text is currently supported only for Facebook photos.",
    };
  }
  if (value.platform === "facebook" && !text && !validatedImage) {
    return {
      valid: false,
      error: "Facebook publishing requires text or image_url.",
    };
  }

  return {
    valid: true,
    payload: {
      request_id: requestId,
      platform: value.platform,
      text,
      image_url: validatedImage,
      alt_text: altText,
      publish: value.publish === true,
    },
  };
}

function requiredSecret(name: string, minimumLength: number): string | null {
  const value = Netlify.env.get(name)?.trim();
  return value && value.length >= minimumLength ? value : null;
}

function metaGraphConfig(): MetaGraphConfig | null {
  const accessToken = requiredSecret("META_SYSTEM_USER_TOKEN", 40);
  const appSecret = requiredSecret("META_APP_SECRET", 20);
  const version =
    Netlify.env.get("META_GRAPH_VERSION")?.trim() || META_GRAPH_VERSION_DEFAULT;

  if (!accessToken || !appSecret || !META_GRAPH_VERSION.test(version)) {
    return null;
  }

  return {
    accessToken,
    appSecretProof: createHmac("sha256", appSecret)
      .update(accessToken)
      .digest("hex"),
    version,
  };
}

function replayKey(timestamp: number, nonce: string): string {
  return `${META_REPLAY_PREFIX}${timestamp}/${nonce}`;
}

function requestKey(requestId: string): string {
  return `${META_REQUEST_PREFIX}${requestId}`;
}

async function pruneExpiredReplayKeys(
  store: Store,
  nowSeconds: number,
): Promise<void> {
  const cutoff = nowSeconds - META_REPLAY_RETENTION_SECONDS;
  const { blobs } = await store.list({ prefix: META_REPLAY_PREFIX });
  const expired = blobs
    .filter(({ key }) => {
      const timestamp = Number(key.slice(META_REPLAY_PREFIX.length).split("/", 1)[0]);
      return Number.isSafeInteger(timestamp) && timestamp < cutoff;
    })
    .slice(0, 128);

  await Promise.all(expired.map(({ key }) => store.delete(key)));
}

function graphErrorDetails(value: unknown): MetaGraphErrorDetails {
  if (!isRecord(value) || !isRecord(value.error)) {
    return { code: null, subcode: null, type: null };
  }

  return {
    code: typeof value.error.code === "number" ? value.error.code : null,
    subcode:
      typeof value.error.error_subcode === "number"
        ? value.error.error_subcode
        : null,
    type: typeof value.error.type === "string" ? value.error.type : null,
  };
}

async function graphRequest(
  method: "GET" | "POST",
  path: string,
  parameters: Readonly<Record<string, string>>,
  config: MetaGraphConfig,
): Promise<Record<string, unknown>> {
  const url = new URL(
    `https://graph.facebook.com/${config.version}/${path.replace(/^\//u, "")}`,
  );
  const body = new URLSearchParams({
    ...parameters,
    appsecret_proof: config.appSecretProof,
  });

  if (method === "GET") {
    for (const [key, value] of body) url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${config.accessToken}`,
      ...(method === "POST"
        ? { "Content-Type": "application/x-www-form-urlencoded" }
        : {}),
    },
    body: method === "POST" ? body : undefined,
  });

  let parsed: unknown;
  try {
    parsed = await response.json();
  } catch {
    parsed = null;
  }

  if (!response.ok || (isRecord(parsed) && "error" in parsed)) {
    throw new MetaGraphError(graphErrorDetails(parsed));
  }
  if (!isRecord(parsed)) {
    throw new MetaGraphError({ code: null, subcode: null, type: null });
  }

  return parsed;
}

function responseId(value: unknown): string {
  if (!isRecord(value) || typeof value.id !== "string") {
    throw new MetaGraphError({ code: null, subcode: null, type: null });
  }
  return value.id;
}

async function waitForInstagramContainer(
  creationId: string,
  config: MetaGraphConfig,
): Promise<void> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const status = await graphRequest(
      "GET",
      creationId,
      { fields: "status_code" },
      config,
    );
    const statusCode =
      typeof status.status_code === "string" ? status.status_code : "";

    if (statusCode === "FINISHED") return;
    if (statusCode === "ERROR" || statusCode === "EXPIRED") {
      throw new MetaGraphError({ code: null, subcode: null, type: null });
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new MetaGraphError({ code: null, subcode: null, type: null });
}

async function publishToFacebook(
  payload: MetaPublishPayload,
  config: MetaGraphConfig,
): Promise<Record<string, string>> {
  if (payload.image_url) {
    const parameters: Record<string, string> = { url: payload.image_url };
    if (payload.text) parameters.caption = payload.text;
    if (payload.alt_text) parameters.alt_text_custom = payload.alt_text;

    const result = await graphRequest(
      "POST",
      `${META_PAGE_ID}/photos`,
      parameters,
      config,
    );
    const id = responseId(result);
    return {
      media_id: id,
      ...(typeof result.post_id === "string" ? { post_id: result.post_id } : {}),
    };
  }

  const result = await graphRequest(
    "POST",
    `${META_PAGE_ID}/feed`,
    { message: payload.text },
    config,
  );
  return { post_id: responseId(result) };
}

async function publishToInstagram(
  payload: MetaPublishPayload,
  config: MetaGraphConfig,
): Promise<Record<string, string>> {
  if (!payload.image_url) {
    throw new MetaGraphError({ code: null, subcode: null, type: null });
  }

  const container = await graphRequest(
    "POST",
    `${META_INSTAGRAM_ACCOUNT_ID}/media`,
    {
      image_url: payload.image_url,
      ...(payload.text ? { caption: payload.text } : {}),
    },
    config,
  );
  const creationId = responseId(container);
  await waitForInstagramContainer(creationId, config);

  const published = await graphRequest(
    "POST",
    `${META_INSTAGRAM_ACCOUNT_ID}/media_publish`,
    { creation_id: creationId },
    config,
  );

  return {
    creation_id: creationId,
    media_id: responseId(published),
  };
}

export default async function metaPublish(
  request: Request,
  context: Context,
): Promise<Response> {
  if (request.method !== "POST") return methodNotAllowed(["POST"]);

  const contentType =
    request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() ?? "";
  if (contentType !== "application/json") {
    return privateJson({ error: "Content-Type must be application/json." }, 415);
  }

  const signingSecret = requiredSecret("META_PUBLISH_SECRET", 32);
  if (!signingSecret) {
    return privateJson({ error: "Meta publishing is not configured." }, 503);
  }

  const rawBody = new Uint8Array(await request.arrayBuffer());
  if (rawBody.byteLength === 0 || rawBody.byteLength > META_MAX_BODY_BYTES) {
    return privateJson({ error: "Publishing payload size is invalid." }, 413);
  }

  const signature = verifySignedPayload(
    rawBody,
    {
      timestamp: request.headers.get("x-meta-timestamp"),
      nonce: request.headers.get("x-meta-nonce"),
      contentSha256: request.headers.get("x-meta-content-sha256"),
      signature: request.headers.get("x-meta-signature"),
    },
    signingSecret,
  );

  if (!signature.valid) {
    return privateJson({ error: "Request signature is invalid or expired." }, 401);
  }

  let parsedBody: unknown;
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(rawBody);
    parsedBody = JSON.parse(text);
  } catch {
    return privateJson({ error: "Publishing payload is not valid UTF-8 JSON." }, 400);
  }

  const validation = validatePayload(parsedBody);
  if (!validation.valid) {
    return privateJson({ error: validation.error }, 422);
  }

  const payload = validation.payload;
  const store = getStore({ name: META_BLOB_STORE, consistency: "strong" });

  try {
    const nonceReservation = await store.setJSON(
      replayKey(signature.timestamp, signature.nonce),
      { accepted_at: new Date().toISOString() },
      { onlyIfNew: true },
    );
    if (!nonceReservation.modified) {
      return privateJson({ error: "Request signature has already been used." }, 409);
    }

    context.waitUntil(
      pruneExpiredReplayKeys(store, Math.floor(Date.now() / 1_000)).catch(
        () => undefined,
      ),
    );

    const kind = payload.image_url ? "image" : "text";
    if (!payload.publish) {
      return privateJson({
        ok: true,
        published: false,
        request_id: payload.request_id,
        platform: payload.platform,
        kind,
        target_id:
          payload.platform === "facebook"
            ? META_PAGE_ID
            : META_INSTAGRAM_ACCOUNT_ID,
      });
    }

    const graphConfig = metaGraphConfig();
    if (!graphConfig) {
      return privateJson({ error: "Meta Graph API credentials are not configured." }, 503);
    }

    const commandReservation = await store.setJSON(
      requestKey(payload.request_id),
      {
        state: "processing",
        platform: payload.platform,
        kind,
        content_sha256: request.headers.get("x-meta-content-sha256"),
        created_at: new Date().toISOString(),
      },
      { onlyIfNew: true },
    );
    if (!commandReservation.modified) {
      return privateJson({ error: "request_id has already been used." }, 409);
    }

    const result =
      payload.platform === "facebook"
        ? await publishToFacebook(payload, graphConfig)
        : await publishToInstagram(payload, graphConfig);
    const publishedAt = new Date().toISOString();

    await store.setJSON(requestKey(payload.request_id), {
      state: "published",
      platform: payload.platform,
      kind,
      content_sha256: request.headers.get("x-meta-content-sha256"),
      published_at: publishedAt,
      result,
    });

    return privateJson({
      ok: true,
      published: true,
      request_id: payload.request_id,
      platform: payload.platform,
      kind,
      published_at: publishedAt,
      result,
    });
  } catch (error) {
    if (error instanceof MetaGraphError) {
      await store
        .setJSON(requestKey(payload.request_id), {
          state: "failed",
          platform: payload.platform,
          failed_at: new Date().toISOString(),
          meta: error.details,
        })
        .catch(() => undefined);
      return privateJson(
        { error: "Meta rejected the publishing request.", meta: error.details },
        502,
      );
    }

    return privateJson({ error: "Meta publishing is temporarily unavailable." }, 503);
  }
}

export const config: Config = {
  path: "/api/meta/publish",
};
