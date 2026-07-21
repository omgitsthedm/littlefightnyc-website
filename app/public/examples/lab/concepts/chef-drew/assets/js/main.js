(() => {
  const btn = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (btn && nav) {
    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Close mobile nav when clicking a link
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    if (nav && nav.classList.contains('open')) {
      nav.classList.remove('open');
      btn && btn.setAttribute('aria-expanded', 'false');
    }
  });
})();
