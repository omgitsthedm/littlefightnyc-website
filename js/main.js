document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const nav = document.querySelector("nav");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (navToggle && navLinks) {
    let navOverlay = document.querySelector(".nav-overlay");

    if (!navOverlay) {
      navOverlay = document.createElement("button");
      navOverlay.type = "button";
      navOverlay.className = "nav-overlay";
      navOverlay.setAttribute("aria-hidden", "true");
      navOverlay.tabIndex = -1;
      document.body.appendChild(navOverlay);
    }

    const isDesktop = () => window.innerWidth > 960;
    const setNavLinkAvailability = (available) => {
      navLinks.querySelectorAll("a, button, input, select, textarea, [tabindex]").forEach((item) => {
        if (available) {
          const previousTabindex = item.dataset.previousTabindex;
          if (previousTabindex !== undefined) {
            if (previousTabindex) item.setAttribute("tabindex", previousTabindex);
            else item.removeAttribute("tabindex");
            delete item.dataset.previousTabindex;
          } else {
            item.removeAttribute("tabindex");
          }
          return;
        }

        if (item.dataset.previousTabindex === undefined) {
          item.dataset.previousTabindex = item.getAttribute("tabindex") || "";
        }
        item.setAttribute("tabindex", "-1");
      });
    };

    const closeMenu = ({ restoreFocus = false } = {}) => {
      navToggle.classList.remove("active");
      navLinks.classList.remove("open", "active");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open navigation");
      navLinks.setAttribute("aria-hidden", "true");
      setNavLinkAvailability(false);
      navOverlay.classList.remove("is-visible");
      navOverlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("nav-menu-open");
      if (restoreFocus) navToggle.focus();
    };

    const openMenu = () => {
      navToggle.classList.add("active");
      navLinks.classList.add("open", "active");
      navToggle.setAttribute("aria-expanded", "true");
      navToggle.setAttribute("aria-label", "Close navigation");
      navLinks.setAttribute("aria-hidden", "false");
      setNavLinkAvailability(true);
      navOverlay.classList.add("is-visible");
      navOverlay.setAttribute("aria-hidden", "false");
      document.body.classList.add("nav-menu-open");
    };

    navToggle.setAttribute("aria-label", "Open navigation");
    navLinks.setAttribute("aria-hidden", isDesktop() ? "false" : "true");
    setNavLinkAvailability(isDesktop());

    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      if (expanded) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    navOverlay.addEventListener("click", () => closeMenu({ restoreFocus: true }));

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (!isDesktop()) closeMenu();
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navLinks.classList.contains("open")) {
        closeMenu({ restoreFocus: true });
      }
    });

    window.addEventListener(
      "resize",
      () => {
        if (isDesktop()) {
          navLinks.classList.remove("open", "active");
          navLinks.setAttribute("aria-hidden", "false");
          setNavLinkAvailability(true);
          navOverlay.classList.remove("is-visible");
          navOverlay.setAttribute("aria-hidden", "true");
          document.body.classList.remove("nav-menu-open");
          navToggle.classList.remove("active");
          navToggle.setAttribute("aria-expanded", "false");
          navToggle.setAttribute("aria-label", "Open navigation");
          return;
        }

        if (!navLinks.classList.contains("open")) {
          navLinks.setAttribute("aria-hidden", "true");
          setNavLinkAvailability(false);
        }
      },
      { passive: true },
    );

    const currentPath = window.location.pathname.replace(/index\.html$/, "");
    navLinks.querySelectorAll("a[href]").forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#")) return;
      const normalizedHref = href.replace(/index\.html$/, "");
      if (
        normalizedHref === currentPath ||
        (normalizedHref !== "/" && currentPath.startsWith(normalizedHref))
      ) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  if (nav) {
    let navFrame = 0;
    const syncNavState = () => {
      navFrame = 0;
      nav.classList.toggle("nav-scrolled", window.scrollY > 12);
    };
    syncNavState();
    window.addEventListener(
      "scroll",
      () => {
        if (!navFrame) navFrame = window.requestAnimationFrame(syncNavState);
      },
      { passive: true },
    );
  }

  document.querySelectorAll(".faq-item").forEach((item) => {
    const trigger = item.querySelector(".faq-question");
    if (!trigger) return;

    trigger.addEventListener("click", () => {
      const isOpen = item.classList.contains("active");
      document.querySelectorAll(".faq-item").forEach((other) => {
        other.classList.remove("active");
        other
          .querySelector(".faq-question")
          ?.setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        item.classList.add("active");
        trigger.setAttribute("aria-expanded", "true");
      }
    });

    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        trigger.click();
      }
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      const navOffset = nav ? nav.offsetHeight : 0;
      const targetTop =
        target.getBoundingClientRect().top + window.pageYOffset - navOffset - 20;

      window.scrollTo({
        top: targetTop,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });

      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });

  if (prefersReducedMotion) {
    document.documentElement.style.scrollBehavior = "auto";
  }

  let scrollProgress = document.querySelector(".scroll-progress");
  if (!scrollProgress) {
    scrollProgress = document.createElement("div");
    scrollProgress.className = "scroll-progress";
    scrollProgress.setAttribute("aria-hidden", "true");
    document.body.prepend(scrollProgress);
  }

  let progressFrame = 0;
  const updateScrollProgress = () => {
    progressFrame = 0;
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
    scrollProgress.style.width = `${progress.toFixed(1)}%`;
  };
  updateScrollProgress();
  window.addEventListener(
    "scroll",
    () => {
      if (!progressFrame) {
        progressFrame = window.requestAnimationFrame(updateScrollProgress);
      }
    },
    { passive: true },
  );

  if (!prefersReducedMotion) {
    let ambientDots = document.getElementById("ambient-dots");
    if (!ambientDots) {
      ambientDots = document.createElement("div");
      ambientDots.className = "ambient-dots";
      ambientDots.id = "ambient-dots";
      ambientDots.setAttribute("aria-hidden", "true");
      document.body.prepend(ambientDots);
      const dotCount = Math.min(Math.floor(window.innerWidth / 50), 35);
      const fragment = document.createDocumentFragment();

      for (let i = 0; i < dotCount; i += 1) {
        const dot = document.createElement("span");
        dot.className = "ambient-dot";
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const duration = 4 + Math.random() * 6;
        const delay = Math.random() * 8;
        dot.style.cssText = `left:${left}%;top:${top}%;--dot-dur:${duration.toFixed(1)}s;--dot-delay:${delay.toFixed(1)}s`;
        fragment.appendChild(dot);
      }

      ambientDots.appendChild(fragment);
    }
  }

  const buildConversionRail = () => {
    if (document.querySelector(".site-conversion-rail")) return;

    const path = window.location.pathname.replace(/index\.html$/, "");
    const isFitCheck = path.startsWith("/fit-check/");
    const isContact = path.startsWith("/contact/");
    const primaryHref = isFitCheck ? "#fit-check-intake" : "/fit-check/";
    const primaryText = "Start Here";
    const note = isContact
      ? "Want the fastest path?"
      : isFitCheck
        ? "Something costing you money right now?"
        : "Paying for tools that do not pay you back?";
    const detail = isContact
      ? "Tell us what is expensive, broken, slow, or unfair."
      : isFitCheck
        ? "Call if customers, payments, bookings, email, or access are blocked."
        : "Tell us what is broken, slow, expensive, or annoying. We will find the smallest useful next move.";

    const rail = document.createElement("aside");
    rail.className = "site-conversion-rail";
    rail.setAttribute("aria-label", "Fast next step");
    rail.innerHTML = `
      <div class="site-conversion-rail__inner">
        <div class="site-conversion-rail__copy">
          <strong>${note}</strong>
          <span>${detail}</span>
        </div>
        <div class="site-conversion-rail__actions">
          <a class="site-conversion-rail__primary" href="${primaryHref}">${primaryText}</a>
          <a class="site-conversion-rail__secondary" href="tel:+16463600318">Call now</a>
        </div>
      </div>
    `;
    document.body.appendChild(rail);
    document.body.classList.add("has-site-conversion-rail");

    let railFrame = 0;
    const syncRail = () => {
      railFrame = 0;
      const visible = path !== "/" || window.scrollY > 420;
      rail.classList.toggle("is-visible", visible);
    };
    syncRail();
    window.addEventListener(
      "scroll",
      () => {
        if (!railFrame) railFrame = window.requestAnimationFrame(syncRail);
      },
      { passive: true },
    );
  };

  buildConversionRail();

  const hero = document.querySelector(".hero");
  if (hero && !prefersReducedMotion && finePointer) {
    let heroBounds = null;
    let heroFrame = 0;
    let heroX = 52;
    let heroY = 36;

    const readHeroBounds = () => {
      heroBounds = hero.getBoundingClientRect();
    };

    const applyHeroSpotlight = () => {
      heroFrame = 0;
      hero.style.setProperty("--hero-spot-x", `${heroX.toFixed(2)}%`);
      hero.style.setProperty("--hero-spot-y", `${heroY.toFixed(2)}%`);
    };

    const requestHeroSpotlight = () => {
      if (!heroFrame) heroFrame = window.requestAnimationFrame(applyHeroSpotlight);
    };

    hero.addEventListener("pointerenter", readHeroBounds, { passive: true });
    hero.addEventListener(
      "pointermove",
      (event) => {
        if (!heroBounds || !heroBounds.width || !heroBounds.height) readHeroBounds();
        if (!heroBounds || !heroBounds.width || !heroBounds.height) return;
        heroX = ((event.clientX - heroBounds.left) / heroBounds.width) * 100;
        heroY = ((event.clientY - heroBounds.top) / heroBounds.height) * 100;
        requestHeroSpotlight();
      },
      { passive: true },
    );
    hero.addEventListener(
      "pointerleave",
      () => {
        heroX = 52;
        heroY = 36;
        requestHeroSpotlight();
      },
      { passive: true },
    );
  }

  const interactiveTiltSelectors = [
    ".journal-issue-card",
    ".dispatch-feature",
    ".dispatch-mini-card",
    ".dispatch-card",
    ".form-container",
    ".contact-info-item",
    ".service-link-card",
    ".work-process-step",
    ".premium-process-step",
    ".industry-map-card",
    ".story-card",
    ".story-step",
    ".final-cta",
    ".journal-masthead-copy",
    ".journal-wayfinder-card",
    ".services-signal-card",
    ".contact-intro-card",
    ".service-card",
  ];

  if (!prefersReducedMotion && finePointer) {
    document
      .querySelectorAll(interactiveTiltSelectors.join(", "))
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

  document
    .querySelectorAll(
      ".btn, .nav-cta-btn, .mobile-sticky-phone, .mobile-sticky-cta, .dispatch-read, .dispatch-mini-read, .dispatch-card-read, .issue-link, .story-link, .story-links a, .back-to-top, .site-conversion-rail a",
    )
    .forEach((element) => {
      let pressTimer = null;
      const press = () => {
        element.classList.add("is-pressing");
        if (pressTimer) window.clearTimeout(pressTimer);
        pressTimer = window.setTimeout(() => {
          element.classList.remove("is-pressing");
        }, 170);
      };

      element.addEventListener("pointerdown", press, { passive: true });
      element.addEventListener(
        "pointerup",
        () => {
          if (pressTimer) window.clearTimeout(pressTimer);
          pressTimer = window.setTimeout(() => {
            element.classList.remove("is-pressing");
          }, 90);
        },
        { passive: true },
      );
      element.addEventListener(
        "pointerleave",
        () => {
          if (pressTimer) window.clearTimeout(pressTimer);
          element.classList.remove("is-pressing");
        },
        { passive: true },
      );
    });

  const accentImages = document.querySelectorAll(
    'main img[src*="/images/lf-photo-set/"]:not([data-no-accent])',
  );
  const supportsIntersectionObserver = "IntersectionObserver" in window;

  if (accentImages.length) {
    accentImages.forEach((image, index) => {
      image.classList.add("lf-accent-image");
      const media = image.closest("figure, .service-case-media") || image.parentElement;
      if (!media) return;

      media.classList.add("lf-accent-media");
      media.dataset.accentDelay = String(70 * Math.min(index % 6, 5));

      if (image.complete) {
        image.classList.add("lf-accent-loaded");
      } else {
        const markLoaded = () => image.classList.add("lf-accent-loaded");
        image.addEventListener("load", markLoaded, { once: true });
        image.addEventListener("error", markLoaded, { once: true });
      }
    });

    const accentMedia = document.querySelectorAll(".lf-accent-media");
    if (prefersReducedMotion || !supportsIntersectionObserver) {
      accentMedia.forEach((media) => media.classList.add("lf-accent-in"));
    } else {
      accentMedia.forEach((media) => media.classList.add("lf-accent-ready"));
      const accentObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const delay = Number(entry.target.dataset.accentDelay || 0);
            window.setTimeout(() => {
              entry.target.classList.add("lf-accent-in");
            }, delay);
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.18, rootMargin: "0px 0px -30px 0px" },
      );

      accentMedia.forEach((media) => accentObserver.observe(media));
    }
  }

  const stagedSelectors = [
    ".proof-pill",
    ".service-card",
    ".premium-difference-copy",
    ".premium-point",
    ".hub-cluster",
    ".services-signal-card",
    ".work-metric-card",
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
      element.classList.add("reveal-ready");
      element.style.transitionDelay = `${70 * Math.min(index % 6, 5)}ms`;
      stagedNodes.push(element);
    });
  });

  if (stagedNodes.length) {
    if (prefersReducedMotion || !supportsIntersectionObserver) {
      stagedNodes.forEach((element) => element.classList.add("reveal-in"));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("reveal-in");
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.14, rootMargin: "0px 0px 12% 0px" },
      );
      stagedNodes.forEach((element) => revealObserver.observe(element));
    }
  }

  let backToTop = document.querySelector(".back-to-top");
  if (!backToTop) {
    backToTop = document.createElement("button");
    backToTop.className = "back-to-top";
    backToTop.setAttribute("aria-label", "Back to top");
    backToTop.innerHTML =
      '<svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg>';
    document.body.appendChild(backToTop);
  }

  let backToTopFrame = 0;
  const syncBackToTop = () => {
    backToTopFrame = 0;
    backToTop.classList.toggle("visible", window.scrollY > 400);
  };
  syncBackToTop();
  window.addEventListener(
    "scroll",
    () => {
      if (!backToTopFrame) backToTopFrame = window.requestAnimationFrame(syncBackToTop);
    },
    { passive: true },
  );
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  const statsCards = document.querySelectorAll(".stats-image-card");
  if (statsCards.length) {
    const animateStatCard = (card) => {
      const numberEl = card.querySelector(".stats-image-number");
      if (!numberEl || numberEl.dataset.counted) return;
      numberEl.dataset.counted = "true";
      const match = numberEl.textContent.trim().match(/([\d.]+)(.*)/);
      if (!match) return;

      const target = parseFloat(match[1]);
      const suffix = match[2];
      const start = performance.now();
      const hasDecimal = String(target).includes(".");

      const tick = (timestamp) => {
        const progress = Math.min((timestamp - start) / 1200, 1);
        const value = (1 - Math.pow(1 - progress, 3)) * target;
        numberEl.textContent = hasDecimal
          ? `${value.toFixed(1)}${suffix}`
          : `${Math.round(value)}${suffix}`;
        if (progress < 1) window.requestAnimationFrame(tick);
      };

      window.requestAnimationFrame(tick);
    };

    if (prefersReducedMotion || !supportsIntersectionObserver) {
      statsCards.forEach((card) => card.classList.add("stats-visible"));
    } else {
      const statsObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const index = Array.from(statsCards).indexOf(entry.target);
            const delay = 80 * Math.min(index, 8);
            window.setTimeout(() => {
              entry.target.classList.add("stats-visible");
              animateStatCard(entry.target);
            }, delay);
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -20px 0px" },
      );

      statsCards.forEach((card) => statsObserver.observe(card));
    }
  }
});
