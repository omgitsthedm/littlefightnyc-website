const stage = document.getElementById("streetStage");
const replayButton = document.getElementById("replayBtn");
const pauseButton = document.getElementById("pauseBtn");
const powerNote = document.getElementById("powerNote");
const status = document.getElementById("stageStatus");
const stateButtons = Array.from(document.querySelectorAll("[data-state-button]"));
const signalButtons = Array.from(document.querySelectorAll("[data-signal]"));
const buildings = Array.from(document.querySelectorAll(".building"));

const signalPlan = [
  {
    id: "find",
    label: "Find",
    summary: "Find: the useful answer stays consistent across the block.",
    shopLabels: ["Menu found", "Hours found", "Listings aligned", "Rooms found", "Menu found"]
  },
  {
    id: "act",
    label: "Book or buy",
    summary: "Book or buy: every storefront presents one obvious next action.",
    shopLabels: ["Order ready", "Pickup ready", "Inquiry ready", "Booking ready", "Table ready"]
  },
  {
    id: "run",
    label: "Run the work",
    summary: "Run the work: intake reaches the person responsible for the next step.",
    shopLabels: ["Order routed", "Queue routed", "Lead routed", "Stay routed", "Booking routed"]
  },
  {
    id: "return",
    label: "Come back",
    summary: "Come back: follow-up uses only information the customer chose to share.",
    shopLabels: ["Follow-up ready", "Visit saved", "Follow-up ready", "Stay saved", "Visit saved"]
  }
];

const mediaReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
const lowPower =
  Boolean(connection?.saveData) ||
  (Number.isFinite(navigator.hardwareConcurrency) && navigator.hardwareConcurrency <= 2);

let activeSignalIndex = -1;
let playing = false;
let paused = false;
let timerId = 0;
let activationTimerId = 0;
let playedOnView = false;
let hostVisible = true;
let hostMotionPaused = false;

function clearSequenceTimer() {
  window.clearTimeout(timerId);
  timerId = 0;
}

function clearActivationTimer() {
  window.clearTimeout(activationTimerId);
  activationTimerId = 0;
}

function playbackBlocked() {
  return document.hidden || !hostVisible || hostMotionPaused;
}

function updateStateButtons(nextState) {
  stateButtons.forEach((button) => {
    const active = button.dataset.stateButton === nextState;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function resetSignals() {
  clearSequenceTimer();
  clearActivationTimer();
  stage.classList.remove("is-running");
  signalButtons.forEach((button) => button.classList.remove("is-active"));
  buildings.forEach((building) => {
    building.classList.remove("is-active");
    building.querySelector(".shop-signal").textContent =
      stage.dataset.systemState === "after" ? "Ready for a signal" : "No shared path";
  });
  activeSignalIndex = -1;
}

function setSystemState(nextState, options = {}) {
  const safeState = nextState === "after" ? "after" : "before";
  playing = false;
  paused = false;
  pauseButton.disabled = true;
  pauseButton.textContent = "Pause";
  stage.dataset.systemState = safeState;
  updateStateButtons(safeState);
  resetSignals();
  status.textContent =
    safeState === "after"
      ? "Connected: choose a signal or replay the full path."
      : "Before: each shop handles the path separately.";

  if (options.focusSignal && safeState === "after") {
    signalButtons[0]?.focus();
  }
}

function activateSignal(index) {
  const signal = signalPlan[index];
  if (!signal) return;

  clearActivationTimer();
  activeSignalIndex = index;
  stage.dataset.systemState = "after";
  updateStateButtons("after");
  stage.classList.remove("is-running");
  void stage.offsetWidth;
  stage.classList.add("is-running");

  signalButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.signal === signal.id);
  });

  buildings.forEach((building, shopIndex) => {
    building.classList.add("is-active");
    building.querySelector(".shop-signal").textContent = signal.shopLabels[shopIndex];
  });

  status.textContent = signal.summary;
  activationTimerId = window.setTimeout(() => {
    activationTimerId = 0;
    if (activeSignalIndex !== index) return;
    buildings.forEach((building) => building.classList.remove("is-active"));
  }, mediaReduced.matches ? 0 : 520);
}

function finishSequence() {
  clearSequenceTimer();
  clearActivationTimer();
  playing = false;
  paused = false;
  pauseButton.disabled = true;
  pauseButton.textContent = "Pause";
  stage.classList.remove("is-running");
  status.textContent = "Connected: the four signals now share one clear path.";
}

function scheduleNext() {
  clearSequenceTimer();
  if (!playing || paused || playbackBlocked()) return;

  const nextIndex = activeSignalIndex + 1;
  if (nextIndex >= signalPlan.length) {
    finishSequence();
    return;
  }

  activateSignal(nextIndex);
  timerId = window.setTimeout(scheduleNext, mediaReduced.matches ? 80 : 1050);
}

function playSequence() {
  setSystemState("after");
  playing = true;
  paused = false;
  pauseButton.disabled = false;
  pauseButton.textContent = "Pause";
  status.textContent = "Connecting the block.";
  scheduleNext();
}

function togglePause() {
  if (!playing) return;

  paused = !paused;
  pauseButton.textContent = paused ? "Resume" : "Pause";
  status.textContent = paused
    ? `Paused after ${signalPlan[Math.max(activeSignalIndex, 0)].label}.`
    : "Sequence resumed.";

  if (paused) {
    clearSequenceTimer();
    clearActivationTimer();
  } else {
    scheduleNext();
  }
}

function syncPlaybackLifecycle() {
  if (playbackBlocked()) {
    clearSequenceTimer();
    clearActivationTimer();
    return;
  }
  if (playing && !paused && !timerId) scheduleNext();
}

stateButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setSystemState(button.dataset.stateButton, { focusSignal: button.dataset.stateButton === "after" });
  });
});

signalButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    playing = false;
    paused = false;
    pauseButton.disabled = true;
    pauseButton.textContent = "Pause";
    clearSequenceTimer();
    activateSignal(index);
  });
});

replayButton.addEventListener("click", playSequence);
pauseButton.addEventListener("click", togglePause);

document.addEventListener("visibilitychange", syncPlaybackLifecycle);
document.addEventListener("lab:visibility", (event) => {
  hostVisible = event.detail?.active !== false;
  syncPlaybackLifecycle();
});
document.addEventListener("lab:motion", (event) => {
  hostMotionPaused = event.detail?.paused === true;
  syncPlaybackLifecycle();
});

if (mediaReduced.matches) {
  powerNote.textContent = "Reduced motion is on. Signals change without travel animation.";
} else if (lowPower) {
  powerNote.textContent = "Low-power mode detected. Tap replay when you are ready.";
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.some((entry) => entry.isIntersecting);
      if (visible && !playedOnView) {
        playedOnView = true;
        playSequence();
        observer.disconnect();
      }
    },
    { threshold: 0.55 }
  );
  observer.observe(stage);
}

setSystemState("before");
