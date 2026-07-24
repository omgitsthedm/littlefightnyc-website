(function () {
  'use strict';

  var root = document.querySelector('[data-suite-root]');
  if (!root) return;

  var suiteSlug = document.documentElement.getAttribute('data-suite');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var compactQuery = window.matchMedia('(max-width: 767px)');
  var manifestUrl = '/examples/lab/concepts.json';
  var loadTimer = 0;
  var state = {
    concept: '',
    view: compactQuery.matches ? 'auto' : 'desktop',
    paused: false,
    documentVisible: document.visibilityState === 'visible',
    stageVisible: true
  };

  var elements = {
    suiteNavigation: document.querySelector('[data-suite-navigation]'),
    conceptNavigation: document.querySelector('[data-concept-navigation]'),
    frame: document.querySelector('[data-suite-frame]'),
    frameShell: document.querySelector('[data-frame-shell]'),
    stage: document.querySelector('[data-suite-stage]'),
    loading: document.querySelector('[data-suite-loading]'),
    conceptType: document.querySelector('[data-concept-type]'),
    conceptTitle: document.querySelector('[data-concept-title]'),
    conceptDescription: document.querySelector('[data-concept-description]'),
    openLink: document.querySelector('[data-open-concept]'),
    pauseButton: document.querySelector('[data-pause-suite]'),
    fullscreenButton: document.querySelector('[data-fullscreen-suite]'),
    previousButton: document.querySelector('[data-previous-concept]'),
    nextButton: document.querySelector('[data-next-concept]'),
    status: document.querySelector('[data-suite-status]'),
    capabilities: document.querySelector('[data-suite-capabilities]'),
    count: document.querySelector('[data-suite-count]'),
    viewButtons: Array.prototype.slice.call(document.querySelectorAll('[data-suite-view]'))
  };

  function conceptRoute(slug, embed) {
    return '/examples/lab/concepts/' + slug + '/' + (embed ? '?embed=1&suite=' + encodeURIComponent(suiteSlug) : '');
  }

  function suiteRoute(slug) {
    return '/examples/lab/suites/' + slug + '/';
  }

  function isCompact() {
    return compactQuery.matches;
  }

  function setStatus(message) {
    if (!elements.status) return;
    elements.status.textContent = message;
  }

  function postToConcept(message) {
    if (!elements.frame || !elements.frame.contentWindow) return;
    elements.frame.contentWindow.postMessage(message, location.origin);
  }

  function syncConceptActivity() {
    var active = state.documentVisible && state.stageVisible && !state.paused;
    postToConcept({ type: 'lab:visibility', active: active });
    postToConcept({ type: 'lab:motion', paused: !active });
  }

  function updateUrl() {
    var url = new URL(location.href);
    url.searchParams.set('concept', state.concept);
    if (state.view === 'auto') url.searchParams.delete('view');
    else url.searchParams.set('view', state.view);
    history.replaceState(null, '', url.pathname + url.search + url.hash);
  }

  function button(label, className) {
    var item = document.createElement('button');
    item.type = 'button';
    item.className = className;
    item.textContent = label;
    return item;
  }

  function renderSuiteNavigation(manifest) {
    if (!elements.suiteNavigation) return;
    elements.suiteNavigation.replaceChildren();
    manifest.suites.forEach(function (suite) {
      var link = document.createElement('a');
      link.href = suiteRoute(suite.slug);
      link.textContent = suite.shortTitle;
      if (suite.slug === suiteSlug) link.setAttribute('aria-current', 'page');
      elements.suiteNavigation.appendChild(link);
    });
  }

  function renderCapabilities(suite) {
    if (!elements.capabilities) return;
    elements.capabilities.replaceChildren();
    suite.capabilities.forEach(function (capability) {
      var item = document.createElement('li');
      item.textContent = capability;
      elements.capabilities.appendChild(item);
    });
  }

  function renderConceptNavigation(concepts, selectConcept) {
    if (!elements.conceptNavigation) return;
    elements.conceptNavigation.replaceChildren();
    if (elements.stage) {
      elements.stage.id = elements.stage.id || 'suite-preview-panel';
      elements.stage.setAttribute('role', 'tabpanel');
    }
    concepts.forEach(function (concept, index) {
      var item = button(concept.title, 'suite-concept');
      var type = document.createElement('span');
      type.textContent = concept.type;
      item.prepend(type);
      item.id = 'suite-tab-' + concept.slug;
      item.dataset.concept = concept.slug;
      item.setAttribute('role', 'tab');
      item.setAttribute('aria-selected', 'false');
      item.setAttribute('aria-controls', elements.stage.id);
      item.tabIndex = -1;
      item.addEventListener('click', function () {
        selectConcept(concept.slug, true);
      });
      item.addEventListener('keydown', function (event) {
        var nextIndex = null;
        if (event.key === 'ArrowLeft') nextIndex = (index - 1 + concepts.length) % concepts.length;
        if (event.key === 'ArrowRight') nextIndex = (index + 1) % concepts.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = concepts.length - 1;
        if (nextIndex === null) return;
        event.preventDefault();
        event.stopPropagation();
        selectConcept(concepts[nextIndex].slug, false);
        elements.conceptNavigation
          .querySelector('[data-concept="' + concepts[nextIndex].slug + '"]')
          .focus();
      });
      elements.conceptNavigation.appendChild(item);
    });
  }

  function initialize(manifest) {
    var suite = manifest.suites.find(function (item) { return item.slug === suiteSlug; });
    if (!suite) throw new Error('Unknown Lab suite: ' + suiteSlug);

    var concepts = suite.concepts.map(function (slug) {
      return manifest.concepts.find(function (item) { return item.slug === slug; });
    }).filter(Boolean);

    var params = new URLSearchParams(location.search);
    var requestedConcept = params.get('concept');
    var requestedView = params.get('view');
    if (['auto', 'phone', 'tablet', 'desktop'].includes(requestedView)) state.view = requestedView;
    if (!concepts.some(function (item) { return item.slug === requestedConcept; })) {
      requestedConcept = suite.featuredConcept || concepts[0].slug;
    }

    renderSuiteNavigation(manifest);
    renderCapabilities(suite);
    if (elements.count) {
      elements.count.textContent = concepts.length + (concepts.length === 1 ? ' working build' : ' working builds');
    }

    function currentIndex() {
      return Math.max(0, concepts.findIndex(function (item) { return item.slug === state.concept; }));
    }

    function updateNavigationButtons() {
      var index = currentIndex();
      if (elements.previousButton) {
        elements.previousButton.disabled = concepts.length < 2;
        elements.previousButton.setAttribute('aria-label', 'Previous build: ' + concepts[(index - 1 + concepts.length) % concepts.length].title);
      }
      if (elements.nextButton) {
        elements.nextButton.disabled = concepts.length < 2;
        elements.nextButton.setAttribute('aria-label', 'Next build: ' + concepts[(index + 1) % concepts.length].title);
      }
    }

    function selectConcept(slug, focusStage) {
      var concept = concepts.find(function (item) { return item.slug === slug; });
      if (!concept) return;

      state.concept = concept.slug;
      document.documentElement.setAttribute('data-active-concept', concept.slug);
      elements.conceptNavigation.querySelectorAll('[data-concept]').forEach(function (item) {
        var active = item.dataset.concept === concept.slug;
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
        item.classList.toggle('is-active', active);
        if (active && elements.stage) elements.stage.setAttribute('aria-labelledby', item.id);
      });

      if (elements.conceptType) elements.conceptType.textContent = concept.type;
      if (elements.conceptTitle) elements.conceptTitle.textContent = concept.title;
      if (elements.conceptDescription) elements.conceptDescription.textContent = concept.description;
      if (elements.openLink) {
        elements.openLink.href = conceptRoute(concept.slug, false);
        elements.openLink.setAttribute('aria-label', 'Open ' + concept.title + ' as a full page');
      }

      elements.frame.classList.remove('is-ready');
      elements.loading.hidden = false;
      elements.loading.textContent = 'Preparing ' + concept.title;
      elements.frame.title = concept.title + ' live build';
      elements.frame.src = conceptRoute(concept.slug, true);
      clearTimeout(loadTimer);
      loadTimer = setTimeout(function () {
        if (elements.frame.classList.contains('is-ready')) return;
        elements.loading.textContent = 'This preview is taking longer than expected. Open the full build to continue.';
        setStatus('Preview delayed');
      }, 10000);
      setStatus('Loading ' + concept.title);
      updateNavigationButtons();
      updateUrl();

      if (focusStage && !isCompact()) {
        elements.stage.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      }
    }

    renderConceptNavigation(concepts, selectConcept);

    if (elements.previousButton) {
      elements.previousButton.addEventListener('click', function () {
        var index = currentIndex();
        selectConcept(concepts[(index - 1 + concepts.length) % concepts.length].slug, false);
      });
    }
    if (elements.nextButton) {
      elements.nextButton.addEventListener('click', function () {
        var index = currentIndex();
        selectConcept(concepts[(index + 1) % concepts.length].slug, false);
      });
    }

    function selectView(view) {
      state.view = view;
      elements.frameShell.dataset.view = view;
      elements.viewButtons.forEach(function (item) {
        var active = item.dataset.suiteView === view;
        item.setAttribute('aria-pressed', String(active));
      });
      updateUrl();
      setStatus(view === 'auto' ? 'Using this device width' : 'Previewing ' + view + ' width');
    }

    elements.viewButtons.forEach(function (item) {
      item.addEventListener('click', function () {
        selectView(item.dataset.suiteView);
      });
    });
    function handleCompactChange(event) {
      if (event.matches && state.view !== 'auto') selectView('auto');
    }
    if (compactQuery.addEventListener) {
      compactQuery.addEventListener('change', handleCompactChange);
    } else if (compactQuery.addListener) {
      compactQuery.addListener(handleCompactChange);
    }

    if (elements.pauseButton) {
      elements.pauseButton.addEventListener('click', function () {
        state.paused = !state.paused;
        elements.pauseButton.setAttribute('aria-pressed', String(state.paused));
        elements.pauseButton.textContent = state.paused ? 'Resume motion' : 'Pause motion';
        syncConceptActivity();
        setStatus(state.paused ? 'Motion paused' : 'Motion resumed');
      });
    }

    if (elements.fullscreenButton) {
      if (!elements.stage.requestFullscreen) {
        elements.fullscreenButton.hidden = true;
      } else {
        elements.fullscreenButton.addEventListener('click', function () {
          if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
          else elements.stage.requestFullscreen().catch(function () {});
        });
        document.addEventListener('fullscreenchange', function () {
          elements.fullscreenButton.textContent = document.fullscreenElement ? 'Exit full screen' : 'Full screen';
        });
      }
    }

    elements.frame.addEventListener('load', function () {
      clearTimeout(loadTimer);
      elements.loading.hidden = true;
      elements.frame.classList.add('is-ready');
      syncConceptActivity();
      var concept = concepts[currentIndex()];
      setStatus(concept.title + ' ready');
    });

    document.addEventListener('visibilitychange', function () {
      state.documentVisible = document.visibilityState === 'visible';
      syncConceptActivity();
    });

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        state.stageVisible = entries.some(function (entry) { return entry.isIntersecting; });
        syncConceptActivity();
      }, { threshold: 0.05 });
      observer.observe(elements.stage);
    }

    document.addEventListener('keydown', function (event) {
      var target = event.target;
      var editable = target instanceof Element &&
        target.matches('input, textarea, select, [contenteditable="true"]');
      if (event.metaKey || event.ctrlKey || event.altKey || editable) return;
      if (event.key === 'ArrowLeft' && elements.previousButton) elements.previousButton.click();
      if (event.key === 'ArrowRight' && elements.nextButton) elements.nextButton.click();
      if (event.key.toLowerCase() === 'p' && elements.pauseButton) elements.pauseButton.click();
      if (event.key.toLowerCase() === 'd') {
        var views = isCompact() ? ['auto'] : ['auto', 'phone', 'tablet', 'desktop'];
        selectView(views[(views.indexOf(state.view) + 1) % views.length]);
      }
    });

    selectView(state.view);
    selectConcept(requestedConcept, false);
  }

  fetch(manifestUrl)
    .then(function (response) {
      if (!response.ok) throw new Error('Lab manifest unavailable');
      return response.json();
    })
    .then(initialize)
    .catch(function () {
      root.setAttribute('data-suite-error', '');
      if (elements.loading) {
        elements.loading.hidden = false;
        elements.loading.textContent = 'The live workbench could not load. Open the individual builds below.';
      }
      setStatus('Workbench unavailable');
    });
})();
