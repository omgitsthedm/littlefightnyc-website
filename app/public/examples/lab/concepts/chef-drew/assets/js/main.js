(() => {
  const btn = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');

  const closeNav = ({ returnFocus = false } = {}) => {
    if (!btn || !nav || !nav.classList.contains('open')) return;
    nav.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open menu');
    if (returnFocus) btn.focus();
  };

  if (btn && nav) {
    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a && nav?.contains(a)) {
      closeNav();
      return;
    }

    if (nav?.classList.contains('open') && !nav.contains(e.target) && !btn?.contains(e.target)) {
      closeNav();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNav({ returnFocus: true });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeNav();
  });

  const bookingForm = document.querySelector('[data-booking-form]');
  const bookingSummary = document.querySelector('[data-booking-summary]');

  const summaryFields = [
    ['inquiry_type', 'event', 'Choose a service'],
    ['date', 'date', 'Add a date'],
    ['location', 'location', 'Add a location'],
    ['guest_count', 'guests', 'Add guest count'],
    ['budget', 'budget', 'Choose a budget'],
  ];

  const updateBookingSummary = () => {
    if (!bookingForm || !bookingSummary) return;

    summaryFields.forEach(([fieldName, outputName, fallback]) => {
      const field = bookingForm.elements.namedItem(fieldName);
      const output = bookingSummary.querySelector(`[data-summary="${outputName}"]`);
      if (!field || !output) return;
      output.textContent = field.value.trim() || fallback;
      output.classList.toggle('is-ready', Boolean(field.value.trim()));
    });

    const requiredFields = [...bookingForm.querySelectorAll('[required]')];
    const completed = requiredFields.filter((field) => field.value.trim() && field.checkValidity()).length;
    const progress = Math.round((completed / requiredFields.length) * 100);
    bookingSummary.style.setProperty('--brief-progress', `${progress}%`);
    const progressLabel = bookingSummary.querySelector('[data-summary-progress]');
    if (progressLabel) {
      progressLabel.textContent = progress === 100 ? 'Brief ready' : `${progress}% ready`;
      progressLabel.setAttribute('aria-valuenow', String(progress));
    }
  };

  if (bookingForm) {
    bookingForm.addEventListener('input', updateBookingSummary);
    bookingForm.addEventListener('change', updateBookingSummary);
    updateBookingSummary();
  }

  document.querySelectorAll('[data-demo-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const status = form.querySelector('[data-form-status]');
      const submit = form.querySelector('[type="submit"]');
      const kind = form.dataset.demoKind;

      if (submit) {
        submit.disabled = true;
        submit.textContent = kind === 'booking' ? 'Brief captured' : 'You’re on the list';
      }

      if (status) {
        status.hidden = false;
        status.focus({ preventScroll: true });
      }

      form.classList.add('is-complete');
    });
  });
})();
