(() => {
  if (window.location.pathname !== "/" || window.location.hash.length < 2) return;

  const callback = new URLSearchParams(window.location.hash.slice(1));
  const identityTokenKeys = [
    "access_token",
    "confirmation_token",
    "email_change_token",
    "invite_token",
    "recovery_token",
  ];

  if (!identityTokenKeys.some((key) => callback.has(key))) return;

  const returnCookie = "dakota_auth_return=www.dakota.littlefightnyc.com";
  const returnToDakotaHost = document.cookie
    .split(";")
    .some((value) => value.trim() === returnCookie);

  if (returnToDakotaHost) {
    document.cookie = "dakota_auth_return=; Domain=.littlefightnyc.com; Path=/; Max-Age=0; SameSite=Lax; Secure";
  }

  const destination = new URL(
    "/app/",
    returnToDakotaHost ? "https://www.dakota.littlefightnyc.com" : window.location.origin,
  );
  destination.hash = window.location.hash;
  window.location.replace(destination);
})();
