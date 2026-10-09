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

  function editorialRowsForContent(card, height, unit) {
    const copy = card.querySelector('.topic-anchor-copy,.brand-anchor-copy');
    if (!copy) return height;
    if (card.dataset.editorialFront && card.dataset.editorialFront !== 'booking') {
      const label = copy.querySelector('.topic-anchor-label');
      if (!label) return height;
      const range = document.createRange();
      range.selectNodeContents(label);
      const styles = getComputedStyle(copy);
      const handset = window.innerWidth <= 600;
      const websiteShare = window.innerWidth <= 360 ? 1.1 / 2 : 1.05 / 2;
      const share = card.dataset.editorialFront === 'brand' ? 1 : handset ? (card.dataset.editorialFront === 'web' ? websiteShare : 1.3 / 2) : 1 / 2;
      const icon = card.querySelector('.topic-anchor-icon');
      const iconSpace = handset || !icon ? 0 : icon.getBoundingClientRect().width + parseFloat(styles.columnGap);
      const available = card.clientWidth * share - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight) - iconSpace;
      // Enlarged text can outgrow a side-by-side composition. Give it the
      // full card width, keeping the actual work below rather than clipping
      // the service name or letting it run across the screenshot.
      card.toggleAttribute('data-editorial-stack', range.getBoundingClientRect().width > available + 1);
      const children = [...copy.children]
        .flatMap(child => {
          const range = document.createRange();
          range.selectNodeContents(child);
          // A border box can be smaller than its rendered line box at large
          // accessibility text sizes (notably the brand mark and h1). Include
          // the actual text line rectangles so a whole extra grid row is
          // chosen before glyphs reach the clipped tile edge.
          return [child.getBoundingClientRect(), ...range.getClientRects()];
        })
        // At handset widths the large icon is intentionally hidden.  A
        // display:none child reports a zero rect at the document origin;
        // including it in the range makes each layout pass invent extra rows.
        .filter(box => box.width > 0 && box.height > 0);
      if (!children.length) return height;
      // This copy grid deliberately stretches to fill an already-packed
      // anchor. Its scrollHeight is therefore the current card height, not
      // the height its text needs. Feeding that value into row selection made
      // each ResizeObserver pass request another row (and could grow a
      // mid-width anchor indefinitely). The visible children retain their
      // natural wrapped heights even inside the stretched grid, so their
      // union is the stable intrinsic measure. Padding belongs to the copy,
      // not to the current allocated row height.
      const copyHeight = Math.max(...children.map(box => box.bottom)) - Math.min(...children.map(box => box.top))
        + parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
      const art = card.querySelector('.topic-anchor-art');
      const artStyle = art ? getComputedStyle(art) : styles;
      const visual = art && art.querySelector('.website-project-rotator,.brand-anchor-art,.editorial-illustration');
      // A side-by-side visual fills the anchor's already-established height.
      // Measuring that rendered height feeds the newly-added grid row back
      // into the next pass and can grow the card forever. Only a true stacked
      // composition contributes a fixed, width-derived visual height.
      const ratio = visual?.matches('.editorial-illustration') ? 1 : visual?.matches('.website-project-rotator') && handset ? 3 / 4 : 5 / 8;
      const artHeight = card.hasAttribute('data-editorial-stack') && visual
        ? visual.getBoundingClientRect().width * ratio + parseFloat(artStyle.paddingTop) + parseFloat(artStyle.paddingBottom)
        : 0;
      const needed = card.hasAttribute('data-editorial-stack') ? copyHeight + artHeight : Math.max(copyHeight, artHeight);
      const gridGap = parseFloat(getComputedStyle(card.parentElement).rowGap) || 0;
      return Math.max(height, Math.ceil((needed + 2 + gridGap) / (unit + gridGap)));
    }
    const cardFrame = card.getBoundingClientRect();
    const frame = copy.getBoundingClientRect();
    const promise = copy.querySelector('strong');
    const signature = `${Math.round(frame.width)}:${Math.round(parseFloat(getComputedStyle(promise || copy).fontSize) * 10)}:${card.hasAttribute('data-editorial-stack')}`;
    const remembered = integer(card.dataset.editorialContentRows, height);
    if (card.dataset.editorialContentSignature === signature && remembered > height) return remembered;
    const children = [...copy.children].map(child => child.getBoundingClientRect());
    const childOverflow = children.reduce((overflow, box) => Math.max(
      overflow,
      frame.top - box.top,
      box.bottom - frame.bottom
    ), 0);
    const overflow = Math.max(
      childOverflow,
      copy.scrollHeight - copy.clientHeight,
      cardFrame.top - frame.top,
      frame.bottom - cardFrame.bottom
    );
    // Text enlargement is allowed to make an anchor taller. Add complete grid
    // rows, rather than reducing type, hiding the icon, or clipping the last
    // line of its customer-facing promise.
    const rows = overflow > 2 ? height + Math.ceil(overflow / Math.max(unit, 1)) : height;
    card.dataset.editorialContentRows = String(rows);
    card.dataset.editorialContentSignature = signature;
    return rows;
  }

  function labRowsForContent(card, height, unit) {
    const face = card.querySelector('.lab-tile-face');
    const copy = card.querySelector('.lab-tile-copy');
    const media = card.querySelector('.lab-tile-media');
    if (!face || !copy || !media) return height;
    const faceStyle = getComputedStyle(face);
    const copyChildren = [...copy.children].flatMap(child => {
      const range = document.createRange();
      range.selectNodeContents(child);
      return [child.getBoundingClientRect(), ...range.getClientRects()];
    }).filter(box => box.width > 0 && box.height > 0);
    if (!copyChildren.length) return height;
    // The image is the reason the Lab tile gets this footprint. At enlarged
    // text sizes its lower invitation receives complete new rows instead of
    // crushing the capture or clipping the last action line.
    const copyHeight = Math.max(...copyChildren.map(box => box.bottom)) - Math.min(...copyChildren.map(box => box.top));
    const mediaMin = parseFloat(getComputedStyle(media).minHeight) || 0;
    const needed = mediaMin + copyHeight + parseFloat(faceStyle.rowGap)
      + parseFloat(faceStyle.paddingTop) + parseFloat(faceStyle.paddingBottom) + 2;
    const gap = parseFloat(getComputedStyle(card.parentElement).rowGap) || 0;
    return Math.max(height, Math.ceil((needed + gap) / (unit + gap)));
  }

  function dimensions(card, cols, mobile, unit) {
    // Layout writes the actual occupied span back to data-columns/rows. Keep
    // the authored span separately so a temporary hole repair at one viewport
    // never becomes the card's new preferred geometry at the next viewport.
    const defaultColumns = integer(card.dataset.packBaseColumns, token(card, 'columns', 2));
    const defaultRows = integer(card.dataset.packBaseRows, token(card, 'rows', 2));
    let width = token(card, mobile ? 'mobileColumns' : 'preferredColumns', defaultColumns);
    let height = token(card, mobile ? 'mobileRows' : 'preferredRows', defaultRows);

    if (card.dataset.sculpture === 'true') {
      const copy = card.querySelector('.sculpture-copy');
      const title = card.querySelector('.sculpture-title');
      if (!copy || !title) return [Math.min(width, cols), Math.max(1, height)];
      const gap = parseFloat(getComputedStyle(card.parentElement).rowGap) || 0;
      const styles = getComputedStyle(copy);
      const context = document.createElement('canvas').getContext('2d');
      context.font = getComputedStyle(title).font;
      const longest = Math.max(...[...copy.querySelectorAll('.sculpture-title,.sculpture-description,.sculpture-lab-action')].flatMap(node => {
        context.font = getComputedStyle(node).font;
        return node.textContent.trim().split(/\s+/).map(word => context.measureText(word).width);
      }));
      const padding = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
      // At 200% text on a narrow phone, even a full-width card can meet a
      // word wider than the viewport. Wrap that word only in this case.
      card.toggleAttribute('data-wrap-word', longest + padding + 2 > card.parentElement.clientWidth);
      width = Math.min(cols, Math.max(width, Math.ceil((longest + padding + gap + 2) / (unit + gap))));
      // Measure at the requested width, before the packer expands a card to
      // fill a gap. Reading last pass's expanded width can alternate between
      // short/wide and tall/narrow forever after text enlargement.
      const previousWidth = card.style.width;
      card.style.width = `${unit * width + gap * (width - 1)}px`;
      const boxes = [...copy.children].map(node => node.getBoundingClientRect()).filter(box => box.height);
      const copyHeight = boxes.length ? Math.max(...boxes.map(box => box.bottom)) - Math.min(...boxes.map(box => box.top)) + parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom) : 0;
      const kind = card.dataset.sculptureKind;
      if (kind === 'service' && mobile && window.innerWidth > 600) height = 2;
      const sideBySide = kind === 'brand' || (kind === 'service' && window.innerWidth > 600);
      const artMinimum = kind === 'review' || kind === 'service' ? 0 : Math.max(100, (unit * width + gap * (width - 1)) * .57);
      const needed = sideBySide ? Math.max(copyHeight + 4, 144) : copyHeight + artMinimum + 16;
      height = Math.max(height, Math.ceil((needed + gap) / (unit + gap)));
      if (!sideBySide && kind !== 'service') card.style.setProperty('--sculpture-art-top', `${copy.offsetHeight + 8}px`);
      card.style.width = previousWidth;
      return [Math.min(width, cols), Math.max(1, height)];
    }

    // Six columns continue through tablets, but their physical units are much
    // wider than a phone's. Ordinary strips can use their desktop geometry as
    // soon as a unit has enough real space; this avoids turning a simple
    // prompt back into a needless 2 × 2 block at 601–1000px.
    const ordinary = !['service-anchor', 'case-study', 'photo-album', 'review', 'lab'].includes(card.dataset.kind || '')
      && !['brand-brief', 'google-reviews', 'page-vera', 'booking', 'it-payment-device-check'].includes(card.dataset.answer || '');
    if (mobile && window.innerWidth > 600 && ordinary && unit >= 78) {
      width = token(card, 'preferredColumns', defaultColumns);
      height = token(card, 'preferredRows', defaultRows);
    }
    // A tablet is not an enlarged phone. Six columns are physically broad at
    // 601–1000px, so a 6×4 service card becomes a mostly empty banner. Keep
    // the identity route to a single strip and the four equal service routes
    // to two rows; phone widths retain their three-row composition below.
    if (mobile && card.dataset.editorialFront && window.innerWidth > 600) {
      width = 6;
      height = card.dataset.editorialFront === 'brand' ? 1 : 2;
    }
    // A 480–600px device has the inline room for the same one-row identity
    // strip used on tablets.  Preserve the phone mosaic, but do not leave a
    // two-row brand introduction above the service proof once it can fit.
    if (mobile && window.innerWidth >= 480 && card.dataset.editorialFront === 'brand') {
      height = 1;
    }
    if (mobile && window.innerWidth <= 360 && card.dataset.editorialFront) {
      height = Math.max(height, card.dataset.editorialFront === 'brand' ? 2 : 3);
    }
    if (card.dataset.editorialFront) {
      height = editorialRowsForContent(card, height, unit);
    }
    if (card.dataset.kind === 'lab') {
      height = labRowsForContent(card, height, unit);
    }
    // A single label can fill a true desktop unit with 18–24px type. Around
    // 1024px the unit falls below that physical threshold, so return it to a
    // two-unit strip instead of shrinking the text or hiding a word.
    if (card.dataset.compactLabel === 'true' && unit < 96 && (!mobile || window.innerWidth > 600)) {
      width = 2;
      height = 1;
    }
    // A 1024px desktop still uses twelve columns, which makes each unit about
    // 70px tall. Keep ordinary compact fronts horizontal at that physical
    // size, and grant the longest labels a second row instead of reducing
    // their 18px type or allowing a third text line to clip.
    if (ordinary) {
      const narrowDesktop = !mobile && window.innerWidth <= 1200;
      if (narrowDesktop) {
        card.dataset.narrowCompact = 'true';
        const label = card.dataset.cellTitle || card.querySelector('.cell-title')?.textContent?.trim() || '';
        const words = label.split(/\s+/).filter(Boolean).length;
        if (height === 1 && (words >= 5 || label.length >= 28)) height = 2;
      } else {
        delete card.dataset.narrowCompact;
      }
    }

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
        height = 3;
      }
      const quote = card.querySelector('.review-quote');
      if (mobile && quote && parseFloat(getComputedStyle(quote).fontSize) > 28) width = cols;
      const style = getComputedStyle(card);
      const content = [...card.querySelectorAll(':scope > .review-stars,:scope > .review-quote,:scope > .review-credit')];
      const needed = content.reduce((sum, node) => sum + Math.max(node.scrollHeight, node.getBoundingClientRect().height), 0)
        + (parseFloat(style.rowGap) || 0) * Math.max(0, content.length - 1)
        + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + 2;
      const gap = parseFloat(getComputedStyle(card.parentElement).rowGap) || 0;
      // Preserve complete quotes when text is enlarged; grow in square units.
      height = Math.max(height, Math.ceil((needed + gap) / (unit + gap)));
    }
    if (mobile && card.dataset.kind === 'case-study') {
      width = Math.max(width, 3);
      // Landscape site captures need a landscape frame on a tablet. A square
      // 3×3 proof card forced an honest, whole screenshot to sit in a large
      // black letterbox. Handsets keep the square bento beat; 601–1000px uses
      // a 3×2 frame that shows the work at a useful scale without cropping it.
      height = Math.max(height, window.innerWidth > 600 ? 2 : 3);
    }
    if (!mobile && window.innerWidth <= 1200 && card.dataset.kind === 'case-study') {
      width = 4;
      height = 3;
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

    // Combined icon cards keep whole words and grow by complete square units
    // when a narrow viewport or enlarged text needs more room.
    if (card.classList.contains('home-group-tile')) {
      const face = card.querySelector('.cell-face');
      const title = card.querySelector('.cell-title');
      const art = card.querySelector('.cell-art');
      const faceStyle = getComputedStyle(face);
      const titleStyle = getComputedStyle(title);
      const gridGap = parseFloat(getComputedStyle(card.parentElement).columnGap) || 0;
      const paddingX = parseFloat(faceStyle.paddingLeft) + parseFloat(faceStyle.paddingRight);
      const context = document.createElement('canvas').getContext('2d');
      context.font = titleStyle.font;
      const longestWord = Math.max(0, ...title.textContent.trim().split(/\s+/).map(word => context.measureText(word).width));
      width = Math.min(cols, Math.max(width, Math.ceil((longestWord + paddingX + gridGap + 2) / (unit + gridGap))));
      const needed = title.scrollHeight + art.offsetHeight + parseFloat(faceStyle.rowGap)
        + parseFloat(faceStyle.paddingTop) + parseFloat(faceStyle.paddingBottom) + 2;
      height = Math.max(height, Math.ceil((needed + gridGap) / (unit + gridGap)));
    }

    // Each original card carries its approved geometry. Do not normalize the
    // bento rhythm here; icon-only cards may intentionally remain compact.
    return [Math.min(width, cols), Math.max(1, height)];
  }

  function buildOccupancy(entries) {
    const occupied = [];
    for (const entry of entries) {
      const { card, position } = entry;
      for (let row = position.y; row < position.y + position.height; row += 1) {
        occupied[row] ||= [];
        for (let column = position.x; column < position.x + position.width; column += 1) occupied[row][column] = card;
      }
    }
    return occupied;
  }

  function fitsRectangle(rect, card, occupied, cols) {
    if (rect.x < 0 || rect.y < 0 || rect.x + rect.width > cols || rect.height < 1 || rect.width < 1) return false;
    for (let row = rect.y; row < rect.y + rect.height; row += 1) {
      for (let column = rect.x; column < rect.x + rect.width; column += 1) {
        if (occupied[row]?.[column] && occupied[row][column] !== card) return false;
      }
    }
    return true;
  }

  function packedRows(entries) {
    return Math.max(1, ...entries.map(({ position }) => position.y + position.height));
  }

  function firstVacancy(entries, cols) {
    const occupied = buildOccupancy(entries);
    const rows = packedRows(entries);
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        if (!occupied[y]?.[x]) return { x, y, occupied, rows };
      }
    }
    return null;
  }

  function growthPenalty(entry, rect) {
    const kind = entry.card.dataset.kind;
    const added = rect.width * rect.height - entry.position.width * entry.position.height;
    // Preserve the intentional 4 × 4 album crop and the main service anchors
    // when a smaller neighboring tile can close the same gap. They are still
    // legal last-resort candidates, so no empty cells survive.
    const visualPenalty = kind === 'photo-album' ? 24 : kind === 'service-anchor' ? 12 : kind === 'review' ? 4 : 0;
    return added * 10 + visualPenalty;
  }

  function growIntoFirstVacancy(entries, cols) {
    const vacancy = firstVacancy(entries, cols);
    if (!vacancy) return false;
    const { x, y, occupied } = vacancy;
    let winner = null;

    for (const entry of entries) {
      const { card, position } = entry;
      // Reviews keep their deliberate 3-column reading measure. Primary
      // anchors likewise keep their intentional service frame: growing one to
      // patch a remote packing gap turns an answer into blank space.
      if (card.classList.contains('review-tile') || card.dataset.kind === 'service-anchor') continue;
      const candidates = [];
      // A tile can take a neighboring empty run from any of its four edges.
      // We consider each complete integer span rather than changing text size
      // or making an arbitrary visual spacer.
      for (let width = position.width + 1; width <= cols - position.x; width += 1) {
        candidates.push({ x: position.x, y: position.y, width, height: position.height });
      }
      for (let width = position.width + 1; width <= position.x + position.width; width += 1) {
        candidates.push({ x: position.x + position.width - width, y: position.y, width, height: position.height });
      }
      const currentRows = packedRows(entries);
      for (let height = position.height + 1; height <= currentRows - position.y; height += 1) {
        candidates.push({ x: position.x, y: position.y, width: position.width, height });
      }
      for (let height = position.height + 1; height <= position.y + position.height; height += 1) {
        candidates.push({ x: position.x, y: position.y + position.height - height, width: position.width, height });
      }

      for (const rect of candidates) {
        if (x < rect.x || x >= rect.x + rect.width || y < rect.y || y >= rect.y + rect.height) continue;
        if (!fitsRectangle(rect, card, occupied, cols)) continue;
        const score = growthPenalty(entry, rect);
        if (!winner || score < winner.score) winner = { entry, rect, score };
      }
    }

    if (!winner) return false;
    winner.entry.position = winner.rect;
    return true;
  }

  function sourceOrderForPacking(entries) {
    const brand = entries.find(entry => entry.card.dataset.answer === 'brand-brief');
    const website = entries.find(entry => entry.card.dataset.answer === 'page-services-custom-local-websites');
    return [brand, website, ...entries.filter(entry => entry !== brand && entry !== website)].filter(Boolean);
  }

  function shelfFallback(entries, cols) {
    // A mathematically full fallback is only used when constrained 2-D packing
    // cannot repair a gap. It keeps authored dimensions where possible, pairs
    // like heights first, and grows only the final card in a shelf to consume
    // the remaining whole units. This guarantees there is never a black grid
    // pocket or an invisible placeholder card.
    const remaining = sourceOrderForPacking(entries).map(entry => ({
      ...entry,
      position: { ...(entry.basePosition || entry.position) }
    }));
    const flushed = [];
    let y = 0;
    while (remaining.length) {
      const row = [remaining.shift()];
      let used = row[0].position.width;
      let rowHeight = row[0].position.height;

      // A review needs a non-review neighbor so that any fractional row width
      // stays with ordinary content. This is also what keeps a lone final
      // review from becoming a large, mostly empty rectangle.
      if (row[0].card.classList.contains('review-tile')) {
        const reviewWidth = row[0].position.width;
        const partnerIndex = remaining.findIndex(entry => !entry.card.classList.contains('review-tile')
          && entry.card.dataset.kind !== 'service-anchor'
          && entry.position.width <= cols - reviewWidth);
        if (partnerIndex >= 0) {
          const partner = remaining.splice(partnerIndex, 1)[0];
          row.push(partner);
          used += partner.position.width;
          rowHeight = Math.max(rowHeight, partner.position.height);
        }
      }

      while (used < cols && remaining.length) {
        const available = cols - used;
        let choice = -1;
        const hasBrand = row.some(entry => entry.card.dataset.answer === 'brand-brief');
        const hasServiceAnchor = row.some(entry => entry.card.dataset.kind === 'service-anchor');
        const needsFlexiblePartner = !row.some(entry => !entry.card.classList.contains('review-tile') && entry.card.dataset.kind !== 'service-anchor');
        // Place a review while this row still has a flexible neighbor. Leaving
        // every review until the end can strand one alone in a full-width row.
        if (!needsFlexiblePartner && !row.some(entry => entry.card.classList.contains('review-tile'))) {
          choice = remaining.findIndex(entry => entry.card.classList.contains('review-tile') && entry.position.width <= available);
        }
        // Equal-height cards preserve their established aspect ratio. If none
        // fit, choose the nearest height; that is the smallest truthful visual
        // adjustment required to close the row.
        if (choice < 0) for (let index = 0; index < remaining.length; index += 1) {
          const candidate = remaining[index];
          // The fallback is allowed to reorder compatible cards to close a
          // row, but never puts Websites beside Problems? Solved. That pair
          // has an intentional vertical relationship at every viewport.
          if (hasBrand && candidate.card.dataset.answer === 'page-services-custom-local-websites') continue;
          if (candidate.position.width > available) continue;
          // An anchor is deliberately shallow. Pair it with a short tile and
          // let that companion receive the final column, rather than letting a
          // photo album stretch the anchor into a taller, emptier rectangle.
          if (hasServiceAnchor && candidate.position.height > rowHeight) continue;
          if (needsFlexiblePartner && (candidate.card.classList.contains('review-tile') || candidate.card.dataset.kind === 'service-anchor')) continue;
          if (choice < 0) {
            choice = index;
            continue;
          }
          const selected = remaining[choice];
          const currentDifference = Math.abs(selected.position.height - rowHeight);
          const nextDifference = Math.abs(candidate.position.height - rowHeight);
          if (nextDifference < currentDifference || (nextDifference === currentDifference && candidate.position.width > selected.position.width)) choice = index;
        }
        if (choice < 0) break;
        const candidate = remaining.splice(choice, 1)[0];
        row.push(candidate);
        used += candidate.position.width;
        rowHeight = Math.max(rowHeight, candidate.position.height);
      }

      // Put the tile receiving the final integer width at the row edge. This
      // leaves all review cards at their authored width, while preserving a
      // continuous rectangular row with no black pocket.
      const growIndex = row.map(entry => !entry.card.classList.contains('review-tile') && entry.card.dataset.kind !== 'service-anchor').lastIndexOf(true);
      if (growIndex >= 0 && growIndex !== row.length - 1) {
        const [grower] = row.splice(growIndex, 1);
        row.push(grower);
      }
      const last = row[row.length - 1];
      last.position.width += cols - used;
      let x = 0;
      for (const entry of row) {
        entry.position = { x, y, width: entry.position.width, height: rowHeight };
        flushed.push(entry);
        x += entry.position.width;
      }
      y += rowHeight;
    }
    return flushed;
  }

  function packSculptureCollection(grid) {
    const cards = [...grid.querySelectorAll(':scope > .tile')];
    if (!cards.length || cards.some(card => !card.matches('.sculpture-tile') || !card.querySelector('.sculpture-copy'))) return false;
    // Enlarged type keeps the measured, single-row fallback. At ordinary
    // sizes all four collections use the same interlocking card vocabulary.
    if (cards.some(card => parseFloat(getComputedStyle(card.querySelector('.sculpture-title')).fontSize) > 25)) return packSculptureRows(grid);
    const available = grid.clientWidth;
    const handset = innerWidth <= 600;
    const gap = handset ? 10 : 12;
    const columns = available >= 1080 ? 16 : available >= 720 ? 12 : available >= 540 ? 8 : 4;
    const unit = (available - gap * (columns - 1)) / columns;
    const rowUnit = handset ? 64 : 84;
    const spanWidth = span => span * (unit + gap) - gap;
    const spanHeight = span => span * (rowUnit + gap) - gap;
    const baseSpan = columns === 16 ? 4 : columns === 12 ? 3 : 2;
    // The curated Websites section is mostly framed screens. Counter its
    // portrait bias so the typical front keeps pace with the other services.
    const baseArea = spanWidth(baseSpan) * (handset ? 230 : 200)
      * (grid.dataset.topicGrid === 'web' ? .86 : 1);
    const widths = columns === 16 ? [2, 3, 4, 5, 6, 8] : columns === 12 ? [2, 3, 4, 6] : columns === 8 ? [2, 3, 4] : [2, 4];
    const context = document.createElement('canvas').getContext('2d');
    const offset = { web: 0, it: 2, consulting: 4, software: 6 }[grid.dataset.topicGrid] || 0;
    const rhythm = ['portrait', 'wide', 'compact', 'square', 'wide', 'square', 'portrait', 'compact'];
    const options = cards.map((card, index) => {
      const image = !!card.querySelector('.sculpture-art img');
      const ratio = Number(card.dataset.artRatio) || 1.25;
      const mode = card.dataset.device === 'iphone' || card.dataset.device === 'tablet' ? 'portrait'
        : card.dataset.device ? 'wide' : rhythm[(index + offset) % rhythm.length];
      const desiredRatio = card.dataset.device === 'iphone' ? .47 : { portrait: handset ? .5 : .68, wide: handset ? .9 : 1.7, compact: 1.12, square: 1 }[mode];
      const desiredArea = baseArea * (card.dataset.device === 'iphone' ? .78 : mode === 'compact' ? .8 : mode === 'portrait' ? 1.05 : 1);
      const result = [];
      for (const width of widths) {
        const pixels = spanWidth(width);
        const narrow = pixels < 225;
        for (const side of image && pixels >= 300 ? [false, true] : [false]) {
          card.style.width = `${pixels}px`;
          card.toggleAttribute('data-collection-narrow', narrow);
          card.toggleAttribute('data-collection-wide', side);
          card.removeAttribute('data-wrap-word');
          const copy = card.querySelector('.sculpture-copy');
          const copyStyle = getComputedStyle(copy);
          const textWidth = copy.clientWidth - parseFloat(copyStyle.paddingLeft) - parseFloat(copyStyle.paddingRight)
            - (copyStyle.display === 'grid' ? 28 + parseFloat(copyStyle.columnGap) : 0);
          let wordsFit = true;
          for (const node of copy.querySelectorAll('.sculpture-title,.sculpture-description,.sculpture-lab-action')) {
            context.font = getComputedStyle(node).font;
            const text = [];
            const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
            let part;
            while ((part = walker.nextNode())) if (!part.parentElement.closest('.sr-only,[aria-hidden=true]')) text.push(part.textContent);
            const spacing = parseFloat(getComputedStyle(node).letterSpacing) || 0;
            const longest = Math.max(...text.join(' ').trim().split(/\s+/).map(word => context.measureText(word).width + Math.max(0, word.length - 1) * spacing));
            if (longest > textWidth + 1) wordsFit = false;
          }
          if (!wordsFit && width < columns) continue;
          card.toggleAttribute('data-wrap-word', !wordsFit);
          const style = getComputedStyle(copy);
          const boxes = [...copy.children].map(node => node.getBoundingClientRect()).filter(box => box.height);
          const copyHeight = Math.max(...boxes.map(box => box.bottom)) - Math.min(...boxes.map(box => box.top))
            + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
          const minimum = side ? Math.max(copyHeight + 4, 144) : copyHeight + (image ? 98 : 4);
          const first = Math.max(2, Math.ceil((minimum + gap) / (rowUnit + gap)));
          const limit = handset ? 5 : card.dataset.device === 'iphone' || card.dataset.device === 'tablet' ? 4 : 3;
          for (let height = first; height <= Math.max(first, limit); height += 1) {
            const h = spanHeight(height);
            if (h > 420) continue;
            const shape = Math.log(pixels / h / desiredRatio);
            const area = Math.log(pixels * h / desiredArea);
            const artHeight = side ? h - 20 : h - copyHeight - 12;
            const artWidth = side ? pixels * .52 : pixels - 12;
            const artFit = image ? Math.min(artWidth / ratio, artHeight) : 100;
            // A wide card gets a genuinely horizontal composition. Do not
            // spend its extra width on empty space around a small object.
            // Larger canvases favor a common footprint over a device's
            // ideal silhouette; narrow layouts need more room for text.
            const cost = shape * shape * 2 + area * area * (columns >= 12 ? 4 : 2)
              + (side && pixels / h < 1.5 ? .65 : 0)
              + (!side && pixels / h > 1.9 && image ? .6 : 0)
              + (image && artFit < 90 ? .8 : 0);
            result.push({ width, height, narrow, side, wrap: !wordsFit, cost });
          }
        }
      }
      return result;
    });
    // A bounded skyline search fills the first open position in reading
    // order. Unlike equal-height shelves, a portrait can sit beside two
    // compact cards. Every completed plan closes with no empty grid cells.
    let plans = [{ skyline: Array(columns).fill(0), cost: 0, placed: [] }];
    const prefixes = [];
    for (let index = 0; index < cards.length && plans.length; index += 1) {
      const next = new Map();
      for (const plan of plans) {
        const y = Math.min(...plan.skyline);
        const x = plan.skyline.indexOf(y);
        let room = 0;
        while (x + room < columns && plan.skyline[x + room] === y) room += 1;
        for (const option of options[index]) {
          if (option.width > room || room - option.width === 1) continue;
          const skyline = [...plan.skyline];
          skyline.fill(y + option.height, x, x + option.width);
          const cost = plan.cost + option.cost;
          const key = skyline.join(',');
          if (!next.has(key) || next.get(key).cost > cost) next.set(key, {
            skyline, cost, placed: [...plan.placed, { ...option, card: cards[index], x, y }]
          });
        }
      }
      const remaining = cards.length - index - 1;
      const rank = plan => plan.cost + (Math.max(...plan.skyline) * columns - plan.skyline.reduce((sum, height) => sum + height, 0)) * (.06 + .5 / (remaining + 1));
      const ranked = [...next.values()].sort((a, b) => rank(a) - rank(b));
      // Keep a few closed prefixes even when their local image-fit score is
      // slightly higher. They let the remaining cards finish a clean edge.
      const closed = ranked.filter(plan => plan.skyline.every(height => height === plan.skyline[0])).slice(0, 12);
      if (closed.length && cards.length - index - 1 <= 6) prefixes.push(...closed.map(plan => ({ index: index + 1, plan })));
      plans = [...closed, ...ranked.filter(plan => !closed.includes(plan))].slice(0, 192);
    }
    const varied = plan => innerWidth < 744 || (
      new Set(plan.placed.map(p => p.width + ':' + p.height)).size >= 3
      && new Set(plan.placed.map(p => p.height)).size >= 2
      && plan.placed.some(a => plan.placed.some(b => b.y > a.y && b.y < a.y + a.height))
    );
    const complete = plans.filter(plan => plan.skyline.every(height => height === plan.skyline[0]) && varied(plan));
    if (!complete.length) {
      // Close only the short tail when the best free composition cannot
      // meet the bottom edge. Never flatten the entire collection to do it.
      const memo = new Map();
      const finish = (index, x = 0, rowHeight = 0) => {
        if (index === cards.length) return x === 0 ? { cost: 0, placed: [], rows: 0 } : null;
        const key = `${index}:${x}:${rowHeight}`;
        if (memo.has(key)) return memo.get(key);
        let best = null;
        for (const option of options[index]) {
          if (x + option.width > columns || (rowHeight && rowHeight !== option.height)) continue;
          const closes = x + option.width === columns;
          const next = finish(index + 1, closes ? 0 : x + option.width, closes ? 0 : option.height);
          if (!next) continue;
          const cost = option.cost + next.cost;
          if (!best || cost < best.cost) best = {
            cost,
            placed: [{ ...option, card: cards[index], x, y: 0 }, ...next.placed.map(p => ({ ...p, y: p.y + (closes ? option.height : 0) }))],
            rows: next.rows + (closes ? option.height : 0)
          };
        }
        memo.set(key, best);
        return best;
      };
      for (const { index, plan } of prefixes) {
        if (index === cards.length) continue;
        const tail = finish(index);
        if (!tail) continue;
        const candidate = {
          cost: plan.cost + tail.cost,
          skyline: Array(columns).fill(plan.skyline[0] + tail.rows),
          placed: [...plan.placed, ...tail.placed.map(p => ({ ...p, y: p.y + plan.skyline[0] }))]
        };
        if (varied(candidate)) complete.push(candidate);
      }
    }
    if (!complete.length) {
      cards.forEach(card => { card.style.width = ''; card.removeAttribute('data-collection-narrow'); });
      return packSculptureRows(grid);
    }
    const selected = complete.sort((a, b) => a.cost - b.cost)[0];
    grid.style.gap = `${gap}px`;
    grid.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
    grid.style.gridTemplateRows = `repeat(${selected.skyline[0]}, ${rowUnit}px)`;
    for (const position of selected.placed) {
      const { card, x, y, width, height } = position;
      card.style.width = '';
      card.toggleAttribute('data-collection-narrow', position.narrow);
      card.toggleAttribute('data-collection-wide', position.side);
      card.toggleAttribute('data-wrap-word', position.wrap);
      card.style.setProperty('grid-column', `${x + 1} / span ${width}`, 'important');
      card.style.setProperty('grid-row', `${y + 1} / span ${height}`, 'important');
      Object.assign(card.dataset, { columns: String(width), rows: String(height), shape: spanWidth(width) < spanHeight(height) ? 'tower' : 'landscape' });
    }
    Object.assign(grid.dataset, { tileCount: String(cards.length), packVacancies: 'false', packRepairs: '0', gridRevision: '6', collectionLayout: 'mixed' });
    return true;
  }

  function packSculptureRows(grid) {
    const cards = [...grid.querySelectorAll(':scope > .tile')];
    if (!cards.length || cards.some(card => !card.matches('.sculpture-tile') || !card.querySelector('.sculpture-copy'))) return false;
    const handset = innerWidth <= 600;
    const available = grid.clientWidth;
    const gap = handset ? 10 : 12;
    const targetHeight = available > 1100 ? 276 : available > 800 ? 252 : 240;
    // All four categories share the same compact row rhythm. Image ratios
    // choose the mix of narrow and wide cards within that common scale.
    const suggestedCount = Math.max(2, Math.round(available / 250));
    const context = document.createElement('canvas').getContext('2d');
    const copyHeight = (card, width) => {
      card.style.width = `${width}px`;
      const copy = card.querySelector('.sculpture-copy');
      const style = getComputedStyle(copy);
      const boxes = [...copy.children].map(node => node.getBoundingClientRect()).filter(box => box.height);
      return Math.max(...boxes.map(box => box.bottom)) - Math.min(...boxes.map(box => box.top))
        + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    };
    const info = new Map(cards.map(card => {
      card.removeAttribute('data-collection-wide');
      card.removeAttribute('data-collection-narrow');
      const proposed = (available - gap * (suggestedCount - 1)) / suggestedCount;
      card.style.width = `${proposed}px`;
      const copy = card.querySelector('.sculpture-copy');
      const styles = getComputedStyle(copy);
      const image = card.querySelector('.sculpture-art img');
      // Interactive Lab previews replace their image node after load. Keep
      // the authored frame ratio on the card, independent of that lifecycle.
      const ratio = image ? Number(card.dataset.artRatio) || Number(image.getAttribute('width')) / Number(image.getAttribute('height')) || 1.25 : 1;
      const longest = Math.max(...[...copy.querySelectorAll('.sculpture-title,.sculpture-description,.sculpture-lab-action')].flatMap(node => {
        context.font = getComputedStyle(node).font;
        return node.textContent.trim().split(/\s+/).map(word => context.measureText(word).width);
      }));
      const symbol = styles.display === 'grid' ? 28 + parseFloat(styles.columnGap) : 0;
      const needed = longest + parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight) + symbol + 3;
      card.toggleAttribute('data-wrap-word', needed > available);
      const minimumFrame = handset ? Math.max(130, (available - gap) * .44)
        : card.dataset.device === 'iphone' ? 150 : 224;
      const minimum = Math.min(available, Math.max(minimumFrame, needed));
      const header = copyHeight(card, Math.max(minimum, proposed));
      const preferred = Math.max(minimum, image ? (targetHeight - header - 12) * ratio + 14 : targetHeight);
      return [card, { ratio, image: !!image, minimum, preferred }];
    }));
    // Balance the complete collection, including its final row, instead of
    // stretching a leftover tile to fill a large empty pocket. Source order
    // stays intact for both visual scanning and keyboard navigation.
    const plans = Array(cards.length + 1);
    plans[cards.length] = { cost: 0, rows: [] };
    for (let start = cards.length - 1; start >= 0; start -= 1) {
      let minimum = 0, preferred = 0;
      for (let end = start; end < Math.min(cards.length, start + (handset ? 2 : 6)); end += 1) {
        const item = info.get(cards[end]);
        minimum += item.minimum + (end > start ? gap : 0);
        preferred += item.preferred + (end > start ? gap : 0);
        if (minimum > available + .1) break;
        const mismatch = (preferred - available) / available;
        const cost = mismatch * mismatch + plans[end + 1].cost;
        if (!plans[start] || cost < plans[start].cost) plans[start] = { cost, rows: [cards.slice(start, end + 1), ...plans[end + 1].rows] };
      }
    }
    const rows = plans[0].rows;
    const placed = [];
    let y = 0;
    for (const row of rows) {
      const room = available - gap * (row.length - 1);
      const totalRatio = row.reduce((sum, card) => sum + info.get(card).ratio, 0);
      let widths = row.map(card => room * info.get(card).ratio / totalRatio);
      let headers = [], height = 0;
      for (let pass = 0; pass < 7; pass += 1) {
        headers = row.map((card, index) => copyHeight(card, widths[index]));
        const widthAt = (card, index, h) => {
          const item = info.get(card);
          return Math.max(item.minimum, item.image ? (h - headers[index] - 12) * item.ratio + 14 : h * item.ratio);
        };
        let low = 0, high = 5000;
        for (let step = 0; step < 24; step += 1) {
          const middle = (low + high) / 2;
          if (row.reduce((sum, card, index) => sum + widthAt(card, index, middle), 0) > room) high = middle;
          else low = middle;
        }
        height = high;
        widths = row.map((card, index) => widthAt(card, index, height));
      }
      // Keep ordinary rows within one shared size range. The actual words
      // can still demand more room under accessibility text enlargement.
      height = Math.ceil(Math.max(Math.min(height, targetHeight + 12), ...headers.map((h, index) => h + (info.get(row[index]).image ? 100 : 4))) / 12) * 12;
      if (row.length === 1 && !info.get(row[0]).image) height = headers[0] + 4;
      if (row.length === 1 && available > 360 && info.get(row[0]).image && info.get(row[0]).minimum <= available * .46) {
        const card = row[0];
        card.setAttribute('data-collection-wide', '');
        // An odd final card becomes a shallow text-and-object row rather
        // than a large poster. Text enlargement can opt back into stacking.
        height = Math.ceil(Math.max(180, copyHeight(card, available), Math.min(300, (available * .51 - 16) / info.get(card).ratio)) / 12) * 12;
      }
      let x = 0;
      row.forEach((card, index) => {
        const width = index === row.length - 1 ? available - x : widths[index];
        placed.push({ card, x, y, width, height });
        card.style.width = '';
        x += width + gap;
      });
      y += height + gap;
    }
    // Native grid tracks follow the measured boundaries. Intentional gutters
    // are separate tracks, so every row closes exactly at the container edge.
    const fixed = value => Math.round(value * 64) / 64;
    const xs = [...new Set(placed.flatMap(p => [fixed(p.x), fixed(p.x + p.width)]))].sort((a, b) => a - b);
    const ys = [...new Set(placed.flatMap(p => [fixed(p.y), fixed(p.y + p.height)]))].sort((a, b) => a - b);
    grid.style.gap = '0';
    grid.style.gridTemplateColumns = xs.slice(1).map((x, i) => `${x - xs[i]}px`).join(' ');
    grid.style.gridTemplateRows = ys.slice(1).map((top, i) => `${top - ys[i]}px`).join(' ');
    for (const p of placed) {
      p.card.style.setProperty('grid-column', `${xs.indexOf(fixed(p.x)) + 1} / ${xs.indexOf(fixed(p.x + p.width)) + 1}`, 'important');
      p.card.style.setProperty('grid-row', `${ys.indexOf(fixed(p.y)) + 1} / ${ys.indexOf(fixed(p.y + p.height)) + 1}`, 'important');
      Object.assign(p.card.dataset, { columns: String(Math.max(1, Math.round(p.width / available * 12))), rows: String(Math.max(1, Math.round(p.height / available * 12))), shape: p.width < p.height ? 'tower' : 'landscape' });
    }
    Object.assign(grid.dataset, { tileCount: String(cards.length), packVacancies: 'false', packRepairs: '0', gridRevision: '6', collectionLayout: 'rows' });
    return true;
  }

  function pack(grid) {
    if (grid.dataset.sculptureLayout !== 'compact' && packSculptureCollection(grid)) return;
    // The reference's opening uses natural rectangular rows, independent of
    // the square-unit packing used by the larger answer collections.
    if (grid.dataset.sculptureLayout === 'compact') {
      grid.classList.remove('is-large-text');
      const columns = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
      const cardWidth = (grid.clientWidth - 12 * (columns - 1)) / columns;
      const context = document.createElement('canvas').getContext('2d');
      const tooWide = [...grid.querySelectorAll('.sculpture-title,.sculpture-description')].some(node => {
        context.font = getComputedStyle(node).font;
        return node.textContent.trim().split(/\s+/).some(word => context.measureText(word).width > cardWidth - 32);
      });
      grid.classList.toggle('is-large-text', tooWide);
      grid.dataset.tileCount = String(grid.querySelectorAll(':scope > .tile').length);
      grid.dataset.packVacancies = 'false';
      grid.dataset.gridRevision = '5';
      return;
    }
    const mobile = phone.matches;
    const cols = mobile ? 6 : 12;
    const cards = [...grid.querySelectorAll(':scope > .tile')];
    const style = getComputedStyle(grid);
    const gap = Number.parseFloat(style.columnGap) || 8;
    const available = grid.clientWidth - (Number.parseFloat(style.paddingLeft) || 0) - (Number.parseFloat(style.paddingRight) || 0);
    const unit = Math.max(1, (available - gap * (cols - 1)) / cols);
    cards.forEach(card => {
      card.dataset.packBaseColumns ||= card.dataset.columns || '';
      card.dataset.packBaseRows ||= card.dataset.rows || '';
    });
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

    const cardOrder = sourceOrderForPacking(cards.map(card => ({ card })));
    const measured = new Map(cards.map(card => [card, dimensions(card, cols, mobile, unit)]));
    // The four services share one opening grid. Keep the cells equal,
    // growing all of them when any real label needs another row. Enlarged
    // text may take a full row rather than forcing a word outside its card.
    if (grid.dataset.topicGrid === 'services') {
      const neededWidth = Math.max(...[...measured.values()].map(size => size[0]));
      const serviceWidth = !mobile && neededWidth <= cols / 4 ? cols / 4 : neededWidth <= cols / 2 ? cols / 2 : cols;
      const serviceHeight = Math.max(...[...measured.values()].map(size => size[1]));
      cards.forEach(card => measured.set(card, [serviceWidth, serviceHeight]));
    }
    for (const { card } of cardOrder) {
      const [width, height] = measured.get(card);
      // Problems? Solved. is the visual first tile. The Websites anchor begins
      // on a later grid row so the relationship remains vertical at every
      // breakpoint rather than merely appearing to its right on desktop.
      const brand = placed.find(entry => entry.card.dataset.answer === 'brand-brief');
      let y = card.dataset.answer === 'page-services-custom-local-websites' && brand
        ? brand.position.y + brand.position.height
        : 0;
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
      placed.push({ card, position, basePosition: { ...position } });
    }

    // First-fit preserves most authored geometry. Then take only the smallest
    // adjacent integer expansions needed to remove its leftover pockets.
    // If a particular collection is arithmetically impossible to close that
    // way, switch just that collection to an exact shelf layout.
    let repairs = 0;
    while (repairs < cols * Math.max(1, placed.length) && growIntoFirstVacancy(placed, cols)) repairs += 1;
    const finalPlaced = firstVacancy(placed, cols) ? shelfFallback(placed, cols) : placed;
    const rows = packedRows(finalPlaced);

    for (const { card, position } of finalPlaced) {
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
    grid.dataset.packRepairs = String(repairs);
    grid.dataset.packVacancies = firstVacancy(finalPlaced, cols) ? 'true' : 'false';
    grid.dataset.gridRevision = '5';
  }

  function layout() {
    grids().forEach(pack);
    canvas.dataset.gridRevision = '5';
  }

  window.LF_MOSAIC = { layout };
  layout();

  let width = canvas.clientWidth;
  new ResizeObserver(() => {
    if (Math.abs(canvas.clientWidth - width) > 0.5) {
      width = canvas.clientWidth;
      // Packing changes observed child sizes. Defer those writes to the
      // next frame so WebKit can finish delivering this resize batch.
      queueContentLayout();
    }
  }).observe(canvas);
  let contentLayoutQueued = false;
  const queueContentLayout = () => {
    if (contentLayoutQueued) return;
    contentLayoutQueued = true;
    requestAnimationFrame(() => {
      contentLayoutQueued = false;
      layout();
    });
  };
  const contentObserver = new ResizeObserver(queueContentLayout);
  grids().forEach(grid => grid.querySelectorAll('.sculpture-copy > *').forEach(node => contentObserver.observe(node)));
  grids().forEach(grid => grid.querySelectorAll('.tile[data-editorial-front] :is(.topic-anchor-copy,.brand-anchor-copy)').forEach(copy => {
    contentObserver.observe(copy);
    [...copy.children].forEach(child => contentObserver.observe(child));
  }));
  grids().forEach(grid => grid.querySelectorAll('.home-group-tile .cell-title').forEach(title => contentObserver.observe(title)));
  grids().forEach(grid => grid.querySelectorAll('.review-tile > .review-stars,.review-tile > .review-quote,.review-tile > .review-credit').forEach(node => contentObserver.observe(node)));
  // Lab fronts have a native image above a written invitation. Observing the
  // copy lets accessibility text enlargement add whole square rows before it
  // can cover the image or fall below the tile.
  grids().forEach(grid => grid.querySelectorAll('.lab-tile-copy').forEach(copy => {
    contentObserver.observe(copy);
    [...copy.children].forEach(child => contentObserver.observe(child));
  }));
  phone.addEventListener('change', queueContentLayout);
})();
