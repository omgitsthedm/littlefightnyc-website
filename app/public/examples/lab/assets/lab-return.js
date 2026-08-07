(function () {
  'use strict';

  var concepts = [
    {
      slug: 'walkup-3d',
      title: 'Six-Story Walk-Up',
      type: 'Capability build',
      suite: 'spatial-nyc',
      hint: 'Drag to spin the block. Pinch to lean in.'
    },
    {
      slug: 'terminal-3d',
      title: 'Neon District',
      type: 'Capability build',
      suite: 'spatial-nyc',
      hint: 'Tap a beacon to fly in. Drag to orbit the block.'
    },
    {
      slug: 'pill-scroll',
      title: 'Scroll Into Motion',
      type: 'Motion study',
      suite: 'motion-playground',
      hint: 'Scroll slow — the pill blooms into a film. Drag back to rewind.'
    },
    {
      slug: 'micro-animations',
      title: 'Micro-Animations',
      type: 'Interaction arcade',
      suite: 'motion-playground',
      hint: 'Follow the coach — press, throw, hold, undo. Feel it answer.'
    },
    {
      slug: 'aha-laser',
      title: 'AHA Laser Poster',
      type: 'Responsive poster',
      suite: 'motion-playground',
      hint: 'Watch the laser draw the brand — then pull the chain.'
    },
    {
      slug: 'studio-engine',
      title: 'Studio Engine',
      type: 'Interactive business tool',
      suite: 'business-systems',
      hint: 'Tap a business — watch it build. Then change the vibe.'
    },
    {
      slug: 'growth-street',
      title: 'Growth Street',
      type: 'Systems story',
      suite: 'business-systems',
      hint: 'Scroll the five chapters — every number is drawn, not charted.'
    },
    {
      slug: 'goliath',
      title: 'Goliath',
      type: 'Brand campaign',
      suite: 'brand-campaign',
      hint: 'Scroll to paste the posters up. Scroll back to peel them off.'
    },
    {
      slug: 'pool-room',
      title: 'The Pool Room',
      type: 'Cinema build',
      suite: 'cinema',
      hint: 'Scroll the fifteen frames — one room, built to the millimeter.'
    }
  ];

  function currentConcept() {
    var match = location.pathname.match(/\/examples\/lab\/concepts\/([^/]+)/);
    if (!match) return null;
    var item = concepts.find(function (concept) {
      return concept.slug === match[1];
    });
    if (!item) return null;
    // Tour order spans every build so prev/next never dead-ends in a small suite.
    return {
      item: item,
      siblings: concepts,
      index: concepts.indexOf(item)
    };
  }

  function route(item) {
    return '/examples/lab/concepts/' + item.slug + '/';
  }

  function addAsset(tag, attributes) {
    var element = document.createElement(tag);
    Object.keys(attributes).forEach(function (key) {
      element.setAttribute(key, attributes[key]);
    });
    document.head.appendChild(element);
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

  function init() {
    var current = currentConcept();
    if (!current || document.querySelector('.lab-concept-shell')) return;

    if (!document.querySelector('link[data-lab-concept-shell]')) {
      addAsset('link', {
        rel: 'stylesheet',
        href: '/examples/lab/assets/concept-shell.css',
        'data-lab-concept-shell': ''
      });
    }
    if (!document.querySelector('link[data-lab-fonts]')) {
      addAsset('link', {
        rel: 'stylesheet',
        href: '/assets/lf-fonts.css',
        'data-lab-fonts': ''
      });
    }

    document.documentElement.classList.add('lab-concept-page');
    document.documentElement.setAttribute('data-lab-concept', current.item.slug);

    if (window.self !== window.top || new URLSearchParams(location.search).has('embed')) {
      document.documentElement.classList.add('lab-concept-embed');
      return;
    }

    var previousItem = current.siblings[
      (current.index - 1 + current.siblings.length) % current.siblings.length
    ];
    var nextItem = current.siblings[
      (current.index + 1) % current.siblings.length
    ];

    var shell = document.createElement('aside');
    shell.className = 'lab-concept-shell';
    shell.setAttribute('aria-label', 'The Lab controls');

    var back = makeLink(
      'lab-concept-shell__back',
      'THE LAB',
      '/examples/lab/#showroom',
      'Back to The Lab'
    );

    var identity = document.createElement('div');
    identity.className = 'lab-concept-shell__identity';
    var title = document.createElement('strong');
    title.textContent = current.item.title;
    var type = document.createElement('span');
    type.textContent = current.item.type + ' · ' +
      (current.index + 1) + ' of ' + current.siblings.length;
    identity.append(title, type);

    var actions = document.createElement('div');
    actions.className = 'lab-concept-shell__actions';
    var build = makeLink(
      'lab-concept-shell__build',
      'Build yours',
      '/tech-audit/?source=lab_' + encodeURIComponent(current.item.slug),
      'Talk to Little Fight NYC about building something like ' + current.item.title
    );
    var replay = makeButton('lab-concept-shell__replay', 'Replay');
    var previous = makeLink(
      'lab-concept-shell__nav',
      '‹',
      route(previousItem),
      'Previous build: ' + previousItem.title
    );
    var next = makeLink(
      'lab-concept-shell__nav',
      '›',
      route(nextItem),
      'Next build: ' + nextItem.title
    );
    actions.append(build, replay, previous, next);
    shell.append(back, identity, actions);

    var hint = document.createElement('p');
    hint.className = 'lab-concept-hint';
    hint.setAttribute('role', 'status');
    hint.setAttribute('aria-live', 'polite');
    hint.textContent = current.item.hint;

    replay.addEventListener('click', function () {
      var replayEvent = new CustomEvent('lab:replay', { cancelable: true });
      var shouldFallback = document.dispatchEvent(replayEvent);
      var trigger = document.querySelector(
        '[data-replay], #replayBtn, .replay-btn, [aria-label*="Replay"], [aria-label*="replay"]'
      );
      if (trigger && trigger !== replay && typeof trigger.click === 'function') {
        trigger.click();
      } else if (shouldFallback) {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
      hint.textContent = 'Replay started.';
      hint.classList.add('is-visible');
      window.setTimeout(function () {
        hint.classList.remove('is-visible');
        hint.textContent = current.item.hint;
      }, 1800);
    });

    document.documentElement.append(shell, hint);

    window.setTimeout(function () {
      hint.classList.add('is-visible');
    }, 600);
    window.setTimeout(function () {
      hint.classList.remove('is-visible');
    }, 4200);

    document.addEventListener('keydown', function (event) {
      var target = event.target;
      var editable = target instanceof Element &&
        target.matches('input, textarea, select, [contenteditable="true"]');
      if (event.metaKey || event.ctrlKey || event.altKey || editable) return;
      if (event.key === '[') location.href = previous.href;
      if (event.key === ']') location.href = next.href;
      if (event.key.toLowerCase() === 'r') replay.click();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
