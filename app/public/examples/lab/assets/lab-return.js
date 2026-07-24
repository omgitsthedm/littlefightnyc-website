(function () {
  'use strict';

  var concepts = [
    {
      slug: 'walkup-3d',
      title: 'Brownstone Walk-Up',
      type: 'Spatial story',
      suite: 'spatial-nyc',
      hint: 'Scroll the floors. Choose Explore, then tap the windows.'
    },
    {
      slug: 'terminal-3d',
      title: 'Cinematic 3D',
      type: 'Spatial website',
      suite: 'spatial-nyc',
      hint: 'Scroll through the story. Drag the model when it appears.'
    },
    {
      slug: 'pill-scroll',
      title: 'Scroll Into Motion',
      type: 'Motion study',
      suite: 'motion-playground',
      hint: 'Swipe or scroll slowly. The same object keeps changing jobs.'
    },
    {
      slug: 'micro-animations',
      title: 'Micro-Animations',
      type: 'Interaction arcade',
      suite: 'motion-playground',
      hint: 'Tap a category, then tap any study to replay it.'
    },
    {
      slug: 'aha-laser',
      title: 'AHA Laser Poster',
      type: 'Responsive poster',
      suite: 'motion-playground',
      hint: 'Turn the device sideways for the full poster, then tap Replay.'
    },
    {
      slug: 'studio-engine',
      title: 'Studio Engine',
      type: 'Interactive business tool',
      suite: 'business-systems',
      hint: 'Load the sample, change a business signal, then watch the scene react.'
    },
    {
      slug: 'growth-street',
      title: 'Growth Street',
      type: 'Systems story',
      suite: 'business-systems',
      hint: 'Tap a signal to run it through the block. Replay connects every storefront.'
    },
    {
      slug: 'tech-support',
      title: 'Tech Support Site',
      type: 'Complete website',
      suite: 'business-systems',
      hint: 'Move through the complete earlier service website.'
    },
    {
      slug: 'goliath',
      title: 'Goliath',
      type: 'Brand campaign',
      suite: 'brand-campaign',
      hint: 'Scroll the campaign like a stack of street posters.'
    },
    {
      slug: 'hero',
      title: 'Hero Prototype',
      type: 'Brand study',
      suite: 'brand-campaign',
      hint: 'Move through the signal field. Tap to send a new pulse.'
    },
    {
      slug: 'chef-drew',
      title: 'I Am Cooking',
      type: 'Hospitality concept',
      suite: 'brand-campaign',
      hint: 'Open the menu and follow the booking path.'
    }
  ];

  function currentConcept() {
    var match = location.pathname.match(/\/examples\/lab\/concepts\/([^/]+)/);
    if (!match) return null;
    var item = concepts.find(function (concept) {
      return concept.slug === match[1];
    });
    if (!item) return null;
    var siblings = concepts.filter(function (concept) {
      return concept.suite === item.suite;
    });
    return {
      item: item,
      siblings: siblings,
      index: siblings.findIndex(function (concept) {
        return concept.slug === item.slug;
      })
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
    type.textContent = current.item.type;
    identity.append(title, type);

    var actions = document.createElement('div');
    actions.className = 'lab-concept-shell__actions';
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
    actions.append(replay, previous, next);
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
