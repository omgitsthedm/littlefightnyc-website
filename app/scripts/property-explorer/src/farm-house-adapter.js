(() => {
  'use strict';
  const integer = (value) => Number.parseInt(value || '0', 10) || 0;
  const yard = document.getElementById('yard-toggle');
  let garden = new URLSearchParams(location.search).get('yard') !== 'existing';
  const setYardLabel = () => {
    if (!yard) return;
    yard.textContent = garden ? 'Garden' : 'Existing';
    yard.setAttribute('aria-pressed', String(garden));
  };
  setYardLabel();
  yard?.addEventListener('click', () => {
    garden = !garden;
    window.farmExterior?.chooseGarden?.(garden);
    setYardLabel();
  });
  const state = () => {
    const body = document.body;
    const view = document.getElementById('view-select');
    const lighting = document.querySelector('button[data-lighting][aria-pressed="true"]');
    const gate = document.getElementById('gate-toggle');
    const christmas = document.getElementById('christmas-toggle');
    return { ready: body.dataset.modelReady === 'true', view: view?.value || null, lighting: lighting?.dataset.lighting || null, garden, gateOpen: gate?.getAttribute('aria-pressed') === 'true', christmas: christmas?.getAttribute('aria-pressed') === 'true', materialMaps: integer(body.dataset.materialMaps), architectureMaterials: 17 };
  };
  window.farmHouseViewer = { getState: state };
})();
