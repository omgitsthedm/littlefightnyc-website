import { getUser, type User } from "@netlify/identity";

import { resolveWorkspaceContext } from "./workspace-config";

export type DakotaAuthorization =
  | { allowed: true; user: User }
  | { allowed: false; status: 401 | 403 };

export function normalizeEmail(email: unknown): string {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

export function authorizeDakotaUser(user: User | null): DakotaAuthorization {
  if (!user) {
    return { allowed: false, status: 401 };
  }

  const policy = resolveWorkspaceContext().config.operator;
  const hasExactEmail = normalizeEmail(user.email) === policy.email;
  const hasOperatorRole = policy.roles.every((role) => user.roles?.includes(role) === true);

  if (!hasExactEmail || !hasOperatorRole) {
    return { allowed: false, status: 403 };
  }

  return { allowed: true, user };
}

export async function getDakotaAuthorization(): Promise<DakotaAuthorization> {
  return authorizeDakotaUser(await getUser());
}
