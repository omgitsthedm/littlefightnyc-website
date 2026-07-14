if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // If a new service worker is waiting, ask it to activate immediately
        // so the next navigation uses the fresh shell.
        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) return;

          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              installing.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });

        // iOS Safari is aggressive about pausing service workers when the page
        // is backgrounded. Update the registration when the tab returns to the
        // foreground so the shell never go stale between sessions.
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") {
            registration.update().catch(() => {
              // Update checks are best-effort.
            });
          }
        });
      })
      .catch(() => {
        // Service worker registration is progressive enhancement only.
      });

    // When the active controller changes, reload once so the new shell runs.
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  });
}
