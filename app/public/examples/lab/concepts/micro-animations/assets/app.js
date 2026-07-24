const filterButtons = Array.from(document.querySelectorAll('.filter-pill'));
const cards = Array.from(document.querySelectorAll('.service-card'));
const codeButtons = Array.from(document.querySelectorAll('.code-toggle'));
const filterStatus = document.getElementById('filter-status');
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const replayTimers = new Map();
const suspendedReplays = new Set();
let hostVisible = true;
let motionPaused = false;

const categoryNames = {
  all: 'all',
  web: 'website',
  systems: 'business systems',
  brand: 'brand and content',
  media: 'photo and video',
};

const interactionStatus = document.createElement('div');
interactionStatus.className = 'a11y-status';
interactionStatus.setAttribute('aria-live', 'polite');
interactionStatus.setAttribute('aria-atomic', 'true');
document.body.appendChild(interactionStatus);

function announce(message) {
  interactionStatus.textContent = '';
  window.setTimeout(() => {
    interactionStatus.textContent = message;
  }, 20);
}

function cardName(card) {
  return card.querySelector('h2')?.textContent?.trim() || 'Interaction';
}

function playbackPaused() {
  return document.hidden || !hostVisible || motionPaused;
}

function scheduleReplayEnd(card) {
  const currentTimer = replayTimers.get(card);
  if (currentTimer) window.clearTimeout(currentTimer);
  replayTimers.delete(card);

  if (playbackPaused()) {
    suspendedReplays.add(card);
    return;
  }

  suspendedReplays.delete(card);
  const timer = window.setTimeout(() => {
    replayTimers.delete(card);
    card.classList.remove('is-replaying');
  }, 3200);
  replayTimers.set(card, timer);
}

function syncReplayLifecycle() {
  if (playbackPaused()) {
    replayTimers.forEach((timer, card) => {
      window.clearTimeout(timer);
      suspendedReplays.add(card);
    });
    replayTimers.clear();
    return;
  }

  suspendedReplays.forEach((card) => {
    if (card.classList.contains('is-replaying')) scheduleReplayEnd(card);
    else suspendedReplays.delete(card);
  });
}

function restartStudy(card) {
  const micro = card.querySelector('.micro');
  const animatedParts = Array.from(micro.querySelectorAll('span'));
  const name = cardName(card);

  if (reducedMotionQuery.matches) {
    micro.classList.remove('static-tap');
    void micro.offsetWidth;
    micro.classList.add('static-tap');
    announce(`${name} is shown as a static preview because reduced motion is enabled.`);
    return;
  }

  card.classList.remove('is-replaying');
  animatedParts.forEach((part) => {
    part.style.animation = 'none';
  });
  void micro.offsetWidth;
  animatedParts.forEach((part) => {
    part.style.animation = '';
  });
  card.classList.add('is-replaying');
  announce(`${name} replayed.`);
  scheduleReplayEnd(card);
}

function prepareStudies() {
  cards.forEach((card) => {
    const micro = card.querySelector('.micro');
    const name = cardName(card);
    micro.removeAttribute('aria-hidden');
    micro.setAttribute('role', 'button');
    micro.setAttribute('tabindex', '0');
    micro.setAttribute('aria-label', `Replay ${name} animation`);

    micro.addEventListener('click', () => restartStudy(card));
    micro.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        restartStudy(card);
      }
    });
  });
}

function setFilter(filter) {
  filterButtons.forEach((button) => {
    const active = button.dataset.filter === filter;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  let visibleCount = 0;
  cards.forEach((card) => {
    const tags = card.dataset.cats?.split(' ') ?? [];
    const show = filter === 'all' || tags.includes(filter);
    card.hidden = !show;
    if (show) visibleCount += 1;
  });

  const noun = visibleCount === 1 ? 'study' : 'studies';
  filterStatus.textContent = filter === 'all'
    ? `Showing all ${visibleCount} ${noun}`
    : `Showing ${visibleCount} ${categoryNames[filter]} ${noun}`;
}

filterButtons.forEach((button) => {
  button.setAttribute('aria-pressed', String(button.classList.contains('is-active')));
  button.addEventListener('click', () => {
    setFilter(button.dataset.filter || 'all');
  });
});

async function copySnippet(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  if (!copied) throw new Error('Copy command was unavailable.');
}

function downloadSnippet(text, name) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  link.href = url;
  link.download = `${slug}-snippet.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

codeButtons.forEach((button, index) => {
  const panel = button.nextElementSibling;
  const code = panel.querySelector('code');
  const card = button.closest('.service-card');
  const name = cardName(card);
  const panelId = `snippet-panel-${index + 1}`;

  panel.id = panelId;
  button.setAttribute('aria-controls', panelId);
  button.textContent = 'Inspect snippet';

  const actions = document.createElement('div');
  actions.className = 'snippet-actions';

  const copyButton = document.createElement('button');
  copyButton.className = 'snippet-action';
  copyButton.type = 'button';
  copyButton.textContent = 'Copy snippet';

  const downloadButton = document.createElement('button');
  downloadButton.className = 'snippet-action';
  downloadButton.type = 'button';
  downloadButton.textContent = 'Download .txt';

  const note = document.createElement('p');
  note.className = 'snippet-note';
  note.textContent = 'Focused excerpt, not a full component.';

  actions.append(copyButton, downloadButton, note);
  panel.appendChild(actions);

  button.addEventListener('click', () => {
    const willOpen = panel.hasAttribute('hidden');
    panel.toggleAttribute('hidden', !willOpen);
    button.setAttribute('aria-expanded', String(willOpen));
    button.textContent = willOpen ? 'Close snippet' : 'Inspect snippet';
  });

  copyButton.addEventListener('click', async () => {
    try {
      await copySnippet(code.textContent.trim());
      copyButton.textContent = 'Copied';
      announce(`${name} snippet copied.`);
      window.setTimeout(() => {
        copyButton.textContent = 'Copy snippet';
      }, 1600);
    } catch (_) {
      copyButton.textContent = 'Copy unavailable';
      announce('Copy is unavailable in this browser. Select the snippet text instead.');
      window.setTimeout(() => {
        copyButton.textContent = 'Copy snippet';
      }, 2200);
    }
  });

  downloadButton.addEventListener('click', () => {
    downloadSnippet(code.textContent.trim(), name);
    announce(`${name} snippet downloaded as a text file.`);
  });
});

prepareStudies();

document.addEventListener('visibilitychange', syncReplayLifecycle);
document.addEventListener('lab:visibility', (event) => {
  hostVisible = event.detail?.active !== false;
  syncReplayLifecycle();
});
document.addEventListener('lab:motion', (event) => {
  motionPaused = event.detail?.paused === true;
  syncReplayLifecycle();
});

if ('IntersectionObserver' in window && !reducedMotionQuery.matches) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-live');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.35,
      rootMargin: '0px 0px -8% 0px',
    },
  );

  cards.forEach((card) => observer.observe(card));
} else {
  cards.forEach((card) => card.classList.add('is-live'));
}
