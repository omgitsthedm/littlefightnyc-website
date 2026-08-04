import type { Config, Context } from "@netlify/functions";

import { getDakotaAuthorization } from "./_shared/dakota/auth";
import { methodNotAllowed, privateJson } from "./_shared/dakota/http";
import {
  activeDakotaOffers,
  DAKOTA_OFFER_CATALOG_VERSION,
} from "./_shared/dakota/offers";

export default async function dakotaOffers(
  request: Request,
  _context: Context,
): Promise<Response> {
  if (request.method !== "GET") return methodNotAllowed(["GET"]);
  if (new URL(request.url).search !== "") {
    return privateJson({ error: "Dakota offers does not accept query parameters." }, 400);
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

  return privateJson({
    schema_version: "dakota.offer-catalog.v1",
    catalog_version: DAKOTA_OFFER_CATALOG_VERSION,
    offers: activeDakotaOffers(),
  });
}

export const config: Config = {
  path: "/api/dakota/offers",
};
