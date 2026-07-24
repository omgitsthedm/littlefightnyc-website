(function () {
  'use strict';

  var concepts = [
    {
      slug: 'walkup-3d',
      href: '/examples/lab/concepts/walkup-3d/',
      title: 'Brownstone Walk-Up',
      type: 'Spatial story',
      suite: 'spatial-nyc',
      suiteTitle: 'Spatial NYC',
      hint: 'Scroll the floors. Open Inspect to drag, pinch, and tap the windows.'
    },
    {
      slug: 'terminal-3d',
      href: '/examples/lab/concepts/terminal-3d/',
      title: 'Cinematic 3D',
      type: 'Spatial website',
      suite: 'spatial-nyc',
      suiteTitle: 'Spatial NYC',
      hint: 'Scroll through the city-scale story, then drag the live model where it appears.'
    },
    {
      slug: 'pill-scroll',
      href: '/examples/lab/concepts/pill-scroll/',
      title: 'Scroll Into Motion',
      type: 'Motion study',
      suite: 'motion-playground',
      suiteTitle: 'Motion Playground',
      hint: 'Swipe or scroll slowly. The same object keeps changing jobs.'
    },
    {
      slug: 'micro-animations',
      href: '/examples/lab/concepts/micro-animations/',
      title: 'Micro-Animations',
      type: 'Interaction study',
      suite: 'motion-playground',
      suiteTitle: 'Motion Playground',
      hint: 'Tap a category, then tap a card to replay its tiny working moment.'
    },
    {
      slug: 'aha-laser',
      href: '/examples/lab/concepts/aha-laser/',
      title: 'AHA Laser Poster',
      type: 'Client motion concept',
      suite: 'motion-playground',
      suiteTitle: 'Motion Playground',
      hint: 'Turn the device sideways for the full poster, then tap Replay.'
    },
    {
      slug: 'studio-engine',
      href: '/examples/lab/concepts/studio-engine/',
      title: 'Studio Engine',
      type: 'Interactive design system',
      suite: 'business-systems',
      suiteTitle: 'Systems Lab',
      hint: 'Load the demo, change the signal, then switch the preview device.'
    },
    {
      slug: 'growth-street',
      href: '/examples/lab/concepts/growth-street/',
      title: 'Growth Street',
      type: 'Systems study',
      suite: 'business-systems',
      suiteTitle: 'Systems Lab',
      hint: 'Tap a signal to run it through the block. Replay connects every storefront.'
    },
    {
      slug: 'tech-support',
      href: '/examples/lab/concepts/tech-support/',
      title: 'Tech Support Site',
      type: 'Full website',
      suite: 'business-systems',
      suiteTitle: 'Systems Lab',
      hint: 'Tour an earlier complete site, then compare how the system evolved.'
    },
    {
      slug: 'goliath',
      href: '/examples/lab/concepts/goliath/',
      title: 'Goliath',
      type: 'Brand campaign',
      suite: 'brand-campaign',
      suiteTitle: 'Campaign Studio',
      hint: 'Scroll the campaign like a stack of street posters.'
    },
    {
      slug: 'hero',
      href: '/examples/lab/concepts/hero/',
      title: 'Hero Prototype',
      type: 'Brand study',
      suite: 'brand-campaign',
      suiteTitle: 'Campaign Studio',
      hint: 'Move or drag through the signal field. Tap to send a new pulse.'
    },
    {
      slug: 'chef-drew',
      href: '/examples/lab/concepts/chef-drew/',
      title: 'I Am Cooking',
      type: 'Client concept',
      suite: 'brand-campaign',
      suiteTitle: 'Campaign Studio',
      hint: 'Swipe the menu, open the mobile nav, and follow the booking path.'
    }
  ];

  function currentConcept() {
    var match = location.pathname.match(/\/examples\/lab\/concepts\/([^/]+)/);
    if (!match) return null;
    var index = concepts.findIndex(function (item) {
      return item.slug === match[1];
    });
    if (index < 0) return null;
    var item = concepts[index];
    var siblings = concepts.filter(function (concept) {
      return concept.suite === item.suite;
    });
    var suiteIndex = siblings.findIndex(function (concept) {
      return concept.slug === item.slug;
    });
    return {
      index: index,
      item: item,
      siblings: siblings,
      suiteIndex: suiteIndex
    };
  }

  function suiteRoute(item) {
    return '/examples/lab/suites/' + item.suite + '/?concept=' + encodeURIComponent(item.slug);
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
    link.href = '/assets/lf-fonts.css';
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

  function makeLink(className, label, href, ariaLabel) {
    var link = document.createElement('a');
    link.className = className;
    link.href = href;
    link.textContent = label;
    if (ariaLabel) link.setAttribute('aria-label', ariaLabel);
    return link;
  }

  function makeButton(className, label) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = label;
    return button;
  }

  function showShortcut(message, duration) {
    var note = document.querySelector('.lab-concept-shell__shortcut');
    if (!note) return;
    note.textContent = message;
    note.classList.add('is-visible');
    clearTimeout(note._labTimer);
    note._labTimer = setTimeout(function () {
      note.classList.remove('is-visible');
    }, duration || 2200);
  }

  function tapFeedback() {
    if (navigator.vibrate) navigator.vibrate(8);
  }

  function init() {
    var current = currentConcept();
    if (!current || document.querySelector('.lab-concept-shell')) return;

    addStylesheet();
    addFonts();
    addFavicon();
    document.documentElement.classList.add('lab-concept-page');
    document.documentElement.setAttribute(
      'data-lab-concept',
      current.item.slug
    );
    document.documentElement.setAttribute('data-lab-suite', current.item.suite);
    document.documentElement.setAttribute('data-lab-index', String(current.suiteIndex + 1));
    document.documentElement.setAttribute('data-lab-total', String(current.siblings.length));

    var activityState = null;
    function setActive(active) {
      active = active !== false;
      if (activityState === active) return;
      activityState = active;
      document.documentElement.toggleAttribute('data-lab-inactive', !active);
      document.dispatchEvent(new CustomEvent('lab:visibility', { detail: { active: active } }));
    }

    function setViewportHeight() {
      var height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      document.documentElement.style.setProperty('--lab-viewport-height', height + 'px');
    }

    setViewportHeight();
    window.addEventListener('resize', setViewportHeight, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', setViewportHeight, { passive: true });
    }
    window.addEventListener('message', function (event) {
      if (event.origin !== location.origin || !event.data) return;
      if (event.data.type === 'lab:visibility') {
        setActive(event.data.active !== false);
      }
      if (event.data.type === 'lab:motion') {
        var paused = event.data.paused === true;
        document.documentElement.toggleAttribute('data-lab-motion', paused);
        if (paused) document.documentElement.setAttribute('data-lab-motion', 'paused');
        document.dispatchEvent(new CustomEvent('lab:motion', { detail: { paused: paused } }));
      }
    });
    window.addEventListener('pagehide', function () {
      setActive(false);
    });

    if (window.self !== window.top || new URLSearchParams(location.search).has('embed')) {
      document.documentElement.classList.add('lab-concept-embed');
      return;
    }

    var shell = document.createElement('aside');
    shell.className = 'lab-concept-shell';
    shell.setAttribute('aria-label', 'The Lab concept controls');

    var identity = document.createElement('div');
    identity.className = 'lab-concept-shell__identity';
    var back = makeLink(
      'lab-concept-shell__back',
      current.item.suiteTitle.toUpperCase(),
      suiteRoute(current.item),
      'Back to ' + current.item.suiteTitle
    );
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

    var previousItem = current.siblings[
      (current.suiteIndex - 1 + current.siblings.length) % current.siblings.length
    ];
    var nextItem = current.siblings[
      (current.suiteIndex + 1) % current.siblings.length
    ];
    var previous = makeLink(
      'lab-concept-shell__nav',
      '‹',
      previousItem.href,
      'Previous in ' + current.item.suiteTitle + ': ' + previousItem.title
    );
    var next = makeLink(
      'lab-concept-shell__nav',
      '›',
      nextItem.href,
      'Next in ' + current.item.suiteTitle + ': ' + nextItem.title
    );
    previous.setAttribute('data-lab-control', 'previous');
    next.setAttribute('data-lab-control', 'next');

    var menu = makeButton('lab-concept-shell__menu', '•••');
    menu.setAttribute('aria-label', 'Open demo controls');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-controls', 'lab-demo-controls');

    actions.append(previous, next, menu);
    shell.append(identity, actions);

    var panel = document.createElement('section');
    panel.id = 'lab-demo-controls';
    panel.className = 'lab-concept-panel';
    panel.hidden = true;
    panel.setAttribute('aria-label', 'Demo controls');

    var panelHead = document.createElement('div');
    panelHead.className = 'lab-concept-panel__head';
    var panelCopy = document.createElement('div');
    var panelLabel = document.createElement('p');
    panelLabel.className = 'lab-concept-panel__label';
    panelLabel.textContent = 'TRY IT LIKE THIS';
    var panelHint = document.createElement('p');
    panelHint.className = 'lab-concept-panel__hint';
    panelHint.textContent = current.item.hint;
    panelCopy.append(panelLabel, panelHint);
    var close = makeButton('lab-concept-panel__close', 'Close');
    close.setAttribute('aria-label', 'Close demo controls');
    panelHead.append(panelCopy, close);

    var panelActions = document.createElement('div');
    panelActions.className = 'lab-concept-panel__actions';

    var restart = makeButton('lab-concept-panel__button', 'Replay');
    restart.addEventListener('click', function () {
      tapFeedback();
      var replayEvent = new CustomEvent('lab:replay', { cancelable: true });
      var shouldFallback = document.dispatchEvent(replayEvent);
      var trigger = document.querySelector(
        '[data-replay], #replayBtn, .replay-btn, [aria-label*="Replay"], [aria-label*="replay"]'
      );
      if (trigger && trigger !== restart && typeof trigger.click === 'function') {
        trigger.click();
      } else if (shouldFallback) {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
      showShortcut('Replay started');
    });

    var motion = makeButton('lab-concept-panel__button', 'Pause motion');
    motion.setAttribute('aria-pressed', 'false');
    motion.addEventListener('click', function () {
      tapFeedback();
      var paused = document.documentElement.getAttribute('data-lab-motion') === 'paused';
      if (paused) document.documentElement.removeAttribute('data-lab-motion');
      else document.documentElement.setAttribute('data-lab-motion', 'paused');
      motion.setAttribute('aria-pressed', String(!paused));
      motion.textContent = paused ? 'Pause motion' : 'Resume motion';
      document.dispatchEvent(new CustomEvent('lab:motion', { detail: { paused: !paused } }));
      showShortcut(paused ? 'Motion resumed' : 'Motion paused');
    });

    var share = makeButton('lab-concept-panel__button', 'Share');
    share.addEventListener('click', function () {
      tapFeedback();
      var shareData = { title: document.title, url: location.href };
      if (navigator.share) {
        navigator.share(shareData).catch(function () {});
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(location.href).then(function () {
          showShortcut('Link copied');
        }).catch(function () {
          showShortcut('Copy the link from the address bar');
        });
      } else {
        showShortcut('Copy the link from the address bar');
      }
    });

    panelActions.append(restart, motion, share);

    var fullscreen = makeButton('lab-concept-panel__button lab-concept-panel__button--signal', 'Full screen');
    if (document.documentElement.requestFullscreen) {
      fullscreen.addEventListener('click', function () {
        tapFeedback();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(function () {});
        } else if (document.exitFullscreen) {
          document.exitFullscreen().catch(function () {});
        }
      });
      panelActions.append(fullscreen);
      document.addEventListener('fullscreenchange', function () {
        fullscreen.textContent = document.fullscreenElement ? 'Exit full screen' : 'Full screen';
      });
    }

    panel.append(panelHead, panelActions);

    var shortcut = document.createElement('div');
    shortcut.className = 'lab-concept-shell__shortcut';
    shortcut.setAttribute('role', 'status');
    shortcut.setAttribute('aria-live', 'polite');

    function setPanel(open) {
      panel.hidden = !open;
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Close demo controls' : 'Open demo controls');
      if (open) close.focus({ preventScroll: true });
    }

    menu.addEventListener('click', function () {
      tapFeedback();
      setPanel(panel.hidden);
    });
    close.addEventListener('click', function () {
      setPanel(false);
      menu.focus({ preventScroll: true });
    });

    // Some preserved concepts transform their <body>, which turns fixed
    // descendants into page-positioned elements. Mount the Lab chrome beside
    // the body so it stays pinned to the actual device viewport.
    document.documentElement.append(shell, panel, shortcut);

    window.setTimeout(function () {
      showShortcut(current.item.hint, 3600);
    }, 900);

    document.addEventListener('keydown', function (event) {
      var target = event.target;
      var editable = target instanceof Element &&
        target.matches('input, textarea, select, [contenteditable="true"]');
      if (event.metaKey || event.ctrlKey || event.altKey || editable) return;
      if (event.key === '[') location.href = previous.href;
      if (event.key === ']') location.href = next.href;
      if (event.key.toLowerCase() === 'm') motion.click();
      if (event.key.toLowerCase() === 'r') restart.click();
      if (event.key === 'Escape' && !panel.hidden) {
        setPanel(false);
        menu.focus({ preventScroll: true });
      }
    });

    document.addEventListener('pointerdown', function (event) {
      if (panel.hidden || panel.contains(event.target) || shell.contains(event.target)) return;
      setPanel(false);
    }, { passive: true });

    document.addEventListener('visibilitychange', function () {
      setActive(document.visibilityState === 'visible');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
