module.exports = async (page) => {
  await page.emulateMedia({ reducedMotion: "reduce" }).catch(() => {});
  await page.locator(".route-loading").first().waitFor({ state: "hidden", timeout: 10000 }).catch(() => {});
  await page.locator("main, h1").first().waitFor({ state: "visible", timeout: 10000 }).catch(() => {});
  await page.addStyleTag({
    content: `
      *,
      *::before,
      *::after {
        animation: none !important;
        transition: none !important;
        scroll-behavior: auto !important;
      }

      canvas,
      video,
      [data-anim],
      .dot-field,
      .hero-canvas {
        visibility: hidden !important;
      }
    `,
  });
  await page.evaluate(async () => {
    await document.fonts?.ready?.catch?.(() => {});

    document.querySelectorAll("[data-revealed]").forEach((element) => {
      element.setAttribute("data-revealed", "true");
    });

    [...document.images].forEach((image) => {
      image.loading = "eager";
      image.decoding = "sync";
    });

    const viewportStep = Math.max(240, Math.floor(window.innerHeight * 0.75));
    const pageHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);

    for (let y = 0; y <= pageHeight; y += viewportStep) {
      window.scrollTo(0, y);
      await new Promise((resolve) => window.setTimeout(resolve, 80));
    }

    const imageReady = Promise.all(
      [...document.images].map((image) => {
        if (image.complete && image.naturalWidth > 0) return true;

        return new Promise((resolve) => {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
        });
      }),
    );

    await Promise.race([imageReady, new Promise((resolve) => window.setTimeout(resolve, 5000))]);
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(750);
};
