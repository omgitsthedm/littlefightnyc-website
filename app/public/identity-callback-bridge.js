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

  const destination = new URL("/app/", window.location.origin);
  destination.hash = window.location.hash;
  window.location.replace(destination);
})();
