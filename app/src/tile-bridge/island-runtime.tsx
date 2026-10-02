import { createRoot, type Root } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import type { ComponentType, MouseEvent } from "react";
import SiteNotices from "@/components/SiteNotices";
import "./tile-bridge.css";

type IslandKind = "tech-audit" | "contact" | "thanks" | "website-check";
type IslandModule = { default: ComponentType };

const pageImporters: Record<IslandKind, () => Promise<IslandModule>> = {
  "tech-audit": () => import("@/pages/TechAudit"),
  contact: () => import("@/pages/Contact"),
  thanks: () => import("@/pages/Thanks"),
  "website-check": () => import("@/pages/WebsiteCheck"),
};

const roots = new WeakMap<HTMLElement, Root>();
let noticesRoot: Root | undefined;
let noticesDialog: HTMLDialogElement | undefined;
let consentVisibilityListenerInstalled = false;

/**
 * Existing pages use react-router Link for their own application shell. Tile
 * pages are static documents, so same-origin links need a normal document
 * navigation instead of silently changing BrowserRouter state in this island.
 */
function preserveDocumentNavigation(event: MouseEvent<HTMLElement>) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const target = event.target instanceof Element
    ? event.target.closest<HTMLAnchorElement>("a[href]")
    : null;
  if (!target || target.target || target.hasAttribute("download")) return;
  const href = target.getAttribute("href") ?? "";
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("sms:")) return;

  try {
    const destination = new URL(target.href, window.location.origin);
    if (destination.origin !== window.location.origin) return;
    if (destination.pathname === window.location.pathname && destination.search === window.location.search && destination.hash) return;
    event.preventDefault();
    window.location.assign(destination.href);
  } catch {
    // Let the browser handle an unusual but valid href.
  }
}

export async function mountProductionIsland(host: HTMLElement, kind: IslandKind) {
  if (roots.has(host)) return;
  const { default: Page } = await pageImporters[kind]();
  const root = createRoot(host);
  roots.set(host, root);
  root.render(
    <BrowserRouter>
      <div className={`production-island production-island--${kind}`} onClickCapture={preserveDocumentNavigation}>
        <Page />
      </div>
    </BrowserRouter>,
  );
}

export async function openConsentNotices() {
  if (!noticesDialog) {
    noticesDialog = document.createElement("dialog");
    noticesDialog.className = "production-island production-island--consent";
    noticesDialog.dataset.productionConsent = "mounted";
    document.body.append(noticesDialog);
    noticesRoot = createRoot(noticesDialog);
    if (!consentVisibilityListenerInstalled) {
      consentVisibilityListenerInstalled = true;
      window.addEventListener("lf:consent-visibility", (event) => {
        const visible = (event as CustomEvent<{ visible?: unknown }>).detail?.visible;
        if (visible === false && noticesDialog?.open) noticesDialog.close();
      });
    }
  }
  noticesRoot?.render(
    <BrowserRouter>
      <SiteNotices />
    </BrowserRouter>,
  );
  // Let a just-saved SiteNotices effect finish reporting its closed state
  // before reopening the native dialog. Otherwise that stale report can close
  // a dialog opened by a subsequent privacy-control click.
  await new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()));
  });
  if (!noticesDialog.open) noticesDialog.showModal();
}

/** Reassert the native modal after SiteNotices has processed an open event. */
export function ensureConsentDialog() {
  if (noticesDialog && !noticesDialog.open) noticesDialog.showModal();
}
