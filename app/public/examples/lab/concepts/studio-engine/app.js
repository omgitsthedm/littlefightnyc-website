const STORAGE_KEY = "lfnyc-studio-engine-v4";
const PAYLOAD_VERSION = 4;
const APP_TITLE = "Little Fight NYC Studio Engine | Local Rules";

const MODE_LABELS = {
  quick: "Quick Mode",
  prompt: "Prompt Mode",
  dream: "Dream Mode"
};

const DEFAULT_PALETTE = {
  primary: "#ff6600",
  secondary: "#121217",
  accent: "#f2ede9"
};

const TEMPLATE_STYLES = {
  "1": {
    id: "1",
    key: "modern-grid",
    label: "Modern Grid",
    frameLabel: "MODERN GRID",
    mood: "clean / direct / conversion-led",
    headlineFont: '"Space Grotesk", sans-serif',
    radius: 28
  },
  "2": {
    id: "2",
    key: "elegant-editorial",
    label: "Elegant Editorial",
    frameLabel: "ELEGANT EDITORIAL",
    mood: "refined / composed / premium",
    headlineFont: '"Cormorant Garamond", serif',
    radius: 34
  },
  "3": {
    id: "3",
    key: "saas-sharp",
    label: "SaaS Sharp",
    frameLabel: "SAAS SHARP",
    mood: "smart / structured / productized",
    headlineFont: '"Space Grotesk", sans-serif',
    radius: 20
  },
  "4": {
    id: "4",
    key: "luxury-minimal",
    label: "Luxury Minimal",
    frameLabel: "LUXURY MINIMAL",
    mood: "quiet / premium / restrained",
    headlineFont: '"Cormorant Garamond", serif',
    radius: 36
  },
  "5": {
    id: "5",
    key: "studio-bold",
    label: "Studio Bold",
    frameLabel: "STUDIO BOLD",
    mood: "confident / creative / expressive",
    headlineFont: '"IBM Plex Mono", monospace',
    radius: 22
  },
  "6": {
    id: "6",
    key: "local-trust",
    label: "Local Trust",
    frameLabel: "LOCAL TRUST",
    mood: "credible / clear / familiar",
    headlineFont: '"Space Grotesk", sans-serif',
    radius: 24
  },
  "7": {
    id: "7",
    key: "clinic-clean",
    label: "Clinic Clean",
    frameLabel: "CLINIC CLEAN",
    mood: "calm / reassuring / clean",
    headlineFont: '"Space Grotesk", sans-serif',
    radius: 28
  },
  "8": {
    id: "8",
    key: "neo-terminal",
    label: "Neo Terminal",
    frameLabel: "NEO TERMINAL",
    mood: "coded / futuristic / high-energy",
    headlineFont: '"IBM Plex Mono", monospace',
    radius: 18
  },
  "9": {
    id: "9",
    key: "warm-hospitality",
    label: "Warm Hospitality",
    frameLabel: "WARM HOSPITALITY",
    mood: "welcoming / polished / warm",
    headlineFont: '"Cormorant Garamond", serif',
    radius: 30
  },
  "10": {
    id: "10",
    key: "high-contrast",
    label: "High Contrast",
    frameLabel: "HIGH CONTRAST",
    mood: "loud / crisp / unmistakable",
    headlineFont: '"Space Grotesk", sans-serif',
    radius: 16
  }
};

const VARIANT_CONFIGS = {
  safe: {
    id: "safe",
    label: "Safe",
    note: "Calm and reliable",
    scoreBias: 0.22,
    energy: "steady"
  },
  bold: {
    id: "bold",
    label: "Bold",
    note: "Stronger contrast and larger moves",
    scoreBias: 0.38,
    energy: "charged"
  },
  experimental: {
    id: "experimental",
    label: "Experimental",
    note: "Risk-forward and more atmospheric",
    scoreBias: 0.04,
    energy: "volatile"
  }
};

const COMMAND_EXAMPLES = [
  "Make this more premium",
  "Reduce copy by 30 percent",
  "Add trust section",
  "Focus on phone calls",
  "Switch to luxury layout"
];

const PROFILE_RULES = [
  {
    key: "med-spa",
    label: "Med Spa",
    match: ["med spa", "aesthetic", "aesthetics", "beauty", "facial", "skin", "injectable", "wellness spa"],
    template: "4",
    tone: "premium / trustworthy",
    audience: "appearance-conscious locals looking for natural-looking results and confident care",
    services: ["Injectables", "Skin renewal", "Membership care"],
    cta: "Book consultation",
    palette: { primary: "#ff7a33", secondary: "#17141c", accent: "#f7eee7" },
    offer: "Natural beauty treatments with an elevated, confidence-building experience.",
    imagery: "warm portrait lighting, stone textures, calm editorial interiors",
    heatmap: "Place verified trust proof beside the primary CTA when booking is the main action."
  },
  {
    key: "home-service",
    label: "Home Services",
    match: ["plumber", "plumbing", "hvac", "electric", "electrician", "roof", "roofing", "home service", "contractor"],
    template: "6",
    tone: "clear / urgent / trustworthy",
    audience: "busy homeowners who need fast answers and immediate confidence",
    services: ["Emergency response", "Repairs", "Maintenance plans"],
    cta: "Call now",
    palette: { primary: "#ff6600", secondary: "#10243d", accent: "#f2ede9" },
    offer: "Fast service, clean communication, and dependable follow-through.",
    imagery: "clean utility graphics, high-visibility badges, grounded neighborhood cues",
    heatmap: "Keep the phone CTA above the fold when calls are the chosen primary action."
  },
  {
    key: "legal",
    label: "Legal / Advisory",
    match: ["law", "lawyer", "attorney", "legal", "accounting", "accountant", "advisory", "consulting", "wealth"],
    template: "2",
    tone: "authoritative / composed / reassuring",
    audience: "decision-makers who want expertise to feel calm, credible, and immediate",
    services: ["Strategic guidance", "Case preparation", "Consultation intake"],
    cta: "Schedule consultation",
    palette: { primary: "#e8712a", secondary: "#121826", accent: "#f3ece5" },
    offer: "Trusted advisory support delivered with clarity and authority.",
    imagery: "editorial typography, deep surfaces, restrained highlights",
    heatmap: "Lead with a direct consultation CTA and one verified proof statement near the fold."
  },
  {
    key: "agency",
    label: "Agency / Studio",
    match: ["agency", "studio", "creative", "branding", "marketing", "design", "production"],
    template: "5",
    tone: "confident / creative / fast-moving",
    audience: "founders and operators who want sharper positioning without slow process",
    services: ["Strategy", "Creative systems", "Launch support"],
    cta: "Start the project",
    palette: { primary: "#ff6600", secondary: "#0f1014", accent: "#efe6df" },
    offer: "High-impact creative work that makes the next decision easier to say yes to.",
    imagery: "graphic framing, editorial crops, kinetic orange lighting",
    heatmap: "Keep the project CTA visible through the first scroll when it is the primary action."
  },
  {
    key: "clinic",
    label: "Clinic / Wellness",
    match: ["clinic", "dentist", "dental", "chiro", "chiropractic", "therapy", "wellness", "health", "physio"],
    template: "7",
    tone: "calm / reassuring / clean",
    audience: "people looking for trust, clarity, and an easy first step",
    services: ["New patient visits", "Treatment plans", "Ongoing care"],
    cta: "Book appointment",
    palette: { primary: "#ff6b2e", secondary: "#142021", accent: "#f4f0ea" },
    offer: "Clear care pathways that reduce friction and build trust quickly.",
    imagery: "soft surfaces, clinical brightness, approachable detail shots",
    heatmap: "Explain the care path before the FAQ so visitors know what booking involves."
  },
  {
    key: "hospitality",
    label: "Hospitality",
    match: ["hotel", "hospitality", "restaurant", "guesthouse", "cafe", "bar", "dining", "resort"],
    template: "9",
    tone: "warm / polished / inviting",
    audience: "guests who decide quickly when the atmosphere feels right",
    services: ["Experiences", "Reservations", "Group bookings"],
    cta: "Reserve now",
    palette: { primary: "#ff7e3b", secondary: "#1d1715", accent: "#f3ece2" },
    offer: "Service-led hospitality that turns curiosity into immediate reservations.",
    imagery: "warm interiors, tactile surfaces, cinematic hospitality details",
    heatmap: "Place the reservation CTA near the imagery when reservations are the primary action."
  },
  {
    key: "tattoo",
    label: "Tattoo Studio",
    match: ["tattoo", "cyberpunk", "neon", "grids", "alt", "underground"],
    template: "8",
    tone: "immersive / high-contrast / fearless",
    audience: "clients looking for a point of view, not a generic studio experience",
    services: ["Custom sessions", "Flash drops", "Artist booking"],
    cta: "Book a session",
    palette: { primary: "#ff6600", secondary: "#0b0d11", accent: "#f1e8df" },
    offer: "Striking custom work with a clear booking path and unforgettable atmosphere.",
    imagery: "neon grids, sharp chrome, atmospheric shadows, orange phosphor glow",
    heatmap: "Place verified artist work near the booking CTA so the visual claim has proof."
  },
  {
    key: "generic",
    label: "Service Business",
    match: [],
    template: "1",
    tone: "clear / modern / conversion-led",
    audience: "people who need to understand the value fast and trust the next step",
    services: ["Core offer", "Proof", "Conversion support"],
    cta: "Get started",
    palette: DEFAULT_PALETTE,
    offer: "A sharper website concept built to make the primary offer easier to trust.",
    imagery: "modern surfaces, restrained motion, branded atmosphere",
    heatmap: "Clarify the CTA hierarchy early and support it with one proof signal."
  }
];

const DEMO_DRAFT = {
  mode: "prompt",
  businessName: "",
  city: "",
  industry: "",
  primaryOffer: "",
  primaryCta: "",
  phone: "",
  email: "",
  websiteUrl: "",
  servicesText: "Injectables\nSkin renewal\nMembership care",
  templateStyle: "",
  brandPrimary: DEFAULT_PALETTE.primary,
  brandSecondary: DEFAULT_PALETTE.secondary,
  brandAccent: DEFAULT_PALETTE.accent,
  promptInput: "Luxury med spa in Scottsdale focused on natural beauty treatments.",
  dreamPrompt: ""
};

const STARTER_PREVIEWS = [
  {
    id: "northline",
    mode: "quick",
    businessName: "Northline Advisory",
    city: "Chicago",
    industry: "Financial Advisory",
    primaryOffer: "Strategic financial guidance for high-growth operators",
    primaryCta: "Schedule a strategy call",
    phone: "",
    email: "",
    websiteUrl: "",
    servicesText: "Planning\nAdvisory\nRetainer support",
    templateStyle: "2",
    brandPrimary: "#6e7cff",
    brandSecondary: "#121827",
    brandAccent: "#f3f1ea",
    promptInput: "",
    dreamPrompt: ""
  },
  {
    id: "marrow",
    mode: "quick",
    businessName: "Marrow Wellness House",
    city: "Austin",
    industry: "Wellness Clinic",
    primaryOffer: "Whole-body treatment plans with a calm booking path",
    primaryCta: "Book an intake",
    phone: "",
    email: "",
    websiteUrl: "",
    servicesText: "Diagnostics\nTreatment plans\nFollow-up care",
    templateStyle: "7",
    brandPrimary: "#53c5b9",
    brandSecondary: "#112324",
    brandAccent: "#f3efe8",
    promptInput: "",
    dreamPrompt: ""
  },
  {
    id: "cinder",
    mode: "dream",
    businessName: "Cinder Atelier",
    city: "Los Angeles",
    industry: "Creative Studio",
    primaryOffer: "Editorial brand systems for ambitious hospitality launches",
    primaryCta: "Start the concept",
    phone: "",
    email: "",
    websiteUrl: "",
    servicesText: "Brand systems\nLaunch creative\nEditorial direction",
    templateStyle: "5",
    brandPrimary: "#d56647",
    brandSecondary: "#171315",
    brandAccent: "#f3e6dd",
    promptInput: "",
    dreamPrompt: "Moody hospitality studio with sculptural typography and ember light."
  },
  {
    id: "drift",
    mode: "quick",
    businessName: "Drift Guesthouse",
    city: "Santa Barbara",
    industry: "Hospitality",
    primaryOffer: "Design-led stays and private group bookings",
    primaryCta: "Reserve now",
    phone: "",
    email: "",
    websiteUrl: "",
    servicesText: "Rooms\nEvents\nPrivate stays",
    templateStyle: "9",
    brandPrimary: "#82a7c9",
    brandSecondary: "#19161a",
    brandAccent: "#f7efe6",
    promptInput: "",
    dreamPrompt: ""
  },
  {
    id: "atlas",
    mode: "quick",
    businessName: "Atlas Home Response",
    city: "Denver",
    industry: "Home Services",
    primaryOffer: "Emergency electrical service with instant trust cues",
    primaryCta: "Call now",
    phone: "",
    email: "",
    websiteUrl: "",
    servicesText: "Emergency response\nInstallations\nMaintenance",
    templateStyle: "6",
    brandPrimary: "#5b8df6",
    brandSecondary: "#14223a",
    brandAccent: "#edf2fb",
    promptInput: "",
    dreamPrompt: ""
  }
];

const els = {
  appShell: document.getElementById("appShell"),
  studioForm: document.getElementById("studioForm"),
  signalPanel: document.getElementById("signalPanel"),
  modeButtons: Array.from(document.querySelectorAll("[data-mode-button]")),
  modePanels: Array.from(document.querySelectorAll("[data-mode-panel]")),
  viewportButtons: Array.from(document.querySelectorAll("[data-viewport-button]")),
  projectNameDisplay: document.getElementById("projectNameDisplay"),
  modeDisplay: document.getElementById("modeDisplay"),
  signalPercent: document.getElementById("signalPercent"),
  signalMeterFill: document.getElementById("signalMeterFill"),
  contrastButton: document.getElementById("contrastButton"),
  exportMarkdownButton: document.getElementById("exportMarkdownButton"),
  publishButton: document.getElementById("publishButton"),
  mobileWorkspace: document.querySelector(".mobile-workspace"),
  mobilePaneButtons: Array.from(document.querySelectorAll("[data-mobile-pane-button]")),
  mobilePanels: Array.from(document.querySelectorAll("[data-mobile-pane]")),
  loadDemoButton: document.getElementById("loadDemoButton"),
  sceneTitle: document.getElementById("sceneTitle"),
  liveStatus: document.getElementById("liveStatus"),
  sceneMeta: document.getElementById("sceneMeta"),
  previewMenuButton: document.getElementById("previewMenuButton"),
  previewMenu: document.getElementById("previewMenu"),
  previewLoadDemoButton: document.getElementById("previewLoadDemoButton"),
  focusSignalButton: document.getElementById("focusSignalButton"),
  aiOrbButton: document.getElementById("aiOrbButton"),
  deviceStack: document.getElementById("deviceStack"),
  brainSummary: document.getElementById("brainSummary"),
  brainStatus: document.getElementById("brainStatus"),
  decisionTone: document.getElementById("decisionTone"),
  decisionList: document.getElementById("decisionList"),
  confidenceHeadline: document.getElementById("confidenceHeadline"),
  confidenceList: document.getElementById("confidenceList"),
  variantGrid: document.getElementById("variantGrid"),
  suggestionList: document.getElementById("suggestionList"),
  outputGrid: document.getElementById("outputGrid"),
  heatmapCard: document.getElementById("heatmapCard"),
  commandPaletteButton: document.getElementById("commandPaletteButton"),
  dockFocusSignalButton: document.getElementById("dockFocusSignalButton"),
  shareButton: document.getElementById("shareButton"),
  versionHistory: document.getElementById("versionHistory"),
  commandOverlay: document.getElementById("commandOverlay"),
  closeCommandButton: document.getElementById("closeCommandButton"),
  commandForm: document.getElementById("commandForm"),
  commandInput: document.getElementById("commandInput"),
  commandSuggestions: document.getElementById("commandSuggestions"),
  commandLog: document.getElementById("commandLog"),
  loadingOverlay: document.getElementById("loadingOverlay"),
  loadingTitle: document.getElementById("loadingTitle"),
  loadingBarFill: document.getElementById("loadingBarFill"),
  loadingLog: document.getElementById("loadingLog"),
  toast: document.getElementById("toast"),
  colorValueLabels: Array.from(document.querySelectorAll("[data-color-value]")),
  optionalSignalAccordion: document.getElementById("optionalSignalAccordion"),
  styleControlAccordion: document.getElementById("styleControlAccordion")
};

const state = {
  draft: normalizeDraft({ mode: "quick" }),
  starterDraft: null,
  concept: null,
  brief: null,
  markdown: "",
  selectedVariant: "bold",
  selectedViewport: "duo",
  paletteLocked: false,
  templateLocked: false,
  highContrast: false,
  copyDensity: "standard",
  trustBoost: false,
  creativeBias: "",
  activeMobilePane: "scene",
  versions: [],
  commandHistory: [],
  autoPalette: { ...DEFAULT_PALETTE },
  autoTemplate: "1",
  snapshotHash: "",
  loadingTimerIds: [],
  refreshTimerId: null
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function titleCase(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function capitalizeFirst(value) {
  const text = String(value ?? "").trim();
  if (!text) {
    return "";
  }
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

function normalizeHex(value, fallback) {
  const candidate = String(value ?? "").trim();
  return /^#[0-9a-f]{6}$/i.test(candidate) ? candidate.toLowerCase() : fallback;
}

function normalizeUrl(value) {
  const text = String(value ?? "").trim();
  if (!text) {
    return "";
  }
  if (/^https?:\/\//i.test(text)) {
    return text;
  }
  return `https://${text}`;
}

function simplifyUrl(value) {
  return normalizeUrl(value).replace(/^https?:\/\//i, "");
}

function parseLines(value, max = 4) {
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, max);
}

function encodePayload(payload) {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodePayload(encoded) {
  let base64 = String(encoded ?? "").replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function normalizeDraft(input = {}) {
  return {
    mode: ["quick", "prompt", "dream"].includes(String(input.mode ?? "")) ? String(input.mode) : "quick",
    businessName: String(input.businessName ?? "").trim(),
    city: String(input.city ?? "").trim(),
    industry: String(input.industry ?? "").trim(),
    primaryOffer: String(input.primaryOffer ?? "").trim(),
    primaryCta: String(input.primaryCta ?? "").trim(),
    phone: String(input.phone ?? "").trim(),
    email: String(input.email ?? "").trim(),
    websiteUrl: String(input.websiteUrl ?? "").trim(),
    servicesText: String(input.servicesText ?? "").replace(/\r\n/g, "\n").replace(/\r/g, ""),
    templateStyle: String(input.templateStyle ?? "").trim(),
    brandPrimary: normalizeHex(input.brandPrimary, DEFAULT_PALETTE.primary),
    brandSecondary: normalizeHex(input.brandSecondary, DEFAULT_PALETTE.secondary),
    brandAccent: normalizeHex(input.brandAccent, DEFAULT_PALETTE.accent),
    promptInput: String(input.promptInput ?? "").replace(/\r\n/g, "\n").replace(/\r/g, ""),
    dreamPrompt: String(input.dreamPrompt ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "")
  };
}

function isCompactLayout() {
  return window.matchMedia("(max-width: 1080px)").matches;
}

function getDefaultViewport() {
  return isCompactLayout() ? "mobile" : "duo";
}

function saveState() {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      draft: state.draft,
      selectedVariant: state.selectedVariant,
      selectedViewport: state.selectedViewport,
      paletteLocked: state.paletteLocked,
      templateLocked: state.templateLocked,
      highContrast: state.highContrast,
      copyDensity: state.copyDensity,
      trustBoost: state.trustBoost,
      creativeBias: state.creativeBias,
      versions: state.versions.slice(0, 6),
      commandHistory: state.commandHistory.slice(0, 8)
    })
  );
}

function loadState() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function createSharePayload() {
  return {
    version: PAYLOAD_VERSION,
    draft: state.draft,
    settings: {
      selectedVariant: state.selectedVariant,
      selectedViewport: state.selectedViewport,
      paletteLocked: state.paletteLocked,
      templateLocked: state.templateLocked,
      highContrast: state.highContrast,
      copyDensity: state.copyDensity,
      trustBoost: state.trustBoost,
      creativeBias: state.creativeBias
    }
  };
}

function createConceptUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set("concept", encodePayload(createSharePayload()));
  return url.toString();
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.hidden = false;
  window.clearTimeout(showToast.timerId);
  showToast.timerId = window.setTimeout(() => {
    els.toast.hidden = true;
  }, 2600);
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const input = document.createElement("textarea");
    input.value = value;
    input.setAttribute("readonly", "readonly");
    input.style.position = "absolute";
    input.style.left = "-9999px";
    document.body.append(input);
    input.select();
    const copied = document.execCommand("copy");
    input.remove();
    return copied;
  }
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function readForm() {
  return normalizeDraft({
    ...Object.fromEntries(new FormData(els.studioForm).entries()),
    mode: state.draft.mode
  });
}

function hydrateForm(draft) {
  const normalized = normalizeDraft(draft);
  Object.entries(normalized).forEach(([key, value]) => {
    const field = els.studioForm.elements.namedItem(key);
    if (field) {
      field.value = value;
    }
  });
  syncColorLabels();
  syncAccordionState(normalized);
}

function syncFormFieldValue(name, value) {
  const field = els.studioForm.elements.namedItem(name);
  if (field && field.value !== value) {
    field.value = value;
  }
}

function syncAutoManagedFields(draft) {
  if (!state.templateLocked) {
    syncFormFieldValue("templateStyle", draft.templateStyle);
  }

  if (!state.paletteLocked) {
    syncFormFieldValue("brandPrimary", draft.brandPrimary);
    syncFormFieldValue("brandSecondary", draft.brandSecondary);
    syncFormFieldValue("brandAccent", draft.brandAccent);
  }

  syncColorLabels();
}

function syncColorLabels() {
  els.colorValueLabels.forEach((label) => {
    const input = els.studioForm.elements.namedItem(label.dataset.colorValue);
    if (input) {
      label.textContent = String(input.value).toUpperCase();
    }
  });
}

function syncAccordionState(draft) {
  const hasOptionalSignal = Boolean(draft.phone || draft.email || draft.websiteUrl || draft.servicesText.trim());
  if (hasOptionalSignal) {
    els.optionalSignalAccordion.open = true;
  }

  if (state.paletteLocked || state.templateLocked) {
    els.styleControlAccordion.open = true;
  }
}

function setMode(mode, options = {}) {
  const nextMode = ["quick", "prompt", "dream"].includes(mode) ? mode : "quick";
  state.draft.mode = nextMode;

  els.modeButtons.forEach((button) => {
    const active = button.dataset.modeButton === nextMode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });

  els.modePanels.forEach((panel) => {
    panel.hidden = panel.dataset.modePanel !== nextMode;
  });

  if (options.focus) {
    focusSignalInput();
  }
}

function setViewport(viewport) {
  const nextViewport = ["desktop", "mobile", "duo"].includes(viewport) ? viewport : "duo";
  state.selectedViewport = isCompactLayout() && nextViewport === "duo" ? "mobile" : nextViewport;
  els.viewportButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.viewportButton === state.selectedViewport);
  });
  if (state.concept) {
    renderScene();
  }
  saveState();
}

function setMobilePane(pane, options = {}) {
  const nextPane = ["scene", "signal", "brain"].includes(String(pane)) ? String(pane) : "scene";
  state.activeMobilePane = nextPane;
  els.appShell.dataset.mobilePane = nextPane;

  els.mobilePaneButtons.forEach((button) => {
    const active = button.dataset.mobilePaneButton === nextPane;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
  });

  els.mobilePanels.forEach((panel) => {
    const active = panel.dataset.mobilePane === nextPane;
    panel.setAttribute("aria-hidden", String(isCompactLayout() && !active));
  });

  if (options.reveal && isCompactLayout()) {
    const activePanel = els.mobilePanels.find((panel) => panel.dataset.mobilePane === nextPane);
    window.requestAnimationFrame(() => {
      activePanel?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start"
      });
    });
  }
}

function setVariant(variant) {
  state.selectedVariant = VARIANT_CONFIGS[variant] ? variant : "bold";
  if (state.concept) {
    renderBrain();
    renderScene();
    queueSnapshot("Variant change");
  }
  saveState();
}

function setHighContrast(enabled) {
  state.highContrast = Boolean(enabled);
  document.body.classList.toggle("high-contrast", state.highContrast);
  els.contrastButton.textContent = state.highContrast ? "Standard Contrast" : "High Contrast";
  saveState();
}

function setMenuOpen(isOpen) {
  els.previewMenu.hidden = !isOpen;
  els.previewMenuButton.setAttribute("aria-expanded", String(isOpen));
}

function setCommandOpen(isOpen) {
  els.commandOverlay.hidden = !isOpen;
  document.body.classList.toggle("command-open", isOpen);
  if (isOpen) {
    window.setTimeout(() => els.commandInput.focus(), 50);
  }
}

function focusSignalInput() {
  if (isCompactLayout()) {
    setMobilePane("signal");
  }
  els.signalPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  const fieldId =
    state.draft.mode === "prompt" ? "promptInput" : state.draft.mode === "dream" ? "dreamPrompt" : "businessName";
  const field = document.getElementById(fieldId);
  if (field) {
    field.focus();
  }
}

function getSignalText(draft) {
  if (draft.mode === "prompt") {
    return [draft.promptInput, draft.servicesText, draft.websiteUrl].filter(Boolean).join(" ");
  }
  if (draft.mode === "dream") {
    return [draft.dreamPrompt, draft.servicesText].filter(Boolean).join(" ");
  }
  return [draft.businessName, draft.city, draft.industry, draft.primaryOffer, draft.primaryCta, draft.servicesText]
    .filter(Boolean)
    .join(" ");
}

function detectProfile(text) {
  const lower = String(text ?? "").toLowerCase();
  let bestProfile = PROFILE_RULES[PROFILE_RULES.length - 1];
  let bestScore = 0;

  PROFILE_RULES.forEach((profile) => {
    const score = profile.match.reduce((sum, term) => sum + (lower.includes(term) ? 1 : 0), 0);
    if (score > bestScore) {
      bestProfile = profile;
      bestScore = score;
    }
  });

  return bestProfile;
}

function extractCity(text) {
  const source = String(text ?? "").trim();
  if (!source) {
    return "";
  }

  const patterns = [
    /\bin\s+([a-z][a-z\s-]{1,28}?)(?=\s+(focused on|focuses on|specializing in|specializes in|with|for|serving)\b|[,.]|$)/i,
    /\bserving\s+([a-z][a-z\s-]{1,28}?)(?=\s+(focused on|with|for)\b|[,.]|$)/i
  ];

  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (match?.[1]) {
      return titleCase(match[1].replace(/\s+/g, " "));
    }
  }

  return "";
}

function extractFocus(text) {
  const source = String(text ?? "").trim();
  if (!source) {
    return "";
  }

  const patterns = [
    /\bfocused on\s+([^.,]+)/i,
    /\bfocuses on\s+([^.,]+)/i,
    /\bspecializing in\s+([^.,]+)/i,
    /\bspecializes in\s+([^.,]+)/i,
    /\bwith\s+([^.,]+)/i
  ];

  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (match?.[1]) {
      return match[1].trim().replace(/\s+/g, " ");
    }
  }

  return "";
}

function generateName(profile, city, mode, signal) {
  if (profile.key === "med-spa") {
    return city ? `${city} Aesthetics House` : "Aura Aesthetics";
  }
  if (profile.key === "home-service") {
    return city ? `${city} Home Response` : "Rapid Response Home Services";
  }
  if (profile.key === "legal") {
    return city ? `${city} Counsel Group` : "Northline Counsel";
  }
  if (profile.key === "agency") {
    return city ? `${city} Signal Studio` : "Signal Foundry";
  }
  if (profile.key === "clinic") {
    return city ? `${city} Wellness Practice` : "Calmline Wellness";
  }
  if (profile.key === "hospitality") {
    return city ? `${city} Guesthouse` : "House of Service";
  }
  if (profile.key === "tattoo") {
    return city ? `${city} Neon Ritual` : "Neon Ritual Studio";
  }
  if (mode === "dream" && signal) {
    return `${titleCase(signal.split(" ").slice(0, 2).join(" "))} Studio`;
  }
  return city ? `${city} Service Studio` : "Future Service Co.";
}

function shortSentence(value, fallback, max = 140) {
  const text = String(value ?? "").trim();
  if (!text) {
    return fallback;
  }
  return text.length > max ? `${text.slice(0, Math.max(max - 3, 12)).trim()}...` : text;
}

function loadStarterDraft() {
  const storageKey = "lfnyc-starter-preview-id";
  const existingId = window.sessionStorage.getItem(storageKey);
  const existing = STARTER_PREVIEWS.find((item) => item.id === existingId);
  const selected = existing || STARTER_PREVIEWS[0];
  window.sessionStorage.setItem(storageKey, selected.id);
  return normalizeDraft(selected);
}

function getDisplayCity(city) {
  return city === "Your City" ? "" : city;
}

function analyzeSignal(draft) {
  const signalText = getSignalText(draft);
  const profile = detectProfile(signalText);
  const inferredCity = draft.city || extractCity(signalText) || "";
  const inferredBusinessName = draft.businessName || generateName(profile, inferredCity, draft.mode, signalText);
  const inferredIndustry = draft.industry || profile.label;
  const extractedFocus = extractFocus(signalText);
  const inferredOffer = draft.primaryOffer || extractedFocus || profile.offer;
  const inferredCta = draft.primaryCta || profile.cta;
  const inferredServices = parseLines(draft.servicesText, 4);
  const services = inferredServices.length ? inferredServices : profile.services;
  const audience = profile.audience;
  const templateStyle = draft.templateStyle || profile.template;

  return {
    signalText,
    profile,
    city: inferredCity || "Your City",
    businessName: inferredBusinessName,
    industry: inferredIndustry,
    offer: inferredOffer,
    cta: inferredCta,
    services,
    audience,
    templateStyle,
    imagery: profile.imagery
  };
}

function getTemplateConfig(styleId) {
  return TEMPLATE_STYLES[String(styleId)] || TEMPLATE_STYLES["1"];
}

function getVariantConfig(variantId) {
  return VARIANT_CONFIGS[variantId] || VARIANT_CONFIGS.bold;
}

function calculateConfidences(input) {
  const hero = clamp(
    34 +
      (input.businessName ? 18 : 0) +
      (input.industry ? 14 : 0) +
      (input.offer ? 18 : 0) +
      (input.city ? 8 : 0) +
      (input.mode !== "quick" && input.signalText ? 8 : 0),
    28,
    98
  );

  const services = clamp(
    32 +
      input.services.length * 13 +
      (input.offer ? 12 : 0) +
      (input.industry ? 10 : 0),
    24,
    97
  );

  const proof = clamp(
    18 +
      (input.phone ? 14 : 0) +
      (input.email ? 12 : 0) +
      (input.websiteUrl ? 16 : 0) +
      (state.trustBoost ? 18 : 0) +
      (input.services.length > 0 ? 8 : 0),
    16,
    95
  );

  const faq = clamp(
    26 + (input.industry ? 16 : 0) + (input.city ? 10 : 0) + (input.offer ? 12 : 0),
    24,
    92
  );

  const contact = clamp(
    20 + (input.phone ? 24 : 0) + (input.email ? 22 : 0) + (input.websiteUrl ? 14 : 0),
    20,
    96
  );

  return { hero, services, proof, faq, contact };
}

function getConfidenceState(value) {
  if (value >= 80) {
    return "high";
  }
  if (value >= 60) {
    return "mid";
  }
  return "low";
}

function createHeroHeadline(profile, concept) {
  const offer = capitalizeFirst(concept.offer);
  if (profile.key === "med-spa") {
    return `${offer} with a natural, confidence-building approach.`;
  }
  if (profile.key === "home-service") {
    return `Dependable ${concept.offer.toLowerCase()} for ${getDisplayCity(concept.city) || "local"} homes.`;
  }
  if (profile.key === "legal") {
    return `${offer} with clarity, strategy, and calm guidance.`;
  }
  if (profile.key === "agency") {
    return `${offer} for brands that want a sharper first impression.`;
  }
  if (profile.key === "clinic") {
    return `${offer} with a calmer experience from first click to follow-up.`;
  }
  if (profile.key === "hospitality") {
    return `${offer} designed to turn interest into reservations.`;
  }
  if (profile.key === "tattoo") {
    return `${offer} for clients who want something unmistakably their own.`;
  }
  return `${offer} made clear, credible, and easy to act on.`;
}

function createHeroBody(profile, concept) {
  const audience = shortSentence(concept.audience, "the right clients", 110).toLowerCase();
  const trust = state.trustBoost ? " Proof and reassurance are brought forward early." : "";

  if (state.copyDensity === "compressed") {
    return `${concept.businessName} helps ${audience} with ${concept.offer.toLowerCase()} in a way that feels clear, polished, and easy to trust.${trust}`.trim();
  }

  if (state.copyDensity === "expanded") {
    return `${concept.businessName} helps ${audience} with ${concept.offer.toLowerCase()}. From the first visit, the experience is designed to feel thoughtful, well explained, and easy to move forward with.${trust}`.trim();
  }

  return `${concept.businessName} helps ${audience} with ${concept.offer.toLowerCase()}. The experience is designed to feel clear, polished, and easy to move forward with.${trust}`.trim();
}

function createProofLine(profile, concept) {
  if (profile.key === "med-spa") {
    return "Add verified treatment examples, practitioner credentials, or a real client review before publishing.";
  }
  if (profile.key === "home-service") {
    return "Add the verified service area, response process, credentials, and real reviews before publishing.";
  }
  if (profile.key === "legal") {
    return "Add verified credentials, practice details, and approved client proof before publishing.";
  }
  if (profile.key === "agency") {
    return "Add real project work, an approved client quote, or a concrete process artifact before publishing.";
  }
  if (profile.key === "clinic") {
    return "Add verified clinician credentials, care information, and approved patient proof before publishing.";
  }
  if (profile.key === "hospitality") {
    return "Add real property imagery, verified amenities, and approved guest proof before publishing.";
  }
  if (profile.key === "tattoo") {
    return "Add real artist work, studio policies, and approved client proof before publishing.";
  }
  return "Add real work, verified credentials, or an approved customer quote before publishing.";
}

function createServiceBody(service, concept, index) {
  const serviceName = service.toLowerCase();
  if (/(injectable|botox|filler)/i.test(service)) {
    return "Personalized treatments designed for balanced, natural-looking results and a confident experience.";
  }
  if (/(skin|facial|renew|laser|peel)/i.test(service)) {
    return "Treatment plans focused on tone, texture, and visible improvement without making the process feel overwhelming.";
  }
  if (/(membership|retainer|ongoing|plan)/i.test(service)) {
    return "Ongoing care that keeps progress consistent and makes repeat visits feel simple and well supported.";
  }
  if (/(emergency|response|urgent)/i.test(service)) {
    return "Fast help when timing matters, with clear updates and work that restores confidence quickly.";
  }
  if (/(repair|install|maintenance)/i.test(service)) {
    return "Reliable service focused on clear expectations, clean execution, and lasting peace of mind.";
  }
  if (/(strategy|advisory|planning|consult)/i.test(service)) {
    return "Thoughtful guidance that brings clarity to the decision, the process, and the next best move.";
  }
  if (/(custom|flash|artist|session|tattoo)/i.test(service)) {
    return "Custom work shaped around your references, comfort level, and the kind of piece you actually want to wear.";
  }
  if (/(visit|appointment|intake|care)/i.test(service)) {
    return "A smoother first step with clear expectations, thoughtful support, and a plan that feels easy to follow.";
  }
  return [
    `A clear ${serviceName} offer with the value, expectations, and next step made easy to understand.`,
    `Designed to make ${serviceName} feel approachable, worthwhile, and easy to move forward with.`,
    `Built around what people want to know before they decide to ${concept.primaryCta.toLowerCase()}.`,
    `A polished ${serviceName} experience that feels thoughtful from first click to follow-through.`
  ][index] || `A polished ${serviceName} experience that feels thoughtful from first click to follow-through.`;
}

function createFaqs(concept) {
  return [
    {
      question: "How do I get started?",
      answer: `Start with ${concept.primaryCta.toLowerCase()}, and the team will guide you toward the best fit based on your goals.`
    },
    {
      question: "Who is this best for?",
      answer: `${concept.businessName} is a strong fit for ${concept.audience}.`
    },
    {
      question: "What proof belongs here?",
      answer: concept.proofLine
    }
  ];
}

function getPreviewNavigation(profile) {
  if (profile.key === "med-spa") {
    return ["Treatments", "Results", "About", "Contact"];
  }
  if (profile.key === "home-service") {
    return ["Services", "Reviews", "About", "Contact"];
  }
  if (profile.key === "legal") {
    return ["Practice Areas", "Why Us", "FAQ", "Contact"];
  }
  if (profile.key === "agency") {
    return ["Services", "Work", "Process", "Contact"];
  }
  if (profile.key === "clinic") {
    return ["Services", "Approach", "FAQ", "Contact"];
  }
  if (profile.key === "hospitality") {
    return ["Stay", "Amenities", "Gallery", "Contact"];
  }
  if (profile.key === "tattoo") {
    return ["Artists", "Work", "FAQ", "Book"];
  }
  return ["Services", "About", "FAQ", "Contact"];
}

function getPreviewContent(profile, concept) {
  const city = getDisplayCity(concept.city);
  const base = {
    heroEyebrow: city ? `Serving ${city}` : concept.industry,
    secondaryCta: "View services",
    heroPills: [city || concept.industry, shortSentence(concept.services[0] || concept.industry, concept.industry, 24), concept.primaryCta],
    servicesHeading: "How we help",
    servicesCaption: shortSentence(concept.audience, "Clear services for the right clients", 60),
    faqHeading: "Questions clients ask",
    faqCaption: "Clear answers before the next step",
    contactHeading: "Get in touch",
    contactCaption: "Simple next steps and direct contact",
    statCards: [
      { label: "Serving", value: city || "Local clients" },
      { label: "Specialty", value: shortSentence(concept.services[0] || concept.industry, concept.industry, 24) },
      { label: "Next Step", value: shortSentence(concept.primaryCta, concept.primaryCta, 22) }
    ],
    supportCards: [
      { label: "Featured Service", value: concept.primaryOffer },
      { label: "Proof Slot", value: concept.proofLine },
      { label: "Primary Action", value: concept.primaryCta }
    ],
    whyChooseHeading: "Proof to add",
    whyChooseBody: concept.proofLine
  };

  if (profile.key === "med-spa") {
    return {
      ...base,
      heroEyebrow: city ? `Med spa in ${city}` : "Med spa",
      servicesHeading: "Popular treatments",
      servicesCaption: "Natural-looking care, clearly explained",
      faqHeading: "Questions before you book",
      contactHeading: "Start with a consultation",
      statCards: [
        { label: "Location", value: city || "Local area" },
        { label: "Approach", value: "Natural results" },
        { label: "Next Step", value: "Consultation" }
      ]
    };
  }

  if (profile.key === "home-service") {
    return {
      ...base,
      heroEyebrow: city ? `Home services in ${city}` : "Home services",
      secondaryCta: "See services",
      servicesHeading: "Services homeowners count on",
      servicesCaption: "Fast answers, dependable follow-through",
      contactHeading: "Call for fast help",
      statCards: [
        { label: "Area", value: city || "Local area" },
        { label: "Priority", value: "Fast response" },
        { label: "Next Step", value: "Call now" }
      ]
    };
  }

  if (profile.key === "legal") {
    return {
      ...base,
      heroEyebrow: city ? `${concept.industry} in ${city}` : concept.industry,
      secondaryCta: "Explore services",
      servicesHeading: "Guidance built around your next decision",
      servicesCaption: "Clear, practical support at each step",
      faqHeading: "Questions before your consultation",
      contactHeading: "Schedule a consultation",
      statCards: [
        { label: "Office", value: city || "Local office" },
        { label: "Approach", value: "Strategic counsel" },
        { label: "Next Step", value: "Consultation" }
      ]
    };
  }

  if (profile.key === "agency") {
    return {
      ...base,
      heroEyebrow: city ? `Creative studio in ${city}` : "Creative studio",
      secondaryCta: "See services",
      servicesHeading: "Services built to sharpen the story",
      servicesCaption: "Strategy, creative, and launch support",
      faqHeading: "Questions before you start",
      contactHeading: "Start the conversation",
      statCards: [
        { label: "Studio", value: city || "Independent" },
        { label: "Focus", value: "Sharper positioning" },
        { label: "Next Step", value: "Start project" }
      ]
    };
  }

  if (profile.key === "clinic") {
    return {
      ...base,
      heroEyebrow: city ? `Clinic in ${city}` : "Clinic care",
      servicesHeading: "Care designed to feel clear and calm",
      servicesCaption: "Treatment paths people can understand quickly",
      faqHeading: "Questions before your visit",
      contactHeading: "Book your first visit",
      statCards: [
        { label: "Location", value: city || "Local area" },
        { label: "Approach", value: "Calm care" },
        { label: "Next Step", value: "Book visit" }
      ]
    };
  }

  if (profile.key === "hospitality") {
    return {
      ...base,
      heroEyebrow: city ? `Hospitality in ${city}` : "Hospitality",
      secondaryCta: "Explore details",
      servicesHeading: "What guests can expect",
      servicesCaption: "Warm service, memorable details, and a clear booking path",
      faqHeading: "Questions before you reserve",
      contactHeading: "Reserve your stay",
      statCards: [
        { label: "Destination", value: city || "Featured location" },
        { label: "Atmosphere", value: "Warm and polished" },
        { label: "Next Step", value: "Reserve now" }
      ]
    };
  }

  if (profile.key === "tattoo") {
    return {
      ...base,
      heroEyebrow: city ? `Tattoo studio in ${city}` : "Tattoo studio",
      secondaryCta: "View work",
      servicesHeading: "What clients book most",
      servicesCaption: "Custom work, clear direction, strong artist point of view",
      faqHeading: "Questions before you book",
      contactHeading: "Book your session",
      statCards: [
        { label: "Studio", value: city || "Private studio" },
        { label: "Style", value: "Custom work" },
        { label: "Next Step", value: "Book session" }
      ]
    };
  }

  return base;
}

function buildVariantScores(profile, signalStrength, mode) {
  void profile;
  void signalStrength;
  void mode;
  return {
    safe: "Available",
    bold: "Available",
    experimental: "Available"
  };
}

function buildSuggestions(concept) {
  const suggestions = [];

  if (concept.confidences.proof < 55) {
    suggestions.push("Add a verified trust signal to complete the proof section.");
  }
  if (!state.draft.servicesText.trim()) {
    suggestions.push("Name 2 to 3 services if you want tighter service cards.");
  }
  if (!state.draft.phone.trim()) {
    suggestions.push("Add a phone number if the concept should prioritize faster contact.");
  }
  if (state.draft.mode === "prompt" && state.draft.promptInput.trim().split(" ").length < 6) {
    suggestions.push("Give the prompt a clearer niche or offer for a tighter rule match.");
  }
  if (state.draft.mode === "dream") {
    suggestions.push("Dream Mode gets stronger when you pair a mood with a business type.");
  }
  suggestions.push("Use ⌘K to mutate tone, layout, or CTA direction instantly.");

  return suggestions.slice(0, 3);
}

function buildOutputs(signalStrength) {
  void signalStrength;
  return [
    {
      label: "Landing Page",
      status: "Preview",
      detail: "Rendered in this browser"
    },
    {
      label: "Full Site",
      status: "Outline",
      detail: "Five local sections"
    },
    {
      label: "Saved View",
      status: "Ready",
      detail: "Kept in the page address"
    }
  ];
}

function buildHeatmap(profile, signalStrength) {
  void signalStrength;
  return {
    title: "CTA Placement Rule",
    body: profile.heatmap
  };
}

function buildConcept(draft) {
  const analysis = analyzeSignal(draft);
  const profile = analysis.profile;
  const template = getTemplateConfig(analysis.templateStyle);
  const variant = getVariantConfig(state.selectedVariant);
  const businessName = analysis.businessName;
  const city = analysis.city;
  const industry = analysis.industry;
  const primaryOffer = analysis.offer;
  const primaryCta = analysis.cta;
  const phone = draft.phone.trim();
  const email = draft.email.trim();
  const websiteUrl = normalizeUrl(draft.websiteUrl);
  const services = analysis.services;
  const audience = analysis.audience;

  const confidences = calculateConfidences({
    ...analysis,
    mode: draft.mode,
    phone: draft.phone,
    email: draft.email,
    websiteUrl: draft.websiteUrl
  });

  const signalStrength = Math.round(
    (confidences.hero + confidences.services + confidences.proof + confidences.faq + confidences.contact) / 5
  );
  const heroHeadline = createHeroHeadline(profile, {
    businessName,
    city,
    offer: primaryOffer
  });
  const heroBody = createHeroBody(
    profile,
    {
      businessName,
      audience,
      primaryCta,
      offer: primaryOffer
    }
  );

  const proofLine = createProofLine(profile, { businessName, websiteUrl });

  const serviceCards = services.map((service, index) => ({
    title: service,
    body: createServiceBody(service, { audience, primaryCta }, index),
    confidence: clamp(confidences.services - index * 4, 42, 96)
  }));

  const previewContent = getPreviewContent(profile, {
    businessName,
    city,
    industry,
    services,
    primaryCta,
    primaryOffer,
    audience,
    phone,
    proofLine
  });

  const faqs = createFaqs({
    businessName,
    primaryCta,
    audience,
    proofLine
  });

  const variantScores = buildVariantScores(profile, signalStrength, draft.mode);
  const suggestions = buildSuggestions({
    confidences
  });
  const outputs = buildOutputs(signalStrength);
  const heatmap = buildHeatmap(profile, signalStrength);
  const shareUrl = createConceptUrl();
  const initials = businessName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return {
    mode: draft.mode,
    modeLabel: MODE_LABELS[draft.mode],
    businessName,
    city,
    industry,
    primaryOffer,
    primaryCta,
    phone,
    email,
    websiteUrl,
    websiteHost: simplifyUrl(websiteUrl),
    services,
    audience,
    template,
    variant,
    palette: {
      primary: draft.brandPrimary,
      secondary: draft.brandSecondary,
      accent: draft.brandAccent
    },
    imagery: analysis.imagery,
    tone: profile.tone,
    structure: ["Hero", "Services", "Proof", "FAQ", "Contact"],
    heroEyebrow: previewContent.heroEyebrow,
    navItems: getPreviewNavigation(profile),
    secondaryCta: previewContent.secondaryCta,
    heroPills: previewContent.heroPills,
    servicesHeading: previewContent.servicesHeading,
    servicesCaption: previewContent.servicesCaption,
    faqHeading: previewContent.faqHeading,
    faqCaption: previewContent.faqCaption,
    contactHeading: previewContent.contactHeading,
    contactCaption: previewContent.contactCaption,
    statCards: previewContent.statCards,
    supportCards: previewContent.supportCards,
    whyChooseHeading: previewContent.whyChooseHeading,
    whyChooseBody: previewContent.whyChooseBody,
    heroHeadline,
    heroBody,
    proofLine,
    serviceCards,
    faqs,
    confidences,
    signalStrength,
    variantScores,
    suggestions,
    outputs,
    heatmap,
    shareUrl,
    initials
  };
}

function buildBrief(concept) {
  return {
    engine: "LFNYC Studio Engine",
    mode: concept.modeLabel,
    generatedAt: new Date().toISOString(),
    business: {
      name: concept.businessName,
      city: concept.city,
      industry: concept.industry,
      offer: concept.primaryOffer,
      audience: concept.audience,
      cta: concept.primaryCta
    },
    brand: {
      template: concept.template.label,
      variant: concept.variant.label,
      palette: concept.palette,
      tone: concept.tone,
      imagery: concept.imagery
    },
    reasoning: {
      structure: concept.structure,
      confidences: concept.confidences,
      heatmap: concept.heatmap,
      suggestions: concept.suggestions
    },
    outputs: concept.outputs,
    shareUrl: concept.shareUrl
  };
}

function buildMarkdown(brief) {
  return `# ${brief.business.name}

## Engine
- System: ${brief.engine}
- Mode: ${brief.mode}
- Generated: ${brief.generatedAt}

## Business Signal
- City: ${brief.business.city}
- Industry: ${brief.business.industry}
- Offer: ${brief.business.offer}
- Audience: ${brief.business.audience}
- CTA: ${brief.business.cta}

## Brand Direction
- Template: ${brief.brand.template}
- Variant: ${brief.brand.variant}
- Tone: ${brief.brand.tone}
- Imagery: ${brief.brand.imagery}
- Primary: ${brief.brand.palette.primary}
- Secondary: ${brief.brand.palette.secondary}
- Accent: ${brief.brand.palette.accent}

## Homepage Structure
${brief.reasoning.structure.map((section) => `- ${section}`).join("\n")}

## Brief Coverage
- Hero: ${brief.reasoning.confidences.hero}%
- Services: ${brief.reasoning.confidences.services}%
- Proof: ${brief.reasoning.confidences.proof}%
- FAQ: ${brief.reasoning.confidences.faq}%
- Contact: ${brief.reasoning.confidences.contact}%

## CTA Placement Rule
- Recommendation: ${brief.reasoning.heatmap.body}

## Suggestions
${brief.reasoning.suggestions.map((item) => `- ${item}`).join("\n")}

## Output Package
${brief.outputs.map((item) => `- ${item.label}: ${item.status} (${item.detail})`).join("\n")}

## Share URL
- ${brief.shareUrl}
`;
}

function renderTopbar() {
  const concept = state.concept;
  els.projectNameDisplay.textContent = concept.businessName;
  els.modeDisplay.textContent = concept.modeLabel;
  els.signalPercent.textContent = `${concept.signalStrength}%`;
  els.signalMeterFill.style.width = `${concept.signalStrength}%`;
  document.title = `${concept.businessName} / ${APP_TITLE}`;
}

function renderDecisionList(concept) {
  const items = [
    ["Tone", concept.tone],
    ["Audience", shortSentence(titleCase(concept.audience), "Primary audience", 54)],
    ["Structure", concept.structure.join(" / ")],
    ["Layout", `${concept.template.label} / ${concept.variant.label}`]
  ];

  els.decisionTone.textContent = concept.tone;
  els.decisionList.innerHTML = items
    .map(
      ([label, value]) => `
        <div class="decision-item">
          <dt>${escapeHtml(label)}</dt>
          <dd>${escapeHtml(value)}</dd>
        </div>
      `
    )
    .join("");
}

function renderConfidenceList(concept) {
  const entries = [
    ["Hero", concept.confidences.hero],
    ["Services", concept.confidences.services],
    ["Proof", concept.confidences.proof],
    ["FAQ", concept.confidences.faq],
    ["Contact", concept.confidences.contact]
  ];
  const average = Math.round(entries.reduce((sum, [, value]) => sum + value, 0) / entries.length);

  els.confidenceHeadline.textContent =
    average >= 80 ? "Brief coverage is high" : average >= 60 ? "Brief coverage is growing" : "Add details to improve coverage";
  els.confidenceList.innerHTML = entries
    .map(
      ([label, value]) => `
        <div class="confidence-item">
          <div class="confidence-row">
            <span>${escapeHtml(label)}</span>
            <strong>${value}%</strong>
          </div>
          <div class="confidence-bar ${escapeHtml(getConfidenceState(value))}">
            <span style="width:${value}%"></span>
          </div>
        </div>
      `
    )
    .join("");
}

function renderVariants(concept) {
  const scoreMap = concept.variantScores;
  els.variantGrid.innerHTML = Object.keys(VARIANT_CONFIGS)
    .map((key) => {
      const variant = VARIANT_CONFIGS[key];
      const active = key === state.selectedVariant;
      return `
        <button class="variant-card ${active ? "active" : ""}" data-variant="${escapeHtml(key)}" type="button">
          <span class="variant-label">${escapeHtml(variant.label)}</span>
          <strong>${active ? "Selected" : scoreMap[key]}</strong>
          <p>${escapeHtml(variant.note)}</p>
        </button>
      `;
    })
    .join("");
}

function renderSuggestions(concept) {
  els.suggestionList.innerHTML = concept.suggestions
    .map(
      (item) => `
        <button class="suggestion-pill" data-command="${escapeHtml(item)}" type="button">
          ${escapeHtml(item)}
        </button>
      `
    )
    .join("");
}

function renderOutputs(concept) {
  els.outputGrid.innerHTML = concept.outputs
    .map(
      (output) => `
        <article class="output-card">
          <span>${escapeHtml(output.label)}</span>
          <strong>${escapeHtml(output.status)}</strong>
          <p>${escapeHtml(output.detail)}</p>
        </article>
      `
    )
    .join("");

  els.heatmapCard.innerHTML = `
    <span class="brain-card-tag">${escapeHtml(concept.heatmap.title)}</span>
    <strong>Rule-based layout note</strong>
    <p>${escapeHtml(concept.heatmap.body)}</p>
  `;
}

function renderVersionHistory() {
  els.versionHistory.innerHTML = state.versions
    .map(
      (version) => `
        <button class="version-chip" data-version-id="${escapeHtml(version.id)}" type="button">
          <span>${escapeHtml(version.label)}</span>
          <strong>${escapeHtml(version.time)}</strong>
        </button>
      `
    )
    .join("");
}

function renderCommandSuggestions() {
  els.commandSuggestions.innerHTML = COMMAND_EXAMPLES.map(
    (command) => `
      <button class="suggestion-pill" data-command="${escapeHtml(command)}" type="button">
        ${escapeHtml(command)}
      </button>
    `
  ).join("");
}

function renderCommandLog() {
  if (!state.commandHistory.length) {
    els.commandLog.innerHTML = `<p class="command-empty">No mutations applied yet.</p>`;
    return;
  }

  els.commandLog.innerHTML = state.commandHistory
    .slice(0, 5)
    .map(
      (entry) => `
        <article class="command-log-item">
          <span>${escapeHtml(entry.command)}</span>
          <strong>${escapeHtml(entry.result)}</strong>
        </article>
      `
    )
    .join("");
}

function renderBrain() {
  const concept = state.concept;
  const confidenceAverage = Math.round(
    (concept.confidences.hero +
      concept.confidences.services +
      concept.confidences.proof +
      concept.confidences.faq +
      concept.confidences.contact) /
      5
  );

  els.brainSummary.textContent = `${concept.businessName} matches the ${concept.tone} rule set. Brief coverage is ${confidenceAverage}%.`;
  els.brainStatus.textContent =
    confidenceAverage >= 80 ? "Brief well covered" : confidenceAverage >= 60 ? "Brief taking shape" : "More detail needed";

  renderDecisionList(concept);
  renderConfidenceList(concept);
  renderVariants(concept);
  renderSuggestions(concept);
  renderOutputs(concept);
}

function renderSectionAlert(label, value) {
  if (value >= 60) {
    return "";
  }
  return `<div class="section-alert">${escapeHtml(label)} brief coverage ${value}%</div>`;
}

function renderSiteMarkup(concept) {
  const palette = concept.palette;
  const contactDetails =
    [
      concept.phone ? `<p>${escapeHtml(concept.phone)}</p>` : "",
      concept.email ? `<p>${escapeHtml(concept.email)}</p>` : "",
      concept.websiteHost ? `<p>${escapeHtml(concept.websiteHost)}</p>` : ""
    ]
      .filter(Boolean)
      .join("") || "<p>Contact details not provided. Add them in the Brief pane.</p>";
  const navItems = concept.navItems
    .map((item) => `<span>${escapeHtml(item)}</span>`)
    .join("");
  const statCards = concept.statCards
    .map(
      (item) => `
        <article>
          <span>${escapeHtml(item.label)}</span>
          <strong>${escapeHtml(item.value)}</strong>
        </article>
      `
    )
    .join("");
  const heroPills = concept.heroPills
    .map((item) => `<span>${escapeHtml(item)}</span>`)
    .join("");
  const supportCards = concept.supportCards
    .map(
      (card) => `
        <article class="hero-meta-card">
          <p class="site-kicker">${escapeHtml(card.label)}</p>
          <strong>${escapeHtml(card.value)}</strong>
        </article>
      `
    )
    .join("");
  const serviceCards = concept.serviceCards
    .map(
      (card) => `
        <article class="site-card section-shell ${escapeHtml(getConfidenceState(card.confidence))}">
          ${renderSectionAlert(card.title, card.confidence)}
          <p class="site-kicker">SERVICE</p>
          <h4>${escapeHtml(card.title)}</h4>
          <p>${escapeHtml(card.body)}</p>
        </article>
      `
    )
    .join("");

  const faqCards = concept.faqs
    .map(
      (item, index) => `
        <article class="site-card section-shell ${escapeHtml(getConfidenceState(clamp(concept.confidences.faq - index * 5, 34, 96)))}">
          ${index === 0 ? renderSectionAlert("FAQ", concept.confidences.faq) : ""}
          <p class="site-kicker">FAQ</p>
          <h4>${escapeHtml(item.question)}</h4>
          <p>${escapeHtml(item.answer)}</p>
        </article>
      `
    )
    .join("");

  return `
    <article
      class="preview-site template-${escapeHtml(concept.template.key)} variant-${escapeHtml(concept.variant.id)}"
      style="
        --concept-primary:${escapeHtml(palette.primary)};
        --concept-secondary:${escapeHtml(palette.secondary)};
        --concept-accent:${escapeHtml(palette.accent)};
        --concept-radius:${escapeHtml(String(concept.template.radius))}px;
        --concept-headline-font:${escapeHtml(concept.template.headlineFont)};
      "
    >
      <div class="site-nav">
        <div class="site-brand">
          <span class="site-mark">${escapeHtml(concept.initials)}</span>
          <div>
            <p class="site-kicker">${escapeHtml(concept.heroEyebrow)}</p>
            <strong>${escapeHtml(concept.businessName)}</strong>
          </div>
        </div>
        <div class="site-nav-links">${navItems}</div>
      </div>

      <section class="site-hero section-shell ${escapeHtml(getConfidenceState(concept.confidences.hero))}">
        ${renderSectionAlert("Hero", concept.confidences.hero)}
        <div class="site-hero-copy">
          <p class="site-kicker">${escapeHtml(concept.heroEyebrow)}</p>
          <h3>${escapeHtml(concept.heroHeadline)}</h3>
          <p>${escapeHtml(concept.heroBody)}</p>
          <div class="site-cta-row">
            <a class="site-primary-button" href="#contact">${escapeHtml(concept.primaryCta)}</a>
            <button class="site-ghost-button" type="button">${escapeHtml(concept.secondaryCta)}</button>
          </div>
          <div class="site-pill-row">${heroPills}</div>
        </div>
        <aside class="hero-orbit">
          <div class="hero-aura"></div>
          <div class="hero-stack">${supportCards}</div>
        </aside>
      </section>

      <section class="stat-row section-shell ${escapeHtml(getConfidenceState(concept.confidences.proof))}">
        ${renderSectionAlert("Proof", concept.confidences.proof)}
        ${statCards}
      </section>

      <section class="site-section">
        <div class="site-section-head">
          <div>
            <p class="site-kicker">SERVICES</p>
            <h4>${escapeHtml(concept.servicesHeading)}</h4>
          </div>
          <strong>${escapeHtml(concept.servicesCaption)}</strong>
        </div>
        <div class="site-grid site-grid-3">
          ${serviceCards}
        </div>
      </section>

      <section class="site-section">
        <div class="site-section-head">
          <div>
            <p class="site-kicker">FAQ</p>
            <h4>${escapeHtml(concept.faqHeading)}</h4>
          </div>
          <strong>${escapeHtml(concept.faqCaption)}</strong>
        </div>
        <div class="site-grid site-grid-2">
          ${faqCards}
        </div>
      </section>

      <section class="site-section" id="contact">
        <div class="site-section-head">
          <div>
            <p class="site-kicker">CONTACT</p>
            <h4>${escapeHtml(concept.contactHeading)}</h4>
          </div>
          <strong>${escapeHtml(concept.contactCaption)}</strong>
        </div>
        <div class="site-grid site-grid-contact">
          <article class="site-card section-shell ${escapeHtml(getConfidenceState(concept.confidences.contact))}">
            ${renderSectionAlert("Contact", concept.confidences.contact)}
            <p class="site-kicker">START HERE</p>
            <h4>${escapeHtml(concept.primaryCta)}</h4>
            ${contactDetails}
          </article>
          <article class="site-card site-card-contrast">
            <p class="site-kicker">${escapeHtml(concept.whyChooseHeading)}</p>
            <h4>${escapeHtml(concept.businessName)}</h4>
            <p>${escapeHtml(concept.whyChooseBody)}</p>
          </article>
        </div>
      </section>
    </article>
  `;
}

function renderDeviceFrame(concept, type) {
  if (type === "mobile") {
    return `
      <article class="device-frame device-mobile">
        <div class="device-mobile-meta">
          <span>Mobile Preview</span>
          <strong>${escapeHtml(concept.template.frameLabel)}</strong>
        </div>
        <div class="phone-shell">
          <span class="phone-side-button phone-side-button-volume" aria-hidden="true"></span>
          <span class="phone-side-button phone-side-button-action" aria-hidden="true"></span>
          <span class="phone-side-button phone-side-button-power" aria-hidden="true"></span>
          <div class="phone-screen">
            <div class="phone-topbar" aria-hidden="true">
              <span class="phone-time">9:41</span>
              <span class="phone-island"></span>
              <span class="phone-signal">5G</span>
            </div>
            <div class="device-viewport">
              ${renderSiteMarkup(concept)}
            </div>
            <div class="phone-home-indicator" aria-hidden="true"></div>
          </div>
        </div>
      </article>
    `;
  }

  return `
    <article class="device-frame device-${escapeHtml(type)}">
      <div class="device-header">
        <span>${escapeHtml(type === "desktop" ? "Desktop Preview" : "Mobile Preview")}</span>
        <strong>${escapeHtml(concept.template.frameLabel)}</strong>
      </div>
      <div class="device-viewport">
        ${renderSiteMarkup(concept)}
      </div>
    </article>
  `;
}

function renderScene() {
  const concept = state.concept;
  els.sceneTitle.textContent = `${concept.businessName} / ${concept.template.label}`;
  els.liveStatus.textContent = "LOCAL PREVIEW / ACTIVE";
  els.sceneMeta.textContent = `${concept.structure.length} sections / 3 variants / ${concept.signalStrength}% brief coverage`;

  let frames = "";
  if (state.selectedViewport === "desktop") {
    frames = renderDeviceFrame(concept, "desktop");
  } else if (state.selectedViewport === "mobile") {
    frames = renderDeviceFrame(concept, "mobile");
  } else {
    frames = `${renderDeviceFrame(concept, "desktop")}${renderDeviceFrame(concept, "mobile")}`;
  }

  els.deviceStack.dataset.layout = state.selectedViewport;
  els.deviceStack.innerHTML = frames;
}

function renderAll() {
  renderTopbar();
  renderBrain();
  renderScene();
  renderVersionHistory();
  renderCommandSuggestions();
  renderCommandLog();
}

function hasMeaningfulSignal(draft) {
  return Boolean(
    draft.businessName ||
      draft.city ||
      draft.industry ||
      draft.primaryOffer ||
      draft.primaryCta ||
      draft.promptInput ||
      draft.dreamPrompt
  );
}

function pushVersion(reason) {
  const hash = JSON.stringify({
    draft: state.draft,
    variant: state.selectedVariant,
    viewport: state.selectedViewport,
    copyDensity: state.copyDensity,
    trustBoost: state.trustBoost,
    creativeBias: state.creativeBias
  });

  if (hash === state.snapshotHash) {
    return;
  }

  state.snapshotHash = hash;

  const now = new Date();
  const label = `${state.concept.modeLabel.replace(" Mode", "")} / ${shortSentence(state.concept.businessName, "Concept")}`;
  state.versions.unshift({
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    label,
    reason,
    time: now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    draft: { ...state.draft },
    selectedVariant: state.selectedVariant,
    selectedViewport: state.selectedViewport,
    paletteLocked: state.paletteLocked,
    templateLocked: state.templateLocked,
    highContrast: state.highContrast,
    copyDensity: state.copyDensity,
    trustBoost: state.trustBoost,
    creativeBias: state.creativeBias
  });
  state.versions = state.versions.slice(0, 8);
}

function queueSnapshot(reason) {
  window.clearTimeout(queueSnapshot.timerId);
  queueSnapshot.timerId = window.setTimeout(() => {
    pushVersion(reason);
    renderVersionHistory();
    saveState();
  }, 650);
}

function syncAutoStyle(draft) {
  const analysis = analyzeSignal(draft);
  state.autoPalette = { ...analysis.profile.palette };
  state.autoTemplate = analysis.profile.template;

  if (!state.paletteLocked) {
    draft.brandPrimary = analysis.profile.palette.primary;
    draft.brandSecondary = analysis.profile.palette.secondary;
    draft.brandAccent = analysis.profile.palette.accent;
  }

  if (!state.templateLocked) {
    draft.templateStyle = analysis.profile.template;
  }

  syncAutoManagedFields(draft);
  return draft;
}

function refresh(options = {}) {
  let nextDraft = readForm();
  nextDraft.mode = state.draft.mode;
  nextDraft = normalizeDraft(nextDraft);
  state.draft = nextDraft;
  const useStarterPreview = !hasMeaningfulSignal(state.draft);

  if (!useStarterPreview) {
    nextDraft = syncAutoStyle(nextDraft);
    state.draft = nextDraft;
  } else {
    syncColorLabels();
  }

  syncAccordionState(state.draft);

  state.concept = buildConcept(useStarterPreview ? state.starterDraft : state.draft);
  state.brief = buildBrief(state.concept);
  state.markdown = buildMarkdown(state.brief);
  renderAll();
  saveState();

  if (!options.skipSnapshot && hasMeaningfulSignal(state.draft)) {
    queueSnapshot(options.reason || "Live update");
  }
}

function startForgeSequence(title, lines, onComplete) {
  state.loadingTimerIds.forEach((id) => window.clearTimeout(id));
  state.loadingTimerIds = [];
  els.loadingTitle.textContent = title;
  els.loadingBarFill.style.width = "0%";
  els.loadingLog.innerHTML = "";
  els.loadingOverlay.hidden = false;

  lines.forEach((line, index) => {
    const timerId = window.setTimeout(() => {
      const p = document.createElement("p");
      p.textContent = line;
      els.loadingLog.append(p);
      els.loadingBarFill.style.width = `${Math.round(((index + 1) / lines.length) * 100)}%`;
    }, 260 * index);
    state.loadingTimerIds.push(timerId);
  });

  const doneId = window.setTimeout(() => {
    els.loadingOverlay.hidden = true;
    onComplete?.();
  }, 260 * lines.length + 320);
  state.loadingTimerIds.push(doneId);
}

function recordCommand(command, result) {
  state.commandHistory.unshift({ command, result });
  state.commandHistory = state.commandHistory.slice(0, 8);
  renderCommandLog();
  saveState();
}

function applyPalette(primary, secondary, accent) {
  state.paletteLocked = true;
  state.draft.brandPrimary = primary;
  state.draft.brandSecondary = secondary;
  state.draft.brandAccent = accent;
  hydrateForm(state.draft);
}

function applyCommand(command) {
  const text = String(command ?? "").trim();
  if (!text) {
    return;
  }

  const lower = text.toLowerCase();
  let result = "Stored as creative bias";

  if (/(premium|luxury|elegant)/.test(lower)) {
    state.templateLocked = true;
    state.draft.templateStyle = /editorial/.test(lower) ? "2" : "4";
    result = "Shifted toward premium layout";
  }

  if (/(terminal|cyber|matrix|coded)/.test(lower)) {
    state.templateLocked = true;
    state.draft.templateStyle = "8";
    result = "Shifted to neo-terminal direction";
  }

  if (/(saas|productized)/.test(lower)) {
    state.templateLocked = true;
    state.draft.templateStyle = "3";
    result = "Shifted toward SaaS Sharp";
  }

  if (/(high contrast)/.test(lower)) {
    state.templateLocked = true;
    state.draft.templateStyle = "10";
    setHighContrast(true);
    result = "Enabled high-contrast direction";
  }

  if (/(phone|call)/.test(lower)) {
    state.draft.primaryCta = "Call now";
    result = "Prioritized phone-first CTA";
  }

  if (/(book|booking|reserve)/.test(lower)) {
    state.draft.primaryCta = /reserve/.test(lower) ? "Reserve now" : "Book now";
    result = "Switched to booking CTA";
  }

  if (/(reduce copy|less copy|shorter|30 percent)/.test(lower)) {
    state.copyDensity = "compressed";
    result = "Compressed copy density";
  }

  if (/(expand copy|more copy|tell the story|longer)/.test(lower)) {
    state.copyDensity = "expanded";
    result = "Expanded copy density";
  }

  if (/(add trust|proof|testimonial|credibility)/.test(lower)) {
    state.trustBoost = true;
    result = "Pulled trust signals forward";
  }

  if (/\bsafe\b/.test(lower)) {
    state.selectedVariant = "safe";
    result = "Switched to Safe direction";
  }

  if (/\bbold\b/.test(lower)) {
    state.selectedVariant = "bold";
    result = "Switched to Bold direction";
  }

  if (/(experimental|risk-forward|wild)/.test(lower)) {
    state.selectedVariant = "experimental";
    result = "Switched to Experimental direction";
  }

  if (/\borange\b/.test(lower)) {
    applyPalette("#ff6600", "#121217", "#f2ede9");
    result = "Locked orange palette";
  }

  if (/\bblue\b/.test(lower)) {
    applyPalette("#2f6fff", "#0f1830", "#ecf1ff");
    result = "Locked blue palette";
  }

  if (/\bedit info\b/.test(lower)) {
    focusSignalInput();
    result = "Focused signal input";
  }

  state.creativeBias = titleCase(text);
  hydrateForm(state.draft);
  refresh({ reason: "Command mutation" });
  recordCommand(text, result);
  setCommandOpen(false);
  showToast(result);
}

function restoreVersion(versionId) {
  const match = state.versions.find((version) => version.id === versionId);
  if (!match) {
    return;
  }

  state.draft = normalizeDraft(match.draft);
  state.selectedVariant = match.selectedVariant || "bold";
  state.selectedViewport = match.selectedViewport || "duo";
  state.paletteLocked = Boolean(match.paletteLocked);
  state.templateLocked = Boolean(match.templateLocked);
  state.copyDensity = match.copyDensity || "standard";
  state.trustBoost = Boolean(match.trustBoost);
  state.creativeBias = match.creativeBias || "";
  setHighContrast(Boolean(match.highContrast));
  setMode(state.draft.mode);
  hydrateForm(state.draft);
  setViewport(state.selectedViewport);
  refresh({ skipSnapshot: true });
  showToast(`Restored ${match.label}`);
}

function exportMarkdown() {
  const filename = `${slugify(state.concept.businessName || "lfnyc-concept")}-brief.md`;
  downloadFile(filename, state.markdown, "text/markdown;charset=utf-8");
  showToast("Markdown exported");
}

function shareConcept() {
  const shareUrl = state.concept.shareUrl;
  const shareData = {
    title: APP_TITLE,
    text: APP_TITLE,
    url: shareUrl
  };

  if (navigator.share) {
    navigator
      .share(shareData)
      .then(() => {
        showToast("Share sheet opened");
      })
      .catch(async (error) => {
        if (error?.name === "AbortError") {
          return;
        }
        const copied = await copyText(shareUrl);
        showToast(copied ? "Share link copied" : "Share link ready");
      });
    return;
  }

  copyText(shareUrl).then((copied) => {
    showToast(copied ? "Share link copied" : "Share link ready");
  });
}

function saveShareLink() {
  const shareUrl = state.concept.shareUrl;
  window.history.replaceState({}, "", shareUrl);
  showToast("This view is now kept in the page address");
}

function loadDemo() {
  state.paletteLocked = false;
  state.templateLocked = false;
  state.copyDensity = "standard";
  state.trustBoost = false;
  state.creativeBias = "";
  state.selectedVariant = "bold";
  state.selectedViewport = getDefaultViewport();
  state.draft = normalizeDraft(DEMO_DRAFT);
  setMode("prompt");
  hydrateForm(state.draft);
  setViewport(state.selectedViewport);
  refresh({ reason: "Demo load" });
  setMobilePane("scene");
  showToast("Fictional sample loaded");
}

function restoreFromUrl() {
  const encoded = new URLSearchParams(window.location.search).get("concept");
  if (!encoded) {
    return false;
  }

  try {
    const payload = decodePayload(encoded);
    const settings = payload.settings ?? {};
    state.draft = normalizeDraft(payload.draft ?? {});
    state.selectedVariant = VARIANT_CONFIGS[settings.selectedVariant] ? settings.selectedVariant : "bold";
    state.selectedViewport = ["desktop", "mobile", "duo"].includes(settings.selectedViewport)
      ? settings.selectedViewport
      : "duo";
    state.paletteLocked = Boolean(settings.paletteLocked);
    state.templateLocked = Boolean(settings.templateLocked);
    state.copyDensity = settings.copyDensity || "standard";
    state.trustBoost = Boolean(settings.trustBoost);
    state.creativeBias = String(settings.creativeBias ?? "");
    setHighContrast(Boolean(settings.highContrast));
    setMode(state.draft.mode);
    hydrateForm(state.draft);
    setViewport(state.selectedViewport);
    refresh({ skipSnapshot: true });
    return true;
  } catch {
    return false;
  }
}

function handleFormInput(event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) {
    return;
  }

  if (target.name === "brandPrimary" || target.name === "brandSecondary" || target.name === "brandAccent") {
    state.paletteLocked = true;
    syncColorLabels();
  }

  if (target.name === "templateStyle") {
    state.templateLocked = Boolean(target.value);
  }

  window.clearTimeout(state.refreshTimerId);
  state.refreshTimerId = window.setTimeout(() => {
    refresh();
  }, 120);
}

function init() {
  renderCommandSuggestions();
  state.starterDraft = loadStarterDraft();
  setMode("quick");
  setViewport(getDefaultViewport());
  setMobilePane("scene");

  const restoredFromUrl = restoreFromUrl();
  if (!restoredFromUrl) {
    const saved = loadState();
    if (saved?.draft) {
      state.draft = normalizeDraft(saved.draft);
      state.selectedVariant = VARIANT_CONFIGS[saved.selectedVariant] ? saved.selectedVariant : "bold";
      state.selectedViewport = ["desktop", "mobile", "duo"].includes(saved.selectedViewport) ? saved.selectedViewport : "duo";
      state.paletteLocked = Boolean(saved.paletteLocked);
      state.templateLocked = Boolean(saved.templateLocked);
      state.copyDensity = saved.copyDensity || "standard";
      state.trustBoost = Boolean(saved.trustBoost);
      state.creativeBias = String(saved.creativeBias ?? "");
      state.versions = Array.isArray(saved.versions) ? saved.versions : [];
      state.commandHistory = Array.isArray(saved.commandHistory) ? saved.commandHistory : [];
      setHighContrast(Boolean(saved.highContrast));
      setMode(state.draft.mode);
      hydrateForm(state.draft);
      setViewport(state.selectedViewport);
    } else {
      hydrateForm(state.draft);
    }
    refresh({ skipSnapshot: true });
  }

  if (!state.versions.length) {
    pushVersion("Boot");
    renderVersionHistory();
  }

  renderCommandLog();
  renderCommandSuggestions();
  els.appShell.classList.add("booted");

  els.modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setMode(button.dataset.modeButton, { focus: true });
      refresh({ reason: "Mode change" });
    });
  });

  els.viewportButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setViewport(button.dataset.viewportButton);
    });
  });

  els.mobilePaneButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setMobilePane(button.dataset.mobilePaneButton, { reveal: true });
    });
  });

  els.mobileWorkspace.addEventListener("keydown", (event) => {
    const activeIndex = els.mobilePaneButtons.indexOf(document.activeElement);
    if (activeIndex < 0 || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const lastIndex = els.mobilePaneButtons.length - 1;
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? lastIndex
          : event.key === "ArrowRight"
            ? (activeIndex + 1) % els.mobilePaneButtons.length
            : (activeIndex - 1 + els.mobilePaneButtons.length) % els.mobilePaneButtons.length;
    const nextButton = els.mobilePaneButtons[nextIndex];
    setMobilePane(nextButton.dataset.mobilePaneButton, { reveal: true });
    nextButton.focus();
  });

  els.studioForm.addEventListener("input", handleFormInput);
  els.loadDemoButton.addEventListener("click", loadDemo);
  els.previewLoadDemoButton.addEventListener("click", () => {
    setMenuOpen(false);
    loadDemo();
  });
  els.publishButton.addEventListener("click", saveShareLink);
  els.shareButton.addEventListener("click", loadDemo);
  els.exportMarkdownButton.addEventListener("click", loadDemo);
  els.previewMenuButton.addEventListener("click", () => {
    setMenuOpen(els.previewMenu.hidden);
  });
  els.focusSignalButton.addEventListener("click", () => {
    setMenuOpen(false);
    focusSignalInput();
  });
  els.dockFocusSignalButton.addEventListener("click", focusSignalInput);
  els.aiOrbButton.addEventListener("click", () => setCommandOpen(true));
  els.commandPaletteButton.addEventListener("click", () => setCommandOpen(true));
  els.closeCommandButton.addEventListener("click", () => setCommandOpen(false));
  els.contrastButton.addEventListener("click", () => setHighContrast(!state.highContrast));

  els.commandForm.addEventListener("submit", (event) => {
    event.preventDefault();
    applyCommand(els.commandInput.value);
    els.commandInput.value = "";
  });

  els.commandSuggestions.addEventListener("click", (event) => {
    const target = event.target.closest("[data-command]");
    if (!target) {
      return;
    }
    applyCommand(target.dataset.command);
  });

  els.suggestionList.addEventListener("click", (event) => {
    const target = event.target.closest("[data-command]");
    if (!target) {
      return;
    }
    applyCommand(target.dataset.command);
  });

  els.variantGrid.addEventListener("click", (event) => {
    const target = event.target.closest("[data-variant]");
    if (!target) {
      return;
    }
    setVariant(target.dataset.variant);
  });

  els.versionHistory.addEventListener("click", (event) => {
    const target = event.target.closest("[data-version-id]");
    if (!target) {
      return;
    }
    restoreVersion(target.dataset.versionId);
  });

  document.addEventListener("click", (event) => {
    if (
      !els.previewMenu.hidden &&
      !els.previewMenu.contains(event.target) &&
      !els.previewMenuButton.contains(event.target)
    ) {
      setMenuOpen(false);
    }

    if (!els.commandOverlay.hidden && event.target === els.commandOverlay) {
      setCommandOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      setCommandOpen(!els.commandOverlay.hidden ? false : true);
    }

    if (event.key === "Escape") {
      setMenuOpen(false);
      setCommandOpen(false);
    }
  });

  window.addEventListener("resize", () => {
    if (isCompactLayout() && state.selectedViewport === "duo") {
      setViewport("mobile");
    }
    setMobilePane(state.activeMobilePane);
  });
}

init();
