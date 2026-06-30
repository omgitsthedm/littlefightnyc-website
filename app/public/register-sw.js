if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const register = () => navigator.serviceWorker.register("/sw.js").catch(() => {
      // Service worker registration is progressive enhancement only.
    });

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(register, { timeout: 2500 });
      return;
    }

    window.setTimeout(register, 1500);
  });
}
