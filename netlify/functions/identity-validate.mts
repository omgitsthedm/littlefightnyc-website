import type { Handler } from "@netlify/functions";

// The former private product is retired. Preserve the closed Identity boundary
// without changing account settings or deleting existing account records.
export const handler: Handler = async () => ({
  statusCode: 403,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ error: "This private application is retired." }),
});
