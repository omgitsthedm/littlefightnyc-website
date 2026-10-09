(() => {
  'use strict';

  const trigger = document.getElementById('farm-house-load');
  const start = document.getElementById('farm-house-start');
  const poster = document.getElementById('farm-house-poster');
  const loading = document.getElementById('loading');
  const status = document.getElementById('status');
  let requested = false;

  const showFailure = () => {
    requested = false;
    trigger.disabled = false;
    trigger.textContent = 'Try again';
    start.hidden = false;
    loading.hidden = true;
    if (status) status.textContent = 'The 3D view did not open. The exterior preview remains available.';
  };

  const finish = () => {
    loading.hidden = true;
    start.hidden = true;
    poster.setAttribute('aria-hidden', 'true');
    if (status) status.textContent = 'Farm House experience ready. Drag to orbit, pinch to zoom, and choose a view or time of day.';
    document.querySelector('#scene canvas')?.focus({ preventScroll: true });
  };

  const observer = new MutationObserver(() => {
    if (document.body.dataset.modelReady === 'true') {
      observer.disconnect();
      finish();
    }
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ['data-model-ready'] });

  const loadViewer = () => {
    if (requested || document.body.dataset.modelReady === 'true') return;
    requested = true;
    trigger.disabled = true;
    trigger.textContent = 'Opening…';
    start.hidden = true;
    loading.hidden = false;
    if (status) status.textContent = 'Opening the Farm House exterior model.';
    const viewer = document.createElement('script');
    viewer.src = './farm-house-viewer.js?v=fictional-exterior-v3';
    viewer.async = false;
    viewer.onerror = showFailure;
    document.body.append(viewer);
    window.setTimeout(() => {
      if (requested && document.body.dataset.modelReady !== 'true') showFailure();
    }, 45000);
  };

  trigger?.addEventListener('click', loadViewer);
  if (new URLSearchParams(location.search).get('open') === '1') loadViewer();
})();
