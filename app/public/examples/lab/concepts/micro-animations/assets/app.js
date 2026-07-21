// Filter cards by category and toggle snippet panels.
const filterButtons = document.querySelectorAll('.filter-pill');
const cards = document.querySelectorAll('.service-card');
const codeButtons = document.querySelectorAll('.code-toggle');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((b) => b.classList.remove('is-active'));
    button.classList.add('is-active');

    cards.forEach((card) => {
      const tags = card.dataset.cats?.split(' ') ?? [];
      const show = filter === 'all' || tags.includes(filter);
      card.hidden = !show;
    });
  });
});

codeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const panel = button.nextElementSibling;
    const willOpen = panel.hasAttribute('hidden');

    panel.toggleAttribute('hidden', !willOpen);
    button.setAttribute('aria-expanded', String(willOpen));
    button.textContent = willOpen ? 'Hide Code' : 'View Code';
  });
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-live', entry.isIntersecting);
      });
    },
    {
      threshold: 0.35,
      rootMargin: '0px 0px -12% 0px',
    },
  );

  cards.forEach((card) => observer.observe(card));
} else {
  cards.forEach((card) => card.classList.add('is-live'));
}
