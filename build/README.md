# build/ — shared-partial injection

The site's **top navigation**, **site footer**, and **GA4 analytics snippet** used to be
copy-pasted, byte-for-byte, into every HTML page. Editing the nav meant hand-editing
~34 files. This folder makes those blocks come from **one canonical source**.

## The pieces

```
partials/
  nav.html          <- the canonical <nav> … </nav>           (edit here)
  footer.html       <- the canonical <footer role="contentinfo"> … </footer>
  analytics.html    <- the canonical GA4 <!-- GA4 --> … snippet
build/
  inject-partials.mjs   <- copies each partial into every page
  README.md             <- this file
```

Each page carries HTML-comment markers around the injected region:

```html
<!-- @include:nav start --> …nav… <!-- @include:nav end -->
<!-- @include:footer start --> …footer… <!-- @include:footer end -->
<!-- @include:analytics start --> …GA4… <!-- @include:analytics end -->
```

## How to use it

Edit a shared block **only** in `partials/`, then run:

```bash
npm run build:html        # inject / refresh every page
# or:  node build/inject-partials.mjs
```

Preview-only (writes nothing — good for CI):

```bash
npm run build:html:check  # reports what WOULD change
```

No dependencies. Node 16+.

## What it guarantees

- **Output-preserving.** A page's block is replaced only when it is already
  **byte-identical** to the partial (or already wrapped in markers). The injector
  just adds the marker comments — strip the markers back out and you get the
  original file, byte for byte. So injecting does not change rendered HTML.
- **Idempotent.** Running it twice makes no further changes.
- **Never force-converges drift.** If a page's block genuinely differs from the
  canonical one, the page is **skipped** and printed in the run report for a human
  to look at. The script will not silently rewrite a page whose output would change.

## Known intentional skips (as of this writing)

- **`index.html` — nav & footer.** The homepage is a JavaScript single-page app: its
  nav links call `navigateTo()` / `toggleDrawer()` and switch in-page `page-section`
  blocks instead of loading new URLs. Its nav/footer are therefore *functionally*
  different from the canonical static versions, so they are left alone. (Its GA4
  snippet *is* managed via markers.) Converging the homepage to the canonical nav is
  a separate, deliberate decision — do it by hand, after confirming the homepage's
  section routing still works.
- **`contact/index.html` — analytics.** Its GA4 snippet is identical in function but
  formatted with line breaks instead of inline. Not byte-identical, so it is skipped
  rather than rewritten. Normalize it by hand if you want it managed.

## Not in scope here

The shared `<head>` boilerplate is **not** templated. The per-page stylesheet sets
genuinely differ (`lifi-shared-page` vs `lifi-legal-page` vs article pages adding
`lifi-article.css`; the homepage uses a large inline `<style>`), so there is no
byte-identical head block to factor out without changing output. Per-page `<title>`,
meta description, canonical URL, and JSON-LD always stay in each page.
