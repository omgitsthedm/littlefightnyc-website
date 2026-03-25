document.addEventListener("DOMContentLoaded",function(){const e=window.matchMedia("(prefers-reduced-motion: reduce)").matches,t=window.matchMedia("(hover: hover) and (pointer: fine)").matches;if(!e&&t){const e=document.body;if(e.classList.contains("page-shell")){let t=0,n=54,o=18;const i=()=>{t=0,e.style.setProperty("--page-spot-x",`${n.toFixed(2)}%`),e.style.setProperty("--page-spot-y",`${o.toFixed(2)}%`)},s=()=>{t||(t=window.requestAnimationFrame(i))};window.addEventListener("pointermove",t=>{n=t.clientX/window.innerWidth*100,o=t.clientY/window.innerHeight*100,s()},{passive:!0})}const n=document.querySelectorAll(".journal-issue-card, .dispatch-feature, .dispatch-mini-card, .dispatch-card, .form-container, .contact-info-item, .service-link-card, .work-process-step, .premium-process-step, .industry-map-card, .story-card, .story-step, .final-cta");n.forEach(e=>{let n=null,o=0,i=0,s=0,a=0;e.classList.add("lifi-tilt-surface");const r=()=>{n=e.getBoundingClientRect()},c=()=>{o=0,n&&0!==n.width&&0!==n.height&&(e.style.setProperty("--card-tilt-y",`${(3.8*((i-n.left)/n.width-.5)).toFixed(3)}deg`),e.style.setProperty("--card-tilt-x",`${(-3.2*((s-n.top)/n.height-.5)).toFixed(3)}deg`))},d=()=>{o||(o=window.requestAnimationFrame(c))};e.addEventListener("pointerenter",()=>{r()},{passive:!0}),e.addEventListener("pointermove",t=>{n&&0!==n.width&&0!==n.height||r(),i=t.clientX,s=t.clientY,d()},{passive:!0}),e.addEventListener("pointerleave",()=>{o&&(window.cancelAnimationFrame(o),o=0),e.style.setProperty("--card-tilt-x","0deg"),e.style.setProperty("--card-tilt-y","0deg"),n=null},{passive:!0})});const o=document.querySelectorAll(".btn, .nav-cta-btn, .mobile-sticky-phone, .mobile-sticky-cta, .dispatch-read, .dispatch-mini-read, .dispatch-card-read, .issue-link, .story-link, .story-links a, .back-to-top");o.forEach(t=>{let n=null;const o=()=>{t.classList.add("is-pressing"),n&&window.clearTimeout(n),n=window.setTimeout(()=>{t.classList.remove("is-pressing")},170)};t.addEventListener("pointerdown",o,{passive:!0}),t.addEventListener("pointerup",()=>{n&&window.clearTimeout(n),n=window.setTimeout(()=>{t.classList.remove("is-pressing")},90)},{passive:!0}),t.addEventListener("pointerleave",()=>{n&&window.clearTimeout(n),t.classList.remove("is-pressing")},{passive:!0})})}});

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
