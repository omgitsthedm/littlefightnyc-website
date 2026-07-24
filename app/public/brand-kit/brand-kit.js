(() => {
  const toast = document.querySelector("[data-toast]");
  let toastTimer = 0;

  async function copyText(value) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(value);
        return true;
      } catch {
        // The textarea fallback supports file and restricted browser contexts.
      }
    }

    const field = document.createElement("textarea");
    field.value = value;
    field.readOnly = true;
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();

    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }
    field.remove();
    return copied;
  }

  document.querySelectorAll("[data-copy]").forEach((control) => {
    control.addEventListener("click", async () => {
      const value = control.getAttribute("data-copy") || "";
      const copied = await copyText(value);
      if (!toast) return;

      toast.textContent = copied ? `${value} copied` : `Copy unavailable. Value: ${value}`;
      toast.setAttribute("data-show", "true");
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => {
        toast.setAttribute("data-show", "false");
      }, 1600);
    });
  });

  const navLinks = [...document.querySelectorAll(".nav-links a[href^='#']")];
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const linksById = new Map(
      navLinks.map((link) => [link.getAttribute("href").slice(1), link]),
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => link.removeAttribute("aria-current"));
          linksById.get(entry.target.id)?.setAttribute("aria-current", "true");
        });
      },
      { rootMargin: "-32% 0px -62% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
  }
})();
