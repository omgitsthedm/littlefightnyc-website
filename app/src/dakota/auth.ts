import {
  getUser,
  handleAuthCallback,
  logout,
  oauthLogin,
  onAuthChange,
  type User,
} from "@netlify/identity";

export const OPERATOR_EMAIL = "hello@littlefightnyc.com";
export const OPERATOR_ROLE = "dakota_operator";

export function isDakotaOperator(user: User | null): user is User & { email: string } {
  return Boolean(
    user?.email?.trim().toLowerCase() === OPERATOR_EMAIL &&
      user.roles?.includes(OPERATOR_ROLE),
  );
}

export async function completeAuthCallback(): Promise<User | null> {
  const result = await handleAuthCallback();
  return result?.user ?? null;
}

export async function getCurrentUser(): Promise<User | null> {
  return getUser();
}

export function beginGoogleLogin(): never {
  return oauthLogin("google");
}

export async function endSession(): Promise<void> {
  await logout();
}

export { onAuthChange };
