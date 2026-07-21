(function () {
  'use strict';

  var concepts = [
    { slug: 'pill-scroll', title: 'Scroll Into Motion', type: 'Motion study' },
    { slug: 'micro-animations', title: 'Micro-Animations', type: 'Interaction study' },
    { slug: 'terminal-3d', title: 'Cinematic 3D', type: 'Spatial website' },
    { slug: 'walkup-3d', title: 'Brownstone Walk-Up', type: 'Featured spatial story' },
    { slug: 'studio-engine', title: 'Studio Engine', type: 'Interactive design system' },
    { slug: 'hero', title: 'Hero Prototype', type: 'Brand study' },
    { slug: 'tech-support', title: 'Tech Support Site', type: 'Full website concept' },
    { slug: 'goliath', title: 'Goliath', type: 'Brand campaign' },
    { slug: 'growth-street', title: 'Growth Street', type: 'Generative storefront study' },
    { slug: 'chef-drew', title: 'I Am Cooking', type: 'Client concept' },
    { slug: 'aha-laser', title: 'AHA Laser Poster', type: 'Client concept' }
  ];

  function currentConcept() {
    var match = location.pathname.match(/\/examples\/lab\/concepts\/([^/]+)/);
    if (!match) return null;
    var index = concepts.findIndex(function (item) { return item.slug === match[1]; });
    return index < 0 ? null : { index: index, item: concepts[index] };
  }

  function addStylesheet() {
    if (document.querySelector('link[data-lab-concept-shell]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/examples/lab/assets/concept-shell.css';
    link.setAttribute('data-lab-concept-shell', '');
    document.head.appendChild(link);
  }

  function addFonts() {
    if (document.querySelector('link[data-lab-fonts]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Barlow:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap';
    link.setAttribute('data-lab-fonts', '');
    document.head.appendChild(link);
  }

  function addFavicon() {
    if (document.querySelector('link[rel~="icon"]')) return;
    var icon = document.createElement('link');
    icon.rel = 'icon';
    icon.href = '/examples/lab/assets/favicon.svg';
    icon.type = 'image/svg+xml';
    document.head.appendChild(icon);
  }

  function route(slug) {
    return '/examples/lab/concepts/' + slug + '/';
  }

  function makeLink(className, label, href, ariaLabel) {
    var link = document.createElement('a');
    link.className = className;
    link.href = href;
    link.textContent = label;
    if (ariaLabel) link.setAttribute('aria-label', ariaLabel);
    return link;
  }

  function showShortcut(message) {
    var note = document.querySelector('.lab-concept-shell__shortcut');
    if (!note) return;
    note.textContent = message;
    note.classList.add('is-visible');
    clearTimeout(note._labTimer);
    note._labTimer = setTimeout(function () {
      note.classList.remove('is-visible');
    }, 1400);
  }

  function init() {
    var current = currentConcept();
    if (!current || document.querySelector('.lab-concept-shell')) return;

    addStylesheet();
    addFonts();
    addFavicon();
    document.documentElement.classList.add('lab-concept-page');
    document.documentElement.setAttribute('data-lab-concept', current.item.slug);

    function setActive(active) {
      document.documentElement.toggleAttribute('data-lab-inactive', !active);
      document.dispatchEvent(new CustomEvent('lab:visibility', { detail: { active: active } }));
    }

    function setViewportHeight() {
      document.documentElement.style.setProperty('--lab-viewport-height', window.innerHeight + 'px');
    }

    setViewportHeight();
    window.addEventListener('resize', setViewportHeight, { passive: true });
    window.addEventListener('message', function (event) {
      if (event.origin !== location.origin || !event.data || event.data.type !== 'lab:visibility') return;
      setActive(event.data.active !== false);
    });

    if (new URLSearchParams(location.search).has('embed')) {
      document.documentElement.classList.add('lab-concept-embed');
      return;
    }

    var shell = document.createElement('aside');
    shell.className = 'lab-concept-shell';
    shell.setAttribute('aria-label', 'The Lab concept controls');

    var identity = document.createElement('div');
    identity.className = 'lab-concept-shell__identity';
    var back = makeLink('lab-concept-shell__back', 'THE LAB', '/examples/lab/', 'Back to all Lab concepts');
    var rule = document.createElement('span');
    rule.className = 'lab-concept-shell__rule';
    rule.setAttribute('aria-hidden', 'true');
    var copy = document.createElement('div');
    copy.className = 'lab-concept-shell__copy';
    var title = document.createElement('p');
    title.className = 'lab-concept-shell__title';
    title.textContent = current.item.title;
    var type = document.createElement('p');
    type.className = 'lab-concept-shell__type';
    type.textContent = current.item.type;
    copy.append(title, type);
    identity.append(back, rule, copy);

    var actions = document.createElement('div');
    actions.className = 'lab-concept-shell__actions';

    var previous = makeLink(
      'lab-concept-shell__nav',
      '‹',
      current.index > 0 ? route(concepts[current.index - 1].slug) : '/examples/lab/',
      current.index > 0 ? 'Previous concept: ' + concepts[current.index - 1].title : 'Back to The Lab'
    );
    var next = makeLink(
      'lab-concept-shell__nav',
      '›',
      current.index < concepts.length - 1 ? route(concepts[current.index + 1].slug) : '/examples/lab/',
      current.index < concepts.length - 1 ? 'Next concept: ' + concepts[current.index + 1].title : 'Back to The Lab'
    );

    var motion = document.createElement('button');
    motion.type = 'button';
    motion.className = 'lab-concept-shell__button lab-concept-shell__button--motion';
    motion.textContent = 'Pause motion';
    motion.setAttribute('aria-pressed', 'false');
    motion.addEventListener('click', function () {
      var paused = document.documentElement.getAttribute('data-lab-motion') === 'paused';
      if (paused) document.documentElement.removeAttribute('data-lab-motion');
      else document.documentElement.setAttribute('data-lab-motion', 'paused');
      motion.setAttribute('aria-pressed', String(!paused));
      motion.textContent = paused ? 'Pause motion' : 'Resume motion';
      document.dispatchEvent(new CustomEvent('lab:motion', { detail: { paused: !paused } }));
      showShortcut(paused ? 'Motion resumed' : 'Motion paused');
    });

    var fullscreen = document.createElement('button');
    fullscreen.type = 'button';
    fullscreen.className = 'lab-concept-shell__button lab-concept-shell__button--fullscreen lab-concept-shell__open';
    fullscreen.textContent = 'Full screen';
    fullscreen.addEventListener('click', function () {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(function () {});
      } else if (document.exitFullscreen) {
        document.exitFullscreen().catch(function () {});
      }
    });
    document.addEventListener('fullscreenchange', function () {
      fullscreen.textContent = document.fullscreenElement ? 'Exit' : 'Full screen';
      document.documentElement.toggleAttribute('data-lab-shell', !!document.fullscreenElement);
      if (document.fullscreenElement) document.documentElement.setAttribute('data-lab-shell', 'hidden');
      else document.documentElement.removeAttribute('data-lab-shell');
    });

    actions.append(previous, next, motion, fullscreen);
    shell.append(identity, actions);

    var shortcut = document.createElement('div');
    shortcut.className = 'lab-concept-shell__shortcut';
    shortcut.setAttribute('role', 'status');
    shortcut.setAttribute('aria-live', 'polite');

    document.body.append(shell, shortcut);

    document.addEventListener('keydown', function (event) {
      if (event.metaKey || event.ctrlKey || event.altKey || event.target.matches('input, textarea, select, [contenteditable="true"]')) return;
      if (event.key === '[') location.href = previous.href;
      if (event.key === ']') location.href = next.href;
      if (event.key.toLowerCase() === 'm') motion.click();
      if (event.key === 'Escape' && document.documentElement.getAttribute('data-lab-shell') === 'hidden') {
        document.documentElement.removeAttribute('data-lab-shell');
      }
    });

    document.addEventListener('visibilitychange', function () {
      setActive(document.visibilityState === 'visible');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
