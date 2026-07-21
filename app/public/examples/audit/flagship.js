(function () {
  'use strict';

  function init() {
    var canvas = document.getElementById('auditInstrument');
    var viewport = canvas && canvas.parentElement;
    var scan = document.querySelector('.audit-scan');
    var status = scan && scan.querySelector('.audit-scan__status');
    var domainLabel = document.querySelector('[data-instrument-domain]');
    var stageLabel = document.querySelector('[data-instrument-stage]');
    var urlInput = document.getElementById('siteUrl');
    var progressSection = document.getElementById('progressSection');
    var progressBar = document.getElementById('progressBar');
    var steps = Array.prototype.slice.call(document.querySelectorAll('.progress-step'));
    if (!canvas || !viewport || !scan) return;

    var context = canvas.getContext('2d');
    if (!context) return;

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var visible = true;
    var width = 0;
    var height = 0;
    var pixelRatio = 1;
    var frame = 0;
    var seed = 41;
    var lastTime = 0;
    var elapsed = 0;
    var points = [];
    var labels = ['PERF', 'MOBILE', 'SEARCH', 'PATH'];

    function hash(value) {
      var result = 2166136261;
      for (var i = 0; i < value.length; i += 1) {
        result ^= value.charCodeAt(i);
        result = Math.imul(result, 16777619);
      }
      return result >>> 0;
    }

    function random(index) {
      var value = Math.sin(seed * 0.0001 + index * 12.9898) * 43758.5453;
      return value - Math.floor(value);
    }

    function rebuildPoints() {
      points = [];
      for (var i = 0; i < 18; i += 1) {
        points.push({
          x: 0.08 + random(i * 3) * 0.84,
          y: 0.08 + random(i * 3 + 1) * 0.84,
          size: 0.8 + random(i * 3 + 2) * 1.8,
          phase: random(i * 7 + 2) * Math.PI * 2
        });
      }
    }

    function resize() {
      var rect = viewport.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      draw();
    }

    function line(a, b, alpha) {
      context.beginPath();
      context.moveTo(a.x, a.y);
      context.lineTo(b.x, b.y);
      context.strokeStyle = 'rgba(112, 165, 255,' + alpha + ')';
      context.lineWidth = 0.8;
      context.stroke();
    }

    function draw() {
      context.clearRect(0, 0, width, height);
      var cx = width / 2;
      var cy = height / 2;
      var radius = Math.min(width, height) * 0.33;
      var pulse = reduceMotion ? 0.5 : 0.5 + Math.sin(elapsed * 0.0014) * 0.5;

      for (var ring = 1; ring <= 3; ring += 1) {
        context.beginPath();
        context.arc(cx, cy, radius * ring / 3, 0, Math.PI * 2);
        context.strokeStyle = 'rgba(240, 242, 248,' + (0.035 + ring * 0.018) + ')';
        context.lineWidth = 1;
        context.stroke();
      }

      context.beginPath();
      context.moveTo(cx - radius * 1.25, cy);
      context.lineTo(cx + radius * 1.25, cy);
      context.moveTo(cx, cy - radius * 1.25);
      context.lineTo(cx, cy + radius * 1.25);
      context.strokeStyle = 'rgba(240, 242, 248,0.055)';
      context.stroke();

      var mapped = points.map(function (point) {
        return {
          x: point.x * width,
          y: point.y * height,
          size: point.size,
          phase: point.phase
        };
      });

      for (var i = 0; i < mapped.length; i += 1) {
        for (var j = i + 1; j < mapped.length; j += 1) {
          var dx = mapped[i].x - mapped[j].x;
          var dy = mapped[i].y - mapped[j].y;
          var distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < Math.min(width, height) * 0.25) {
            line(mapped[i], mapped[j], Math.max(0.018, 0.11 - distance / 1800));
          }
        }
      }

      mapped.forEach(function (point) {
        var shimmer = reduceMotion ? 0.55 : 0.46 + Math.sin(elapsed * 0.0018 + point.phase) * 0.2;
        context.beginPath();
        context.arc(point.x, point.y, point.size + pulse * 0.4, 0, Math.PI * 2);
        context.fillStyle = 'rgba(112, 165, 255,' + shimmer + ')';
        context.fill();
      });

      for (var axis = 0; axis < 4; axis += 1) {
        var angle = -Math.PI / 2 + axis * Math.PI / 2;
        var x = cx + Math.cos(angle) * radius * 1.08;
        var y = cy + Math.sin(angle) * radius * 1.08;
        context.fillStyle = axis === activeStage() ? '#f97316' : 'rgba(240, 242, 248,0.45)';
        context.font = '600 9px "JetBrains Mono", monospace';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(labels[axis], x, y);
      }

      var sweepAngle = reduceMotion ? -0.4 : elapsed * 0.00034;
      context.beginPath();
      context.moveTo(cx, cy);
      context.lineTo(cx + Math.cos(sweepAngle) * radius, cy + Math.sin(sweepAngle) * radius);
      context.strokeStyle = 'rgba(249, 115, 22,' + (0.38 + pulse * 0.32) + ')';
      context.lineWidth = 1;
      context.stroke();
    }

    function activeStage() {
      var index = steps.findIndex(function (step) { return step.classList.contains('active'); });
      if (index < 0) return -1;
      return Math.min(3, Math.max(0, index - 1));
    }

    function animate(time) {
      if (!visible || document.hidden) {
        frame = 0;
        return;
      }
      var delta = Math.min(40, time - lastTime || 16);
      lastTime = time;
      elapsed += delta;
      draw();
      frame = requestAnimationFrame(animate);
    }

    function start() {
      if (reduceMotion || frame || !visible || document.hidden) {
        draw();
        return;
      }
      lastTime = performance.now();
      frame = requestAnimationFrame(animate);
    }

    function stop() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    }

    function normalizeDomain(value) {
      return value.trim().replace(/^https?:\/\//, '').replace(/\/.*/, '');
    }

    function updateDomain() {
      var domain = normalizeDomain(urlInput ? urlInput.value : '');
      seed = hash(domain || 'little-fight-audit');
      rebuildPoints();
      domainLabel.textContent = domain || 'Awaiting URL';
      draw();
    }

    function updateState() {
      var scanning = progressSection && !progressSection.classList.contains('hidden');
      var current = steps.find(function (step) { return step.classList.contains('active'); });
      scan.setAttribute('data-scanning', String(scanning));
      status.textContent = scanning ? 'Scanning' : 'Ready';
      if (scanning) {
        var label = current ? current.textContent.replace(/\s+/g, ' ').trim().replace(/\.{3}|…/g, '') : 'Reading public page';
        stageLabel.textContent = label;
      } else {
        stageLabel.textContent = 'Signal map';
      }
      if (progressBar && scanning) {
        scan.style.setProperty('--audit-progress', progressBar.value + '%');
      }
      draw();
    }

    if (urlInput) urlInput.addEventListener('input', updateDomain);

    var observer = new MutationObserver(updateState);
    if (progressSection) observer.observe(progressSection, { attributes: true, attributeFilter: ['class'] });
    steps.forEach(function (step) { observer.observe(step, { attributes: true, attributeFilter: ['class'] }); });
    if (progressBar) observer.observe(progressBar, { attributes: true, attributeFilter: ['value'] });

    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(viewport);
    else window.addEventListener('resize', resize, { passive: true });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) start();
        else stop();
      }, { threshold: 0.02 }).observe(viewport);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else start();
    });

    rebuildPoints();
    resize();
    updateDomain();
    updateState();
    start();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
