import { getUser, type User } from "@netlify/identity";

import { DAKOTA_OPERATOR_EMAIL, DAKOTA_OPERATOR_ROLE } from "./constants";

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

  const hasExactEmail = normalizeEmail(user.email) === DAKOTA_OPERATOR_EMAIL;
  const hasOperatorRole = user.roles?.includes(DAKOTA_OPERATOR_ROLE) === true;

  if (!hasExactEmail || !hasOperatorRole) {
    return { allowed: false, status: 403 };
  }

  return { allowed: true, user };
}

export async function getDakotaAuthorization(): Promise<DakotaAuthorization> {
  return authorizeDakotaUser(await getUser());
}
