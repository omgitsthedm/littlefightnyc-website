import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id || !/^[a-z0-9-]+$/.test(id)) {
    return new Response(JSON.stringify({ error: "Invalid audit ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const store = getStore({ name: "audit-status", consistency: "strong" });
  const status = await store.get(id, { type: "json" });

  if (!status) {
    return new Response(
      JSON.stringify({ status: "not_found" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify(status), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const config: Config = {
  path: "/examples/audit/api/status",
};
