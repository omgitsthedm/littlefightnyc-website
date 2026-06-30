document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (!prefersReducedMotion && finePointer) {
    document
      .querySelectorAll(".journal-masthead-copy, .journal-wayfinder-card, .services-signal-card, .contact-intro-card, .service-card")
      .forEach((element) => {
        if (element.dataset.lifiTiltBound === "true") return;
        element.dataset.lifiTiltBound = "true";
        element.classList.add("lifi-tilt-surface");

        let bounds = null;
        let frame = 0;
        let pointerX = 0;
        let pointerY = 0;

        const readBounds = () => {
          bounds = element.getBoundingClientRect();
        };

        const applyTilt = () => {
          frame = 0;
          if (!bounds || !bounds.width || !bounds.height) return;
          const rotateY = 3.8 * ((pointerX - bounds.left) / bounds.width - 0.5);
          const rotateX = -3.2 * ((pointerY - bounds.top) / bounds.height - 0.5);
          element.style.setProperty("--card-tilt-y", `${rotateY.toFixed(3)}deg`);
          element.style.setProperty("--card-tilt-x", `${rotateX.toFixed(3)}deg`);
        };

        const requestTilt = () => {
          if (!frame) frame = window.requestAnimationFrame(applyTilt);
        };

        element.addEventListener("pointerenter", readBounds, { passive: true });
        element.addEventListener(
          "pointermove",
          (event) => {
            if (!bounds || !bounds.width || !bounds.height) readBounds();
            pointerX = event.clientX;
            pointerY = event.clientY;
            requestTilt();
          },
          { passive: true },
        );
        element.addEventListener(
          "pointerleave",
          () => {
            if (frame) {
              window.cancelAnimationFrame(frame);
              frame = 0;
            }
            element.style.setProperty("--card-tilt-x", "0deg");
            element.style.setProperty("--card-tilt-y", "0deg");
            bounds = null;
          },
          { passive: true },
        );
      });
  }

  const stagedSelectors = [
    ".journal-masthead-copy",
    ".journal-issue-card",
    ".dispatch-feature",
    ".journal-wayfinder-grid > *",
    ".dispatch-mini-column > *",
    ".dispatch-library-grid > *",
    ".services-signal-grid > *",
    ".service-link-grid > *",
    ".premium-process-grid > *",
    ".work-process-grid > *",
    ".contact-intro-card",
    ".form-container",
    ".contact-info-list > *",
    ".services-grid > .service-card",
    ".final-cta",
  ];

  const stagedNodes = [];
  stagedSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      if (element.dataset.lifiRevealBound === "true") return;
      element.dataset.lifiRevealBound = "true";
      element.classList.add("lifi-reveal-item");
      element.style.setProperty("--reveal-index", String(index));
      stagedNodes.push(element);
    });
  });

  if (!stagedNodes.length) return;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    stagedNodes.forEach((element) => element.classList.add("is-onstage"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-onstage");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  stagedNodes.forEach((element) => revealObserver.observe(element));
});
