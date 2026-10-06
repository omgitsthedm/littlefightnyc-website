(() => {
  document.documentElement.classList.add('lab-concept-page');
  if (window.self !== window.top || new URLSearchParams(location.search).has('embed')) {
    document.documentElement.classList.add('lab-concept-embed');
    return;
  }
  const disclosure = document.querySelector('.lab-build-disclosure');
  if (!disclosure || disclosure.dataset.stageLabel === 'true') return;
  const stageLabel = disclosure.cloneNode(true);
  stageLabel.classList.remove('lab-build-disclosure');
  stageLabel.dataset.stageLabel = 'true';
  disclosure.before(stageLabel);
})();
