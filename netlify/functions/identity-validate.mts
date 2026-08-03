import type { Handler } from "@netlify/functions";

import { enforceDakotaIdentityEvent } from "./_shared/dakota/identity-events";

const handler: Handler = async (event) =>
  enforceDakotaIdentityEvent(event.body, false);

export { handler };
