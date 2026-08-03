import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";

import { getDakotaAuthorization } from "./_shared/dakota/auth";
import { DAKOTA_BLOB_STORE, DAKOTA_QUEUE_KEY } from "./_shared/dakota/constants";
import { methodNotAllowed, privateJson } from "./_shared/dakota/http";
import { validateQueuePayload } from "./_shared/dakota/queue-schema";

export default async function queue(
  request: Request,
  _context: Context,
): Promise<Response> {
  if (request.method !== "GET") return methodNotAllowed(["GET"]);

  const authorization = await getDakotaAuthorization();
  if (!authorization.allowed) {
    const error = authorization.status === 401 ? "Authentication required." : "Forbidden.";
    return privateJson({ error }, authorization.status);
  }

  try {
    const store = getStore({ name: DAKOTA_BLOB_STORE, consistency: "strong" });
    const result = await store.getWithMetadata(DAKOTA_QUEUE_KEY, {
      type: "json",
      consistency: "strong",
    });

    if (!result) {
      return privateJson({ error: "No Dakota queue has been published yet." }, 404);
    }

    const validation = validateQueuePayload(result.data);
    if (!validation.valid) {
      return privateJson({ error: "The stored Dakota queue is unavailable." }, 503);
    }

    const publishedAt =
      typeof result.metadata.publishedAt === "string"
        ? result.metadata.publishedAt
        : null;

    return privateJson({
      ...validation.payload,
      published_at: publishedAt,
    });
  } catch {
    return privateJson({ error: "The Dakota queue is temporarily unavailable." }, 503);
  }
}

export const config: Config = {
  path: "/api/dakota/queue",
};
