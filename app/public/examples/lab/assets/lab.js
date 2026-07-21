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
  var featureFrame = document.querySelector('[data-feature-frame]');
  var previewTimer = 0;
  var activePath = '';

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
    var path = row.getAttribute('data-preview');
    rows.forEach(function (item) { item.classList.toggle('is-previewing', item === row); });
    title.textContent = row.getAttribute('data-title') || row.textContent.trim();
    type.textContent = row.getAttribute('data-type') || 'Working prototype';
    link.href = row.href;
    idle.hidden = true;
    if (path === activePath) return;
    activePath = path;
    frame.classList.remove('is-loaded');
    loading.hidden = false;
    frame.src = path;
  }

  if (frame) {
    frame.addEventListener('load', function () {
      loading.hidden = true;
      frame.classList.add('is-loaded');
    });
  }

  rows.forEach(function (row) {
    function schedule() {
      clearTimeout(previewTimer);
      previewTimer = setTimeout(function () { select(row); }, 100);
    }
    row.addEventListener('pointerenter', schedule);
    row.addEventListener('focus', schedule);
  });

  if ('IntersectionObserver' in window) {
    var frameObserver = new IntersectionObserver(function (entries) {
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
