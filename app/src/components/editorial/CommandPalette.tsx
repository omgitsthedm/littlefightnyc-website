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
import {
  answerGuides,
  areaPages,
  caseStudies,
  glossaryTerms,
  services,
} from "@/data/site";
import "./CommandPalette.css";

type Item = { label: string; to: string; group: string; icon: LucideIcon };

function buildItems(): Item[] {
  const primary: Item[] = [
    { label: "Home", to: "/", group: "Go to", icon: Home },
    { label: "Services", to: "/services/", group: "Go to", icon: Layers },
    { label: "Examples", to: "/examples/", group: "Go to", icon: Award },
    { label: "Journal", to: "/journal/", group: "Go to", icon: Newspaper },
    { label: "Glossary", to: "/glossary/", group: "Go to", icon: BookOpen },
    { label: "About", to: "/about/", group: "Go to", icon: Users },
    { label: "Website Audit", to: "/audit/", group: "Go to", icon: FileSearch },
    { label: "Contact", to: "/contact/", group: "Go to", icon: MessageSquare },
    { label: "Fit Check", to: "/fit-check/", group: "Go to", icon: ClipboardCheck },
  ];
  const svc: Item[] = services.map((s) => ({
    label: s.eyebrow,
    to: `/services/${s.slug}/`,
    group: "Services",
    icon: s.icon,
  }));
  const work: Item[] = caseStudies.map((c) => ({
    label: c.client,
    to: `/case-studies/${c.slug}/`,
    group: "Case studies",
    icon: Award,
  }));
  const ans: Item[] = answerGuides.map((a) => ({
    label: a.question,
    to: `/answers/${a.slug}/`,
    group: "Answers",
    icon: HelpCircle,
  }));
  const gl: Item[] = glossaryTerms.map((t) => ({
    label: t.term,
    to: `/glossary/${t.slug}/`,
    group: "Glossary",
    icon: BookOpen,
  }));
  const ar: Item[] = areaPages.map((a) => ({
    label: a.name,
    to: `/areas/${a.slug}/`,
    group: "Neighborhoods",
    icon: MapPin,
  }));
  return [...primary, ...svc, ...work, ...ans, ...gl, ...ar];
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
  }, [open]);

  // Focus the input when opening; reset active row on query change.
  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 20);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [open]);

  function onListKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
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
            aria-controls="lf-cmdk-list"
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
              <li key={item.to} role="option" aria-selected={i === active} data-idx={i}>
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
