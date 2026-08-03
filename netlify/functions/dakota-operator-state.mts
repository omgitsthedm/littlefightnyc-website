import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";

import { getDakotaAuthorization } from "./_shared/dakota/auth";
import {
  DAKOTA_OPERATOR_BLOB_STORE,
  handleDakotaOperatorStateRequest,
} from "./_shared/dakota/operator-state-handler";

export default async function operatorState(
  request: Request,
  _context: Context,
): Promise<Response> {
  return handleDakotaOperatorStateRequest(request, {
    authorize: getDakotaAuthorization,
    getStore: () =>
      getStore({
        name: DAKOTA_OPERATOR_BLOB_STORE,
        consistency: "strong",
      }),
  });
}

export const config: Config = {
  path: "/api/dakota/operator-state",
};
