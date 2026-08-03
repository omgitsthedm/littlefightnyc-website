import {
  AuthError,
  getUser,
  handleAuthCallback,
  logout,
  oauthLogin,
  onAuthChange,
  type User,
} from "@netlify/identity";

export const OPERATOR_EMAIL = "hello@littlefightnyc.com";
export const OPERATOR_ROLE = "dakota_operator";
const DAKOTA_CUSTOM_HOST = "www.dakota.littlefightnyc.com";
const AUTH_RETURN_COOKIE = "dakota_auth_return";

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

export function beginGoogleLogin(): void {
  if (window.location.hostname === DAKOTA_CUSTOM_HOST) {
    document.cookie = `${AUTH_RETURN_COOKIE}=${DAKOTA_CUSTOM_HOST}; Domain=.littlefightnyc.com; Path=/; Max-Age=300; SameSite=Lax; Secure`;
  }

  try {
    oauthLogin("google");
  } catch (error) {
    // @netlify/identity deliberately throws after assigning window.location.
    // The redirect is already underway; do not surface it as an app failure.
    if (error instanceof AuthError && error.message === "Redirecting to OAuth provider") return;
    throw error;
  }
}

export async function endSession(): Promise<void> {
  await logout();
}

export { onAuthChange };
