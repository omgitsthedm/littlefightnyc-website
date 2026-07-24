(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rows = Array.prototype.slice.call(document.querySelectorAll('[data-preview]'));
  var frame = document.querySelector('[data-preview-frame]');
  var loading = document.querySelector('[data-preview-loading]');
  var idle = document.querySelector('[data-preview-idle]');
  var title = document.querySelector('[data-preview-title]');
  var type = document.querySelector('[data-preview-type]');
  var link = document.querySelector('[data-preview-link]');
  var featureStage = document.querySelector('[data-feature-stage]');
  var featureActivate = document.querySelector('[data-feature-activate]');
  var featureFrame = null;
  var frameObserver = null;
  var previewTimer = 0;
  var loadTimer = 0;
  var activePath = '';
  var canHoverPreview = window.matchMedia &&
    window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 561px)').matches;

  function revealRows() {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      rows.forEach(function (row) { row.classList.add('is-visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -5% 0px', threshold: 0.06 });
    rows.forEach(function (row) { observer.observe(row); });
  }

  function select(row) {
    if (!frame || !row) return;
    deactivateFeature();
    var path = row.getAttribute('data-preview');
    rows.forEach(function (item) { item.classList.toggle('is-previewing', item === row); });
    title.textContent = row.getAttribute('data-title') || row.textContent.trim();
    type.textContent = row.getAttribute('data-type') || 'Working prototype';
    link.href = row.href;
    idle.hidden = true;
    if (path === activePath) return;
    if (frame.contentWindow) {
      frame.contentWindow.postMessage({ type: 'lab:visibility', active: false }, location.origin);
    }
    activePath = path;
    frame.classList.remove('is-loaded');
    loading.hidden = false;
    loading.textContent = 'Opening the live build';
    frame.src = path;
    clearTimeout(loadTimer);
    loadTimer = setTimeout(function () {
      if (frame.classList.contains('is-loaded')) return;
      loading.textContent = 'Preview unavailable. Open the full build to continue.';
    }, 9000);
  }

  if (frame) {
    frame.referrerPolicy = 'same-origin';
    frame.addEventListener('load', function () {
      clearTimeout(loadTimer);
      loading.hidden = true;
      frame.classList.add('is-loaded');
      if (frame.contentWindow) {
        frame.contentWindow.postMessage({ type: 'lab:visibility', active: true }, location.origin);
      }
    });
  }

  function activateFeature() {
    if (!featureStage || featureFrame) return;
    featureActivate.disabled = true;
    featureFrame = document.createElement('iframe');
    featureFrame.src = '/examples/lab/concepts/walkup-3d/index.html?embed=1';
    featureFrame.title = 'Live preview of the Brownstone Walk-Up';
    featureFrame.tabIndex = -1;
    featureFrame.referrerPolicy = 'same-origin';
    featureFrame.setAttribute('data-feature-frame', '');
    featureFrame.addEventListener('load', function () {
      featureStage.classList.add('is-live');
      if (featureFrame.contentWindow) {
        featureFrame.contentWindow.postMessage({ type: 'lab:visibility', active: true }, location.origin);
      }
    }, { once: true });
    featureStage.appendChild(featureFrame);
    if (frameObserver) frameObserver.observe(featureFrame);
  }

  function deactivateFeature() {
    if (!featureFrame) return;
    if (frameObserver) frameObserver.unobserve(featureFrame);
    if (featureFrame.contentWindow) {
      featureFrame.contentWindow.postMessage({ type: 'lab:visibility', active: false }, location.origin);
    }
    featureFrame.remove();
    featureFrame = null;
    featureStage.classList.remove('is-live');
    featureActivate.disabled = false;
  }

  if (featureActivate) featureActivate.addEventListener('click', activateFeature);

  if (canHoverPreview) {
    rows.forEach(function (row) {
      function schedule() {
        clearTimeout(previewTimer);
        previewTimer = setTimeout(function () { select(row); }, 100);
      }
      row.addEventListener('pointerenter', schedule);
      row.addEventListener('focus', schedule);
    });
  }

  if ('IntersectionObserver' in window) {
    frameObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.target.contentWindow) return;
        entry.target.contentWindow.postMessage({ type: 'lab:visibility', active: entry.isIntersecting }, location.origin);
      });
    }, { threshold: 0.08 });
    if (featureFrame) frameObserver.observe(featureFrame);
    if (frame) frameObserver.observe(frame);
  }

  revealRows();
})();
