const SNAPSHOT_ATTRIBUTE = "data-lf-route-snapshot";
const MOUNT_ATTRIBUTE = "data-lf-route-mount";

type PublicRouteState = {
  root: HTMLElement;
  mount: HTMLElement;
  snapshot: HTMLElement | null;
  observer: MutationObserver | null;
  changedControls: Map<string, SnapshotControl>;
  pendingForm: ".lf-website-check__form" | ".lf-audit__form" | null;
  pendingAction: string | null;
  pendingFeatureProofStep: FeatureProofStep | null;
  activePointers: Set<number>;
  activeKeys: Set<string>;
  releaseRequested: boolean;
  releaseTimer: number | null;
};

type FeatureProofStep = {
  proof: string;
  step: string;
};

let state: PublicRouteState | null = null;

type FormControl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

type SnapshotControl = {
  source: FormControl;
  id: string;
  name: string;
  value: string;
  checked?: boolean;
  blurred: boolean;
};

function isFormControl(target: EventTarget | null): target is FormControl {
  return target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement;
}

function controlKey(control: FormControl): string | null {
  if (control.name) return `name:${control.name}`;
  if (control.id) return `id:${control.id}`;
  return null;
}

function isCheckable(control: HTMLInputElement): boolean {
  return control.type === "checkbox" || control.type === "radio";
}

function hasChangedFromStaticDefault(control: FormControl): boolean {
  if (control instanceof HTMLInputElement) {
    if (control.type === "file") return false;
    return isCheckable(control)
      ? control.checked !== control.defaultChecked
      : control.value !== control.defaultValue;
  }
  if (control instanceof HTMLTextAreaElement) {
    return control.value !== control.defaultValue;
  }
  // A single select implicitly chooses its first option even when no option
  // has a selected attribute. Let the browser restore a detached copy's real
  // defaults, so that implicit choice is not mistaken for visitor input.
  const defaultSelect = control.cloneNode(true) as HTMLSelectElement;
  const defaultForm = document.createElement("form");
  defaultForm.appendChild(defaultSelect);
  defaultForm.reset();
  return Array.from(control.options).some(
    (option, index) => option.selected !== defaultSelect.options[index].selected,
  );
}

function rememberChangedControl(control: FormControl, blurred = false) {
  if (!state?.snapshot || !state.snapshot.contains(control)) return;
  if (control instanceof HTMLInputElement && control.type === "file") return;
  const key = controlKey(control);
  if (!key) return;
  state.changedControls.set(key, {
    source: control,
    id: control.id,
    name: control.name,
    value: control.value,
    blurred,
    ...(control instanceof HTMLInputElement && isCheckable(control)
      ? { checked: control.checked }
      : {}),
  });
}

function captureSnapshotControl(event: Event) {
  if (!isFormControl(event.target)) return;
  rememberChangedControl(event.target);
}

function captureSnapshotBlur(event: Event) {
  if (!isFormControl(event.target)) return;
  // Only replay validation for a field the visitor actually edited. Simply
  // tabbing through an untouched initial document must not create errors.
  const key = controlKey(event.target);
  if (hasChangedFromStaticDefault(event.target) || (key && state?.changedControls.has(key))) {
    rememberChangedControl(event.target, true);
  }
}

function clearPendingProofBusy() {
  state?.snapshot?.querySelectorAll('[data-feature-proof-step][aria-busy]')
    .forEach(tab => tab.removeAttribute("aria-busy"));
}

function cancelPendingForm() {
  if (!state?.snapshot || !state.pendingForm) return;
  // The last explicit action wins, including a privacy choice made after
  // submitting. Keep the form editable when that pending intent is replaced.
  const form = state.snapshot.querySelector<HTMLFormElement>(state.pendingForm);
  form?.setAttribute("aria-busy", "false");
  const submit = form?.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (submit) submit.disabled = false;
  const status = form?.querySelector(".lf-website-check__status, .lf-audit__submit-status");
  if (status) status.textContent = "Your details are kept here. Submit when you’re ready.";
  state.pendingForm = null;
}

function captureSnapshotPointerDown(event: PointerEvent) {
  // A press is not an activation. Retain its real DOM target until the
  // browser finishes the click (or cancellation), without choosing an action.
  state?.activePointers.add(event.pointerId);
}

function captureSnapshotKeyDown(event: KeyboardEvent) {
  if ((event.key === "Enter" || event.key === " ") && event.target instanceof Element &&
    event.target.closest("button, summary, a")) state?.activeKeys.add(event.key);
}

function finishSnapshotPress() {
  if (!state?.snapshot) return;
  if (state.releaseTimer !== null) window.clearTimeout(state.releaseTimer);
  // Native click/default activation follows pointerup or keyup. A macrotask
  // lets that actual activation finish before replacing its target node.
  state.releaseTimer = window.setTimeout(() => {
    if (!state) return;
    state.releaseTimer = null;
    if (state.releaseRequested) releaseSnapshot();
  }, 0);
}

function captureSnapshotPointerEnd(event: PointerEvent) {
  if (!state?.activePointers.delete(event.pointerId)) return;
  finishSnapshotPress();
}

function captureSnapshotKeyUp(event: KeyboardEvent) {
  if (!state?.activeKeys.delete(event.key)) return;
  finishSnapshotPress();
}

function cancelSnapshotPresses() {
  if (!state?.snapshot) return;
  state.activePointers.clear();
  state.activeKeys.clear();
  finishSnapshotPress();
}

function captureSnapshotAction(event: Event) {
  if (!state?.snapshot || !(event.target instanceof Element)) return;
  const button = event.target.closest("button");
  if (!button || !state.snapshot.contains(button)) return;

  // A feature-proof tab has no native behavior in the static response. Keep
  // the visitor's explicit choice and replay it through the mounted React
  // handler, just like the header and privacy controls below.
  const featureProof = button.closest<HTMLElement>("[data-feature-proof]");
  const featureProofStep = button.getAttribute("data-feature-proof-step");
  const featureProofKey = featureProof?.dataset.featureProof;
  if (featureProofKey && featureProofStep !== null) {
    event.preventDefault();
    event.stopPropagation();
    clearPendingProofBusy();
    if (state.pendingAction) state.snapshot.querySelector(state.pendingAction)?.removeAttribute("aria-busy");
    state.pendingAction = null;
    cancelPendingForm();
    state.pendingFeatureProofStep = { proof: featureProofKey, step: featureProofStep };
    button.setAttribute("aria-busy", "true");
    return;
  }

  const selector = [".lf-nav__toggle", ".lf-nav__phone--chooser", ".lf-quiet-foot__privacy-button"]
    .find((candidate) => button.matches(candidate));
  if (!selector) return;
  // The snapshot exposes the same controls as the finished page. Remember
  // an explicit activation until its corresponding live handler is ready.
  event.preventDefault();
  event.stopPropagation();
  clearPendingProofBusy();
  if (state.pendingAction) state.snapshot.querySelector(state.pendingAction)?.removeAttribute("aria-busy");
  cancelPendingForm();
  state.pendingFeatureProofStep = null;
  state.pendingAction = selector;
  button.setAttribute("aria-busy", "true");
}

function captureSnapshotSubmit(event: Event) {
  const form = event.target;
  if (!state?.snapshot || !(form instanceof HTMLFormElement) ||
    !form.matches(".lf-website-check__form, .lf-audit__form")) return;
  // A real submit while the leaf is loading must retain the entered values.
  // Both acquisition forms must reach their actual validation/submission
  // handler exactly once. Typing alone never queues a submission.
  event.preventDefault();
  event.stopPropagation();
  if (state.pendingForm) return;
  clearPendingProofBusy();
  if (state.pendingAction) state.snapshot.querySelector(state.pendingAction)?.removeAttribute("aria-busy");
  state.pendingAction = null;
  state.pendingFeatureProofStep = null;
  captureControlsChangedBeforeBootstrap(form);
  state.pendingForm = form.matches(".lf-audit__form") ? ".lf-audit__form" : ".lf-website-check__form";
  form.setAttribute("aria-busy", "true");
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (button) button.disabled = true;
  const status = form.querySelector(".lf-website-check__status, .lf-audit__submit-status");
  if (status) status.textContent = "Opening the form. Your details are kept here.";
}

function captureControlsChangedBeforeBootstrap(snapshot: HTMLElement) {
  snapshot
    .querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      "input, textarea, select",
    )
    .forEach((control) => {
      if (hasChangedFromStaticDefault(control)) {
        rememberChangedControl(control, document.activeElement !== control);
      }
    });
}

function matchingMountedControl(identity: Pick<SnapshotControl, "id" | "name">): FormControl | null {
  if (!state) return null;
  return Array.from(
    state.mount.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      "input, textarea, select",
    ),
  ).find((control) =>
    (identity.name && control.name === identity.name) ||
    (identity.id && control.id === identity.id),
  ) ?? null;
}

function setMountedControl(control: FormControl, record: SnapshotControl) {
  if (control instanceof HTMLInputElement && control.type === "file") return;
  if (
    control instanceof HTMLInputElement &&
    isCheckable(control) &&
    record.checked !== undefined
  ) {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "checked")?.set;
    setter?.call(control, record.checked);
    control.dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }

  const prototype = control instanceof HTMLTextAreaElement
    ? HTMLTextAreaElement.prototype
    : control instanceof HTMLSelectElement
      ? HTMLSelectElement.prototype
      : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
  setter?.call(control, record.value);
  control.dispatchEvent(new Event("input", { bubbles: true }));
  if (control instanceof HTMLSelectElement) {
    control.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

function handOffChangedControls(): { focusedControl: FormControl | null; blurredControls: FormControl[] } {
  if (!state) return { focusedControl: null, blurredControls: [] };
  // Focusing a field is an intentional, in-progress interaction even before
  // the owner has changed its default. Preserve that target by identity, but
  // do not copy an untouched default or manufacture an input event.
  const active = document.activeElement;
  let focusedControl = isFormControl(active) && state.snapshot?.contains(active)
    ? matchingMountedControl(active)
    : null;
  const blurredControls: FormControl[] = [];
  for (const record of state.changedControls.values()) {
    const mounted = matchingMountedControl(record);
    if (!mounted) continue;
    setMountedControl(mounted, record);
    if (document.activeElement === record.source) focusedControl = mounted;
    else if (record.blurred) blurredControls.push(mounted);
  }
  state.changedControls.clear();
  return { focusedControl, blurredControls };
}

function normalizedAnchorHref(anchor: HTMLAnchorElement): string | null {
  try {
    return new URL(anchor.getAttribute("href") ?? "", document.baseURI).href;
  } catch {
    return null;
  }
}

function handOffDisclosures(): HTMLElement | null {
  if (!state?.snapshot) return null;
  // Native details work before any JavaScript arrives. Match only explicitly
  // named disclosures shared by the two documents; never assume DOM order or
  // React-generated IDs are stable. Keep both opened and re-closed choices.
  const mounted = new Map<string, HTMLDetailsElement[]>();
  for (const details of state.mount.querySelectorAll<HTMLDetailsElement>("details[data-lf-disclosure]")) {
    const key = details.dataset.lfDisclosure;
    if (!key) continue;
    mounted.set(key, [...(mounted.get(key) ?? []), details]);
  }
  const active = document.activeElement;
  let focusedTarget: HTMLElement | null = null;
  for (const source of state.snapshot.querySelectorAll<HTMLDetailsElement>("details[data-lf-disclosure]")) {
    const key = source.dataset.lfDisclosure;
    const targets = key ? mounted.get(key) : null;
    // A handoff must be exact. Do not move focus to an arbitrary duplicate
    // disclosure if a page ever renders the same key more than once.
    if (!targets || targets.length !== 1) continue;
    const target = targets[0];
    target.open = source.open;
    const sourceSummary = source.querySelector<HTMLElement>(":scope > summary");
    if (sourceSummary && sourceSummary === active) {
      focusedTarget = target.querySelector<HTMLElement>(":scope > summary");
      continue;
    }
    // Owner-action links in an opened native disclosure are already usable
    // before React mounts. Match only a unique equivalent href inside the
    // same named disclosure; never infer a target from text or DOM position.
    if (!(active instanceof HTMLAnchorElement) || !source.contains(active)) continue;
    const sourceHref = normalizedAnchorHref(active);
    if (!sourceHref) continue;
    const matches = Array.from(target.querySelectorAll<HTMLAnchorElement>("a[href]"))
      .filter(anchor => normalizedAnchorHref(anchor) === sourceHref);
    if (matches.length === 1) {
      focusedTarget = matches[0];
    }
  }
  return focusedTarget;
}

function restoreHashTarget() {
  if (!window.location.hash) return;
  let targetId = window.location.hash.slice(1);
  try {
    targetId = decodeURIComponent(targetId);
  } catch {
    // RouteScrollManager uses the same safe fallback for clipped share links.
  }
  const target = document.getElementById(targetId);
  if (!target) return;
  target.scrollIntoView({ block: "start", behavior: "auto" });
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  ) {
    target.focus({ preventScroll: true });
  }
}

function releaseSnapshot() {
  if (!state?.snapshot) return;
  if (state.activePointers.size || state.activeKeys.size || state.releaseTimer !== null) {
    state.releaseRequested = true;
    return;
  }
  state.releaseRequested = false;
  // The prerendered document remains useful while the selected React leaf is
  // loading. If someone starts a form in that short window, move only the
  // controls they actually changed into the mounted form before removing it.
  // This stays in memory: no new persistence, tracking, or submission path.
  const { focusedControl, blurredControls } = handOffChangedControls();
  const focusedDisclosureTarget = handOffDisclosures();
  const pendingForm = state.pendingForm;
  const pendingAction = state.pendingAction;
  const pendingFeatureProofStep = state.pendingFeatureProofStep;
  state.pendingForm = null;
  state.pendingAction = null;
  state.pendingFeatureProofStep = null;
  state.snapshot.remove();
  state.snapshot = null;
  state.mount.hidden = false;
  state.observer?.disconnect();
  state.observer = null;
  document.removeEventListener("pointerup", captureSnapshotPointerEnd, true);
  document.removeEventListener("pointercancel", captureSnapshotPointerEnd, true);
  document.removeEventListener("keyup", captureSnapshotKeyUp, true);
  window.removeEventListener("blur", cancelSnapshotPresses);
  window.requestAnimationFrame(() => {
    // Input updates have now committed. Validate fields the owner already
    // left using their actual React blur handler, without moving focus or
    // manufacturing a submission during the static-to-interactive switch.
    for (const control of blurredControls) {
      if (control.isConnected && document.activeElement !== control) {
        control.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
      }
    }
    // An explicit queued form/action owns this turn. Preserve existing form,
    // menu, privacy, and proof replay semantics rather than restoring a link
    // that could momentarily take focus before that action runs.
    const focusedTarget = focusedControl || focusedDisclosureTarget;
    if (!window.location.hash && !pendingForm && !pendingAction && !pendingFeatureProofStep && focusedTarget) {
      focusedTarget.focus({ preventScroll: true });
    }
    restoreHashTarget();
    if (pendingForm) {
      // Replay only the user's explicit submit, once, through the actual
      // React handler. Merely typing or opening a page never submits a form.
      state?.mount.querySelector<HTMLButtonElement>(`${pendingForm} button[type="submit"]`)?.click();
    } else if (pendingAction) {
      const action = state?.mount.querySelector<HTMLButtonElement>(pendingAction);
      action?.focus({ preventScroll: true });
      action?.click();
    } else if (pendingFeatureProofStep) {
      const featureProofStep = Array.from(
        state?.mount.querySelectorAll<HTMLButtonElement>("[data-feature-proof-step]") ?? [],
      ).find((tab) =>
        tab.closest<HTMLElement>("[data-feature-proof]")?.dataset.featureProof === pendingFeatureProofStep.proof
        && tab.dataset.featureProofStep === pendingFeatureProofStep.step,
      );
      featureProofStep?.focus({ preventScroll: true });
      featureProofStep?.click();
    }
  });
}

function retainSnapshot(snapshot: HTMLElement) {
  if (!state) return;
  state.snapshot = snapshot;
  state.mount.hidden = true;
  state.observer?.disconnect();
  state.observer = new MutationObserver(() => {
    // A rejected route chunk resolves to the existing ErrorBoundary. Do not
    // leave an older page covering its recovery action.
    if (state?.mount.querySelector(".route-error")) releaseSnapshot();
  });
  state.observer.observe(state.mount, { childList: true, subtree: true });
}

/**
 * Keep the server-rendered public snapshot painted while the first lazy leaf
 * loads. This is deliberately createRoot, not hydration: the SEO snapshot is
 * an independent public document and cannot be safely reconciled by React.
 */
export function preparePublicRouteMount(root: HTMLElement): HTMLElement {
  const mount = document.createElement("div");
  mount.setAttribute(MOUNT_ATTRIBUTE, "");
  const hasSnapshot = root.hasChildNodes();
  const initialFocus = document.activeElement instanceof HTMLElement && root.contains(document.activeElement)
    ? document.activeElement
    : null;

  state = {
    root, mount, snapshot: null, observer: null, changedControls: new Map(),
    pendingForm: null, pendingAction: null, pendingFeatureProofStep: null,
    activePointers: new Set(), activeKeys: new Set(), releaseRequested: false, releaseTimer: null,
  };
  if (hasSnapshot) {
    const snapshot = document.createElement("div");
    snapshot.setAttribute(SNAPSHOT_ATTRIBUTE, "initial");
    while (root.firstChild) snapshot.appendChild(root.firstChild);
    root.appendChild(snapshot);
    retainSnapshot(snapshot);
    // Reparenting through a detached wrapper blurs even a native summary or
    // form field the visitor was already using. Restore the same live node
    // before recording defaults; the later handoff can then retain its focus.
    initialFocus?.focus({ preventScroll: true });
    // The entry script can arrive after someone has started filling the
    // no-JS form. Compare live values with markup defaults before adding the
    // listeners so that short, real-world race cannot discard their work.
    captureControlsChangedBeforeBootstrap(snapshot);
    snapshot.addEventListener("input", captureSnapshotControl);
    snapshot.addEventListener("change", captureSnapshotControl);
    snapshot.addEventListener("focusout", captureSnapshotBlur);
    snapshot.addEventListener("submit", captureSnapshotSubmit);
    // With no script, native required constraints remain in force. Once this
    // submit listener exists, route an explicit attempt (even an empty one)
    // to the real inline validation after the component is ready.
    const inquiry = snapshot.querySelector<HTMLFormElement>(".lf-audit__form");
    if (inquiry) inquiry.noValidate = true;
    snapshot.addEventListener("click", captureSnapshotAction);
    snapshot.addEventListener("pointerdown", captureSnapshotPointerDown);
    snapshot.addEventListener("keydown", captureSnapshotKeyDown);
    document.addEventListener("pointerup", captureSnapshotPointerEnd, true);
    document.addEventListener("pointercancel", captureSnapshotPointerEnd, true);
    document.addEventListener("keyup", captureSnapshotKeyUp, true);
    window.addEventListener("blur", cancelSnapshotPresses);
  }
  root.appendChild(mount);
  return mount;
}

/** Release the visible snapshot only after a real route leaf has committed. */
export function commitPublicRoute(): void {
  releaseSnapshot();
}
