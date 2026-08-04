import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";

import { getDakotaAuthorization } from "./_shared/dakota/auth";
import { handleDakotaRevenueBridgeRequest } from "./_shared/dakota/revenue-bridge-handler";
import { DAKOTA_REVENUE_BRIDGE_STORE } from "./_shared/dakota/revenue-bridge-schema";

export default async function revenueBridge(
  request: Request,
  _context: Context,
): Promise<Response> {
  return handleDakotaRevenueBridgeRequest(request, {
    authorize: getDakotaAuthorization,
    getStore: () => getStore({ name: DAKOTA_REVENUE_BRIDGE_STORE, consistency: "strong" }),
  });
}

export const config: Config = {
  path: "/api/dakota/revenue-bridge",
};
