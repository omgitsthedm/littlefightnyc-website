// Little Fight NYC - Main JavaScript
document.addEventListener("DOMContentLoaded", function () {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const supportsFinePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)",
  ).matches;

  // Mobile Navigation Toggle
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (navToggle && navLinks) {
    const closeMenu = () => {
      navToggle.classList.remove("active");
      navLinks.classList.remove("active");
      navToggle.setAttribute("aria-expanded", "false");
    };

    navToggle.addEventListener("click", function () {
      const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.classList.toggle("active");
      navLinks.classList.toggle("active");
      navToggle.setAttribute("aria-expanded", !isExpanded);
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    // Close menu on escape key
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navLinks.classList.contains("active")) {
        closeMenu();
        navToggle.focus();
      }
    });

    // Close menu when clicking outside
    document.addEventListener("click", function (e) {
      if (
        navLinks.classList.contains("active") &&
        !navLinks.contains(e.target) &&
        !navToggle.contains(e.target)
      ) {
        closeMenu();
      }
    });
  }

  // Add a subtle nav state once scrolling starts
  const nav = document.querySelector("nav");
  if (nav) {
    let navRaf = 0;
    const updateNavState = () => {
      nav.classList.toggle("nav-scrolled", window.scrollY > 12);
    };

    updateNavState();
    window.addEventListener(
      "scroll",
      () => {
        if (navRaf) {
          return;
        }
        navRaf = window.requestAnimationFrame(() => {
          updateNavState();
          navRaf = 0;
        });
      },
      { passive: true },
    );
  }

  // FAQ Accordion
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    if (!question) {
      return;
    }

    question.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      // Close all FAQs
      faqItems.forEach((otherItem) => {
        otherItem.classList.remove("active");
        otherItem
          .querySelector(".faq-question")
          .setAttribute("aria-expanded", "false");
      });

      // Toggle current FAQ
      if (!isActive) {
        item.classList.add("active");
        question.setAttribute("aria-expanded", "true");
      }
    });

    // Keyboard accessibility for FAQ
    question.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        question.click();
      }
    });
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href !== "#" && href.length > 1) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          // Account for fixed nav height
          const currentNav = document.querySelector("nav");
          const navHeight = currentNav ? currentNav.offsetHeight : 0;
          const targetPosition =
            target.getBoundingClientRect().top +
            window.pageYOffset -
            navHeight -
            20;

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });

          // Set focus on target for accessibility
          target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
        }
      }
    });
  });

  // Respect reduced motion preference
  if (prefersReducedMotion) {
    document.documentElement.style.scrollBehavior = "auto";
  }

  // Scroll progress bar
  let progressBar = document.querySelector(".scroll-progress");
  if (!progressBar) {
    progressBar = document.createElement("div");
    progressBar.className = "scroll-progress";
    progressBar.setAttribute("aria-hidden", "true");
    document.body.prepend(progressBar);
  }

  let progressRaf = 0;
  const updateProgress = () => {
    progressRaf = 0;
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = `${progress.toFixed(1)}%`;
  };

  updateProgress();
  window.addEventListener(
    "scroll",
    () => {
      if (progressRaf) {
        return;
      }
      progressRaf = window.requestAnimationFrame(updateProgress);
    },
    { passive: true },
  );

  // Elegant ambient pulsating dots background
  if (!prefersReducedMotion) {
    let dotsContainer = document.getElementById("ambient-dots");
    if (!dotsContainer) {
      dotsContainer = document.createElement("div");
      dotsContainer.className = "ambient-dots";
      dotsContainer.id = "ambient-dots";
      dotsContainer.setAttribute("aria-hidden", "true");
      document.body.prepend(dotsContainer);
    }

    const dotCount = Math.min(Math.floor(window.innerWidth / 50), 35);
    const frag = document.createDocumentFragment();

    for (let i = 0; i < dotCount; i++) {
      const dot = document.createElement("span");
      dot.className = "ambient-dot";
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const dur = 4 + Math.random() * 6;
      const delay = Math.random() * 8;
      dot.style.cssText = `left:${x}%;top:${y}%;--dot-dur:${dur.toFixed(1)}s;--dot-delay:${delay.toFixed(1)}s`;
      frag.appendChild(dot);
    }

    dotsContainer.appendChild(frag);
  }

  // Hero spotlight drift for premium depth with a tiny runtime footprint
  const hero = document.querySelector(".hero");
  if (hero && !prefersReducedMotion && supportsFinePointer) {
    let heroRect = null;
    let heroRaf = 0;
    let nextSpotX = 52;
    let nextSpotY = 36;

    const updateHeroRect = () => {
      heroRect = hero.getBoundingClientRect();
    };

    const applyHeroSpotlight = () => {
      heroRaf = 0;
      hero.style.setProperty("--hero-spot-x", `${nextSpotX.toFixed(2)}%`);
      hero.style.setProperty("--hero-spot-y", `${nextSpotY.toFixed(2)}%`);
    };

    const queueHeroSpotlight = () => {
      if (heroRaf) {
        return;
      }
      heroRaf = window.requestAnimationFrame(applyHeroSpotlight);
    };

    hero.addEventListener(
      "pointerenter",
      () => {
        updateHeroRect();
      },
      { passive: true },
    );

    hero.addEventListener(
      "pointermove",
      (event) => {
        if (!heroRect || heroRect.width === 0 || heroRect.height === 0) {
          updateHeroRect();
        }
        if (!heroRect || heroRect.width === 0 || heroRect.height === 0) {
          return;
        }
        nextSpotX = ((event.clientX - heroRect.left) / heroRect.width) * 100;
        nextSpotY = ((event.clientY - heroRect.top) / heroRect.height) * 100;
        queueHeroSpotlight();
      },
      { passive: true },
    );

    hero.addEventListener(
      "pointerleave",
      () => {
        nextSpotX = 52;
        nextSpotY = 36;
        queueHeroSpotlight();
      },
      { passive: true },
    );
  }

  // Context image handling for lf-photo-set imagery (no background ambient layer)
  const accentImages = document.querySelectorAll(
    'main img[src*="/images/lf-photo-set/"]:not([data-no-accent])',
  );
  const supportsObservers = "IntersectionObserver" in window;
  const supportsPointerTilt = !prefersReducedMotion && supportsFinePointer;

  if (accentImages.length > 0) {
    accentImages.forEach((img, index) => {
      img.classList.add("lf-accent-image");

      const media =
        img.closest("figure, .service-case-media") || img.parentElement;
      if (!media) {
        return;
      }

      media.classList.add("lf-accent-media");
      media.dataset.accentDelay = `${Math.min(index % 6, 5) * 70}`;

      if (img.complete) {
        img.classList.add("lf-accent-loaded");
      } else {
        const onReady = () => img.classList.add("lf-accent-loaded");
        img.addEventListener("load", onReady, { once: true });
        img.addEventListener("error", onReady, { once: true });
      }

      if (supportsPointerTilt) {
        let mediaRect = null;
        let mediaRaf = 0;
        let pointerClientX = 0;
        let pointerClientY = 0;

        const updateMediaRect = () => {
          mediaRect = media.getBoundingClientRect();
        };

        const applyTilt = () => {
          mediaRaf = 0;
          if (!mediaRect || mediaRect.width === 0 || mediaRect.height === 0) {
            return;
          }
          const pointerX =
            (pointerClientX - mediaRect.left) / mediaRect.width - 0.5;
          const pointerY =
            (pointerClientY - mediaRect.top) / mediaRect.height - 0.5;

          media.style.setProperty(
            "--accent-tilt-y",
            `${(pointerX * 3.5).toFixed(3)}deg`,
          );
          media.style.setProperty(
            "--accent-tilt-x",
            `${(pointerY * -3.5).toFixed(3)}deg`,
          );
        };

        const queueTilt = () => {
          if (mediaRaf) {
            return;
          }
          mediaRaf = window.requestAnimationFrame(applyTilt);
        };

        media.addEventListener(
          "pointerenter",
          () => {
            updateMediaRect();
          },
          { passive: true },
        );

        media.addEventListener(
          "pointermove",
          (event) => {
            if (!mediaRect || mediaRect.width === 0 || mediaRect.height === 0) {
              updateMediaRect();
            }
            pointerClientX = event.clientX;
            pointerClientY = event.clientY;
            queueTilt();
          },
          { passive: true },
        );

        media.addEventListener(
          "pointerleave",
          () => {
            if (mediaRaf) {
              window.cancelAnimationFrame(mediaRaf);
              mediaRaf = 0;
            }
            media.style.setProperty("--accent-tilt-x", "0deg");
            media.style.setProperty("--accent-tilt-y", "0deg");
            mediaRect = null;
          },
          { passive: true },
        );
      }
    });

    const accentMedia = document.querySelectorAll(".lf-accent-media");
    if (prefersReducedMotion || !supportsObservers) {
      accentMedia.forEach((el) => el.classList.add("lf-accent-in"));
    } else {
      accentMedia.forEach((el) => el.classList.add("lf-accent-ready"));

      const accentObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const delayMs = Number(entry.target.dataset.accentDelay || 0);
              window.setTimeout(() => {
                entry.target.classList.add("lf-accent-in");
              }, delayMs);
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.18,
          rootMargin: "0px 0px -30px 0px",
        },
      );

      accentMedia.forEach((el) => accentObserver.observe(el));
    }
  }

  // Lightweight reveal animation for premium feel without extra libraries
  const revealTargets = document.querySelectorAll(
    ".proof-pill, .service-card, .premium-difference-copy, .premium-point, .hub-cluster, .services-signal-card, .blog-signal-card, .work-metric-card, .content-block, .service-link-card, .insight-card, .final-cta",
  );

  if (revealTargets.length > 0) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealTargets.forEach((el) => el.classList.add("reveal-in"));
    } else {
      revealTargets.forEach((el, index) => {
        el.classList.add("reveal-ready");
        el.style.transitionDelay = `${Math.min(index % 6, 5) * 70}ms`;
      });

      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("reveal-in");
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.14,
          rootMargin: "0px 0px -36px 0px",
        },
      );

      revealTargets.forEach((el) => revealObserver.observe(el));
    }
  }

  // Back to top button
  let btt = document.querySelector(".back-to-top");
  if (!btt) {
    btt = document.createElement("button");
    btt.className = "back-to-top";
    btt.setAttribute("aria-label", "Back to top");
    btt.innerHTML =
      '<svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg>';
    document.body.appendChild(btt);
  }

  let bttRaf = 0;
  const updateBtt = () => {
    bttRaf = 0;
    btt.classList.toggle("visible", window.scrollY > 400);
  };

  updateBtt();
  window.addEventListener(
    "scroll",
    () => {
      if (bttRaf) {
        return;
      }
      bttRaf = window.requestAnimationFrame(updateBtt);
    },
    { passive: true },
  );

  btt.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Animated number counter for stats
  const animateNumber = (el, target, suffix) => {
    const duration = 1200;
    const start = performance.now();
    const isDecimal = String(target).includes(".");

    const step = (now) => {
      const elapsed = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3); // easeOutCubic
      const current = eased * target;

      if (isDecimal) {
        el.textContent = current.toFixed(1) + suffix;
      } else {
        el.textContent = Math.round(current) + suffix;
      }

      if (elapsed < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  };

  // Stats image grid - staggered reveal on scroll
  const statsCards = document.querySelectorAll(".stats-image-card");
  if (statsCards.length > 0) {
    const triggerCounter = (card) => {
      const numEl = card.querySelector(".stats-image-number");
      if (!numEl || numEl.dataset.counted) {
        return;
      }
      numEl.dataset.counted = "1";
      const raw = numEl.textContent.trim();
      const match = raw.match(/([\d.]+)(.*)/);
      if (match) {
        const target = parseFloat(match[1]);
        const suffix = match[2];
        animateNumber(numEl, target, suffix);
      }
    };

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      statsCards.forEach((el) => el.classList.add("stats-visible"));
    } else {
      const statsObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const index = Array.from(statsCards).indexOf(entry.target);
              const delay = Math.min(index, 8) * 80;
              window.setTimeout(() => {
                entry.target.classList.add("stats-visible");
                triggerCounter(entry.target);
              }, delay);
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.15,
          rootMargin: "0px 0px -20px 0px",
        },
      );

      statsCards.forEach((el) => statsObserver.observe(el));
    }
  }
});
