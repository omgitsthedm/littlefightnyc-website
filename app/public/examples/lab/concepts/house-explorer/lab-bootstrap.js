(() => {
  document.documentElement.classList.add('lab-concept-page');
  if (window.self !== window.top || new URLSearchParams(location.search).has('embed')) {
    document.documentElement.classList.add('lab-concept-embed');
  }
})();
