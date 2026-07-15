import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award,
  BookOpen,
  ClipboardCheck,
  CornerDownLeft,
  FileSearch,
  HelpCircle,
  Home,
  Layers,
  MapPin,
  MessageSquare,
  Newspaper,
  Search,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import navIndex from "@/data/nav-index.json";
import { CMDK_OPEN_EVENT, consumePendingPaletteOpen } from "@/lib/palette";
import "./CommandPalette.css";

type Item = { label: string; to: string; group: string; icon: LucideIcon };

// The destination list is generated at build (scripts/build-nav-index.mjs) so
// the palette no longer drags the whole site.ts data chunk onto every page.
// Icons are per-group (the palette never needed per-service icons).
const GROUP_ICON: Record<string, LucideIcon> = {
  Services: Layers,
  "Case studies": Award,
  Answers: HelpCircle,
  Glossary: BookOpen,
  Neighborhoods: MapPin,
};

function buildItems(): Item[] {
  const primary: Item[] = [
    { label: "Home", to: "/", group: "Go to", icon: Home },
    { label: "Services", to: "/services/", group: "Go to", icon: Layers },
    { label: "Examples", to: "/examples/", group: "Go to", icon: Award },
    { label: "Journal", to: "/journal/", group: "Go to", icon: Newspaper },
    { label: "Glossary", to: "/glossary/", group: "Go to", icon: BookOpen },
    { label: "About", to: "/about/", group: "Go to", icon: Users },
    { label: "Instant Website Scan", to: "/audit/", group: "Go to", icon: FileSearch },
    { label: "Contact", to: "/contact/", group: "Go to", icon: MessageSquare },
    { label: "Tech Audit", to: "/tech-audit/", group: "Go to", icon: ClipboardCheck },
  ];
  const derived: Item[] = (navIndex as { label: string; to: string; group: string }[]).map((n) => ({
    label: n.label,
    to: n.to,
    group: n.group,
    icon: GROUP_ICON[n.group] ?? Search,
  }));
  return [...primary, ...derived];
}

/**
 * CommandPalette — a keyboard quick-nav (Cmd/Ctrl-K, or "/" outside a field).
 * Invisible until invoked, so it never burdens non-technical visitors; a power
 * user can jump anywhere in a couple of keystrokes. Accessible dialog, Esc to
 * close, arrow keys to move, Enter to go. Reduced-motion safe (CSS).
 */
export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const items = useMemo(() => buildItems(), []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => `${i.label} ${i.group}`.toLowerCase().includes(q));
  }, [items, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  // Global open/close hotkeys.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      // Escape must close the dialog even when focus sits OUTSIDE it (the
      // input grabs focus on a short timer; a fast Esc — or focus falling to
      // body after a backdrop interaction — otherwise leaves it stuck open).
      if (e.key === "Escape" && open) {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === "/" && !open) {
        const el = document.activeElement;
        const tag = el?.tagName;
        const editable =
          tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" ||
          (el as HTMLElement | null)?.isContentEditable;
        if (!editable) {
          e.preventDefault();
          setOpen(true);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Chrome-initiated open (the ⌘K chip in QuietNav dispatches CMDK_OPEN_EVENT).
  // The pending check covers Home, where the palette mounts deferred — a chip
  // click just before mount still opens it instead of being dropped.
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(CMDK_OPEN_EVENT, onOpen);
    // Deferred, not sync-in-effect: consume a click that landed pre-mount.
    const id = window.setTimeout(() => {
      if (consumePendingPaletteOpen()) onOpen();
    }, 0);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener(CMDK_OPEN_EVENT, onOpen);
    };
  }, []);

  // Focus the input when opening; restore focus to the invoker on close.
  useEffect(() => {
    if (open) {
      const previous = document.activeElement as HTMLElement | null;
      const id = window.setTimeout(() => inputRef.current?.focus(), 20);
      return () => {
        window.clearTimeout(id);
        if (previous?.isConnected) previous.focus();
      };
    }
    return undefined;
  }, [open]);

  function onListKey(e: React.KeyboardEvent) {
    if (e.key === "Tab") {
      // Focus trap — cycle Tab/Shift-Tab inside the dialog.
      const root = rootRef.current;
      if (!root) return;
      const focusables = Array.from(
        root.querySelectorAll<HTMLElement>(
          'button, input, a[href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute("disabled"));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const current = document.activeElement;
      if (e.shiftKey) {
        if (current === first || !root.contains(current)) {
          e.preventDefault();
          last.focus();
        }
      } else if (current === last || !root.contains(current)) {
        e.preventDefault();
        first.focus();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[active];
      if (item) {
        navigate(item.to);
        close();
      }
    }
  }

  // Keep the active row in view.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  if (!open) return null;

  return (
    <div
      ref={rootRef}
      className="lf-cmdk"
      role="dialog"
      aria-modal="true"
      aria-label="Quick navigation"
      onKeyDown={onListKey}
    >
      <button
        type="button"
        className="lf-cmdk__backdrop"
        aria-label="Close quick navigation"
        onClick={close}
      />
      <div className="lf-cmdk__panel" role="document">
        <div className="lf-cmdk__field">
          <Search size={18} strokeWidth={2} aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            className="lf-cmdk__input"
            placeholder="Jump to a page…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            aria-label="Search pages"
            role="combobox"
            aria-expanded="true"
            aria-controls="lf-cmdk-list"
            aria-autocomplete="list"
            aria-activedescendant={
              results.length > 0 ? `lf-cmdk-opt-${active}` : undefined
            }
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="lf-cmdk__kbd">Esc</kbd>
        </div>
        <ul id="lf-cmdk-list" ref={listRef} className="lf-cmdk__list" role="listbox">
          {results.length === 0 && (
            <li className="lf-cmdk__empty">No pages match "{query}".</li>
          )}
          {results.map((item, i) => {
            const Icon = item.icon;
            return (
              <li
                key={item.to}
                id={`lf-cmdk-opt-${i}`}
                role="option"
                aria-selected={i === active}
                data-idx={i}
              >
                <button
                  type="button"
                  className="lf-cmdk__item"
                  data-active={i === active}
                  onMouseMove={() => setActive(i)}
                  onClick={() => {
                    navigate(item.to);
                    close();
                  }}
                >
                  <span className="lf-cmdk__item-icon" aria-hidden="true">
                    <Icon size={16} strokeWidth={2} />
                  </span>
                  <span className="lf-cmdk__item-label">{item.label}</span>
                  <span className="lf-cmdk__item-group">{item.group}</span>
                  {i === active && (
                    <CornerDownLeft className="lf-cmdk__item-enter" size={14} strokeWidth={2} aria-hidden="true" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
