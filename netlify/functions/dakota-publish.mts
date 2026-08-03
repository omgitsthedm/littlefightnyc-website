import { getStore, type Store } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";

import {
  DAKOTA_BLOB_STORE,
  DAKOTA_MAX_BODY_BYTES,
  DAKOTA_QUEUE_KEY,
  DAKOTA_REPLAY_PREFIX,
  DAKOTA_REPLAY_RETENTION_SECONDS,
} from "./_shared/dakota/constants";
import { methodNotAllowed, privateJson } from "./_shared/dakota/http";
import { validateQueuePayload } from "./_shared/dakota/queue-schema";
import { verifySignedPayload } from "./_shared/dakota/signing";

function replayKey(timestamp: number, nonce: string): string {
  return `${DAKOTA_REPLAY_PREFIX}${timestamp}/${nonce}`;
}

async function pruneExpiredReplayKeys(store: Store, nowSeconds: number): Promise<void> {
  const cutoff = nowSeconds - DAKOTA_REPLAY_RETENTION_SECONDS;
  const { blobs } = await store.list({ prefix: DAKOTA_REPLAY_PREFIX });
  const expired = blobs
    .filter(({ key }) => {
      const timestamp = Number(key.slice(DAKOTA_REPLAY_PREFIX.length).split("/", 1)[0]);
      return Number.isSafeInteger(timestamp) && timestamp < cutoff;
    })
    .slice(0, 128);

  await Promise.all(expired.map(({ key }) => store.delete(key)));
}

export default async function publish(
  request: Request,
  context: Context,
): Promise<Response> {
  if (request.method !== "POST") return methodNotAllowed(["POST"]);

  const contentType =
    request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() ?? "";
  if (contentType !== "application/json") {
    return privateJson({ error: "Content-Type must be application/json." }, 415);
  }

  const secret = Netlify.env.get("DAKOTA_PUBLISH_TOKEN")?.trim();
  if (!secret || secret.length < 32) {
    return privateJson({ error: "Dakota publishing is not configured." }, 503);
  }

  const rawBody = new Uint8Array(await request.arrayBuffer());
  if (rawBody.byteLength === 0 || rawBody.byteLength > DAKOTA_MAX_BODY_BYTES) {
    return privateJson({ error: "Queue payload size is invalid." }, 413);
  }

  const signature = verifySignedPayload(
    rawBody,
    {
      timestamp: request.headers.get("x-dakota-timestamp"),
      nonce: request.headers.get("x-dakota-nonce"),
      contentSha256: request.headers.get("x-dakota-content-sha256"),
      signature: request.headers.get("x-dakota-signature"),
    },
    secret,
  );

  if (!signature.valid) {
    return privateJson({ error: "Request signature is invalid or expired." }, 401);
  }

  let parsedBody: unknown;
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(rawBody);
    parsedBody = JSON.parse(text);
  } catch {
    return privateJson({ error: "Queue payload is not valid UTF-8 JSON." }, 400);
  }

  const validation = validateQueuePayload(parsedBody);
  if (!validation.valid) {
    return privateJson({ error: validation.error }, 422);
  }

  try {
    const store = getStore({ name: DAKOTA_BLOB_STORE, consistency: "strong" });
    const nonceReservation = await store.setJSON(
      replayKey(signature.timestamp, signature.nonce),
      { accepted_at: new Date().toISOString() },
      { onlyIfNew: true },
    );

    if (!nonceReservation.modified) {
      return privateJson({ error: "Request has already been accepted." }, 409);
    }

    const publishedAt = new Date().toISOString();
    await store.setJSON(DAKOTA_QUEUE_KEY, validation.payload, {
      metadata: {
        publishedAt,
        recordCount: validation.payload.records.length,
        schemaVersion: validation.payload.schema_version,
      },
    });

    context.waitUntil(
      pruneExpiredReplayKeys(store, Math.floor(Date.now() / 1_000)).catch(
        () => undefined,
      ),
    );

    return privateJson({
      ok: true,
      published_at: publishedAt,
      record_count: validation.payload.records.length,
    });
  } catch {
    return privateJson({ error: "Dakota publishing is temporarily unavailable." }, 503);
  }
}

export const config: Config = {
  path: "/api/dakota/publish",
};
