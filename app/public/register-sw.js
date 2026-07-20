if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        const announce = () => {
          if (!registration.waiting) return;
          window.dispatchEvent(
            new CustomEvent("lf:sw-update-ready", {
              detail: { registration },
            }),
          );
        };

        announce();
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              announce();
            }
          });
        });
      })
      .catch(() => {
        // Service worker registration is progressive enhancement only.
      });
  });
}
