/* Pack each topic independently. DOM order stays source order for keyboard users. */
(() => {
  'use strict';

  const canvas = document.querySelector('#canvas');
  if (!canvas) return;

  const phone = matchMedia('(max-width:1000px)');
  const grids = () => [...canvas.querySelectorAll('[data-topic-grid]')];
  const integer = (value, fallback) => {
    const number = Number.parseInt(value || '', 10);
    return Number.isFinite(number) && number > 0 ? number : fallback;
  };
  const token = (card, name, fallback) => integer(card.dataset[name], integer(getComputedStyle(card).getPropertyValue(`--${name.replace(/[A-Z]/g, part => `-${part.toLowerCase()}`)}`), fallback));

  function dimensions(card, cols, mobile) {
    const defaultColumns = token(card, 'columns', 2);
    const defaultRows = token(card, 'rows', 2);
    let width = token(card, mobile ? 'mobileColumns' : 'preferredColumns', defaultColumns);
    let height = token(card, mobile ? 'mobileRows' : 'preferredRows', defaultRows);

    // A 3 × 3 review has enough room at normal phone widths. At the smallest
    // supported width its quote, five stars, attribution, and source need one
    // extra source row; keeping it three columns wide preserves the bento beat
    // without making any of that content smaller or hidden.
    if (mobile && window.innerWidth <= 360 && card.classList.contains('review-tile')) {
      height = Math.max(height, 4);
    }
    // Three phone columns preserve the review's readable line length. A
    // tablet has enough physical width to use two rows; reserve the third
    // only on a narrow handset, where it protects every word of the quote.
    if (card.classList.contains('review-tile')) {
      if (mobile && window.innerWidth > 600) height = 2;
      if (!mobile && window.innerWidth <= 1200) {
        width = 3;
        height = 2;
      }
    }
    if (mobile && card.dataset.kind === 'case-study') {
      width = Math.max(width, 3);
      height = Math.max(height, 3);
    }
    // The injected question cards keep their 18px prompts. A handful need a
    // third row at 320px for every word to remain visible; their two-column
    // width still preserves the authored bento rhythm.
    if (mobile && window.innerWidth <= 360 && card.classList.contains('topic-question')) {
      height = Math.max(height, 3);
    }
    // This existing question is the narrowest useful two-column title at
    // 320px. One extra integer row keeps all four words visible at the
    // approved 16px floor instead of clipping the last line.
    if (mobile && window.innerWidth <= 360 && card.dataset.answer === 'it-guest-network') {
      height = Math.max(height, 3);
    }
    // A whole word must remain whole at the smallest supported width. These
    // marked titles take a third column rather than relying on break-word or
    // hiding the final letters inside a two-column card.
    if (mobile && window.innerWidth <= 360 && card.dataset.mobileLongWord === 'true') {
      width = Math.max(width, 3);
    }

    // Each original card carries its approved geometry. Do not normalize the
    // bento rhythm here; icon-only cards may intentionally remain compact.
    return [Math.min(width, cols), Math.max(1, height)];
  }

  function pack(grid) {
    const mobile = phone.matches;
    const cols = mobile ? 6 : 12;
    const cards = [...grid.querySelectorAll(':scope > .tile')];
    const occupied = [];
    const placed = [];
    const open = (x, y, width, height) => x + width <= cols && Array.from({ length: height }, (_, row) =>
      Array.from({ length: width }, (_, column) => !occupied[y + row]?.[x + column]).every(Boolean)
    ).every(Boolean);
    const reserve = (x, y, width, height) => {
      for (let row = 0; row < height; row += 1) {
        occupied[y + row] ||= [];
        for (let column = 0; column < width; column += 1) occupied[y + row][x + column] = true;
      }
    };

    for (const card of cards) {
      const [width, height] = dimensions(card, cols, mobile);
      let y = 0;
      let position = null;
      while (!position) {
        for (let x = 0; x <= cols - width; x += 1) {
          if (open(x, y, width, height)) {
            position = { x, y, width, height };
            reserve(x, y, width, height);
            break;
          }
        }
        y += 1;
      }
      placed.push([card, position]);
    }

    const style = getComputedStyle(grid);
    const gap = Number.parseFloat(style.columnGap) || 8;
    const available = grid.clientWidth - (Number.parseFloat(style.paddingLeft) || 0) - (Number.parseFloat(style.paddingRight) || 0);
    const unit = Math.max(1, (available - gap * (cols - 1)) / cols);
    const rows = Math.max(1, ...placed.map(([, position]) => position.y + position.height));

    for (const [card, position] of placed) {
      const { x, y, width, height } = position;
      card.style.setProperty('grid-column-start', String(x + 1), 'important');
      card.style.setProperty('grid-column-end', String(x + width + 1), 'important');
      card.style.setProperty('grid-row-start', String(y + 1), 'important');
      card.style.setProperty('grid-row-end', String(y + height + 1), 'important');
      card.style.setProperty('--tile-columns', width);
      Object.assign(card.dataset, {
        cells: String(width * height),
        columns: String(width),
        rows: String(height),
        shape: height === 1 ? 'strip' : width < height ? 'tower' : width > height ? 'landscape' : 'square'
      });

      // Compact icon tiles may intentionally suppress their visible title.
      // Their complete, authored question remains the accessible link name.
      if ((width === 1 || card.dataset.cellFace === 'icon') && !card.getAttribute('aria-label')) {
        const label = card.dataset.cellTitle || card.querySelector('.cell-title')?.textContent?.trim();
        if (label) card.setAttribute('aria-label', label);
      }
      const shortLabel = card.dataset.cellTitle || card.querySelector('.cell-title')?.textContent?.trim();
      const face = card.querySelector('.cell-face');
      if (shortLabel && face) face.dataset.shortLabel = shortLabel;
    }
    grid.style.gridTemplateRows = `repeat(${rows}, ${unit}px)`;
    grid.style.setProperty('--cell-unit', `${unit}px`);
    grid.dataset.tileCount = String(cards.length);
    grid.dataset.gridRevision = '4';
  }

  function layout() {
    grids().forEach(pack);
    canvas.dataset.gridRevision = '4';
  }

  window.LF_MOSAIC = { layout };
  layout();

  let width = canvas.clientWidth;
  new ResizeObserver(() => {
    if (Math.abs(canvas.clientWidth - width) > 0.5) {
      width = canvas.clientWidth;
      layout();
    }
  }).observe(canvas);
  phone.addEventListener('change', layout);
})();
